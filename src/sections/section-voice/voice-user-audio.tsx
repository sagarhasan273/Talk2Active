import React, { useRef, useEffect } from 'react';

import { Box } from '@mui/material';

import { useWebRTCContext } from 'src/core/contexts/webRTC-context';

interface UserAudioProps {
  stream: MediaStream | null;
  isLocal: boolean;
  userName: string;
  volume?: number; // 0-100
  muted?: boolean;
}

/**
 * A component to handle attaching a MediaStream to an audio element.
 * Supports volume control via props.
 */
export default function VoiceUserAudio({
  stream,
  isLocal,
  userName,
  volume = 100,
  muted = false,
}: UserAudioProps) {
  const webRTC = useWebRTCContext();

  const { isDeafened } = webRTC;

  const audioRef = useRef<HTMLAudioElement>(null);

  // Handle stream attachment
  useEffect(() => {
    if (audioRef.current && stream) {
      audioRef.current.srcObject = stream;

      if (!isLocal) {
        audioRef.current.play().catch((error) => {
          console.warn(`Autoplay denied for ${userName}`, error);
        });
      }
    }
  }, [stream, isLocal, userName]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      // If muted, set volume to 0, otherwise use volume/100
      audioRef.current.volume = muted || isDeafened ? 0 : volume / 100;
    }
  }, [volume, muted, isDeafened]);

  return (
    <Box sx={{ position: 'relative' }}>
      <audio ref={audioRef} autoPlay={!isLocal} muted={isLocal} style={{ display: 'none' }}>
        <track kind="captions" />
      </audio>
    </Box>
  );
}
