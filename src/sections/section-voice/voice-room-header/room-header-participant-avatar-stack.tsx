// src/sections/section-voice/voice-room-header/room-header-participant-avatar-stack.tsx

import { useParticipants } from '@livekit/components-react';
import { alpha, Box, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';

import { ParticipantAvatar } from './room-header-participant-avatar';

// ----------------------------------------------------------------------

// Responsive presets: smaller + fewer avatars on phones, bigger on desktop.
const PRESETS = {
  mobile: { size: 28, max: 5 },
  tablet: { size: 32, max: 4 },
  desktop: { size: 38, max: 5 },
} as const;

type Props = {
  /** Colour behind the stack (for the overlap cut-out). */
  surface?: string;
};

export function ParticipantAvatarStack({ surface }: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const { size, max } = isMobile ? PRESETS.mobile : isTablet ? PRESETS.tablet : PRESETS.desktop;
  const cutout = surface ?? (isDark ? '#181c26' : '#ffffff');

  const participants = useParticipants();
  const overflow = participants.length - max;
  // Reserve one slot for the "+N" chip so the total width stays constant
  const visible = overflow > 0 ? participants.slice(0, max - 1) : participants;
  const hiddenCount = participants.length - visible.length;

  return (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        pl: 0.5,
        '& > *:not(:first-of-type)': { ml: `-${Math.round(size * 0.3)}px` },
      }}
    >
      {visible.map((participant) => (
        <ParticipantAvatar
          key={participant.sid || participant.identity}
          participant={participant}
          size={size}
          surface={cutout}
        />
      ))}

      {hiddenCount > 0 && (
        <Box
          sx={{
            width: size,
            height: size,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            bgcolor: isDark ? alpha('#fff', 0.1) : alpha(theme.palette.primary.main, 0.1),
            border: `2px solid ${cutout}`,
            zIndex: 0,
          }}
        >
          <Typography
            sx={{
              fontSize: size * 0.34,
              fontWeight: 800,
              lineHeight: 1,
              color: isDark ? 'text.secondary' : 'primary.dark',
            }}
          >
            +{hiddenCount}
          </Typography>
        </Box>
      )}
    </Stack>
  );
}
