import { Outlet } from 'react-router';
import { lazy, Suspense } from 'react';

import { CONFIG } from 'src/config-global';
import { UserLayout } from 'src/layouts/user';

import { LoadingScreen } from 'src/components/loading-screen';

import { AuthGuard } from 'src/auth/guard';

// ---------------------------------------------------------------

const FeedView = lazy(() => import('src/pages/feed'));
const ProfilePage = lazy(() => import('src/pages/profile'));
const SettingsView = lazy(() => import('src/pages/settings'));
const VoiceRoomView = lazy(() => import('src/pages/voice-room'));
// ---------------------------------------------------------------

const layoutContent = (
  <UserLayout>
    <Suspense fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  </UserLayout>
);

export const userRoutes = [
  {
    path: '/',
    element: CONFIG.auth.skip ? <>{layoutContent}</> : <AuthGuard>{layoutContent}</AuthGuard>,
    children: [
      { element: <FeedView />, index: true },
      { path: 'user/profile', element: <ProfilePage /> },
      { path: 'user/settings', element: <SettingsView /> },
      { path: 'voice-room', element: <VoiceRoomView /> },
    ],
  },
];
