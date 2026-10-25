import { AccountTypeEnum } from '@/enums/enum-user';
import { UserType } from '@/types/type-user';
import { Avatar } from '@mui/material';
import { keyframes, styled } from '@mui/material/styles';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAvatarText(fullName: string): string {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 2) return parts[0].charAt(0).toUpperCase() + parts[1].charAt(0).toUpperCase();
  return fullName.substring(0, 2).toUpperCase();
}

// ─── Animations ───────────────────────────────────────────────────────────────

const spinCW = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

const spinCCW = keyframes`
  from { transform: rotate(360deg); }
  to   { transform: rotate(0deg); }
`;

// ─── Types ────────────────────────────────────────────────────────────────────

type AccountType = UserType['accountType'];
type SpinDirection = 'clockwise' | 'counter-clockwise';

// ─── Role Config (no innerBorder — comes from props) ──────────────────────────

const roleConfig = {
  ADMIN: {
    ring: 'conic-gradient(#ff0000 0%, #ff4500 18%, #cc0000 35%, #ff0000 50%, #ff2200 68%, #991100 82%, #ff0000 100%)',
    shadow:
      'conic-gradient(rgba(255,0,0,.95), rgba(255,69,0,.9), rgba(248, 128, 128, 0.85), rgba(253, 111, 111, 0.95), rgba(255,34,0,.9), rgba(153,17,0,.8), rgba(255,0,0,.95))',
    maskBg: '#180000',
    avatarBg: 'linear-gradient(135deg, #3d0000, #180000)',
    avatarColor: '#ff5555',
  },
  SUPPORTER: {
    ring: `conic-gradient(
    #00f5ff 0%, #a855f7 18%, #06b6d4 35%,
    #f0abfc 50%, #00f5ff 68%, #e879f9 82%, #00f5ff 100%
  )`,
    shadow: `conic-gradient(
    rgba(0,245,255,.85), rgba(168,85,247,.8),
    rgba(6,182,212,.85), rgba(240,171,252,.75),
    rgba(0,245,255,.85), rgba(232,121,249,.8),
    rgba(0,245,255,.85)
  )`,
    maskBg: '#03141a',
    avatarBg: 'linear-gradient(135deg, #0e3a44, #03141a)',
    avatarColor: '#06b6d4',
  },
  MEMBER: {
    ring: '',
    shadow: '',
    maskBg: 'transparent',
    avatarBg: 'none',
    avatarColor: 'inherit',
  },
};

// ─── Default inner borders per role (used as fallback when prop not provided) ──
const defaultInnerBorderWidth: Partial<Record<AccountType, number>> = {
  ADMIN: 2.5,
  SUPPORTER: 2,
  MEMBER: 0,
};

const defaultInnerBorderStyle: Partial<Record<AccountType, string>> = {
  ADMIN: 'solid',
  SUPPORTER: 'dashed',
  MEMBER: 'dashed',
};

const defaultInnerBorderColor: Partial<Record<AccountType, string>> = {
  ADMIN: 'rgba(255, 255, 255, 0.85)',
  SUPPORTER: 'rgba(165, 243, 252, 0.7)',
  MEMBER: 'transparent',
};

// ─── Arc Gradient Helper ──────────────────────────────────────────────────────

function buildPartialRing(fullGradient: string, borderLength: number): string {
  if (borderLength >= 100) return fullGradient;
  const colors = fullGradient.match(/#[0-9a-f]+|rgba?\([^)]+\)/gi) ?? ['#fff', '#fff'];
  const half = borderLength / 2;
  const start = 50 - half;
  const end = 50 + half;
  const mid = colors[Math.floor(colors.length / 2)] ?? colors[0];
  return `conic-gradient(
    transparent 0%,
    transparent ${start}%,
    ${colors[0]} ${start + 1}%,
    ${mid} ${end - 1}%,
    transparent ${end}%,
    transparent 100%
  )`;
}

// ─── Styled Components ────────────────────────────────────────────────────────
import React from 'react';

import { alpha, Box, type SxProps } from '@mui/material';

// ─── Animations ─────────────────────────────────────────────────────────

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

// ----------------------------------------------------------------------

type AccountTier = 'ADMIN' | 'SUPPORTER' | 'MEMBER' | string;
type AvatarVariant = 'circular' | 'rounded' | 'square';

type AvatarWrapperProps = {
  children: React.ReactNode;
  accountType?: AccountTier;
  variant?: AvatarVariant;
  /** Thickness of the spinning gradient border */
  borderThickness?: number | string;
  /** Space between the spinning border and the avatar */
  innerGap?: number | string;
  sx?: SxProps;
};

const AvatarWrapper = ({
  children,
  accountType = 'MEMBER',
  variant = 'circular',
  borderThickness = 0.2,
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
    // Exact colors from your AvatarUser SUPPORTER config
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
          overflow: 'hidden', // Forces the spinning gradient to clip to the shape
          // The padding creates the thickness of the spinning border
          p: hasAnimatedBorder ? borderThickness : 0,
          isolation: 'isolate',
          boxShadow: hasAnimatedBorder ? glowShadow : 'none',
          ...(hasAnimatedBorder && {
            '&::before': {
              content: '""',
              position: 'absolute',
              // Make the spinning box 200% size so its corners never show while rotating
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


const ShadowLayer = styled('div')<{
  accounttype: AccountType;
  showshadow: string;
  spinspeed: string;
  spindirection: SpinDirection;
}>(({ accounttype, showshadow, spinspeed, spindirection }) => {
  const cfg = roleConfig[accounttype];
  if (accounttype === AccountTypeEnum.MEMBER || showshadow === 'false' || !cfg.shadow) return { display: 'none' };
  const anim = spindirection === 'clockwise' ? spinCW : spinCCW;
  return {
    position: 'absolute',
    inset: '-20%',
    borderRadius: '50%',
    background: cfg.shadow,
    filter: 'blur(8px)',
    opacity: 0.62,
    animation: `${anim} ${spinspeed} linear infinite`,
  };
});

const OuterRing = styled('div')<{
  accounttype: AccountType;
  dospin: string;
  spinspeed: string;
  spindirection: SpinDirection;
  borderlength: number;
}>(({ accounttype, dospin, spinspeed, spindirection, borderlength }) => {
  const cfg = roleConfig[accounttype];
  if (accounttype === AccountTypeEnum.MEMBER || !cfg.ring) return { display: 'none' };
  const anim = spindirection === 'clockwise' ? spinCW : spinCCW;
  return {
    position: 'absolute',
    inset: '-8%',
    borderRadius: '50%',
    background: buildPartialRing(cfg.ring, borderlength),
    animation: dospin === 'true' ? `${anim} ${spinspeed} linear infinite` : 'none',
  };
});


const AvatarInner = styled('div')({
  position: 'relative',
  borderRadius: '50%',
  overflow: 'hidden',
  display: 'flex',
  zIndex: 5,
});

// ─── Props ────────────────────────────────────────────────────────────────────

export type AvatarUserProps = {
  name: string;
  avatarUrl?: string | null;
  verified?: boolean;
  accountType?: AccountType;
  sx?: Record<string, any>;
};

// ─── Component ────────────────────────────────────────────────────────────────

export const AvatarUser = ({
  name,
  avatarUrl,
  verified,
  accountType = 'MEMBER',
  sx,
}: AvatarUserProps) => {

  return (
    <AvatarWrapper accountType={accountType}>
      <Avatar
        src={verified ? (avatarUrl ?? undefined) : undefined}
        alt={name}
        sx={{
          ...sx,
        }}
      >
        {getAvatarText(name)}
      </Avatar>
    </AvatarWrapper>
  );
};
