import { Avatar, styled } from '@mui/material';

import { useMicLevel } from 'src/hooks/use-mic-level';

function getAvatarText(fullName: string): string {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return parts[0].charAt(0).toUpperCase() + parts[1].charAt(0).toUpperCase();
  }
  return fullName.substring(0, 2).toUpperCase();
}

type AccountType = 'admin' | 'supporter' | 'vip' | 'moderator' | 'member';

// Create a styled Avatar component that accepts talking prop
const StyledAvatar = styled(Avatar, {
  shouldForwardProp: (prop) => prop !== 'isTalking',
})<{ isTalking?: boolean; accountType: AccountType }>(({ theme, isTalking, accountType }) => ({
  fontWeight: 800,
  fontSize: '0.875rem',
  letterSpacing: '0.04em',
  border: 'none',
  borderColor: isTalking
    ? theme.palette?.success?.main || '#4caf50' // Green when talking
    : accountType !== 'member'
      ? roleColors[accountType]
      : '#e0e0e0', // Default border color
  transition: 'border-color 0.2s ease-in-out',
  ...(isTalking && {
    boxShadow: `0 0 8px ${theme.palette?.success?.main || '#4caf50'}`,
  }),
}));

const AvatarWrapper = styled('div')<{ isTalking?: boolean }>(({ isTalking }) => ({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  ...(isTalking && {
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: '50%',
      border: '2px solid #4caf50',
      pointerEvents: 'none',
      zIndex: 1,
    },
  }),
}));

const roleColors: Record<AccountType, string> = {
  admin: '#ff0000',
  supporter: '#d500f9',
  vip: '#ff8f00',
  moderator: '#00c853',
  member: '#90a4ae',
};

export const VoiceParticipantAvatar = ({
  name,
  avatarUrl,
  verified,
  accountType = 'member',
  stream, // Add this prop
  sx,
}: {
  name: string;
  avatarUrl: string | null;
  verified?: boolean;
  accountType?: AccountType;
  stream: MediaStream | null; // New prop
  sx?: Record<string, any>;
}) => {
  const { isTalking } = useMicLevel(stream);

  return (
    <AvatarWrapper isTalking={isTalking}>
      <StyledAvatar
        src={verified ? (avatarUrl ?? undefined) : undefined}
        alt={name}
        isTalking={isTalking}
        accountType={accountType}
        sx={{
          bgcolor: accountType !== 'member' ? roleColors[accountType] : undefined,
          width: 24,
          height: 24,
          fontSize: 10,
          ...sx,
        }}
      >
        {getAvatarText(name)}
      </StyledAvatar>
    </AvatarWrapper>
  );
};
