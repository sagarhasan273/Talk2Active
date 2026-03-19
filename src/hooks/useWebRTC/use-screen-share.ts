import { useRef, useState, useCallback } from 'react';

import type { PeerConnectionState } from './types';

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
  remoteScreenStreams: { [socketId: string]: MediaStream };
  isSharing: boolean;
  startSharing: (
    stream: MediaStream,
    socket: any,
    participantSocketIds: string[],
    roomId: string
  ) => Promise<void>;
  stopSharing: (socket: any, participantSocketIds: string[], roomId: string) => void;
  handleScreenShareOffer: (
    data: { offer: RTCSessionDescriptionInit | null; sender: string; isSharing?: boolean },
    socket: any
  ) => Promise<void>;
  handleScreenShareAnswer: (data: {
    answer: RTCSessionDescriptionInit;
    sender: string;
  }) => Promise<void>;
  handleScreenShareIce: (data: { candidate: RTCIceCandidateInit; sender: string }) => Promise<void>;
  handleScreenShareActive: (data: { sharerSocketId: string }, socket: any) => void;
  handleScreenShareRequestedBy: (data: { requesterSocketId: string }, socket: any) => Promise<void>;
  /**
   * Remove a single peer's connection — call when server emits `user-left`.
   *
   * Different from the other two:
   *   stopSharing()  — sharer signals ALL viewers to stop, then resets sharer state
   *   cleanup()      — nukes every PC (room leave / unmount)
   *   removePeer()   — targeted teardown for ONE departed peer, no socket emit needed
   *                    (they're already gone), works from both sharer and viewer side
   */
  removePeerShare: (socketId: string) => void;
  /** Close all PCs and reset all state. Call on room leave or unmount. */
  cleanup: () => void;
};

export function useScreenShare(): UseScreenShareWebRTCReturn {
  const [remoteScreenStreams, setRemoteScreenStreams] = useState<{
    [socketId: string]: MediaStream;
  }>({});
  const [isSharing, setIsSharing] = useState(false);

  const screenPCsRef = useRef<PeerConnectionState>({});
  const iceQueuesRef = useRef<{ [socketId: string]: RTCIceCandidateInit[] }>({});
  const localScreenStreamRef = useRef<MediaStream | null>(null);
  const socketRef = useRef<any>(null);
  const roomIdRef = useRef<string | null>(null);
  const participantsRef = useRef<string[]>([]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const removeRemoteStream = useCallback((socketId: string) => {
    setRemoteScreenStreams((prev) => {
      const next = { ...prev };
      delete next[socketId];
      return next;
    });
  }, []);

  const closePC = useCallback((socketId: string) => {
    const pc = screenPCsRef.current[socketId];
    if (!pc) return;
    pc.ontrack = null;
    pc.onicecandidate = null;
    pc.onconnectionstatechange = null;
    pc.oniceconnectionstatechange = null;
    if (pc.connectionState !== 'closed') pc.close();
    delete screenPCsRef.current[socketId];
    delete iceQueuesRef.current[socketId];
  }, []);

  const drainIceQueue = useCallback(async (socketId: string) => {
    const pc = screenPCsRef.current[socketId];
    const queue = iceQueuesRef.current[socketId];
    if (!pc?.remoteDescription || !queue?.length) return;
    const batch = queue.splice(0);
    await Promise.all(
      batch.map((c) =>
        pc
          .addIceCandidate(new RTCIceCandidate(c))
          .catch((e: any) => console.warn(`[screen-share][${socketId}] queued ICE error:`, e))
      )
    );
  }, []);

  const createScreenPC = useCallback(
    (socketId: string, socket: any, onTrack?: (stream: MediaStream) => void): RTCPeerConnection => {
      const pc = new RTCPeerConnection(ICE_SERVERS);
      screenPCsRef.current[socketId] = pc;

      pc.onicecandidate = ({ candidate }) => {
        if (candidate) socket.emit('webrtc-screen-share-ice', { candidate, target: socketId });
      };

      if (onTrack) {
        pc.ontrack = (event) => {
          const stream = event.streams?.[0] ?? new MediaStream([event.track]);
          onTrack(stream);
        };
      }

      pc.onconnectionstatechange = () => {
        const state = pc.connectionState;
        console.log(`[screen-share][${socketId}] connection: ${state}`);
        if (state === 'failed' || state === 'closed') {
          closePC(socketId);
          removeRemoteStream(socketId);
        }
      };

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'failed') {
          console.warn(`[screen-share][${socketId}] ICE failed`);
          closePC(socketId);
          removeRemoteStream(socketId);
        }
      };

      return pc;
    },
    [closePC, removeRemoteStream]
  );

  // ── Teardown (sharer → all viewers) ──────────────────────────────────────

  const teardown = useCallback(
    (socket: any | null, participantSocketIds: string[], roomId: string | null) => {
      participantSocketIds.forEach((socketId) => {
        if (socket) {
          socket.emit('webrtc-screen-share-offer', {
            target: socketId,
            isSharing: false,
            offer: null,
            roomId,
          });
        }
        closePC(socketId);
      });
      localScreenStreamRef.current = null;
      socketRef.current = null;
      roomIdRef.current = null;
      participantsRef.current = [];
      setIsSharing(false);
    },
    [closePC]
  );

  // ── Sharer side ───────────────────────────────────────────────────────────

  const stopSharing = useCallback(
    (socket: any, participantSocketIds: string[], roomId: string) => {
      teardown(socket, participantSocketIds, roomId);
    },
    [teardown]
  );

  const startSharing = useCallback(
    async (stream: MediaStream, socket: any, participantSocketIds: string[], roomId: string) => {
      const videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack) {
        console.error('[screen-share] No video track in stream');
        return;
      }

      localScreenStreamRef.current = stream;
      socketRef.current = socket;
      roomIdRef.current = roomId;
      participantsRef.current = [...participantSocketIds];
      setIsSharing(true);

      videoTrack.onended = () => {
        teardown(socketRef.current, participantsRef.current, roomIdRef.current);
      };

      await Promise.all(
        participantSocketIds.map(async (socketId) => {
          try {
            const pc = createScreenPC(socketId, socket);
            pc.addTrack(videoTrack, stream);
            stream.getAudioTracks().forEach((t) => pc.addTrack(t, stream));

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            socket.emit('webrtc-screen-share-offer', {
              offer,
              target: socketId,
              isSharing: true,
              roomId,
            });
          } catch (err) {
            console.error(`[screen-share] offer to ${socketId} failed:`, err);
            closePC(socketId);
          }
        })
      );
    },
    [createScreenPC, closePC, teardown]
  );

  const handleScreenShareRequestedBy = useCallback(
    async (data: { requesterSocketId: string }, socket: any) => {
      const stream = localScreenStreamRef.current;
      if (!stream) {
        console.warn('[screen-share] handleScreenShareRequestedBy: not sharing');
        return;
      }

      const videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack) return;

      const { requesterSocketId } = data;

      if (!participantsRef.current.includes(requesterSocketId)) {
        participantsRef.current = [...participantsRef.current, requesterSocketId];
      }

      try {
        const pc = createScreenPC(requesterSocketId, socket);
        pc.addTrack(videoTrack, stream);
        stream.getAudioTracks().forEach((t) => pc.addTrack(t, stream));

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit('webrtc-screen-share-offer', {
          offer,
          target: requesterSocketId,
          isSharing: true,
          roomId: roomIdRef.current,
        });
      } catch (err) {
        console.error(`[screen-share] late joiner offer to ${requesterSocketId} failed:`, err);
        closePC(requesterSocketId);
      }
    },
    [createScreenPC, closePC]
  );

  // ── Viewer side ───────────────────────────────────────────────────────────

  const handleScreenShareActive = useCallback((data: { sharerSocketId: string }, socket: any) => {
    console.log(`[screen-share] Active share from ${data.sharerSocketId} — requesting`);
    socket.emit('request-screen-share', { target: data.sharerSocketId });
  }, []);

  const handleScreenShareOffer = useCallback(
    async (
      data: { offer: RTCSessionDescriptionInit | null; sender: string; isSharing?: boolean },
      socket: any
    ) => {
      if (!data.offer) {
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

  // ── removePeer ────────────────────────────────────────────────────────────

  const removePeer = useCallback(
    (socketId: string) => {
      console.log(`[screen-share] removePeer: ${socketId}`);
      closePC(socketId);
      removeRemoteStream(socketId);

      participantsRef.current = participantsRef.current.filter((id) => id !== socketId);
    },
    [closePC, removeRemoteStream]
  );

  // ── Full cleanup ──────────────────────────────────────────────────────────

  const cleanup = useCallback(() => {
    Object.keys(screenPCsRef.current).forEach(closePC);
    iceQueuesRef.current = {};
    localScreenStreamRef.current = null;
    socketRef.current = null;
    roomIdRef.current = null;
    participantsRef.current = [];
    setRemoteScreenStreams({});
    setIsSharing(false);
  }, [closePC]);

  return {
    remoteScreenStreams,
    isSharing,
    startSharing,
    stopSharing,
    handleScreenShareOffer,
    handleScreenShareAnswer,
    handleScreenShareIce,
    handleScreenShareActive,
    handleScreenShareRequestedBy,
    removePeerShare: removePeer,
    cleanup,
  };
}
