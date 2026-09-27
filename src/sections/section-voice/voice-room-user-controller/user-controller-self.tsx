import useRoomSounds from '@/hooks/use-room-sounds';
import { ParticipantStageType } from '@/types/type-room';
import { fDateTime } from '@/utils/format-time';
import { useMediaDeviceSelect, useRoomContext } from '@livekit/components-react';
import {
  Mic as MicIcon,
  MicOff as MicOffIcon,
} from '@mui/icons-material';
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

export const RoomUserControllerSelf: React.FC<RoomUserControllerSelfProps> = ({ user, isMuted }) => {
  const theme = useTheme();
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
      {/* Microphone Gain & AI Filter */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 1.5,
          borderRadius: 1,
          bgcolor: alpha(theme.palette.text.primary, 0.03),
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        }}
      >
        <Typography
          variant="caption"
          fontWeight={800}
          color="text.secondary"
          sx={{ textTransform: 'uppercase', display: 'block', mb: 1.5 }}
        >
          Microphone Gain & Control
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Tooltip title={isMuted ? 'Unmute' : 'Mute'}>
            <IconButton
              onClick={handleToggleMic}
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                bgcolor: isMuted ? 'error.main' : alpha(theme.palette.text.primary, 0.06),
                color: isMuted ? '#fff' : 'text.primary',
                '&:hover': {
                  bgcolor: isMuted ? 'error.dark' : alpha(theme.palette.primary.main, 0.12),
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
              <Typography variant="caption" fontWeight={700} sx={{ minWidth: 32 }}>
                {micGain}%
              </Typography>
            </Box>

            <Divider sx={{ borderStyle: 'dashed', opacity: 0.6 }} />

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
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 1.5,
          borderRadius: 1,
          bgcolor: alpha(theme.palette.text.primary, 0.03),
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        }}
      >
        <Typography
          variant="caption"
          fontWeight={800}
          color="text.secondary"
          sx={{ textTransform: 'uppercase', display: 'block', mb: 1.5 }}
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

      {/* Bio / Joined Date */}
      {user.joinedAt && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 1,
            bgcolor: alpha(theme.palette.text.primary, 0.03),
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          }}
        >
          <Typography variant="caption" color="text.disabled">
            Joined At:
          </Typography>{' '}
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {fDateTime(user.joinedAt)}
          </Typography>
        </Paper>
      )}
    </>
  );
};
