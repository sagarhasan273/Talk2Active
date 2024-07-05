import { Navigate, Route, Routes } from 'react-router-dom';
import Login from '../../pages/Login';
import Register from '../../pages/Register';

export default function AuthLayout({ type }) {
  let lastLoginType = '';

  if (localStorage.getItem('lastLoginType')) {
    lastLoginType = JSON.parse(localStorage.getItem('lastLoginType'));
  }

  const redirectPath = !lastLoginType || lastLoginType === 'loginUser' ? '/login/user' : '/login/admin';

  return (
    <Routes>
      {type === 'login' && <Route path="user" element={<Login loginFor="user" />} />}
      {type === 'login' && <Route path="admin" element={<Login loginFor="admin" />} />}
      {type === 'register' && <Route path="user" element={<Register registerFor="user" />} />}
      {type === 'register' && <Route path="admin" element={<Register registerFor="admin" />} />}
      <Route path="*" element={<Navigate to={redirectPath} />} />
    </Routes>
  );
}
