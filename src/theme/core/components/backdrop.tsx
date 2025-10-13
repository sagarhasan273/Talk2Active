import type { Theme, Components } from '@mui/material/styles';

import { varAlpha } from '../../styles';

// ----------------------------------------------------------------------

const MuiBackdrop: Components<Theme>['MuiBackdrop'] = {
  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: {
    root: ({ theme }) => ({
      backgroundColor:
        theme.palette.mode === 'dark'
          ? varAlpha(theme.vars.palette.grey['200Channel'], 0.72)
          : varAlpha(theme.vars.palette.grey['800Channel'], 0.72),
    }),
    invisible: { background: 'transparent' },
  },
};

// ----------------------------------------------------------------------

export const backdrop = { MuiBackdrop };
