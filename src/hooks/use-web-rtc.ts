import { useRef, useState, useCallback } from 'react';

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
  micLevel: number;
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
  volume: 80,
  microphoneGain: 70,
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
  const [micLevel, setMicLevel] = useState(0);
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
          audioNodesRef.current.audioContext = new (window.AudioContext ||
            (window as any).webkitAudioContext)();
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

  const startMicrophoneLevelMonitoring = useCallback(() => {
    if (!audioAnalyserRef.current) return;
    const monitor = () => {
      if (!audioAnalyserRef.current) return;
      const dataArray = new Uint8Array(audioAnalyserRef.current.frequencyBinCount);
      audioAnalyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      setMicLevel(Math.min(Math.max((average / 128) * 100, 0), 100));
      audioAnimationRef.current = requestAnimationFrame(monitor);
    };
    audioAnimationRef.current = requestAnimationFrame(monitor);
  }, []);

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
      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'failed') {
          pc.restartIce();
        }
      };

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
        startMicrophoneLevelMonitoring();
        const audioTrack = stream.getAudioTracks()[0];
        setIsMicMuted(!audioTrack.enabled);
        return !audioTrack.enabled;
      } catch (error) {
        console.error('Microphone Access Error:', error);
        return false;
      }
    },
    [audioSettings, setupAudioProcessing, startMicrophoneLevelMonitoring]
  );

  const createOffer = useCallback(
    async (targetSocketId: string, socket: any) => {
      if (pendingOffersRef.current[targetSocketId]) return;
      try {
        pendingOffersRef.current[targetSocketId] = true;
        const pc = createPeerConnection(targetSocketId, socket);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('webrtc-offer', { offer, target: targetSocketId });
      } catch (e) {
        console.error('Offer Error:', e);
      } finally {
        setTimeout(() => {
          pendingOffersRef.current[targetSocketId] = false;
        }, 2000);
      }
    },
    [createPeerConnection]
  );

  const handleOffer = useCallback(
    async (data: any, socket: any) => {
      try {
        const { offer, sender } = data;
        const pc = createPeerConnection(sender, socket);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('webrtc-answer', { answer, target: sender });
        processIceQueue(sender);
      } catch (e) {
        console.error('Handle Offer Error:', e);
      }
    },
    [createPeerConnection, processIceQueue]
  );

  const handleAnswer = useCallback(
    async (data: any) => {
      const { answer, sender } = data;
      const pc = peerConnectionsRef.current[sender];
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        processIceQueue(sender);
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
    if (audioAnimationRef.current) cancelAnimationFrame(audioAnimationRef.current);
    Object.values(peerConnectionsRef.current).forEach((pc) => pc.close());
    peerConnectionsRef.current = {};
    if (audioNodesRef.current.audioContext) audioNodesRef.current.audioContext.close();
    if (localStreamRef.current) localStreamRef.current.getTracks().forEach((t) => t.stop());
    setRemoteStreams({});
    setLocalStream(null);
  }, []);

  return {
    remoteStreams,
    localStream,
    isMicMuted,
    micLevel,
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
