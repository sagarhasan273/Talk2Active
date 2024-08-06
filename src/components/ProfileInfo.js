import { useTheme } from '@emotion/react';
import DeleteIcon from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout';
import PaletteIcon from '@mui/icons-material/Palette';
import PersonIcon from '@mui/icons-material/Person';
import { Avatar, Button, Divider, Grid, Stack, styled, Typography } from '@mui/material';
import moment from 'moment';
import React from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { successMsg } from '../common/successMsg';
import { useGlobalContext } from '../context/GlobalContextProvider';
import { deleteCookie } from '../helpers/cookies';
import * as API_URL from '../network/Api';
import AXIOS from '../network/axios';
import ActiveStatus from './common/ActiveStatus';
import { statusButtons } from './helpers';

const CustomTypography = styled(Typography)(({ theme }) => ({
  textAlign: 'left',
  fontSize: '12px',
  lineHeight: '22.75px',
  wordBreak: 'break-all',
  color: theme.palette.text.main,
}));

const StatusButton = styled(Button)(({ theme }) => ({
  padding: '0px 5px',
  height: '20px',
  fontSize: '11.5px',
  lineHeight: '22.75px',
  background: 'transparent',
  border: `1px solid ${theme.palette.background.primary}`,
  color: theme.palette.background.primary,
  '&:hover': {
    color: theme.palette.text.dark,
    background: theme.palette.background.primary,
    border: `2px solid ${theme.palette.background.primary}`,
  },
}));

function ProfileInfo() {
  const history = useNavigate();

  const theme = useTheme();
  const { user, setUser } = useGlobalContext();
  const queryClient = useQueryClient();

  const liveStatusQuery = useMutation((data) => AXIOS.post(API_URL.USER_PROFILE_STATUS_UPDATE, data), {
    onSuccess: (response) => {
      if (response?.status) {
        queryClient.invalidateQueries(API_URL.USER_GET_DETAILS);
        successMsg('Status updated successfully!', 'success', { position: 'top-left' });
      } else {
        successMsg(response?.message, 'info');
      }
    },
  });

  const liveStatusStyle = {
    background: theme.palette.background.primary,
    color: theme.palette.text.dark,
    '&:hover': {
      background: theme.palette.background.primary,
    },
  };

  const statusHandler = (status) => {
    if (!status) {
      return;
    }
    liveStatusQuery.mutate({ userId: user.userId, activeStatus: status });
  };

  const logoutHandle = () => {
    deleteCookie('accesstoken');
    setUser({});
    history('/', {
      state: null,
    });
    successMsg('Logout successfully!', 'success');
  };

  return (
    <Stack pl={1}>
      <Stack sx={{ p: '10px 12px' }} direction="row" justifyContent="space-between">
        <ActiveStatus status={user?.activeStatus}>
          <Avatar alt="Sagar Hasan" src={user?.image} sx={{ width: 100, height: 100 }} />
        </ActiveStatus>
        <Stack sx={{ width: '100px' }} justifyContent="center">
          <CustomTypography sx={{}}>Followers: {user?.followers}</CustomTypography>
          <CustomTypography sx={{}}>Friends: {user?.friends}</CustomTypography>
          <CustomTypography sx={{}}>Following: {user?.friends}</CustomTypography>
          <CustomTypography sx={{}}>ID: {user?.userId}</CustomTypography>
        </Stack>
      </Stack>
      <Stack sx={{ width: '100%', pb: 2 }}>
        <CustomTypography>Name: {user?.name}</CustomTypography>
        <CustomTypography>Email: {user?.email}</CustomTypography>
        <CustomTypography>Creation Date: {moment(user?.createdAt).format('L LT')}</CustomTypography>
        <Grid container gap="8px" pt={1}>
          {statusButtons?.map((item, index) => (
            <StatusButton
              key={index}
              sx={{ ...(user?.activeStatus === item?.value && liveStatusStyle) }}
              onClick={() => statusHandler(item?.value)}
              disableRipple
            >
              {item?.label}
            </StatusButton>
          ))}
        </Grid>
      </Stack>
      <Divider color={theme.palette.text.main} />
      <Stack pt={2} gap="5px">
        <Button startIcon={<PersonIcon />} sx={{ color: theme.palette.text.main, fontSize: '12px' }}>
          My Profile
        </Button>
        <Button startIcon={<PaletteIcon />} sx={{ color: theme.palette.text.main, fontSize: '12px' }}>
          Theme
        </Button>
        <Button startIcon={<DeleteIcon />} sx={{ color: theme.palette.text.main, fontSize: '12px' }}>
          Delete Account
        </Button>
        <Button
          onClick={logoutHandle}
          startIcon={<LogoutIcon />}
          sx={{ color: theme.palette.text.main, fontSize: '12px' }}
        >
          Logout
        </Button>
      </Stack>
    </Stack>
  );
}

export default ProfileInfo;
