import React from 'react';

import { Box, Stack, Typography } from '@mui/material';

import { getParticipantId, isParticipantSpeaking } from './Utils';
import { ParticipantAvatar } from './active-bar-participant-avatar';

import type { VoiceParticipant } from './Types';

// ----------------------------------------------------------------------
// Participant Avatar Stack
// ----------------------------------------------------------------------

export function ParticipantAvatarStack({ participants }: { participants: VoiceParticipant[] }) {
  const visibleParticipants = participants.slice(0, 4);

  return (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        pl: 0.5,

        '& > *:not(:first-of-type)': {
          ml: -1.1,
        },
      }}
    >
      {visibleParticipants.map((participant) => (
        <ParticipantAvatar
          key={getParticipantId(participant) || Math.random()}
          participant={participant}
          size={30}
          speaking={isParticipantSpeaking(participant)}
        />
      ))}

      {participants.length > 4 && (
        <Box
          sx={{
            width: 30,
            height: 30,
            ml: -1.1,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
            border: '2px solid',
            borderColor: 'background.paper',
            zIndex: 5,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontSize: 10,
              fontWeight: 800,
              color: 'text.secondary',
            }}
          >
            +{participants.length - 4}
          </Typography>
        </Box>
      )}
    </Stack>
  );
}
