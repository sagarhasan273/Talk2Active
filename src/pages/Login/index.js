import { Box, Button, Stack, useTheme } from '@mui/material';
import React, { useState } from 'react';
import LabelWithInput from '../../components/common/LabelWithInput';
import Logo from '../../components/common/Logo';
import { useThemeContext } from '../../context/ThemeContextProvider';

function Login({ loginFor }) {
  const theme = useTheme();
  const { setMode } = useThemeContext();
  const [passwordVisibleIcon, setPasswordVisibleIcon] = useState(false);

  const passwordVisibleIconHandler = () => {
    setPasswordVisibleIcon((prev) => !prev);
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.primary,
        height: '100vh',
      }}
    >
      <Stack sx={{ flex: 1, height: '100vh', alignItems: 'center' }}>
        <Stack
          sx={{
            background: '#EEEEEE',
            m: 'auto',
            p: 4,
            width: '450px',
            height: '500px',
            justifyContent: 'center',
          }}
          gap={4}
        >
          <Logo loginFor={loginFor} />
          <LabelWithInput label="Email" type="email" />
          <LabelWithInput
            label="Password"
            type="password"
            passwordVisibleIcon={passwordVisibleIcon}
            passwordVisibleIconHandler={passwordVisibleIconHandler}
          />
          <Button variant="contained">Log In</Button>
        </Stack>
      </Stack>
    </Box>
  );
}

export default Login;
