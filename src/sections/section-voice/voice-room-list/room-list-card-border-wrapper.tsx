// src/sections/section-voice/voice-room-card/room-list-card-border-wrapper.tsx

import React, { memo } from 'react';

import { Box, keyframes, type SxProps } from '@mui/material';

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
  const normalizedTier = accountType.toUpperCase();
  const hasAnimatedBorder = normalizedTier === 'ADMIN' || normalizedTier === 'SUPPORTER';

  let borderGradient = 'none';

  if (normalizedTier === 'ADMIN') {
    const c1 = '#f07e3c';
    const c2 = '#E11D48';
    const c3 = '#1da3e1';
    borderGradient = `conic-gradient(from 0deg, ${c1}, ${c2}, ${c3})`;
  } else if (normalizedTier === 'SUPPORTER') {
    const c1 = '#3B82F6';
    const c2 = '#F59E0B';
    borderGradient = `conic-gradient(from 0deg, ${c1}, ${c2}, ${c1})`;
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
              top: '50%',
              left: '50%',
              width: '200%',
              aspectRatio: '1 / 1',
              zIndex: -1,
              background: borderGradient,
              animation: `${spin} 2s linear infinite`,
              // ← Pause during fast scroll via inherited CSS variable.
              // Set on the scroll container by RoomlistMain; falls back to
              // "running" everywhere else.
              animationPlayState: 'var(--card-anim-play-state, running)',
              willChange: 'transform',
              backfaceVisibility: 'hidden',
            },
            '@media (prefers-reduced-motion: reduce)': {
              '&::before': { animation: 'none', transform: 'translate(-50%, -50%)' },
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
