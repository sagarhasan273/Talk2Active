import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import HeadsetIcon from '@mui/icons-material/Headset';
import SettingsIcon from '@mui/icons-material/Settings';
import HeadsetOffIcon from '@mui/icons-material/HeadsetOff';
import {
  Box,
  Fade,
  Stack,
  Paper,
  Badge,
  Tooltip,
  Collapse,
  Typography,
  IconButton,
} from '@mui/material';

import useWebRTC from 'src/hooks/use-web-rtc';

import { useRoomTools, selectAccount } from 'src/core/slices';

import { AvatarUser } from 'src/components/avatar-user';

import { VoiceAudioControls } from '../voice-audio-controls';

const VoiceUserProfileView = () => {
  const user = useSelector(selectAccount);
  const [showAudioControls, setShowAudioControls] = useState(false);

  const { userVoiceState, updateUserVoiceState } = useRoomTools();

  const { isMicMuted, isDeafened, volume } = userVoiceState;

  const { setMicrophoneGain, setMicrophoneVolume, toggleMicrophone } = useWebRTC();

  const handleMicLevelChange = (level: number) => {
    setMicrophoneGain(level);
    updateUserVoiceState({ micGain: level });
  };

  const handleVolumeChange = (level: number) => {
    setMicrophoneVolume(level);
    updateUserVoiceState({ volume: level });
  };

  const handleDeafen = () => {
    updateUserVoiceState({ isDeafened: !isDeafened });
    if (!isDeafened) {
      // Mute both mic and speaker when deafening
      setMicrophoneVolume(0); // Mute speaker
      if (!isMicMuted) toggleMicrophone(); // Mute mic
    } else {
      // Restore previous volumes when undeafening
      setMicrophoneVolume(volume);
      if (isMicMuted) toggleMicrophone(); // Unmute mic
    }
  };

  const toggleAudioControls = () => {
    setShowAudioControls(!showAudioControls);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        width: 1,
        bgcolor: 'background.paper',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid divider',
        mb: 1,
        transition: 'all 0.3s ease',
      }}
    >
      {/* Profile Header Container */}
      <Box sx={{ p: '16px 16px 8px 16px' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant="dot"
            sx={{
              '& .MuiBadge-badge': {
                backgroundColor: 'success.main',
                color: 'success.main',
                boxShadow: '0 0 0 2px #232428',
                width: 10,
                height: 10,
                borderRadius: '50%',
              },
            }}
          >
            <AvatarUser
              avatarUrl={user?.profilePhoto}
              verified={Boolean(user?.verified)}
              name={user?.name}
            />
          </Badge>

          <Box sx={{ overflow: 'hidden' }}>
            <Typography
              variant="subtitle2"
              sx={{ color: 'text.primary', fontWeight: 700, lineHeight: 1.2 }}
            >
              {user.name}
            </Typography>
            <Typography variant="caption" sx={{ color: '#b5bac1', display: 'block' }}>
              {user.username}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Mic Input Visualization (Simulated) */}
      <Box sx={{ px: 2, mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {[2, 5, 8, 4, 3, 6, 4].map((h, i) => (
          <Box
            key={i}
            sx={{
              width: 4,
              height: h * 1.5,
              bgcolor: !isMicMuted ? 'success.main' : 'error.main',
              borderRadius: 1,
              transition: 'height 0.2s ease',
            }}
          />
        ))}
        <Typography
          variant="caption"
          sx={{
            ml: 1,
            color: !isMicMuted ? 'success.main' : 'error.main',
            fontSize: '0.65rem',
            fontWeight: 600,
          }}
        >
          {isMicMuted ? 'MUTED' : 'VOICE CONNECTED'}
        </Typography>
      </Box>

      {/* Control Strip */}
      <Box
        sx={{
          bgcolor: 'background.neutral',
          px: 1,
          py: 0.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Mute">
            <IconButton
              size="small"
              onClick={() => updateUserVoiceState({ isMicMuted: !isMicMuted })}
              sx={{
                color: isMicMuted ? 'error.main' : '#b5bac1',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'divider',
                  color: isMicMuted ? 'error.main' : 'primary.main',
                  transform: 'scale(1.1)',
                },
              }}
            >
              {isMicMuted ? <MicOffIcon fontSize="small" /> : <MicIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Deafen">
            <IconButton
              size="small"
              onClick={handleDeafen}
              sx={{
                color: isDeafened ? 'error.main' : '#b5bac1',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'divider',
                  color: isDeafened ? 'error.main' : 'primary.main',
                  transform: 'scale(1.1)',
                },
              }}
            >
              {isDeafened ? <HeadsetOffIcon fontSize="small" /> : <HeadsetIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Stack>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {/* Settings Toggle Button with Animation */}
          <IconButton
            size="small"
            onClick={toggleAudioControls}
            sx={{
              color: showAudioControls ? 'primary.main' : 'grey.500',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: 'divider',
                transform: 'rotate(90deg)',
              },
              transform: showAudioControls ? 'rotate(90deg)' : 'rotate(0deg)',
            }}
          >
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Voice Audio Controls with Collapse Animation */}
      <Collapse in={showAudioControls} timeout={400} easing="cubic-bezier(0.4, 0, 0.2, 1)">
        <Box
          sx={{
            overflow: 'hidden',
            animation: showAudioControls ? 'slideIn 0.4s ease' : 'none',
            '@keyframes slideIn': {
              '0%': {
                opacity: 0,
                transform: 'translateY(-10px)',
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0)',
              },
            },
          }}
        >
          <VoiceAudioControls
            onMicLevelChange={handleMicLevelChange}
            onVolumeChange={handleVolumeChange}
          />
        </Box>
      </Collapse>

      {/* Optional: Add a subtle gradient border when controls are expanded */}
      {showAudioControls && (
        <Fade in={showAudioControls} timeout={500}>
          <Box
            sx={{
              height: '15px',
              background: 'linear-gradient(90deg, transparent, primary.main, transparent)',
              opacity: 0.5,
            }}
          />
        </Fade>
      )}

      {/* Optional: Add a subtle background highlight when controls are not expanded */}
      {!showAudioControls && (
        <Fade in={!showAudioControls} timeout={500}>
          <Box
            sx={{
              height: '15px',
              background: 'linear-gradient(90deg, transparent, success.main, transparent)',
              opacity: 0.5,
            }}
          />
        </Fade>
      )}
    </Paper>
  );
};

export default VoiceUserProfileView;
