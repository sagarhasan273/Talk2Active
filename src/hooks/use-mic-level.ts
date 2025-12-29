// useMicrophoneLevel.ts
import { useRef, useState, useEffect, useCallback } from 'react';

export function useMicLevel(stream: MediaStream | null) {
  const [micLevel, setMicLevel] = useState(0);
  const audioAnalyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  const setupAudioAnalyser = useCallback(() => {
    if (!stream) {
      return undefined;
    }
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();

      analyser.fftSize = 256;
      source.connect(analyser);

      audioAnalyserRef.current = analyser;
      return audioContext;
    } catch (error) {
      console.error('Failed to setup audio analyser:', error);
      return null;
    }
  }, [stream]);

  const startMonitoring = useCallback(() => {
    if (!audioAnalyserRef.current || !stream) return;

    const monitor = () => {
      if (!audioAnalyserRef.current) return;

      const dataArray = new Uint8Array(audioAnalyserRef.current.frequencyBinCount);
      audioAnalyserRef.current.getByteFrequencyData(dataArray);

      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      setMicLevel(Math.min(Math.max((average / 128) * 100, 0), 100));

      animationRef.current = requestAnimationFrame(monitor);
    };

    animationRef.current = requestAnimationFrame(monitor);
  }, [stream]);

  const stopMonitoring = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!stream) {
      setMicLevel(0);
      stopMonitoring();
      return undefined;
    }

    const audioContext = setupAudioAnalyser();
    startMonitoring();

    return () => {
      stopMonitoring();
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [stream, setupAudioAnalyser, startMonitoring, stopMonitoring]);

  return { micLevel, stopMonitoring, startMonitoring };
}
