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
        height: 1,
        width: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid',
        borderColor: isDark
          ? alpha(theme.palette.common.white, 0.8)
          : alpha(theme.palette.common.black, 0.3),
        borderRadius: 1,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.2s ease',
        '&:hover': onClick
          ? {
            borderColor: alpha(theme.palette.text.primary, 0.35),
          }
          : undefined,
        '&:hover .empty-slot-icon': onClick
          ? {
            bgcolor: alpha(theme.palette.action.hover, 0.1),
            color: 'text.primary',
          }
          : undefined,
        '&:hover .empty-slot-label': onClick
          ? {
            color: 'text.primary',
          }
          : undefined,
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
          bgcolor: 'background.neutral',
          color: 'text.secondary',
          transition: 'background-color 0.2s ease, color 0.2s ease',
        }}
      >
        <UserPlus size={20} />
      </Box>
      <Typography
        className="empty-slot-label"
        variant="caption"
        fontWeight={600}
        sx={{ color: 'text.secondary', mt: 1, transition: 'color 0.2s ease' }}
      >
        {openSlots} {openSlots === 1 ? 'Slot' : 'Slots'} Open
      </Typography>
      <Typography variant="caption" sx={{ fontSize: 10, color: 'text.disabled' }}>
        Max {maxParticipants} participants
      </Typography>
    </Box>
  );
};
