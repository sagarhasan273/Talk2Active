// src/sections/section-voice/voice-room-card/room-list-card-border-wrapper.tsx

import React, { memo } from 'react';

import { alpha, Box, keyframes, useTheme, type SxProps } from '@mui/material';

// ─── Animations ─────────────────────────────────────────────────────────

const spin = keyframes`
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to   { transform: translate(-50%, -50%) rotate(360deg); }
`;

// ----------------------------------------------------------------------

export type AccountTier = 'ADMIN' | 'SUPPORTER' | 'MEMBER' | string;

export type VoiceRoomCardBorderWrapperProps = {
  children: React.ReactNode;
  accountType?: AccountTier;
  sx?: SxProps;
};

export const VoiceRoomCardBorderWrapper = memo(function VoiceRoomCardBorderWrapper({
  children,
  accountType = 'MEMBER',
  sx,
}: VoiceRoomCardBorderWrapperProps) {
  const theme = useTheme();

  const normalizedTier = accountType.toUpperCase();
  const hasAnimatedBorder = normalizedTier === 'ADMIN' || normalizedTier === 'SUPPORTER';

  let mobileGradient = 'none';
  let desktopGradient = 'none';

  if (normalizedTier === 'ADMIN') {
    const c1 = '#7C3AED';
    const c2 = '#E11D48';
    mobileGradient = `linear-gradient(135deg, ${c1}, ${c2} 50%, ${c1})`;
    desktopGradient = `conic-gradient(from 0deg, ${alpha(c1, 0.15)}, ${c1}, ${c2}, ${alpha(c1, 0.15)} 50%, ${c1}, ${c2}, ${alpha(c1, 0.15)})`;
  } else if (normalizedTier === 'SUPPORTER') {
    const c1 = '#3B82F6';
    const c2 = '#F59E0B';
    mobileGradient = `linear-gradient(135deg, ${c1}, ${c2} 50%, ${c1})`;
    desktopGradient = `conic-gradient(from 0deg, ${alpha(c1, 0.15)}, ${c1}, ${c2}, ${alpha(c1, 0.15)} 50%, ${c1}, ${c2}, ${alpha(c1, 0.15)})`;
  }

  return (
    <Box
      sx={[
        {
          width: '100%',
          height: 296,
          minHeight: 296,
          maxHeight: 296,
          maxWidth: { xs: '100%', sm: 1, md: 520 },
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 0.5,
          p: hasAnimatedBorder ? '2px' : '0px',
          isolation: 'isolate',
          contain: 'layout size style',
          '& > *': {
            height: '100% !important',
            minHeight: '0 !important',
            maxHeight: '100% !important',
            flex: 1,
          },
          ...(hasAnimatedBorder && {
            '&::before': {
              content: '""',
              position: 'absolute',
              zIndex: -1,
              backfaceVisibility: 'hidden',

              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: mobileGradient,

              [theme.breakpoints.up('sm')]: {
                top: '50%',
                left: '50%',
                right: 'auto',
                bottom: 'auto',
                width: '200%',
                aspectRatio: '1 / 1',
                background: desktopGradient,
                animation: `${spin} 4s linear infinite`,
                animationPlayState: 'var(--card-anim-play-state, running)',
                willChange: 'transform',

                // Only desktop can actually freeze a running spin
                '@media (prefers-reduced-motion: reduce)': {
                  animation: 'none',
                  transform: 'translate(-50%, -50%)',
                },
              },
            },
          }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  );
});

export default VoiceRoomCardBorderWrapper;
