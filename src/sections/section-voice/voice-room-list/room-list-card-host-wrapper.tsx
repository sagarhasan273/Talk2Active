// src/sections/section-voice/voice-room-card/room-list-card-host-wrapper.tsx

import React from 'react';

import { alpha, Box, keyframes, type SxProps, useMediaQuery, useTheme } from '@mui/material';
import { HOST_STRIP_HEIGHT } from './room-list-constants';

const spin = keyframes`
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to   { transform: translate(-50%, -50%) rotate(360deg); }
`;

// Replaces the old `background-position` animation (repaints every frame) with a
// translateX on a 200%-wide layer: identical look, compositor-only.
const panX = keyframes`
  0%   { transform: translate3d(0, 0, 0); }
  50%  { transform: translate3d(-50%, 0, 0); }
  100% { transform: translate3d(0, 0, 0); }
`;

export type AccountTier = 'ADMIN' | 'SUPPORTER' | 'MEMBER' | string;

export type VoiceRoomHostWrapperProps = {
  children: React.ReactNode;
  accountType?: AccountTier;
  sx?: SxProps;
};

const baseDark = '#181c26';
const baseLight = '#ffffff';

const TIERS: Record<string, { c1: string; c2: string; glow: 'c1' | 'c2' }> = {
  ADMIN: { c1: '#8B5CF6', c2: '#F43F5E', glow: 'c2' },
  SUPPORTER: { c1: '#0EA5E9', c2: '#FBBF24', glow: 'c1' },
};

export const VoiceRoomHostWrapper = ({
  children,
  accountType = 'MEMBER',
  sx,
}: VoiceRoomHostWrapperProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDark = theme.palette.mode === 'dark';

  const tier = (accountType || 'MEMBER').toUpperCase();
  const cfg = TIERS[tier];
  const animated = Boolean(cfg);

  let borderGradient = 'none';
  let mobileBorderGradient = 'none';
  let glowShadow = 'none';
  let panGradient = 'none';
  let staticPanGradient = 'none';

  if (cfg) {
    const { c1, c2 } = cfg;
    borderGradient = `conic-gradient(from 0deg, transparent 0%, ${alpha(c1, 0.2)} 15%, ${c1} 35%, ${c2} 50%, transparent 65%)`;
    mobileBorderGradient = `linear-gradient(135deg, ${c1}, ${c2})`;
    glowShadow = `0 4px 20px -4px ${alpha(cfg[cfg.glow], 0.25)}`;

    const base = isDark ? baseDark : baseLight;
    const pct = isDark ? 12 : 6;
    const mix1 = `color-mix(in srgb, ${c1} ${pct}%, ${base})`;
    const mix2 = `color-mix(in srgb, ${c2} ${pct}%, ${base})`;

    panGradient = `linear-gradient(90deg, ${mix1}, ${mix2}, ${mix1})`;
    staticPanGradient = `linear-gradient(90deg, ${mix1}, ${mix2})`;
  }

  const staticInnerBg = isDark ? alpha('#fff', 0.035) : '#f8fafc';

  return (
    <Box
      sx={[
        {
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 0.75,
          height: HOST_STRIP_HEIGHT,
          minHeight: HOST_STRIP_HEIGHT,
          maxHeight: HOST_STRIP_HEIGHT,
          boxSizing: 'border-box',
          p: animated ? '1.5px' : '0px',
          isolation: 'isolate',
          minWidth: 0,
          flexShrink: 0,
          boxShadow: animated ? glowShadow : 'none',
          background: animated && isMobile ? mobileBorderGradient : 'transparent',
          ...(animated && !isMobile && {
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '130%',
              aspectRatio: '1 / 1',
              zIndex: -1,
              background: borderGradient,
              transform: 'translate(-50%, -50%)',
              willChange: 'transform',
              pointerEvents: 'none',
              animation: `${spin} 3s linear infinite`,
            },
            '@media (prefers-reduced-motion: reduce)': {
              '&::before': { animation: 'none' },
            },
          }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          px: 1,
          borderRadius: 0.5,
          // Use a static gradient for mobile, standard base for desktop animation, or fallback
          background: animated
            ? (isMobile ? staticPanGradient : (isDark ? baseDark : baseLight))
            : staticInnerBg,
          border: animated ? 'none' : '1px solid',
          borderColor: isDark ? alpha('#fff', 0.06) : '#e2e8f0',
          boxSizing: 'border-box',
          minWidth: 0,
          height: '100%',
          width: '100%',
          ...(animated && !isMobile && {
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              width: '200%',
              background: panGradient,
              zIndex: 0,
              pointerEvents: 'none',
              willChange: 'transform',
              animation: `${panX} 5s ease-in-out infinite`,
            },
            '& > *': { position: 'relative', zIndex: 1 },
            '@media (prefers-reduced-motion: reduce)': {
              '&::before': { animation: 'none' },
            },
          }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default VoiceRoomHostWrapper;
