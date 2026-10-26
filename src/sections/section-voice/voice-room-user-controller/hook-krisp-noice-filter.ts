// src/sections/section-voice/voice-room-user-controller/hook-krisp-noice-filter.ts

import { useRoomContext } from '@livekit/components-react';
import {
  isKrispNoiseFilterSupported,
  KrispNoiseFilter,
} from '@livekit/krisp-noise-filter';
import { LocalAudioTrack, Track } from 'livekit-client';
import { useCallback, useEffect, useState } from 'react';

// Module-level singletons persist across mount/unmount of the drawer.
let globalProcessorInstance: ReturnType<typeof KrispNoiseFilter> | null = null;
let globalIsFilterEnabled = false;
// Once the hook (or the user) has ever toggled the filter this session,
// we trust the module flags and stop probing track internals.
let sessionInitialised = false;

export const useKrispNoiseFilter = () => {
  const room = useRoomContext();
  const [isNoiseFilterEnabled, setIsNoiseFilterEnabled] = useState(
    globalIsFilterEnabled
  );
  const [isNoiseFilterPending, setIsNoiseFilterPending] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    try {
      setIsSupported(isKrispNoiseFilterSupported());
    } catch {
      setIsSupported(false);
    }
  }, []);

  const getLocalAudioTrack = useCallback((): LocalAudioTrack | null => {
    if (!room?.localParticipant) return null;
    const pub = room.localParticipant.getTrackPublication(Track.Source.Microphone);
    return pub?.track instanceof LocalAudioTrack ? pub.track : null;
  }, [room]);

  // Sync state on drawer mount — but only probe once per session.
  // Repeatedly reading `track.processor` caused false-positives when
  // some other code path (or a previous session) left a processor around.
  useEffect(() => {
    if (!sessionInitialised) {
      const audioTrack = getLocalAudioTrack();
      const hasActiveProcessor = Boolean((audioTrack as any)?.processor);
      if (hasActiveProcessor && !globalIsFilterEnabled) {
        globalIsFilterEnabled = true;
        globalProcessorInstance = (audioTrack as any).processor ?? null;
      }
      sessionInitialised = true;
    }
    setIsNoiseFilterEnabled(globalIsFilterEnabled);
  }, [getLocalAudioTrack]);

  const setNoiseFilterEnabled = useCallback(
    async (enable: boolean) => {
      if (!room?.localParticipant || !isSupported) return;

      const audioTrack = getLocalAudioTrack();
      if (!audioTrack) {
        console.warn('[Krisp] No active microphone track found to apply filter.');
        return;
      }

      try {
        setIsNoiseFilterPending(true);

        if (enable) {
          if (!globalProcessorInstance) {
            globalProcessorInstance = KrispNoiseFilter();
          }

          const processor = globalProcessorInstance;
          await audioTrack.setProcessor(processor);

          if (typeof (processor as any).setEnabled === 'function') {
            await (processor as any).setEnabled(true);
          }
          globalIsFilterEnabled = true;
          setIsNoiseFilterEnabled(true);
        } else {
          const processor = globalProcessorInstance;
          if (processor && typeof (processor as any).setEnabled === 'function') {
            await (processor as any).setEnabled(false);
          } else {
            await audioTrack.stopProcessor();
          }
          globalIsFilterEnabled = false;
          setIsNoiseFilterEnabled(false);
        }
      } catch (error) {
        console.error('[Krisp] Failed to toggle noise cancellation:', error);
      } finally {
        setIsNoiseFilterPending(false);
      }
    },
    [room, isSupported, getLocalAudioTrack]
  );

  return {
    isNoiseFilterEnabled,
    isNoiseFilterPending,
    isSupported,
    setNoiseFilterEnabled,
  };
};
