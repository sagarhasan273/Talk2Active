import { Navigate, Route, Routes } from 'react-router-dom';
import Login from '../../pages/Login';

export default function AuthLayout() {
  let lastLoginType = '';

  if (localStorage.getItem('lastLoginType')) {
    lastLoginType = JSON.parse(localStorage.getItem('lastLoginType'));
  }

  const redirectPath = !lastLoginType || lastLoginType === 'user' ? '/login/user' : '/login/admin';

  return (
    <Routes>
      <Route path="user" element={<Login loginFor="user" />} />
      <Route path="admin" element={<Login loginFor="admin" />} />
      <Route path="*" element={<Navigate to={redirectPath} />} />
    </Routes>
  );
}
