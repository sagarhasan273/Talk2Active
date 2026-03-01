// src/hooks/useWebRTC/useWebRTC.ts

import { useState, useEffect, useCallback } from 'react';

import { useRoomTools } from 'src/core/slices';

import { useLocalAudio } from './use-local-audio';
import { useRemoteAudio } from './use-remote-audio';
import { useAudioSettings } from './use-audio-settings';
import { usePeerConnections } from './use-peer-connections';

import type { UseWebRTCReturn, ConnectionStatus } from './types';

export function useWebRTC(): UseWebRTCReturn {
  const { removeParticipant } = useRoomTools();

  // Audio settings management
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

  // Local audio
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
    onMicMutedChange: (muted) => {
      // Update global state if needed
    },
  });

  // Remote audio
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

  // Connection status
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({});

  // Peer connections
  const {
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
        const newStatus = { ...prev };
        delete newStatus[socketId];
        return newStatus;
      });
    },
    onConnectionStateChange: (socketId, state) => {
      setConnectionStatus((prev) => ({ ...prev, [socketId]: state }));
      if (state === 'failed') {
        removeParticipant(socketId);
      }
    },
  });

  // Deafen toggle
  const toggleDeafen = useCallback(() => {
    const newDeafenedState = !audioSettings.isDeafened;
    applyAudioSettings({ isDeafened: newDeafenedState });
    applyDeafen(newDeafenedState);
  }, [audioSettings.isDeafened, applyAudioSettings, applyDeafen]);

  // MODIFIED: Selective cleanup - keeps audio context alive
  const cleanup = useCallback(() => {
    console.log('Running selective cleanup (keeping audio context)');
    cleanupPeerConnections();
    cleanupRemoteAudio();
    cleanupLocalAudio(); // This now only stops tracks, not audio context
    setConnectionStatus({});
  }, [cleanupPeerConnections, cleanupRemoteAudio, cleanupLocalAudio]);

  // COMPLETE cleanup only on unmount
  useEffect(
    () => () => {
      console.log('Component unmounting - complete cleanup');
      cleanupPeerConnections();
      cleanupRemoteAudio();
      // For unmount, we need a more aggressive cleanup
      // But the useLocalAudio already handles this with its own useEffect
    },
    [cleanupPeerConnections, cleanupRemoteAudio]
  );

  return {
    // Streams
    remoteStreams,
    localStream,

    // States
    isMicMuted,
    isDeafened: audioSettings.isDeafened,
    audioSettings,
    remoteAudioSettings,
    connectionStatus,

    // Local audio controls
    initializeMicrophone,
    toggleMicrophone,
    toggleDeafen,
    setMicrophoneGain,
    setOutputGain,

    // Remote audio controls
    setRemoteVolume,
    setRemoteMute,

    // Audio settings
    setEchoCancellation,
    setNoiseSuppression,
    setNoiseSuppressionLevel,
    setHighPassFilter,
    applyAudioSettings,

    // WebRTC signaling
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,

    // Cleanup
    cleanup,

    // Legacy methods
    muteMicrophone,
    unmuteMicrophone,
    onClickMicrophone: (v: boolean) => {
      if (v) muteMicrophone();
      else unmuteMicrophone();
    },
  };
}
