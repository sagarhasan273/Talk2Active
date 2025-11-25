import React, { useRef, useState, useEffect, useCallback } from 'react'; // Added useState, useCallback
import { Box, Typography } from '@mui/material';

interface UserAudioProps {
  stream: MediaStream | null;
  isLocal: boolean;
  userName: string;
}

/**
 * A component to handle attaching a MediaStream to an audio element.
 * It also displays a simple indicator for stream presence and audio activity.
 */
export default function UserAudio({ stream, isLocal, userName }: UserAudioProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const VOLUME_THRESHOLD = 5; // Volume level threshold (0-255)
  const SMOOTHING_TIME = 200; // Time in ms to delay setting speaking state to false

  const analyzeAudio = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    // Calculate the average volume level
    const sum = dataArray.reduce((acc, val) => acc + val, 0);
    const averageVolume = sum / dataArray.length;

    const currentlySpeaking = averageVolume > VOLUME_THRESHOLD;

    // Update state to show activity
    if (currentlySpeaking !== isSpeaking) {
      if (currentlySpeaking) {
        setIsSpeaking(true);
      } else {
        // Use a short delay before setting to false (smoothing)
        setTimeout(() => {
          // Check volume again after delay to prevent rapid flickering
          if (analyserRef.current) {
            analyserRef.current.getByteFrequencyData(dataArray);
            const newSum = dataArray.reduce((acc, val) => acc + val, 0);
            const newAvg = newSum / dataArray.length;
            if (newAvg <= VOLUME_THRESHOLD) {
              setIsSpeaking(false);
            }
          } else {
            setIsSpeaking(false);
          }
        }, SMOOTHING_TIME);
      }
    }

    // Loop the analysis
    rafRef.current = requestAnimationFrame(analyzeAudio);
  }, [isSpeaking]);

  useEffect(() => {
    if (audioRef.current && stream) {
      // 1. Set the audio stream to the HTML audio element
      audioRef.current.srcObject = stream;
      // For remote streams, attempt to auto-play
      if (!isLocal) {
        audioRef.current.play().catch((error) => {
          // Suppress Autoplay error, but notify the user visually
          console.warn(`Autoplay denied for ${userName}. User must interact to play audio.`, error);
        });
      }

      // 2. Setup Web Audio API for volume detection
      try {
        if (!audioContextRef.current) {
          // Create AudioContext only if needed (user interaction should have happened by now)
          audioContextRef.current = new (window.AudioContext ||
            (window as any).webkitAudioContext)();
        }
        const audioContext = audioContextRef.current;

        // Ensure context is running if suspended
        if (audioContext.state === 'suspended') {
          audioContext.resume();
        }

        // Create stream source node
        const source = audioContext.createMediaStreamSource(stream);

        // Create analyser node
        analyserRef.current = audioContext.createAnalyser();
        analyserRef.current.fftSize = 256;

        // Connect nodes: Source -> Analyser
        source.connect(analyserRef.current);

        // If remote, connect analyser to destination to ensure sound plays
        if (!isLocal) {
          analyserRef.current.connect(audioContext.destination);
        }

        // 3. Start analysis loop
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
        rafRef.current = requestAnimationFrame(analyzeAudio);
      } catch (e) {
        console.error('Web Audio API setup failed, speaking indicator disabled:', e);
      }
    } else {
      // Cleanup on stream removal
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      analyserRef.current = null;
      setIsSpeaking(false);
    }

    // Cleanup function on effect exit
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [stream, isLocal, userName, analyzeAudio]);

  // The audio element is hidden for the local user (since they hear themselves)
  // but necessary for remote users.
  const isStreamReady = !!stream;

  const indicatorColor = isSpeaking
    ? isLocal
      ? 'warning.main'
      : 'success.main'
    : isLocal
      ? 'secondary.main'
      : 'text.secondary';

  const speakingStyle = {
    // Highlight container with border when speaking
    border: isSpeaking ? `2px solid ${isLocal ? '#ff9800' : '#4caf50'}` : '2px solid transparent',
    borderRadius: '8px',
    padding: '4px 8px',
    transition: 'all 0.2s ease-in-out',
    // Dynamic pulsing animation for the icon when speaking
    '@keyframes pulse': {
      '0%': { transform: 'scale(1)' },
      '100%': { transform: 'scale(1.1)' },
    },
  };

  return (
    <Box>
      {/* Hidden audio element for WebRTC stream */}
      <audio
        ref={audioRef}
        autoPlay={!isLocal}
        muted={isLocal} // Mute local audio to prevent echo
        style={{ display: 'none' }}
      >
        <track kind="captions" />
      </audio>

      {isStreamReady && (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={speakingStyle} // Apply dynamic speaking style
        >
          <Typography
            variant="caption"
            color={indicatorColor}
            sx={{ ml: 0.5, fontWeight: isSpeaking ? 'bold' : 'normal' }}
          >
            {isSpeaking
              ? isLocal
                ? '🎙️ SPEAKING NOW'
                : '🔊 LIVE AUDIO'
              : isLocal
                ? 'Local Audio'
                : 'Stream Active'}
          </Typography>
        </Box>
      )}

      {!isStreamReady && !isLocal && (
        <Typography variant="caption" color="error.main">
          Stream connecting...
        </Typography>
      )}
    </Box>
  );
}
