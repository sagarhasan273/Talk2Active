// src/sections/section-voice/voice-room-user-controller/hook-participant-audio-controller.ts

import useRoomSounds from '@/hooks/use-room-sounds';
import { useMediaDeviceSelect, useRoomContext } from '@livekit/components-react';
import { Participant, Track } from 'livekit-client';
import { useCallback, useEffect, useState } from 'react';

// --------------------------------------------------------------------------
// 1. In-Memory Persistent Store (survives component unmount / drawer close)
// --------------------------------------------------------------------------
const participantVolumeMap = new Map<string, number>();
const participantPreviousVolumeMap = new Map<string, number>();

const DEFAULT_MIC_GAIN = 25;
let persistentMicGain = DEFAULT_MIC_GAIN;


let lastProcessedTrackId: string | null = null;
let globalSourceNode: MediaStreamAudioSourceNode | null = null;

type Listener = () => void;
const listeners = new Set<Listener>();
const notifyListeners = () => listeners.forEach((l) => l());

export const getStoredVolume = (userId: string): number =>
  participantVolumeMap.get(userId) ?? 50;

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
  persistentMicGain = DEFAULT_MIC_GAIN;
  lastProcessedTrackId = null;
  notifyListeners();
};

export const getStoredMicGain = (): number => persistentMicGain;

export const setStoredMicGain = (gain: number): void => {
  persistentMicGain = Math.max(0, Math.min(100, gain));
  notifyListeners();
};

// Global Web Audio API context — one per page, reused across tracks.
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
  const { playToggleMute } = useRoomSounds();

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

  const micPub = rawParticipant?.getTrackPublication?.(Track.Source.Microphone);
  const isMuted = rawParticipant
    ? !rawParticipant.isMicrophoneEnabled || !micPub || micPub.isMuted
    : true;

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

  useEffect(() => {
    if (!isSelf && userId && room) {
      applyTrackVolume(userId, volume / 100);
    }
  }, [userId, isSelf, room, volume, applyTrackVolume]);

  const handleVolumeChange = (_event: Event, newValue: number | number[]) => {
    const val = Array.isArray(newValue) ? newValue[0] : newValue;
    setStoredVolume(userId, val);

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

  const handleMicGainChange = (_event: Event, newValue: number | number[]) => {
    const rawVal = Array.isArray(newValue) ? newValue[0] : newValue;
    const val = Math.max(0, Math.min(100, rawVal));
    setStoredMicGain(val);

    if (!room?.localParticipant) return;

    const pub = Array.from(room.localParticipant.audioTrackPublications.values())[0];
    const localTrack = pub?.track as any;
    const sender: RTCRtpSender | undefined = localTrack?.sender;

    if (!localTrack || !sender) return;

    try {
      if (!globalAudioCtx) {
        const AudioContextClass =
          window.AudioContext || (window as any).webkitAudioContext;
        globalAudioCtx = new AudioContextClass();
      }
      if (globalAudioCtx.state === 'suspended') {
        void globalAudioCtx.resume();
      }

      const senderCurrentTrackId = sender.track?.id ?? null;
      const alreadyWrapped =
        senderCurrentTrackId !== null &&
        senderCurrentTrackId === lastProcessedTrackId;

      if (!alreadyWrapped && localTrack.mediaStreamTrack) {
        // Disconnect the OLD graph so nodes don't accumulate across
        // device switches.
        if (globalSourceNode) {
          try {
            globalSourceNode.disconnect();
          } catch {
            /* ignore */
          }
        }
        if (globalGainNode) {
          try {
            globalGainNode.disconnect();
          } catch {
            /* ignore */
          }
        }

        const originalStream = new MediaStream([localTrack.mediaStreamTrack]);
        globalSourceNode = globalAudioCtx.createMediaStreamSource(originalStream);
        globalGainNode = globalAudioCtx.createGain();
        const destination = globalAudioCtx.createMediaStreamDestination();

        globalSourceNode.connect(globalGainNode);
        globalGainNode.connect(destination);

        const processedTrack = destination.stream.getAudioTracks()[0];

        // ✅ replaceTrack returns a Promise. We're in a sync function
        // (MUI's Slider.onChange), so we use .then/.catch — NOT await.
        sender
          .replaceTrack(processedTrack)
          .then(() => {
            // Only commit the ID AFTER the swap succeeds.
            lastProcessedTrackId = processedTrack.id;
          })
          .catch((err) => {
            console.warn('[MicGain] replaceTrack failed:', err);
            // Roll back so the next drag retries.
            lastProcessedTrackId = null;
          });
      }

      if (globalGainNode) {
        globalGainNode.gain.setTargetAtTime(val / 100, globalAudioCtx.currentTime, 0.1);
      }
    } catch (err) {
      console.error('Failed to intercept and apply local mic gain:', err);
    }
  };

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

  const handleToggleMic = async () => {
    if (isSelf && room?.localParticipant) {
      const isEnabled = room.localParticipant.isMicrophoneEnabled;
      await room.localParticipant.setMicrophoneEnabled(!isEnabled, {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      });
      playToggleMute(isEnabled);
    } else if (userId && isViewerHost && !isSelf) {
      handleHostMuteParticipant(!isMuted);
    } else if (userId) {
      onToggleMute?.(userId);
    }
  };

  const handleToggleDeafen = async () => {
    if (!userId || isSelf || !room) return;

    const isCurrentlyDeafened = volume === 0;

    let targetVolume: number;

    if (isCurrentlyDeafened) {
      // Restore exactly what the user had, not a guessed 50.
      const lastKnownVolume = participantPreviousVolumeMap.get(userId);
      targetVolume =
        lastKnownVolume && lastKnownVolume > 0 ? lastKnownVolume : 50;
    } else {
      participantPreviousVolumeMap.set(userId, volume);
      targetVolume = 0;
    }

    setStoredVolume(userId, targetVolume);
    applyTrackVolume(userId, targetVolume / 100);

    onToggleDeafen?.(userId);
  };

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
