// src/hooks/useWebRTC/use-local-audio.ts

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

  const getAudioConstraints = useCallback(
    (): MediaTrackConstraints => ({
      echoCancellation: audioSettings.echoCancellation,
      noiseSuppression: audioSettings.noiseSuppression,
      autoGainControl: audioSettings.autoGainControl,
    }),
    [audioSettings]
  );

  const setupAudioProcessing = useCallback(
    (stream: MediaStream): MediaStream => {
      try {
        // Create new audio context if needed
        if (
          !audioNodesRef.current.audioContext ||
          audioNodesRef.current.audioContext.state === 'closed'
        ) {
          audioNodesRef.current.audioContext = new (
            window.AudioContext || (window as any).webkitAudioContext
          )();
        }

        const { audioContext } = audioNodesRef.current;
        if (audioContext.state === 'suspended') {
          audioContext.resume().catch(console.warn);
        }

        const sourceNode = audioContext.createMediaStreamSource(stream);

        const microphoneGainNode = audioContext.createGain();
        const highPassFilter = audioContext.createBiquadFilter();
        highPassFilter.type = 'highpass';
        highPassFilter.frequency.value = 80;
        highPassFilter.Q.value = 1;

        const compressor = audioContext.createDynamicsCompressor();
        compressor.threshold.value = -50;
        compressor.knee.value = 40;
        compressor.ratio.value = 12;
        compressor.attack.value = 0;
        compressor.release.value = 0.25;

        const outputGainNode = audioContext.createGain();
        const destinationNode = audioContext.createMediaStreamDestination();

        microphoneGainNode.gain.value = audioSettings.microphoneGain / 100;
        outputGainNode.gain.value = audioSettings.outputGain / 100;

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

  const initializeMicrophone = useCallback(
    async (customConstraints?: MediaStreamConstraints): Promise<boolean> => {
      try {
        // Stop existing tracks but keep audio context alive
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach((track) => {
            track.stop();
            track.enabled = false;
          });
          localStreamRef.current = null;
        }

        const constraints = customConstraints || {
          audio: getAudioConstraints(),
          video: false,
        };

        console.log('Initializing microphone with constraints:', constraints);
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

  const getAudioContext = useCallback(() => audioNodesRef.current.audioContext, []);

  // MODIFIED: Selective cleanup - keep audio context alive
  const cleanup = useCallback(() => {
    console.log('Cleaning up local audio (keeping audio context)');

    // Stop tracks but keep audio context for reuse
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop();
        track.enabled = false;
      });
      localStreamRef.current = null;
    }

    // Disconnect nodes but keep audio context
    if (audioNodesRef.current.sourceNode) {
      try {
        audioNodesRef.current.sourceNode.disconnect();
      } catch (e) {
        console.log(e);
      }
      audioNodesRef.current.sourceNode = null;
    }
    if (audioNodesRef.current.microphoneGainNode) {
      try {
        audioNodesRef.current.microphoneGainNode.disconnect();
      } catch (e) {
        console.log(e);
      }
      audioNodesRef.current.microphoneGainNode = null;
    }
    if (audioNodesRef.current.outputGainNode) {
      try {
        audioNodesRef.current.outputGainNode.disconnect();
      } catch (e) {
        console.log(e);
      }
      audioNodesRef.current.outputGainNode = null;
    }
    if (audioNodesRef.current.destinationNode) {
      try {
        audioNodesRef.current.destinationNode.disconnect();
      } catch (e) {
        console.log(e);
      }
      audioNodesRef.current.destinationNode = null;
    }
    if (audioNodesRef.current.highPassFilterNode) {
      try {
        audioNodesRef.current.highPassFilterNode.disconnect();
      } catch (e) {
        console.log(e);
      }
      audioNodesRef.current.highPassFilterNode = null;
    }
    if (audioNodesRef.current.compressorNode) {
      try {
        audioNodesRef.current.compressorNode.disconnect();
      } catch (e) {
        console.log(e);
      }
      audioNodesRef.current.compressorNode = null;
    }

    setLocalStream(null);
    setIsMicMuted(false);
  }, []);

  // COMPLETE cleanup (only for unmount)
  const completeCleanup = useCallback(() => {
    console.log('Complete cleanup - closing audio context');

    cleanup();

    if (audioNodesRef.current.audioContext) {
      const { audioContext } = audioNodesRef.current;
      if (audioContext.state !== 'closed') {
        audioContext.close().catch(console.warn);
      }
      audioNodesRef.current.audioContext = null;
    }
  }, [cleanup]);

  // Use completeCleanup only on unmount
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
    cleanup, // Export selective cleanup for room switching
  };
}
