import { Box, Button, Stack, useTheme } from '@mui/material';
import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { successMsg } from '../../common/successMsg';
import LabelWithInput from '../../components/common/LabelWithInput';
import Logo from '../../components/common/Logo';
import { useGlobalContext } from '../../context/GlobalContextProvider';
import { useThemeContext } from '../../context/ThemeContextProvider';
import { setCookie } from '../../helpers/cookies';
import * as API_URL from '../../network/Api';
import AXIOS from '../../network/axios';

function Login({ loginFor }) {
  const theme = useTheme();
  const history = useNavigate();
  const { setMode } = useThemeContext();
  const { setUser } = useGlobalContext();

  const [data, setData] = useState({});
  const [passwordVisibleIcon, setPasswordVisibleIcon] = useState(false);

  const loginQuery = useMutation((data) => AXIOS.post(API_URL.USER_LOGIN, data), {
    onSuccess: (response) => {
      if (response?.status) {
        setUser(response.data.user);
        successMsg(response.message, 'success');
        setCookie('accesstoken', response.data.accessToken, 30);
        history('/', {
          state: null,
        });
      } else {
        successMsg(response?.message, 'info');
      }
    },
  });

  const passwordVisibleIconHandler = () => {
    setPasswordVisibleIcon((prev) => !prev);
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const formHandler = (event) => {
    setData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const sumbitHandler = () => {
    loginQuery.mutate(data);
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
            background: theme.palette.background.secondary,
            m: 'auto',
            p: 4,
            width: '350px',
            height: '450px',
            justifyContent: 'center',
            borderRadius: '10px',
            boxShadow: '15px 15px 60px 1px black',
          }}
          gap={4}
        >
          <Logo loginFor={loginFor} />
          <LabelWithInput
            label="Email"
            type="email"
            name="email"
            value={data.email || ''}
            onChange={formHandler}
            disabled={loginQuery.isLoading}
          />
          <LabelWithInput
            label="Password"
            type="password"
            name="password"
            value={data.password || ''}
            onChange={formHandler}
            passwordVisibleIcon={passwordVisibleIcon}
            passwordVisibleIconHandler={passwordVisibleIconHandler}
            disabled={loginQuery.isLoading}
          />
          <Button
            variant="contained"
            color="button"
            size="small"
            onClick={sumbitHandler}
            disabled={loginQuery.isLoading}
          >
            Log In
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

export default Login;
