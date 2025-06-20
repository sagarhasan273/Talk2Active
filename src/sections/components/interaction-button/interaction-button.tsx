import React from 'react';

import { Box, useTheme, IconButton, Typography } from '@mui/material';

import type { InteractionButtonProps } from './types';

export const InteractionButton: React.FC<InteractionButtonProps> = ({
  icon: Icon,
  count,
  isActive,
  onClick,
  activeColor,
  label,
}) => {
  const theme = useTheme();
  return (
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

        color: isActive ? theme.palette[activeColor].main : theme.palette.text.secondary,
        '&:hover': {
          color: `${theme.palette[activeColor].main} !important`,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'inherit' }}>
        <Icon
          size={18}
          style={{
            transition: 'transform 0.3s ease-out',
          }}
          fill={isActive ? theme.palette[activeColor].main : 'none'}
        />
        {count > 0 && (
          <Typography
            variant="body2"
            sx={{
              color: 'inherit',
              fontWeight: 500,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {count}
          </Typography>
        )}
      </Box>
    </IconButton>
  );
};
