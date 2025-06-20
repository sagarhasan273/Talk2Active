import type { LucideIcon } from 'lucide-react';

import React from 'react';

import { Box, IconButton, Typography } from '@mui/material';

interface InteractionButtonProps {
  icon: LucideIcon;
  count: number;
  isActive: boolean;
  onClick: () => void;
  activeColor: string; // e.g., "#8b5cf6" or theme value like "primary.main"
  hoverColor: string; // same as above
  label: string;
}

export const InteractionButton: React.FC<InteractionButtonProps> = ({
  icon: Icon,
  count,
  isActive,
  onClick,
  activeColor,
  hoverColor,
  label,
}) => (
  <IconButton
    onClick={onClick}
    aria-label={label}
    disableRipple
    sx={{
      display: 'flex',
      alignItems: 'center',
      px: 1.5,
      py: 1,
      borderRadius: '999px',
      transition: 'all 0.3s ease-out',
      transform: 'scale(1)',
      bgcolor: isActive ? `${activeColor}1A` : 'transparent', // 1A = ~10% opacity
      color: isActive ? activeColor : 'text.secondary',
      '&:hover': {
        bgcolor: `${hoverColor}1A`,
        color: hoverColor,
        transform: 'scale(1.05)',
      },
      '&:active': {
        transform: 'scale(0.95)',
      },
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Icon
        size={18}
        style={{
          transition: 'transform 0.3s ease-out',
        }}
      />
      {count > 0 && (
        <Typography variant="body2" sx={{ fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
          {count}
        </Typography>
      )}
    </Box>
  </IconButton>
);
