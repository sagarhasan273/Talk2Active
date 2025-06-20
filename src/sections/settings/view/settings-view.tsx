import type { UserProfile } from 'src/types/post';

import React, { useState } from 'react';
import {
  Eye,
  Sun,
  User,
  Mail,
  Link,
  Save,
  Bell,
  Moon,
  Camera,
  MapPin,
  Upload,
  EyeOff,
  Shield,
  Palette,
  FileText,
} from 'lucide-react';

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
  useTheme,
  TextField,
  IconButton,
  Typography,
  CardContent,
  InputAdornment,
} from '@mui/material';

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
  const [formData, setFormData] = useState({
    name: profile.name,
    username: profile.username,
    bio: profile.bio,
    location: profile.location,
    website: profile.website,
    avatar: profile.avatar,
    coverImage: profile.coverImage,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    likes: true,
    reposts: true,
    comments: true,
    follows: true,
    mentions: true,
  });
  const theme = useTheme();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (type: 'avatar' | 'cover') => {
    setIsUploading(true);
    // Simulate image upload
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // For demo purposes, we'll use placeholder images
    const newImageUrl =
      type === 'avatar'
        ? 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
        : 'https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop';

    setFormData((prev) => ({
      ...prev,
      [type === 'avatar' ? 'avatar' : 'coverImage']: newImageUrl,
    }));
    setIsUploading(false);
  };

  const handleSaveProfile = () => {
    const updatedProfile: UserProfile = {
      ...profile,
      ...formData,
    };
    onUpdateProfile(updatedProfile);
  };

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
              {activeTab === 'profile' && (
                <CardContent sx={{ p: 4 }}>
                  <Box mb={4}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      Profile Information
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Update your profile details and images
                    </Typography>
                  </Box>

                  {/* Cover Image */}
                  <Box mb={4}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Cover Image
                    </Typography>
                    <Box
                      sx={{
                        position: 'relative',
                        height: 192,
                        background: `linear-gradient(to right, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
                        borderRadius: 3,
                        overflow: 'hidden',
                        '&:hover .cover-overlay': {
                          opacity: 1,
                        },
                      }}
                    >
                      <Box
                        component="img"
                        src={formData.coverImage}
                        alt="Cover"
                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <Box
                        className="cover-overlay"
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          backgroundColor: 'rgba(0, 0, 0, 0.4)',
                          opacity: 0,
                          transition: 'opacity 300ms',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Button
                          onClick={() => handleImageUpload('cover')}
                          disabled={isUploading}
                          startIcon={isUploading ? null : <Camera size={18} />}
                          sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(10px)',
                            color: 'common.white',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 0.3)',
                            },
                          }}
                        >
                          {isUploading ? (
                            <>
                              <Box
                                sx={{
                                  width: 16,
                                  height: 16,
                                  border: '2px solid rgba(255, 255, 255, 0.2)',
                                  borderTopColor: 'common.white',
                                  borderRadius: '50%',
                                  animation: 'spin 1s linear infinite',
                                  mr: 1,
                                }}
                              />
                              Uploading...
                            </>
                          ) : (
                            'Change Cover'
                          )}
                        </Button>
                      </Box>
                    </Box>
                  </Box>

                  {/* Avatar */}
                  <Box mb={4}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Profile Picture
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={3}>
                      <Box sx={{ position: 'relative', '&:hover .avatar-overlay': { opacity: 1 } }}>
                        <Box
                          component="img"
                          src={formData.avatar}
                          alt="Avatar"
                          sx={{
                            width: 96,
                            height: 96,
                            borderRadius: '50%',
                            border: '4px solid white',
                            boxShadow: 3,
                          }}
                        />
                        <Box
                          className="avatar-overlay"
                          sx={{
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.4)',
                            opacity: 0,
                            transition: 'opacity 300ms',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <IconButton
                            onClick={() => handleImageUpload('avatar')}
                            disabled={isUploading}
                            sx={{ color: 'common.white' }}
                          >
                            <Camera size={20} />
                          </IconButton>
                        </Box>
                      </Box>
                      <Box>
                        <GradientButton
                          onClick={() => handleImageUpload('avatar')}
                          disabled={isUploading}
                          startIcon={<Upload size={16} />}
                          sx={{ borderRadius: 6 }}
                        >
                          {isUploading ? (
                            <>
                              <Box
                                sx={{
                                  width: 16,
                                  height: 16,
                                  border: '2px solid rgba(255, 255, 255, 0.2)',
                                  borderTopColor: 'common.white',
                                  borderRadius: '50%',
                                  animation: 'spin 1s linear infinite',
                                  mr: 1,
                                }}
                              />
                              Uploading...
                            </>
                          ) : (
                            'Upload New'
                          )}
                        </GradientButton>
                        <Typography variant="caption" color="text.secondary" mt={1} display="block">
                          JPG, PNG or GIF. Max size 5MB.
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  {/* Form Fields */}
                  <Stack spacing={3}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label={
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <User size={16} />
                              <span>Display Name</span>
                            </Stack>
                          }
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Your display name"
                          variant="outlined"
                          InputProps={{
                            sx: { borderRadius: 3 },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label={
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Mail size={16} />
                              <span>Username</span>
                            </Stack>
                          }
                          value={formData.username}
                          onChange={(e) => handleInputChange('username', e.target.value)}
                          placeholder="@username"
                          variant="outlined"
                          InputProps={{
                            sx: { borderRadius: 3 },
                          }}
                        />
                      </Grid>
                    </Grid>

                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label={
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <FileText size={16} />
                          <span>Bio</span>
                        </Stack>
                      }
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Tell us about yourself..."
                      variant="outlined"
                      inputProps={{ maxLength: 160 }}
                      InputProps={{
                        sx: { borderRadius: 3 },
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" textAlign="right">
                      {formData.bio.length}/160
                    </Typography>

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label={
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <MapPin size={16} />
                              <span>Location</span>
                            </Stack>
                          }
                          value={formData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          placeholder="Your location"
                          variant="outlined"
                          InputProps={{
                            sx: { borderRadius: 3 },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label={
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Link size={16} />
                              <span>Website</span>
                            </Stack>
                          }
                          value={formData.website}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          placeholder="yourwebsite.com"
                          variant="outlined"
                          InputProps={{
                            sx: { borderRadius: 3 },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Stack>

                  {/* Save Button */}
                  <Box mt={4} pt={3} borderTop={`1px solid ${theme.palette.divider}`}>
                    <GradientButton
                      onClick={handleSaveProfile}
                      startIcon={<Save size={18} />}
                      sx={{ borderRadius: 3, boxShadow: 3 }}
                    >
                      Save Changes
                    </GradientButton>
                  </Box>
                </CardContent>
              )}

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
