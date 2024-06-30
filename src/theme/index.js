import { ThemeProvider, createTheme } from '@mui/material';
import React, { useMemo } from 'react';
import { useThemeContext } from '../context/ThemeContextProvider';
import Components from './@components';
import getPalette from './palette';

function GlobalThemeProvider({ children }) {
  const { mode } = useThemeContext();

  const customTheme = useMemo(() => {
    const theme = createTheme({
      palette: getPalette(mode),
    });
    theme.components = Components(theme);
    return theme;
  }, [mode]);

  return <ThemeProvider theme={customTheme}>{children}</ThemeProvider>;
}

export default GlobalThemeProvider;
