import React, { useState } from 'react';

import {
  Mic,
  MicOff,
  Hearing,
  Message,
  VolumeUp,
  Settings,
  VolumeOff,
  GraphicEq,
  Headphones,
  FiberManualRecord,
  MicOff as MicOffIcon,
} from '@mui/icons-material';
import {
  Box,
  Card,
  Menu,
  Badge,
  Avatar,
  Switch,
  Slider,
  Tooltip,
  Divider,
  MenuItem,
  useTheme,
  Typography,
  IconButton,
  CardContent,
  ListItemIcon,
  ListItemText,
} from '@mui/material';

import { varAlpha } from 'src/theme/styles';

import UserAudio from './user-audio';
import { STATUS_OPTIONS } from './voice-room-status-button';

// Types
type UserStatus = 'online' | 'offline' | 'busy' | 'brb' | 'afk' | 'zzz';
type AudioQuality = 'low' | 'medium' | 'high';

interface VoiceRoomUserAudioCardProps {
  user: {
    id: string;
    name: string;
    avatar: string;
    status: UserStatus;
    isSpeaking: boolean;
    isMuted: boolean;
    volume?: number;
    audioQuality?: AudioQuality;
  };
  stream: MediaStream | null;
  isLocal: boolean;
  showSettings?: boolean;
  onSettingsChange?: (settings: any) => void;
  onToggleMute?: (userId: string) => void;
  onVolumeToggle?: (userId: string) => void;
}

export const VoiceRoomUserAudioCard: React.FC<VoiceRoomUserAudioCardProps> = ({
  user,
  showSettings: externalShowSettings,
  onSettingsChange,
  stream,
  isLocal,
  onToggleMute,
  onVolumeToggle,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [audioSettings, setAudioSettings] = useState({
    noiseSuppression: true,
    echoCancellation: true,
    autoGainControl: true,
    volume: user.volume || 75,
    audioQuality: user.audioQuality || ('high' as AudioQuality),
  });

  const { name, avatar, status = 'online', isMuted = false, id } = user;

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

  const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
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

  const theme = useTheme();

  // Safely resolve palette tokens like 'success.mainChannel' to a concrete value
  const palette = theme.vars.palette as unknown as Record<string, any>;

  const bgColorValue = (bgColorToken: string) => {
    if (!bgColorToken || typeof bgColorToken !== 'string') return undefined;
    const parts = bgColorToken.split('.');
    if (parts.length === 2) {
      const [group, shade] = parts;
      return palette[group]?.[shade];
    }
    // fallback to direct key access if token is a single segment
    return palette[bgColorToken];
  };

  const statusColor = bgColorValue(statusConfig[status]?.color || 'primary.main');

  return (
    <Box sx={{ position: 'relative' }}>
      <Card
        sx={{
          width: 160,
          height: 160,
          borderRadius: 1,
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: 'background.paper',
          boxShadow: isSpeaking ? `0 0 0 2px ${statusColor}40` : 'none',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: 2,
            '& .user-card-actions': {
              opacity: 1,
              transform: 'translateY(0)',
            },
            '& .user-card-status': {
              opacity: 0,
              transform: 'translateY(-50px)',
            },
          },
        }}
      >
        {isSpeaking && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              border: `2px solid ${statusColor}`,
              borderRadius: 1,
              animation: 'ripple 2s infinite',
              '@keyframes ripple': {
                '0%': {
                  opacity: 0.53,
                  transform: 'scale(1)',
                },
                '100%': {
                  opacity: 0,
                  transform: 'scale(1.15)',
                },
              },
            }}
          />
        )}
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
            <Badge
              overlap="circular"
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              badgeContent={
                user.isMuted ? (
                  <MicOffIcon
                    fontSize="small"
                    sx={{
                      color: 'error.main',
                      bgcolor: 'background.paper',
                      borderRadius: '50%',
                      p: 0.25,
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      borderRadius: '50%',
                      background: `${theme.palette.background.paper}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {(() => {
                      const Icon = statusConfig[status].icon;
                      return (
                        <Icon
                          style={{
                            color: statusColor,
                            width: 18,
                            height: 18,
                          }}
                        />
                      );
                    })()}
                  </Box>
                )
              }
            >
              <Avatar
                src={avatar}
                sx={{
                  width: 92,
                  height: 92,
                  mb: 1,
                  border: `2px solid ${statusColor}`,
                  background: 'linear-gradient(135deg, #333, #555)',
                }}
              >
                {name.charAt(0).toUpperCase()}
              </Avatar>
            </Badge>

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

          <UserAudio
            stream={stream}
            isLocal={isLocal}
            userName={user.name}
            isSpeaking={isSpeaking}
            setIsSpeaking={setIsSpeaking}
          />

          {/* Hidden Quick Actions (Visible on Hover) */}
          <Box
            className="user-card-actions"
            sx={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              left: 0,
              opacity: 0,
              transform: 'translateY(50px)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'background.neutral',
              gap: 1,
              p: 1,
              zIndex: 2,
            }}
          >
            {/* Quick Action Buttons */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 1,
              }}
            >
              <Tooltip title={isMuted ? 'Unmute' : 'Mute'}>
                <IconButton
                  size="small"
                  onClick={handleMuteToggle}
                  sx={{
                    borderRadius: 1,
                    backgroundColor: isMuted
                      ? 'error.main'
                      : varAlpha(theme.vars.palette.primary.mainChannel, 0.16),
                    color: isMuted ? 'error.contrastText' : 'primary.main',
                    '&:hover': {
                      backgroundColor: isMuted
                        ? 'error.dark'
                        : varAlpha(theme.vars.palette.primary.mainChannel, 0.24),
                    },
                  }}
                >
                  {isMuted ? <MicOff sx={{ fontSize: 18 }} /> : <Mic sx={{ fontSize: 18 }} />}
                </IconButton>
              </Tooltip>

              <Tooltip title={audioSettings.volume === 0 ? 'Unmute volume' : 'Mute volume'}>
                <IconButton
                  size="small"
                  onClick={handleVolumeToggle}
                  sx={{
                    borderRadius: 1,
                    backgroundColor:
                      audioSettings.volume === 0
                        ? 'warning.main'
                        : varAlpha(theme.vars.palette.success.mainChannel, 0.16),
                    color: audioSettings.volume === 0 ? 'warning.contrastText' : 'success.main',
                    '&:hover': {
                      backgroundColor:
                        audioSettings.volume === 0
                          ? 'warning.dark'
                          : varAlpha(theme.vars.palette.success.mainChannel, 0.24),
                    },
                  }}
                >
                  {audioSettings.volume === 0 ? (
                    <VolumeOff sx={{ fontSize: 18 }} />
                  ) : (
                    <VolumeUp sx={{ fontSize: 18 }} />
                  )}
                </IconButton>
              </Tooltip>

              <Tooltip title="Audio Settings">
                <IconButton
                  size="small"
                  onClick={handleSettingsClick}
                  sx={{
                    borderRadius: 1,
                    backgroundColor: varAlpha(theme.vars.palette.primary.mainChannel, 0.16),
                    color: 'primary.main',
                    '&:hover': {
                      color: 'primary.main',
                      backgroundColor: varAlpha(theme.vars.palette.primary.mainChannel, 0.24),
                    },
                  }}
                >
                  <Message sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Audio Settings">
                <IconButton
                  size="small"
                  onClick={handleSettingsClick}
                  sx={{
                    borderRadius: 1,
                    backgroundColor: varAlpha(theme.vars.palette.info.mainChannel, 0.16),
                    color: 'info.main',
                    '&:hover': {
                      backgroundColor: varAlpha(theme.vars.palette.info.mainChannel, 0.24),
                    },
                  }}
                >
                  <Settings sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Volume Slider */}
            <Box sx={{ px: 0.5 }}>
              <Slider
                size="small"
                value={audioSettings.volume}
                onChange={handleVolumeChange}
                sx={{
                  color: qualityColors[audioSettings.audioQuality],
                  '& .MuiSlider-track': {
                    background: `linear-gradient(90deg, #ff4444, #ffaa00, #00c853)`,
                  },
                  '& .MuiSlider-thumb': {
                    backgroundColor: qualityColors[audioSettings.audioQuality],
                    '&:hover': {
                      boxShadow: `0 0 0 8px ${qualityColors[audioSettings.audioQuality]}20`,
                    },
                  },
                }}
              />
            </Box>
          </Box>
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
    </Box>
  );
};
