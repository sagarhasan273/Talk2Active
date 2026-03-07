import { Avatar } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

function getAvatarText(fullName: string): string {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return parts[0].charAt(0).toUpperCase() + parts[1].charAt(0).toUpperCase();
  }
  return fullName.substring(0, 2).toUpperCase();
}

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

const spinReverse = keyframes`
  from { transform: rotate(360deg); }
  to   { transform: rotate(0deg); }
`;

type AccountType = 'admin' | 'supporter' | 'vip' | 'moderator' | 'member';

const gradients: Record<string, string> = {
  admin: 'conic-gradient(#ff0000, #ff3300, #ff6600, #ff3300, #ff0000, #cc0000, #ff0000)',
  supporter: 'conic-gradient(#00e5ff, #bfff29cc, #00e5ff,  #dfff29da, #00e5ff)',
  vip: 'conic-gradient(#ffd700, #ffaa00, #ff8c00, #ffaa00, #ffd700)',
  moderator: 'conic-gradient(#00e676, #1de9b6, #00b0ff, #1de9b6, #00e676)',
};

// Shadow configurations that spin with the border
const shadowGradients: Record<string, string> = {
  admin:
    'conic-gradient(rgba(255, 0, 0, 0.95), rgba(255, 51, 0, 0.9), rgba(255, 102, 0, 0.85), rgba(204, 0, 0, 0.9), rgba(255, 0, 0, 0.95), rgba(179, 0, 0, 0.8), rgba(255, 0, 0, 0.95))',
  supporter:
    'conic-gradient(rgba(213, 0, 249, 0.5), rgba(41, 121, 255, 0.5), rgba(0, 229, 255, 0.5), rgba(0, 230, 118, 0.5), rgba(41, 121, 255, 0.5), rgba(213, 0, 249, 0.5))',
  vip: 'conic-gradient(rgba(255, 215, 0, 0.6), rgba(255, 170, 0, 0.6), rgba(255, 140, 0, 0.6), rgba(255, 170, 0, 0.6), rgba(255, 215, 0, 0.6))',
  moderator:
    'conic-gradient(rgba(0, 230, 118, 0.5), rgba(29, 233, 182, 0.5), rgba(0, 176, 255, 0.5), rgba(29, 233, 182, 0.5), rgba(0, 230, 118, 0.5))',
};

const roleColors: Record<AccountType, string> = {
  admin: '#ff0000', // Pure aggressive red
  supporter: '#d500f9',
  vip: '#ff8f00',
  moderator: '#00c853',
  member: '#90a4ae',
};

// Outer container with proper positioning
const AvatarWrapper = styled('div')({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
});

// Spinning shadow layer
const ShadowLayer = styled('div')<{
  accounttype: AccountType;
  showShadow?: boolean;
  spinSpeed?: string;
}>(({ accounttype, showShadow = true, spinSpeed = '3s' }) => {
  if (accounttype === 'member' || !showShadow) return { display: 'none' };

  return {
    position: 'absolute',
    inset: '-8px',
    borderRadius: '50%',
    background: shadowGradients[accounttype],
    filter: 'blur(8px)',
    animation: `${spin} ${spinSpeed} linear infinite`,
  };
});

// Spinning gradient ring
const SpinRing = styled('div')<{
  accounttype: AccountType;
  spin?: boolean;
  spinSpeed?: string;
}>(({ accounttype, spin: shouldSpin = true, spinSpeed = '3s' }) => {
  if (accounttype === 'member') return { display: 'none' };

  return {
    position: 'absolute',
    inset: '-4px',
    borderRadius: '50%',
    background: gradients[accounttype],
    animation: shouldSpin ? `${spin} ${spinSpeed} linear infinite` : 'none',
    boxShadow: '0 0 10px rgba(0,0,0,0.3)',
  };
});

// Inner ring for additional effect
const InnerRing = styled('div')<{
  accounttype: AccountType;
  spin?: boolean;
  spinSpeed?: string;
}>(({ accounttype, spin: shouldSpin = true, spinSpeed = '4s' }) => {
  if (accounttype === 'member') return { display: 'none' };

  // Different styles for different account types
  const ringStyles = {
    admin: {
      border: '4px dotted rgba(255, 255, 255, 0.7)',
    },
    supporter: {
      border: '2px dashed rgba(66, 65, 65, 0.6)',
    },
    vip: {
      border: '2px dashed rgba(255, 215, 0, 0.4)',
      boxShadow: '0 0 10px rgba(255, 215, 0, 0.3)',
    },
    moderator: {
      border: '2px double rgba(255, 255, 255, 0.5)',
    },
  };

  return {
    position: 'absolute',
    inset: '-2px',
    borderRadius: '50%',
    background: 'transparent',
    ...ringStyles[accounttype],
    animation: shouldSpin ? `${spinReverse} ${spinSpeed} linear infinite` : 'none',
  };
});

// White mask that punches a hole
const WhiteMask = styled('div')({
  position: 'absolute',
  inset: '3px',
  borderRadius: '50%',
  background: '#fff',
});

// Avatar sits on top - removed border
const AvatarInner = styled('div')({
  position: 'relative',
  borderRadius: '50%',
  overflow: 'hidden',
  display: 'flex',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
});

export const AvatarUser = ({
  name,
  avatarUrl,
  verified,
  accountType = 'member',
  showShadow = false,
  shouldSpin = true,
  spinSpeed = '3s',
  innerRingSpinSpeed = '4s',
  sx,
}: {
  name: string;
  avatarUrl: string | null;
  verified?: boolean;
  accountType?: AccountType;
  showShadow?: boolean;
  shouldSpin?: boolean;
  spinSpeed?: string;
  innerRingSpinSpeed?: string;
  sx?: Record<string, any>;
}) => (
  <AvatarWrapper>
    <ShadowLayer accounttype={accountType} showShadow={showShadow} spinSpeed={spinSpeed} />
    <SpinRing accounttype={accountType} spin={shouldSpin} spinSpeed={spinSpeed} />
    <InnerRing accounttype={accountType} spin={shouldSpin} spinSpeed={innerRingSpinSpeed} />
    <WhiteMask />
    <AvatarInner>
      <Avatar
        src={verified ? (avatarUrl ?? undefined) : undefined}
        alt={name}
        sx={{
          bgcolor: accountType !== 'member' ? roleColors[accountType] : 'none',
          color: '#fff',
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
