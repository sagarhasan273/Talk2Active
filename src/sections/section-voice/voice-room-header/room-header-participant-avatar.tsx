import React from 'react';

import { Box, Avatar, useTheme } from '@mui/material';

import { getParticipantName, getParticipantAvatar } from './utils';

import type { VoiceParticipant } from './types';

// ----------------------------------------------------------------------
// Participant Avatar
//
// The green ring + dot animate in when the participant starts speaking,
// rather than just appearing, so the state change is easy to notice.
// ----------------------------------------------------------------------

export function ParticipantAvatar({
  participant,
  size = 30,
  speaking = false,
}: {
  participant: VoiceParticipant;
  size?: number;
  speaking?: boolean;
}) {
  const theme = useTheme();

  const name = getParticipantName(participant);
  const avatar = getParticipantAvatar(participant);

  return (
    <Box
      sx={{
        position: 'relative',
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
      <Avatar
        src={avatar || undefined}
        alt={name}
        sx={{
          width: size,
          height: size,
          fontSize: size * 0.42,
          fontWeight: 700,

          border: `2px solid ${theme.palette.background.paper}`,
          transition: theme.transitions.create(['box-shadow'], { duration: 200 }),

          ...(speaking && {
            boxShadow: `0 0 0 2px ${theme.palette.success.main}`,
          }),
        }}
      >
        {name.charAt(0).toUpperCase()}
      </Avatar>

      {speaking && (
        <Box
          sx={{
            position: 'absolute',
            right: -1,
            bottom: -1,
            width: Math.max(8, size * 0.28),
            height: Math.max(8, size * 0.28),
            borderRadius: '50%',
            bgcolor: 'success.main',
            border: `2px solid ${theme.palette.background.paper}`,
            animation: 'voiceSpeakingDotIn 0.2s ease-out',

            '@keyframes voiceSpeakingDotIn': {
              from: { transform: 'scale(0)' },
              to: { transform: 'scale(1)' },
            },

            '@media (prefers-reduced-motion: reduce)': {
              animation: 'none',
            },
          }}
        />
      )}
    </Box>
  );
}
