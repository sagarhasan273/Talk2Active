// src/hooks/useWebRTC/usePeerConnections.ts

import { useRef, useEffect, useCallback } from 'react';

import { useIceServersQuery } from 'src/core/apis/api-inventory';

import type { ConnectionStatus, PeerConnectionState } from './types';

interface UsePeerConnectionsProps {
  localStreamRef: React.MutableRefObject<MediaStream | null>;
  onRemoteStreamAdded: (socketId: string, stream: MediaStream) => void;
  onRemoteStreamRemoved: (socketId: string) => void;
  onConnectionStateChange?: (socketId: string, state: ConnectionStatus[string]) => void;
}

// Fallback STUN servers in case Xirsys fails
const FALLBACK_ICE_SERVERS = {
  iceServers: [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }],
  iceCandidatePoolSize: 10,
};

export function usePeerConnections({
  localStreamRef,
  onRemoteStreamAdded,
  onRemoteStreamRemoved,
  onConnectionStateChange,
}: UsePeerConnectionsProps) {
  // Fetch ICE servers from your backend (which fetches from Xirsys)
  const { data: iceServersData, isLoading, isError } = useIceServersQuery();

  // Log the fetched ICE servers for debugging
  useEffect(() => {
    if (iceServersData) {
      console.log('✅ Fetched ICE servers from Xirsys:', iceServersData);

      // Check if credentials are included
      if (iceServersData?.iceServers?.[0]?.username) {
        console.log('✅ TURN credentials received');
      } else {
        console.warn('⚠️ No TURN credentials received, using STUN only');
      }
    }
    if (isError) {
      console.error('❌ Failed to fetch ICE servers, using fallback STUN');
    }
  }, [iceServersData, isError]);

  const peerConnectionsRef = useRef<PeerConnectionState>({});
  const iceCandidatesQueue = useRef<{ [socketId: string]: RTCIceCandidateInit[] }>({});
  const pendingOffersRef = useRef<{ [socketId: string]: boolean }>({});
  const socketRefs = useRef<{ [socketId: string]: any }>({});
  const connectionTimeouts = useRef<{ [socketId: string]: NodeJS.Timeout }>({});

  // Get the appropriate ICE servers configuration
  const getIceConfiguration = useCallback(() => {
    // If we have Xirsys data and it's valid, use it
    if (iceServersData?.iceServers?.[0]) {
      return {
        iceServers: iceServersData.iceServers,
        iceCandidatePoolSize: iceServersData.iceCandidatePoolSize || 10,
      };
    }
    // Otherwise use fallback STUN
    return FALLBACK_ICE_SERVERS;
  }, [iceServersData]);

  const clearConnectionTimeout = useCallback((socketId: string) => {
    if (connectionTimeouts.current[socketId]) {
      clearTimeout(connectionTimeouts.current[socketId]);
      delete connectionTimeouts.current[socketId];
    }
  }, []);

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

      // Get the latest ICE configuration
      const iceConfig = getIceConfiguration();
      console.log(`[${socketId}] Creating peer connection with:`, iceConfig);

      const pc = new RTCPeerConnection(iceConfig);
      socketRefs.current[socketId] = socket;

      // Add all local tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current!);
        });
      }

      // Handle track event
      const receivedStreams: { [streamId: string]: MediaStream } = {};
      pc.ontrack = (event) => {
        const remoteStream = event.streams?.[0];
        if (!remoteStream) {
          const fallbackStream = new MediaStream([event.track]);
          onRemoteStreamAdded(socketId, fallbackStream);
          return;
        }
        if (!receivedStreams[remoteStream.id]) {
          receivedStreams[remoteStream.id] = remoteStream;
          onRemoteStreamAdded(socketId, remoteStream);
        }
      };

      // ICE candidate handler
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('webrtc-ice-candidate', {
            candidate: event.candidate,
            target: socketId,
          });
        }
      };

      // ICE connection state handler
      pc.oniceconnectionstatechange = () => {
        const iceState = pc.iceConnectionState;
        console.log(`[${socketId}] ICE state: ${iceState}`);

        if (iceState === 'checking') {
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
      getIceConfiguration, // Added dependency
    ]
  );

  const createOffer = useCallback(
    async (targetSocketId: string, socket: any) => {
      // Check if ICE servers are still loading
      if (isLoading) {
        console.log(`[${targetSocketId}] Waiting for ICE servers to load...`);
        // Wait a bit and retry
        setTimeout(() => {
          if (!pendingOffersRef.current[targetSocketId]) {
            createOffer(targetSocketId, socket);
          }
        }, 1000);
        return;
      }

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
        setTimeout(() => {
          delete pendingOffersRef.current[targetSocketId];
        }, 500);
      }
    },
    [createPeerConnection, isLoading]
  );

  const handleOffer = useCallback(
    async (data: any, socket: any) => {
      const { offer, sender } = data;

      // Check if ICE servers are still loading
      if (isLoading) {
        console.log(`[${sender}] Waiting for ICE servers to load before handling offer...`);
        // Queue the offer to handle later
        setTimeout(() => {
          handleOffer(data, socket);
        }, 1000);
        return;
      }

      try {
        const pc = createPeerConnection(sender, socket);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        await processIceQueue(sender);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('webrtc-answer', { answer, target: sender });
      } catch (error) {
        console.error(`[${sender}] Handle offer error:`, error);
      }
    },
    [createPeerConnection, processIceQueue, isLoading]
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
        if (pc.signalingState !== 'have-local-offer') {
          console.warn(
            `[${sender}] Unexpected signalingState: ${pc.signalingState} — skipping answer`
          );
          return;
        }
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        await processIceQueue(sender);
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
      if (!iceCandidatesQueue.current[sender]) iceCandidatesQueue.current[sender] = [];
      iceCandidatesQueue.current[sender].push(candidate);
    }
  }, []);

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
