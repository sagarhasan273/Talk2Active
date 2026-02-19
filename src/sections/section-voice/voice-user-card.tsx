import type { Participant } from 'src/types/type-room';

import { useState } from 'react';

import MicOffIcon from '@mui/icons-material/MicOff';
import VerifiedIcon from '@mui/icons-material/Verified';
import HeadsetOffIcon from '@mui/icons-material/HeadsetOff';
import {
  Box,
  Fade,
  Badge,
  styled,
  Avatar,
  Tooltip,
  useTheme,
  keyframes,
  Typography,
  useMediaQuery,
} from '@mui/material';

import { fUsername } from 'src/utils/helper';

// Animation for the active speaker
const pulse = keyframes`
  0% { box-shadow: 0 0 0 0px rgba(0, 255, 204, 0.7); }
  70% { box-shadow: 0 0 0 15px rgba(0, 255, 204, 0); }
  100% { box-shadow: 0 0 0 0px rgba(0, 255, 204, 0); }
`;

// Speaking animation
const speakingPulse = keyframes`
  0% { box-shadow: 0 0 0 0px rgba(88, 101, 242, 0.7); }
  50% { box-shadow: 0 0 0 4px rgba(88, 101, 242, 0.3); }
  100% { box-shadow: 0 0 0 0px rgba(88, 101, 242, 0); }
`;

const StyledAvatar = styled(Avatar, {
  shouldForwardProp: (prop) =>
    !['isSpeaking', 'isActive', 'isSelected', 'size'].includes(prop as string),
})<{
  isSpeaking?: boolean;
  isActive?: boolean;
  isSelected?: boolean;
  size: 'small' | 'medium' | 'large';
}>(({ theme, isSpeaking, isActive, isSelected, size }) => {
  const sizes = {
    small: { width: 64, height: 64 },
    medium: { width: 96, height: 96 },
    large: { width: 120, height: 120 },
  };

  const selectedSize = sizes[size] || sizes.medium;

  return {
    ...selectedSize,
    border: isActive
      ? '4px solid #00ffcc'
      : isSelected
        ? `4px solid ${theme.palette.primary.main}`
        : isSpeaking
          ? `2px solid ${theme.palette.primary.main}`
          : '3px solid transparent',
    animation: isActive
      ? `${pulse} 2s infinite`
      : isSpeaking
        ? `${speakingPulse} 1s infinite`
        : 'none',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    '&:hover': {
      transform: 'scale(1.05)',
      boxShadow: theme.shadows[8],
    },
    [theme.breakpoints.down('sm')]: {
      ...(size === 'large' ? sizes.medium : sizes.small),
    },
  };
});

const UserTypeBadge = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'userType',
})<{ userType?: string }>(({ theme, userType }) => {
  const colors = {
    Host: { bg: '#5865f2', text: '#fff' },
    Speaker: { bg: '#00ffcc', text: '#000' },
    Moderator: { bg: '#9c27b0', text: '#fff' },
    Guest: { bg: '#4e5058', text: '#fff' },
  };

  const color = colors[userType as keyof typeof colors] || colors.Guest;

  return {
    backgroundColor: color.bg,
    color: color.text,
    padding: theme.spacing(0.5, 1),
    borderRadius: '12px',
    fontSize: '0.7rem',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    border: `2px solid ${theme.palette.background.paper}`,
    whiteSpace: 'nowrap',
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(0.25, 0.75),
      fontSize: '0.6rem',
    },
  };
});

type VoiceUserCardProps = {
  user: Partial<Participant> & {
    isSpeaking?: boolean;
    isActive?: boolean;
    isSelected?: boolean;
    isMuted?: boolean;
    isDeafened?: boolean;
    isLocal?: boolean;
  };
  size?: 'small' | 'medium' | 'large';
  showName?: boolean;
  showStatus?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
  className?: string;
};

export function VoiceUserCard({
  user,
  size = 'medium',
  showName = true,
  showStatus = true,
  onClick,
  onDoubleClick,
  className,
}: VoiceUserCardProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isHovered, setIsHovered] = useState(false);

  const {
    name,
    profilePhoto,
    userType = 'Guest',
    verified,
    status,
    isSpeaking = false,
    isActive = false,
    isSelected = false,
    isMuted = false,
    isDeafened = false,
    isLocal = false,
  } = user;

  // Determine badge content based on priority
  const getBadgeContent = () => {
    if (isDeafened) {
      return (
        <Tooltip title="Deafened">
          <Box
            sx={{
              bgcolor: '#f44336',
              p: 0.5,
              borderRadius: '50%',
              display: 'flex',
              border: `2px solid ${theme.palette.background.paper}`,
            }}
          >
            <HeadsetOffIcon sx={{ fontSize: isMobile ? 12 : 16, color: '#fff' }} />
          </Box>
        </Tooltip>
      );
    }

    if (isMuted && !isDeafened) {
      return (
        <Tooltip title="Muted">
          <Box
            sx={{
              bgcolor: '#f44336',
              p: 0.5,
              borderRadius: '50%',
              display: 'flex',
              border: `2px solid ${theme.palette.background.paper}`,
            }}
          >
            <MicOffIcon sx={{ fontSize: isMobile ? 12 : 16, color: '#fff' }} />
          </Box>
        </Tooltip>
      );
    }

    if (userType === 'Host' || userType === 'Moderator' || userType === 'Speaker') {
      return (
        <UserTypeBadge userType={userType}>
          {verified && <VerifiedIcon sx={{ fontSize: isMobile ? 10 : 12 }} />}
          {userType}
        </UserTypeBadge>
      );
    }

    if (verified) {
      return (
        <Box
          sx={{
            bgcolor: '#5865f2',
            p: 0.5,
            borderRadius: '50%',
            display: 'flex',
            border: `2px solid ${theme.palette.background.paper}`,
          }}
        >
          <VerifiedIcon sx={{ fontSize: isMobile ? 12 : 16, color: '#fff' }} />
        </Box>
      );
    }

    if (isLocal) {
      return <UserTypeBadge userType="Guest">You</UserTypeBadge>;
    }

    return null;
  };

  const badgeContent = getBadgeContent();

  // Status indicator (online/offline/idle)
  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return '#43b581';
      case 'busy':
        return '#faa61a';
      case 'offline':
        return '#747f8d';
      default:
        return '#43b581';
    }
  };

  return (
    <Box
      className={className}
      sx={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        width: '100%',
        maxWidth: size === 'large' ? 160 : size === 'medium' ? 140 : 100,
        mx: 'auto',
      }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        badgeContent={badgeContent}
        sx={{
          '& .MuiBadge-badge': {
            transform:
              badgeContent && typeof badgeContent === 'object'
                ? 'scale(1) translate(20%, 20%)'
                : 'scale(1) translate(30%, 30%)',
            transition: 'transform 0.2s ease',
            ...(isHovered && {
              transform:
                badgeContent && typeof badgeContent === 'object'
                  ? 'scale(1.1) translate(20%, 20%)'
                  : 'scale(1.1) translate(30%, 30%)',
            }),
          },
        }}
      >
        {/* Status indicator dot */}
        {showStatus && status && (
          <Box
            sx={{
              position: 'absolute',
              top: 5,
              right: 5,
              width: isMobile ? 10 : 12,
              height: isMobile ? 10 : 12,
              borderRadius: '50%',
              backgroundColor: getStatusColor(),
              border: `2px solid ${theme.palette.background.paper}`,
              zIndex: 2,
            }}
          />
        )}

        <StyledAvatar
          src={profilePhoto}
          isSpeaking={!isSpeaking}
          isActive={isActive}
          isSelected={isSelected}
          size={isMobile && size === 'large' ? 'medium' : size}
          alt={fUsername(name)}
        >
          {fUsername(name)}
        </StyledAvatar>
      </Badge>

      {/* Name and additional info */}
      {showName && (
        <Fade in timeout={300}>
          <Box sx={{ width: '100%', textAlign: 'center', mt: 1 }}>
            <Typography
              variant={isMobile ? 'body2' : 'body1'}
              sx={{
                color: isActive || isSelected ? 'primary.main' : 'text.primary',
                fontWeight: isActive || isSelected ? 700 : 500,
                transition: 'color 0.2s ease',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                px: 1,
                cursor: 'pointer',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              {name}
              {isLocal && ' (You)'}
            </Typography>
          </Box>
        </Fade>
      )}
    </Box>
  );
}
