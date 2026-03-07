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
};

const staticBorders: Record<string, string> = {
  vip: 'linear-gradient(135deg, #ffd700, #ff8c00, #ffd700)',
  moderator: 'linear-gradient(135deg, #00e676, #1de9b6, #00b0ff)',
};

// Enhanced glows with better colors
const glows: Record<string, string> = {
  admin: '0 0 0 3px #fff, 0 0 20px 6px rgba(255, 23, 68, 0.7)',
  supporter: '0 0 0 3px #fff, 0 0 20px 6px rgba(213, 0, 249, 0.6)',
  vip: '0 0 0 3px #fff, 0 0 20px 6px rgba(255, 215, 0, 0.7)',
  moderator: '0 0 0 3px #fff, 0 0 20px 6px rgba(0, 230, 118, 0.5)',
  member: 'none',
};

const roleColors: Record<AccountType, string> = {
  admin: '#ff1744',
  supporter: '#d500f9',
  vip: '#ff8f00',
  moderator: '#00c853',
  member: '#90a4ae', // Changed from 'none' to a proper color
};

// Outer container with proper positioning
const AvatarWrapper = styled('div')({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
});

// Spinning gradient ring — absolutely positioned behind avatar
const SpinRing = styled('div')<{ accounttype: AccountType }>(({ accounttype }) => {
  if (accounttype === 'member') return { display: 'none' };

  const isAnimated = ['admin', 'supporter'].includes(accounttype);
  const bg = gradients[accounttype] ?? staticBorders[accounttype] ?? 'transparent';

  return {
    position: 'absolute',
    inset: '-4px',
    borderRadius: '50%',
    background: bg,
    animation: isAnimated
      ? `${spin} ${accounttype === 'admin' ? '3s' : '4s'} linear infinite`
      : 'none',
    boxShadow: glows[accounttype],
  };
});

// Enhanced inner ring for better definition
const InnerRing = styled('div')<{ accounttype: AccountType }>(({ accounttype }) => {
  if (accounttype === 'member' || accounttype === 'vip' || accounttype === 'moderator') {
    return { display: 'none' };
  }

  return {
    position: 'absolute',
    inset: '-2px',
    borderRadius: '50%',
    background: 'transparent',
    border: '2px dotted rgba(255, 255, 255, 0.5)',
    animation: `${spinReverse} ${accounttype === 'admin' ? '4s' : '6s'} linear infinite`,
  };
});

// White mask that punches a hole — only the 4px ring stays visible
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
  border: '2px solid #fff', // Added white border for definition
});

export const AvatarUser = ({
  name,
  avatarUrl,
  verified,
  accountType = 'member',
  sx,
}: {
  name: string;
  avatarUrl: string | null;
  verified?: boolean;
  accountType?: AccountType;
  sx?: Record<string, any>;
}) => (
  <AvatarWrapper>
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
