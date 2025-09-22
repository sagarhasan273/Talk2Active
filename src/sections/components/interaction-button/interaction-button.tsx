import React, { useMemo } from 'react';

import { Box, useTheme, IconButton, Typography } from '@mui/material';

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

  const renderIcon = useMemo(
    () => (isActive && activeIcon ? activeIcon : icon),
    [isActive, activeIcon, icon]
  );

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
        <Iconify icon={renderIcon} width={16} height={16} sx={{ color: 'inherit' }} />
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
      </Box>
    </IconButton>
  );
};
