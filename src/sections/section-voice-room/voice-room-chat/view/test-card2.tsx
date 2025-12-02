import React from 'react';

import { Mic, MicOff, VolumeUp, Settings, VolumeOff } from '@mui/icons-material';
import {
  Box,
  Card,
  Chip,
  Badge,
  Avatar,
  Tooltip,
  Typography,
  IconButton,
  CardContent,
} from '@mui/material';

// Types
type UserStatus = 'online' | 'offline' | 'busy' | 'brb' | 'afk' | 'zzz';
type MicStatus = 'speaking' | 'muted' | 'quiet';

interface UserCardProps {
  user: {
    id: string;
    name: string;
    avatar?: string;
    status: UserStatus;
    role?: string;
  };
  micStatus: MicStatus;
  volume: number;
  onMicToggle?: () => void;
  onVolumeToggle?: () => void;
  onSettingsClick?: () => void;
  size?: 'small' | 'medium' | 'large';
}

// Status configurations
const statusConfig = {
  online: { color: '#4CAF50', label: 'Online' },
  offline: { color: '#9E9E9E', label: 'Offline' },
  busy: { color: '#F44336', label: 'Busy' },
  brb: { color: '#FF9800', label: 'Be Right Back' },
  afk: { color: '#607D8B', label: 'Away From Keyboard' },
  zzz: { color: '#9C27B0', label: 'Sleeping' },
} as const;

const UserCard: React.FC<UserCardProps> = ({
  user,
  micStatus,
  volume,
  onMicToggle,
  onVolumeToggle,
  onSettingsClick,
  size = 'medium',
}) => {
  // Size configurations
  const sizeConfig = {
    small: {
      card: 120,
      avatar: 48,
      fontSize: '0.75rem',
      iconSize: 'small',
    },
    medium: {
      card: 160,
      avatar: 64,
      fontSize: '0.875rem',
      iconSize: 'medium',
    },
    large: {
      card: 200,
      avatar: 80,
      fontSize: '1rem',
      iconSize: 'large',
    },
  };

  const config = sizeConfig[size];
  const status = statusConfig[user.status];

  return (
    <Card
      sx={{
        width: config.card,
        height: config.card,
        borderRadius: 2,
        position: 'relative',
        overflow: 'visible',
        transition: 'all 0.3s ease',
        boxShadow:
          micStatus === 'speaking'
            ? `0 0 0 3px ${status.color}40, 0 4px 12px rgba(0,0,0,0.1)`
            : '0 2px 8px rgba(0,0,0,0.1)',
        '&:hover': {
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      {/* Speaking Indicator */}
      {micStatus === 'speaking' && (
        <Box
          sx={{
            position: 'absolute',
            top: -4,
            right: -4,
            width: 16,
            height: 16,
            borderRadius: '50%',
            backgroundColor: status.color,
            animation: 'pulse 1.5s infinite',
            border: '2px solid white',
            zIndex: 2,
            '@keyframes pulse': {
              '0%': {
                transform: 'scale(1)',
                opacity: 1,
              },
              '50%': {
                transform: 'scale(1.2)',
                opacity: 0.7,
              },
              '100%': {
                transform: 'scale(1)',
                opacity: 1,
              },
            },
          }}
        />
      )}

      <CardContent
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: size === 'small' ? 1 : 2,
          gap: 1,
        }}
      >
        {/* Avatar with Status Badge */}
        <Box sx={{ position: 'relative', mt: size === 'small' ? 0.5 : 1 }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant="dot"
            sx={{
              '& .MuiBadge-badge': {
                backgroundColor: status.color,
                color: status.color,
                boxShadow: '0 0 0 2px white',
                width: 14,
                height: 14,
                borderRadius: '50%',
                ...(user.status === 'offline' && {
                  backgroundColor: '#9E9E9E',
                  color: '#9E9E9E',
                }),
              },
            }}
          >
            <Avatar
              src={user.avatar}
              sx={{
                width: config.avatar,
                height: config.avatar,
                bgcolor: status.color,
                fontSize: config.avatar * 0.4,
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </Avatar>
          </Badge>

          {/* Mic Status Indicator */}
          <Box
            sx={{
              position: 'absolute',
              bottom: -4,
              right: -4,
              backgroundColor: micStatus === 'muted' ? '#f44336' : '#4CAF50',
              borderRadius: '50%',
              width: 20,
              height: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid white',
              zIndex: 1,
            }}
          >
            {micStatus === 'muted' ? (
              <MicOff sx={{ fontSize: 12, color: 'white' }} />
            ) : (
              <Mic sx={{ fontSize: 12, color: 'white' }} />
            )}
          </Box>
        </Box>

        {/* User Info */}
        <Box sx={{ textAlign: 'center', flex: 1, width: '100%' }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              fontSize: config.fontSize,
              lineHeight: 1.2,
              mb: 0.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {user.name}
          </Typography>

          {user.role && (
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: `calc(${config.fontSize} - 0.125rem)`,
              }}
            >
              {user.role}
            </Typography>
          )}

          {/* Status Chip */}
          <Chip
            label={status.label}
            size="small"
            sx={{
              mt: 1,
              height: 20,
              fontSize: `calc(${config.fontSize} - 0.25rem)`,
              backgroundColor: `${status.color}20`,
              color: status.color,
              border: `1px solid ${status.color}30`,
              '& .MuiChip-label': {
                px: 1,
              },
            }}
          />
        </Box>

        {/* Audio Controls */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            gap: 0.5,
          }}
        >
          <Tooltip title={micStatus === 'muted' ? 'Unmute' : 'Mute'}>
            <IconButton
              onClick={onMicToggle}
              sx={{
                flex: 1,
                backgroundColor: micStatus === 'muted' ? '#f4433610' : 'transparent',
                border: `1px solid ${micStatus === 'muted' ? '#f4433630' : 'rgba(0,0,0,0.1)'}`,
                borderRadius: 1,
                minWidth: 0,
              }}
            >
              {micStatus === 'muted' ? (
                <MicOff sx={{ fontSize: 18, color: '#f44336' }} />
              ) : (
                <Mic sx={{ fontSize: 18 }} />
              )}
            </IconButton>
          </Tooltip>

          <Tooltip title={volume === 0 ? 'Unmute volume' : 'Mute volume'}>
            <IconButton
              onClick={onVolumeToggle}
              sx={{
                flex: 1,
                backgroundColor: volume === 0 ? '#ff980010' : 'transparent',
                border: `1px solid ${volume === 0 ? '#ff980030' : 'rgba(0,0,0,0.1)'}`,
                borderRadius: 1,
                minWidth: 0,
              }}
            >
              {volume === 0 ? (
                <VolumeOff sx={{ fontSize: 18, color: '#ff9800' }} />
              ) : (
                <VolumeUp sx={{ fontSize: 18 }} />
              )}
            </IconButton>
          </Tooltip>

          <Tooltip title="Audio settings">
            <IconButton
              onClick={onSettingsClick}
              sx={{
                flex: 1,
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: 1,
                minWidth: 0,
              }}
            >
              <Settings sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
};

// Example usage component
const UserCardExample: React.FC = () => {
  const [users, setUsers] = React.useState([
    {
      id: '1',
      name: 'John Doe',
      status: 'online' as UserStatus,
      role: 'Developer',
      micStatus: 'speaking' as MicStatus,
      volume: 80,
    },
    {
      id: '2',
      name: 'Jane Smith',
      status: 'busy' as UserStatus,
      role: 'Designer',
      micStatus: 'muted' as MicStatus,
      volume: 0,
    },
    {
      id: '3',
      name: 'Mike Johnson',
      status: 'zzz' as UserStatus,
      micStatus: 'quiet' as MicStatus,
      volume: 50,
    },
    {
      id: '4',
      name: 'Sarah Wilson',
      status: 'offline' as UserStatus,
      role: 'Manager',
      micStatus: 'quiet' as MicStatus,
      volume: 70,
    },
  ]);

  const handleMicToggle = (userId: string) => {
    setUsers(
      users.map((user) =>
        user.id === userId
          ? {
              ...user,
              micStatus: user.micStatus === 'muted' ? 'quiet' : 'muted',
            }
          : user
      )
    );
  };

  const handleVolumeToggle = (userId: string) => {
    setUsers(
      users.map((user) =>
        user.id === userId
          ? {
              ...user,
              volume: user.volume === 0 ? 50 : 0,
            }
          : user
      )
    );
  };

  const handleSettingsClick = (userId: string) => {
    console.log('Settings clicked for user:', userId);
    // Implement settings logic here
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 3,
        p: 3,
        maxWidth: 800,
        margin: '0 auto',
      }}
    >
      {users.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          micStatus={user.micStatus}
          volume={user.volume}
          onMicToggle={() => handleMicToggle(user.id)}
          onVolumeToggle={() => handleVolumeToggle(user.id)}
          onSettingsClick={() => handleSettingsClick(user.id)}
          size="medium"
        />
      ))}
    </Box>
  );
};

export default UserCardExample;
