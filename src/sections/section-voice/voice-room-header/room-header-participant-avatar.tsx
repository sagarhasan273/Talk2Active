// src/sections/section-voice/voice-room-header/room-header-participant-avatar.tsx

import { Avatar, Box, useTheme } from '@mui/material';

import { RoomParticipantType } from '@/types/type-room';
import { getParticipantAvatar, getParticipantName } from './utils';

// ----------------------------------------------------------------------
// Participant Avatar
// ----------------------------------------------------------------------

export function ParticipantAvatar({
  participant,
  size = 30,
  speaking = false,
}: {
  participant: RoomParticipantType;
  size?: number;
  speaking?: boolean;
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

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
          fontSize: size * 0.4,
          fontWeight: 700,
          bgcolor: isDark ? '#252b3b' : '#f1f5f9',
          color: isDark ? '#ffffff' : '#0f172a',
          border: `2px solid ${isDark ? '#181c26' : '#ffffff'}`,
          transition: theme.transitions.create(['box-shadow', 'transform'], { duration: 200 }),

          ...(speaking && {
            boxShadow: `0 0 0 1.5px ${theme.palette.success.main}`,
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
            width: Math.max(9, size * 0.3),
            height: Math.max(9, size * 0.3),
            borderRadius: '50%',
            bgcolor: 'success.main',
            border: `2px solid ${isDark ? '#181c26' : '#ffffff'}`,
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
