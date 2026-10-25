import React, { forwardRef } from 'react';

import { alpha, Box, keyframes, type SxProps, useTheme } from '@mui/material';

// ─── Animations ─────────────────────────────────────────────────────────

// Hardware-accelerated circular spin for the outer border
const spin = keyframes`
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to   { transform: translate(-50%, -50%) rotate(360deg); }
`;

// A luxurious, slow breathing effect for the inner ambient light
const breathe = keyframes`
  0%   { opacity: 0.5; transform: scale(1); }
  50%  { opacity: 0.85; transform: scale(1.05); }
  100% { opacity: 0.5; transform: scale(1); }
`;

// ----------------------------------------------------------------------

export type AccountTier = 'ADMIN' | 'SUPPORTER' | 'MEMBER' | string;

export type UserDisplayerWrapperProps = {
  children: React.ReactNode;
  accountType?: AccountTier;
  sx?: SxProps;
  onClick?: (e: React.MouseEvent) => void;
  [key: string]: any;
};

export const UserDisplayerWrapper = forwardRef<HTMLDivElement, UserDisplayerWrapperProps>(
  ({ children, accountType = 'MEMBER', sx, onClick, ...rest }, ref) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const normalizedTier = accountType.toUpperCase();

    const hasAnimatedBorder = normalizedTier === 'ADMIN' || normalizedTier === 'SUPPORTER';

    let borderGradient = 'none';
    let glowShadow = 'none';
    let ambientLights = 'none';

    // The base background of the modal
    const surfaceColor = isDark ? '#141720' : '#ffffff';

    if (normalizedTier === 'ADMIN') {
      // Admin Colors (Crimson Red & Luminous Gold for high contrast)
      const c1 = '#ff1744'; // Red
      const c2 = '#ffb300'; // Gold

      // High-contrast stops make the spinning motion very obvious and premium
      borderGradient = `conic-gradient(${c1} 0%, ${c2} 25%, ${c1} 50%, ${c2} 75%, ${c1} 100%)`;
      glowShadow = `0 8px 32px -4px ${alpha(c1, 0.45)}`;

      // Dual-tone diagonal spotlights (Top Right & Bottom Left)
      ambientLights = `
        radial-gradient(circle at 100% 0%, ${alpha(c2, isDark ? 0.15 : 0.08)} 0%, transparent 60%),
        radial-gradient(circle at 0% 100%, ${alpha(c1, isDark ? 0.12 : 0.06)} 0%, transparent 60%)
      `;

    } else if (normalizedTier === 'SUPPORTER') {
      // Supporter Colors (Cyan & Purple)
      const c1 = '#00f5ff';
      const c2 = '#a855f7';

      // High-contrast stops for the spin
      borderGradient = `conic-gradient(${c1} 0%, ${c2} 25%, ${c1} 50%, ${c2} 75%, ${c1} 100%)`;
      glowShadow = `0 8px 32px -4px ${alpha(c1, 0.4)}`;

      // Dual-tone diagonal spotlights
      ambientLights = `
        radial-gradient(circle at 100% 0%, ${alpha(c1, isDark ? 0.15 : 0.08)} 0%, transparent 60%),
        radial-gradient(circle at 0% 100%, ${alpha(c2, isDark ? 0.12 : 0.06)} 0%, transparent 60%)
      `;
    }

    // Base structural shadow for the modal
    const baseShadow = isDark
      ? '0 24px 64px -12px rgba(0, 0, 0, 0.85)'
      : '0 20px 48px -12px rgba(15, 23, 42, 0.18)';

    return (
      <Box
        ref={ref}
        onClick={(e) => {
          e.stopPropagation();
          if (onClick) onClick(e);
        }}
        {...rest}
        sx={[
          {
            outline: 'none',
            position: 'relative',
            width: '100%',
            maxWidth: { xs: 360, sm: 580 },
            borderRadius: 1, // Slightly softer outer corners
            overflow: 'hidden',
            isolation: 'isolate',
            // Thickness of the spinning border
            p: hasAnimatedBorder ? '2.5px' : '0px',
            // Combine heavy drop shadow with the glowing tier color
            boxShadow: hasAnimatedBorder ? `${glowShadow}, ${baseShadow}` : baseShadow,
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
                animation: `${spin} 3.5s linear infinite`,
              },
              '@media (prefers-reduced-motion: reduce)': {
                '&::before': { animation: 'none', transform: 'translate(-50%, -50%)' },
              },
            }),
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {/* INNER CONTENT BOX */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            borderRadius: 0.75, // Inner radius
            bgcolor: surfaceColor,
            border: hasAnimatedBorder ? 'none' : '1px solid',
            borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
            overflow: 'hidden',
            zIndex: 1,
            // The premium ambient light effect
            ...(hasAnimatedBorder && {
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: 0,
                zIndex: -1, // Sits behind the text and avatars, but above the solid background
                pointerEvents: 'none',
                background: ambientLights,
                animation: `${breathe} 6s ease-in-out infinite`,
              }
            })
          }}
        >
          {children}
        </Box>
      </Box>
    );
  }
);

UserDisplayerWrapper.displayName = 'UserDisplayerWrapper';

export default UserDisplayerWrapper;
