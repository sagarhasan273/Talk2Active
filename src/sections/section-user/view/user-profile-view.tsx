import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { Box, Tab, Tabs, Paper, Container } from '@mui/material';

import { selectAccount } from 'src/core/slices';

import UserProfileInfo from '../user-profile-info';
import { UserPinContainer } from '../user-pin-container';
import { UserPostContainer } from '../user-post-container';
import { UserLikeContainer } from '../user-like-container';
import { UserDislikeContainer } from '../user-dislike-container';

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

export const UserProfileView: React.FC<UserProfileViewProps> = () => {
  const user = useSelector(selectAccount);

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
            <UserLikeContainer />
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <UserDislikeContainer />
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <UserPinContainer />
          </TabPanel>
        </Paper>
      </Container>
    </Box>
  );
};

export default UserProfileView;
