// src/sections/section-voice/voice-room-card/room-card-creation.tsx

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RadioRoundedIcon from '@mui/icons-material/RadioRounded';
import { alpha, Box, Button, Paper, Stack, SxProps, Typography, useTheme } from '@mui/material';

type RoomCardCreationProps = {
  onCreateRoom: () => void;
  sx?: SxProps
};

export const RoomCardCreation = ({ onCreateRoom, sx }: RoomCardCreationProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      onClick={onCreateRoom}
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: 2,
        borderRadius: 1,
        cursor: 'pointer',
        userSelect: 'none',
        bgcolor: 'background.paper',
        border: '1.5px dashed',
        borderColor: alpha(theme.palette.primary.main, isDark ? 0.35 : 0.28),
        transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          borderColor: 'primary.main',
          bgcolor: isDark ? alpha(theme.palette.primary.main, 0.08) : alpha(theme.palette.primary.main, 0.04),
          boxShadow: `0 12px 28px -4px ${alpha(theme.palette.primary.main, 0.16)}`,
          '& .creation-icon-badge': {
            transform: 'scale(1.08)',
            bgcolor: 'primary.main',
            color: '#fff',
          },
        },
        ...sx
      }}
    >
      {/* Top Banner */}
      <Stack direction="row" alignItems="center">
        <Box
          sx={{
            px: 0.85,
            py: 0.25,
            borderRadius: 1,
            bgcolor: alpha(theme.palette.primary.main, 0.12),
            color: 'primary.main',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          <RadioRoundedIcon sx={{ fontSize: 13 }} />
          <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.5 }}>
            HOST STAGE
          </Typography>
        </Box>
      </Stack>

      {/* Central Illustration Area */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          px: 1,
        }}
      >
        <Box
          className="creation-icon-badge"
          sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            bgcolor: alpha(theme.palette.primary.main, 0.12),
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1.25,
            transition: 'all 0.2s ease',
          }}
        >
          <AddRoundedIcon sx={{ fontSize: 26 }} />
        </Box>

        <Typography variant="subtitle1" fontWeight={800} sx={{ color: 'text.primary', lineHeight: 1.2 }}>
          Create Voice Room
        </Typography>

        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, maxWidth: 210, lineHeight: 1.35 }}>
          Pick languages, topic, and invite peers to join your discussion.
        </Typography>
      </Box>

      {/* Action Button */}
      <Button
        fullWidth
        size="small"
        variant="contained"
        startIcon={<AddRoundedIcon sx={{ fontSize: 18 }} />}
        onClick={(e) => {
          e.stopPropagation();
          onCreateRoom();
        }}
        sx={{
          height: 38,
          borderRadius: 1.25,
          textTransform: 'none',
          fontWeight: 700,
          fontSize: 13,
          boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.28)}`,
        }}
      >
        Start Room
      </Button>
    </Paper>
  );
};
