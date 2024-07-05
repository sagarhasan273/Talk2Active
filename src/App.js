import { Box } from '@mui/material';
import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Router from './Router';

import './assets/scss/theme.scss';

function App() {
  return (
    <Box>
      <ToastContainer />
      <Router />
    </Box>
  );
}

export default App;
