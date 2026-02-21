// src/hooks/useWebRTC/useLocalAudio.ts

import { useRef, useState, useEffect, useCallback } from 'react';

import type { AudioSettings, AudioNodeManager } from './types';

interface UseLocalAudioProps {
  audioSettings: AudioSettings;
  onMicMutedChange?: (muted: boolean) => void;
}

export function useLocalAudio({ audioSettings, onMicMutedChange }: UseLocalAudioProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);

  const localStreamRef = useRef<MediaStream | null>(null);
  const audioNodesRef = useRef<AudioNodeManager>({
    microphoneGainNode: null,
    outputGainNode: null,
    audioContext: null,
    sourceNode: null,
    destinationNode: null,
    highPassFilterNode: null,
    compressorNode: null,
  });

  // Get audio constraints based on settings
  const getAudioConstraints = useCallback(
    (): MediaTrackConstraints => ({
      echoCancellation: audioSettings.echoCancellation,
      noiseSuppression: audioSettings.noiseSuppression,
      autoGainControl: audioSettings.autoGainControl,
    }),
    [audioSettings]
  );

  // Setup audio processing chain
  const setupAudioProcessing = useCallback(
    (stream: MediaStream): MediaStream => {
      try {
        if (!audioNodesRef.current.audioContext) {
          audioNodesRef.current.audioContext = new (
            window.AudioContext || (window as any).webkitAudioContext
          )();
        }

        const { audioContext } = audioNodesRef.current;
        if (audioContext.state === 'suspended') audioContext.resume();

        const sourceNode = audioContext.createMediaStreamSource(stream);

        // Microphone gain (input sensitivity)
        const microphoneGainNode = audioContext.createGain();

        // High-pass filter (remove low frequency rumble)
        const highPassFilter = audioContext.createBiquadFilter();
        highPassFilter.type = 'highpass';
        highPassFilter.frequency.value = 80;
        highPassFilter.Q.value = 1;

        // Compressor (smooth volume spikes)
        const compressor = audioContext.createDynamicsCompressor();
        compressor.threshold.value = -50;
        compressor.knee.value = 40;
        compressor.ratio.value = 12;
        compressor.attack.value = 0;
        compressor.release.value = 0.25;

        // Output gain (how loud you are to others)
        const outputGainNode = audioContext.createGain();
        const destinationNode = audioContext.createMediaStreamDestination();

        // Set initial values
        microphoneGainNode.gain.value = audioSettings.microphoneGain / 100;
        outputGainNode.gain.value = audioSettings.outputGain / 100;

        // Build audio chain
        sourceNode.connect(microphoneGainNode);
        microphoneGainNode.connect(highPassFilter);
        highPassFilter.connect(compressor);
        compressor.connect(outputGainNode);
        outputGainNode.connect(destinationNode);

        audioNodesRef.current = {
          ...audioNodesRef.current,
          sourceNode,
          microphoneGainNode,
          outputGainNode,
          destinationNode,
          highPassFilterNode: highPassFilter,
          compressorNode: compressor,
        };

        return destinationNode.stream;
      } catch (error) {
        console.error('Audio Setup Error:', error);
        return stream;
      }
    },
    [audioSettings.microphoneGain, audioSettings.outputGain]
  );

  // Initialize microphone
  const initializeMicrophone = useCallback(
    async (customConstraints?: MediaStreamConstraints): Promise<boolean> => {
      try {
        // Stop any existing stream
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach((track) => track.stop());
        }

        const constraints = customConstraints || {
          audio: getAudioConstraints(),
          video: false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        const processedStream = setupAudioProcessing(stream);

        localStreamRef.current = processedStream;
        setLocalStream(processedStream);

        const audioTrack = stream.getAudioTracks()[0];
        const isMuted = !audioTrack.enabled;
        setIsMicMuted(isMuted);
        onMicMutedChange?.(isMuted);

        return true;
      } catch (error) {
        console.error('Microphone Access Error:', error);
        return false;
      }
    },
    [getAudioConstraints, setupAudioProcessing, onMicMutedChange]
  );

  // Audio controls
  const setMicrophoneGain = useCallback((gain: number) => {
    if (audioNodesRef.current.microphoneGainNode) {
      audioNodesRef.current.microphoneGainNode.gain.value = gain / 100;
    }
  }, []);

  const setOutputGain = useCallback((gain: number) => {
    if (audioNodesRef.current.outputGainNode) {
      audioNodesRef.current.outputGainNode.gain.value = gain / 100;
    }
  }, []);

  const toggleMicrophone = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicMuted(!audioTrack.enabled);
        onMicMutedChange?.(!audioTrack.enabled);
        return !audioTrack.enabled;
      }
    }
    return isMicMuted;
  }, [isMicMuted, onMicMutedChange]);

  const muteMicrophone = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = false;
        setIsMicMuted(true);
        onMicMutedChange?.(true);
      }
    }
  }, [onMicMutedChange]);

  const unmuteMicrophone = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = true;
        setIsMicMuted(false);
        onMicMutedChange?.(false);
      }
    }
  }, [onMicMutedChange]);

  // Cleanup
  const cleanup = useCallback(() => {
    if (audioNodesRef.current.audioContext) {
      const { audioContext } = audioNodesRef.current;
      if (audioContext.state !== 'closed') {
        audioContext.close().catch(console.warn);
      }
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop();
        track.enabled = false;
      });
      localStreamRef.current = null;
    }

    setLocalStream(null);
    setIsMicMuted(false);
  }, []);

  const getAudioContext = useCallback(() => audioNodesRef.current.audioContext, []);

  // Cleanup on unmount
  useEffect(() => cleanup, [cleanup]);

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
