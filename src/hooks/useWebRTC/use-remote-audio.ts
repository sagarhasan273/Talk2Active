import { useRef, useState, useEffect, useCallback } from 'react';

import {
  DEFAULT_AUDIO_SETTINGS,
  type RemoteAudioSettings,
  type RemoteAudioNodeManager,
} from './types';

interface UseRemoteAudioProps {
  audioContext: AudioContext | null;
  isDeafened: boolean;
  remoteAudioSettings: RemoteAudioSettings;
  onRemoteSettingsChange?: (userId: string, updates: Partial<RemoteAudioSettings[string]>) => void;
}
export function useRemoteAudio({
  audioContext,
  isDeafened,
  remoteAudioSettings,
  onRemoteSettingsChange,
}: UseRemoteAudioProps) {
  const [remoteStreams, setRemoteStreams] = useState<{ [userId: string]: MediaStream }>({});
  const remoteAudioNodesRef = useRef<RemoteAudioNodeManager>({});
  const pendingStreamsRef = useRef<{ [userId: string]: MediaStream }>({});

  const setupRemoteAudio = useCallback(
    (userId: string, stream: MediaStream): MediaStream | null => {
      if (!audioContext) {
        console.log(`[RemoteAudio] ${userId} — AudioContext not ready, queuing`);
        pendingStreamsRef.current[userId] = stream;
        return stream;
      }
      if (audioContext.state === 'suspended') {
        audioContext.resume().catch((e) => console.warn('[RemoteAudio] Context resume:', e));
      }
      try {
        const old = remoteAudioNodesRef.current[userId];
        if (old) {
          old.sourceNode?.disconnect();
          old.gainNode?.disconnect();
        }
        const sourceNode = audioContext.createMediaStreamSource(stream);
        const gainNode = audioContext.createGain();
        const settings = remoteAudioSettings[userId];
        const baseVolume = settings?.volume ?? 100;
        const isMuted = settings?.isMuted ?? false;
        gainNode.gain.value = isDeafened || isMuted ? 0 : baseVolume / 100;
        sourceNode.connect(gainNode);
        gainNode.connect(audioContext.destination);
        remoteAudioNodesRef.current[userId] = { sourceNode, gainNode };
        console.log(
          `[RemoteAudio] ${userId} — audio graph connected, volume: ${gainNode.gain.value}`
        );
        return stream;
      } catch (error) {
        console.error(`[RemoteAudio] ${userId} — setup failed:`, error);
        return stream;
      }
    },
    [audioContext, isDeafened, remoteAudioSettings]
  );
  const addRemoteStream = useCallback(
    (userId: string, stream: MediaStream) => {
      console.log(`[RemoteAudio] addRemoteStream user ${userId}`);
      setRemoteStreams((prev) => ({ ...prev, [userId]: stream }));
      setupRemoteAudio(userId, stream);
      if (!remoteAudioSettings[userId]) {
        onRemoteSettingsChange?.(userId, {
          volume: DEFAULT_AUDIO_SETTINGS.outputGain,
          isMuted: false,
        });
      }
    },
    [setupRemoteAudio, remoteAudioSettings, onRemoteSettingsChange]
  );
  const removeRemoteStream = useCallback((userId: string) => {
    console.log(`[RemoteAudio] removeRemoteStream user ${userId}`);
    const nodes = remoteAudioNodesRef.current[userId];
    if (nodes) {
      nodes.sourceNode?.disconnect();
      nodes.gainNode?.disconnect();
      delete remoteAudioNodesRef.current[userId];
    }
    delete pendingStreamsRef.current[userId];
    setRemoteStreams((prev) => {
      const next = { ...prev };
      delete next[userId];
      return next;
    });
  }, []);
  const setRemoteVolume = useCallback(
    (userId: string, level: number) => {
      const nodes = remoteAudioNodesRef.current[userId];
      const settings = remoteAudioSettings[userId];
      if (nodes?.gainNode && !isDeafened && !settings?.isMuted) {
        nodes.gainNode.gain.value = level / 100;
      }
      onRemoteSettingsChange?.(userId, { volume: level });
    },
    [isDeafened, remoteAudioSettings, onRemoteSettingsChange]
  );
  const setRemoteMute = useCallback(
    (userId: string, muted: boolean) => {
      const nodes = remoteAudioNodesRef.current[userId];
      const settings = remoteAudioSettings[userId];
      if (nodes?.gainNode) {
        nodes.gainNode.gain.value = muted || isDeafened ? 0 : (settings?.volume ?? 100) / 100;
      }
      onRemoteSettingsChange?.(userId, { isMuted: muted });
    },
    [isDeafened, remoteAudioSettings, onRemoteSettingsChange]
  );
  const applyDeafen = useCallback(
    (deafened: boolean) => {
      Object.entries(remoteAudioNodesRef.current).forEach(([userId, nodes]) => {
        if (!nodes.gainNode) return;
        const settings = remoteAudioSettings[userId];
        nodes.gainNode.gain.value =
          deafened || settings?.isMuted ? 0 : (settings?.volume ?? 100) / 100;
      });
    },
    [remoteAudioSettings]
  );
  const getAudioNodes = useCallback(() => remoteAudioNodesRef.current, []);
  const cleanup = useCallback(() => {
    Object.values(remoteAudioNodesRef.current).forEach((nodes) => {
      nodes.sourceNode?.disconnect();
      nodes.gainNode?.disconnect();
    });
    remoteAudioNodesRef.current = {};
    pendingStreamsRef.current = {};
    setRemoteStreams({});
  }, []);
  useEffect(() => {
    if (!audioContext) return;
    const pending = Object.entries(pendingStreamsRef.current);
    if (!pending.length) return;
    pending.forEach(([userId, stream]) => {
      console.log(`[RemoteAudio] Processing pending stream for user ${userId}`);
      setupRemoteAudio(userId, stream);
    });
    pendingStreamsRef.current = {};
  }, [audioContext, setupRemoteAudio]);

  return {
    remoteStreams,
    addRemoteStream,
    removeRemoteStream,
    setRemoteVolume,
    setRemoteMute,
    applyDeafen,
    getAudioNodes,
    cleanup,
  };
}
