import { Avatar } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

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

type AccountType = 'admin' | 'supporter' | 'vip' | 'moderator' | 'member';
type SpinDirection = 'clockwise' | 'counter-clockwise';

// ─── Role Config (no innerBorder — comes from props) ──────────────────────────

const roleConfig = {
  admin: {
    ring: 'conic-gradient(#ff0000 0%, #ff4500 18%, #cc0000 35%, #ff0000 50%, #ff2200 68%, #991100 82%, #ff0000 100%)',
    shadow:
      'conic-gradient(rgba(255,0,0,.95), rgba(255,69,0,.9), rgba(248, 128, 128, 0.85), rgba(253, 111, 111, 0.95), rgba(255,34,0,.9), rgba(153,17,0,.8), rgba(255,0,0,.95))',
    maskBg: '#180000',
    avatarBg: 'linear-gradient(135deg, #3d0000, #180000)',
    avatarColor: '#ff5555',
  },
  vip: {
    ring: 'conic-gradient(#ffd700 0%, #ffec6e 20%, #b8860b 40%, #ffd700 60%, #ffe066 75%, #a07800 90%, #ffd700 100%)',
    shadow:
      'conic-gradient(rgba(255,215,0,.9), rgba(255,236,110,.85), rgba(184,134,11,.8), rgba(255,215,0,.9), rgba(255,224,102,.85), rgba(160,120,0,.75), rgba(255,215,0,.9))',
    maskBg: '#181200',
    avatarBg: 'linear-gradient(135deg, #3a2c00, #181200)',
    avatarColor: '#ffd700',
  },
  supporter: {
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
  moderator: {
    ring: 'conic-gradient(#00e676 0%, #1de9b6 25%, #00b0ff 50%, #1de9b6 75%, #00e676 100%)',
    shadow:
      'conic-gradient(rgba(0,230,118,.75), rgba(29,233,182,.7), rgba(0,176,255,.7), rgba(29,233,182,.7), rgba(0,230,118,.75))',
    maskBg: '#001008',
    avatarBg: 'linear-gradient(135deg, #00240e, #001008)',
    avatarColor: '#00e676',
  },
  member: {
    ring: '',
    shadow: '',
    maskBg: 'transparent',
    avatarBg: 'none',
    avatarColor: 'inherit',
  },
};

// ─── Default inner borders per role (used as fallback when prop not provided) ──
const defaultInnerBorderWidth: Partial<Record<AccountType, number>> = {
  admin: 2.5,
  vip: 2,
  supporter: 2,
  moderator: 2,
  member: 0,
};

const defaultInnerBorderStyle: Partial<Record<AccountType, string>> = {
  admin: 'solid',
  vip: 'dashed',
  supporter: 'dashed',
  moderator: 'double',
  member: 'none',
};

const defaultInnerBorderColor: Partial<Record<AccountType, string>> = {
  admin: 'rgba(255, 255, 255, 0.85)',
  vip: 'rgba(255,220,0,0.55)',
  supporter: 'rgba(165, 243, 252, 0.7)',
  moderator: 'rgba(255,255,255,0.45)',
  member: 'transparent',
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

const AvatarWrapper = styled('div')({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const ShadowLayer = styled('div')<{
  accounttype: AccountType;
  showshadow: string;
  spinspeed: string;
  spindirection: SpinDirection;
}>(({ accounttype, showshadow, spinspeed, spindirection }) => {
  const cfg = roleConfig[accounttype];
  if (accounttype === 'member' || showshadow === 'false' || !cfg.shadow) return { display: 'none' };
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
  if (accounttype === 'member' || !cfg.ring) return { display: 'none' };
  const anim = spindirection === 'clockwise' ? spinCW : spinCCW;
  return {
    position: 'absolute',
    inset: '-8%',
    borderRadius: '50%',
    background: buildPartialRing(cfg.ring, borderlength),
    animation: dospin === 'true' ? `${anim} ${spinspeed} linear infinite` : 'none',
  };
});

const InnerRing = styled('div')<{
  accounttype: AccountType;
  dospin: string;
  spinspeed: string;
  spindirection: SpinDirection;
  borderlength: number;
  innerborder: string;
}>(({ accounttype, dospin, spinspeed, spindirection, borderlength, innerborder }) => {
  if (accounttype === 'member') return { display: 'none' };
  // Inner always counter-rotates relative to outer
  const anim = spindirection === 'clockwise' ? spinCCW : spinCW;
  const maskImage =
    borderlength < 100
      ? `conic-gradient(black 0% ${borderlength}%, transparent ${borderlength}% 100%)`
      : undefined;
  return {
    position: 'absolute',
    inset: '-5%',
    borderRadius: '50%',
    background: 'transparent',
    border: innerborder,
    WebkitMaskImage: maskImage,
    maskImage,
    animation: dospin === 'true' ? `${anim} ${spinspeed} linear infinite` : 'none',
  };
});

const DarkMask = styled('div')<{ accounttype: AccountType }>(({ accounttype }) => ({
  position: 'absolute',
  inset: '7%',
  borderRadius: '50%',
  background: roleConfig[accounttype].maskBg,
}));

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
  avatarUrl: string | null;
  verified?: boolean;
  accountType?: AccountType;
  showShadow?: boolean;
  shouldSpin?: boolean;
  spinSpeed?: string;
  innerRingSpinSpeed?: string;
  spinDirection?: SpinDirection;
  /** 1–100. Visible arc length. 100 = full circle, 50 = half arc. */
  borderLength?: number;
  /**
   * CSS border shorthand for the inner decorative ring.
   * e.g. '2px dashed rgba(255,255,255,0.5)'
   * Falls back to a sensible default per role if not provided.
   */
  innerBorder?: number;
  sx?: Record<string, any>;
};

// ─── Component ────────────────────────────────────────────────────────────────

export const AvatarUser = ({
  name,
  avatarUrl,
  verified,
  accountType = 'member',
  showShadow = true,
  shouldSpin = true,
  spinSpeed = '1.5s',
  innerRingSpinSpeed = '5.5s',
  spinDirection = 'clockwise',
  borderLength = 100,
  innerBorder = 0,
  sx,
}: AvatarUserProps) => {
  const cfg = roleConfig[accountType];
  const pct = Math.min(100, Math.max(1, borderLength));

  const width = innerBorder ?? defaultInnerBorderWidth[accountType] ?? 2;
  const style = defaultInnerBorderStyle[accountType] ?? 'solid';
  const color = defaultInnerBorderColor[accountType];
  const resolvedInnerBorder = accountType === 'member' ? 'none' : `${width}px ${style} ${color}`;

  return (
    <AvatarWrapper>
      <ShadowLayer
        accounttype={accountType}
        showshadow={String(showShadow)}
        spinspeed={spinSpeed}
        spindirection="counter-clockwise"
      />
      <OuterRing
        accounttype={accountType}
        dospin={String(shouldSpin)}
        spinspeed={spinSpeed}
        spindirection={spinDirection}
        borderlength={pct}
      />
      <InnerRing
        accounttype={accountType}
        dospin={String(shouldSpin)}
        spinspeed={innerRingSpinSpeed}
        spindirection="counter-clockwise"
        borderlength={pct}
        innerborder={resolvedInnerBorder}
      />
      <DarkMask accounttype={accountType} />
      <AvatarInner>
        <Avatar
          src={verified ? (avatarUrl ?? undefined) : undefined}
          alt={name}
          sx={{
            background: accountType !== 'member' ? cfg.avatarBg : undefined,
            color: accountType !== 'member' ? cfg.avatarColor : undefined,
            fontWeight: 800,
            fontSize: '0.875rem',
            letterSpacing: '0.04em',
            width: 40,
            height: 40,
            ...sx,
          }}
        >
          {getAvatarText(name)}
        </Avatar>
      </AvatarInner>
    </AvatarWrapper>
  );
};
