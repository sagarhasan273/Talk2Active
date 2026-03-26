import { useRef, useState, useEffect, useCallback } from 'react';

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
  // ── Mapping: socketId ↔ userId (stable storage) ─────────────────────────
  const socketToUserIdRef = useRef<Record<string, string>>({});
  const userIdToSocketIdRef = useRef<Record<string, string>>({});
  const setParticipantMapping = useCallback((socketId: string, userId: string) => {
    socketToUserIdRef.current[socketId] = userId;
    userIdToSocketIdRef.current[userId] = socketId;
    console.log(`[WebRTC] Mapped socket ${socketId} → user ${userId}`);
  }, []);
  const removeParticipantMapping = useCallback((socketId: string) => {
    const userId = socketToUserIdRef.current[socketId];
    if (userId) delete userIdToSocketIdRef.current[userId];
    delete socketToUserIdRef.current[socketId];
    console.log(`[WebRTC] Removed mapping for socket ${socketId}`);
  }, []);
  const {
    remoteStreams,
    addRemoteStream: addRemoteStreamRemote,
    removeRemoteStream: removeRemoteStreamRemote,
    setRemoteVolume: setRemoteVolumeRemote,
    setRemoteMute: setRemoteMuteRemote,
    applyDeafen,
    cleanup: cleanupRemoteAudio,
  } = useRemoteAudio({
    audioContext: getAudioContext(),
    isDeafened: audioSettings.isDeafened,
    remoteAudioSettings,
    onRemoteSettingsChange: updateRemoteSettings, // now receives userId
  });
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({});
  const handleRemoteStreamAdded = useCallback(
    (socketId: string, stream: MediaStream) => {
      const userId = socketToUserIdRef.current[socketId] ?? socketId;
      console.log(`[WebRTC] Remote stream added → user ${userId} (socket ${socketId})`);
      addRemoteStreamRemote(userId, stream);
    },
    [addRemoteStreamRemote]
  );
  const handleRemoteStreamRemoved = useCallback(
    (socketId: string) => {
      const userId = socketToUserIdRef.current[socketId] ?? socketId;
      removeRemoteStreamRemote(userId);
      removeRemoteSettings(userId);
      setConnectionStatus((prev) => {
        const next = { ...prev };
        delete next[socketId];
        return next;
      });
    },
    [removeRemoteStreamRemote, removeRemoteSettings]
  );
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
    onRemoteStreamAdded: handleRemoteStreamAdded,
    onRemoteStreamRemoved: handleRemoteStreamRemoved,
    onConnectionStateChange: (socketId, state) => {
      setConnectionStatus((prev) => ({ ...prev, [socketId]: state }));
      if (state === 'failed') removeParticipant(socketId);
    },
  });
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
    socketToUserIdRef.current = {};
    userIdToSocketIdRef.current = {};
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
    ...screenShare,
    initializeMicrophone,
    toggleMicrophone,
    toggleDeafen,
    setMicrophoneGain,
    setOutputGain,
    setRemoteVolume: setRemoteVolumeRemote, // now takes userId
    setRemoteMute: setRemoteMuteRemote, // now takes userId
    setEchoCancellation,
    setNoiseSuppression,
    setNoiseSuppressionLevel,
    setHighPassFilter,
    applyAudioSettings,
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    // Mapping helpers
    setParticipantMapping,
    removeParticipantMapping,
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
