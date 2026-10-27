// src/sections/section-voice/voice-room-card/room-list-card-border-wrapper.tsx

import React from 'react';

import { alpha, Box, keyframes, type SxProps, type Theme } from '@mui/material';
import { CARD_HEIGHT, CARD_MAX_WIDTH } from './room-list-constants';

// Transform-only animation => runs on the compositor, no repaint per frame.
const spin = keyframes`
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to   { transform: translate(-50%, -50%) rotate(360deg); }
`;

export type AccountTier = 'ADMIN' | 'SUPPORTER' | 'MEMBER' | string;

export type VoiceRoomCardBorderWrapperProps = {
  children: React.ReactNode;
  accountType?: AccountTier;
  sx?: SxProps;
};

const gradient = (c1: string, c2: string) =>
  `conic-gradient(from 0deg, ${alpha(c1, 0.15)}, ${c1}, ${c2}, ${alpha(c1, 0.15)} 50%, ${c1}, ${c2}, ${alpha(c1, 0.15)})`;

// Static style objects (built once, not on every render).
const baseSx: SxProps<Theme> = {
  width: '100%',
  height: CARD_HEIGHT,
  minHeight: CARD_HEIGHT,
  maxHeight: CARD_HEIGHT,
  maxWidth: { xs: '100%', sm: 1, md: CARD_MAX_WIDTH },
  display: 'flex',
  flexDirection: 'column',
  boxSizing: 'border-box',
  position: 'relative',
  overflow: 'hidden',
  borderRadius: 0.5,
  p: '0px',
  isolation: 'isolate',
  contain: 'layout size style',
  '& > *': {
    height: '100% !important',
    minHeight: '0 !important',
    maxHeight: '100% !important',
    flex: 1,
  },
};

const animatedSx = (bg: string): SxProps<Theme> => ({
  p: '2px',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    // 150% of width always covers the card diagonal (was 200% => ~4MB layer per card)
    width: '150%',
    aspectRatio: '1 / 1',
    zIndex: -1,
    background: bg,
    transform: 'translate(-50%, -50%)',
    willChange: 'transform',
    pointerEvents: 'none',
    animation: `${spin} 4s linear infinite`,
  },
  '@media (prefers-reduced-motion: reduce)': {
    '&::before': { animation: 'none' },
  },
});

const TIER_SX: Record<string, SxProps<Theme>> = {
  ADMIN: animatedSx(gradient('#7C3AED', '#E11D48')),
  SUPPORTER: animatedSx(gradient('#3B82F6', '#F59E0B')),
};

export const VoiceRoomCardBorderWrapper = ({
  children,
  accountType = 'MEMBER',
  sx,
}: VoiceRoomCardBorderWrapperProps) => {
  // accountType can be null from the API (default params only cover undefined)
  const tier = (accountType || 'MEMBER').toUpperCase();

  return (
    <Box sx={[baseSx, TIER_SX[tier] ?? false, ...(Array.isArray(sx) ? sx : [sx])] as SxProps<Theme>}>
      {children}
    </Box>
  );
};

export default VoiceRoomCardBorderWrapper;
