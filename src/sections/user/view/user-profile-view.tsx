import React, { useState } from 'react';

import { People, Settings, ArrowBack, ChatBubbleOutline } from '@mui/icons-material';
import {
  Box,
  Tab,
  Grid,
  Tabs,
  Paper,
  alpha,
  AppBar,
  useTheme,
  Container,
  Typography,
  IconButton,
} from '@mui/material';

import { useUserContext } from 'src/routes/components';

import UserProfileInfo from '../user-profile-info';
import UserProfileRightDisplay from '../user-profile-right-display';

interface UserProfileViewProps {
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

export const UserProfileView: React.FC<UserProfileViewProps> = ({ onBack, onSettings }) => {
  const { user } = useUserContext();

  const theme = useTheme();

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
            <UserProfileInfo />

            {/* Tabs */}
            <Paper
              sx={{ borderRadius: 3, backgroundColor: 'background.neutral', overflow: 'hidden' }}
            >
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
