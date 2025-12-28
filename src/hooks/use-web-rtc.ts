import { useRef, useState, useCallback } from 'react';

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

  // Core WebRTC functions
  initializeMicrophone: (constraints?: MediaStreamConstraints) => Promise<boolean>;
  createOffer: (targetSocketId: string, socket: any) => Promise<void>;
  handleOffer: (data: any, socket: any) => Promise<void>;
  handleAnswer: (data: any) => Promise<void>;
  handleIceCandidate: (data: any) => Promise<void>;
  toggleMicrophone: () => boolean;

  // Audio control functions
  setMicrophoneVolume: (level: number) => void; // 0-100
  setMicrophoneGain: (gain: number) => void; // 0-100
  setEchoCancellation: (enabled: boolean) => void;
  setNoiseSuppression: (enabled: boolean) => void;
  setAutoGainControl: (enabled: boolean) => void;
  muteMicrophone: () => void;
  unmuteMicrophone: () => void;
  onClickMicrophone: (value: boolean) => void;

  // Audio analysis
  getMicrophoneLevel: () => number; // 0-100

  // Cleanup
  cleanup: () => void;

  // Helper methods
  applyAudioSettings: (settings: Partial<AudioSettings>) => void;
  getAudioSettings: () => AudioSettings;
}

const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  volume: 80,
  microphoneGain: 70,
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  isMicMuted: false,
};

export default function useWebRTC(): UseWebRTCReturn {
  // Refs
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<{ [socketId: string]: RTCPeerConnection }>({});
  const pendingOffersRef = useRef<{ [socketId: string]: boolean }>({});
  const pendingAnswersRef = useRef<{ [socketId: string]: boolean }>({});
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

  const getIceServers = useCallback(
    () => ({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    }),
    []
  );

  const setupAudioProcessing = useCallback(
    (stream: MediaStream): MediaStream => {
      try {
        // Create audio context if not exists
        if (!audioNodesRef.current.audioContext) {
          audioNodesRef.current.audioContext = new (window.AudioContext ||
            (window as any).webkitAudioContext)();
        }

        const { audioContext } = audioNodesRef.current;

        // Resume audio context if it's suspended
        if (audioContext.state === 'suspended') {
          audioContext.resume();
        }

        // Create nodes
        const sourceNode = audioContext.createMediaStreamSource(stream);
        const microphoneGainNode = audioContext.createGain();
        const volumeGainNode = audioContext.createGain();
        const destinationNode = audioContext.createMediaStreamDestination();

        // Set initial gain values
        microphoneGainNode.gain.value = audioSettings.microphoneGain / 100;
        volumeGainNode.gain.value = audioSettings.volume / 100;

        // Connect nodes: source -> microphoneGain -> volumeGain -> destination
        sourceNode.connect(microphoneGainNode);
        microphoneGainNode.connect(volumeGainNode);
        volumeGainNode.connect(destinationNode);

        // Setup audio analyser for microphone level
        const analyser = audioContext.createAnalyser();
        volumeGainNode.connect(analyser);
        analyser.fftSize = 256;
        audioAnalyserRef.current = analyser;

        // Store references
        audioNodesRef.current = {
          ...audioNodesRef.current,
          sourceNode,
          microphoneGainNode,
          volumeGainNode,
          destinationNode,
        };

        return destinationNode.stream;
      } catch (error) {
        console.error('Error setting up audio processing:', error);
        return stream; // Fallback to original stream
      }
    },
    [audioSettings.microphoneGain, audioSettings.volume]
  );

  const updateAudioTrackConstraints = useCallback(
    (stream: MediaStream, settings: Partial<AudioSettings>) => {
      const audioTrack = stream.getAudioTracks()[0];
      if (!audioTrack) return;

      const constraints: MediaTrackConstraints = {};

      if (settings.echoCancellation !== undefined) {
        constraints.echoCancellation = settings.echoCancellation;
      }

      if (settings.noiseSuppression !== undefined) {
        constraints.noiseSuppression = settings.noiseSuppression;
      }

      if (settings.autoGainControl !== undefined) {
        constraints.autoGainControl = settings.autoGainControl;
      }

      if (Object.keys(constraints).length > 0) {
        audioTrack.applyConstraints(constraints).catch(console.error);
      }
    },
    []
  );

  const startMicrophoneLevelMonitoring = useCallback(() => {
    if (!audioAnalyserRef.current) return;

    const stopMonitoring = () => {
      if (audioAnimationRef.current) {
        cancelAnimationFrame(audioAnimationRef.current);
        audioAnimationRef.current = null;
      }
    };

    // Clean up previous monitoring
    stopMonitoring();

    const monitorMicrophoneLevel = () => {
      if (!audioAnalyserRef.current) {
        stopMonitoring();
        return;
      }

      const analyser = audioAnalyserRef.current;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);

      // Update audio settings with current level (optional)
      // Could be used for visual indicators

      audioAnimationRef.current = requestAnimationFrame(monitorMicrophoneLevel);
    };

    audioAnimationRef.current = requestAnimationFrame(monitorMicrophoneLevel);
  }, []);

  const initializeMicrophone = useCallback(
    async (customConstraints?: MediaStreamConstraints): Promise<boolean> => {
      try {
        if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
          throw new Error('Microphone not supported in this environment.');
        }

        const defaultConstraints: MediaStreamConstraints = {
          audio: {
            echoCancellation: audioSettings.echoCancellation,
            noiseSuppression: audioSettings.noiseSuppression,
            autoGainControl: audioSettings.autoGainControl,
          },
          video: false,
        };

        const constraints = customConstraints || defaultConstraints;
        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        // Setup audio processing
        const processedStream = setupAudioProcessing(stream);

        // Store original stream for reference
        localStreamRef.current = processedStream;
        setLocalStream(processedStream);

        // Set initial mute state
        const audioTrack = stream.getAudioTracks()[0];
        setIsMicMuted(!audioTrack.enabled);

        // Start microphone level monitoring
        startMicrophoneLevelMonitoring();

        return !audioTrack.enabled;
      } catch (error) {
        console.error('Error accessing microphone:', error);
        throw new Error('Microphone access denied. Please allow camera/microphone access.');
      }
    },
    [audioSettings, setupAudioProcessing, startMicrophoneLevelMonitoring]
  );

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

  // Audio control functions
  const setMicrophoneVolume = useCallback((level: number) => {
    const volume = Math.min(Math.max(level, 0), 100);

    if (audioNodesRef.current.volumeGainNode) {
      audioNodesRef.current.volumeGainNode.gain.value = volume / 100;
    }

    setAudioSettings((prev) => ({
      ...prev,
      volume,
    }));
  }, []);

  const setMicrophoneGain = useCallback((gain: number) => {
    const microphoneGain = Math.min(Math.max(gain, 0), 100);

    if (audioNodesRef.current.microphoneGainNode) {
      audioNodesRef.current.microphoneGainNode.gain.value = microphoneGain / 100;
    }

    setAudioSettings((prev) => ({
      ...prev,
      microphoneGain,
    }));
  }, []);

  const setEchoCancellation = useCallback(
    (enabled: boolean) => {
      if (localStreamRef.current) {
        updateAudioTrackConstraints(localStreamRef.current, { echoCancellation: enabled });
      }

      setAudioSettings((prev) => ({
        ...prev,
        echoCancellation: enabled,
      }));
    },
    [updateAudioTrackConstraints]
  );

  const setNoiseSuppression = useCallback(
    (enabled: boolean) => {
      if (localStreamRef.current) {
        updateAudioTrackConstraints(localStreamRef.current, { noiseSuppression: enabled });
      }

      setAudioSettings((prev) => ({
        ...prev,
        noiseSuppression: enabled,
      }));
    },
    [updateAudioTrackConstraints]
  );

  const setAutoGainControl = useCallback(
    (enabled: boolean) => {
      if (localStreamRef.current) {
        updateAudioTrackConstraints(localStreamRef.current, { autoGainControl: enabled });
      }

      setAudioSettings((prev) => ({
        ...prev,
        autoGainControl: enabled,
      }));
    },
    [updateAudioTrackConstraints]
  );

  const muteMicrophone = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = false;
      });
      setIsMicMuted(true);
      setAudioSettings((prev) => ({ ...prev, isMicMuted: true }));
    }
  }, []);

  const unmuteMicrophone = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = true;
      });
      setIsMicMuted(false);
      setAudioSettings((prev) => ({ ...prev, isMicMuted: false }));
    }
  }, []);

  const onClickMicrophone = useCallback((value: boolean) => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !value;
      });
      setIsMicMuted(value);
      setAudioSettings((prev) => ({ ...prev, isMicMuted: value }));
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
      setAudioSettings((prev) => ({ ...prev, isMicMuted: newMutedState }));
      return newMutedState;
    }
    return isMicMuted;
  }, [isMicMuted]);

  const getMicrophoneLevel = useCallback((): number => {
    if (!audioAnalyserRef.current) return 0;

    const analyser = audioAnalyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    // Calculate average level (0-100)
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    return Math.min(Math.max((average / 128) * 100, 0), 100);
  }, []);

  const applyAudioSettings = useCallback(
    (newSettings: Partial<AudioSettings>) => {
      setAudioSettings((prev) => {
        const updated = { ...prev, ...newSettings };

        // Apply each setting
        if (newSettings.volume !== undefined) {
          setMicrophoneVolume(newSettings.volume);
        }

        if (newSettings.microphoneGain !== undefined) {
          setMicrophoneGain(newSettings.microphoneGain);
        }

        if (newSettings.echoCancellation !== undefined) {
          setEchoCancellation(newSettings.echoCancellation);
        }

        if (newSettings.noiseSuppression !== undefined) {
          setNoiseSuppression(newSettings.noiseSuppression);
        }

        if (newSettings.autoGainControl !== undefined) {
          setAutoGainControl(newSettings.autoGainControl);
        }

        if (newSettings.isMicMuted !== undefined) {
          if (newSettings.isMicMuted) {
            muteMicrophone();
          } else {
            unmuteMicrophone();
          }
        }

        return updated;
      });
    },
    [
      setMicrophoneVolume,
      setMicrophoneGain,
      setEchoCancellation,
      setNoiseSuppression,
      setAutoGainControl,
      muteMicrophone,
      unmuteMicrophone,
    ]
  );

  const getAudioSettings = useCallback((): AudioSettings => audioSettings, [audioSettings]);

  // Rest of the WebRTC functions (createOffer, handleOffer, handleAnswer, handleIceCandidate)
  // remain the same as in your original code...

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
        }, 5000);
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
          console.warn('Queuing ICE candidate for later, no remote description yet for:', sender);
        }
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }, []);

  const cleanup = useCallback((): void => {
    console.log('Cleaning up WebRTC connections...');

    // Stop microphone level monitoring
    if (audioAnimationRef.current) {
      cancelAnimationFrame(audioAnimationRef.current);
      audioAnimationRef.current = null;
    }

    // Close all peer connections
    Object.entries(peerConnectionsRef.current).forEach(([, peerConnection]) => {
      peerConnection.close();
    });
    peerConnectionsRef.current = {};

    // Clear pending states
    pendingOffersRef.current = {};
    pendingAnswersRef.current = {};

    // Cleanup audio processing
    if (audioNodesRef.current.sourceNode) {
      audioNodesRef.current.sourceNode.disconnect();
    }
    if (audioNodesRef.current.audioContext) {
      audioNodesRef.current.audioContext.close();
    }
    audioNodesRef.current = {
      microphoneGainNode: null,
      volumeGainNode: null,
      audioContext: null,
      sourceNode: null,
      destinationNode: null,
    };

    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      localStreamRef.current = null;
      setLocalStream(null);
    }

    // Clear remote streams
    setRemoteStreams({});

    // Reset audio settings
    setAudioSettings(DEFAULT_AUDIO_SETTINGS);

    console.log('WebRTC cleanup completed');
  }, []);

  return {
    remoteStreams,
    localStream,
    isMicMuted,
    audioSettings,
    initializeMicrophone,
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    toggleMicrophone,
    setMicrophoneVolume,
    setMicrophoneGain,
    setEchoCancellation,
    setNoiseSuppression,
    setAutoGainControl,
    muteMicrophone,
    unmuteMicrophone,
    onClickMicrophone,
    getMicrophoneLevel,
    cleanup,
    applyAudioSettings,
    getAudioSettings,
  };
}
