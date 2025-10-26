import React, { useState } from 'react';

import { Settings, ArrowBack } from '@mui/icons-material';
import {
  Box,
  Tab,
  Tabs,
  Paper,
  alpha,
  AppBar,
  useTheme,
  Container,
  Typography,
  IconButton,
} from '@mui/material';

import { useUserContext } from 'src/routes/route-components';

import { Iconify } from 'src/components/iconify';

import UserProfileInfo from '../user-profile-info';
import { UserPostContainer } from '../user-post-container';

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
      }}
    >
      {/* Header */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Container
          maxWidth="md"
          sx={{ py: 1, display: 'flex', flexDirection: 'row', backgroundColor: 'background.paper' }}
        >
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
      <Container
        maxWidth="md"
        sx={{ py: 3, px: { xs: 0, sm: 2 }, backgroundColor: 'background.paper' }}
      >
        {/* Main Profile Section */}
        {/* Cover Image */}
        <Paper
          sx={{
            height: 200,
            background: 'linear-gradient(45deg, #9333ea, #ec4899, #9333ea)',
            backgroundImage: `url(${user?.coverPhoto})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: 1,
            mb: 1,
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
        <Paper sx={{ borderRadius: 1, overflow: 'hidden' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              px: { xs: 0, sm: 2 },
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
            <Tab label="Likes" />
            <Tab label="Dislikes" />
            <Tab label="Pins" />
          </Tabs>

          <TabPanel value={activeTab} index={0}>
            <UserPostContainer />
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Iconify icon="mdi:like-outline" width={48} color="text.secondary" />
              <Typography variant="h6" fontWeight="bold" color="text.secondary" gutterBottom>
                No likes yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Likes will appear here.
              </Typography>
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Iconify icon="mdi:dislike-outline" width={48} color="text.secondary" />
              <Typography variant="h6" fontWeight="bold" color="text.secondary" gutterBottom>
                No dislikes yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Dislikes will appear here.
              </Typography>
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Iconify icon="mynaui:pin" width={48} color="text.secondary" />
              <Typography variant="h6" fontWeight="bold" color="text.secondary" gutterBottom>
                No pins yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pins will appear here.
              </Typography>
            </Box>
          </TabPanel>
        </Paper>
      </Container>
    </Box>
  );
};

export default UserProfileView;
