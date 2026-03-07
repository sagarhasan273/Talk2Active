import MicIcon from '@mui/icons-material/Mic';
import { Box, Stack, Paper, Slider, Typography } from '@mui/material';

import { useRoomTools } from 'src/core/slices/slice-room';
import { useWebRTCContext } from 'src/core/contexts/webRTC-context';

export function VoiceAudioControls() {
  const { userVoiceState, updateUserVoiceState } = useRoomTools();

  const { micGain, isMicMuted } = userVoiceState;

  const { setMicrophoneGain } = useWebRTCContext();

  const handleMicLevelChange = (level: number) => {
    setMicrophoneGain(level);
    updateUserVoiceState({ micGain: level });
  };

  return (
    <Paper sx={{ p: 1.5, pb: 0.5, backgroundColor: 'background.neutral', maxWidth: 1 }}>
      <Stack spacing={0.5}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MicIcon sx={{ color: 'grey.500', fontSize: 16 }} />

              <Typography variant="caption">Microphone</Typography>
            </Box>
            <Typography variant="caption">{micGain}%</Typography>
          </Box>
          <Slider
            value={micGain}
            onChange={(_, value) => handleMicLevelChange(value)}
            min={0}
            max={100}
            step={1}
            disabled={isMicMuted}
            size="small"
            sx={{
              p: '4px 0',
              '& .MuiSlider-track': {
                height: 5,
                background: isMicMuted
                  ? 'grey.500'
                  : (theme) =>
                      `linear-gradient(90deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
              },
              '& .MuiSlider-thumb': {
                width: 16,
                height: 16,
                '&:hover, &.Mui-focusVisible': {
                  boxShadow: (theme) => `0 0 0 6px ${theme.palette.primary.main}20`,
                },
              },
            }}
          />
        </Box>

        {/* Speaker Volume Control */}
        {/* <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VolumeUpIcon color="primary" sx={{ color: 'grey.500', fontSize: 16 }} />
              <Typography variant="caption">
                {isDeafened ? 'Deafened' : 'Speaker Volume'}
              </Typography>
            </Box>
            <Typography variant="caption">{volume}%</Typography>
          </Box>
          <Slider
            value={volume}
            onChange={(_, value) => handleVolumeChange(value)}
            min={0}
            max={100}
            step={1}
            disabled={isDeafened}
            size="small"
            sx={{
              p: '4px 0',
              '& .MuiSlider-track': {
                height: 5, // Reduced track height
                background: isMicMuted
                  ? 'grey.500'
                  : (theme) =>
                      `linear-gradient(90deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
              },
              '& .MuiSlider-thumb': {
                width: 16,
                height: 16,
                '&:hover, &.Mui-focusVisible': {
                  boxShadow: (theme) => `0 0 0 6px ${theme.palette.primary.main}20`,
                },
              },
            }}
          />
        </Box> */}

        {/* Audio Settings Summary */}
        {/* <Box sx={{ mt: 1, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
          <Typography variant="caption" display="block" color="text.secondary">
            Audio Processing:
          </Typography>
          <Typography variant="caption" display="block">
            Echo Cancellation: {audioSettings.echoCancellation ? '✅' : '❌'}
          </Typography>
          <Typography variant="caption" display="block">
            Noise Suppression: {audioSettings.noiseSuppression ? '✅' : '❌'}
          </Typography>
          <Typography variant="caption" display="block">
            Auto Gain Control: {audioSettings.autoGainControl ? '✅' : '❌'}
          </Typography>
        </Box> */}
      </Stack>
    </Paper>
  );
}
