import type { Theme, Components } from '@mui/material/styles';

import { stylesMode } from 'src/theme/styles';

const MuiIconButton: Components<Theme>['MuiIconButton'] = {
  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: {
    root: ({ theme }) => ({
      '&:hover': {
        backgroundColor: 'transparent', // Disable hover background
        color: theme.vars.palette.primary.light,
        [stylesMode.dark]: { color: theme.vars.palette.primary.dark },
      },
    }),
  },
};

export const iconButton = { MuiIconButton };
