import React from 'react';
import { Mic, Crown, MicOff } from 'lucide-react';

import { Box, alpha, Typography } from '@mui/material';

import { WaveformIndicator } from './room-audio-waveform-indicator';
import { slate, accent, badgeBounce, speakingGlow } from './theme-tokens';

import type { StageParticipant } from './types';

const pillStyles = {
  unmuted: { color: accent.emerald, bgcolor: alpha(accent.emerald, 0.1) },
  muted: { color: slate[400], bgcolor: slate[800] },
  listening: { color: slate[400], bgcolor: slate[800] },
} as const;

const PILL_LABEL: Record<'unmuted' | 'muted' | 'listening', string> = {
  unmuted: 'Mic On',
  muted: 'Muted',
  listening: 'Listening',
};

type ParticipantTileProps = {
  participant: StageParticipant;
};

export const ParticipantTile = ({ participant }: ParticipantTileProps) => {
  const { name, avatarUrl, level, audioState, isHost, isSelf, handRaised } = participant;
  const isSpeaking = audioState === 'speaking';
  const dimmed = (audioState === 'muted' || audioState === 'listening') && !handRaised;

  const subtitle = isSpeaking && isHost ? 'Host • Speaking...' : handRaised ? 'Hand Raised' : level;

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        borderRadius: 3,
        bgcolor: slate[950],
        border: '1px solid',
        borderColor: isSpeaking
          ? alpha(accent.brand, 0.6)
          : handRaised
            ? alpha(accent.amber, 0.4)
            : slate[800],
        boxShadow: isSpeaking ? `0 10px 25px ${alpha(accent.brand, 0.1)}` : 'none',
        opacity: dimmed ? 0.85 : 1,
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <Box
          component="img"
          src={avatarUrl}
          alt={name}
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            objectFit: 'cover',
            boxSizing: 'content-box',
            border: '4px solid',
            borderColor: isSpeaking ? accent.brand : handRaised ? accent.amber : slate[800],
            ...(isSpeaking && {
              animation: `${speakingGlow} 1.6s infinite`,
              '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
            }),
          }}
        />

        {isHost && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              display: 'flex',
              p: 0.5,
              borderRadius: '50%',
              bgcolor: alpha(accent.brand, 0.9),
              color: '#fff',
              boxShadow: 1,
            }}
            title="Host"
          >
            <Crown size={14} />
          </Box>
        )}

        {handRaised ? (
          <Box
            sx={{
              position: 'absolute',
              top: -8,
              right: -8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 24,
              height: 24,
              borderRadius: '50%',
              bgcolor: accent.amber,
              color: slate[950],
              fontSize: 13,
              fontWeight: 700,
              boxShadow: 1,
              animation: `${badgeBounce} 1s infinite`,
              '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
            }}
            title="Wants to speak"
          >
            ✋
          </Box>
        ) : (
          audioState === 'muted' && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                display: 'flex',
                p: 0.5,
                borderRadius: '50%',
                bgcolor: slate[800],
                color: accent.rose,
                border: `1px solid ${slate[700]}`,
              }}
            >
              <MicOff size={14} />
            </Box>
          )
        )}
      </Box>

      <Typography
        variant="body2"
        fontWeight={600}
        noWrap
        sx={{ color: slate[100], mt: 1.5, maxWidth: '100%' }}
      >
        {name}
        {isSelf && ' (You)'}
      </Typography>

      <Typography
        variant="caption"
        noWrap
        sx={{
          fontSize: 10,
          fontWeight: handRaised ? 600 : 400,
          color: handRaised ? accent.amber : slate[400],
        }}
      >
        {subtitle}
      </Typography>

      {audioState === 'speaking' ? (
        <WaveformIndicator />
      ) : (
        <Box
          sx={{
            mt: 1,
            px: 1,
            py: 0.25,
            borderRadius: 5,
            fontSize: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            ...pillStyles[audioState],
          }}
        >
          {audioState === 'unmuted' && <Mic size={11} />}
          {PILL_LABEL[audioState]}
        </Box>
      )}
    </Box>
  );
};
