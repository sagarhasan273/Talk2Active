import MicIcon from '@mui/icons-material/Mic';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { Box, Stack, Paper, Slider, Typography } from '@mui/material';

import { useRoomTools } from 'src/core/slices/slice-room';

interface AudioControlsProps {
  onMicLevelChange: (level: number) => void;
  onVolumeChange: (level: number) => void;
}

export function VoiceAudioControls({ onMicLevelChange, onVolumeChange }: AudioControlsProps) {
  const { userVoiceState } = useRoomTools();
  const { volume, micGain, isMicMuted, isDeafened } = userVoiceState;

  return (
    <Paper sx={{ p: 1.5, pb: 0.5, maxWidth: 1 }}>
      <Stack spacing={0.5}>
        {/* Microphone Control */}
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
            onChange={(_, value) => onMicLevelChange(value as number)}
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
        <Box>
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
            onChange={(_, value) => onVolumeChange(value as number)}
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
        </Box>

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
