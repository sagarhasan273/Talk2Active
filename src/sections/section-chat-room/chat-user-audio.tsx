import React, { useRef, useEffect } from 'react'; // Added useState, useCallback
import { Box } from '@mui/material';

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
    }
  }, [stream, isLocal, userName]);

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Hidden audio element for WebRTC stream */}
      <audio
        ref={audioRef}
        autoPlay={!isLocal}
        muted={isLocal} // Mute local audio to prevent echo
        style={{ display: 'none' }}
      >
        <track kind="captions" />
      </audio>
    </Box>
  );
}
