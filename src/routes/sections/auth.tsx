import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { AuthSplitLayout } from 'src/layouts/auth-split';

import { SplashScreen } from 'src/components/loading-screen';

import { GuestGuard } from 'src/auth/guard';

// ----------------------------------------------------------------------

/** **************************************
 * Jwt
 *************************************** */
const sign = {
  SignInPage: lazy(() => import('src/pages/auth/sign-in')),
  SignUpPage: lazy(() => import('src/pages/auth/sign-up')),
};

const authJwt = [
  {
    path: 'sign-in',
    element: (
      <GuestGuard>
        <AuthSplitLayout section={{ title: 'Hi, Welcome to FameDeal' }}>
          <sign.SignInPage />
        </AuthSplitLayout>
      </GuestGuard>
    ),
  },
  {
    path: 'sign-up',
    element: (
      <GuestGuard>
        <AuthSplitLayout section={{ title: 'Hi, Welcome to FameDeal' }}>
          <sign.SignUpPage />
        </AuthSplitLayout>
      </GuestGuard>
    ),
  },
];

// ----------------------------------------------------------------------

export const authRoutes = [
  {
    path: 'auth',
    element: (
      <Suspense fallback={<SplashScreen />}>
        <Outlet />
      </Suspense>
    ),
    children: authJwt,
  },
];
