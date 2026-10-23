// src/sections/section-voice/voice-room-stage/room-stage-empty-slot-tile.tsx

import { alpha, Box, Typography, useTheme } from '@mui/material';
import { UserPlus } from 'lucide-react';

type EmptySlotTileProps = {
  openSlots: number;
  maxParticipants: number;
  onClick?: () => void;
};

export const EmptySlotTile = ({ openSlots, maxParticipants, onClick }: EmptySlotTileProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      onClick={onClick}
      sx={{
        width: { xs: 128, sm: 140, md: 168 },
        minWidth: { xs: 128, sm: 140, md: 168 },
        minHeight: 148,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 1.5,
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        bgcolor: isDark ? alpha('#181c26', 0.55) : '#ffffff',
        border: '1.5px dashed',
        borderColor: isDark ? alpha('#fff', 0.14) : '#cbd5e1',
        borderRadius: 0.5,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': onClick
          ? {
            borderColor: 'primary.main',
            bgcolor: alpha(theme.palette.primary.main, 0.06),
            transform: 'translateY(-2px)',
          }
          : {
            borderColor: isDark ? alpha('#fff', 0.24) : '#94a3b8',
          },
        '&:hover .empty-slot-icon': {
          bgcolor: alpha(theme.palette.primary.main, 0.14),
          color: 'primary.main',
          transform: 'scale(1.06)',
        },
        '&:hover .empty-slot-label': {
          color: isDark ? 'text.primary' : '#0f172a',
        },
      }}
    >
      <Box
        className="empty-slot-icon"
        sx={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: isDark ? alpha('#fff', 0.04) : '#f8fafc',
          border: '1px dashed',
          borderColor: isDark ? alpha('#fff', 0.12) : '#cbd5e1',
          color: isDark ? 'text.secondary' : '#64748b',
          transition: 'all 0.2s ease',
        }}
      >
        <UserPlus size={20} />
      </Box>
      <Typography
        className="empty-slot-label"
        variant="caption"
        fontWeight={700}
        sx={{
          color: isDark ? 'text.secondary' : '#475569',
          mt: 1.25,
          transition: 'color 0.2s ease',
        }}
      >
        {openSlots} {openSlots === 1 ? 'Seat' : 'Seats'} Open
      </Typography>
      <Typography
        variant="caption"
        sx={{
          fontSize: 10.5,
          color: isDark ? 'text.disabled' : '#94a3b8',
          mt: 0.25,
          fontWeight: 500,
        }}
      >
        Max {maxParticipants} speakers
      </Typography>
    </Box>
  );
};
