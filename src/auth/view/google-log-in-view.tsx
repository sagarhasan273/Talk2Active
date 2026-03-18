import axios from 'axios';
import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';

import { Box, Button, Typography, CircularProgress } from '@mui/material';

import { CONFIG } from 'src/config-global';

import { useAuthContext } from 'src/auth/hooks';
import { STORAGE_KEY } from 'src/auth/context/jwt';

export const GoogleLogInView = () => {
  const { loadCredentials } = useAuthContext();

  const [isLoading, setIsLoading] = useState(false);

  const login = useGoogleLogin({
    onSuccess: async (credentialResponse) => {
      try {
        const response = await axios.post(`${CONFIG.serverUrl}/auth/google`, {
          token: credentialResponse.access_token,
        });

        const { data } = response;

        if (data.status) {
          if (!data.token) {
            throw new Error('Access token not found in response');
          }
          sessionStorage.setItem(STORAGE_KEY, data.token);
          loadCredentials?.(data.user, data.recentRooms);
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Google login failed', err);
        setIsLoading(false);
      }
    },
    onError: () => {
      console.log('Login failed');
      setIsLoading(false);
    },
  });

  return (
    <Button
      fullWidth
      variant="outlined"
      disabled={isLoading}
      onClick={() => {
        setIsLoading(true);
        login();
      }}
      sx={{
        py: 2,
        px: 1,
        borderRadius: 2,
        borderColor: 'divider',
        color: 'text.primary',
        backgroundColor: 'background.paper',
        textTransform: 'none',
        fontWeight: 600,
        fontSize: 14,
        gap: 1.5,
        '&:hover': {
          borderColor: 'text.secondary',
          backgroundColor: 'action.hover',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
        '&:active': {
          transform: 'scale(0.99)',
        },
        transition: 'all 0.15s ease',
      }}
    >
      {isLoading ? (
        <CircularProgress size={18} thickness={5} />
      ) : (
        <Box
          component="img"
          src="https://www.google.com/favicon.ico"
          alt="Google"
          sx={{ width: 18, height: 18 }}
        />
      )}
      <Typography
        component="span"
        sx={{ fontWeight: 600, fontSize: { xs: 14, sm: 16 }, letterSpacing: 0.1 }}
      >
        {isLoading ? 'Signing in...' : 'Sign in'}
      </Typography>
    </Button>
  );
};
