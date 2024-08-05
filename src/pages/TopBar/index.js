import AppsIcon from '@mui/icons-material/Apps';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import CampaignIcon from '@mui/icons-material/Campaign';
import ChatIcon from '@mui/icons-material/Chat';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import { Avatar, Box, Button, Divider, Popper, Stack, styled, Typography, useTheme } from '@mui/material';
import React, { useState } from 'react';
import ProfileInfo from '../../components/ProfileInfo';
import ActiveStatus from '../../components/common/ActiveStatus';

const CustomButton = styled(Button)(() => ({
  color: '#c9c9c9',
}));

const ProfilePopper = styled(Popper)(() => ({
  top: '10px !important',
  left: '-60px !important',
  width: '250px',
}));

function TopBar({ user = {} }) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [profileArrowDrop, setProfileArrowDrop] = useState(false);

  const profileArrowDropHandler = (event) => {
    setProfileArrowDrop((prev) => !prev);
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  return (
    <Box sx={{ backgroundColor: theme.palette.background.main, height: '50px' }}>
      <Stack
        sx={{ pl: '50px', pr: '50px', height: '100%' }}
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Stack direction="row" gap={2}>
          <CampaignIcon sx={{ color: theme.palette.text.main }} />
          <Typography sx={{ color: theme.palette.text.main }}>Talk2Active</Typography>
        </Stack>
        <Stack direction="row" gap={2} sx={{}}>
          <CustomButton disableRipple>
            <HomeIcon />
          </CustomButton>
          <CustomButton disableRipple>
            <PeopleIcon />
          </CustomButton>
          <CustomButton disableRipple>
            <ChatIcon />
          </CustomButton>
          <CustomButton sx={{ p: '0px 2px' }} onClick={profileArrowDropHandler} disableRipple>
            <ActiveStatus status={user?.activeStatus}>
              <Avatar alt={user?.name} src={user?.image} sx={{ width: 34, height: 34 }} />
            </ActiveStatus>
            <Typography>{user?.name}</Typography>
            {profileArrowDrop ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
          </CustomButton>
          <ProfilePopper open={profileArrowDrop} anchorEl={anchorEl} sx={{}}>
            <Stack
              className={profileArrowDrop ? 'dropDown-profile' : 'dropUp-profile'}
              sx={{
                background: theme.palette.background.main,
                width: '100%',
                height: '400px',
                borderRadius: '10px',
                p: 1,
              }}
            >
              <ProfileInfo />
            </Stack>
          </ProfilePopper>
          <Divider orientation="vertical" sx={{ width: '1px', height: '40px', backgroundColor: 'black' }} />
          <CustomButton disableRipple>
            <AppsIcon />
          </CustomButton>
          <CustomButton disableRipple>
            <SettingsIcon />
          </CustomButton>
        </Stack>
      </Stack>
    </Box>
  );
}

export default TopBar;
