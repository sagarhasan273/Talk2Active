import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import AuthLayout from './network/middleware/AuthLayout';
import Authmiddleware from './network/middleware/Authmiddleware';

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
