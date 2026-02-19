import { useRef, useState, useCallback } from 'react';

import { CONFIG } from 'src/config-global';
import { useRoomTools } from 'src/core/slices';

// Types for audio settings
export interface AudioSettings {
  volume: number; // 0-100
  microphoneGain: number; // 0-100
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
  isMicMuted: boolean;
}

export interface AudioNodeManager {
  microphoneGainNode: GainNode | null;
  volumeGainNode: GainNode | null;
  audioContext: AudioContext | null;
  sourceNode: MediaStreamAudioSourceNode | null;
  destinationNode: MediaStreamAudioDestinationNode | null;
}

export interface UseWebRTCReturn {
  remoteStreams: { [socketId: string]: MediaStream };
  localStream: MediaStream | null;
  isMicMuted: boolean;
  audioSettings: AudioSettings;
  connectionStatus: { [socketId: string]: string };
  initializeMicrophone: (constraints?: MediaStreamConstraints) => Promise<boolean>;
  createOffer: (targetSocketId: string, socket: any) => Promise<void>;
  handleOffer: (data: any, socket: any) => Promise<void>;
  handleAnswer: (data: any) => Promise<void>;
  handleIceCandidate: (data: any) => Promise<void>;
  toggleMicrophone: () => boolean;
  setMicrophoneVolume: (level: number) => void;
  setMicrophoneGain: (gain: number) => void;
  setEchoCancellation: (enabled: boolean) => void;
  setNoiseSuppression: (enabled: boolean) => void;
  setAutoGainControl: (enabled: boolean) => void;
  muteMicrophone: () => void;
  unmuteMicrophone: () => void;
  onClickMicrophone: (value: boolean) => void;
  cleanup: () => void;
  applyAudioSettings: (settings: Partial<AudioSettings>) => void;
}

const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  volume: CONFIG.defaultMicVolume,
  microphoneGain: CONFIG.defaultMicGain,
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  isMicMuted: false,
};

export default function useWebRTC(): UseWebRTCReturn {
  const { removeRemoteParticipant } = useRoomTools();

  // Refs
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<{ [socketId: string]: RTCPeerConnection }>({});
  const iceCandidatesQueue = useRef<{ [socketId: string]: RTCIceCandidateInit[] }>({});
  const pendingOffersRef = useRef<{ [socketId: string]: boolean }>({});

  const audioNodesRef = useRef<AudioNodeManager>({
    microphoneGainNode: null,
    volumeGainNode: null,
    audioContext: null,
    sourceNode: null,
    destinationNode: null,
  });
  const audioAnalyserRef = useRef<AnalyserNode | null>(null);
  const audioAnimationRef = useRef<number | null>(null);

  // State
  const [remoteStreams, setRemoteStreams] = useState<{ [socketId: string]: MediaStream }>({});
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(DEFAULT_AUDIO_SETTINGS);
  const [connectionStatus, setConnectionStatus] = useState<{ [socketId: string]: string }>({});

  const getIceServers = useCallback(
    () => ({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    }),
    []
  );

  // Process queued ICE candidates once remote description is set
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

  const setupAudioProcessing = useCallback(
    (stream: MediaStream): MediaStream => {
      try {
        if (!audioNodesRef.current.audioContext) {
          audioNodesRef.current.audioContext = new (
            window.AudioContext || (window as any).webkitAudioContext
          )();
        }
        const { audioContext } = audioNodesRef.current;
        if (audioContext.state === 'suspended') audioContext.resume();

        const sourceNode = audioContext.createMediaStreamSource(stream);
        const microphoneGainNode = audioContext.createGain();
        const volumeGainNode = audioContext.createGain();
        const destinationNode = audioContext.createMediaStreamDestination();

        microphoneGainNode.gain.value = audioSettings.microphoneGain / 100;
        volumeGainNode.gain.value = audioSettings.volume / 100;

        sourceNode.connect(microphoneGainNode);
        microphoneGainNode.connect(volumeGainNode);
        volumeGainNode.connect(destinationNode);

        const analyser = audioContext.createAnalyser();
        volumeGainNode.connect(analyser);
        analyser.fftSize = 256;
        audioAnalyserRef.current = analyser;

        audioNodesRef.current = {
          ...audioNodesRef.current,
          sourceNode,
          microphoneGainNode,
          volumeGainNode,
          destinationNode,
        };
        return destinationNode.stream;
      } catch (error) {
        console.error('Audio Setup Error:', error);
        return stream;
      }
    },
    [audioSettings.microphoneGain, audioSettings.volume]
  );

  const createPeerConnection = useCallback(
    (socketId: string, socket: any): RTCPeerConnection => {
      if (peerConnectionsRef.current[socketId]) {
        peerConnectionsRef.current[socketId].close();
      }

      const pc = new RTCPeerConnection(getIceServers());

      if (localStreamRef.current) {
        localStreamRef.current
          .getTracks()
          .forEach((track) => pc.addTrack(track, localStreamRef.current!));
      }

      pc.ontrack = (event) => {
        setRemoteStreams((prev) => ({ ...prev, [socketId]: event.streams[0] }));
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('webrtc-ice-candidate', { candidate: event.candidate, target: socketId });
        }
      };

      pc.onconnectionstatechange = () => {
        const state = pc.connectionState;
        setConnectionStatus((prev) => ({ ...prev, [socketId]: state }));

        if (state === 'failed') {
          // Trigger ICE Restart or cleanup
          console.warn(`Connection to ${socketId} failed. Attempting cleanup.`);
          removeRemoteParticipant(socketId);
          pc.close();
          delete peerConnectionsRef.current[socketId];
        }

        if (state === 'disconnected') {
          console.log(`Lost connection to ${socketId}. Waiting for auto-recovery...`);
        }
      };

      // Negotiate automatic ICE restart if needed
      // pc.oniceconnectionstatechange = () => {
      //   if (pc.iceConnectionState === 'failed') {
      //     pc.restartIce();
      //   }
      // };

      peerConnectionsRef.current[socketId] = pc;
      return pc;
    },
    [getIceServers, removeRemoteParticipant]
  );

  const initializeMicrophone = useCallback(
    async (customConstraints?: MediaStreamConstraints): Promise<boolean> => {
      try {
        const constraints = customConstraints || {
          audio: {
            echoCancellation: audioSettings.echoCancellation,
            noiseSuppression: audioSettings.noiseSuppression,
            autoGainControl: audioSettings.autoGainControl,
          },
          video: false,
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        const processedStream = setupAudioProcessing(stream);
        localStreamRef.current = processedStream;
        setLocalStream(processedStream);
        const audioTrack = stream.getAudioTracks()[0];
        setIsMicMuted(!audioTrack.enabled);
        return !audioTrack.enabled;
      } catch (error) {
        console.error('Microphone Access Error:', error);
        return false;
      }
    },
    [audioSettings, setupAudioProcessing]
  );

  const createOffer = useCallback(
    async (targetSocketId: string, socket: any) => {
      // Prevent duplicate offers
      if (pendingOffersRef.current[targetSocketId]) {
        console.log(`[${targetSocketId}] Offer already pending, skipping`);
        return;
      }

      // Check if we already have an active connection with this peer
      const existingPc = peerConnectionsRef.current[targetSocketId];
      if (existingPc && existingPc.signalingState !== 'closed') {
        console.log(
          `[${targetSocketId}] Already have active connection in state: ${existingPc.signalingState}`
        );
        return;
      }

      pendingOffersRef.current[targetSocketId] = true;

      try {
        const pc = createPeerConnection(targetSocketId, socket);

        // Create and set local offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        console.log(`[${targetSocketId}] Created offer, signaling state: ${pc.signalingState}`);

        // Emit the offer
        socket.emit('webrtc-offer', { offer, target: targetSocketId });
      } catch (error) {
        console.error(`[${targetSocketId}] Create offer error:`, error);

        // Clean up on error
        if (peerConnectionsRef.current[targetSocketId]) {
          peerConnectionsRef.current[targetSocketId].close();
          delete peerConnectionsRef.current[targetSocketId];
        }

        throw error;
      } finally {
        // Clear pending flag with delay
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

      console.log(
        `[${sender}] Received offer, current signaling state: ${peerConnectionsRef.current[sender]?.signalingState}`
      );

      try {
        const pc = createPeerConnection(sender, socket);

        // Set remote description
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        console.log(`[${sender}] Remote offer set, signaling state: ${pc.signalingState}`);

        // Create and set local answer
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        console.log(`[${sender}] Created answer, signaling state: ${pc.signalingState}`);

        // Send answer back
        socket.emit('webrtc-answer', { answer, target: sender });

        // Process any queued ICE candidates
        await processIceQueue(sender);
      } catch (error: any) {
        console.error(`[${sender}] Handle offer error:`, error);

        // If error is because we're in wrong state, check if we should switch roles
        if (error.name === 'InvalidStateError' && error.message.includes('wrong state')) {
          console.warn(`[${sender}] State conflict, may be glare situation`);
        }
      }
    },
    [createPeerConnection, processIceQueue]
  );

  const handleAnswer = useCallback(
    async (data: any) => {
      const { answer, sender } = data;
      const pc = peerConnectionsRef.current[sender];

      if (!pc) {
        console.warn(`[${sender}] No peer connection found`);
        return;
      }

      // Check signaling state first
      const { signalingState } = pc;
      console.log(`[${sender}] handleAnswer called, signaling state: ${signalingState}`);

      // If we're already stable, ignore this answer (it's a duplicate)
      if (signalingState === 'stable') {
        console.log(`[${sender}] Already stable, ignoring duplicate answer`);
        // Still process any queued ICE candidates
        await processIceQueue(sender);
        return;
      }

      // Check if we're in the right state to accept an answer
      const validStatesForAnswer = ['have-local-offer', 'have-remote-pranswer'];
      if (!validStatesForAnswer.includes(signalingState)) {
        console.warn(`[${sender}] Cannot accept answer in state: ${signalingState}`);
        return;
      }

      try {
        // Validate answer
        if (!answer || answer.type !== 'answer') {
          console.error(`[${sender}] Invalid answer format`);
          return;
        }

        const answerDescription = new RTCSessionDescription(answer);
        await pc.setRemoteDescription(answerDescription);
        console.log(`[${sender}] Successfully set remote answer`);

        // Process any queued ICE candidates
        await processIceQueue(sender);
      } catch (error: any) {
        console.error(`[${sender}] Error in handleAnswer:`, error);

        // Don't throw the error - just log it
        // This prevents "Uncaught (in promise)" errors

        if (error.name === 'InvalidStateError') {
          console.warn(`[${sender}] Connection already established, ignoring duplicate answer`);
        } else if (error.message?.includes('already have a remote description')) {
          console.log(`[${sender}] Already have remote description`);
        }

        // Still try to process ICE candidates even if answer failed
        await processIceQueue(sender).catch((e) =>
          console.warn(`[${sender}] Error processing ICE queue:`, e)
        );
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
      if (!iceCandidatesQueue.current[sender]) iceCandidatesQueue.current[sender] = [];
      iceCandidatesQueue.current[sender].push(candidate);
    }
  }, []);

  // Audio Controls
  const setMicrophoneVolume = (level: number) => {
    if (audioNodesRef.current.volumeGainNode)
      audioNodesRef.current.volumeGainNode.gain.value = level / 100;
    setAudioSettings((p) => ({ ...p, volume: level }));
  };

  const setMicrophoneGain = (gain: number) => {
    if (audioNodesRef.current.microphoneGainNode)
      audioNodesRef.current.microphoneGainNode.gain.value = gain / 100;
    setAudioSettings((p) => ({ ...p, microphoneGain: gain }));
  };

  const toggleMicrophone = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicMuted(!audioTrack.enabled);
      setAudioSettings((p) => ({ ...p, isMicMuted: !audioTrack.enabled }));
      return !audioTrack.enabled;
    }
    return isMicMuted;
  };

  const cleanup = useCallback(() => {
    // Cancel animation frame if exists
    if (audioAnimationRef.current) {
      cancelAnimationFrame(audioAnimationRef.current);
      audioAnimationRef.current = null;
    }

    // Close all peer connections
    Object.values(peerConnectionsRef.current).forEach((pc) => {
      if (pc && pc.connectionState !== 'closed') {
        pc.close();
      }
    });
    peerConnectionsRef.current = {};

    // Clear ICE candidates queue
    Object.keys(iceCandidatesQueue.current).forEach((key) => {
      delete iceCandidatesQueue.current[key];
    });
    iceCandidatesQueue.current = {};

    // Clear pending offers
    Object.keys(pendingOffersRef.current).forEach((key) => {
      delete pendingOffersRef.current[key];
    });
    pendingOffersRef.current = {};

    // Close AudioContext safely
    if (audioNodesRef.current.audioContext) {
      const { audioContext } = audioNodesRef.current;

      // Check state before closing
      if (audioContext.state !== 'closed') {
        try {
          // Disconnect all nodes first
          if (audioNodesRef.current.sourceNode) {
            audioNodesRef.current.sourceNode.disconnect();
          }
          if (audioNodesRef.current.microphoneGainNode) {
            audioNodesRef.current.microphoneGainNode.disconnect();
          }
          if (audioNodesRef.current.volumeGainNode) {
            audioNodesRef.current.volumeGainNode.disconnect();
          }
          if (audioNodesRef.current.destinationNode) {
            audioNodesRef.current.destinationNode.disconnect();
          }

          // Close the context
          audioContext.close().catch((error) => {
            console.warn('Error closing AudioContext:', error);
          });
        } catch (error) {
          console.warn('Error during AudioContext cleanup:', error);
        }
      }

      // Reset audio nodes ref
      audioNodesRef.current = {
        microphoneGainNode: null,
        volumeGainNode: null,
        audioContext: null,
        sourceNode: null,
        destinationNode: null,
      };
    }

    // Stop all tracks in local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop();
        track.enabled = false;
      });
      localStreamRef.current = null;
    }

    // Reset state
    setRemoteStreams({});
    setLocalStream(null);
    setIsMicMuted(false);
    setAudioSettings(DEFAULT_AUDIO_SETTINGS);
    setConnectionStatus({});
  }, []);

  return {
    remoteStreams,
    localStream,
    isMicMuted,
    audioSettings,
    connectionStatus,
    initializeMicrophone,
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    toggleMicrophone,
    setMicrophoneVolume,
    setMicrophoneGain,
    cleanup,
    setEchoCancellation: (e) => setAudioSettings((p) => ({ ...p, echoCancellation: e })),
    setNoiseSuppression: (e) => setAudioSettings((p) => ({ ...p, noiseSuppression: e })),
    setAutoGainControl: (e) => setAudioSettings((p) => ({ ...p, autoGainControl: e })),
    muteMicrophone: () => {
      if (localStreamRef.current) localStreamRef.current.getAudioTracks()[0].enabled = false;
      setIsMicMuted(true);
    },
    unmuteMicrophone: () => {
      if (localStreamRef.current) localStreamRef.current.getAudioTracks()[0].enabled = true;
      setIsMicMuted(false);
    },
    onClickMicrophone: (v) => {
      if (localStreamRef.current) localStreamRef.current.getAudioTracks()[0].enabled = !v;
      setIsMicMuted(v);
    },
    applyAudioSettings: (s) => setAudioSettings((p) => ({ ...p, ...s })),
  };
}
