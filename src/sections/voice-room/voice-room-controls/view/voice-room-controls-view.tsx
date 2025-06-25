import type { User, VoiceRoomSettings } from 'src/types/room';

import React, { useState, useEffect } from 'react';

import {
  Mic,
  MicOff,
  Headset,
  VolumeUp,
  Settings,
  GraphicEq,
  HeadsetOff,
  RecordVoiceOver,
} from '@mui/icons-material';
import {
  Box,
  Menu,
  Badge,
  Slider,
  Switch,
  Tooltip,
  Divider,
  MenuItem,
  IconButton,
  Typography,
  FormControlLabel,
} from '@mui/material';

interface VoiceControlsProps {
  currentUser: User;
  isHost: boolean;
  voiceSettings: VoiceRoomSettings;
  onMuteToggle: () => void;
  onDeafenToggle: () => void;
  onVolumeChange: (volume: number) => void;
  onSettingsChange: (settings: Partial<VoiceRoomSettings>) => void;
}

export const VoiceRoomControls: React.FC<VoiceControlsProps> = ({
  currentUser,
  isHost,
  voiceSettings,
  onMuteToggle,
  onDeafenToggle,
  onVolumeChange,
  onSettingsChange,
}) => {
  const [settingsAnchor, setSettingsAnchor] = useState<null | HTMLElement>(null);
  const [volume, setVolume] = useState(currentUser.voiceStatus.volume * 100);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate voice activity detection
      if (!currentUser.voiceStatus.isMuted && Math.random() > 0.8) {
        setIsRecording(true);
        setTimeout(() => setIsRecording(false), 500 + Math.random() * 1000);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [currentUser.voiceStatus.isMuted]);

  const handleVolumeChange = (event: Event, newValue: number | number[]) => {
    const vol = newValue as number;
    setVolume(vol);
    onVolumeChange(vol / 100);
  };

  const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchor(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setSettingsAnchor(null);
  };

  return (
    <Box
      sx={{
        flex: '0 0 auto',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 2,
        mb: 2,
        bgcolor: 'background.neutral',
        borderRadius: 2,
      }}
    >
      {/* Microphone Control */}
      <Tooltip title={currentUser.voiceStatus.isMuted ? 'Unmute' : 'Mute'}>
        <Badge
          variant="dot"
          color="success"
          invisible={!isRecording || currentUser.voiceStatus.isMuted}
          sx={{
            '& .MuiBadge-badge': {
              animation: isRecording ? 'pulse 1s infinite' : 'none',
            },
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)', opacity: 1 },
              '50%': { transform: 'scale(1.2)', opacity: 0.7 },
              '100%': { transform: 'scale(1)', opacity: 1 },
            },
          }}
        >
          <IconButton
            onClick={onMuteToggle}
            color={currentUser.voiceStatus.isMuted ? 'error' : 'primary'}
            sx={{
              bgcolor: currentUser.voiceStatus.isMuted ? 'error.light' : 'primary.light',
              '&:hover': {
                bgcolor: currentUser.voiceStatus.isMuted ? 'error.main' : 'primary.main',
              },
            }}
          >
            {currentUser.voiceStatus.isMuted ? <MicOff /> : <Mic />}
          </IconButton>
        </Badge>
      </Tooltip>

      {/* Deafen Control */}
      <Tooltip title={currentUser.voiceStatus.isDeafened ? 'Undeafen' : 'Deafen'}>
        <IconButton
          onClick={onDeafenToggle}
          color={currentUser.voiceStatus.isDeafened ? 'error' : 'default'}
          sx={{
            bgcolor: currentUser.voiceStatus.isDeafened ? 'error.light' : 'action.hover',
          }}
        >
          {currentUser.voiceStatus.isDeafened ? <HeadsetOff /> : <Headset />}
        </IconButton>
      </Tooltip>

      {/* Volume Control */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120 }}>
        <VolumeUp fontSize="small" color="action" />
        <Slider value={volume} onChange={handleVolumeChange} size="small" sx={{ flexGrow: 1 }} />
        <Typography variant="caption" sx={{ minWidth: 30, textAlign: 'right' }}>
          {Math.round(volume)}%
        </Typography>
      </Box>

      {/* Push to Talk Indicator */}
      {voiceSettings.pushToTalk && (
        <Tooltip title="Push to Talk Mode - Hold Space to speak">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1,
              py: 0.5,
              bgcolor: 'warning.light',
              borderRadius: 1,
            }}
          >
            <RecordVoiceOver fontSize="small" />
            <Typography variant="caption" sx={{ fontWeight: 500 }}>
              PTT
            </Typography>
          </Box>
        </Tooltip>
      )}

      {/* Voice Activity Indicator */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          px: 1,
          py: 0.5,
          bgcolor: isRecording ? 'success.light' : 'action.hover',
          borderRadius: 1,
          transition: 'all 0.2s',
        }}
      >
        <GraphicEq
          fontSize="small"
          sx={{
            color: isRecording ? 'success.main' : 'action.disabled',
            animation: isRecording ? 'bounce 0.5s infinite alternate' : 'none',
          }}
        />
        <Typography
          variant="caption"
          sx={{
            color: isRecording ? 'success.main' : 'text.secondary',
            fontWeight: 500,
          }}
        >
          {isRecording ? 'Speaking' : 'Quiet'}
        </Typography>
      </Box>

      {/* Settings */}
      {isHost && (
        <>
          <Tooltip title="Voice Settings">
            <IconButton onClick={handleSettingsClick}>
              <Settings />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={settingsAnchor}
            open={Boolean(settingsAnchor)}
            onClose={handleSettingsClose}
            PaperProps={{
              sx: { minWidth: 280 },
            }}
          >
            <MenuItem>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Voice Room Settings
              </Typography>
            </MenuItem>
            <Divider />

            <MenuItem>
              <FormControlLabel
                control={
                  <Switch
                    checked={voiceSettings.pushToTalk}
                    onChange={(e) => onSettingsChange({ pushToTalk: e.target.checked })}
                  />
                }
                label="Push to Talk"
              />
            </MenuItem>

            <MenuItem>
              <FormControlLabel
                control={
                  <Switch
                    checked={voiceSettings.noiseSupression}
                    onChange={(e) => onSettingsChange({ noiseSupression: e.target.checked })}
                  />
                }
                label="Noise Suppression"
              />
            </MenuItem>

            <MenuItem>
              <FormControlLabel
                control={
                  <Switch
                    checked={voiceSettings.echoCancellation}
                    onChange={(e) => onSettingsChange({ echoCancellation: e.target.checked })}
                  />
                }
                label="Echo Cancellation"
              />
            </MenuItem>

            <MenuItem>
              <FormControlLabel
                control={
                  <Switch
                    checked={voiceSettings.autoGainControl}
                    onChange={(e) => onSettingsChange({ autoGainControl: e.target.checked })}
                  />
                }
                label="Auto Gain Control"
              />
            </MenuItem>

            <Divider />

            <MenuItem>
              <Box sx={{ width: '100%' }}>
                <Typography variant="body2" gutterBottom>
                  Max Speakers: {voiceSettings.maxSpeakers}
                </Typography>
                <Slider
                  value={voiceSettings.maxSpeakers}
                  onChange={(e, value) => onSettingsChange({ maxSpeakers: value as number })}
                  min={1}
                  max={10}
                  marks
                  size="small"
                />
              </Box>
            </MenuItem>
          </Menu>
        </>
      )}
    </Box>
  );
};
