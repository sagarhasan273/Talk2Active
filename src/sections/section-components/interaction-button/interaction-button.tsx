import React from 'react';

import { Button, useTheme, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';

import type { InteractionButtonProps } from './types';

export const InteractionButton: React.FC<InteractionButtonProps> = ({
  icon,
  activeIcon,
  count,
  isActive,
  onClick,
  activeColor,
  label,
}) => {
  const theme = useTheme();

  return (
    <Button
      onClick={onClick}
      startIcon={
        isActive && activeIcon ? (
          <Iconify icon={activeIcon} width={16} height={16} sx={{ color: 'inherit' }} />
        ) : (
          <Iconify icon={icon} width={16} height={16} sx={{ color: 'inherit' }} />
        )
      }
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
          background: 'transparent',
        },
      }}
    >
      {count >= 0 && (
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
    </Button>
  );
};
