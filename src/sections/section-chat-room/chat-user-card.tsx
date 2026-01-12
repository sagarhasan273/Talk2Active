import type { UserType } from 'src/types/type-user';

import React, { useState } from 'react';

import { Hearing, VolumeUp, GraphicEq, Headphones, FiberManualRecord } from '@mui/icons-material';
import {
  Box,
  Card,
  Menu,
  Switch,
  Divider,
  MenuItem,
  useTheme,
  Typography,
  CardContent,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { varAlpha } from 'src/theme/styles';
import { useWebRTCContext } from 'src/core/contexts/webRTC-context';

import UserAudio from './chat-user-audio';
import { STATUS_OPTIONS } from './chat-status-button';
import { VoiceRoomIsSpeaking } from './chat-is-speaking';
import { ChatUserAvatarBadge } from './chat-user-avater-badge';
import { ChatUserCardPCStatus } from './chat-user-card-pc-status';
import { ChatUserCardQuickActions } from './chat-user-card-quick-actions';
import { VoiceRoomMessageIndividual } from '../../layouts/components/social-drawer/message-individual';

import type { AudioQuality, ChatUserCardAudioSettings } from './type';

export type ChatUserCardProps = {
  user: {
    id: string;
    name: string;
    avatar: string;
    status: UserType['status'];
    isSpeaking: boolean;
    isMuted: boolean;
    volume?: number;
    audioQuality?: AudioQuality;
    userType?: string;
    verified?: boolean;
  };
  socketId: string;
  stream: MediaStream | null;
  isLocal: boolean;
  showSettings?: boolean;
  onSettingsChange?: (settings: any) => void;
  onToggleMute?: (userId: string) => void;
  onVolumeToggle?: (userId: string) => void;
};

export const ChatUserCard: React.FC<ChatUserCardProps> = ({
  user,
  showSettings: externalShowSettings,
  onSettingsChange,
  socketId,
  stream,
  isLocal,

  onToggleMute,
  onVolumeToggle,
}) => {
  const menuOpen = useBoolean(false);
  const { connectionStatus } = useWebRTCContext();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [privateMessageEL, setPrivateMessageEL] = useState<null | HTMLElement>(null);
  const [audioSettings, setAudioSettings] = useState<ChatUserCardAudioSettings>({
    noiseSuppression: true,
    echoCancellation: true,
    autoGainControl: true,
    volume: user.volume || 75,
    audioQuality: user.audioQuality || ('high' as AudioQuality),
  });

  // In your component
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // or (max-width:600px)

  const { name, avatar, status = 'online', id, verified } = user;

  // Status configurations
  const statusConfig = {
    online: STATUS_OPTIONS[0],
    offline: STATUS_OPTIONS[5],
    busy: STATUS_OPTIONS[1],
    brb: STATUS_OPTIONS[2],
    afk: STATUS_OPTIONS[3],
    zzz: STATUS_OPTIONS[4],
  };

  // Audio quality colors
  const qualityColors = {
    low: '#ff4444',
    medium: '#ffaa00',
    high: '#00c853',
  };

  const handleMessageClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setPrivateMessageEL(event.currentTarget);
  };
  const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMessageClose = () => {
    setPrivateMessageEL(null);
  };
  const handleSettingsClose = () => {
    setAnchorEl(null);
  };

  const handleAudioSettingToggle = (setting: keyof typeof audioSettings) => {
    if (setting === 'volume' || setting === 'audioQuality') return;

    const newSettings = {
      ...audioSettings,
      [setting]: !audioSettings[setting],
    };
    setAudioSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  const handleVolumeChange = (event: Event, newValue: number | number[]) => {
    const newSettings = {
      ...audioSettings,
      volume: newValue as number,
    };
    setAudioSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  const handleQualityChange = (quality: AudioQuality) => {
    const newSettings = {
      ...audioSettings,
      audioQuality: quality,
    };
    setAudioSettings(newSettings);
    onSettingsChange?.(newSettings);
    handleSettingsClose();
  };

  const handleMuteToggle = (event: React.MouseEvent) => {
    event.stopPropagation();
    onToggleMute?.(id);
  };

  const handleVolumeToggle = (event: React.MouseEvent) => {
    event.stopPropagation();
    onVolumeToggle?.(id);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Card
        onClick={(event) => {
          event.stopPropagation();
          event.preventDefault();
          menuOpen.onToggle();
        }}
        sx={{
          width: 160,
          height: 160,
          borderRadius: 1,
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: 'background.paper',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          ...(menuOpen.value && {
            boxShadow: 2,
            '& .user-card-actions': {
              opacity: 1,
              transform: 'translateY(0)',
            },
            '& .user-card-status': {
              opacity: 0,
            },
          }),
        }}
      >
        <VoiceRoomIsSpeaking statusColor={statusConfig[status].color} stream={stream} />

        <ChatUserCardPCStatus
          verified={verified}
          PCStatus={connectionStatus[socketId] || 'connected'}
        />

        <CardContent
          sx={{
            p: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          {/* Top Section - Avatar and Basic Info */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <ChatUserAvatarBadge avatar={avatar} user={user} />

            <Typography
              variant="subtitle2"
              sx={{
                mt: 0.5,
                fontWeight: 600,
                color: 'text.primary',
                textAlign: 'center',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                width: '100%',
              }}
            >
              {name}
            </Typography>
          </Box>

          <UserAudio stream={stream} isLocal={isLocal} userName={user.name} />

          {/* Hidden Quick Actions (Visible on Hover) */}
          <ChatUserCardQuickActions
            user={user}
            handleMuteToggle={handleMuteToggle}
            audioSettings={audioSettings}
            anchorEl={anchorEl}
            privateMessageEL={privateMessageEL}
            handleVolumeToggle={handleVolumeToggle}
            handleMessageClick={handleMessageClick}
            handleSettingsClick={handleSettingsClick}
            handleVolumeChange={handleVolumeChange}
          />
        </CardContent>
      </Card>

      {/* Advanced Settings Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleSettingsClose}
        onClick={(e) => e.stopPropagation()}
        PaperProps={{
          sx: {
            backgroundColor: 'background.paper',
            backdropFilter: 'blur(20px)',
            border: '1px solid',
            borderColor: 'divider',
            color: 'text.primary',
            minWidth: 200,
          },
        }}
      >
        <MenuItem>
          <ListItemText>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Audio Settings
            </Typography>
          </ListItemText>
        </MenuItem>

        <Divider />

        {/* Audio Features */}
        <MenuItem onClick={() => handleAudioSettingToggle('noiseSuppression')}>
          <ListItemIcon>
            <Hearing fontSize="small" />
          </ListItemIcon>
          <ListItemText>Noise Suppression</ListItemText>
          <Switch size="small" checked={audioSettings.noiseSuppression} color="primary" />
        </MenuItem>

        <MenuItem onClick={() => handleAudioSettingToggle('echoCancellation')}>
          <ListItemIcon>
            <GraphicEq fontSize="small" />
          </ListItemIcon>
          <ListItemText>Echo Cancellation</ListItemText>
          <Switch size="small" checked={audioSettings.echoCancellation} color="primary" />
        </MenuItem>

        <MenuItem onClick={() => handleAudioSettingToggle('autoGainControl')}>
          <ListItemIcon>
            <VolumeUp fontSize="small" />
          </ListItemIcon>
          <ListItemText>Auto Gain</ListItemText>
          <Switch size="small" checked={audioSettings.autoGainControl} color="primary" />
        </MenuItem>

        <Divider />

        {/* Audio Quality */}
        <MenuItem>
          <ListItemIcon>
            <Headphones fontSize="small" />
          </ListItemIcon>
          <ListItemText>Quality</ListItemText>
        </MenuItem>

        {(['low', 'medium', 'high'] as AudioQuality[]).map((quality) => (
          <MenuItem
            key={quality}
            onClick={() => handleQualityChange(quality)}
            sx={{
              backgroundColor:
                audioSettings.audioQuality === quality
                  ? varAlpha(theme.vars.palette.action.selectedChannel, 0.4)
                  : 'transparent',
              pl: 4,
            }}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              <FiberManualRecord
                sx={{
                  fontSize: 12,
                  color: qualityColors[quality],
                }}
              />
            </ListItemIcon>
            <ListItemText>
              <Typography sx={{ textTransform: 'capitalize', fontSize: '0.875rem' }}>
                {quality}
              </Typography>
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>

      <Menu
        anchorEl={privateMessageEL}
        open={Boolean(privateMessageEL)}
        onClose={handleMessageClose}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        anchorOrigin={{
          vertical: isMobile ? 'bottom' : 'top',
          horizontal: isMobile ? 'center' : 'left',
        }}
        transformOrigin={{
          vertical: isMobile ? 'bottom' : 'top',
          horizontal: isMobile ? 'center' : 'left',
        }}
        PaperProps={{
          sx: {
            backgroundColor: 'background.paper',
            backdropFilter: 'blur(20px)',
            border: '1px solid',
            borderColor: 'divider',
            color: 'text.primary',
            minWidth: 200,
          },
        }}
      >
        <VoiceRoomMessageIndividual />
      </Menu>
    </Box>
  );
};
