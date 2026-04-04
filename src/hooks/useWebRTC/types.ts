import type { UseScreenShareWebRTCReturn } from './use-screen-share';

export interface AudioSettings {
  microphoneGain: number;
  outputGain: number;
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
  noiseSuppressionLevel?: number;
  highPassFilter?: boolean;
  isMicMuted: boolean;
  isDeafened: boolean;
  nCMode: NCMode; // ← NEW: controls processing mode
}
export interface RemoteAudioSettings {
  [userId: string]: {
    // ← now keyed by stable userId
    volume: number;
    isMuted: boolean;
  };
}
export interface AudioNodeManager {
  microphoneGainNode: GainNode | null;
  outputGainNode: GainNode | null;
  audioContext: AudioContext | null;
  sourceNode: MediaStreamAudioSourceNode | null;
  destinationNode: MediaStreamAudioDestinationNode | null;
  highPassFilterNode: BiquadFilterNode | null;
  compressorNode: DynamicsCompressorNode | null;
}
export interface RemoteAudioNodeManager {
  [userId: string]: {
    // ← keyed by userId
    sourceNode: MediaStreamAudioSourceNode | null;
    gainNode: GainNode | null;
  };
}
export interface PeerConnectionState {
  [socketId: string]: RTCPeerConnection; // peerConnection still uses socketId
}
export interface ConnectionStatus {
  [socketId: string]: 'new' | 'connecting' | 'connected' | 'disconnected' | 'failed' | 'closed';
}
export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  microphoneGain: 50,
  outputGain: 50,
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  noiseSuppressionLevel: 100,
  highPassFilter: true,
  isMicMuted: false,
  isDeafened: false,
  nCMode: 'basic', // ← default = processed voice (best quality)
};
// NCMode: 'off' = raw mic (no WebAudio graph)
//         'basic' = HPF 80Hz + HPF 100Hz + light compressor
export type NCMode = 'off' | 'basic';
export type UseWebRTCReturn = {
  // ── Streams ───────────────────────────────────────────────────────────────
  remoteStreams: { [userId: string]: MediaStream }; // ← now userId
  localStream: MediaStream | null;
  // ── State ─────────────────────────────────────────────────────────────────
  isMicMuted: boolean;
  isDeafened: boolean;
  audioSettings: AudioSettings;
  remoteAudioSettings: RemoteAudioSettings;
  connectionStatus: ConnectionStatus;
  peerConnections: React.MutableRefObject<PeerConnectionState>;
  closePeerConnection: (socketId: string) => void;
  // ── Local audio controls ──────────────────────────────────────────────────
  initializeMicrophone: (
    isMicMute?: boolean,
    constraints?: MediaStreamConstraints
  ) => Promise<boolean>;
  toggleMicrophone: () => boolean;
  toggleDeafen: () => void;
  setMicrophoneGain: (gain: number) => void;
  setOutputGain: (gain: number) => void;
  // ── Remote audio controls (now use stable userId) ────────────────────────
  setRemoteVolume: (userId: string, level: number) => void;
  setRemoteMute: (userId: string, muted: boolean) => void;
  // ── Audio settings ────────────────────────────────────────────────────────
  setEchoCancellation: (enabled: boolean) => void;
  setNoiseSuppression: (enabled: boolean) => void;
  setNoiseSuppressionLevel: (level: number) => void;
  setHighPassFilter: (enabled: boolean) => void;
  applyAudioSettings: (settings: Partial<AudioSettings>) => void;
  // ── Audio WebRTC signaling ────────────────────────────────────────────────
  createOffer: (targetSocketId: string, socket: any) => Promise<void>;
  handleOffer: (data: any, socket: any) => Promise<void>;
  handleAnswer: (data: any) => Promise<void>;
  handleIceCandidate: (data: any) => Promise<void>;
  // ── Mapping (socketId ↔ userId) ──────────────────────────────────────────
  setParticipantMapping: (socketId: string, userId: string) => void;
  removeParticipantMapping: (socketId: string) => void;
  // ── Cleanup ───────────────────────────────────────────────────────────────
  cleanup: () => void;
  // ── Legacy ────────────────────────────────────────────────────────────────
  muteMicrophone: () => void;
  unmuteMicrophone: () => void;
  onClickMicrophone: (v: boolean) => void;
} & UseScreenShareWebRTCReturn;
