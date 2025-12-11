import React from 'react';

import { Box, Slider, Tooltip, useTheme, IconButton } from '@mui/material';
import { Mic, MicOff, Message, VolumeUp, Settings, VolumeOff } from '@mui/icons-material';

import { varAlpha } from 'src/theme/styles';

import type { ChatUserCardAudioSettings } from './type';
import type { ChatUserCardProps } from './chat-user-card';

export function ChatUserCardQuickActions({
  handleMuteToggle,
  user,
  audioSettings,
  anchorEl,
  privateMessageEL,
  handleVolumeToggle,
  handleMessageClick,
  handleSettingsClick,
  handleVolumeChange,
}: {
  user: ChatUserCardProps['user'];
  audioSettings: ChatUserCardAudioSettings;
  anchorEl: HTMLElement | null;
  privateMessageEL: HTMLElement | null;
  handleMuteToggle: (event: React.MouseEvent<HTMLElement>) => void;
  handleVolumeToggle: (event: React.MouseEvent<HTMLElement>) => void;
  handleMessageClick: (event: React.MouseEvent<HTMLElement>) => void;
  handleSettingsClick: (event: React.MouseEvent<HTMLElement>) => void;
  handleVolumeChange: (event: Event, value: number | number[]) => void;
}) {
  const theme = useTheme();

  const { isMuted = false } = user;

  // Audio quality colors
  const qualityColors = {
    low: '#ff4444',
    medium: '#ffaa00',
    high: '#00c853',
  };

  return (
    <Box
      className="user-card-actions"
      sx={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        left: 0,
        opacity: 0,
        transform: anchorEl || privateMessageEL ? 'translateY(0px)' : 'translateY(30px)',
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

        <Tooltip title="Private Message">
          <IconButton
            size="small"
            onClick={handleMessageClick}
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
  );
}
