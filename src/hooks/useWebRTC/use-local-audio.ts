// src/hooks/useWebRTC/use-local-audio.ts

import { useRef, useState, useEffect, useCallback } from 'react';

import type { AudioSettings, AudioNodeManager } from './types';

export type NCMode = 'off' | 'basic' | 'aggressive';

interface UseLocalAudioProps {
  audioSettings: AudioSettings;
  onMicMutedChange?: (muted: boolean) => void;
}

interface NCNodes {
  highPass2: BiquadFilterNode | null;
  notch: BiquadFilterNode | null; // aggressive only: 50Hz hum
  gate: DynamicsCompressorNode | null; // aggressive only: soft noise gate
}

export function useLocalAudio({ audioSettings, onMicMutedChange }: UseLocalAudioProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [ncMode, setNcModeState] = useState<NCMode>('basic');

  const localStreamRef = useRef<MediaStream | null>(null);
  const rawStreamRef = useRef<MediaStream | null>(null);
  const ncModeRef = useRef<NCMode>('basic');

  const audioNodesRef = useRef<AudioNodeManager>({
    microphoneGainNode: null,
    outputGainNode: null,
    audioContext: null,
    sourceNode: null,
    destinationNode: null,
    highPassFilterNode: null,
    compressorNode: null,
  });

  const ncNodesRef = useRef<NCNodes>({ highPass2: null, notch: null, gate: null });

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
    const nc = ncNodesRef.current;
    [
      n.sourceNode,
      n.microphoneGainNode,
      n.highPassFilterNode,
      n.compressorNode,
      n.outputGainNode,
      n.destinationNode,
      nc.highPass2,
      nc.notch,
      nc.gate,
    ].forEach((node) => {
      try {
        node?.disconnect();
      } catch (error) {
        console.log(error);
      }
    });
  }, []);

  // ── Build NC nodes ───────────────────────────────────────────────────────
  //
  // basic:      second HPF at 100Hz — cuts low-frequency rumble & desk noise
  // aggressive: HPF 120Hz + 50Hz notch (power hum) + soft gate compressor
  //
  // NOTE: lowShelf removed — was cutting voice presence above 8kHz, making
  // speech sound muffled. The gate ratio is 8 (not 20) to avoid crushing
  // natural speech pauses.

  const buildNCNodes = useCallback((ctx: AudioContext, mode: NCMode): NCNodes => {
    const nodes: NCNodes = { highPass2: null, notch: null, gate: null };
    if (mode === 'off') return nodes;

    const hp2 = ctx.createBiquadFilter();
    hp2.type = 'highpass';
    hp2.frequency.value = mode === 'aggressive' ? 120 : 100;
    hp2.Q.value = 0.7;
    nodes.highPass2 = hp2;

    if (mode === 'aggressive') {
      // Notch for power-line hum — Q:3 wide enough to also catch 60Hz variants
      const notch = ctx.createBiquadFilter();
      notch.type = 'notch';
      notch.frequency.value = 50;
      notch.Q.value = 3;
      nodes.notch = notch;

      // Soft gate — ratio:8 suppresses background noise without chopping
      // voice during natural pauses (was ratio:20 → brutal, choppy)
      const gate = ctx.createDynamicsCompressor();
      gate.threshold.value = -45; // raised from -55 so soft speech is never gated
      gate.knee.value = 10; // wide knee = smooth transition, no hard cutoff
      gate.ratio.value = 8; // was 20 → caused robotic choppy sound
      gate.attack.value = 0.003; // slightly slower so consonant transients pass
      gate.release.value = 0.2; // was 0.1 → less pumping between words
      nodes.gate = gate;
    }

    return nodes;
  }, []);

  // ── Build full WebAudio graph ────────────────────────────────────────────
  //
  // Signal path:
  //   raw mic → source → micGain → HPF(80Hz)
  //     → [HP2(100-120Hz)]    (NC basic/aggressive)
  //     → [notch(50Hz)]       (NC aggressive)
  //     → compressor
  //     → [gate]              (NC aggressive)
  //     → outputGain → destination → WebRTC peers

  const buildGraph = useCallback(
    (stream: MediaStream, mode: NCMode): MediaStream => {
      const ctx = ensureAudioContext();
      disconnectAll();

      const sourceNode = ctx.createMediaStreamSource(stream);
      const microphoneGainNode = ctx.createGain();
      const highPassFilter = ctx.createBiquadFilter();
      const compressor = ctx.createDynamicsCompressor();
      const outputGainNode = ctx.createGain();
      const destinationNode = ctx.createMediaStreamDestination();

      highPassFilter.type = 'highpass';
      highPassFilter.frequency.value = 80;
      highPassFilter.Q.value = 1;

      compressor.threshold.value = -50;
      compressor.knee.value = 40;
      compressor.ratio.value = 12;
      compressor.attack.value = 0;
      compressor.release.value = 0.25;

      microphoneGainNode.gain.value = audioSettings.microphoneGain / 100;
      outputGainNode.gain.value = audioSettings.outputGain / 100;

      const nc = buildNCNodes(ctx, mode);
      ncNodesRef.current = nc;

      let tail: AudioNode = sourceNode;
      const pipe = (node: AudioNode | null) => {
        if (!node) return;
        tail.connect(node);
        tail = node;
      };

      pipe(microphoneGainNode);
      pipe(highPassFilter);
      pipe(nc.highPass2); // basic + aggressive
      pipe(nc.notch); // aggressive only
      pipe(compressor);
      pipe(nc.gate); // aggressive only
      pipe(outputGainNode);
      pipe(destinationNode);

      audioNodesRef.current = {
        audioContext: ctx,
        sourceNode,
        microphoneGainNode,
        highPassFilterNode: highPassFilter,
        compressorNode: compressor,
        outputGainNode,
        destinationNode,
      };

      console.log(`[LocalAudio] Graph built — NC: ${mode}`);
      return destinationNode.stream;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      audioSettings.microphoneGain,
      audioSettings.outputGain,
      ensureAudioContext,
      disconnectAll,
      buildNCNodes,
    ]
  );

  // ── getUserMedia constraints ─────────────────────────────────────────────

  const getConstraintsForMode = useCallback(
    (mode: NCMode): MediaStreamConstraints => ({
      audio: {
        echoCancellation: audioSettings.echoCancellation,
        noiseSuppression: mode !== 'off' || audioSettings.noiseSuppression,
        autoGainControl: audioSettings.autoGainControl ?? true,
        ...(mode === 'aggressive' &&
          ({
            googNoiseSuppression: true,
            googNoiseSuppression2: true,
            googEchoCancellation: true,
            googEchoCancellation2: true,
            googHighpassFilter: true,
          } as any)),
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

        const constraints = customConstraints ?? getConstraintsForMode(ncModeRef.current);
        console.log('[LocalAudio] getUserMedia:', constraints);
        const rawStream = await navigator.mediaDevices.getUserMedia(constraints);
        rawStreamRef.current = rawStream;

        const processed = buildGraph(rawStream, ncModeRef.current);
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

  // ── Set NC mode ──────────────────────────────────────────────────────────
  //
  // FIX: capture previousMode BEFORE mutating ncModeRef, otherwise the
  // off↔on boundary check always compares the new value against itself.

  const setNCMode = useCallback(
    async (mode: NCMode) => {
      const previousMode = ncModeRef.current; // ← capture FIRST
      if (mode === previousMode) return;

      ncModeRef.current = mode; // ← THEN mutate
      setNcModeState(mode);

      const raw = rawStreamRef.current;
      if (!raw) return;

      // Crossing off↔on boundary requires new getUserMedia call with updated
      // browser-level noiseSuppression constraint
      const wasOff = previousMode === 'off';
      const nowOff = mode === 'off';
      const crossingBoundary = wasOff !== nowOff;

      if (crossingBoundary) {
        await initializeMicrophone();
      } else {
        // Same off/on side — just rewire the WebAudio graph
        const processed = buildGraph(raw, mode);
        localStreamRef.current = processed;
        setLocalStream(processed);
      }
    },
    [initializeMicrophone, buildGraph]
  );

  const toggleNC = useCallback(() => {
    const next: NCMode =
      ncModeRef.current === 'off' ? 'basic' : ncModeRef.current === 'basic' ? 'aggressive' : 'off';
    setNCMode(next);
  }, [setNCMode]);

  // ── Gain controls ────────────────────────────────────────────────────────

  const setMicrophoneGain = useCallback((gain: number) => {
    if (audioNodesRef.current.microphoneGainNode)
      audioNodesRef.current.microphoneGainNode.gain.value = gain / 100;
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
    ncNodesRef.current = { highPass2: null, notch: null, gate: null };
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
    ncMode,
    setNCMode,
    toggleNC,
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
