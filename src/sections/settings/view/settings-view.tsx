import type { UserProfile } from 'src/types/post';

import React, { useState } from 'react';
import { Eye, Sun, User, Bell, Moon, EyeOff, Shield, Palette } from 'lucide-react';

import { grey } from '@mui/material/colors';
import {
  Box,
  Tab,
  Card,
  Grid,
  Tabs,
  Paper,
  Radio,
  Stack,
  Button,
  Switch,
  styled,
  TextField,
  IconButton,
  Typography,
  CardContent,
  InputAdornment,
} from '@mui/material';

import SettingsProfileInformation from '../settings-profile-information';

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

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: theme.palette.common.white,
  '&:hover': {
    background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
    transform: 'scale(1.05)',
  },
}));

export const SettingsView: React.FC<SettingsProps> = ({ profile, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState<
    'profile' | 'account' | 'privacy' | 'notifications' | 'appearance'
  >('profile');

  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    likes: true,
    reposts: true,
    comments: true,
    follows: true,
    mentions: true,
  });

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
        <Grid container spacing={4}>
          {/* Sidebar */}
          <Grid item xs={12} md={3}>
            <StyledTabs
              orientation="vertical"
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{ '& .MuiTabs-flexContainer': { gap: 1 } }}
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
            <Card sx={{ borderRadius: 4, boxShadow: 1, overflow: 'hidden' }}>
              {/* Profile Tab */}
              {activeTab === 'profile' && <SettingsProfileInformation />}

              {/* Account Tab */}
              {activeTab === 'account' && (
                <CardContent sx={{ p: 4 }}>
                  <Box mb={4}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      Account Settings
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Manage your account security and preferences
                    </Typography>
                  </Box>

                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      value="alex@example.com"
                      type="email"
                      variant="outlined"
                      InputProps={{
                        sx: { borderRadius: 3 },
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Current Password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter current password"
                      variant="outlined"
                      InputProps={{
                        sx: { borderRadius: 3 },
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      fullWidth
                      label="New Password"
                      type="password"
                      placeholder="Enter new password"
                      variant="outlined"
                      InputProps={{
                        sx: { borderRadius: 3 },
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Confirm New Password"
                      type="password"
                      placeholder="Confirm new password"
                      variant="outlined"
                      InputProps={{
                        sx: { borderRadius: 3 },
                      }}
                    />

                    <GradientButton sx={{ borderRadius: 3 }}>Update Password</GradientButton>
                  </Stack>
                </CardContent>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <CardContent sx={{ p: 4 }}>
                  <Box mb={4}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      Notification Preferences
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Choose what notifications you want to receive
                    </Typography>
                  </Box>

                  <Stack spacing={2}>
                    {Object.entries(notifications).map(([key, value]) => (
                      <Paper
                        key={key}
                        elevation={0}
                        sx={{ p: 2, bgcolor: grey[50], borderRadius: 3 }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography
                              variant="subtitle1"
                              fontWeight="medium"
                              textTransform="capitalize"
                            >
                              {key}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Get notified when someone{' '}
                              {key === 'follows' ? 'follows you' : `${key} your posts`}
                            </Typography>
                          </Box>
                          <Switch
                            checked={value}
                            onChange={() =>
                              setNotifications((prev) => ({ ...prev, [key]: !value }))
                            }
                            color="primary"
                          />
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </CardContent>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <CardContent sx={{ p: 4 }}>
                  <Box mb={4}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      Appearance
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Customize how the app looks and feels
                    </Typography>
                  </Box>

                  <Stack spacing={2}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: grey[50], borderRadius: 3 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" alignItems="center" spacing={2}>
                          {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                          <Box>
                            <Typography variant="subtitle1" fontWeight="medium">
                              Dark Mode
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Switch between light and dark themes
                            </Typography>
                          </Box>
                        </Stack>
                        <Switch
                          checked={isDarkMode}
                          onChange={() => setIsDarkMode(!isDarkMode)}
                          color="primary"
                        />
                      </Stack>
                    </Paper>
                  </Stack>
                </CardContent>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <CardContent sx={{ p: 4 }}>
                  <Box mb={4}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      Privacy Settings
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Control who can see your content and interact with you
                    </Typography>
                  </Box>

                  <Stack spacing={3}>
                    <Paper elevation={0} sx={{ p: 3, bgcolor: grey[50], borderRadius: 3 }}>
                      <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                        Account Privacy
                      </Typography>
                      <Stack spacing={1}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Radio checked color="primary" />
                          <Typography>Public - Anyone can see your posts</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Radio color="primary" />
                          <Typography>Private - Only followers can see your posts</Typography>
                        </Stack>
                      </Stack>
                    </Paper>

                    <Paper elevation={0} sx={{ p: 3, bgcolor: grey[50], borderRadius: 3 }}>
                      <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                        Who can message you
                      </Typography>
                      <Stack spacing={1}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Radio checked color="primary" />
                          <Typography>Everyone</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Radio color="primary" />
                          <Typography>People you follow</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Radio color="primary" />
                          <Typography>No one</Typography>
                        </Stack>
                      </Stack>
                    </Paper>
                  </Stack>
                </CardContent>
              )}
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};
