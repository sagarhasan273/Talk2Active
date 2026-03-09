import type React from 'react';

import type { UseScreenShareWebRTCReturn } from './use-screen-share-webRTC';

export interface AudioSettings {
  microphoneGain: number;
  outputGain: number;
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
  echoCancellationType?: 'browser' | 'system' | 'disabled';
  noiseSuppressionLevel?: number;
  highPassFilter?: boolean;
  isMicMuted: boolean;
  isDeafened: boolean;
}

export interface RemoteAudioSettings {
  [socketId: string]: {
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
  [socketId: string]: {
    sourceNode: MediaStreamAudioSourceNode | null;
    gainNode: GainNode | null;
  };
}

export interface PeerConnectionState {
  [socketId: string]: RTCPeerConnection;
}

export interface ConnectionStatus {
  [socketId: string]: 'new' | 'connecting' | 'connected' | 'disconnected' | 'failed' | 'closed';
}

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  microphoneGain: 80,
  outputGain: 100,
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  echoCancellationType: 'browser',
  noiseSuppressionLevel: 70,
  highPassFilter: true,
  isMicMuted: false,
  isDeafened: false,
};

export type NCMode = 'off' | 'basic' | 'aggressive';

export type UseWebRTCReturn = {
  // ── Streams ───────────────────────────────────────────────────────────────
  remoteStreams: { [socketId: string]: MediaStream };
  localStream: MediaStream | null;

  // ── State ─────────────────────────────────────────────────────────────────
  isMicMuted: boolean;
  isDeafened: boolean;
  audioSettings: AudioSettings;
  remoteAudioSettings: RemoteAudioSettings;
  connectionStatus: ConnectionStatus;

  // Audio peer connections ref — plain object, NOT a Map
  peerConnections: React.MutableRefObject<PeerConnectionState>;

  // ── Screen share ──────────────────────────────────────────────────────────
  // The entire screen share hook is surfaced here so:
  //   - VoiceRoomBodyView can call startSharing / stopSharing and read remoteScreenStreams
  //   - useChatSocketListeners can wire the three socket handlers
  screenShareWebRTC: UseScreenShareWebRTCReturn;

  // ── Noise cancellation ────────────────────────────────────────────────────
  ncMode: NCMode;
  setNCMode: (mode: NCMode) => Promise<void>;
  toggleNC: () => void;

  // ── Local audio controls ──────────────────────────────────────────────────
  initializeMicrophone: (constraints?: MediaStreamConstraints) => Promise<boolean>;
  toggleMicrophone: () => boolean;
  toggleDeafen: () => void;
  setMicrophoneGain: (gain: number) => void;
  setOutputGain: (gain: number) => void;

  // ── Remote audio controls ─────────────────────────────────────────────────
  setRemoteVolume: (socketId: string, level: number) => void;
  setRemoteMute: (socketId: string, muted: boolean) => void;

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

  // ── Cleanup ───────────────────────────────────────────────────────────────
  cleanup: () => void;

  // ── Legacy ────────────────────────────────────────────────────────────────
  muteMicrophone: () => void;
  unmuteMicrophone: () => void;
  onClickMicrophone: (v: boolean) => void;
};
