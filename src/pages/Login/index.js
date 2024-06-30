import { Box, Stack } from '@mui/material';
import React, { useState } from 'react';
import LabelWithInput from '../../components/common/LabelWithInput';
import Logo from '../../components/common/Logo';

function Login({ loginFor }) {
  const [passwordVisibleIcon, setPasswordVisibleIcon] = useState(false);

  const passwordVisibleIconHandler = () => {
    setPasswordVisibleIcon((prev) => !prev);
  };
  console.log(loginFor);
  return (
    <Box
      sx={{
        backgroundColor: '#363636',
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
          <Logo />
          <LabelWithInput label="Email" type="email" />
          <LabelWithInput
            label="Password"
            type="password"
            passwordVisibleIcon={passwordVisibleIcon}
            passwordVisibleIconHandler={passwordVisibleIconHandler}
          />
        </Stack>
      </Stack>
    </Box>
  );
}

export default Login;
