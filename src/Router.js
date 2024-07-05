import { Route, Routes } from 'react-router-dom';
import AuthLayout from './network/middleware/AuthLayout';
import Authmiddleware from './network/middleware/Authmiddleware';
import Layout from './pages/Layout';

export default function Router() {
  return (
    <Routes>
      <Route path="/login/*" element={<AuthLayout type="login" />} />
      <Route path="/register/*" element={<AuthLayout type="register" />} />
      <Route
        path="*"
        element={
          <Authmiddleware>
            <Layout />
          </Authmiddleware>
        }
      />
    </Routes>
  );
}
