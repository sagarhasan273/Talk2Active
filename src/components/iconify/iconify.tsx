import { forwardRef } from 'react';
import { Icon, disableCache } from '@iconify/react';

import Box from '@mui/material/Box';

import { iconifyClasses } from './classes';

import type { IconifyProps } from './types';

// ----------------------------------------------------------------------

export const Iconify = forwardRef<SVGElement, IconifyProps>(
  ({ className, width = 20, sx, popWiggle, ...other }, ref) => (
    <Box
      ssr
      ref={ref}
      component={Icon}
      className={iconifyClasses.root.concat(className ? ` ${className}` : '')}
      sx={{
        width,
        height: width,
        flexShrink: 0,
        display: 'inline-flex',
        animation: popWiggle ? 'popWiggle 0.6s ease' : 'none',
        '@keyframes popWiggle': {
          '0%': { transform: 'scale(1) rotate(0deg)' },
          '20%': { transform: 'scale(1.2) rotate(-15deg)' },
          '40%': { transform: 'scale(1.2) rotate(15deg)' },
          '60%': { transform: 'scale(1.1) rotate(-10deg)' },
          '80%': { transform: 'scale(1.05) rotate(10deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)' },
        },
        ...sx,
      }}
      {...other}
    />
  )
);

// https://iconify.design/docs/iconify-icon/disable-cache.html
disableCache('local');
