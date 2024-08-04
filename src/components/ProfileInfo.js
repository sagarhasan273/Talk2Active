import { useTheme } from '@emotion/react';
import DeleteIcon from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout';
import PaletteIcon from '@mui/icons-material/Palette';
import PersonIcon from '@mui/icons-material/Person';
import { Avatar, Button, Divider, Grid, Stack, styled, Typography } from '@mui/material';
import React, { useState } from 'react';
import ActiveStatus from './common/ActiveStatus';
import { statusButtons } from './helpers';

const staticUser = {
  name: 'Sagar Hasan',
  image: 'https://photosnow.org/wp-content/uploads/2024/04/attitude-girl-anime-dp_8.jpg',
  userId: 'fkji2532fg',
  email: 'sagarhasan273@gmail.com',
  activeStatus: 'offline', // online, busy, sleeping, brb, offline
  followers: '57k',
  friends: '9',
  following: '9',
  createdAt: '01/08/2023 01:23AM',
};

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
    background: 'transparent',
    border: `2px solid ${theme.palette.background.primary}`,
  },
}));

function ProfileInfo() {
  const theme = useTheme();
  const [status, setStatus] = useState('online');

  const liveStatusStyle = {
    background: theme.palette.background.primary,
    color: theme.palette.text.dark,
    '&:hover': {
      background: theme.palette.background.primary,
    },
  };

  const statusHandler = (status) => {
    setStatus(status);
  };

  return (
    <Stack pl={1}>
      <Stack sx={{ p: '10px 12px' }} direction="row" justifyContent="space-between">
        <ActiveStatus status={status}>
          <Avatar alt="Sagar Hasan" src={staticUser?.image} sx={{ width: 100, height: 100 }} />
        </ActiveStatus>
        <Stack sx={{ width: '100px' }} justifyContent="center">
          <CustomTypography sx={{}}>Followers: {staticUser?.followers}</CustomTypography>
          <CustomTypography sx={{}}>Friends: {staticUser?.friends}</CustomTypography>
          <CustomTypography sx={{}}>Following: {staticUser?.friends}</CustomTypography>
          <CustomTypography sx={{}}>ID: {staticUser?.userId}</CustomTypography>
        </Stack>
      </Stack>
      <Stack sx={{ width: '100%', pb: 2 }}>
        <CustomTypography>Name: {staticUser?.name}</CustomTypography>
        <CustomTypography>Email: {staticUser?.email}</CustomTypography>
        <CustomTypography>Creation Date: {staticUser?.createdAt}</CustomTypography>
        <Grid container gap="8px" pt={1}>
          {statusButtons?.map((item, index) => (
            <StatusButton
              key={index}
              sx={{ ...(status === item?.value && liveStatusStyle) }}
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
        <Button startIcon={<LogoutIcon />} sx={{ color: theme.palette.text.main, fontSize: '12px' }}>
          Logout
        </Button>
      </Stack>
    </Stack>
  );
}

export default ProfileInfo;
