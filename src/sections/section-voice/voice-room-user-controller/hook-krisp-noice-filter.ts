import { useRoomContext } from '@livekit/components-react';
import { isKrispNoiseFilterSupported, KrispNoiseFilter } from '@livekit/krisp-noise-filter';
import { LocalAudioTrack, Track } from 'livekit-client';
import { useCallback, useEffect, useRef, useState } from 'react';

export const useKrispNoiseFilter = () => {
  const room = useRoomContext();
  const [isNoiseFilterEnabled, setIsNoiseFilterEnabled] = useState(false);
  const [isNoiseFilterPending, setIsNoiseFilterPending] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  // Reference to the active Krisp processor instance
  const processorRef = useRef<ReturnType<typeof KrispNoiseFilter> | null>(null);

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
          if (!processorRef.current) {
            processorRef.current = KrispNoiseFilter();
          }

          const processor = processorRef.current;
          await audioTrack.setProcessor(processor);

          if (typeof (processor as any).setEnabled === 'function') {
            await (processor as any).setEnabled(true);
          }
          setIsNoiseFilterEnabled(true);
        } else {
          const processor = processorRef.current;
          if (processor && typeof (processor as any).setEnabled === 'function') {
            await (processor as any).setEnabled(false);
          } else {
            await audioTrack.stopProcessor();
          }
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
