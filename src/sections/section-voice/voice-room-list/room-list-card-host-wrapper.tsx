// src/sections/section-voice/voice-room-card/room-list-card-host-wrapper.tsx

import React, { memo } from 'react';

import { Box, keyframes, type SxProps, useTheme } from '@mui/material';

const spin = keyframes`
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to   { transform: translate(-50%, -50%) rotate(360deg); }
`;

const panBackground = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

export type AccountTier = 'ADMIN' | 'SUPPORTER' | 'MEMBER' | string;

export type VoiceRoomHostWrapperProps = {
  children: React.ReactNode;
  accountType?: AccountTier;
  sx?: SxProps;
};

export const VoiceRoomHostWrapper = memo(function VoiceRoomHostWrapper({
  children,
  accountType = 'MEMBER',
  sx,
}: VoiceRoomHostWrapperProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const normalizedTier = accountType.toUpperCase();

  const hasAnimatedBorder = normalizedTier === 'ADMIN' || normalizedTier === 'SUPPORTER';

  let mobileBorderGradient = 'none';
  let desktopBorderGradient = 'none';
  let glowShadow = 'none';

  const baseDark = '#181c26';
  const baseLight = '#ffffff';

  let innerBgStatic: string = isDark ? 'rgba(255,255,255,0.035)' : '#f8fafc';
  let innerBgDesktop: string = innerBgStatic;
  let desktopInnerAnimation = 'none';

  if (normalizedTier === 'ADMIN') {
    const c1 = '#8B5CF6';
    const c2 = '#F43F5E';

    mobileBorderGradient = `linear-gradient(135deg, ${c1}, ${c2} 50%, ${c1})`;
    desktopBorderGradient = `conic-gradient(from 0deg, ${c1}, ${c2}, ${c1})`;
    glowShadow = `0 4px 20px -4px ${c1}40`;

    const mix1 = isDark
      ? `color-mix(in srgb, ${c1} 12%, ${baseDark})`
      : `color-mix(in srgb, ${c1} 6%, ${baseLight})`;
    const mix2 = isDark
      ? `color-mix(in srgb, ${c2} 12%, ${baseDark})`
      : `color-mix(in srgb, ${c2} 6%, ${baseLight})`;

    innerBgStatic = `linear-gradient(90deg, ${mix1}, ${mix2}, ${mix1})`;
    innerBgDesktop = innerBgStatic;
    desktopInnerAnimation = `${panBackground} 6s ease-in-out infinite`;
  } else if (normalizedTier === 'SUPPORTER') {
    const c1 = '#0EA5E9';
    const c2 = '#FBBF24';

    mobileBorderGradient = `linear-gradient(135deg, ${c1}, ${c2} 50%, ${c1})`;
    desktopBorderGradient = `conic-gradient(from 0deg, ${c1}, ${c2}, ${c1})`;
    glowShadow = `0 4px 20px -4px ${c1}40`;

    const mix1 = isDark
      ? `color-mix(in srgb, ${c1} 12%, ${baseDark})`
      : `color-mix(in srgb, ${c1} 6%, ${baseLight})`;
    const mix2 = isDark
      ? `color-mix(in srgb, ${c2} 12%, ${baseDark})`
      : `color-mix(in srgb, ${c2} 6%, ${baseLight})`;

    innerBgStatic = `linear-gradient(90deg, ${mix1}, ${mix2}, ${mix1})`;
    innerBgDesktop = innerBgStatic;
    desktopInnerAnimation = `${panBackground} 6s ease-in-out infinite`;
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
              zIndex: -1,
              backfaceVisibility: 'hidden',

              // ── MOBILE (default) ─────────────────────────────
              // Static border. Explicit `animation: 'none'` +
              // `transform: 'none'` — no rotating GPU layer, no paint churn.
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: mobileBorderGradient,
              animation: 'none',
              animationPlayState: 'running',
              transform: 'none',
              willChange: 'auto',

              // ── DESKTOP (sm+) ────────────────────────────────
              [theme.breakpoints.up('sm')]: {
                top: '50%',
                left: '50%',
                right: 'auto',
                bottom: 'auto',
                width: '300%',
                aspectRatio: '1 / 1',
                background: desktopBorderGradient,
                animation: `${spin} 3s linear infinite`,
                animationPlayState: 'var(--card-anim-play-state, running)',
                transform: 'translate(-50%, -50%)',
                willChange: 'transform',

                '@media (prefers-reduced-motion: reduce)': {
                  animation: 'none',
                },
              },
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
          border: hasAnimatedBorder ? 'none' : '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0',
          boxSizing: 'border-box',
          minWidth: 0,
          height: '100%',
          width: '100%',

          background: innerBgStatic,
          backgroundSize: 'auto',
          animation: 'none',
          animationPlayState: 'running',

          [theme.breakpoints.up('sm')]:
            desktopInnerAnimation !== 'none'
              ? {
                background: innerBgDesktop,
                backgroundSize: '200% 100%',
                animation: desktopInnerAnimation,
                animationPlayState: 'var(--card-anim-play-state, running)',
                '@media (prefers-reduced-motion: reduce)': {
                  animation: 'none',
                  backgroundPosition: '0% 50%',
                },
              }
              : {
                animation: 'none',
              },
        }}
      >
        {children}
      </Box>
    </Box>
  );
});

export default VoiceRoomHostWrapper;
