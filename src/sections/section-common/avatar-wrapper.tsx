import React from 'react';

import { alpha, Box, keyframes, type SxProps } from '@mui/material';

// ─── Animations ─────────────────────────────────────────────────────────

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

// ----------------------------------------------------------------------

export type AccountTier = 'ADMIN' | 'SUPPORTER' | 'MEMBER' | string;
export type AvatarVariant = 'circular' | 'rounded' | 'square';

export type AvatarWrapperProps = {
  children: React.ReactNode;
  accountType?: AccountTier;
  variant?: AvatarVariant;
  /** Thickness of the spinning gradient border */
  borderThickness?: number | string;
  /** Space between the spinning border and the avatar */
  innerGap?: number | string;
  showShadow?: boolean; // <-- Added new prop
  sx?: SxProps;
};

export const AvatarWrapper = ({
  children,
  accountType = 'MEMBER',
  variant = 'circular',
  borderThickness = 0.2,
  showShadow = true, // <-- Default to true to keep it glowing everywhere else
  sx,
}: AvatarWrapperProps) => {
  const normalizedTier = accountType.toUpperCase();

  const hasAnimatedBorder = normalizedTier === 'ADMIN' || normalizedTier === 'SUPPORTER';

  let bRadius: string | number = '50%';
  if (variant === 'square') bRadius = 0;
  if (variant === 'rounded') bRadius = 1.25;

  let borderGradient = 'none';
  let glowShadow = 'none';

  if (normalizedTier === 'ADMIN') {
    const c1 = '#ff1744';
    const c2 = '#ffb300';

    borderGradient = `conic-gradient(${c1} 0%, ${c2} 25%, ${c1} 50%, ${c2} 75%, ${c1} 100%)`;
    glowShadow = `0 8px 32px -4px ${alpha(c1, 0.45)}`;

  } else if (normalizedTier === 'SUPPORTER') {
    borderGradient = 'conic-gradient(#00f5ff 0%, #a855f7 18%, #06b6d4 35%, #f0abfc 50%, #00f5ff 68%, #e879f9 82%, #00f5ff 100%)';
    glowShadow = `0 0 14px ${alpha('#00f5ff', 0.65)}`;
  }

  return (
    <Box
      sx={[
        {
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: bRadius,
          overflow: 'hidden',
          p: hasAnimatedBorder ? borderThickness : 0,
          isolation: 'isolate',
          boxShadow: hasAnimatedBorder && showShadow ? glowShadow : 'none',
          ...(hasAnimatedBorder && {
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              zIndex: -1,
              background: borderGradient,
              animation: `${spin} 2.5s linear infinite`,
            },
            '@media (prefers-reduced-motion: reduce)': {
              '&::before': { animation: 'none' },
            },
          }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  );
};

export default AvatarWrapper;
