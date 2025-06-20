import type { ThemeUpdateOptions } from './types';
// ----------------------------------------------------------------------

export const overridesTheme: ThemeUpdateOptions = {
  /**
   *
 ```jsx
  colorSchemes: {
    light: {
      palette: {
        primary: createPaletteChannel({
          lighter: '#E4DCFD',
          light: '#A996F8',
          main: '#6950E8',
          dark: '#3828A7',
          darker: '#180F6F',
          contrastText: '#FFFFFF',
        }),
      },
    },
  },
  shape: { borderRadius: 0 },
 ```
 */
};

declare module '@mui/material/styles' {
  interface Palette {
    teal: Palette['primary'];
    purple: Palette['primary'];
    yellow: Palette['primary'];
    blue: Palette['primary'];
    red: Palette['primary'];
    green: Palette['primary'];
    indigo: Palette['primary'];
    pink: Palette['primary'];
    cyan: Palette['primary'];
    orange: Palette['primary'];
    violet: Palette['primary'];
    emerald: Palette['primary'];
    rose: Palette['primary'];
    amber: Palette['primary'];
    stone: Palette['primary'];
  }

  interface PaletteOptions {
    teal?: PaletteOptions['primary'];
    purple?: PaletteOptions['primary'];
    yellow?: PaletteOptions['primary'];
    blue?: PaletteOptions['primary'];
    red?: PaletteOptions['primary'];
    green?: PaletteOptions['primary'];
    indigo?: PaletteOptions['primary'];
    pink?: PaletteOptions['primary'];
    cyan?: PaletteOptions['primary'];
    orange?: PaletteOptions['primary'];
    violet?: PaletteOptions['primary'];
    emerald?: PaletteOptions['primary'];
    rose?: PaletteOptions['primary'];
    amber?: PaletteOptions['primary'];
    stone?: PaletteOptions['primary'];
  }
}
