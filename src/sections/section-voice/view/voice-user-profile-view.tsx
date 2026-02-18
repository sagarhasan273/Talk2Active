import React, { useState } from 'react';

import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import HeadsetIcon from '@mui/icons-material/Headset';
import SettingsIcon from '@mui/icons-material/Settings';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import HeadsetOffIcon from '@mui/icons-material/HeadsetOff';
import { Box, Stack, Paper, Badge, Slider, Tooltip, Typography, IconButton } from '@mui/material'; // For input level visualization
import { useSelector } from 'react-redux';

import { selectAccount } from 'src/core/slices';

import { AvatarUser } from 'src/components/avatar-user';

const VoiceUserProfileView = () => {
  const user = useSelector(selectAccount);

  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [volume, setVolume] = useState(80);

  return (
    <Paper
      elevation={0}
      sx={{
        width: 1,
        bgcolor: 'background.paper', // Discord-inspired background
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid divider',
        mb: 1,
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
              sx={{ color: '#f2f3f5', fontWeight: 700, lineHeight: 1.2 }}
            >
              Alex Chen
            </Typography>
            <Typography variant="caption" sx={{ color: '#b5bac1', display: 'block' }}>
              #0001
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
              bgcolor: !isMuted ? 'success.main' : 'error.main',
              borderRadius: 1,
            }}
          />
        ))}
        <Typography
          variant="caption"
          sx={{ ml: 1, color: !isMuted ? 'success.main' : 'error.main', fontSize: '0.65rem' }}
        >
          {isMuted ? 'MUTED' : 'VOICE CONNECTED'}
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
              onClick={() => setIsMuted(!isMuted)}
              sx={{
                color: isMuted ? 'error.main' : '#b5bac1',
                '&:hover': { bgcolor: '#35373c', color: isMuted ? 'error.main' : 'primary.main' },
              }}
            >
              {isMuted ? <MicOffIcon fontSize="small" /> : <MicIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Deafen">
            <IconButton
              size="small"
              onClick={() => setIsDeafened(!isDeafened)}
              sx={{
                color: isDeafened ? 'error.main' : '#b5bac1',
                '&:hover': {
                  bgcolor: '#35373c',
                  color: isDeafened ? 'error.main' : 'primary.main',
                },
              }}
            >
              {isDeafened ? <HeadsetOffIcon fontSize="small" /> : <HeadsetIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Stack>

        <Tooltip title="User Settings">
          <IconButton size="small" sx={{ color: '#b5bac1', '&:hover': { bgcolor: '#35373c' } }}>
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Volume Slider Drawer */}
      <Box sx={{ p: '8px 16px' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <GraphicEqIcon sx={{ color: '#b5bac1', fontSize: 18 }} />
          <Slider
            size="small"
            value={volume}
            onChange={(e, v) => setVolume(v as number)}
            sx={{
              color: '#5865f2', // Discord Blue
              height: 4,
              '& .MuiSlider-thumb': {
                width: 10,
                height: 10,
                boxShadow: 'none',
                '&:hover, &.Mui-focusVisible': { boxShadow: 'none' },
              },
              '& .MuiSlider-rail': { bgcolor: '#4e5058' },
            }}
          />
        </Stack>
      </Box>
    </Paper>
  );
};

export default VoiceUserProfileView;
