import 'src/global.css';

import { Provider } from 'react-redux';
// ----------------------------------------------------------------------
import { GoogleOAuthProvider } from '@react-oauth/google';

import { Router } from 'src/routes/route-sections';

import { useScrollToTop } from 'src/hooks/use-scroll-to-top';

import { ThemeProvider } from 'src/theme/theme-provider';

import { Snackbar } from 'src/components/snackbar';
import { ProgressBar } from 'src/components/progress-bar';
import { MotionLazy } from 'src/components/animate/motion-lazy';
import { SettingsDrawer, defaultSettings, SettingsProvider } from 'src/components/settings';

import { AuthProvider } from 'src/auth/context/jwt';

import { store } from './core/store';
import { CONFIG } from './config-global';
import { LocalizationProvider } from './locales';
import { UserProvider } from './routes/route-components';
import { SocketProvider } from './core/contexts/socket-context';
import { WebRTCProvider } from './core/contexts/webRTC-context';

// ----------------------------------------------------------------------

export default function App() {
  useScrollToTop();

  return (
    <GoogleOAuthProvider clientId={CONFIG.googleAuthClientId}>
      <LocalizationProvider>
        <Provider store={store}>
          <UserProvider>
            <AuthProvider>
              <SocketProvider>
                <WebRTCProvider>
                  <SettingsProvider settings={defaultSettings}>
                    <ThemeProvider>
                      <MotionLazy>
                        <Snackbar />
                        <ProgressBar />
                        <SettingsDrawer />
                        <Router />
                      </MotionLazy>
                    </ThemeProvider>
                  </SettingsProvider>
                </WebRTCProvider>
              </SocketProvider>
            </AuthProvider>
          </UserProvider>
        </Provider>
      </LocalizationProvider>
    </GoogleOAuthProvider>
  );
}
