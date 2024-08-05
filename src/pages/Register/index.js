import { Box, Button, Stack, useTheme } from '@mui/material';
import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { successMsg } from '../../common/successMsg';
import LabelWithInput from '../../components/common/LabelWithInput';
import Logo from '../../components/common/Logo';
import { useGlobalContext } from '../../context/GlobalContextProvider';
import * as API_URL from '../../network/Api';
import AXIOS from '../../network/axios';

function Register({ registerFor }) {
  const theme = useTheme();
  const { setUser } = useGlobalContext();
  //   const { setMode } = useThemeContext();
  const [formData, setFormData] = useState({});
  const [passwordVisibleIcon, setPasswordVisibleIcon] = useState(false);

  const registerQuery = useMutation((data) => AXIOS.post(API_URL.USER_REGISTER, data), {
    onSuccess: (response) => {
      if (response?.status) {
        setUser(response.data.user || {});
        successMsg(response?.message, 'success');
      }
    },
  });

  const passwordVisibleIconHandler = () => {
    setPasswordVisibleIcon((prev) => !prev);
    // setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const formHandler = (event) => {
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const sumbitHandler = () => {
    registerQuery.mutate(formData);
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
          <Logo registerFor={registerFor} />
          <Stack flexDirection="row" justifyContent="space-between">
            <LabelWithInput
              name="firstName"
              label="First Name"
              type="text"
              value={formData?.firstName || ''}
              onChange={formHandler}
            />
            <LabelWithInput
              name="lastName"
              label="Last Name"
              type="text"
              value={formData?.lastName || ''}
              onChange={formHandler}
            />
          </Stack>
          <LabelWithInput
            name="email"
            label="Email"
            type="email"
            value={formData?.email || ''}
            onChange={formHandler}
          />
          <LabelWithInput
            name="password"
            label="Password"
            type="password"
            value={formData?.password || ''}
            onChange={formHandler}
            passwordVisibleIcon={passwordVisibleIcon}
            passwordVisibleIconHandler={passwordVisibleIconHandler}
          />
          <Button variant="contained" onClick={sumbitHandler} disabled={registerQuery.isLoading}>
            Sign Up
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

export default Register;
