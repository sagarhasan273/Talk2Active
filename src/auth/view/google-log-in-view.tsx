import type { SxProps } from '@mui/material';

import axios from 'axios';
import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';

import { Button, SvgIcon, Typography, CircularProgress } from '@mui/material';

import { CONFIG } from 'src/config-global';

import { useAuthContext } from 'src/auth/hooks';
import { STORAGE_KEY } from 'src/auth/context/jwt';

// utils/is-mobile.ts
export const isMobileBrowser = (): boolean =>
  /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);

export const GoogleLogInView = ({
  sx,
  textSx,
  title = 'Sign in',
  onSuccess,
}: {
  sx?: SxProps;
  textSx?: SxProps;
  title?: string;
  onSuccess?: () => void;
}) => {
  const { loadCredentials } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);

  // ── Mobile: redirect flow ─────────────────────────────────────────────────
  const mobileLogin = useGoogleLogin({
    flow: 'auth-code',
    redirect_uri: window.location.origin,
    onSuccess: async (codeResponse) => {
      try {
        setIsLoading(true);
        const response = await axios.post(`${CONFIG.serverUrl}/auth/google/mobile`, {
          code: codeResponse?.code,
          redirect_uri: window.location.origin,
        });

        if (response.data?.status && response.data?.token) {
          sessionStorage.setItem(STORAGE_KEY, response.data.token);
          loadCredentials?.(response.data.user, response.data.recentRooms);
          onSuccess?.();
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Google login failed', err);
        // Add user-facing error message here
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error('Login failed', error);
      setIsLoading(false);
    },
  });

  // ── Desktop: popup flow ───────────────────────────────────────────────────
  const desktopLogin = useGoogleLogin({
    onSuccess: async (credentialResponse) => {
      try {
        const response = await axios.post(`${CONFIG.serverUrl}/auth/google`, {
          token: credentialResponse.access_token,
        });
        const { data } = response;
        if (data.status) {
          if (!data.token) throw new Error('Access token not found in response');
          sessionStorage.setItem(STORAGE_KEY, data.token);
          loadCredentials?.(data.user, data.recentRooms);
          onSuccess?.();
        }
      } catch (err) {
        console.error('Google login failed', err);
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      console.log('Login failed');
      setIsLoading(false);
    },
  });

  const handleLogin = () => {
    setIsLoading(true);
    if (isMobileBrowser()) {
      mobileLogin(); // redirect flow
      console.log('hello');
    } else {
      desktopLogin(); // popup flow
    }
  };
  return (
    <Button
      fullWidth
      variant="outlined"
      disabled={isLoading}
      onClick={handleLogin}
      sx={{
        py: 2,
        px: 1,
        borderRadius: 1,
        borderColor: 'divider',
        color: 'primary.darker',
        backgroundColor: 'primary.lighter',
        textTransform: 'none',
        fontWeight: 600,
        fontSize: 14,
        gap: 1.5,
        '&:hover': {
          backgroundColor: 'primary.light',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
        '&:active': { transform: 'scale(0.99)' },
        transition: 'all 0.15s ease',
        ...sx,
      }}
    >
      {isLoading ? (
        <CircularProgress size={18} thickness={5} />
      ) : (
        <SvgIcon sx={{ color: 'primary.darker' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640">
            <path
              fill="currentColor"
              d="M416 160h64c17.7 0 32 14.3 32 32v256c0 17.7-14.3 32-32 32h-64c-17.7 0-32 14.3-32 32s14.3 32 32 32h64c53 0 96-43 96-96V192c0-53-43-96-96-96h-64c-17.7 0-32 14.3-32 32s14.3 32 32 32m-9.4 182.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l73.4 73.4H96c-17.7 0-32 14.3-32 32s14.3 32 32 32h210.7l-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128z"
            />
          </svg>
        </SvgIcon>
      )}
      <Typography
        component="span"
        sx={{ fontWeight: 600, fontSize: { xs: 14, sm: 16 }, letterSpacing: 0.1, ...textSx }}
      >
        {isLoading ? 'Signing in...' : title}
      </Typography>
    </Button>
  );
};
