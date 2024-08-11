import { Avatar, Stack, styled, Typography } from '@mui/material';
import moment from 'moment';
import React from 'react';
import ActiveStatus from '../../components/common/ActiveStatus';
import { useGlobalContext } from '../../context/GlobalContextProvider';

const CustomTypography = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  fontSize: '12px',
  lineHeight: '22.75px',
  wordBreak: 'break-all',
  color: theme.palette.text.main,
}));

function ProfilePreview() {
  const { user } = useGlobalContext();
  return (
    <Stack>
      <Stack sx={{ p: '10px 12px' }} direction="row" justifyContent="center">
        <ActiveStatus status={user?.activeStatus}>
          <Avatar alt="Sagar Hasan" src={user?.image} sx={{ width: 100, height: 100 }} />
        </ActiveStatus>
      </Stack>
      <Stack sx={{ width: '100%', pb: 2 }}>
        <CustomTypography>{user?.name}</CustomTypography>
        <CustomTypography>{user?.email}</CustomTypography>
        <CustomTypography>{moment(user?.createdAt).format('L LT')}</CustomTypography>
      </Stack>
      <Stack sx={{ width: '100px' }} justifyContent="center">
        <CustomTypography sx={{ textAlign: 'left' }}>Followers: {user?.followers}</CustomTypography>
        <CustomTypography sx={{ textAlign: 'left' }}>Friends: {user?.friends}</CustomTypography>
        <CustomTypography sx={{ textAlign: 'left' }}>Following: {user?.friends}</CustomTypography>
        <CustomTypography sx={{ textAlign: 'left' }}>ID: {user?.userId}</CustomTypography>
      </Stack>
    </Stack>
  );
}

export default ProfilePreview;
