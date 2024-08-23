import AppsIcon from '@mui/icons-material/Apps';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import CampaignIcon from '@mui/icons-material/Campaign';
import ChatIcon from '@mui/icons-material/Chat';
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed';
import HomeIcon from '@mui/icons-material/Home';
import LoginIcon from '@mui/icons-material/Login';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  Avatar,
  Box,
  Button,
  ClickAwayListener,
  Divider,
  Paper,
  Popper,
  Stack,
  styled,
  Typography,
  useTheme,
} from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileInfo from '../../components/ProfileInfo';
import ActiveStatus from '../../components/common/ActiveStatus';
import { changeTopBarActionRouteHistory } from './helper';

const CustomButton = styled(Button)(() => ({
  color: '#c9c9c9',
}));

const ProfilePopper = styled(Popper)(() => ({
  top: '10px !important',
  left: '-60px !important',
  width: '250px',
}));

function TopBar({ user = {} }) {
  const history = useNavigate();

  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [profileArrowDrop, setProfileArrowDrop] = useState(false);

  const profileArrowDropHandler = (event) => {
    setProfileArrowDrop((prev) => !prev);
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleClickAway = (event) => {
    setProfileArrowDrop((prev) => !prev);
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const loginHandler = () => {
    history('/login/user', {
      state: null,
    });
  };

  const topBarActionHandler = (event, type) => {
    event.preventDefault();

    changeTopBarActionRouteHistory(type, history);
  };

  return (
    <Box
      sx={{ backgroundColor: theme.palette.background.main, height: '50px', position: 'sticky', top: 0, zIndex: 9999 }}
    >
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
        {user?.name && (
          <Stack direction="row" gap={2} sx={{}}>
            <CustomButton onClick={(e) => topBarActionHandler(e, 'home')} disableRipple>
              <HomeIcon />
            </CustomButton>
            <CustomButton onClick={(e) => topBarActionHandler(e, 'posts')} disableRipple>
              <DynamicFeedIcon />
            </CustomButton>
            <CustomButton onClick={(e) => topBarActionHandler(e, 'people')} disableRipple>
              <PeopleIcon />
            </CustomButton>
            <CustomButton onClick={(e) => topBarActionHandler(e, 'messages')} disableRipple>
              <ChatIcon />
            </CustomButton>
            <CustomButton sx={{ p: '0px 2px' }} onClick={profileArrowDropHandler} disableRipple>
              <ActiveStatus status={user?.activeStatus}>
                <Avatar alt={user?.name} src={user?.image} sx={{ width: 34, height: 34 }} />
              </ActiveStatus>
              <Typography>{user?.name}</Typography>
              {profileArrowDrop ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
            </CustomButton>
            <ProfilePopper open={profileArrowDrop} anchorEl={anchorEl}>
              <ClickAwayListener onClickAway={handleClickAway}>
                <Paper
                  className={profileArrowDrop ? 'dropDown-profile' : 'dropUp-profile'}
                  sx={{
                    background: theme.palette.background.main,
                    width: '100%',
                    height: '400px',
                    borderRadius: '10px',
                    p: 1,
                    border: `1px solid ${theme.palette.background.secondary}`,
                  }}
                >
                  <ProfileInfo />
                </Paper>
              </ClickAwayListener>
            </ProfilePopper>
            <Divider orientation="vertical" sx={{ width: '1px', height: '40px', backgroundColor: 'black' }} />
            <CustomButton disableRipple>
              <AppsIcon />
            </CustomButton>
            <CustomButton disableRipple>
              <SettingsIcon />
            </CustomButton>
          </Stack>
        )}
        {!user?.name && (
          <Stack>
            <CustomButton startIcon={<LoginIcon />} disableRipple onClick={loginHandler}>
              Login
            </CustomButton>
          </Stack>
        )}
      </Stack>
    </Box>
  );
}

export default TopBar;
