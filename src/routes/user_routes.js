import Messages from '../pages/Messages';
import People from '../pages/People';
import Posts from '../pages/Posts';
import UserDashboard from '../pages/UserDashboard';

export const getUserRoutes = () => [
  {
    path: '/*',
    component: <UserDashboard />,
  },
  {
    path: '/posts',
    component: <Posts />,
  },
  {
    path: '/people',
    component: <People />,
  },
  {
    path: '/messages',
    component: <Messages />,
  },
];
