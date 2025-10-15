import type { UserProfile } from 'src/types/post';

import React, { useState } from 'react';
import { Eye, User, Bell, Shield, Palette } from 'lucide-react';

import { Box, Tab, Card, Grid, Tabs, Stack, styled } from '@mui/material';

import SettingsProfileAccount from '../settings-profile-account';
import SettingsProfilePrivacy from '../settings-profile-privacy';
import SettingsProfileAppearance from '../settings-profile-appearance';
import SettingsProfileInformation from '../settings-profile-information';
import SettingsProfileNotifications from '../settings-profile-notifications';

interface SettingsProps {
  profile: UserProfile;
  onUpdateProfile: (updatedProfile: UserProfile) => void;
}

const StyledTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    display: 'none',
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  minHeight: 'auto',
  padding: theme.spacing(1.5, 2),
  margin: theme.spacing(0.5, 0),
  borderRadius: theme.shape.borderRadius * 2,
  '&.Mui-selected': {
    background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    color: theme.palette.common.white,
    boxShadow: theme.shadows[4],
  },
  '&:not(.Mui-selected)': {
    color: theme.palette.text.secondary,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
      color: theme.palette.text.primary,
    },
  },
}));

export const SettingsView: React.FC<SettingsProps> = ({ profile, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState<
    'profile' | 'account' | 'privacy' | 'notifications' | 'appearance'
  >('profile');

  const tabs = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'account', label: 'Account', icon: Shield },
    { key: 'privacy', label: 'Privacy', icon: Eye },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
      }}
    >
      <Box sx={{ maxWidth: 'md', mx: 'auto', px: 2, py: 3 }}>
        <Grid container spacing={3}>
          {/* Sidebar */}
          <Grid item xs={12} md={3}>
            <StyledTabs
              orientation="vertical"
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{
                p: { xs: 1, sm: 2 },
                borderRadius: { xs: 1, sm: 2, md: 3 },
                '& .MuiTabs-flexContainer': { gap: 1 },
                backgroundColor: 'background.neutral',
              }}
            >
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <StyledTab
                    key={tab.key}
                    value={tab.key}
                    label={
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Icon size={20} />
                        <span>{tab.label}</span>
                      </Stack>
                    }
                    sx={{ justifyContent: 'flex-start' }}
                  />
                );
              })}
            </StyledTabs>
          </Grid>

          {/* Content */}
          <Grid item xs={12} md={9}>
            <Card sx={{ borderRadius: { xs: 1, sm: 2, md: 3 }, boxShadow: 1, overflow: 'hidden' }}>
              {/* Profile Tab */}
              {activeTab === 'profile' && <SettingsProfileInformation />}

              {/* Account Tab */}
              {activeTab === 'account' && <SettingsProfileAccount />}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && <SettingsProfileNotifications />}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && <SettingsProfileAppearance />}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && <SettingsProfilePrivacy />}
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};
