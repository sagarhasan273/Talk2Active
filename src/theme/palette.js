const getPalette = (mode = 'light') => {
  const commonPalette = {
    primary: {
      main: '#6495ED',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#F2F2F2',
      contrastText: '#ffffff',
    },
    info: {
      main: '#636363',
      contrastText: '#ffffff',
    },
    success: {
      main: '#417C45',
    },
    orange: {
      main: '#FFB017',
      secondary: 'rgba(255, 176, 23, 0.15)',
    },
    danger: {
      main: '#DD5B63',
      secondary: '#CC274B',
      secondary2: '#FFF5F8',
      contrastText: '#ffffff',
    },
    error: {
      main: '#DD5B63',
      contrastText: '#ffffff',
      secondary: 'rgba(255, 0, 16, 1)',
    },
    text: {
      main: '#c2c2c2',
      primary: '#363636',
      secondary: '#525252',
      secondary2: '#737373',
      body: '#3F4254',
      body2: '#8F93A0',
      dark: '#383838',
    },
    grey: {
      200: 'rgba(0, 0, 0, 0.08)',
      201: '#EFEFEF',
    },
    button: {
      main: '#39403e',
      text: '#ffffff',
    },
    custom: {
      tableLoader: 'rgba(255, 255, 255, 0.7)',
      contrastText: '#ffffff',
      border: '#EEEEEE',
      border2: '#E5E7E9',
    },
    background: {
      main: '#383838',
      primary: '#c2c2c2',
      secondary: '#525252',
      secondaryHover: '#f0f3f6',
      contrastText: '#ffffff',
    },
    follow: {
      main: '#70b5ff',
    },
  };

  if (mode === 'dark') {
    return {
      ...commonPalette,
      mode: 'dark',
      background: {
        ...commonPalette.background,
        default: '#121212',
        paper: '#1D1D1D',
      },
      text: {
        ...commonPalette.text,
        primary: '#FFFFFF',
        secondary: '#B3B3B3',
      },
    };
  }

  return {
    ...commonPalette,
    mode: 'light',
    background: {
      ...commonPalette.background,
      default: '#FFFFFF',
      paper: '#F6F6F6',
    },
    text: {
      ...commonPalette.text,
      primary: '#363636',
      secondary: '#525252',
    },
  };
};

export default getPalette;
