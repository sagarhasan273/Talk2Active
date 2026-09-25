import { useRoomContext } from '@livekit/components-react';
import { isKrispNoiseFilterSupported, KrispNoiseFilter } from '@livekit/krisp-noise-filter';
import { LocalAudioTrack, Track } from 'livekit-client';
import { useCallback, useEffect, useState } from 'react';

// Module-level singletons that persist across mount/unmount of dialogs
let globalProcessorInstance: ReturnType<typeof KrispNoiseFilter> | null = null;
let globalIsFilterEnabled = false;

export const useKrispNoiseFilter = () => {
  const room = useRoomContext();
  const [isNoiseFilterEnabled, setIsNoiseFilterEnabled] = useState(globalIsFilterEnabled);
  const [isNoiseFilterPending, setIsNoiseFilterPending] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  // Check hardware/browser support
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

  // Sync state on drawer/modal mount with actual track & global state
  useEffect(() => {
    const audioTrack = getLocalAudioTrack();
    if (audioTrack) {
      // Check if track already has an active processor attached
      const hasActiveProcessor = Boolean((audioTrack as any).processor);
      if (hasActiveProcessor && !globalIsFilterEnabled) {
        globalIsFilterEnabled = true;
      }
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
