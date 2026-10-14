// src/sections/section-voice/voice-room-card/room-list-card-creation.tsx

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RadioRoundedIcon from '@mui/icons-material/RadioRounded';
import { alpha, Box, Button, Paper, Stack, SxProps, Typography, useTheme } from '@mui/material';

type RoomCardCreationProps = {
  onCreateRoom: () => void;
  sx?: SxProps;
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
        p: 2.25,
        borderRadius: 1,
        cursor: 'pointer',
        userSelect: 'none',
        bgcolor: isDark ? '#181c26' : '#ffffff',
        border: '1.5px dashed',
        borderColor: isDark ? alpha('#38bdf8', 0.3) : '#cbd5e1',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          borderColor: isDark ? '#38bdf8' : 'primary.main',
          '& .creation-circle': {
            transform: 'scale(1.06)',
            borderColor: isDark ? '#38bdf8' : 'primary.main',
            color: isDark ? '#38bdf8' : 'primary.main',
          },
        },
        ...sx,
      }}
    >
      {/* Top Header */}
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box
          sx={{
            px: 0.85,
            py: 0.25,
            borderRadius: 1,
            bgcolor: isDark ? alpha('#38bdf8', 0.12) : alpha(theme.palette.primary.main, 0.08),
            color: isDark ? '#38bdf8' : 'primary.main',
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

      {/* Center 78px Circle matching the Speaker Stage Circles */}
      <Stack alignItems="center" spacing={1} sx={{ my: 'auto' }}>
        <Box
          className="creation-circle"
          sx={{
            width: 78,
            height: 78,
            borderRadius: '50%',
            border: '1.5px dashed',
            borderColor: isDark ? alpha('#fff', 0.22) : '#cbd5e1',
            bgcolor: isDark ? alpha('#fff', 0.02) : '#f8fafc',
            color: isDark ? 'text.secondary' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
        >
          <AddRoundedIcon sx={{ fontSize: 30 }} />
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="subtitle2"
            fontWeight={800}
            sx={{ color: isDark ? '#f8fafc' : '#0f172a', lineHeight: 1.2 }}
          >
            Create a New Group
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: isDark ? '#94a3b8' : '#64748b',
              display: 'block',
              mt: 0.25,
            }}
          >
            Pick languages, level & topic
          </Typography>
        </Box>
      </Stack>

      {/* Bottom Centered Dashed Button */}
      <Stack direction="row" justifyContent="center">
        <Button
          size="small"
          variant="outlined"
          startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
          onClick={(e) => {
            e.stopPropagation();
            onCreateRoom();
          }}
          sx={{
            px: 2.5,
            py: 0.65,
            borderRadius: 1,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.8rem',
            borderStyle: 'dashed',
            borderColor: isDark ? alpha('#38bdf8', 0.38) : alpha(theme.palette.primary.main, 0.4),
            color: isDark ? '#38bdf8' : 'primary.main',
            '&:hover': {
              borderStyle: 'solid',
              borderColor: isDark ? '#38bdf8' : 'primary.main',
              bgcolor: isDark
                ? alpha('#38bdf8', 0.12)
                : alpha(theme.palette.primary.main, 0.08),
            },
          }}
        >
          Create a new group
        </Button>
      </Stack>
    </Paper>
  );
};
