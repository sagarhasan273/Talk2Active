import { useRef, useState, useCallback } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// useNoiseCancellation
// ─────────────────────────────────────────────────────────────────────────────

export type NoiseCancellationMode = 'off' | 'basic' | 'aggressive';

export type UseNoiseCancellationReturn = {
  processStream: (stream: MediaStream) => Promise<MediaStream>;
  isEnabled: boolean;
  mode: NoiseCancellationMode;
  setMode: (mode: NoiseCancellationMode) => void;
  toggle: () => void;
  isSupported: boolean;
};

export function useNoiseCancellation(
  initialMode: NoiseCancellationMode = 'basic'
): UseNoiseCancellationReturn {
  const [mode, setModeState] = useState<NoiseCancellationMode>(initialMode);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const isSupported =
    typeof window !== 'undefined' &&
    'AudioContext' in window &&
    'MediaStreamAudioSourceNode' in window;

  const getConstrainedStream = useCallback(
    async (originalStream: MediaStream): Promise<MediaStream> => {
      if (mode === 'off') return originalStream;
      try {
        const deviceId = originalStream.getAudioTracks()[0]?.getSettings()?.deviceId;
        const constraints: MediaStreamConstraints = {
          audio: {
            deviceId: deviceId ? { exact: deviceId } : undefined,
            noiseSuppression: true,
            echoCancellation: true,
            autoGainControl: mode === 'aggressive',
            ...(mode === 'aggressive' &&
              ({
                googNoiseSuppression: true,
                googNoiseSuppression2: true,
                googEchoCancellation2: true,
                googHighpassFilter: true,
              } as any)),
          },
        };
        const constrained = await navigator.mediaDevices.getUserMedia(constraints);
        originalStream.getAudioTracks().forEach((t) => t.stop());
        return constrained;
      } catch {
        return originalStream;
      }
    },
    [mode]
  );

  const applyWebAudioProcessing = useCallback(
    (stream: MediaStream): MediaStream => {
      if (mode === 'off' || !isSupported) return stream;
      try {
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
          audioContextRef.current = new AudioContext({ sampleRate: 48000 });
        }
        const ctx = audioContextRef.current;
        sourceNodeRef.current?.disconnect();

        const source = ctx.createMediaStreamSource(stream);
        const destination = ctx.createMediaStreamDestination();

        if (mode === 'aggressive') {
          const highPass = ctx.createBiquadFilter();
          highPass.type = 'highpass';
          highPass.frequency.value = 80;
          const compressor = ctx.createDynamicsCompressor();
          compressor.threshold.value = -50;
          compressor.knee.value = 40;
          compressor.ratio.value = 12;
          compressor.attack.value = 0;
          compressor.release.value = 0.25;
          source.connect(highPass);
          highPass.connect(compressor);
          compressor.connect(destination);
        } else {
          const highPass = ctx.createBiquadFilter();
          highPass.type = 'highpass';
          highPass.frequency.value = 100;
          source.connect(highPass);
          highPass.connect(destination);
        }

        sourceNodeRef.current = source;
        const processedAudio = destination.stream.getAudioTracks();
        const videoTracks = stream.getVideoTracks();
        return new MediaStream([...processedAudio, ...videoTracks]);
      } catch {
        return stream;
      }
    },
    [mode, isSupported]
  );

  const processStream = useCallback(
    async (stream: MediaStream): Promise<MediaStream> => {
      if (mode === 'off') return stream;
      const constrained = await getConstrainedStream(stream);
      return applyWebAudioProcessing(constrained);
    },
    [mode, getConstrainedStream, applyWebAudioProcessing]
  );

  const setMode = useCallback((newMode: NoiseCancellationMode) => setModeState(newMode), []);

  const toggle = useCallback(() => {
    setModeState((p) => (p === 'off' ? 'basic' : p === 'basic' ? 'aggressive' : 'off'));
  }, []);

  return { processStream, isEnabled: mode !== 'off', mode, setMode, toggle, isSupported };
}
