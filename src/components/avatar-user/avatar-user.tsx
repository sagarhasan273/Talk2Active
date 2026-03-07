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

type AccountType = 'admin' | 'supporter' | 'vip' | 'moderator' | 'member';

const gradients: Record<string, string> = {
  admin: 'conic-gradient(#ff1744, #ff6d00, #ffd600, #ff6d00, #ff1744)',
  supporter: 'conic-gradient(#d500f9, #2979ff, #00e5ff, #00e676, #2979ff, #d500f9)',
};

const staticBorders: Record<string, string> = {
  vip: 'linear-gradient(135deg, #ffd700, #ff8c00, #ffd700)',
  moderator: 'linear-gradient(135deg, #00e676, #1de9b6, #00b0ff)',
};

const glows: Record<string, string> = {
  admin: '0 0 0 3px #fff, 0 0 14px 4px rgba(255,80,0,0.8)',
  supporter: '0 0 0 3px #fff, 0 0 14px 4px rgba(120,0,255,0.7)',
  vip: '0 0 0 3px #fff, 0 0 12px 3px rgba(255,200,0,0.7)',
  moderator: '0 0 0 3px #fff, 0 0 12px 3px rgba(0,230,118,0.6)',
  member: 'none',
};

const roleColors: Record<AccountType, string> = {
  admin: '#ff1744',
  supporter: '#d500f9',
  vip: '#ff8f00',
  moderator: '#00c853',
  member: '#78909c',
};

// Outer container
const AvatarWrapper = styled('div')({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
});

// Spinning gradient ring — absolutely positioned behind avatar
const SpinRing = styled('div')<{ accounttype: AccountType }>(({ accounttype }) => {
  if (accounttype === 'member') return { display: 'none' };

  const isAnimated = ['admin', 'supporter', 'vip', 'moderator'].includes(accounttype);
  const bg = gradients[accounttype] ?? staticBorders[accounttype] ?? 'transparent';

  return {
    position: 'absolute',
    inset: '-4px',
    borderRadius: '50%',
    background: bg,
    animation: isAnimated
      ? `${spin} ${accounttype === 'admin' ? '2s' : '3s'} linear infinite`
      : 'none',
    boxShadow: glows[accounttype],
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
    <WhiteMask />
    <AvatarInner>
      <Avatar
        src={verified ? (avatarUrl ?? undefined) : undefined}
        alt={name}
        sx={{
          bgcolor: accountType !== 'member' ? roleColors[accountType] : 'none',
          fontWeight: 800,
          fontSize: '0.875rem',
          letterSpacing: '0.04em',
          ...sx,
        }}
      >
        {getAvatarText(name)}
      </Avatar>
    </AvatarInner>
  </AvatarWrapper>
);
