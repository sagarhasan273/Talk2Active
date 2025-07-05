import React, { useState } from 'react';

import {
  Link,
  Share,
  People,
  Settings,
  ArrowBack,
  LocationOn,
  CheckCircle,
  CalendarToday,
  ChatBubbleOutline,
} from '@mui/icons-material';
import {
  Box,
  Tab,
  Grid,
  Tabs,
  Paper,
  Stack,
  alpha,
  Avatar,
  AppBar,
  Tooltip,
  useTheme,
  Container,
  Typography,
  IconButton,
  Link as MuiLink,
} from '@mui/material';

import { useUserContext } from 'src/routes/components';

import { fDate } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';

import UserProfileRightDisplay from '../user-profile-right-display';

interface UserProfileViewProps {
  profile: {
    name: string;
    username: string;
    avatar: string;
    coverImage: string;
    verified: boolean;
    bio: string;
    location?: string;
    website?: string;
    joinDate: Date;
    posts: number;
    following: number;
    followers: number;
  };
  onBack?: () => void;
  onSettings?: () => void;
}

interface TabPanelProps {
  children: React.ReactNode;
  value: number;
  index: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <Box hidden={value !== index} sx={{ py: 3 }}>
    {value === index && children}
  </Box>
);

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  profile,
  onBack,
  onSettings,
}) => {
  const { user } = useUserContext();

  const theme = useTheme();

  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  interface TabChangeEvent extends React.SyntheticEvent<Element, Event> {}

  interface HandleTabChange {
    (event: TabChangeEvent, newValue: number): void;
  }

  const handleTabChange: HandleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'background.paper',
      }}
    >
      {/* Header */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: alpha(theme.palette.background.neutral, 0.5),
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Container maxWidth="lg" sx={{ py: 1, display: 'flex', flexDirection: 'row' }}>
          <IconButton onClick={onBack} sx={{ mr: 2, color: 'text.primary' }}>
            <ArrowBack />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
              {user?.name}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {user?.postCount} posts
            </Typography>
          </Box>
          {onSettings && (
            <IconButton onClick={onSettings} sx={{ color: 'text.primary' }}>
              <Settings />
            </IconButton>
          )}
        </Container>
      </AppBar>

      {/* Profile Content */}
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Grid container spacing={2}>
          {/* Main Profile Section */}
          <Grid item xs={12} lg={8}>
            {/* Cover Image */}
            <Paper
              sx={{
                height: 200,
                background: 'linear-gradient(45deg, #9333ea, #ec4899, #9333ea)',
                backgroundImage: `url(${user?.coverPhoto})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: 3,
                mb: 3,
                position: 'relative',
                overflow: 'hidden',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.2), transparent)',
                },
              }}
            />

            {/* Profile Info */}
            <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
              {/* Avatar and Actions */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  mt: -10,
                  mb: 3,
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={user?.profilePhoto ? user.profilePhoto.toString() : undefined}
                    alt={user?.name ? user.name.toString() : undefined}
                    sx={{
                      width: 128,
                      height: 128,
                      border: '4px solid white',
                      boxShadow: theme.shadows[4],
                    }}
                  />
                  {profile.verified && (
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        bgcolor: 'background.paper',
                        borderRadius: '50%',
                        p: 0.5,
                      }}
                    >
                      <CheckCircle sx={{ color: 'primary.main', fontSize: 20 }} />
                    </Box>
                  )}
                </Box>

                <Stack direction="row" sx={{ mt: 8, gap: { xs: 0.8, md: 1 } }}>
                  <IconButton
                    sx={{
                      border: 1,
                      height: 40,
                      width: 40,
                      borderColor: 'primary.dark',
                      color: 'primary.main',
                    }}
                  >
                    <Share />
                  </IconButton>
                  <IconButton
                    sx={{
                      border: 1,
                      height: 40,
                      width: 40,
                      borderColor: 'primary.dark',
                      color: 'primary.main',
                    }}
                  >
                    <Iconify icon="ant-design:message-filled" />
                  </IconButton>
                  <IconButton
                    onClick={() => setIsFollowing(!isFollowing)}
                    sx={{
                      border: 1,
                      height: 40,
                      width: 40,
                      ...(isFollowing
                        ? { borderColor: 'error.dark', color: 'error.main' }
                        : { borderColor: 'primary.dark', color: 'primary.main' }),

                      '&:hover': {
                        borderColor: 'inherit',
                        color: 'inherit',
                        backgroundColor: 'transparent',
                      },
                    }}
                  >
                    <Tooltip title={isFollowing ? 'Unfollow' : 'Follow'}>
                      {isFollowing ? (
                        <Iconify icon="ri:user-unfollow-fill" />
                      ) : (
                        <Iconify icon="ri:user-follow-fill" />
                      )}
                    </Tooltip>
                  </IconButton>
                </Stack>
              </Box>

              {/* User Info */}
              <Stack spacing={2}>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="h4" fontWeight="bold">
                      {user?.name}
                    </Typography>
                    {user?.verified && <CheckCircle sx={{ color: 'primary.main', fontSize: 20 }} />}
                  </Stack>
                  <Typography variant="body1" color="text.secondary">
                    @{user?.username}
                  </Typography>
                </Box>

                <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                  {user?.bio}
                </Typography>

                <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap', gap: 1 }}>
                  {user?.location && (
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {user?.location}
                      </Typography>
                    </Stack>
                  )}
                  {user?.website && (
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Link sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <MuiLink
                        href={`https://${user?.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        color="primary"
                        underline="hover"
                        variant="body2"
                      >
                        {user?.website}
                      </MuiLink>
                    </Stack>
                  )}
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Joined {user?.joinDate ? fDate(user.joinDate) : ''}
                    </Typography>
                  </Stack>
                </Stack>

                {/* Stats */}
                <Stack direction="row" spacing={3}>
                  <Box>
                    <Typography component="span" fontWeight="bold" color="text.primary">
                      {user?.followersCount}
                    </Typography>
                    <Typography component="span" color="text.secondary" sx={{ ml: 0.5 }}>
                      Following
                    </Typography>
                  </Box>
                  <Box>
                    <Typography component="span" fontWeight="bold" color="text.primary">
                      {user?.followingCount}
                    </Typography>
                    <Typography component="span" color="text.secondary" sx={{ ml: 0.5 }}>
                      Followers
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </Paper>

            {/* Tabs */}
            <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 'bold',
                  },
                  '& .Mui-selected': {
                    color: 'primary.main',
                  },
                }}
              >
                <Tab label="Posts" />
                <Tab label="Replies" />
                <Tab label="Media" />
                <Tab label="Likes" />
              </Tabs>

              <TabPanel value={activeTab} index={0}>
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <People sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" fontWeight="bold" color="text.secondary" gutterBottom>
                    No posts yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    When {user?.name} posts, theyll show up here.
                  </Typography>
                </Box>
              </TabPanel>

              <TabPanel value={activeTab} index={1}>
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <ChatBubbleOutline sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" fontWeight="bold" color="text.secondary" gutterBottom>
                    No replies yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Replies will appear here.
                  </Typography>
                </Box>
              </TabPanel>

              <TabPanel value={activeTab} index={2}>
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: 'text.disabled',
                      borderRadius: 2,
                      mx: 'auto',
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography sx={{ color: 'white' }}>📷</Typography>
                  </Box>
                  <Typography variant="h6" fontWeight="bold" color="text.secondary" gutterBottom>
                    No media yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Photos and videos will show up here.
                  </Typography>
                </Box>
              </TabPanel>

              <TabPanel value={activeTab} index={3}>
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: 'error.light',
                      borderRadius: '50%',
                      mx: 'auto',
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography sx={{ fontSize: 20 }}>❤️</Typography>
                  </Box>
                  <Typography variant="h6" fontWeight="bold" color="text.secondary" gutterBottom>
                    No likes yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Liked posts will appear here.
                  </Typography>
                </Box>
              </TabPanel>
            </Paper>
          </Grid>

          {/* Right Sidebar */}
          <Grid item xs={12} lg={4}>
            <UserProfileRightDisplay />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default UserProfileView;
