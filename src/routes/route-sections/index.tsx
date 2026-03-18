import { Navigate, useRoutes } from 'react-router-dom';

import { CONFIG } from 'src/config-global';

import { mainRoutes } from './main';
import { userRoutes } from './user';

// ----------------------------------------------------------------------

export function Router() {
  return useRoutes([
    {
      path: '/',
      element: <Navigate to={CONFIG.auth.redirectPath} replace />,
    },
    // User
    ...userRoutes,

    // Main
    ...mainRoutes,

    // No match
    { path: '*', element: <Navigate to="/" replace /> },
  ]);
}
