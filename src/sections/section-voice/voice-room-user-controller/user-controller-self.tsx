// src/sections/section-voice/voice-room-user-controller/user-controller-self.tsx

import useRoomSounds from '@/hooks/use-room-sounds';
import { ParticipantStageType } from '@/types/type-room';
import { fDateTime } from '@/utils/format-time';
import { useMediaDeviceSelect, useRoomContext } from '@livekit/components-react';
import { Mic as MicIcon, MicOff as MicOffIcon } from '@mui/icons-material';
import {
  alpha,
  Box,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Slider,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import React, { useState } from 'react';
import { KrispNoiseFilterToggle } from '../voice-button-krisp-noise-filter';

interface RoomUserControllerSelfProps {
  user: ParticipantStageType;
  isMuted: boolean;
}

export const RoomUserControllerSelf: React.FC<RoomUserControllerSelfProps> = ({
  user,
  isMuted,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const room = useRoomContext();
  const { playToggleMute } = useRoomSounds();

  const [micGain, setMicGain] = useState<number>(() => {
    return Number(sessionStorage.getItem('local_mic_gain') ?? 25);
  });

  const {
    devices: microphones,
    activeDeviceId: activeMicId,
    setActiveMediaDevice: setActiveMicDevice,
  } = useMediaDeviceSelect({ kind: 'audioinput', requestPermissions: true });

  const {
    devices: speakers,
    activeDeviceId: activeSpeakerId,
    setActiveMediaDevice: setActiveSpeakerDevice,
  } = useMediaDeviceSelect({ kind: 'audiooutput' });

  const sectionCardSx = {
    p: 2,
    mb: 1.5,
    borderRadius: 0.5,
    bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
    border: '1px solid',
    borderColor: isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06),
  };

  const handleToggleMic = async () => {
    if (!room?.localParticipant) return;
    const isEnabled = room.localParticipant.isMicrophoneEnabled;
    await room.localParticipant.setMicrophoneEnabled(!isEnabled, {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    });
    playToggleMute(isEnabled);
  };

  const handleMicGainChange = (_: Event, val: number | number[]) => {
    const value = Array.isArray(val) ? val[0] : val;
    setMicGain(value);
    sessionStorage.setItem('local_mic_gain', String(value));
  };

  return (
    <>
      {/* Bio / Joined Date */}
      {user.joinedAt && (
        <Paper elevation={0} sx={{ ...sectionCardSx, py: 1.25, px: 1.75 }}>
          <Typography variant="caption" color="text.disabled">
            Joined Stage:
          </Typography>{' '}
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {fDateTime(user.joinedAt)}
          </Typography>
        </Paper>
      )}

      {/* Microphone Gain & AI Filter */}
      <Paper elevation={0} sx={sectionCardSx}>
        <Typography
          variant="caption"
          fontWeight={800}
          color="text.secondary"
          sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1.5 }}
        >
          Microphone Gain & Control
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Tooltip title={isMuted ? 'Unmute' : 'Mute'} arrow>
            <IconButton
              onClick={handleToggleMic}
              sx={{
                width: 42,
                height: 42,
                borderRadius: 0.5,
                bgcolor: isMuted
                  ? alpha(theme.palette.error.main, 0.16)
                  : isDark
                    ? alpha('#fff', 0.05)
                    : alpha('#000', 0.04),
                border: '1px solid',
                borderColor: isMuted
                  ? alpha(theme.palette.error.main, 0.35)
                  : isDark
                    ? alpha('#fff', 0.08)
                    : alpha('#000', 0.08),
                color: isMuted ? 'error.main' : 'text.primary',
                '&:hover': {
                  bgcolor: isMuted
                    ? alpha(theme.palette.error.main, 0.25)
                    : alpha(theme.palette.primary.main, 0.12),
                },
              }}
            >
              {isMuted ? <MicOffIcon fontSize="small" /> : <MicIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          <Stack spacing={1.25} sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Slider
                value={micGain}
                onChange={handleMicGainChange}
                min={0}
                max={100}
                step={5}
                valueLabelDisplay="auto"
                sx={{ flex: 1 }}
              />
              <Typography
                variant="caption"
                fontWeight={700}
                sx={{ minWidth: 34, textAlign: 'right' }}
              >
                {micGain}%
              </Typography>
            </Box>

            <Divider sx={{ borderStyle: 'dashed', opacity: 0.5 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="caption" fontWeight={600} color="text.secondary">
                AI Noise Suppression
              </Typography>
              <KrispNoiseFilterToggle />
            </Box>
          </Stack>
        </Box>
      </Paper>

      {/* Hardware Devices */}
      <Paper elevation={0} sx={{ ...sectionCardSx, mb: 0 }}>
        <Typography
          variant="caption"
          fontWeight={800}
          color="text.secondary"
          sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1.5 }}
        >
          Audio Hardware Devices
        </Typography>

        <Stack spacing={1.5}>
          <FormControl fullWidth size="small">
            <InputLabel id="self-mic-select-label">Input Microphone</InputLabel>
            <Select
              labelId="self-mic-select-label"
              value={activeMicId || ''}
              label="Input Microphone"
              onChange={(e) => setActiveMicDevice(e.target.value)}
              sx={{
                borderRadius: 0.5,
                bgcolor: isDark ? alpha('#fff', 0.02) : 'transparent',
              }}
            >
              {microphones.map((d) => (
                <MenuItem key={d.deviceId} value={d.deviceId}>
                  {d.label || `Microphone (${d.deviceId.slice(0, 5)})`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" disabled={speakers.length === 0}>
            <InputLabel id="self-speaker-select-label">Output Speaker</InputLabel>
            <Select
              labelId="self-speaker-select-label"
              value={activeSpeakerId || ''}
              label="Output Speaker"
              onChange={(e) => setActiveSpeakerDevice(e.target.value)}
              sx={{
                borderRadius: 0.5,
                bgcolor: isDark ? alpha('#fff', 0.02) : 'transparent',
              }}
            >
              {speakers.map((d) => (
                <MenuItem key={d.deviceId} value={d.deviceId}>
                  {d.label || `Speaker (${d.deviceId.slice(0, 5)})`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>
    </>
  );
};
