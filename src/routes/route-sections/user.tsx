import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router';

import { CONFIG } from 'src/config-global';
import { UserLayout } from 'src/layouts/user';

import { LoadingScreen } from 'src/components/loading-screen';

import { AuthGuard } from 'src/auth/guard';
import { paths } from '../route-paths';

// ---------------------------------------------------------------
const VoiceRoomPage = lazy(() => import('src/pages/page-voice-room'));
const FeedbackPage = lazy(() => import('src/pages/page-feedback'));
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
      { element: <VoiceRoomPage />, index: true },
      { element: <FeedbackPage />, path: paths.user.feedback, }
    ],
  },
];
