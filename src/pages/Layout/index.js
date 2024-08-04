import { Box } from '@mui/material';
import { useGlobalContext } from '../../context/GlobalContextProvider';
import TopBar from '../TopBar';
import UserDashboard from '../UserDashboard';

export default function Layout() {
  const { user } = useGlobalContext();
  console.log(user);
  return (
    <Box>
      <TopBar />
      <UserDashboard />
    </Box>
  );
}
