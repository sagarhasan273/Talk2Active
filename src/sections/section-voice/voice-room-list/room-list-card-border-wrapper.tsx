import React from 'react';

import { alpha, Box, keyframes, type SxProps } from '@mui/material';

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

export const VoiceRoomCardBorderWrapper = ({
  children,
  accountType = 'MEMBER',
  sx,
}: VoiceRoomCardBorderWrapperProps) => {
  const normalizedTier = accountType.toUpperCase();
  const hasAnimatedBorder = normalizedTier === 'ADMIN' || normalizedTier === 'SUPPORTER';

  let borderGradient = 'none';

  if (normalizedTier === 'ADMIN') {
    // Admin: Royal Purple & Crimson Red
    const c1 = '#7C3AED';
    const c2 = '#E11D48';
    borderGradient = `conic-gradient(from 0deg, ${alpha(c1, 0.15)}, ${c1}, ${c2}, ${alpha(c1, 0.15)} 50%, ${c1}, ${c2}, ${alpha(c1, 0.15)})`;
  } else if (normalizedTier === 'SUPPORTER') {
    // Supporter: Royal Blue & Premium Gold
    const c1 = '#3B82F6';
    const c2 = '#F59E0B';
    borderGradient = `conic-gradient(from 0deg, ${alpha(c1, 0.15)}, ${c1}, ${c2}, ${alpha(c1, 0.15)} 50%, ${c1}, ${c2}, ${alpha(c1, 0.15)})`;
  }

  return (
    <Box
      sx={[
        {
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 0.5,
          p: hasAnimatedBorder ? '2px' : '0px',
          isolation: 'isolate',
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
              animation: `${spin} 4s linear infinite`,
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
};

export default VoiceRoomCardBorderWrapper;
