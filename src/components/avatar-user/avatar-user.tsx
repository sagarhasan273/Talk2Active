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
  admin: 'conic-gradient(#ff1744, #ff6d00, #ffd600, #ff6d00, #ff1744)',
  supporter: 'conic-gradient(#d500f9, #2979ff, #00e5ff, #00e676, #2979ff, #d500f9)',
  vip: 'conic-gradient(#ffd700, #ffaa00, #ff8c00, #ffaa00, #ffd700)',
  moderator: 'conic-gradient(#00e676, #1de9b6, #00b0ff, #1de9b6, #00e676)',
};

// Shadow configurations that spin with the border
const shadowGradients: Record<string, string> = {
  admin:
    'conic-gradient(rgba(255, 23, 68, 0.6), rgba(255, 109, 0, 0.6), rgba(255, 214, 0, 0.6), rgba(255, 109, 0, 0.6), rgba(255, 23, 68, 0.6))',
  supporter:
    'conic-gradient(rgba(213, 0, 249, 0.5), rgba(41, 121, 255, 0.5), rgba(0, 229, 255, 0.5), rgba(0, 230, 118, 0.5), rgba(41, 121, 255, 0.5), rgba(213, 0, 249, 0.5))',
  vip: 'conic-gradient(rgba(255, 215, 0, 0.6), rgba(255, 170, 0, 0.6), rgba(255, 140, 0, 0.6), rgba(255, 170, 0, 0.6), rgba(255, 215, 0, 0.6))',
  moderator:
    'conic-gradient(rgba(0, 230, 118, 0.5), rgba(29, 233, 182, 0.5), rgba(0, 176, 255, 0.5), rgba(29, 233, 182, 0.5), rgba(0, 230, 118, 0.5))',
};

const roleColors: Record<AccountType, string> = {
  admin: '#ff1744',
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
const ShadowLayer = styled('div')<{ accounttype: AccountType }>(({ accounttype }) => {
  if (accounttype === 'member') return { display: 'none' };

  const spinSpeeds = {
    admin: '3s',
    supporter: '4s',
    vip: '5s',
    moderator: '4.5s',
  };

  return {
    position: 'absolute',
    inset: '-12px',
    borderRadius: '50%',
    background: shadowGradients[accounttype],
    filter: 'blur(8px)',
    animation: `${spin} ${spinSpeeds[accounttype]} linear infinite`,
  };
});

// Spinning gradient ring
const SpinRing = styled('div')<{ accounttype: AccountType }>(({ accounttype }) => {
  if (accounttype === 'member') return { display: 'none' };

  const spinSpeeds = {
    admin: '3s',
    supporter: '4s',
    vip: '5s',
    moderator: '4.5s',
  };

  return {
    position: 'absolute',
    inset: '-4px',
    borderRadius: '50%',
    background: gradients[accounttype],
    animation: `${spin} ${spinSpeeds[accounttype]} linear infinite`,
    boxShadow: '0 0 20px rgba(0,0,0,0.3)',
  };
});

// Inner ring for additional effect
const InnerRing = styled('div')<{ accounttype: AccountType }>(({ accounttype }) => {
  if (accounttype === 'member') return { display: 'none' };

  const spinSpeeds = {
    admin: '4s',
    supporter: '6s',
    vip: '7s',
    moderator: '6s',
  };

  // Different styles for different account types
  const ringStyles = {
    admin: {
      border: '2px dotted rgba(255, 255, 255, 0.7)',
    },
    supporter: {
      border: '2px dashed rgba(255, 255, 255, 0.6)',
    },
    vip: {
      border: '2px solid rgba(255, 215, 0, 0.4)',
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
    animation: `${spinReverse} ${spinSpeeds[accounttype]} linear infinite`,
  };
});

// White mask that punches a hole
const WhiteMask = styled('div')({
  position: 'absolute',
  inset: '3px',
  borderRadius: '50%',
  background: '#fff',
});

// Avatar sits on top
const AvatarInner = styled('div')({
  position: 'relative',
  borderRadius: '50%',
  overflow: 'hidden',
  display: 'flex',
  border: '2px solid #fff',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
});

export const AvatarUser = ({
  name,
  avatarUrl,
  verified,
  accountType = 'admin',
  sx,
}: {
  name: string;
  avatarUrl: string | null;
  verified?: boolean;
  accountType?: AccountType;
  sx?: Record<string, any>;
}) => (
  <AvatarWrapper>
    <ShadowLayer accounttype={accountType} />
    <SpinRing accounttype={accountType} />
    <InnerRing accounttype={accountType} />
    <WhiteMask />
    <AvatarInner>
      <Avatar
        src={verified ? (avatarUrl ?? undefined) : undefined}
        alt={name}
        sx={{
          bgcolor: roleColors[accountType],
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
