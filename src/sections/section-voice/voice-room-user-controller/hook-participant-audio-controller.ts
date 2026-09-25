import { useMediaDeviceSelect, useRoomContext } from '@livekit/components-react';
import { Participant, Track } from 'livekit-client';
import { useCallback, useEffect, useState } from 'react';

// --------------------------------------------------------------------------
// 1. In-Memory Persistent Store (Survives Component Unmount / Drawer Close)
// --------------------------------------------------------------------------
const participantVolumeMap = new Map<string, number>();
// Remembers previous volume level prior to deafening
const participantPreviousVolumeMap = new Map<string, number>();
let persistentMicGain = 50;

type Listener = () => void;
const listeners = new Set<Listener>();

const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};

export const getStoredVolume = (userId: string): number => {
  return participantVolumeMap.get(userId) ?? 50;
};

export const setStoredVolume = (userId: string, volume: number): void => {
  participantVolumeMap.set(userId, volume);
  notifyListeners();
};

export const removeStoredParticipantAudio = (userId: string): void => {
  participantVolumeMap.delete(userId);
  participantPreviousVolumeMap.delete(userId);
  notifyListeners();
};

export const resetRoomAudioStore = (): void => {
  participantVolumeMap.clear();
  participantPreviousVolumeMap.clear();
  persistentMicGain = 50;
  notifyListeners();
};

export const getStoredMicGain = (): number => {
  return persistentMicGain;
};

export const setStoredMicGain = (gain: number): void => {
  persistentMicGain = Math.max(0, Math.min(100, gain));
  notifyListeners();
};

// Global Web Audio API Context & GainNode to prevent audio graph recreation
let globalAudioCtx: AudioContext | null = null;
let globalGainNode: GainNode | null = null;

// --------------------------------------------------------------------------
// 2. Custom LiveKit Audio Controller Hook
// --------------------------------------------------------------------------
interface UseParticipantAudioControllerProps {
  userId?: string;
  isSelf?: boolean;
  rawParticipant?: Participant;
  isViewerHost?: boolean;
  onVolumeChange?: (userId: string, volume: number) => void;
  onToggleMute?: (userId: string) => void;
  onToggleDeafen?: (userId: string) => void;
  onKickParticipant?: (userId: string) => void;
}

export const useParticipantAudioController = ({
  userId = '',
  isSelf = false,
  rawParticipant,
  isViewerHost = false,
  onVolumeChange,
  onToggleMute,
  onToggleDeafen,
  onKickParticipant,
}: UseParticipantAudioControllerProps) => {
  const room = useRoomContext();

  const [volume, setLocalVolume] = useState<number>(() => getStoredVolume(userId));
  const [micGain, setLocalMicGain] = useState<number>(() => getStoredMicGain());

  useEffect(() => {
    setLocalVolume(getStoredVolume(userId));
    setLocalMicGain(getStoredMicGain());

    const handleChange = () => {
      setLocalVolume(getStoredVolume(userId));
      setLocalMicGain(getStoredMicGain());
    };

    listeners.add(handleChange);
    return () => {
      listeners.delete(handleChange);
    };
  }, [userId]);

  // Derive mute status
  const micPub = rawParticipant?.getTrackPublication?.(Track.Source.Microphone);
  const isMuted = rawParticipant
    ? !rawParticipant.isMicrophoneEnabled || !micPub || micPub.isMuted
    : true;

  // LiveKit Device Selectors
  const {
    devices: microphones,
    activeDeviceId: activeMicId,
    setActiveMediaDevice: setActiveMicDevice,
  } = useMediaDeviceSelect({ kind: 'audioinput', requestPermissions: true });

  const {
    devices: speakers,
    activeDeviceId: activeSpeakerId,
    setActiveMediaDevice: setActiveSpeakerDevice,
  } = useMediaDeviceSelect({ kind: 'audiooutput' });

  // Apply track volume directly to HTML5 Audio elements
  const applyTrackVolume = useCallback(
    (targetUserId: string, volumeLevel: number) => {
      if (!room || !targetUserId) return;
      const participant = room.remoteParticipants.get(targetUserId);
      const audioPub = participant?.getTrackPublication(Track.Source.Microphone);

      if (audioPub?.track?.attachedElements) {
        audioPub.track.attachedElements.forEach((el: HTMLMediaElement) => {
          el.volume = Math.max(0, Math.min(1, volumeLevel));
        });
      }
    },
    [room]
  );

  // Sync volume to audio element when participant attaches/changes
  useEffect(() => {
    if (!isSelf && userId && room) {
      applyTrackVolume(userId, volume / 100);
    }
  }, [userId, isSelf, room, volume, applyTrackVolume]);

  // Handle remote participant volume change
  const handleVolumeChange = (_event: Event, newValue: number | number[]) => {
    const val = Array.isArray(newValue) ? newValue[0] : newValue;
    setStoredVolume(userId, val);

    // If user sets an explicit volume > 0, store as the previous non-zero volume
    if (val > 0) {
      participantPreviousVolumeMap.set(userId, val);
    }

    if (room && userId && !isSelf) {
      applyTrackVolume(userId, val / 100);
    }
    if (userId) {
      onVolumeChange?.(userId, val / 100);
    }
  };

  // Handle local microphone gain adjustment (Web Audio API)
  const handleMicGainChange = (_event: Event, newValue: number | number[]) => {
    const rawVal = Array.isArray(newValue) ? newValue[0] : newValue;
    const val = Math.max(0, Math.min(100, rawVal));
    setStoredMicGain(val);

    if (!room?.localParticipant) return;

    const pub = Array.from(room.localParticipant.audioTrackPublications.values())[0];
    const localTrack = pub?.track as any;

    if (!localTrack || !localTrack.sender) return;

    try {
      if (!globalAudioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        globalAudioCtx = new AudioContextClass();
      }

      if (globalAudioCtx.state === 'suspended') {
        globalAudioCtx.resume();
      }

      if (!localTrack.__isGainWrapped && localTrack.mediaStreamTrack) {
        const originalStream = new MediaStream([localTrack.mediaStreamTrack]);
        const source = globalAudioCtx.createMediaStreamSource(originalStream);

        globalGainNode = globalAudioCtx.createGain();
        const destination = globalAudioCtx.createMediaStreamDestination();

        source.connect(globalGainNode);
        globalGainNode.connect(destination);

        const processedTrack = destination.stream.getAudioTracks()[0];
        localTrack.sender.replaceTrack(processedTrack).catch(console.warn);
        localTrack.__isGainWrapped = true;
      }

      if (globalGainNode) {
        globalGainNode.gain.setTargetAtTime(val / 100, globalAudioCtx.currentTime, 0.1);
      }
    } catch (err) {
      console.error('Failed to intercept and apply local mic gain:', err);
    }
  };

  // Device switching
  const handleMicDeviceChange = async (deviceId: string) => {
    try {
      await setActiveMicDevice(deviceId);
      if (room && typeof room.switchActiveDevice === 'function') {
        await room.switchActiveDevice('audioinput', deviceId);
      }
    } catch (err) {
      console.error('Failed to change microphone device:', err);
    }
  };

  const handleSpeakerDeviceChange = async (deviceId: string) => {
    try {
      await setActiveSpeakerDevice(deviceId);
      if (room && typeof room.switchActiveDevice === 'function') {
        await room.switchActiveDevice('audiooutput', deviceId);
      }
    } catch (err) {
      console.error('Failed to change speaker device:', err);
    }
  };

  // Microphone toggle (Self or viewer moderation)
  const handleToggleMic = async () => {
    if (isSelf && room?.localParticipant) {
      const isEnabled = room.localParticipant.isMicrophoneEnabled;
      await room.localParticipant.setMicrophoneEnabled(!isEnabled, {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      });
    } else if (userId && isViewerHost && !isSelf) {
      handleHostMuteParticipant(!isMuted);
    } else if (userId) {
      onToggleMute?.(userId);
    }
  };

  // Deafen toggle with auto-mute and previous volume memory
  const handleToggleDeafen = async () => {
    if (!userId || isSelf || !room) return;

    const isCurrentlyDeafened = volume === 0;

    let targetVolume: number;

    if (isCurrentlyDeafened) {
      // Restoring volume: check previous saved volume, otherwise default to half (50%)
      const lastKnownVolume = participantPreviousVolumeMap.get(userId);
      targetVolume = lastKnownVolume !== undefined && lastKnownVolume > 0
        ? (lastKnownVolume === 100 ? 50 : lastKnownVolume)
        : 50;
    } else {
      // Deafening: save current volume before setting to 0
      participantPreviousVolumeMap.set(userId, volume);
      targetVolume = 0;
    }

    setStoredVolume(userId, targetVolume);
    applyTrackVolume(userId, targetVolume / 100);

    onToggleDeafen?.(userId);
  };

  // Host force mute
  const handleHostMuteParticipant = async (shouldMute: boolean) => {
    if (!userId || !room?.localParticipant) return;

    const payload = JSON.stringify({
      type: 'FORCE_MUTE_PARTICIPANT',
      targetIdentity: userId,
      mute: shouldMute,
    });

    await room.localParticipant.publishData(new TextEncoder().encode(payload), {
      reliable: true,
      topic: 'room_interactions',
    });
  };

  // Host kick participant
  const handleKickParticipant = async () => {
    if (!userId || !room?.localParticipant) return;

    const payload = JSON.stringify({
      type: 'FORCE_MUTE_PARTICIPANT',
      targetIdentity: userId,
      mute: true,
      kicked: true,
    });

    await room.localParticipant.publishData(new TextEncoder().encode(payload), {
      reliable: true,
      topic: 'room_interactions',
    });

    onKickParticipant?.(userId);
  };

  return {
    volume,
    micGain,
    isMuted,
    microphones,
    speakers,
    activeMicId,
    activeSpeakerId,
    handleVolumeChange,
    handleMicGainChange,
    handleMicDeviceChange,
    handleSpeakerDeviceChange,
    handleToggleMic,
    handleToggleDeafen,
    handleHostMuteParticipant,
    handleKickParticipant,
  };
};
