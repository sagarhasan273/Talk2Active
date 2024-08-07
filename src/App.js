import { Box, useTheme } from '@mui/material';
import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Router from './Router';

import './assets/scss/theme.scss';

function App() {
  const theme = useTheme();

  return (
    <Box sx={{ background: theme.palette.background.secondary, height: '100vh' }}>
      <ToastContainer />
      <Router />
    </Box>
  );
}

export default App;
