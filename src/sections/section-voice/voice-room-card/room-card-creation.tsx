import React from 'react';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import { Box, Stack, alpha, Button, useTheme, Typography } from '@mui/material';

type RoomCardCreationProps = {
  onCreateRoom: () => void;
};

export const RoomCardCreation = ({ onCreateRoom }: RoomCardCreationProps) => {
  const theme = useTheme();

  return (
    <Box
      onClick={onCreateRoom}
      sx={{
        position: 'relative',
        p: { xs: 1.5, sm: 2 },
        borderRadius: 1,
        bgcolor: 'background.paper',
        border: '1px dashed',
        borderColor:
          theme.palette.mode === 'dark'
            ? alpha(theme.palette.primary.main, 0.3)
            : alpha(theme.palette.primary.main, 0.25),
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justify: 'space-between',
        transition: 'all 200ms ease-in-out',
        width: '100%',
        minHeight: 280, // Matches standard VoiceRoomCard height profile
        '&:hover': {
          borderColor: 'primary.main',
          bgcolor:
            theme.palette.mode === 'dark'
              ? alpha(theme.palette.primary.main, 0.05)
              : alpha(theme.palette.primary.main, 0.02),
          boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.12)}`,
        },
        '&:active': {
          transform: 'scale(0.985)',
        },
      }}
    >
      <Stack spacing={2} sx={{ height: '100%' }}>
        {/* Top Header Badge */}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box
            sx={{
              px: 1,
              py: 0.3,
              borderRadius: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <GraphicEqIcon sx={{ fontSize: 14 }} />
            <Typography variant="caption" fontWeight={700} sx={{ fontSize: 10, letterSpacing: 0.4 }}>
              HOST YOUR OWN
            </Typography>
          </Box>
        </Stack>

        {/* Central Callout Area */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            py: 1,
          }}
        >
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 1.5,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          >
            <AddRoundedIcon sx={{ fontSize: 28 }} />
          </Box>

          <Typography variant="subtitle1" fontWeight={800} sx={{ color: 'text.primary', lineHeight: 1.2 }}>
            Start a Voice Room
          </Typography>

          <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.75, maxWidth: 240, lineHeight: 1.4 }}>
            Can't find the topic you want? Host your own conversation space and invite others.
          </Typography>
        </Box>

        {/* Footer Action Button */}
        <Button
          fullWidth
          size="small"
          variant="contained"
          onClick={(e) => {
            e.stopPropagation();
            onCreateRoom();
          }}
          startIcon={<AddRoundedIcon />}
          sx={{
            borderRadius: 1,
            textTransform: 'none',
            fontWeight: 700,
            py: 2,
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`,
            '&:hover': {
              boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.35)}`,
            },
          }}
        >
          Create room
        </Button>
      </Stack>
    </Box>
  );
};
