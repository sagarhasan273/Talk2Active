import React, { useState } from 'react';

import {
  Mic,
  MicOff,
  Hearing,
  VolumeUp,
  Settings,
  VolumeOff,
  GraphicEq,
  Headphones,
  FiberManualRecord,
} from '@mui/icons-material';
import {
  Box,
  Card,
  Chip,
  Fade,
  Menu,
  Avatar,
  Switch,
  Slider,
  Tooltip,
  Divider,
  Collapse,
  MenuItem,
  Typography,
  IconButton,
  CardContent,
  ListItemIcon,
  ListItemText,
} from '@mui/material';

// Types
type UserStatus = 'online' | 'offline' | 'busy' | 'brb' | 'afk' | 'zzz';
type AudioQuality = 'low' | 'medium' | 'high';

interface UserCardProps {
  user: {
    id: string;
    name: string;
    avatar?: string;
    status: UserStatus;
    isSpeaking?: boolean;
    isMuted?: boolean;
    volume?: number;
    audioQuality?: AudioQuality;
  };
  showSettings?: boolean;
  onSettingsChange?: (settings: any) => void;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  showSettings: externalShowSettings,
  onSettingsChange,
}) => {
  const [localShowSettings, setLocalShowSettings] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [audioSettings, setAudioSettings] = useState({
    noiseSuppression: true,
    echoCancellation: true,
    autoGainControl: true,
    volume: user.volume || 75,
    audioQuality: user.audioQuality || ('high' as AudioQuality),
  });

  const showSettings = externalShowSettings ?? localShowSettings;

  const { name, avatar, status, isSpeaking = false, isMuted = false } = user;

  // Status configurations
  const statusConfig = {
    online: { color: '#00E676', label: 'Online', emoji: '🟢' },
    offline: { color: '#9E9E9E', label: 'Offline', emoji: '⚫' },
    busy: { color: '#FF4444', label: 'Busy', emoji: '🔴' },
    brb: { color: '#FFAA00', label: 'BRB', emoji: '🟡' },
    afk: { color: '#FFBB33', label: 'AFK', emoji: '🟠' },
    zzz: { color: '#9C27B0', label: 'Sleeping', emoji: '💤' },
  };

  // Audio quality colors
  const qualityColors = {
    low: '#ff4444',
    medium: '#ffaa00',
    high: '#00c853',
  };

  const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) => {
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

  return (
    <Box sx={{ position: 'relative' }}>
      <Card
        onMouseEnter={() => setLocalShowSettings(true)}
        onMouseLeave={() => setLocalShowSettings(false)}
        sx={{
          width: 160,
          height: 160,
          borderRadius: 3,
          position: 'relative',
          overflow: 'visible',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          border: `2px solid ${isSpeaking ? statusConfig[status].color : '#404040'}`,
          boxShadow: isSpeaking
            ? `0 0 30px ${statusConfig[status].color}40, inset 0 1px 0 rgba(255,255,255,0.1)`
            : '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            borderColor: statusConfig[status].color,
          },
        }}
      >
        {/* Status Corner Indicator */}
        <Box
          sx={{
            position: 'absolute',
            top: -2,
            right: -2,
            width: 24,
            height: 24,
            borderRadius: '50%',
            backgroundColor: statusConfig[status].color,
            border: '3px solid #1a1a1a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
            zIndex: 2,
          }}
        >
          {statusConfig[status].emoji}
        </Box>

        {/* Speaking Animation */}
        {isSpeaking && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 3,
              border: `2px solid ${statusConfig[status].color}`,
              animation: 'ripple 2s infinite',
              '@keyframes ripple': {
                '0%': {
                  opacity: 1,
                  transform: 'scale(1)',
                },
                '100%': {
                  opacity: 0,
                  transform: 'scale(1.05)',
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
            zIndex: 1,
          }}
        >
          {/* Top Section - Avatar and Basic Info */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar
              src={avatar}
              sx={{
                width: 64,
                height: 64,
                mb: 1,
                border: `2px solid ${statusConfig[status].color}`,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                background: 'linear-gradient(135deg, #333, #555)',
              }}
            >
              {name.charAt(0).toUpperCase()}
            </Avatar>

            <Typography
              variant="h6"
              sx={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'white',
                textAlign: 'center',
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                width: '100%',
              }}
            >
              {name}
            </Typography>
          </Box>

          {/* Hidden Settings Panel */}
          <Collapse in={showSettings} timeout={300}>
            <Box
              sx={{
                backgroundColor: 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                p: 1.5,
                mt: 1,
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {/* Quick Actions */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Tooltip title={isMuted ? 'Unmute' : 'Mute'}>
                  <IconButton
                    size="small"
                    sx={{
                      backgroundColor: isMuted ? '#ff4444' : 'rgba(255,255,255,0.1)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: isMuted ? '#cc3333' : 'rgba(255,255,255,0.2)',
                      },
                    }}
                  >
                    {isMuted ? <MicOff /> : <Mic />}
                  </IconButton>
                </Tooltip>

                <Tooltip title="Audio Settings">
                  <IconButton
                    size="small"
                    onClick={handleSettingsClick}
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.2)',
                      },
                    }}
                  >
                    <Settings />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Volume">
                  <IconButton
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      color: audioSettings.volume === 0 ? '#ff4444' : 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.2)',
                      },
                    }}
                  >
                    {audioSettings.volume === 0 ? <VolumeOff /> : <VolumeUp />}
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
          </Collapse>

          {/* Status Indicator (shown when settings are hidden) */}
          {!showSettings && (
            <Fade in={!showSettings}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                <Chip
                  label={status.toUpperCase()}
                  size="small"
                  sx={{
                    backgroundColor: statusConfig[status].color,
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.65rem',
                    height: 20,
                    '& .MuiChip-label': {
                      px: 1,
                    },
                  }}
                />
              </Box>
            </Fade>
          )}
        </CardContent>
      </Card>

      {/* Advanced Settings Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleSettingsClose}
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(45, 45, 45, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'white',
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

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

        {/* Audio Features */}
        <MenuItem onClick={() => handleAudioSettingToggle('noiseSuppression')}>
          <ListItemIcon>
            <Hearing sx={{ color: 'white', fontSize: 20 }} />
          </ListItemIcon>
          <ListItemText>Noise Suppression</ListItemText>
          <Switch
            size="small"
            checked={audioSettings.noiseSuppression}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: qualityColors[audioSettings.audioQuality],
              },
            }}
          />
        </MenuItem>

        <MenuItem onClick={() => handleAudioSettingToggle('echoCancellation')}>
          <ListItemIcon>
            <GraphicEq sx={{ color: 'white', fontSize: 20 }} />
          </ListItemIcon>
          <ListItemText>Echo Cancellation</ListItemText>
          <Switch
            size="small"
            checked={audioSettings.echoCancellation}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: qualityColors[audioSettings.audioQuality],
              },
            }}
          />
        </MenuItem>

        <MenuItem onClick={() => handleAudioSettingToggle('autoGainControl')}>
          <ListItemIcon>
            <VolumeUp sx={{ color: 'white', fontSize: 20 }} />
          </ListItemIcon>
          <ListItemText>Auto Gain</ListItemText>
          <Switch
            size="small"
            checked={audioSettings.autoGainControl}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: qualityColors[audioSettings.audioQuality],
              },
            }}
          />
        </MenuItem>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

        {/* Audio Quality */}
        <MenuItem>
          <ListItemIcon>
            <Headphones sx={{ color: 'white', fontSize: 20 }} />
          </ListItemIcon>
          <ListItemText>Quality</ListItemText>
        </MenuItem>

        {(['low', 'medium', 'high'] as AudioQuality[]).map((quality) => (
          <MenuItem
            key={quality}
            onClick={() => handleQualityChange(quality)}
            sx={{
              backgroundColor:
                audioSettings.audioQuality === quality ? 'rgba(255,255,255,0.1)' : 'transparent',
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

// Example Usage Component
const UserCardShowcase: React.FC = () => {
  const [users, setUsers] = useState([
    {
      id: '1',
      name: 'Alex Chen',
      status: 'online' as UserStatus,
      isSpeaking: true,
      isMuted: false,
      volume: 85,
      audioQuality: 'high' as AudioQuality,
    },
    {
      id: '2',
      name: 'Sam Rivera',
      status: 'busy' as UserStatus,
      isSpeaking: false,
      isMuted: true,
      volume: 0,
      audioQuality: 'medium' as AudioQuality,
    },
    {
      id: '3',
      name: 'Taylor Kim',
      status: 'afk' as UserStatus,
      isSpeaking: false,
      isMuted: false,
      volume: 60,
      audioQuality: 'high' as AudioQuality,
    },
    {
      id: '4',
      name: 'Jordan Smith',
      status: 'zzz' as UserStatus,
      isSpeaking: false,
      isMuted: true,
      volume: 30,
      audioQuality: 'low' as AudioQuality,
    },
  ]);

  const handleSettingsChange = (userId: string, settings: any) => {
    console.log(`Settings changed for ${userId}:`, settings);
    // Update user settings in your state management
  };

  return (
    <Box
      sx={{
        p: 4,
        background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%)',
        minHeight: '100vh',
      }}
    >
      <Typography
        variant="h4"
        sx={{
          color: 'white',
          textAlign: 'center',
          mb: 4,
          fontWeight: 700,
          textShadow: '0 2px 4px rgba(0,0,0,0.5)',
        }}
      >
        Voice Chat - Hidden Settings
      </Typography>

      <Typography
        variant="body1"
        sx={{
          color: 'rgba(255,255,255,0.7)',
          textAlign: 'center',
          mb: 6,
          maxWidth: 600,
          margin: '0 auto',
        }}
      >
        Hover over cards to reveal audio controls and settings
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 3,
          maxWidth: 800,
          margin: '0 auto',
        }}
      >
        {users.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            onSettingsChange={(settings) => handleSettingsChange(user.id, settings)}
          />
        ))}
      </Box>
    </Box>
  );
};

export default UserCardShowcase;
