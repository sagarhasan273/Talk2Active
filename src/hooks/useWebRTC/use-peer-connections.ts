// src/hooks/useWebRTC/usePeerConnections.ts

import { useRef, useEffect, useCallback } from 'react';

import { useIceServersQuery } from 'src/core/apis/api-inventory';

import type { ConnectionStatus, PeerConnectionState } from './types';

interface UsePeerConnectionsProps {
  roomId: string | null;
  localStreamRef: React.MutableRefObject<MediaStream | null>;
  onRemoteStreamAdded: (socketId: string, stream: MediaStream) => void;
  onRemoteStreamRemoved: (socketId: string) => void;
  onConnectionStateChange?: (socketId: string, state: ConnectionStatus[string]) => void;
}

const FALLBACK_ICE_SERVERS = {
  iceServers: [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }],
  iceCandidatePoolSize: 10,
};

export function usePeerConnections({
  roomId,
  localStreamRef,
  onRemoteStreamAdded,
  onRemoteStreamRemoved,
  onConnectionStateChange,
}: UsePeerConnectionsProps) {
  const { data: iceServersData, isLoading, isError } = useIceServersQuery();

  const peerConnectionsRef = useRef<PeerConnectionState>({});
  const iceCandidatesQueue = useRef<{ [socketId: string]: RTCIceCandidateInit[] }>({});
  const pendingOffersRef = useRef<{ [socketId: string]: boolean }>({});
  const socketRefs = useRef<{ [socketId: string]: any }>({});
  const connectionTimeouts = useRef<{ [socketId: string]: NodeJS.Timeout }>({});
  // FIX: track mount state so deferred retries don't fire after unmount
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const getIceConfiguration = useCallback(() => {
    if (iceServersData?.iceServers?.[0]) {
      return {
        iceServers: iceServersData.iceServers,
        iceCandidatePoolSize: iceServersData.iceCandidatePoolSize || 10,
      };
    }
    return FALLBACK_ICE_SERVERS;
  }, [iceServersData]);

  const clearConnectionTimeout = useCallback((socketId: string) => {
    if (connectionTimeouts.current[socketId]) {
      clearTimeout(connectionTimeouts.current[socketId]);
      delete connectionTimeouts.current[socketId];
    }
  }, []);

  // FIX: guard stale socket + unmount before attempting restart
  const attemptIceRestart = useCallback(
    async (socketId: string) => {
      if (!isMountedRef.current) return;
      const pc = peerConnectionsRef.current[socketId];
      const socket = socketRefs.current[socketId];
      if (!pc || !socket || pc.connectionState === 'connected') return;

      console.warn(`[${socketId}] ICE restart`);
      try {
        const offer = await pc.createOffer({ iceRestart: true });
        await pc.setLocalDescription(offer);
        socket.emit('webrtc-offer', { offer, target: socketId, roomId });
      } catch (err) {
        console.error(`[${socketId}] ICE restart failed:`, err);
        onConnectionStateChange?.(socketId, 'failed');
        onRemoteStreamRemoved(socketId);
      }
    },
    [roomId, onConnectionStateChange, onRemoteStreamRemoved]
  );

  const processIceQueue = useCallback(async (socketId: string) => {
    const pc = peerConnectionsRef.current[socketId];
    const queue = iceCandidatesQueue.current[socketId];
    if (!pc?.remoteDescription || !queue?.length) return;

    const candidates = queue.splice(0); // drain in place
    await Promise.all(
      candidates.map((candidate) =>
        pc
          .addIceCandidate(new RTCIceCandidate(candidate))
          .catch((e) => console.warn(`[${socketId}] queued ICE error:`, e))
      )
    );
  }, []);

  // ── Core PC factory ───────────────────────────────────────────────────────

  const createPeerConnection = useCallback(
    (socketId: string, socket: any): RTCPeerConnection => {
      // Close stale PC if present
      const existing = peerConnectionsRef.current[socketId];
      if (existing) {
        existing.ontrack = null;
        existing.onicecandidate = null;
        existing.onconnectionstatechange = null;
        existing.oniceconnectionstatechange = null;
        if (existing.connectionState !== 'closed') existing.close();
        delete peerConnectionsRef.current[socketId];
        // FIX: also clear ICE queue for this peer on PC recreation
        delete iceCandidatesQueue.current[socketId];
      }

      clearConnectionTimeout(socketId);

      const iceConfig = getIceConfiguration();
      console.log(`[${socketId}] Creating PC with:`, iceConfig);

      const pc = new RTCPeerConnection(iceConfig);
      socketRefs.current[socketId] = socket;

      // Add local tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current!);
        });
      }

      // Remote track handler
      const receivedStreams: { [streamId: string]: boolean } = {};
      pc.ontrack = (event) => {
        const remoteStream = event.streams?.[0];
        if (!remoteStream) {
          onRemoteStreamAdded(socketId, new MediaStream([event.track]));
          return;
        }
        if (!receivedStreams[remoteStream.id]) {
          receivedStreams[remoteStream.id] = true;
          onRemoteStreamAdded(socketId, remoteStream);
        }
      };

      // ICE candidate
      pc.onicecandidate = ({ candidate }) => {
        if (candidate) {
          socket.emit('webrtc-ice-candidate', { candidate, target: socketId, roomId });
        }
      };

      // ICE connection state
      pc.oniceconnectionstatechange = () => {
        const iceState = pc.iceConnectionState;
        console.log(`[${socketId}] ICE: ${iceState}`);
        if (iceState === 'checking') {
          clearConnectionTimeout(socketId);
          connectionTimeouts.current[socketId] = setTimeout(() => {
            if (!isMountedRef.current) return;
            const current = peerConnectionsRef.current[socketId];
            if (
              current?.iceConnectionState === 'checking' ||
              current?.iceConnectionState === 'disconnected'
            ) {
              console.warn(`[${socketId}] Stuck in checking — ICE restart`);
              attemptIceRestart(socketId);
            }
          }, 12_000);
        }

        if (iceState === 'connected' || iceState === 'completed') {
          clearConnectionTimeout(socketId);
          onConnectionStateChange?.(socketId, 'connected');
        }

        if (iceState === 'disconnected') {
          clearConnectionTimeout(socketId);
          connectionTimeouts.current[socketId] = setTimeout(() => {
            if (!isMountedRef.current) return;
            if (peerConnectionsRef.current[socketId]?.iceConnectionState === 'disconnected') {
              console.warn(`[${socketId}] Still disconnected — ICE restart`);
              attemptIceRestart(socketId);
            }
          }, 5_000);
        }

        if (iceState === 'failed') {
          clearConnectionTimeout(socketId);
          attemptIceRestart(socketId);
        }

        if (iceState === 'closed') {
          clearConnectionTimeout(socketId);
          onRemoteStreamRemoved(socketId);
          onConnectionStateChange?.(socketId, 'closed');
        }
      };

      // Connection state
      pc.onconnectionstatechange = () => {
        const state = pc.connectionState;
        console.log(`[${socketId}] Connection: ${state}`);
        onConnectionStateChange?.(socketId, state);
        if (state === 'failed' || state === 'closed') {
          clearConnectionTimeout(socketId);
          if (state === 'failed') onRemoteStreamRemoved(socketId);
        }
      };

      peerConnectionsRef.current[socketId] = pc;
      return pc;
    },
    [
      roomId,
      localStreamRef,
      onRemoteStreamAdded,
      onRemoteStreamRemoved,
      onConnectionStateChange,
      clearConnectionTimeout,
      attemptIceRestart,
      getIceConfiguration,
    ]
  );

  // ── Signaling ─────────────────────────────────────────────────────────────

  // FIX: replaced unsafe recursive setTimeout retry with a waitForIce helper
  // that respects mount state and resolves once iceServersData is available.
  const waitForIce = useCallback(
    (socketId: string): Promise<void> =>
      new Promise((resolve, reject) => {
        if (!isLoading) {
          resolve();
          return;
        }
        const start = Date.now();
        const interval = setInterval(() => {
          if (!isMountedRef.current) {
            clearInterval(interval);
            reject(new Error('unmounted'));
            return;
          }
          if (!isLoading || Date.now() - start > 8_000) {
            clearInterval(interval);
            resolve(); // resolve even on timeout — fallback STUN will be used
          }
        }, 200);
      }),
    [isLoading]
  );

  const createOffer = useCallback(
    async (targetSocketId: string, socket: any) => {
      if (pendingOffersRef.current[targetSocketId]) {
        console.log(`[${targetSocketId}] Offer already pending`);
        return;
      }
      pendingOffersRef.current[targetSocketId] = true;

      try {
        await waitForIce(targetSocketId);
        if (!isMountedRef.current) return;

        const pc = createPeerConnection(targetSocketId, socket);
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: false,
        });
        await pc.setLocalDescription(offer);
        socket.emit('webrtc-offer', { offer, target: targetSocketId, roomId });
      } catch (err) {
        console.error(`[${targetSocketId}] createOffer error:`, err);
        const pc = peerConnectionsRef.current[targetSocketId];
        if (pc && pc.connectionState !== 'closed') pc.close();
        delete peerConnectionsRef.current[targetSocketId];
        delete iceCandidatesQueue.current[targetSocketId];
      } finally {
        setTimeout(() => {
          delete pendingOffersRef.current[targetSocketId];
        }, 500);
      }
    },
    [roomId, createPeerConnection, waitForIce]
  );

  const handleOffer = useCallback(
    async (data: any, socket: any) => {
      const { offer, sender } = data;
      try {
        await waitForIce(sender);
        if (!isMountedRef.current) return;

        const pc = createPeerConnection(sender, socket);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        await processIceQueue(sender);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('webrtc-answer', { answer, target: sender });
      } catch (err) {
        console.error(`[${sender}] handleOffer error:`, err);
      }
    },
    [createPeerConnection, processIceQueue, waitForIce]
  );

  const handleAnswer = useCallback(
    async (data: any) => {
      const { answer, sender } = data;
      const pc = peerConnectionsRef.current[sender];
      if (!pc) {
        console.warn(`[${sender}] handleAnswer: no PC`);
        return;
      }
      if (pc.signalingState !== 'have-local-offer') {
        console.warn(`[${sender}] handleAnswer: unexpected state ${pc.signalingState}`);
        return;
      }
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        await processIceQueue(sender);
      } catch (err) {
        console.error(`[${sender}] handleAnswer error:`, err);
      }
    },
    [processIceQueue]
  );

  const handleIceCandidate = useCallback(async (data: any) => {
    const { candidate, sender } = data;
    const pc = peerConnectionsRef.current[sender];

    if (!pc?.remoteDescription) {
      if (!iceCandidatesQueue.current[sender]) iceCandidatesQueue.current[sender] = [];
      iceCandidatesQueue.current[sender].push(candidate);
      return;
    }
    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (e) {
      console.warn(`[${sender}] addIceCandidate error:`, e);
    }
  }, []);

  // ── Full cleanup ──────────────────────────────────────────────────────────

  const cleanup = useCallback(() => {
    Object.keys(connectionTimeouts.current).forEach(clearConnectionTimeout);

    Object.entries(peerConnectionsRef.current).forEach(([, pc]) => {
      pc.ontrack = null;
      pc.onicecandidate = null;
      pc.onconnectionstatechange = null;
      pc.oniceconnectionstatechange = null;
      if (pc.connectionState !== 'closed') pc.close();
    });

    peerConnectionsRef.current = {};
    iceCandidatesQueue.current = {};
    pendingOffersRef.current = {};
    socketRefs.current = {};
  }, [clearConnectionTimeout]);

  useEffect(() => {
    if (iceServersData) {
      if (!iceServersData?.iceServers?.[0]?.username) {
        console.warn('⚠️ No TURN credentials — STUN only');
      }
    }
    if (isError) console.error('❌ ICE server fetch failed — using fallback STUN');
  }, [iceServersData, isError]);

  return {
    peerConnections: peerConnectionsRef,
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    cleanup,
    isIceServersLoading: isLoading,
  };
}
