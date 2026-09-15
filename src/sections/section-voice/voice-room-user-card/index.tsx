import type { ChatUserStatus } from 'src/types/type-chat';
import type { VoiceParticipant } from 'src/types/type-room';

import { useRoomContext, useTracks } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { CheckCircle, CircleOff, Clock, Moon, Pause, UserX } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import HeadsetOffIcon from '@mui/icons-material/HeadsetOff';
import VerifiedIcon from '@mui/icons-material/Verified';
import {
  Avatar,
  Badge,
  Box,
  capitalize,
  Fade,
  keyframes,
  Paper,
  styled,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
  Zoom,
} from '@mui/material';

import { fUsername } from 'src/utils/helper';

// Animation for active speaker glow
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
    small: { width: 96, height: 96 },
    medium: { width: 100, height: 100 },
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
    host: { bg: '#5865f2', text: '#fff' },
    speaker: { bg: '#00ffcc', text: '#000' },
    moderator: { bg: '#9c27b0', text: '#fff' },
    guest: { bg: '#4e5058', text: '#fff' },
  };

  const color = colors[userType as keyof typeof colors] || colors.guest;

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

const StatusDot = styled(Box)<{ status?: string }>(({ theme, status }) => {
  const statusOption = STATUS_MAP[status || 'online'];

  return {
    position: 'absolute',
    top: -10,
    left: 0,
    width: 'fit-content',
    height: 20,
    borderRadius: 10,
    padding: '0px 5px',
    color: theme.palette.mode === 'light' ? theme.palette.common.white : theme.palette.common.black,
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

type VoiceRoomUserCardProps = {
  stream?: MediaStream | null;
  participant: Partial<VoiceParticipant> & {
    isSpeaking?: boolean;
    isActive?: boolean;
    isSelected?: boolean;
    isMuted?: boolean;
    isDeafened?: boolean;
    isLocal?: boolean;
    connectionStatus?: 'connecting' | 'connected' | 'disconnected' | 'failed' | null;
    hasJoin?: boolean;
    handRaised?: boolean;
    activeReactionEmoji?: string | null;
  };
  size?: 'small' | 'medium' | 'large';
  showName?: boolean;
  showStatus?: boolean;
  showSpeakingIndicator?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
  className?: string;
};

export function VoiceRoomUserCard({
  stream,
  participant,
  size = 'medium',
  showName = true,
  showStatus = true,
  showSpeakingIndicator = true,
  onClick,
  onDoubleClick,
  className,
}: VoiceRoomUserCardProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Grab active room and audio track references from LiveKit
  const room = useRoomContext();
  const audioTracks = useTracks([Track.Source.Microphone]);

  const [isHovered, setIsHovered] = useState(false);
  const [showReaction, setShowReaction] = useState(false);

  const {
    userId,
    name,
    profilePhoto,
    userType = 'guest',
    verified,
    accountType,
    status,
    isSpeaking = false,
    isActive = false,
    isSelected = false,
    isMuted = false,
    isDeafened = false,
    isLocal = false,
    connectionStatus = 'connected',
    hasJoin = true,
    handRaised = false,
    activeReactionEmoji = null,
  } = participant;

  // Resolve native MediaStream from LiveKit for the waveform indicator
  const livekitMediaStream = useMemo(() => {
    if (stream) return stream;
    const userTrack = audioTracks.find((t) => t.participant.identity === userId);
    const mediaTrack = userTrack?.publication?.track?.mediaStreamTrack;
    if (mediaTrack) {
      return new MediaStream([mediaTrack]);
    }
    return null;
  }, [audioTracks, userId, stream]);

  // Handle transient emoji animations
  useEffect(() => {
    if (activeReactionEmoji) {
      setShowReaction(true);
      const timer = setTimeout(() => setShowReaction(false), 2000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [activeReactionEmoji]);

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

  const getBadgeContent = () => {
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

    if (userType === 'host' || userType === 'moderator' || userType === 'speaker') {
      return (
        <Tooltip title={userType} arrow placement="top">
          <UserTypeBadge userType={userType}>
            {verified && <VerifiedIcon sx={{ fontSize: isMobile ? 10 : 12 }} />}
            {capitalize(userType)}
          </UserTypeBadge>
        </Tooltip>
      );
    }

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
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        width: '100%',
        height: 'fit-content',
        border: '1px solid',
        borderColor: theme.palette.divider,
        borderRadius: 1,
        minHeight: 160,
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
            zIndex: 10,
            ...(isHovered && {
              transform: badgeContent ? 'scale(1.1) translate(20%, 20%)' : 'scale(0)',
            }),
          },
        }}
      >
        {connectionStatusElement}

        <StyledAvatar
          src={profilePhoto || undefined}
          isSpeaking={isSpeaking}
          isActive={isActive}
          isSelected={isSelected}
          size={isMobile && size === 'large' ? 'large' : size}
          alt={fUsername(name)}
          sx={{
            opacity: connectionStatusElement ? 0.3 : 1,
            transition: 'opacity 0.3s ease',
            filter: connectionStatusElement ? 'blur(1px)' : 'none',
            border:
              accountType === 'supporter' ? `2px solid ${theme.palette.primary.light}` : 'none',
          }}
        >
          {fUsername(name)}
        </StyledAvatar>
      </Badge>

      {/* Participant Name */}
      {showName && (
        <Fade in timeout={300}>
          <Box sx={{ width: '100%', textAlign: 'center', mt: 1, px: 0.5 }}>
            <Tooltip
              title={name || ''}
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
              </Typography>
            </Tooltip>
          </Box>
        </Fade>
      )}

      {/* LiveKit Hand Raise Speech Bubble */}
      {handRaised && (
        <Zoom in timeout={300}>
          <Paper
            sx={{
              position: 'absolute',
              top: -12,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 30,
              bgcolor: 'warning.lighter',
              color: 'warning.darker',
              px: 1.5,
              py: 0.5,
              borderRadius: '16px 16px 16px 4px',
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              boxShadow: '0 4px 15px rgba(255, 231, 194, 0.4)',
              border: '2px solid white',
              whiteSpace: 'nowrap',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: '20%',
                width: 0,
                height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: `8px solid ${theme.palette.warning.light}`,
              },
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              Raised hand ✋
            </Typography>
          </Paper>
        </Zoom>
      )}

      {/* LiveKit Emoji Reaction Float Animation */}
      {showReaction && activeReactionEmoji && (
        <Zoom in timeout={300}>
          <Box
            sx={{
              position: 'absolute',
              top: '30%',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 25,
              animation: 'floatReaction 1.8s ease-out forwards',
              '@keyframes floatReaction': {
                '0%': { transform: 'translateX(-50%) translateY(0) scale(0.8)', opacity: 1 },
                '100%': { transform: 'translateX(-50%) translateY(-60px) scale(1.3)', opacity: 0 },
              },
            }}
          >
            <Avatar
              sx={{
                bgcolor: '#5865f2',
                boxShadow: theme.shadows[6],
                width: 44,
                height: 44,
                fontSize: '1.4rem',
              }}
            >
              {activeReactionEmoji}
            </Avatar>
          </Box>
        </Zoom>
      )}

      {/* Status Dot */}
      {showStatus && status && status !== 'online' && (
        <Tooltip title={STATUS_MAP[status]?.label}>
          <StatusDot status={status}>
            {(() => {
              const renderStatus = STATUS_MAP[status];
              const IconComponent = renderStatus?.icon;
              return IconComponent ? (
                <>
                  <IconComponent style={{ width: 14, height: 14, color: 'currentColor' }} />
                  <Typography variant="subtitle2">{renderStatus?.label}</Typography>
                </>
              ) : null;
            })()}
          </StatusDot>
        </Tooltip>
      )}
    </Box>
  );
}
