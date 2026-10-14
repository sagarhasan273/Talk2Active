// src/sections/section-voice/voice-room-header/room-header-active-speaker.tsx

import { MicIcon } from 'lucide-react';

import { Box, Stack, Typography, alpha, useTheme } from '@mui/material';

import { RoomParticipantType } from '@/types/type-room';
import { ParticipantAvatar } from './room-header-participant-avatar';
import { getParticipantName } from './utils';

// ----------------------------------------------------------------------
// Active Speaker
// ----------------------------------------------------------------------

export function ActiveSpeaker({
  speaker,
  mobile = false,
}: {
  speaker?: RoomParticipantType | null;
  mobile?: boolean;
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (!speaker) {
    return (
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
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
            bgcolor: isDark ? alpha('#fff', 0.04) : '#f8fafc',
            border: '1px dashed',
            borderColor: isDark ? alpha('#fff', 0.15) : '#cbd5e1',
            color: isDark ? 'text.disabled' : '#94a3b8',
            flexShrink: 0,
          }}
        >
          <MicIcon size={13} />
        </Box>

        <Typography
          variant="caption"
          noWrap
          sx={{
            color: isDark ? 'text.secondary' : '#64748b',
            fontWeight: 600,
          }}
        >
          Stage quiet
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
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
            border: `1.5px solid ${alpha(theme.palette.success.main, 0.55)}`,
            animation: 'voiceSpeakerPulse 1.4s ease-in-out infinite',

            '@keyframes voiceSpeakerPulse': {
              '0%, 100%': {
                transform: 'scale(1)',
                opacity: 0.5,
              },
              '50%': {
                transform: 'scale(1.14)',
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
            letterSpacing: 0.5,
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
            color: isDark ? 'text.primary' : '#0f172a',
            fontWeight: 700,
          }}
        >
          {getParticipantName(speaker)}
        </Typography>
      </Box>
    </Stack>
  );
}
