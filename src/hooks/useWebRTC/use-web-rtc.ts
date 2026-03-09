import { useState, useEffect, useCallback } from 'react';

import { useRoomTools } from 'src/core/slices';

import { useLocalAudio } from './use-local-audio';
import { useRemoteAudio } from './use-remote-audio';
import { useAudioSettings } from './use-audio-settings';
import { useScreenShareWebRTC } from '../use-screen-share';
import { usePeerConnections } from './use-peer-connections';

import type { UseWebRTCReturn, ConnectionStatus } from './types';

export function useWebRTC(): UseWebRTCReturn {
  const { removeParticipant } = useRoomTools();

  const {
    audioSettings,
    remoteAudioSettings,
    setEchoCancellation,
    setNoiseSuppression,
    setNoiseSuppressionLevel,
    setHighPassFilter,
    applyAudioSettings,
    updateRemoteSettings,
    removeRemoteSettings,
  } = useAudioSettings();

  const {
    localStream,
    localStreamRef,
    isMicMuted,
    ncMode,
    setNCMode,
    toggleNC,
    getAudioContext,
    initializeMicrophone,
    toggleMicrophone,
    muteMicrophone,
    unmuteMicrophone,
    setMicrophoneGain,
    setOutputGain,
    cleanup: cleanupLocalAudio,
  } = useLocalAudio({
    audioSettings,
    onMicMutedChange: (_muted) => {},
  });

  const {
    remoteStreams,
    addRemoteStream,
    removeRemoteStream,
    setRemoteVolume,
    setRemoteMute,
    applyDeafen,
    cleanup: cleanupRemoteAudio,
  } = useRemoteAudio({
    audioContext: getAudioContext(),
    isDeafened: audioSettings.isDeafened,
    remoteAudioSettings,
    onRemoteSettingsChange: updateRemoteSettings,
  });

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({});

  const {
    peerConnections,
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    cleanup: cleanupPeerConnections,
  } = usePeerConnections({
    localStreamRef,
    onRemoteStreamAdded: addRemoteStream,
    onRemoteStreamRemoved: (socketId) => {
      removeRemoteStream(socketId);
      removeRemoteSettings(socketId);
      setConnectionStatus((prev) => {
        const next = { ...prev };
        delete next[socketId];
        return next;
      });
    },
    onConnectionStateChange: (socketId, state) => {
      setConnectionStatus((prev) => ({ ...prev, [socketId]: state }));
      if (state === 'failed') removeParticipant(socketId);
    },
  });

  // Screen share — owns its own PC map, completely separate from audio PCs
  const screenShareWebRTC = useScreenShareWebRTC();

  const toggleDeafen = useCallback(() => {
    const next = !audioSettings.isDeafened;
    applyAudioSettings({ isDeafened: next });
    applyDeafen(next);
  }, [audioSettings.isDeafened, applyAudioSettings, applyDeafen]);

  const cleanup = useCallback(() => {
    cleanupPeerConnections();
    cleanupRemoteAudio();
    cleanupLocalAudio();
    setConnectionStatus({});
  }, [cleanupPeerConnections, cleanupRemoteAudio, cleanupLocalAudio]);

  useEffect(
    () => () => {
      cleanupPeerConnections();
      cleanupRemoteAudio();
    },
    [cleanupPeerConnections, cleanupRemoteAudio]
  );

  return {
    remoteStreams,
    localStream,

    isMicMuted,
    isDeafened: audioSettings.isDeafened,
    audioSettings,
    remoteAudioSettings,
    connectionStatus,

    peerConnections,

    // Screen share — passed through so VoiceRoomBodyView and socket listeners can use it
    screenShareWebRTC,

    ncMode,
    setNCMode,
    toggleNC,

    initializeMicrophone,
    toggleMicrophone,
    toggleDeafen,
    setMicrophoneGain,
    setOutputGain,

    setRemoteVolume,
    setRemoteMute,

    setEchoCancellation,
    setNoiseSuppression,
    setNoiseSuppressionLevel,
    setHighPassFilter,
    applyAudioSettings,

    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,

    cleanup,

    // Legacy
    muteMicrophone,
    unmuteMicrophone,
    onClickMicrophone: (shouldMute: boolean) => {
      if (shouldMute) muteMicrophone();
      else unmuteMicrophone();
    },
  };
}
