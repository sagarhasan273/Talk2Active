// src/sections/section-voice/voice-room-card/room-list-card-border-wrapper.tsx

import React from 'react';

import { alpha, Box, keyframes, useMediaQuery, useTheme, type SxProps, type Theme } from '@mui/material';
import { CARD_HEIGHT, CARD_MAX_WIDTH } from './room-list-constants';

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

const conicGradient = (c1: string, c2: string) =>
  `conic-gradient(from 0deg, ${alpha(c1, 0.15)}, ${c1}, ${c2}, ${alpha(c1, 0.15)} 50%, ${c1}, ${c2}, ${alpha(c1, 0.15)})`;

const linearGradient = (c1: string, c2: string) =>
  `linear-gradient(135deg, ${c1}, ${c2})`;

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

const mobileSx = (bg: string): SxProps<Theme> => ({
  p: '2px',
  background: bg,
});

const TIER_SX: Record<string, SxProps<Theme>> = {
  ADMIN: animatedSx(conicGradient('#7C3AED', '#E11D48')),
  SUPPORTER: animatedSx(conicGradient('#3B82F6', '#F59E0B')),
};

const TIER_MOBILE_SX: Record<string, SxProps<Theme>> = {
  ADMIN: mobileSx(linearGradient('#7C3AED', '#E11D48')),
  SUPPORTER: mobileSx(linearGradient('#3B82F6', '#F59E0B')),
};

export const VoiceRoomCardBorderWrapper = ({
  children,
  accountType = 'MEMBER',
  sx,
}: VoiceRoomCardBorderWrapperProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const tier = (accountType || 'MEMBER').toUpperCase();
  const tierStyle = isMobile ? TIER_MOBILE_SX[tier] : TIER_SX[tier];

  return (
    <Box sx={[baseSx, tierStyle ?? false, ...(Array.isArray(sx) ? sx : [sx])] as SxProps<Theme>}>
      {children}
    </Box>
  );
};

export default VoiceRoomCardBorderWrapper;
