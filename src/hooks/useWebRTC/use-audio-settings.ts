// src/hooks/useWebRTC/useAudioSettings.ts

import { useState, useCallback } from 'react';

import { DEFAULT_AUDIO_SETTINGS } from './types';

import type { AudioSettings, RemoteAudioSettings } from './types';

export function useAudioSettings() {
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(DEFAULT_AUDIO_SETTINGS);
  const [remoteAudioSettings, setRemoteAudioSettings] = useState<RemoteAudioSettings>({});

  const setEchoCancellation = useCallback((enabled: boolean) => {
    setAudioSettings((prev) => ({ ...prev, echoCancellation: enabled }));
  }, []);

  const setNoiseSuppression = useCallback((enabled: boolean) => {
    setAudioSettings((prev) => ({ ...prev, noiseSuppression: enabled }));
  }, []);

  const setNoiseSuppressionLevel = useCallback((level: number) => {
    setAudioSettings((prev) => ({ ...prev, noiseSuppressionLevel: level }));
  }, []);

  const setHighPassFilter = useCallback((enabled: boolean) => {
    setAudioSettings((prev) => ({ ...prev, highPassFilter: enabled }));
  }, []);

  const applyAudioSettings = useCallback((settings: Partial<AudioSettings>) => {
    setAudioSettings((prev) => ({ ...prev, ...settings }));
  }, []);

  const updateRemoteSettings = useCallback(
    (socketId: string, updates: Partial<RemoteAudioSettings[string]>) => {
      setRemoteAudioSettings((prev) => ({
        ...prev,
        [socketId]: {
          ...prev[socketId],
          volume: prev[socketId]?.volume ?? 100,
          isMuted: prev[socketId]?.isMuted ?? false,
          ...updates,
        },
      }));
    },
    []
  );

  const removeRemoteSettings = useCallback((socketId: string) => {
    setRemoteAudioSettings((prev) => {
      const newSettings = { ...prev };
      delete newSettings[socketId];
      return newSettings;
    });
  }, []);

  return {
    audioSettings,
    remoteAudioSettings,
    setEchoCancellation,
    setNoiseSuppression,
    setNoiseSuppressionLevel,
    setHighPassFilter,
    applyAudioSettings,
    updateRemoteSettings,
    removeRemoteSettings,
  };
}
