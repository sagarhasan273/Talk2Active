import { Box } from '@mui/material';
import { useQuery } from 'react-query';
import { Route, Routes } from 'react-router-dom';
import { useGlobalContext } from '../../context/GlobalContextProvider';
import { USER_GET_DETAILS } from '../../network/Api';
import AXIOS from '../../network/axios';
import { getUserRoutes } from '../../routes/user_routes';
import TopBar from '../TopBar';

export default function Layout() {
  const { user, setUser } = useGlobalContext();

  const userQuery = useQuery([USER_GET_DETAILS], () => AXIOS.get(USER_GET_DETAILS), {
    onSuccess: (response) => {
      if (response?.status) {
        setUser(response?.data?.user || {});
      } else {
        console.log("User isn't exist");
      }
    },
  });

  const routes = getUserRoutes();

  return (
    <Box>
      <TopBar user={user} loading={userQuery.isLoading} />
      <Routes>
        {routes?.map((route, index) => (
          <Route key={index} path={route?.path} element={route?.component} />
        ))}
      </Routes>
    </Box>
  );
}
