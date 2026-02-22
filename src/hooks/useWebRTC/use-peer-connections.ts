// src/hooks/useWebRTC/usePeerConnections.ts

import { useRef, useCallback } from 'react';

import type { ConnectionStatus, PeerConnectionState } from './types';

interface UsePeerConnectionsProps {
  localStreamRef: React.MutableRefObject<MediaStream | null>;
  onRemoteStreamAdded: (socketId: string, stream: MediaStream) => void;
  onRemoteStreamRemoved: (socketId: string) => void;
  onConnectionStateChange?: (socketId: string, state: ConnectionStatus[string]) => void;
}

export function usePeerConnections({
  localStreamRef,
  onRemoteStreamAdded,
  onRemoteStreamRemoved,
  onConnectionStateChange,
}: UsePeerConnectionsProps) {
  const peerConnectionsRef = useRef<PeerConnectionState>({});
  const iceCandidatesQueue = useRef<{ [socketId: string]: RTCIceCandidateInit[] }>({});
  const pendingOffersRef = useRef<{ [socketId: string]: boolean }>({});

  const getIceServers = useCallback(
    () => ({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    }),
    []
  );

  const processIceQueue = useCallback(async (socketId: string) => {
    const pc = peerConnectionsRef.current[socketId];
    const queue = iceCandidatesQueue.current[socketId];
    if (pc && pc.remoteDescription && queue) {
      const candidates = queue.splice(0);
      const promises = candidates.map((candidate) =>
        pc.addIceCandidate(new RTCIceCandidate(candidate)).catch((e) => {
          console.error('Error adding queued ICE candidate', e);
        })
      );
      await Promise.all(promises);
    }
  }, []);

  const createPeerConnection = useCallback(
    (socketId: string, socket: any): RTCPeerConnection => {
      if (peerConnectionsRef.current[socketId]) {
        peerConnectionsRef.current[socketId].close();
      }

      const pc = new RTCPeerConnection(getIceServers());

      // Add local tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current!);
        });
      }

      // Handle remote tracks
      pc.ontrack = (event) => {
        console.log(`[PeerConnection] Received track from ${socketId}`, {
          kind: event.track.kind,
          streams: event.streams.length,
        });

        // Make sure we have a stream
        if (event.streams && event.streams[0]) {
          const remoteStream = event.streams[0];

          // Log stream info
          console.log(`[PeerConnection] Remote stream from ${socketId}:`, {
            id: remoteStream.id,
            active: remoteStream.active,
            tracks: remoteStream.getTracks().map((t) => t.kind),
          });

          // Add the stream
          onRemoteStreamAdded(socketId, remoteStream);
        } else {
          console.warn(`[PeerConnection] No stream in track event from ${socketId}`);
        }
      };

      // ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('webrtc-ice-candidate', {
            candidate: event.candidate,
            target: socketId,
          });
        }
      };

      // Connection state changes
      pc.onconnectionstatechange = () => {
        const state = pc.connectionState;
        onConnectionStateChange?.(socketId, state);

        if (state === 'failed' || state === 'closed') {
          onRemoteStreamRemoved(socketId);
        }
      };

      peerConnectionsRef.current[socketId] = pc;
      return pc;
    },
    [
      getIceServers,
      localStreamRef,
      onRemoteStreamAdded,
      onRemoteStreamRemoved,
      onConnectionStateChange,
    ]
  );

  // Signaling methods
  const createOffer = useCallback(
    async (targetSocketId: string, socket: any) => {
      if (pendingOffersRef.current[targetSocketId]) {
        console.log(`[${targetSocketId}] Offer already pending, skipping`);
        return;
      }

      pendingOffersRef.current[targetSocketId] = true;

      try {
        const pc = createPeerConnection(targetSocketId, socket);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('webrtc-offer', { offer, target: targetSocketId });
      } catch (error) {
        console.error(`[${targetSocketId}] Create offer error:`, error);
        if (peerConnectionsRef.current[targetSocketId]) {
          peerConnectionsRef.current[targetSocketId].close();
          delete peerConnectionsRef.current[targetSocketId];
        }
      } finally {
        setTimeout(() => {
          pendingOffersRef.current[targetSocketId] = false;
        }, 1000);
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
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('webrtc-answer', { answer, target: sender });
        await processIceQueue(sender);
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

      if (!pc) return;

      try {
        if (pc.signalingState === 'stable') {
          await processIceQueue(sender);
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

    if (pc && pc.remoteDescription) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } else {
      if (!iceCandidatesQueue.current[sender]) {
        iceCandidatesQueue.current[sender] = [];
      }
      iceCandidatesQueue.current[sender].push(candidate);
    }
  }, []);

  const cleanup = useCallback(() => {
    Object.values(peerConnectionsRef.current).forEach((pc) => {
      if (pc.connectionState !== 'closed') {
        pc.close();
      }
    });
    peerConnectionsRef.current = {};
    iceCandidatesQueue.current = {};
    pendingOffersRef.current = {};
  }, []);

  return {
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    cleanup,
  };
}
