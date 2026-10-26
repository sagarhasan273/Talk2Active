import { Box, keyframes, type SxProps } from '@mui/material';
import React from 'react';

// ─── Animations ─────────────────────────────────────────────────────────

const spin = keyframes`
  from { transform: rotate(0deg) translateZ(0); }
  to   { transform: rotate(360deg) translateZ(0); }
`;

const spinReverse = keyframes`
  from { transform: rotate(360deg) translateZ(0); }
  to   { transform: rotate(0deg) translateZ(0); }
`;

// ----------------------------------------------------------------------

export type AccountTier = 'ADMIN' | 'SUPPORTER' | 'SUPPORTER_PLUS' | 'MEMBER' | string;
export type AvatarVariant = 'circular' | 'rounded' | 'square';

export type AvatarWrapperProps = {
  children: React.ReactNode;
  accountType?: AccountTier;
  variant?: AvatarVariant;
  /** Duration of full rotation in seconds (default: 8s for smooth mobile performance) */
  speed?: number;
  showShadow?: boolean;
  sx?: SxProps;
};

export const AvatarWrapper = ({
  children,
  accountType = 'MEMBER',
  variant = 'circular',
  speed = 8,
  showShadow = true,
  sx,
}: AvatarWrapperProps) => {
  const normalizedTier = accountType.toUpperCase();
  const hasAnimatedBorder = normalizedTier !== 'MEMBER';

  let bRadius: string | number = '50%';
  if (variant === 'square') bRadius = 0;
  if (variant === 'rounded') bRadius = '16px';

  // Theme configurations mapped to your exact SVG glow frame specifications
  let ringColors = {
    c1: '#ff3366',
    c2: '#ff758c',
    c3: '#ffeb3b',
    c4: '#ffffff',
    c5: '#ff3366',
    shadowColor: 'rgba(255, 50, 80, 0.8)',
  };

  if (normalizedTier === 'ADMIN') {
    ringColors = {
      c1: '#ff1744',
      c2: '#ff9100',
      c3: '#ffea00',
      c4: '#ffffff',
      c5: '#ff1744',
      shadowColor: 'rgba(255, 23, 68, 0.85)',
    };
  } else if (normalizedTier === 'SUPPORTER_PLUS') {
    ringColors = {
      c1: '#d946ef',
      c2: '#8b5cf6',
      c3: '#06b6d4',
      c4: '#ffffff',
      c5: '#3b82f6',
      shadowColor: 'rgba(217, 70, 239, 0.85)',
    };
  } else if (normalizedTier === 'SUPPORTER') {
    ringColors = {
      c1: '#00f5ff',
      c2: '#a855f7',
      c3: '#06b6d4',
      c4: '#ffffff',
      c5: '#00f5ff',
      shadowColor: 'rgba(0, 245, 255, 0.75)',
    };
  }

  const uniqueId = React.useId();
  const grad1Id = `grad1-${uniqueId}`;
  const grad2Id = `grad2-${uniqueId}`;

  return (
    <Box
      sx={[
        {
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: bRadius,
          isolation: 'isolate',
          ...(hasAnimatedBorder && {
            '& .rotating-ring': {
              position: 'absolute',
              // Use negative inset to push the ring OUTSIDE the avatar, keeping the image large
              // inset: '-14px',
              borderRadius: '50%',
              pointerEvents: 'none',
              zIndex: 10,
              animation: `${spin} ${speed}s linear infinite`,
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
              willChange: 'transform',
              filter: showShadow ? `drop-shadow(0 0 16px ${ringColors.shadowColor})` : 'none',
            },
            '& .rotating-ring-reverse': {
              position: 'absolute',
              inset: '-14px',
              borderRadius: '50%',
              pointerEvents: 'none',
              zIndex: 10,
              animation: `${spinReverse} ${speed * 0.75}s linear infinite`,
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
              willChange: 'transform',
            },
            '@media (prefers-reduced-motion: reduce)': {
              '& .rotating-ring, & .rotating-ring-reverse': { animation: 'none' },
            },
          }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {/* Outer SVG Dual Glow Rings */}
      {hasAnimatedBorder && (
        <div className="rotating-ring">
          <svg
            style={{ width: '100%', height: '100%' }}
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="100"
              cy="100"
              r="92"
              stroke={`url(#${grad1Id})`}
              strokeWidth="3.5"
              strokeDasharray="160 40 80 50"
              strokeLinecap="round"
            />
            <circle
              cx="100"
              cy="100"
              r="85"
              stroke={`url(#${grad2Id})`}
              strokeWidth="2"
              strokeDasharray="220 70"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id={grad1Id} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={ringColors.c1} />
                <stop offset="50%" stopColor={ringColors.c2} />
                <stop offset="100%" stopColor={ringColors.c3} />
              </linearGradient>
              <linearGradient id={grad2Id} x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={ringColors.c4} />
                <stop offset="100%" stopColor={ringColors.c5} />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}


      {children}

    </Box>
  );
};

export default AvatarWrapper;
