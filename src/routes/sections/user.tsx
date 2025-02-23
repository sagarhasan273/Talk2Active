import { Outlet } from 'react-router';
import { lazy, Suspense } from 'react';

import { CONFIG } from 'src/config-global';
import { UserLayout } from 'src/layouts/user';

import { LoadingScreen } from 'src/components/loading-screen';

import { AccountView } from 'src/sections/account/view';

import { AuthGuard } from 'src/auth/guard';

// ---------------------------------------------------------------

const IndexPage = lazy(() => import('src/pages/user/home'));
const ProfilePage = lazy(() => import('src/pages/user/profile'));
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
    path: 'user',
    element: CONFIG.auth.skip ? <>{layoutContent}</> : <AuthGuard>{layoutContent}</AuthGuard>,
    children: [
      { element: <IndexPage />, index: true },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'account-settings', element: <AccountView /> },
    ],
  },
];
