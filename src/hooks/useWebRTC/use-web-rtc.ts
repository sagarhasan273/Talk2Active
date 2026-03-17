import { useState, useEffect, useCallback } from 'react';

import { useRoomTools } from 'src/core/slices';

import { useLocalAudio } from './use-local-audio';
import { useRemoteAudio } from './use-remote-audio';
import { useScreenShare } from './use-screen-share';
import { useAudioSettings } from './use-audio-settings';
import { usePeerConnections } from './use-peer-connections';

import type { UseWebRTCReturn, ConnectionStatus } from './types';

export function useWebRTC(): UseWebRTCReturn {
  const { userVoiceState, removeParticipant } = useRoomTools();

  const { roomId } = userVoiceState;

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
    closePeerConnection,
  } = usePeerConnections({
    roomId,
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
      if (state === 'failed' || state === 'closed') {
        removeParticipant(socketId);
      }
    },
  });

  // Screen share — owns its own PC map, completely separate from audio PCs
  const { cleanup: cleanupShareScreen, ...screenShare } = useScreenShare();

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
    cleanupShareScreen();
  }, [cleanupPeerConnections, cleanupRemoteAudio, cleanupLocalAudio, cleanupShareScreen]);

  useEffect(
    () => () => {
      cleanupPeerConnections();
      cleanupRemoteAudio();
      cleanupShareScreen();
    },
    [cleanupPeerConnections, cleanupRemoteAudio, cleanupShareScreen]
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
    closePeerConnection,

    // Screen share — passed through so VoiceRoomBodyView and socket listeners can use it
    ...screenShare,

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
