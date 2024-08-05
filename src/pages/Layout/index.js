import { Box } from '@mui/material';
import { useQuery } from 'react-query';
import { useGlobalContext } from '../../context/GlobalContextProvider';
import { USER_GET_DETAILS } from '../../network/Api';
import AXIOS from '../../network/axios';
import TopBar from '../TopBar';
import UserDashboard from '../UserDashboard';

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

  return (
    <Box>
      <TopBar user={user} loading={userQuery.isLoading} />
      <UserDashboard />
    </Box>
  );
}
