import { Box } from '@mui/material';
import { useGlobalContext } from '../../context/GlobalContextProvider';

export default function Layout() {
  const { user } = useGlobalContext();
  console.log(user);
  return <Box>{user.email}</Box>;
}
