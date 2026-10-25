// src/sections/section-voice/voice-room-card/room-list-card-host-wrapper.tsx

import React from 'react';

import { alpha, Box, keyframes, type SxProps, useTheme } from '@mui/material';

// ─── Animations ─────────────────────────────────────────────────────────

const spin = keyframes`
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to   { transform: translate(-50%, -50%) rotate(360deg); }
`;

const panBackground = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// ----------------------------------------------------------------------

export type AccountTier = 'ADMIN' | 'SUPPORTER' | 'MEMBER' | string;

export type VoiceRoomHostWrapperProps = {
  children: React.ReactNode;
  accountType?: AccountTier;
  sx?: SxProps;
};

export const VoiceRoomHostWrapper = ({
  children,
  accountType = 'MEMBER',
  sx,
}: VoiceRoomHostWrapperProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const normalizedTier = accountType.toUpperCase();

  const hasAnimatedBorder = normalizedTier === 'ADMIN' || normalizedTier === 'SUPPORTER';

  let borderGradient = 'none';
  let glowShadow = 'none';

  const baseDark = '#181c26';
  const baseLight = '#ffffff';
  let innerBg = isDark ? alpha('#fff', 0.035) : '#f8fafc';
  let innerBgConfig = {};

  if (normalizedTier === 'ADMIN') {
    const c1 = '#8B5CF6';
    const c2 = '#F43F5E';

    borderGradient = `conic-gradient(from 0deg, transparent 0%, ${alpha(c1, 0.2)} 15%, ${c1} 35%, ${c2} 50%, transparent 65%)`;
    glowShadow = `0 4px 20px -4px ${alpha(c2, 0.25)}`;

    const mix1 = isDark
      ? `color-mix(in srgb, ${c1} 12%, ${baseDark})`
      : `color-mix(in srgb, ${c1} 6%, ${baseLight})`;
    const mix2 = isDark
      ? `color-mix(in srgb, ${c2} 12%, ${baseDark})`
      : `color-mix(in srgb, ${c2} 6%, ${baseLight})`;
    innerBg = `linear-gradient(90deg, ${mix1}, ${mix2}, ${mix1})`;
    innerBgConfig = {
      backgroundSize: '200% 100%',
      animation: `${panBackground} 5s ease-in-out infinite`,
    };
  } else if (normalizedTier === 'SUPPORTER') {
    const c1 = '#0EA5E9';
    const c2 = '#FBBF24';

    borderGradient = `conic-gradient(from 0deg, transparent 0%, ${alpha(c1, 0.2)} 15%, ${c1} 35%, ${c2} 50%, transparent 65%)`;
    glowShadow = `0 4px 20px -4px ${alpha(c1, 0.25)}`;

    const mix1 = isDark
      ? `color-mix(in srgb, ${c1} 12%, ${baseDark})`
      : `color-mix(in srgb, ${c1} 6%, ${baseLight})`;
    const mix2 = isDark
      ? `color-mix(in srgb, ${c2} 12%, ${baseDark})`
      : `color-mix(in srgb, ${c2} 6%, ${baseLight})`;
    innerBg = `linear-gradient(90deg, ${mix1}, ${mix2}, ${mix1})`;
    innerBgConfig = {
      backgroundSize: '200% 100%',
      animation: `${panBackground} 5s ease-in-out infinite`,
    };
  }

  return (
    <Box
      sx={[
        {
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 0.75,
          height: 54,
          minHeight: 54,
          maxHeight: 54,
          boxSizing: 'border-box',
          p: hasAnimatedBorder ? '1.5px' : '0px',
          isolation: 'isolate',
          minWidth: 0,
          flexShrink: 0,
          boxShadow: hasAnimatedBorder ? glowShadow : 'none',
          ...(hasAnimatedBorder && {
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '300%',
              aspectRatio: '1 / 1',
              zIndex: -1,
              background: borderGradient,
              animation: `${spin} 3s linear infinite`,
            },
            '@media (prefers-reduced-motion: reduce)': {
              '&::before': { animation: 'none', transform: 'translate(-50%, -50%)' },
            },
          }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          px: 1,
          borderRadius: 0.5,
          background: innerBg,
          ...innerBgConfig,
          border: hasAnimatedBorder ? 'none' : '1px solid',
          borderColor: isDark ? alpha('#fff', 0.06) : '#e2e8f0',
          boxSizing: 'border-box',
          minWidth: 0,
          height: '100%',
          width: '100%',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default VoiceRoomHostWrapper;
