import { useRef, useState, useCallback } from 'react';

export interface UseWebRTCReturn {
  remoteStreams: { [socketId: string]: MediaStream };
  localStream: MediaStream | null;
  isMicMuted: boolean;
  initializeMicrophone: () => Promise<void>;
  createOffer: (targetSocketId: string, socket: any) => Promise<void>;
  handleOffer: (data: any, socket: any) => Promise<void>;
  handleAnswer: (data: any) => Promise<void>;
  handleIceCandidate: (data: any) => Promise<void>;
  toggleMicrophone: () => boolean;
  cleanup: () => void;
}

export default function useWebRTC(): UseWebRTCReturn {
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<{ [socketId: string]: RTCPeerConnection }>({});
  const pendingOffersRef = useRef<{ [socketId: string]: boolean }>({});
  const pendingAnswersRef = useRef<{ [socketId: string]: boolean }>({});

  const [remoteStreams, setRemoteStreams] = useState<{ [socketId: string]: MediaStream }>({});
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);

  const getIceServers = useCallback(
    () => ({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    }),
    []
  );

  const initializeMicrophone = useCallback(async (): Promise<void> => {
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
        throw new Error('Microphone not supported in this environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      localStreamRef.current = stream;
      setLocalStream(stream); // Set state for the component
      // Set initial mute state based on track enablement (should default to true if we want manual join)
      // We will default to NOT muted upon successful acquisition
      const initialMuteState = !stream.getAudioTracks()[0].enabled;
      setIsMicMuted(initialMuteState);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw new Error('Microphone access denied. Please allow camera/microphone access.');
    }
  }, []);

  const createPeerConnection = useCallback(
    (socketId: string): RTCPeerConnection => {
      if (peerConnectionsRef.current[socketId]) {
        console.warn('Re-creating connection for:', socketId);
        peerConnectionsRef.current[socketId].close();
      }

      const peerConnection = new RTCPeerConnection(getIceServers());

      // Add local stream tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          // Check if track is already added before adding
          if (!peerConnection.getSenders().some((sender) => sender.track === track)) {
            peerConnection.addTrack(track, localStreamRef.current!);
          }
        });
      }

      // Handle incoming remote stream
      peerConnection.ontrack = (event) => {
        console.log('Received remote track from:', socketId);
        const [remoteStream] = event.streams;
        setRemoteStreams((prev) => ({
          ...prev,
          [socketId]: remoteStream,
        }));
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          const { socket } = window as any;
          if (socket) {
            socket.emit('webrtc-ice-candidate', {
              candidate: event.candidate,
              target: socketId,
            });
          }
        }
      };

      peerConnection.onconnectionstatechange = () => {
        const state = peerConnection.connectionState;
        console.log(`Connection state for ${socketId}:`, state);
      };

      peerConnectionsRef.current[socketId] = peerConnection;
      return peerConnection;
    },
    [getIceServers]
  );

  const createOffer = useCallback(
    async (targetSocketId: string, socket: any): Promise<void> => {
      try {
        if (pendingOffersRef.current[targetSocketId]) {
          return;
        }

        pendingOffersRef.current[targetSocketId] = true;
        const peerConnection = createPeerConnection(targetSocketId);

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        socket.emit('webrtc-offer', {
          offer,
          target: targetSocketId,
        });

        setTimeout(() => {
          pendingOffersRef.current[targetSocketId] = false;
        }, 5000); // Allow retry after 5s
      } catch (error) {
        console.error('Error creating offer:', error);
        pendingOffersRef.current[targetSocketId] = false;
      }
    },
    [createPeerConnection]
  );

  const handleOffer = useCallback(
    async (data: any, socket: any): Promise<void> => {
      try {
        const { offer, sender } = data;
        const peerConnection = createPeerConnection(sender);

        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        socket.emit('webrtc-answer', {
          answer,
          target: sender,
        });
      } catch (error) {
        console.error('Error handling offer:', error);
      }
    },
    [createPeerConnection]
  );

  const handleAnswer = useCallback(async (data: any): Promise<void> => {
    const { answer, sender } = data;
    try {
      const peerConnection = peerConnectionsRef.current[sender];

      if (!peerConnection) {
        console.error('No peer connection found for:', sender);
        return;
      }

      if (peerConnection.signalingState !== 'have-local-offer') {
        return;
      }

      if (pendingAnswersRef.current[sender]) {
        return;
      }

      pendingAnswersRef.current[sender] = true;

      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      console.log('Successfully set remote description from answer for:', sender);

      setTimeout(() => {
        pendingAnswersRef.current[sender] = false;
      }, 3000);
    } catch (error) {
      console.error('Error handling answer:', error);
      pendingAnswersRef.current[sender] = false;
    }
  }, []);

  const handleIceCandidate = useCallback(async (data: any): Promise<void> => {
    try {
      const { candidate, sender } = data;
      const peerConnection = peerConnectionsRef.current[sender];

      if (peerConnection && candidate) {
        if (peerConnection.remoteDescription) {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          // Handle race condition: Queue the candidate if remote description isn't ready
          console.warn('Queuing ICE candidate for later, no remote description yet for:', sender);
          // In a production environment, you would queue this candidate for later
        }
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }, []);

  const toggleMicrophone = useCallback((): boolean => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      const newMutedState = !audioTracks[0]?.enabled;
      setIsMicMuted(newMutedState);
      return newMutedState;
    }
    return isMicMuted;
  }, [isMicMuted]);

  const cleanup = useCallback((): void => {
    console.log('Cleaning up WebRTC connections...');

    // Close all peer connections
    Object.entries(peerConnectionsRef.current).forEach(([, peerConnection]) => {
      peerConnection.close();
    });
    peerConnectionsRef.current = {};

    // Clear pending states
    pendingOffersRef.current = {};
    pendingAnswersRef.current = {};

    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      localStreamRef.current = null;
      setLocalStream(null); // Clear state
    }

    // Clear remote streams
    setRemoteStreams({});

    console.log('WebRTC cleanup completed');
  }, []);

  return {
    remoteStreams,
    localStream,
    isMicMuted,
    initializeMicrophone,
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    toggleMicrophone,
    cleanup,
  };
}
