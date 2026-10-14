// src/sections/section-voice/voice-room-header/room-header-participant-avatar-stack.tsx

import { alpha, Box, Stack, Typography, useTheme } from '@mui/material';

import { ParticipantAvatar } from './room-header-participant-avatar';
import { getParticipantId, isParticipantSpeaking } from './utils';

import { RoomParticipantType } from '@/types/type-room';

// ----------------------------------------------------------------------
// Participant Avatar Stack
// ----------------------------------------------------------------------

export function ParticipantAvatarStack({ participants }: { participants: RoomParticipantType[] }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const visibleParticipants = participants.slice(0, 4);

  return (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        pl: 0.5,
        '& > *:not(:first-of-type)': {
          ml: -1,
        },
      }}
    >
      {visibleParticipants.map((participant) => (
        <ParticipantAvatar
          key={getParticipantId(participant) || Math.random()}
          participant={participant}
          size={32}
          speaking={isParticipantSpeaking(participant)}
        />
      ))}

      {participants.length > 4 && (
        <Box
          sx={{
            width: 32,
            height: 32,
            ml: -1,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: isDark ? alpha('#fff', 0.08) : '#f1f5f9',
            border: `2px solid ${isDark ? '#181c26' : '#ffffff'}`,
            zIndex: 5,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontSize: 11,
              fontWeight: 700,
              color: isDark ? 'text.secondary' : '#475569',
            }}
          >
            +{participants.length - 4}
          </Typography>
        </Box>
      )}
    </Stack>
  );
}
