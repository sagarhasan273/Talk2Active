import { useRef, useState, useCallback } from 'react';

import type { PeerConnectionState } from './useWebRTC/types';

// ─────────────────────────────────────────────────────────────────────────────
// useScreenShareWebRTC
//
// Owns a SEPARATE RTCPeerConnection map from the audio PCs in usePeerConnections.
// Matches the backend's dedicated signaling events:
//   webrtc-screen-share-offer / webrtc-screen-share-answer / webrtc-screen-share-ice
// ─────────────────────────────────────────────────────────────────────────────

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
  ],
  iceCandidatePoolSize: 10,
};

export type UseScreenShareWebRTCReturn = {
  /** Remote screen streams keyed by sharer socketId — pass to <video srcObject> */
  remoteScreenStreams: { [socketId: string]: MediaStream };
  /** Sharer: call after getDisplayMedia resolves */
  startSharing: (stream: MediaStream, socket: any, participantSocketIds: string[]) => Promise<void>;
  /** Sharer: call to stop */
  stopSharing: (socket: any, participantSocketIds: string[]) => void;
  /** Wire to socket.on('webrtc-screen-share-offer') */
  handleScreenShareOffer: (
    data: { offer: RTCSessionDescriptionInit | null; sender: string; isSharing?: boolean },
    socket: any
  ) => Promise<void>;
  /** Wire to socket.on('webrtc-screen-share-answer') */
  handleScreenShareAnswer: (data: {
    answer: RTCSessionDescriptionInit;
    sender: string;
  }) => Promise<void>;
  /** Wire to socket.on('webrtc-screen-share-ice') */
  handleScreenShareIce: (data: { candidate: RTCIceCandidateInit; sender: string }) => Promise<void>;
};

export function useScreenShareWebRTC(): UseScreenShareWebRTCReturn {
  const [remoteScreenStreams, setRemoteScreenStreams] = useState<{
    [socketId: string]: MediaStream;
  }>({});

  const screenPCsRef = useRef<PeerConnectionState>({});
  const iceQueuesRef = useRef<{ [socketId: string]: RTCIceCandidateInit[] }>({});

  // ── Helpers ───────────────────────────────────────────────────────────────

  const closePC = useCallback((socketId: string) => {
    const pc = screenPCsRef.current[socketId];
    if (!pc) return;
    pc.ontrack = null;
    pc.onicecandidate = null;
    pc.onconnectionstatechange = null;
    pc.oniceconnectionstatechange = null;
    if (pc.connectionState !== 'closed') pc.close();
    delete screenPCsRef.current[socketId];
  }, []);

  const drainIceQueue = useCallback(async (socketId: string) => {
    const pc = screenPCsRef.current[socketId];
    const queue = iceQueuesRef.current[socketId];
    if (!pc?.remoteDescription || !queue?.length) return;
    const batch = [...queue];
    iceQueuesRef.current[socketId] = [];
    await Promise.all(
      batch.map((c) =>
        pc
          .addIceCandidate(new RTCIceCandidate(c))
          .catch((e: any) => console.warn(`[screen-share][${socketId}] queued ICE error:`, e))
      )
    );
  }, []);

  const removeRemoteStream = useCallback((socketId: string) => {
    setRemoteScreenStreams((prev) => {
      const next = { ...prev };
      delete next[socketId];
      return next;
    });
  }, []);

  /**
   * Creates a fresh RTCPeerConnection for screen share.
   * onTrack is only provided on the viewer side — sharer doesn't receive video back.
   */
  const createScreenPC = useCallback(
    (socketId: string, socket: any, onTrack?: (stream: MediaStream) => void): RTCPeerConnection => {
      closePC(socketId);

      const pc = new RTCPeerConnection(ICE_SERVERS);
      screenPCsRef.current[socketId] = pc;

      pc.onicecandidate = ({ candidate }) => {
        if (candidate) {
          socket.emit('webrtc-screen-share-ice', { candidate, target: socketId });
        }
      };

      if (onTrack) {
        pc.ontrack = (event) => {
          const stream = event.streams?.[0] ?? new MediaStream([event.track]);
          onTrack(stream);
        };
      }

      pc.onconnectionstatechange = () => {
        const state = pc.connectionState;
        console.log(`[screen-share][${socketId}] state: ${state}`);
        if (state === 'failed' || state === 'closed') {
          closePC(socketId);
          removeRemoteStream(socketId);
        }
      };

      pc.oniceconnectionstatechange = () => {
        const iceState = pc.iceConnectionState;
        if (iceState === 'failed') {
          console.warn(`[screen-share][${socketId}] ICE failed`);
          closePC(socketId);
          removeRemoteStream(socketId);
        }
      };

      return pc;
    },
    [closePC, removeRemoteStream]
  );

  // ── Sharer side ───────────────────────────────────────────────────────────

  const startSharing = useCallback(
    async (stream: MediaStream, socket: any, participantSocketIds: string[]) => {
      const videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack) {
        console.error('[screen-share] No video track in stream');
        return;
      }

      await Promise.all(
        participantSocketIds.map(async (socketId) => {
          try {
            const pc = createScreenPC(socketId, socket); // no onTrack — sharer doesn't receive

            pc.addTrack(videoTrack, stream);
            // Include system audio if captured
            stream.getAudioTracks().forEach((t) => pc.addTrack(t, stream));

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            socket.emit('webrtc-screen-share-offer', { offer, target: socketId, isSharing: true });
          } catch (err) {
            console.error(`[screen-share] offer to ${socketId} failed:`, err);
            closePC(socketId);
          }
        })
      );
    },
    [createScreenPC, closePC]
  );

  const stopSharing = useCallback(
    (socket: any, participantSocketIds: string[]) => {
      participantSocketIds.forEach((socketId) => {
        socket.emit('webrtc-screen-share-offer', {
          target: socketId,
          isSharing: false,
          offer: null,
        });
        closePC(socketId);
      });
    },
    [closePC]
  );

  // ── Viewer side ───────────────────────────────────────────────────────────

  const handleScreenShareOffer = useCallback(
    async (
      data: { offer: RTCSessionDescriptionInit | null; sender: string; isSharing?: boolean },
      socket: any
    ) => {
      // Sharer stopped — tear down viewer side
      if (data.isSharing === false || !data.offer) {
        closePC(data.sender);
        removeRemoteStream(data.sender);
        return;
      }

      try {
        const pc = createScreenPC(data.sender, socket, (stream) => {
          setRemoteScreenStreams((prev) => ({ ...prev, [data.sender]: stream }));
        });

        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        await drainIceQueue(data.sender);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit('webrtc-screen-share-answer', { answer, target: data.sender });
      } catch (err) {
        console.error(`[screen-share] handleOffer from ${data.sender} failed:`, err);
        closePC(data.sender);
      }
    },
    [createScreenPC, drainIceQueue, closePC, removeRemoteStream]
  );

  const handleScreenShareAnswer = useCallback(
    async (data: { answer: RTCSessionDescriptionInit; sender: string }) => {
      const pc = screenPCsRef.current[data.sender];
      if (!pc) {
        console.warn(`[screen-share] handleAnswer: no PC for ${data.sender}`);
        return;
      }
      if (pc.signalingState !== 'have-local-offer') {
        console.warn(
          `[screen-share] unexpected signalingState ${pc.signalingState} for ${data.sender}`
        );
        return;
      }
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        await drainIceQueue(data.sender);
      } catch (err) {
        console.error(`[screen-share] handleAnswer from ${data.sender} failed:`, err);
      }
    },
    [drainIceQueue]
  );

  const handleScreenShareIce = useCallback(
    async (data: { candidate: RTCIceCandidateInit; sender: string }) => {
      const pc = screenPCsRef.current[data.sender];
      if (!pc?.remoteDescription) {
        if (!iceQueuesRef.current[data.sender]) iceQueuesRef.current[data.sender] = [];
        iceQueuesRef.current[data.sender].push(data.candidate);
        return;
      }
      try {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (e) {
        console.warn(`[screen-share] addIceCandidate from ${data.sender}:`, e);
      }
    },
    []
  );

  return {
    remoteScreenStreams,
    startSharing,
    stopSharing,
    handleScreenShareOffer,
    handleScreenShareAnswer,
    handleScreenShareIce,
  };
}
