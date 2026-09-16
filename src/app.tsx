import 'src/global.css';

import { Provider } from 'react-redux';
// ----------------------------------------------------------------------
import { GoogleOAuthProvider } from '@react-oauth/google';

import { Router } from 'src/routes/route-sections';

import { useScrollToTop } from 'src/hooks/use-scroll-to-top';

import { ThemeProvider } from 'src/theme/theme-provider';

import { MotionLazy } from 'src/components/animate/motion-lazy';
import { ProgressBar } from 'src/components/progress-bar';
import { defaultSettings, SettingsDrawer, SettingsProvider } from 'src/components/settings';
import { Snackbar } from 'src/components/snackbar';

import { AuthProvider } from 'src/auth/context/jwt';

import { CONFIG } from './config-global';
import { LiveKitProvider } from './core/contexts/livekit-context';
import { store } from './core/store';
import { LocalizationProvider } from './locales';
import { UserProvider } from './routes/route-components';

// ----------------------------------------------------------------------

export default function App() {
  useScrollToTop();

  return (
    <GoogleOAuthProvider clientId={CONFIG.googleAuthClientId}>
      <LocalizationProvider>
        <Provider store={store}>
          <UserProvider>
            <AuthProvider>
              <LiveKitProvider>
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
              </LiveKitProvider>
            </AuthProvider>
          </UserProvider>
        </Provider>
      </LocalizationProvider>
    </GoogleOAuthProvider>
  );
}
