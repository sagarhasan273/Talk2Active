import React, { useRef, useEffect, useCallback } from 'react';

import { Box } from '@mui/material';

import { useWebRTCContext } from 'src/core/contexts/webRTC-context';

interface UserAudioProps {
  stream: MediaStream | null;
  isLocal: boolean;
  userName: string;
  muted?: boolean;
}

export default function VoiceUserAudio({
  stream,
  isLocal,
  userName,
  muted = false,
}: UserAudioProps) {
  const { isDeafened } = useWebRTCContext();

  const audioRef = useRef<HTMLAudioElement>(null);
  const hasUserGestureRef = useRef(false);
  const pendingPlayRef = useRef(false);

  // Attempt to play — safe to call multiple times
  const tryPlay = useCallback(() => {
    const el = audioRef.current;
    if (!el || isLocal || !el.srcObject) return;

    el.play()
      .then(() => {
        pendingPlayRef.current = false;
        console.log(`[VoiceUserAudio] Playing: ${userName}`);
      })
      .catch((err) => {
        if (err.name === 'NotAllowedError') {
          // Chrome mobile — queue it for next user gesture
          pendingPlayRef.current = true;
          console.warn(`[VoiceUserAudio] Autoplay blocked for ${userName}, waiting for gesture`);
        } else {
          console.warn(`[VoiceUserAudio] Play error for ${userName}:`, err);
        }
      });
  }, [isLocal, userName]);

  // Attach stream
  useEffect(() => {
    const el = audioRef.current;
    if (!el || !stream) return undefined;

    el.srcObject = stream;
    if (!isLocal) tryPlay();

    return () => {
      el.srcObject = null;
    };
  }, [stream, isLocal, tryPlay]);

  // Volume / deafen
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted || isDeafened ? 0 : 1;
    }
  }, [muted, isDeafened]);

  // Global gesture listener — resumes any blocked audio
  useEffect(() => {
    if (isLocal) return undefined;

    const handleGesture = () => {
      if (!hasUserGestureRef.current) {
        hasUserGestureRef.current = true;
      }
      if (pendingPlayRef.current) {
        tryPlay();
      }
    };

    // Both touch and click to cover all cases
    document.addEventListener('touchend', handleGesture, { once: false, passive: true });
    document.addEventListener('click', handleGesture, { once: false, passive: true });

    return () => {
      document.removeEventListener('touchend', handleGesture);
      document.removeEventListener('click', handleGesture);
    };
  }, [isLocal, tryPlay]);

  return (
    <Box sx={{ position: 'relative' }}>
      {/*
        KEY FIX: playsInline is required on iOS/Chrome mobile.
        Without it, audio hijacks the media session or fails silently.
      */}
      <audio
        ref={audioRef}
        autoPlay={!isLocal}
        muted={isLocal}
        {...({ playsInline: true } as any)} // ← critical for iOS + Chrome mobile
        style={{ display: 'none' }}
      >
        <track kind="captions" />
      </audio>
    </Box>
  );
}
