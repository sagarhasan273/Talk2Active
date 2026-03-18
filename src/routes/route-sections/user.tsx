import { Outlet } from 'react-router';
import { lazy, Suspense } from 'react';

import { CONFIG } from 'src/config-global';
import { UserLayout } from 'src/layouts/user';

import { LoadingScreen } from 'src/components/loading-screen';

import { AuthGuard } from 'src/auth/guard';

// ---------------------------------------------------------------

const FeedView = lazy(() => import('src/pages/page-feed'));
const ProfilePage = lazy(() => import('src/pages/page-profile'));
const SettingsView = lazy(() => import('src/pages/page-settings'));
const VoiceRoomView = lazy(() => import('src/pages/page-voice-room'));
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
      { element: <VoiceRoomView />, index: true },
      { path: 'user/profile', element: <ProfilePage /> },
      { path: 'user/settings', element: <SettingsView /> },
      { path: 'feed', element: <FeedView /> },
    ],
  },
];
