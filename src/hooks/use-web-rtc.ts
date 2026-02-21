import { useRef, useState, useCallback } from 'react';

import { CONFIG } from 'src/config-global';
import { useRoomTools } from 'src/core/slices';

// Types for audio settings
export interface AudioSettings {
  microphoneGain: number; // 0-100 (how sensitive your mic is)
  outputGain: number; // 0-100 (how loud your voice is sent to others)
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
  isMicMuted: boolean;
  isDeafened: boolean; // New: master speaker mute
}

export interface RemoteAudioSettings {
  [socketId: string]: {
    volume: number; // Individual remote stream volume (speaker volume per user)
    isMuted: boolean; // Mute specific remote user
  };
}

export interface AudioNodeManager {
  microphoneGainNode: GainNode | null; // Input gain (mic sensitivity)
  outputGainNode: GainNode | null; // Output gain (what others hear from you)
  audioContext: AudioContext | null;
  sourceNode: MediaStreamAudioSourceNode | null;
  destinationNode: MediaStreamAudioDestinationNode | null;
}

export interface RemoteAudioNodeManager {
  [socketId: string]: {
    sourceNode: MediaStreamAudioSourceNode | null;
    gainNode: GainNode | null; // This is the SPEAKER volume control per remote user
  };
}

export interface UseWebRTCReturn {
  remoteStreams: { [socketId: string]: MediaStream };
  localStream: MediaStream | null;
  isMicMuted: boolean;
  isDeafened: boolean;
  audioSettings: AudioSettings;
  remoteAudioSettings: RemoteAudioSettings;
  connectionStatus: { [socketId: string]: string };
  initializeMicrophone: (constraints?: MediaStreamConstraints) => Promise<boolean>;
  createOffer: (targetSocketId: string, socket: any) => Promise<void>;
  handleOffer: (data: any, socket: any) => Promise<void>;
  handleAnswer: (data: any) => Promise<void>;
  handleIceCandidate: (data: any) => Promise<void>;
  toggleMicrophone: () => boolean;
  toggleDeafen: () => void; // New: master speaker mute
  setMicrophoneGain: (gain: number) => void; // Input sensitivity
  setOutputGain: (gain: number) => void; // How loud you are to others
  setRemoteVolume: (socketId: string, level: number) => void; // Individual speaker volume
  setRemoteMute: (socketId: string, muted: boolean) => void; // Mute specific user
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
  microphoneGain: CONFIG.defaultMicGain, // Input sensitivity
  outputGain: CONFIG.defaultOutputGain || 100, // How loud you are to others
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  isMicMuted: false,
  isDeafened: false,
};

export default function useWebRTC(): UseWebRTCReturn {
  const { userVoiceState, removeParticipant, updateParticipant, updateUserVoiceState } =
    useRoomTools();

  // Refs
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<{ [socketId: string]: RTCPeerConnection }>({});
  const iceCandidatesQueue = useRef<{ [socketId: string]: RTCIceCandidateInit[] }>({});
  const pendingOffersRef = useRef<{ [socketId: string]: boolean }>({});

  // Audio nodes for local stream
  const audioNodesRef = useRef<AudioNodeManager>({
    microphoneGainNode: null, // Input gain (mic sensitivity)
    outputGainNode: null, // Output gain (what others hear)
    audioContext: null,
    sourceNode: null,
    destinationNode: null,
  });

  // Audio nodes for remote streams (what YOU hear)
  const remoteAudioNodesRef = useRef<RemoteAudioNodeManager>({});
  const audioAnalyserRef = useRef<AnalyserNode | null>(null);
  const audioAnimationRef = useRef<number | null>(null);

  // State
  const [remoteStreams, setRemoteStreams] = useState<{ [socketId: string]: MediaStream }>({});
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(DEFAULT_AUDIO_SETTINGS);
  const [remoteAudioSettings, setRemoteAudioSettings] = useState<RemoteAudioSettings>({});
  const [connectionStatus, setConnectionStatus] = useState<{ [socketId: string]: string }>({});

  const { isMicMuted, isDeafened } = userVoiceState;

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

  const setupRemoteAudioProcessing = useCallback(
    (socketId: string, stream: MediaStream): MediaStream => {
      try {
        // Use the same audio context as local stream
        if (!audioNodesRef.current.audioContext) {
          audioNodesRef.current.audioContext = new (
            window.AudioContext || (window as any).webkitAudioContext
          )();
        }

        const { audioContext } = audioNodesRef.current;
        if (audioContext.state === 'suspended') audioContext.resume();

        // Create source node for remote stream
        const sourceNode = audioContext.createMediaStreamSource(stream);

        // Create gain node for volume control (THIS IS YOUR SPEAKER VOLUME CONTROL)
        const gainNode = audioContext.createGain();

        // Set initial volume based on saved settings or default
        const initialVolume = remoteAudioSettings[socketId]?.volume ?? 100;

        // Apply deafen state if active
        const effectiveVolume = isDeafened ? 0 : initialVolume;
        gainNode.gain.value = effectiveVolume / 100;

        // Connect nodes: remote stream -> gain control -> your speakers
        sourceNode.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Store nodes for later control
        remoteAudioNodesRef.current[socketId] = {
          sourceNode,
          gainNode,
        };

        return stream;
      } catch (error) {
        console.error(`Remote Audio Setup Error for ${socketId}:`, error);
        return stream;
      }
    },
    [remoteAudioSettings, isDeafened]
  );

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

        // Microphone gain = input sensitivity (how sensitive your mic is)
        const microphoneGainNode = audioContext.createGain();

        // Output gain = how loud you are to others
        const outputGainNode = audioContext.createGain();

        const destinationNode = audioContext.createMediaStreamDestination();

        // Set initial values
        microphoneGainNode.gain.value = audioSettings.microphoneGain / 100;
        outputGainNode.gain.value = audioSettings.outputGain / 100;

        // Connect: mic -> input gain -> output gain -> destination (sent to others)
        sourceNode.connect(microphoneGainNode);
        microphoneGainNode.connect(outputGainNode);
        outputGainNode.connect(destinationNode);

        // Analyser for visualization (optional)
        const analyser = audioContext.createAnalyser();
        outputGainNode.connect(analyser);
        analyser.fftSize = 256;
        audioAnalyserRef.current = analyser;

        audioNodesRef.current = {
          ...audioNodesRef.current,
          sourceNode,
          microphoneGainNode, // Input sensitivity
          outputGainNode, // What others hear
          destinationNode,
        };

        return destinationNode.stream;
      } catch (error) {
        console.error('Audio Setup Error:', error);
        return stream;
      }
    },
    [audioSettings.microphoneGain, audioSettings.outputGain]
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
        const remoteStream = event.streams[0];

        // Set up audio processing for remote stream (speaker control)
        const processedStream = setupRemoteAudioProcessing(socketId, remoteStream);

        setRemoteStreams((prev) => ({ ...prev, [socketId]: processedStream }));

        // Initialize remote audio settings if not exists
        setRemoteAudioSettings((prev) => {
          if (!prev[socketId]) {
            return {
              ...prev,
              [socketId]: {
                volume: 100,
                isMuted: false,
              },
            };
          }
          return prev;
        });
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('webrtc-ice-candidate', { candidate: event.candidate, target: socketId });
        }
      };

      pc.onconnectionstatechange = () => {
        const state = pc.connectionState;
        setConnectionStatus((prev) => ({ ...prev, [socketId]: state }));

        if (state === 'failed' || state === 'closed') {
          // Clean up remote audio nodes
          if (remoteAudioNodesRef.current[socketId]) {
            const { sourceNode, gainNode } = remoteAudioNodesRef.current[socketId];
            if (sourceNode) sourceNode.disconnect();
            if (gainNode) gainNode.disconnect();
            delete remoteAudioNodesRef.current[socketId];
          }

          removeParticipant(socketId);

          // Clean up remote settings
          setRemoteAudioSettings((prev) => {
            const newSettings = { ...prev };
            delete newSettings[socketId];
            return newSettings;
          });
        }

        if (['connecting', 'connected', 'disconnected'].includes(state)) {
          updateParticipant({ socketId, connectionState: state });
        }
      };

      peerConnectionsRef.current[socketId] = pc;
      return pc;
    },
    [getIceServers, removeParticipant, updateParticipant, setupRemoteAudioProcessing]
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
        updateUserVoiceState({ isMicMuted: !audioTrack.enabled, isDeafened: false });
        return !audioTrack.enabled;
      } catch (error) {
        console.error('Microphone Access Error:', error);
        return false;
      }
    },
    [audioSettings, setupAudioProcessing, updateUserVoiceState]
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

  // Input sensitivity (how sensitive your mic is)
  const setMicrophoneGain = (gain: number) => {
    if (audioNodesRef.current.microphoneGainNode) {
      audioNodesRef.current.microphoneGainNode.gain.value = gain / 100;
    }
    setAudioSettings((p) => ({ ...p, microphoneGain: gain }));
  };

  // Output gain (how loud you are to others)
  const setOutputGain = (gain: number) => {
    if (audioNodesRef.current.outputGainNode) {
      audioNodesRef.current.outputGainNode.gain.value = gain / 100;
    }
    setAudioSettings((p) => ({ ...p, outputGain: gain }));
  };

  // Individual remote volume (speaker volume per user)
  const setRemoteVolume = (socketId: string, level: number) => {
    const remoteNode = remoteAudioNodesRef.current[socketId];
    if (remoteNode && remoteNode.gainNode) {
      // If not deafened, apply volume, otherwise keep at 0
      if (!isDeafened) {
        remoteNode.gainNode.gain.value = level / 100;
      }
    }

    setRemoteAudioSettings((prev) => ({
      ...prev,
      [socketId]: {
        ...prev[socketId],
        volume: level,
      },
    }));
  };

  // Mute specific remote user
  const setRemoteMute = (socketId: string, muted: boolean) => {
    const remoteNode = remoteAudioNodesRef.current[socketId];
    if (remoteNode && remoteNode.gainNode) {
      // If muted or deafened, set to 0, otherwise use saved volume
      if (muted || isDeafened) {
        remoteNode.gainNode.gain.value = 0;
      } else {
        remoteNode.gainNode.gain.value = (remoteAudioSettings[socketId]?.volume ?? 100) / 100;
      }
    }

    setRemoteAudioSettings((prev) => ({
      ...prev,
      [socketId]: {
        ...prev[socketId],
        isMuted: muted,
      },
    }));
  };

  // Toggle microphone
  const toggleMicrophone = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      updateUserVoiceState({ isMicMuted: !audioTrack.enabled });
      setAudioSettings((p) => ({ ...p, isMicMuted: !audioTrack.enabled }));
      return !audioTrack.enabled;
    }
    return isMicMuted;
  };

  // Toggle deafen (master speaker mute) - like Discord's deafen feature
  const toggleDeafen = () => {
    const newDeafenedState = !isDeafened;

    // Apply to all remote audio nodes
    Object.entries(remoteAudioNodesRef.current).forEach(([socketId, nodes]) => {
      if (nodes.gainNode) {
        if (newDeafenedState) {
          // If deafening, mute all remote audio
          nodes.gainNode.gain.value = 0;
        } else {
          // If undeafening, restore individual volumes (respecting per-user mute)
          const settings = remoteAudioSettings[socketId];
          if (settings && !settings.isMuted) {
            nodes.gainNode.gain.value = settings.volume / 100;
          } else if (settings && settings.isMuted) {
            nodes.gainNode.gain.value = 0;
          } else {
            nodes.gainNode.gain.value = 1; // Default to 100%
          }
        }
      }
    });

    updateUserVoiceState({ isDeafened: newDeafenedState });
    setAudioSettings((p) => ({ ...p, isDeafened: newDeafenedState }));
  };

  const cleanup = useCallback(() => {
    // Cancel animation frame if exists
    if (audioAnimationRef.current) {
      cancelAnimationFrame(audioAnimationRef.current);
      audioAnimationRef.current = null;
    }

    // Clean up remote audio nodes
    Object.entries(remoteAudioNodesRef.current).forEach(([socketId, nodes]) => {
      if (nodes.sourceNode) nodes.sourceNode.disconnect();
      if (nodes.gainNode) nodes.gainNode.disconnect();
    });
    remoteAudioNodesRef.current = {};

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

      if (audioContext.state !== 'closed') {
        try {
          if (audioNodesRef.current.sourceNode) {
            audioNodesRef.current.sourceNode.disconnect();
          }
          if (audioNodesRef.current.microphoneGainNode) {
            audioNodesRef.current.microphoneGainNode.disconnect();
          }
          if (audioNodesRef.current.outputGainNode) {
            audioNodesRef.current.outputGainNode.disconnect();
          }
          if (audioNodesRef.current.destinationNode) {
            audioNodesRef.current.destinationNode.disconnect();
          }

          audioContext.close().catch((error) => {
            console.warn('Error closing AudioContext:', error);
          });
        } catch (error) {
          console.warn('Error during AudioContext cleanup:', error);
        }
      }

      audioNodesRef.current = {
        microphoneGainNode: null,
        outputGainNode: null,
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
    setRemoteAudioSettings({});
    updateUserVoiceState({ isMicMuted: false, isDeafened: false });
    setAudioSettings(DEFAULT_AUDIO_SETTINGS);
    setConnectionStatus({});
  }, [updateUserVoiceState]);

  return {
    remoteStreams,
    localStream,
    isMicMuted,
    isDeafened,
    audioSettings,
    remoteAudioSettings,
    connectionStatus,
    initializeMicrophone,
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    toggleMicrophone,
    toggleDeafen,
    setMicrophoneGain, // Input sensitivity
    setOutputGain, // How loud you are to others
    setRemoteVolume, // Individual speaker volume
    setRemoteMute, // Mute specific user
    cleanup,
    setEchoCancellation: (e) => setAudioSettings((p) => ({ ...p, echoCancellation: e })),
    setNoiseSuppression: (e) => setAudioSettings((p) => ({ ...p, noiseSuppression: e })),
    setAutoGainControl: (e) => setAudioSettings((p) => ({ ...p, autoGainControl: e })),
    muteMicrophone: () => {
      if (localStreamRef.current) localStreamRef.current.getAudioTracks()[0].enabled = false;
      updateUserVoiceState({ isMicMuted: true });
    },
    unmuteMicrophone: () => {
      if (localStreamRef.current) localStreamRef.current.getAudioTracks()[0].enabled = true;
      updateUserVoiceState({ isMicMuted: false });
    },
    onClickMicrophone: (v) => {
      if (localStreamRef.current) localStreamRef.current.getAudioTracks()[0].enabled = !v;
      updateUserVoiceState({ isMicMuted: v });
    },
    applyAudioSettings: (s) => setAudioSettings((p) => ({ ...p, ...s })),
  };
}
