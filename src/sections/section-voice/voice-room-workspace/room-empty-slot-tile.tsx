import React from 'react';
import { UserPlus } from 'lucide-react';

import { Box, Typography } from '@mui/material';

import { slate } from './theme-tokens';

type EmptySlotTileProps = {
  openSlots: number;
  maxParticipants: number;
  onClick?: () => void;
};

export const EmptySlotTile = ({ openSlots, maxParticipants, onClick }: EmptySlotTileProps) => (
  <Box
    onClick={onClick}
    sx={{
      minHeight: 160,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 1,
      cursor: onClick ? 'pointer' : 'default',
      transition: 'border-color 0.2s ease',
      '&:hover': onClick ? { borderColor: slate[700] } : undefined,
      '&:hover .empty-slot-icon': onClick ? { bgcolor: slate[800], color: slate[200] } : undefined,
      '&:hover .empty-slot-label': onClick ? { color: slate[200] } : undefined,
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
    <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary' }}>
      Max {maxParticipants} participants
    </Typography>
  </Box>
);
