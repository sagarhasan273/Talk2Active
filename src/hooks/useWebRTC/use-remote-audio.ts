// src/hooks/useWebRTC/useRemoteAudio.ts

import { useRef, useState, useEffect, useCallback } from 'react';

import type { RemoteAudioSettings, RemoteAudioNodeManager } from './types';

interface UseRemoteAudioProps {
  audioContext: AudioContext | null;
  isDeafened: boolean;
  remoteAudioSettings: RemoteAudioSettings;
  onRemoteSettingsChange?: (
    socketId: string,
    updates: Partial<RemoteAudioSettings[string]>
  ) => void;
}

export function useRemoteAudio({
  audioContext,
  isDeafened,
  remoteAudioSettings,
  onRemoteSettingsChange,
}: UseRemoteAudioProps) {
  const [remoteStreams, setRemoteStreams] = useState<{ [socketId: string]: MediaStream }>({});

  const remoteAudioNodesRef = useRef<RemoteAudioNodeManager>({});
  const pendingStreamsRef = useRef<{ [socketId: string]: MediaStream }>({});

  // FIX: process any pending streams when audioContext becomes available
  useEffect(() => {
    if (!audioContext) return;
    const pending = Object.entries(pendingStreamsRef.current);
    if (!pending.length) return;

    pending.forEach(([socketId, stream]) => {
      console.log(`[RemoteAudio] Processing pending stream for ${socketId}`);
      setupRemoteAudio(socketId, stream);
    });
    pendingStreamsRef.current = {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioContext]);

  const setupRemoteAudio = useCallback(
    (socketId: string, stream: MediaStream): MediaStream | null => {
      if (!audioContext) {
        console.log(`[RemoteAudio] ${socketId} — AudioContext not ready, queuing`);
        pendingStreamsRef.current[socketId] = stream;
        return stream;
      }

      // FIX: resume suspended context (critical — browsers suspend on page load)
      if (audioContext.state === 'suspended') {
        audioContext.resume().catch((e) => console.warn('[RemoteAudio] Context resume:', e));
      }

      try {
        // Disconnect old nodes for this peer
        const old = remoteAudioNodesRef.current[socketId];
        if (old) {
          try {
            old.sourceNode?.disconnect();
          } catch (error) {
            console.log(error);
          }
          try {
            old.gainNode?.disconnect();
          } catch (error) {
            console.log(error);
          }
        }

        const sourceNode = audioContext.createMediaStreamSource(stream);
        const gainNode = audioContext.createGain();

        const settings = remoteAudioSettings[socketId];
        const baseVolume = settings?.volume ?? 100;
        const isMuted = settings?.isMuted ?? false;

        gainNode.gain.value = isDeafened || isMuted ? 0 : baseVolume / 100;

        sourceNode.connect(gainNode);
        gainNode.connect(audioContext.destination);

        remoteAudioNodesRef.current[socketId] = { sourceNode, gainNode };

        console.log(
          `[RemoteAudio] ${socketId} — audio graph connected, volume: ${gainNode.gain.value}`
        );
        return stream;
      } catch (error) {
        console.error(`[RemoteAudio] ${socketId} — setup failed:`, error);
        return stream;
      }
    },
    [audioContext, isDeafened, remoteAudioSettings]
  );

  const addRemoteStream = useCallback(
    (socketId: string, stream: MediaStream) => {
      console.log(`[RemoteAudio] addRemoteStream ${socketId}`);

      // FIX: always update the stream in state even if audio setup is deferred
      setRemoteStreams((prev) => ({ ...prev, [socketId]: stream }));
      setupRemoteAudio(socketId, stream);

      if (!remoteAudioSettings[socketId]) {
        onRemoteSettingsChange?.(socketId, { volume: 100, isMuted: false });
      }
    },
    [setupRemoteAudio, remoteAudioSettings, onRemoteSettingsChange]
  );

  const removeRemoteStream = useCallback((socketId: string) => {
    console.log(`[RemoteAudio] removeRemoteStream ${socketId}`);

    const nodes = remoteAudioNodesRef.current[socketId];
    if (nodes) {
      try {
        nodes.sourceNode?.disconnect();
      } catch (error) {
        console.log(error);
      }
      try {
        nodes.gainNode?.disconnect();
      } catch (error) {
        console.log(error);
      }
      delete remoteAudioNodesRef.current[socketId];
    }

    delete pendingStreamsRef.current[socketId];

    setRemoteStreams((prev) => {
      const next = { ...prev };
      delete next[socketId];
      return next;
    });
  }, []);

  const setRemoteVolume = useCallback(
    (socketId: string, level: number) => {
      const nodes = remoteAudioNodesRef.current[socketId];
      const settings = remoteAudioSettings[socketId];

      if (nodes?.gainNode && !isDeafened && !settings?.isMuted) {
        nodes.gainNode.gain.value = level / 100;
      }
      onRemoteSettingsChange?.(socketId, { volume: level });
    },
    [isDeafened, remoteAudioSettings, onRemoteSettingsChange]
  );

  const setRemoteMute = useCallback(
    (socketId: string, muted: boolean) => {
      const nodes = remoteAudioNodesRef.current[socketId];
      const settings = remoteAudioSettings[socketId];

      if (nodes?.gainNode) {
        nodes.gainNode.gain.value = muted || isDeafened ? 0 : (settings?.volume ?? 100) / 100;
      }
      onRemoteSettingsChange?.(socketId, { isMuted: muted });
    },
    [isDeafened, remoteAudioSettings, onRemoteSettingsChange]
  );

  const applyDeafen = useCallback(
    (deafened: boolean) => {
      Object.entries(remoteAudioNodesRef.current).forEach(([socketId, nodes]) => {
        if (!nodes.gainNode) return;
        const settings = remoteAudioSettings[socketId];
        if (deafened || settings?.isMuted) {
          nodes.gainNode.gain.value = 0;
        } else {
          nodes.gainNode.gain.value = (settings?.volume ?? 100) / 100;
        }
      });
    },
    [remoteAudioSettings]
  );

  const getAudioNodes = useCallback(() => remoteAudioNodesRef.current, []);

  const cleanup = useCallback(() => {
    Object.values(remoteAudioNodesRef.current).forEach((nodes) => {
      try {
        nodes.sourceNode?.disconnect();
      } catch (error) {
        console.log(error);
      }
      try {
        nodes.gainNode?.disconnect();
      } catch (error) {
        console.log(error);
      }
    });
    remoteAudioNodesRef.current = {};
    pendingStreamsRef.current = {};
    setRemoteStreams({});
  }, []);

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
