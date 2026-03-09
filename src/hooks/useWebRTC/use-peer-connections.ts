// src/hooks/useWebRTC/usePeerConnections.ts

import { useRef, useCallback } from 'react';

import type { ConnectionStatus, PeerConnectionState } from './types';

interface UsePeerConnectionsProps {
  localStreamRef: React.MutableRefObject<MediaStream | null>;
  onRemoteStreamAdded: (socketId: string, stream: MediaStream) => void;
  onRemoteStreamRemoved: (socketId: string) => void;
  onConnectionStateChange?: (socketId: string, state: ConnectionStatus[string]) => void;
}

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
  ],
  iceCandidatePoolSize: 10,
};

export function usePeerConnections({
  localStreamRef,
  onRemoteStreamAdded,
  onRemoteStreamRemoved,
  onConnectionStateChange,
}: UsePeerConnectionsProps) {
  const peerConnectionsRef = useRef<PeerConnectionState>({});
  const iceCandidatesQueue = useRef<{ [socketId: string]: RTCIceCandidateInit[] }>({});
  const pendingOffersRef = useRef<{ [socketId: string]: boolean }>({});
  // FIX: track socketRef per peer so ICE callbacks always have fresh socket
  const socketRefs = useRef<{ [socketId: string]: any }>({});
  // FIX: connection timeout handles to detect stuck "connecting" state
  const connectionTimeouts = useRef<{ [socketId: string]: NodeJS.Timeout }>({});

  const clearConnectionTimeout = useCallback((socketId: string) => {
    if (connectionTimeouts.current[socketId]) {
      clearTimeout(connectionTimeouts.current[socketId]);
      delete connectionTimeouts.current[socketId];
    }
  }, []);

  // FIX: ICE restart when stuck in "connecting"
  const attemptIceRestart = useCallback(
    async (socketId: string) => {
      const pc = peerConnectionsRef.current[socketId];
      const socket = socketRefs.current[socketId];
      if (!pc || !socket || pc.connectionState === 'connected') return;

      console.warn(`[${socketId}] ICE restart triggered`);
      try {
        const offer = await pc.createOffer({ iceRestart: true });
        await pc.setLocalDescription(offer);
        socket.emit('webrtc-offer', { offer, target: socketId });
      } catch (err) {
        console.error(`[${socketId}] ICE restart failed:`, err);
        // Give up and notify disconnected
        onConnectionStateChange?.(socketId, 'failed');
        onRemoteStreamRemoved(socketId);
      }
    },
    [onConnectionStateChange, onRemoteStreamRemoved]
  );

  const processIceQueue = useCallback(async (socketId: string) => {
    const pc = peerConnectionsRef.current[socketId];
    const queue = iceCandidatesQueue.current[socketId];
    if (!pc || !pc.remoteDescription || !queue?.length) return;

    const candidates = [...queue];
    iceCandidatesQueue.current[socketId] = [];

    await Promise.all(
      candidates.map((candidate) =>
        pc
          .addIceCandidate(new RTCIceCandidate(candidate))
          .catch((e) => console.warn(`[${socketId}] Queued ICE candidate error:`, e))
      )
    );
  }, []);

  const createPeerConnection = useCallback(
    (socketId: string, socket: any): RTCPeerConnection => {
      // Close previous if exists
      const existing = peerConnectionsRef.current[socketId];
      if (existing) {
        existing.ontrack = null;
        existing.onicecandidate = null;
        existing.onconnectionstatechange = null;
        existing.oniceconnectionstatechange = null;
        if (existing.connectionState !== 'closed') existing.close();
        delete peerConnectionsRef.current[socketId];
      }

      clearConnectionTimeout(socketId);

      const pc = new RTCPeerConnection(ICE_SERVERS);
      socketRefs.current[socketId] = socket;

      // Add all local tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current!);
        });
      }

      // FIX: Handle track event properly — collect all tracks into one stream
      const receivedStreams: { [streamId: string]: MediaStream } = {};
      pc.ontrack = (event) => {
        const remoteStream = event.streams?.[0];
        if (!remoteStream) {
          // Fallback: build stream manually from track
          const fallbackStream = new MediaStream([event.track]);
          onRemoteStreamAdded(socketId, fallbackStream);
          return;
        }
        // Deduplicate: only call onRemoteStreamAdded once per stream
        if (!receivedStreams[remoteStream.id]) {
          receivedStreams[remoteStream.id] = remoteStream;
          onRemoteStreamAdded(socketId, remoteStream);
        }
      };

      // ICE candidate — emit immediately, no batching needed
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('webrtc-ice-candidate', {
            candidate: event.candidate,
            target: socketId,
          });
        }
      };

      // FIX: Use iceConnectionState for more granular status (connectionState is less reliable)
      pc.oniceconnectionstatechange = () => {
        const iceState = pc.iceConnectionState;
        console.log(`[${socketId}] ICE state: ${iceState}`);

        if (iceState === 'checking') {
          // FIX: Start timeout — if still "checking" after 12s, trigger ICE restart
          clearConnectionTimeout(socketId);
          connectionTimeouts.current[socketId] = setTimeout(() => {
            if (
              peerConnectionsRef.current[socketId]?.iceConnectionState === 'checking' ||
              peerConnectionsRef.current[socketId]?.iceConnectionState === 'disconnected'
            ) {
              console.warn(`[${socketId}] Stuck in checking — attempting ICE restart`);
              attemptIceRestart(socketId);
            }
          }, 12_000);
        }

        if (iceState === 'connected' || iceState === 'completed') {
          clearConnectionTimeout(socketId);
          onConnectionStateChange?.(socketId, 'connected');
        }

        if (iceState === 'disconnected') {
          // Give it 5s to recover before restarting
          clearConnectionTimeout(socketId);
          connectionTimeouts.current[socketId] = setTimeout(() => {
            if (peerConnectionsRef.current[socketId]?.iceConnectionState === 'disconnected') {
              console.warn(`[${socketId}] ICE still disconnected — restarting`);
              attemptIceRestart(socketId);
            }
          }, 5_000);
        }

        if (iceState === 'failed') {
          clearConnectionTimeout(socketId);
          console.error(`[${socketId}] ICE failed — trying restart once`);
          attemptIceRestart(socketId);
        }

        if (iceState === 'closed') {
          clearConnectionTimeout(socketId);
          onRemoteStreamRemoved(socketId);
        }
      };

      pc.onconnectionstatechange = () => {
        const state = pc.connectionState;
        console.log(`[${socketId}] Connection state: ${state}`);
        onConnectionStateChange?.(socketId, state);

        if (state === 'failed') {
          clearConnectionTimeout(socketId);
          onRemoteStreamRemoved(socketId);
        }
        if (state === 'closed') {
          clearConnectionTimeout(socketId);
        }
      };

      peerConnectionsRef.current[socketId] = pc;
      return pc;
    },
    [
      localStreamRef,
      onRemoteStreamAdded,
      onRemoteStreamRemoved,
      onConnectionStateChange,
      clearConnectionTimeout,
      attemptIceRestart,
    ]
  );

  const createOffer = useCallback(
    async (targetSocketId: string, socket: any) => {
      if (pendingOffersRef.current[targetSocketId]) {
        console.log(`[${targetSocketId}] Offer already pending, skipping`);
        return;
      }
      pendingOffersRef.current[targetSocketId] = true;

      try {
        const pc = createPeerConnection(targetSocketId, socket);
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: false,
        });
        await pc.setLocalDescription(offer);
        socket.emit('webrtc-offer', { offer, target: targetSocketId });
      } catch (error) {
        console.error(`[${targetSocketId}] Create offer error:`, error);
        const pc = peerConnectionsRef.current[targetSocketId];
        if (pc && pc.connectionState !== 'closed') pc.close();
        delete peerConnectionsRef.current[targetSocketId];
      } finally {
        // FIX: shorter cooldown — original 1000ms caused re-join issues
        setTimeout(() => {
          delete pendingOffersRef.current[targetSocketId];
        }, 500);
      }
    },
    [createPeerConnection]
  );

  const handleOffer = useCallback(
    async (data: any, socket: any) => {
      const { offer, sender } = data;
      try {
        const pc = createPeerConnection(sender, socket);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        await processIceQueue(sender); // FIX: drain queue before answering
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('webrtc-answer', { answer, target: sender });
      } catch (error) {
        console.error(`[${sender}] Handle offer error:`, error);
      }
    },
    [createPeerConnection, processIceQueue]
  );

  const handleAnswer = useCallback(
    async (data: any) => {
      const { answer, sender } = data;
      const pc = peerConnectionsRef.current[sender];
      if (!pc) {
        console.warn(`[${sender}] handleAnswer: no peer connection found`);
        return;
      }

      try {
        // FIX: guard against calling setRemoteDescription on wrong state
        if (pc.signalingState !== 'have-local-offer') {
          console.warn(
            `[${sender}] Unexpected signalingState: ${pc.signalingState} — skipping answer`
          );
          return;
        }
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        await processIceQueue(sender); // FIX: drain queued candidates after remote desc set
      } catch (error) {
        console.error(`[${sender}] Handle answer error:`, error);
      }
    },
    [processIceQueue]
  );

  const handleIceCandidate = useCallback(async (data: any) => {
    const { candidate, sender } = data;
    const pc = peerConnectionsRef.current[sender];

    if (!pc) {
      // Queue even if pc not ready yet
      if (!iceCandidatesQueue.current[sender]) iceCandidatesQueue.current[sender] = [];
      iceCandidatesQueue.current[sender].push(candidate);
      return;
    }

    if (pc.remoteDescription) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.warn(`[${sender}] addIceCandidate error:`, e);
      }
    } else {
      // Queue until remote description is set
      if (!iceCandidatesQueue.current[sender]) iceCandidatesQueue.current[sender] = [];
      iceCandidatesQueue.current[sender].push(candidate);
    }
  }, []);

  const cleanup = useCallback(() => {
    // Clear all timeouts
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

  return {
    peerConnections: peerConnectionsRef,
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    cleanup,
  };
}
