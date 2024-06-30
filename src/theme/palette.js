const getPalette = (mode = 'light') => {
  const commonPalette = {
    primary: {
      main: '#5E97A9',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#15BFCA',
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
      primary: '#363636',
      secondary: '#525252',
      secondary2: '#737373',
      body: '#3F4254',
      body2: '#8F93A0',
    },
    grey: {
      200: 'rgba(0, 0, 0, 0.08)',
      201: '#EFEFEF',
    },
    custom: {
      tableLoader: 'rgba(255, 255, 255, 0.7)',
      contrastText: '#ffffff',
      border: '#EEEEEE',
      border2: '#E5E7E9',
    },
    background: {
      primary: '#363636',
      secondary: '#F6F8FA',
      secondaryHover: '#f0f3f6',
      contrastText: '#ffffff',
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
