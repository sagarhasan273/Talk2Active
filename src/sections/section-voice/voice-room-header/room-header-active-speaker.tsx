import React from 'react';
import { MicIcon } from 'lucide-react';

import { Box, Stack, alpha, useTheme, Typography } from '@mui/material';

import { getParticipantName } from './utils';
import { ParticipantAvatar } from './room-header-participant-avatar';

import type { VoiceParticipant } from './types';

// ----------------------------------------------------------------------
// Active Speaker
// ----------------------------------------------------------------------

export function ActiveSpeaker({
  speaker,
  mobile = false,
}: {
  speaker?: VoiceParticipant | null;
  mobile?: boolean;
}) {
  const theme = useTheme();

  if (!speaker) {
    return (
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.75}
        sx={{
          minWidth: 0,
          maxWidth: mobile ? 120 : 190,
        }}
      >
        <Box
          sx={{
            width: mobile ? 26 : 30,
            height: mobile ? 26 : 30,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(theme.palette.text.primary, 0.06),
            color: 'text.disabled',
            flexShrink: 0,
          }}
        >
          <MicIcon size={14} />
        </Box>

        <Typography
          variant="caption"
          noWrap
          sx={{
            color: 'text.secondary',
            fontWeight: 600,
          }}
        >
          No one speaking
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.75}
      sx={{
        minWidth: 0,
        maxWidth: mobile ? 140 : 210,
      }}
    >
      <Box sx={{ position: 'relative', flexShrink: 0 }}>
        <ParticipantAvatar participant={speaker} size={mobile ? 26 : 30} speaking />

        <Box
          sx={{
            position: 'absolute',
            inset: -3,
            borderRadius: '50%',
            border: `1px solid ${alpha(theme.palette.success.main, 0.5)}`,
            animation: 'voiceSpeakerPulse 1.2s ease-in-out infinite',

            '@keyframes voiceSpeakerPulse': {
              '0%, 100%': {
                transform: 'scale(1)',
                opacity: 0.45,
              },
              '50%': {
                transform: 'scale(1.12)',
                opacity: 0,
              },
            },

            '@media (prefers-reduced-motion: reduce)': {
              animation: 'none',
            },
          }}
        />
      </Box>

      <Box
        sx={{
          minWidth: 0,
          animation: 'voiceSpeakerLabelIn 0.2s ease-out',

          '@keyframes voiceSpeakerLabelIn': {
            from: { opacity: 0, transform: 'translateX(-3px)' },
            to: { opacity: 1, transform: 'translateX(0)' },
          },

          '@media (prefers-reduced-motion: reduce)': {
            animation: 'none',
          },
        }}
      >
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            fontSize: 9,
            lineHeight: 1,
            color: 'success.main',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: 0.4,
            mb: 0.25,
          }}
        >
          Speaking
        </Typography>

        <Typography
          variant="caption"
          noWrap
          sx={{
            display: 'block',
            color: 'text.primary',
            fontWeight: 700,
          }}
        >
          {getParticipantName(speaker)}
        </Typography>
      </Box>
    </Stack>
  );
}
