// src/hooks/useWebRTC/useRemoteAudio.ts

import { useRef, useState, useCallback } from 'react';

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

  // Setup audio processing for remote stream
  const setupRemoteAudio = useCallback(
    (socketId: string, stream: MediaStream): MediaStream | null => {
      // If audioContext isn't ready yet, store the stream for later
      if (!audioContext) {
        console.log(`[${socketId}] AudioContext not ready, queueing remote stream`);
        pendingStreamsRef.current[socketId] = stream;
        return stream; // Return original stream, will be processed later
      }

      try {
        console.log(`[${socketId}] Setting up remote audio with AudioContext`);

        // Clean up existing nodes if any
        if (remoteAudioNodesRef.current[socketId]) {
          const oldNodes = remoteAudioNodesRef.current[socketId];
          if (oldNodes.sourceNode) oldNodes.sourceNode.disconnect();
          if (oldNodes.gainNode) oldNodes.gainNode.disconnect();
        }

        const sourceNode = audioContext.createMediaStreamSource(stream);
        const gainNode = audioContext.createGain();

        // Set initial volume based on settings
        const settings = remoteAudioSettings[socketId];
        const baseVolume = settings?.volume ?? 100;
        const isMuted = settings?.isMuted ?? false;

        // Apply deafen and mute states
        let finalVolume = baseVolume / 100;
        if (isDeafened || isMuted) {
          finalVolume = 0;
        }

        gainNode.gain.value = finalVolume;
        console.log(
          `[${socketId}] Initial volume: ${finalVolume} (deafened: ${isDeafened}, muted: ${isMuted})`
        );

        // Connect: remote stream -> gain control -> speakers
        sourceNode.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Store nodes
        remoteAudioNodesRef.current[socketId] = {
          sourceNode,
          gainNode,
        };

        console.log(`[${socketId}] Remote audio setup complete`);
        return stream;
      } catch (error) {
        console.error(`Failed to setup remote audio for ${socketId}:`, error);
        return stream;
      }
    },
    [audioContext, isDeafened, remoteAudioSettings]
  );

  // Add remote stream
  const addRemoteStream = useCallback(
    (socketId: string, stream: MediaStream) => {
      console.log(`[${socketId}] Adding remote stream`);

      const processedStream = setupRemoteAudio(socketId, stream);
      if (processedStream) {
        setRemoteStreams((prev) => ({ ...prev, [socketId]: processedStream }));
      }

      // Initialize settings if not exists
      if (!remoteAudioSettings[socketId]) {
        onRemoteSettingsChange?.(socketId, { volume: 100, isMuted: false });
      }
    },
    [setupRemoteAudio, remoteAudioSettings, onRemoteSettingsChange]
  );

  // Remove remote stream
  const removeRemoteStream = useCallback((socketId: string) => {
    console.log(`[${socketId}] Removing remote stream`);

    // Clean up audio nodes
    const nodes = remoteAudioNodesRef.current[socketId];
    if (nodes) {
      if (nodes.sourceNode) {
        try {
          nodes.sourceNode.disconnect();
        } catch (e) {
          // failed to disconnect
        }
      }
      if (nodes.gainNode) {
        try {
          nodes.gainNode.disconnect();
        } catch (e) {
          // failed to disconnect
        }
      }
      delete remoteAudioNodesRef.current[socketId];
    }

    // Remove from pending streams if present
    if (pendingStreamsRef.current[socketId]) {
      delete pendingStreamsRef.current[socketId];
    }

    setRemoteStreams((prev) => {
      const newStreams = { ...prev };
      delete newStreams[socketId];
      return newStreams;
    });
  }, []);

  // Control functions
  const setRemoteVolume = useCallback(
    (socketId: string, level: number) => {
      console.log(`[${socketId}] Setting volume to ${level}, isDeafened: ${isDeafened}`);

      const nodes = remoteAudioNodesRef.current[socketId];
      const settings = remoteAudioSettings[socketId];

      if (nodes?.gainNode) {
        // Only apply volume if not deafened and not muted
        if (!isDeafened && !settings?.isMuted) {
          nodes.gainNode.gain.value = level / 100;
          console.log(`[${socketId}] Volume applied: ${level / 100}`);
        } else {
          console.log(
            `[${socketId}] Volume not applied - deafened: ${isDeafened}, muted: ${settings?.isMuted}`
          );
        }
      } else {
        console.log(`[${socketId}] Gain node not found, nodes:`, nodes);
      }

      onRemoteSettingsChange?.(socketId, { volume: level });
    },
    [isDeafened, remoteAudioSettings, onRemoteSettingsChange]
  );

  const setRemoteMute = useCallback(
    (socketId: string, muted: boolean) => {
      console.log(`[${socketId}] Setting mute to ${muted}, isDeafened: ${isDeafened}`);

      const nodes = remoteAudioNodesRef.current[socketId];
      const settings = remoteAudioSettings[socketId];

      if (nodes?.gainNode) {
        if (muted || isDeafened) {
          nodes.gainNode.gain.value = 0;
          console.log(`[${socketId}] Muted (value: 0)`);
        } else {
          const volume = settings?.volume ?? 100;
          nodes.gainNode.gain.value = volume / 100;
          console.log(`[${socketId}] Unmuted with volume: ${volume / 100}`);
        }
      }

      onRemoteSettingsChange?.(socketId, { isMuted: muted });
    },
    [isDeafened, remoteAudioSettings, onRemoteSettingsChange]
  );

  // Handle deafen toggle
  const applyDeafen = useCallback(
    (deafened: boolean) => {
      console.log(`Applying deafen: ${deafened}`);

      Object.entries(remoteAudioNodesRef.current).forEach(([socketId, nodes]) => {
        if (nodes.gainNode) {
          const settings = remoteAudioSettings[socketId];

          if (deafened) {
            nodes.gainNode.gain.value = 0;
            console.log(`[${socketId}] Deafened -> 0`);
          } else if (settings?.isMuted) {
            nodes.gainNode.gain.value = 0;
            console.log(`[${socketId}] Undeafened but muted -> 0`);
          } else {
            const volume = settings?.volume ?? 100;
            nodes.gainNode.gain.value = volume / 100;
            console.log(`[${socketId}] Undeafened with volume: ${volume / 100}`);
          }
        }
      });
    },
    [remoteAudioSettings]
  );

  // Get audio nodes for debugging
  const getAudioNodes = useCallback(() => remoteAudioNodesRef.current, []);

  // Cleanup
  const cleanup = useCallback(() => {
    console.log('Cleaning up remote audio');

    Object.values(remoteAudioNodesRef.current).forEach((nodes) => {
      if (nodes.sourceNode) {
        try {
          nodes.sourceNode.disconnect();
        } catch (e) {
          // failed to disconnect
        }
      }
      if (nodes.gainNode) {
        try {
          nodes.gainNode.disconnect();
        } catch (e) {
          // failed to disconnect
        }
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
