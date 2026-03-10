// src/hooks/useWebRTC/use-local-audio.ts

import { useRef, useState, useEffect, useCallback } from 'react';

import { fmicGainRange } from 'src/utils/helper';

import type { AudioSettings, AudioNodeManager } from './types';

// NCMode: 'off' = raw mic straight through (no WebAudio graph)
//         'basic' = HPF 80Hz + second HPF 100Hz + light compressor
export type NCMode = 'off' | 'basic';

interface UseLocalAudioProps {
  audioSettings: AudioSettings;
  onMicMutedChange?: (muted: boolean) => void;
}

export function useLocalAudio({ audioSettings, onMicMutedChange }: UseLocalAudioProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);

  const localStreamRef = useRef<MediaStream | null>(null);
  const rawStreamRef = useRef<MediaStream | null>(null);

  const audioNodesRef = useRef<AudioNodeManager>({
    microphoneGainNode: null,
    outputGainNode: null,
    audioContext: null,
    sourceNode: null,
    destinationNode: null,
    highPassFilterNode: null,
    compressorNode: null,
  });

  // ── AudioContext ─────────────────────────────────────────────────────────

  const ensureAudioContext = useCallback((): AudioContext => {
    if (
      !audioNodesRef.current.audioContext ||
      audioNodesRef.current.audioContext.state === 'closed'
    ) {
      audioNodesRef.current.audioContext = new (
        window.AudioContext || (window as any).webkitAudioContext
      )({ sampleRate: 48000 });
    }
    const ctx = audioNodesRef.current.audioContext;
    if (ctx.state === 'suspended') {
      ctx.resume().catch((e) => console.warn('[LocalAudio] ctx resume:', e));
    }
    return ctx;
  }, []);

  // ── Disconnect all nodes ─────────────────────────────────────────────────

  const disconnectAll = useCallback(() => {
    const n = audioNodesRef.current;
    [
      n.sourceNode,
      n.microphoneGainNode,
      n.highPassFilterNode,
      n.compressorNode,
      n.outputGainNode,
      n.destinationNode,
    ].forEach((node) => {
      try {
        node?.disconnect();
      } catch (error) {
        console.log(error);
      }
    });
  }, []);

  const buildGraph = useCallback(
    (stream: MediaStream): MediaStream => {
      const ctx = ensureAudioContext();
      disconnectAll();

      const sourceNode = ctx.createMediaStreamSource(stream);
      const microphoneGainNode = ctx.createGain();
      const outputGainNode = ctx.createGain();
      const destinationNode = ctx.createMediaStreamDestination();

      microphoneGainNode.gain.value = audioSettings.microphoneGain / 100;
      outputGainNode.gain.value = audioSettings.outputGain / 100;

      let tail: AudioNode = sourceNode;
      const pipe = (node: AudioNode | null) => {
        if (!node) return;
        tail.connect(node);
        tail = node;
      };

      pipe(microphoneGainNode);

      audioNodesRef.current = {
        audioContext: ctx,
        sourceNode,
        microphoneGainNode,
        highPassFilterNode: null,
        compressorNode: null,
        outputGainNode,
        destinationNode,
      };

      pipe(outputGainNode);
      pipe(destinationNode);

      return destinationNode.stream;
    },
    [audioSettings.microphoneGain, audioSettings.outputGain, ensureAudioContext, disconnectAll]
  );

  // ── getUserMedia constraints ─────────────────────────────────────────────

  const getConstraintsForMode = useCallback(
    (): MediaStreamConstraints => ({
      audio: {
        echoCancellation: audioSettings.echoCancellation ?? true,
        noiseSuppression: audioSettings.noiseSuppression ?? true,
        autoGainControl: audioSettings.autoGainControl ?? true,
      },
      video: false,
    }),
    [audioSettings]
  );

  // ── Init microphone ──────────────────────────────────────────────────────

  const initializeMicrophone = useCallback(
    async (customConstraints?: MediaStreamConstraints): Promise<boolean> => {
      try {
        rawStreamRef.current?.getTracks().forEach((t) => {
          t.stop();
          t.enabled = false;
        });
        rawStreamRef.current = null;

        const constraints = customConstraints ?? getConstraintsForMode();
        console.log('[LocalAudio] getUserMedia:', constraints);
        const rawStream = await navigator.mediaDevices.getUserMedia(constraints);
        rawStreamRef.current = rawStream;

        const processed = buildGraph(rawStream);
        localStreamRef.current = processed;
        setLocalStream(processed);

        const track = rawStream.getAudioTracks()[0];
        const muted = track ? !track.enabled : false;
        setIsMicMuted(muted);
        onMicMutedChange?.(muted);

        return true;
      } catch (err) {
        console.error('[LocalAudio] Init error:', err);
        return false;
      }
    },
    [getConstraintsForMode, buildGraph, onMicMutedChange]
  );

  // ── Gain controls ────────────────────────────────────────────────────────

  const setMicrophoneGain = useCallback((gain: number) => {
    if (audioNodesRef.current.microphoneGainNode)
      audioNodesRef.current.microphoneGainNode.gain.value = fmicGainRange(gain) / 100;
  }, []);

  const setOutputGain = useCallback((gain: number) => {
    if (audioNodesRef.current.outputGainNode)
      audioNodesRef.current.outputGainNode.gain.value = gain / 100;
  }, []);

  // ── Mute — toggle RAW hardware track ────────────────────────────────────

  const toggleMicrophone = useCallback(() => {
    const track = rawStreamRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setIsMicMuted(!track.enabled);
      onMicMutedChange?.(!track.enabled);
      return !track.enabled;
    }
    return isMicMuted;
  }, [isMicMuted, onMicMutedChange]);

  const muteMicrophone = useCallback(() => {
    const track = rawStreamRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = false;
      setIsMicMuted(true);
      onMicMutedChange?.(true);
    }
  }, [onMicMutedChange]);

  const unmuteMicrophone = useCallback(() => {
    const track = rawStreamRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = true;
      setIsMicMuted(false);
      onMicMutedChange?.(false);
    }
  }, [onMicMutedChange]);

  const getAudioContext = useCallback(() => audioNodesRef.current.audioContext, []);

  // ── Cleanup ──────────────────────────────────────────────────────────────

  const cleanup = useCallback(() => {
    rawStreamRef.current?.getTracks().forEach((t) => {
      t.stop();
      t.enabled = false;
    });
    rawStreamRef.current = null;
    disconnectAll();
    audioNodesRef.current = {
      ...audioNodesRef.current,
      sourceNode: null,
      microphoneGainNode: null,
      outputGainNode: null,
      destinationNode: null,
      highPassFilterNode: null,
      compressorNode: null,
    };
    setLocalStream(null);
    setIsMicMuted(false);
    localStreamRef.current = null;
  }, [disconnectAll]);

  const completeCleanup = useCallback(() => {
    cleanup();
    const ctx = audioNodesRef.current.audioContext;
    if (ctx && ctx.state !== 'closed') {
      ctx.close().catch(console.warn);
      audioNodesRef.current.audioContext = null;
    }
  }, [cleanup]);

  useEffect(() => completeCleanup, [completeCleanup]);

  return {
    localStream,
    localStreamRef,
    isMicMuted,
    getAudioContext,
    initializeMicrophone,
    toggleMicrophone,
    muteMicrophone,
    unmuteMicrophone,
    setMicrophoneGain,
    setOutputGain,
    cleanup,
  };
}
