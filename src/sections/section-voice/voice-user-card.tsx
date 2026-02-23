import type { Participant } from 'src/types/type-room';
import type { ConnectionStatus } from 'src/hooks/useWebRTC/types';

import { useState } from 'react';
import { Moon, Clock, Pause, UserX, CircleOff, CheckCircle } from 'lucide-react';

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

import { fUsername } from 'src/utils/helper'; // or Nightlight

import { VoiceSpeakingIndicator } from './voice-speaking-indicator';

import type { ChatUserStatus } from '../section-chat-room/type'; // or PersonOff

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
      transform: 'scale(1.02)',
      boxShadow: theme.shadows[4],
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
}); // or Cancel

const STATUS_OPTIONS: ChatUserStatus[] = [
  {
    name: 'online',
    label: 'Online',
    icon: CheckCircle,
    color: 'success.main',
    bgColor: 'success',
    bgColorChannel: 'mainChannel',
  },
  {
    name: 'busy',
    label: 'Busy',
    icon: Clock,
    color: 'error.light',
    bgColor: 'error',
    bgColorChannel: 'lightChannel',
  },
  {
    name: 'brb',
    label: 'BRB',
    icon: Pause,
    color: 'yellow.main',
    bgColor: 'yellow',
    bgColorChannel: 'mainChannel',
  },
  {
    name: 'afk',
    label: 'AFK',
    icon: UserX,
    color: 'orange.main',
    bgColor: 'orange',
    bgColorChannel: 'mainChannel',
  },
  {
    name: 'zzz',
    label: 'Zzz',
    icon: Moon,
    color: 'stone.main',
    bgColor: 'stone',
    bgColorChannel: 'mainChannel',
  },
  {
    name: 'offline',
    label: 'Offline',
    icon: CircleOff,
    color: 'stone.dark',
    bgColor: 'stone',
    bgColorChannel: 'darkChannel',
  },
];

const STATUS_MAP = Object.fromEntries(STATUS_OPTIONS.map((s) => [s.name, s]));

// Enhanced StatusDot with icon
const StatusDot = styled(Box)<{ status?: string }>(({ theme, status }) => {
  const statusOption = STATUS_MAP[status || 'online'];

  return {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: '50%',
    backgroundColor: theme.palette[statusOption?.bgColor]?.main || theme.palette.success.main,
    border: `2px solid ${theme.palette.background.paper}`,
    zIndex: 15,
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s ease',
    '&:hover': {
      transform: 'scale(1.1)',
    },
    '& svg': {
      fontSize: 12,
      color: theme.palette.common.white,
    },
  };
});

// Connection status overlay component
const ConnectionOverlay = styled(Box)<{ status: string }>(({ theme, status }) => {
  const colors = {
    connecting: theme.palette.warning.main,
    disconnected: theme.palette.error.main,
    failed: theme.palette.error.dark,
    closed: theme.palette.grey[600],
  };

  return {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: colors[status as keyof typeof colors] || colors.closed,
    color: 'white',
    padding: theme.spacing(0.5, 1),
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(0.5),
    border: `2px solid ${theme.palette.background.paper}`,
    zIndex: 10,
    animation: 'fadeIn 0.3s ease',
    '@keyframes fadeIn': {
      '0%': { opacity: 0, transform: 'translate(-50%, -40%)' },
      '100%': { opacity: 1, transform: 'translate(-50%, -50%)' },
    },
  };
});

type VoiceUserCardProps = {
  stream: MediaStream | null;
  user: Partial<Participant> & {
    isSpeaking?: boolean;
    isActive?: boolean;
    isSelected?: boolean;
    isMuted?: boolean;
    isDeafened?: boolean;
    isLocal?: boolean;
    connectionStatus?: ConnectionStatus[string];
    hasJoin?: boolean;
  };
  size?: 'small' | 'medium' | 'large';
  showName?: boolean;
  showStatus?: boolean;
  showSpeakingIndicator?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
  className?: string;
};

export function VoiceUserCard({
  stream,
  user,
  size = 'medium',
  showName = true,
  showStatus = true,
  showSpeakingIndicator = true,
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
    connectionStatus = null,
    hasJoin = true,
  } = user;

  // Memoize connection status display
  const getConnectionStatus = () => {
    if (!hasJoin) {
      return (
        <ConnectionOverlay status="closed">
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            Voice Closed
          </Typography>
        </ConnectionOverlay>
      );
    }

    if (connectionStatus === 'connecting') {
      return (
        <ConnectionOverlay status="connecting">
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.3)',
              borderTopColor: 'white',
              animation: 'spin 0.8s linear infinite',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            }}
          />
          <Typography variant="caption">Connecting...</Typography>
        </ConnectionOverlay>
      );
    }

    if (connectionStatus === 'disconnected' || connectionStatus === 'failed') {
      return (
        <ConnectionOverlay status="disconnected">
          <Typography variant="caption" sx={{ fontWeight: 600, zIndex: 2 }}>
            Disconnected
          </Typography>
        </ConnectionOverlay>
      );
    }

    return null;
  };

  // Memoize badge content
  const getBadgeContent = () => {
    // Priority 1: Deafened
    if (isDeafened) {
      return (
        <Tooltip title="Deafened" arrow placement="top">
          <Box
            sx={{
              bgcolor: '#f44336',
              p: 0.5,
              borderRadius: '50%',
              display: 'flex',
              border: `2px solid ${theme.palette.background.paper}`,
              boxShadow: theme.shadows[2],
            }}
          >
            <HeadsetOffIcon sx={{ fontSize: isMobile ? 12 : 16, color: '#fff' }} />
          </Box>
        </Tooltip>
      );
    }

    // Priority 3: User type with verification
    if (userType === 'Host' || userType === 'Moderator' || userType === 'Speaker') {
      return (
        <Tooltip title={userType} arrow placement="top">
          <UserTypeBadge userType={userType}>
            {verified && <VerifiedIcon sx={{ fontSize: isMobile ? 10 : 12 }} />}
            {userType}
          </UserTypeBadge>
        </Tooltip>
      );
    }

    // Priority 4: Verified only
    if (verified) {
      return (
        <Tooltip title="Verified" arrow placement="top">
          <Box
            sx={{
              bgcolor: '#5865f2',
              p: 0.5,
              borderRadius: '50%',
              display: 'flex',
              border: `2px solid ${theme.palette.background.paper}`,
              boxShadow: theme.shadows[2],
            }}
          >
            <VerifiedIcon sx={{ fontSize: isMobile ? 12 : 16, color: '#fff' }} />
          </Box>
        </Tooltip>
      );
    }

    // Priority 5: Local user indicator
    if (isLocal) {
      return (
        <Tooltip title="You" arrow placement="top">
          <UserTypeBadge userType="Guest">You</UserTypeBadge>
        </Tooltip>
      );
    }

    return null;
  };

  const badgeContent = getBadgeContent();
  const connectionStatusElement = getConnectionStatus();

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
        maxWidth: size === 'large' ? 180 : size === 'medium' ? 140 : 100,
        mx: 'auto',
        mt: 1,
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
            transform: badgeContent ? 'scale(1) translate(20%, 20%)' : 'scale(0)',
            transition: 'transform 0.2s ease',
            zIndex: 20,
            ...(isHovered && {
              transform: badgeContent ? 'scale(1.1) translate(20%, 20%)' : 'scale(0)',
            }),
          },
        }}
      >
        {/* Status indicator dot */}
        {showStatus && status !== 'online' && (
          <Tooltip title={STATUS_MAP[status || 'online']?.label}>
            <StatusDot status={status}>
              {(() => {
                const IconComponent = STATUS_MAP[status || 'online']?.icon;
                return IconComponent ? <IconComponent style={{ width: 14, height: 14 }} /> : null;
              })()}
            </StatusDot>
          </Tooltip>
        )}

        {/* Connection Status Overlay */}
        {connectionStatusElement}

        {/* Speaking Indicator */}
        {showSpeakingIndicator && (
          <VoiceSpeakingIndicator
            stream={stream}
            size={isMobile && size === 'large' ? 'medium' : size}
            isMuted={isMuted && !isDeafened}
          />
        )}

        <StyledAvatar
          src={verified ? (profilePhoto ?? undefined) : 'TS'}
          isSpeaking={isSpeaking}
          isActive={isActive}
          isSelected={isSelected}
          size={isMobile && size === 'large' ? 'medium' : size}
          alt={fUsername(name)}
          sx={{
            opacity: connectionStatusElement ? 0.3 : 1,
            transition: 'opacity 0.3s ease',
            filter: connectionStatusElement ? 'blur(1px)' : 'none',
          }}
        >
          {fUsername(name)}
        </StyledAvatar>
      </Badge>

      {/* Name and additional info */}
      {showName && (
        <Fade in timeout={300}>
          <Box sx={{ width: '100%', textAlign: 'center', mt: 1, px: 0.5 }}>
            <Tooltip
              title={name}
              arrow
              placement="top"
              disableHoverListener={!name || name.length < 12}
            >
              <Typography
                variant={isMobile ? 'body2' : 'body1'}
                sx={{
                  color: isActive || isSelected ? 'primary.main' : 'text.primary',
                  fontWeight: isActive || isSelected ? 700 : 500,
                  transition: 'color 0.2s ease',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontSize: size === 'small' ? '0.8rem' : 'inherit',
                }}
              >
                {name}
                {isLocal && ' (You)'}
              </Typography>
            </Tooltip>
          </Box>
        </Fade>
      )}
    </Box>
  );
}
