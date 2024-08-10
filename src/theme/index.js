import { ThemeProvider, createTheme } from '@mui/material';
import React, { useMemo } from 'react';
import { useThemeContext } from '../context/ThemeContextProvider';
import Components from './@components';
import getPalette from './palette';
import { getTypography } from './typography';

function GlobalThemeProvider({ children }) {
  const { mode } = useThemeContext();

  const customTheme = useMemo(() => {
    const theme = createTheme({
      breakpoints: {
        values: {
          xs: 0,
          sm: 600,
          md: 900,
          lg: 1200,
          xl: 1536,
        },
      },
      palette: getPalette(mode),
      typography: getTypography(),
    });
    theme.components = Components(theme);
    return theme;
  }, [mode]);

  return <ThemeProvider theme={customTheme}>{children}</ThemeProvider>;
}

export default GlobalThemeProvider;
