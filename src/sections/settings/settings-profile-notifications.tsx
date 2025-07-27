import type { UserType } from 'src/types/user';

import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Smartphone, MessageSquare } from 'lucide-react';

import { VolumeUp, Vibration } from '@mui/icons-material';
import { Box, Card, Grid, Paper, Stack, Switch, Typography } from '@mui/material';

import { useUserContext } from 'src/routes/components';

import { UserSchema } from 'src/schemas/user';
import { useUpdateUserMutation } from 'src/services/user-api';

import { Form } from 'src/components/hook-form';
import { LoadingScreen } from 'src/components/loading-screen';

const getFormData = (user: UserType | null) => ({
  id: user?.id || '',
  userId: user?.userId || '',
  name: user?.name || '',
  username: user?.username || '',
  email: user?.email || '',
  profilePhoto: user?.profilePhoto || '',
  coverPhoto: user?.coverPhoto || '',
  bio: user?.bio || '',
  location: user?.location || '',
  website: user?.website || '',
});

const notificationCategories = [
  {
    title: 'Social Interactions',
    description: 'Notifications about your social activity',
    items: [
      { key: 'likes', label: 'Likes', description: 'When someone likes your posts' },
      { key: 'reposts', label: 'Reposts', description: 'When someone reposts your content' },
      { key: 'comments', label: 'Comments', description: 'When someone comments on your posts' },
      { key: 'follows', label: 'New Followers', description: 'When someone follows you' },
      { key: 'mentions', label: 'Mentions', description: 'When someone mentions you' },
    ],
  },
  {
    title: 'Messages & Communication',
    description: 'Direct communication notifications',
    items: [
      { key: 'directMessages', label: 'Direct Messages', description: 'New private messages' },
      {
        key: 'roomInvitations',
        label: 'Room Invitations',
        description: 'Invites to language rooms',
      },
      { key: 'liveEvents', label: 'Live Events', description: 'Live sessions and events' },
    ],
  },
  {
    title: 'Content & Discovery',
    description: 'Content recommendations and updates',
    items: [
      {
        key: 'trendingContent',
        label: 'Trending Content',
        description: 'Popular posts and topics',
      },
      {
        key: 'aiSuggestions',
        label: 'AI Suggestions',
        description: 'Personalized content recommendations',
      },
      {
        key: 'communityHighlights',
        label: 'Community Highlights',
        description: 'Featured community content',
      },
    ],
  },
  {
    title: 'Reports & Updates',
    description: 'Periodic summaries and updates',
    items: [
      { key: 'weeklyReport', label: 'Weekly Report', description: 'Your weekly activity summary' },
      { key: 'emailDigest', label: 'Email Digest', description: 'Daily email summaries' },
      {
        key: 'productUpdates',
        label: 'Product Updates',
        description: 'New features and improvements',
      },
    ],
  },
  {
    title: 'Security & Marketing',
    description: 'Security alerts and promotional content',
    items: [
      {
        key: 'securityAlerts',
        label: 'Security Alerts',
        description: 'Important security notifications',
      },
      {
        key: 'marketingEmails',
        label: 'Marketing Emails',
        description: 'Promotional content and offers',
      },
    ],
  },
];

const deliveryMethods = [
  { key: 'pushNotifications', label: 'Push Notifications', icon: Smartphone },
  { key: 'smsNotifications', label: 'SMS Notifications', icon: MessageSquare },
];

function SettingsProfileNotifications() {
  const { user, loading } = useUserContext();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  const [notifications, setNotifications] = useState({
    likes: true,
    reposts: true,
    comments: true,
    follows: true,
    mentions: true,
    directMessages: true,
    emailDigest: false,
    pushNotifications: true,
    smsNotifications: false,
    weeklyReport: true,
    securityAlerts: true,
    marketingEmails: false,
    productUpdates: true,
    communityHighlights: true,
    trendingContent: false,
    liveEvents: true,
    roomInvitations: true,
    aiSuggestions: true,
  });

  const [updateUser] = useUpdateUserMutation();

  const methods = useForm<UserType>({
    resolver: zodResolver(UserSchema),
    defaultValues: getFormData(user),
  });

  const { watch, reset, handleSubmit } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (!user?.id) {
        toast.error('User ID is required for updating profile');
        return;
      }
      const response = await updateUser({ ...data, id: user.id, });
      const updatedUser = getFormData(data);
      reset(updatedUser);
      console.info('DATA', response);
      toast.success('Profile updated successfully');
    } catch (err) {
      console.error(err);
    }
  });

  useEffect(() => {
    if (!loading && user) {
      reset(getFormData(user));
    }
  }, [user, loading, reset]);

  if (loading && !values) return <LoadingScreen />;

  return (
    <Card sx={{ p: { xs: 1, sm: 2 }, borderRadius: 1, backgroundColor: 'background.neutral' }}>
      <Form methods={methods} onSubmit={onSubmit}>
        <Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              Notification Preferences
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Choose what notifications you want to receive and how
            </Typography>
          </Box>

          <Stack spacing={2}>
            {/* Delivery Methods */}
            <Card sx={{ backgroundColor: 'background.paper', borderRadius: 2, p: 2 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 'semibold', color: 'text.primary', mb: 2 }}
              >
                Delivery Methods
              </Typography>
              <Grid container spacing={2}>
                {deliveryMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <Grid item xs={12} md={6} key={method.key}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          py: 1,
                          bgcolor: 'background.neutral',
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'grey.200',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Icon color="primary" />
                          <Typography fontWeight="medium">{method.label}</Typography>
                        </Box>
                        <Switch
                          checked={!!notifications[method.key as keyof typeof notifications]}
                          onChange={() =>
                            setNotifications((prev) => ({
                              ...prev,
                              [method.key]: !prev[method.key as keyof typeof prev],
                            }))
                          }
                          color="primary"
                        />
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </Card>

            {/* Notification Categories */}
            {notificationCategories.map((category) => (
              <Paper
                key={category.title}
                elevation={0}
                sx={{ backgroundColor: 'background.paper', borderRadius: 2, p: 2 }}
              >
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'semibold', color: 'text.primary' }}>
                    {category.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {category.description}
                  </Typography>
                </Box>
                <Stack spacing={1}>
                  {category.items.map((item) => (
                    <Paper
                      key={item.key}
                      elevation={0}
                      sx={{
                        p: 2,
                        py: 1,
                        bgcolor: 'background.neutral',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'grey.200',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box>
                        <Typography fontWeight="semibold">{item.label}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.description}
                        </Typography>
                      </Box>
                      <Switch
                        checked={!!notifications[item.key as keyof typeof notifications]}
                        onChange={() =>
                          setNotifications((prev) => ({
                            ...prev,
                            [item.key]: !prev[item.key as keyof typeof prev],
                          }))
                        }
                        color="primary"
                      />
                    </Paper>
                  ))}
                </Stack>
              </Paper>
            ))}

            {/* Sound & Vibration */}
            <Paper
              elevation={0}
              sx={{ backgroundColor: 'background.paper', borderRadius: 4, p: 3 }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 'semibold', color: 'text.primary', mb: 2 }}
              >
                Sound & Vibration
              </Typography>
              <Stack spacing={2}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    py: 1,
                    bgcolor: 'background.neutral',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'grey.200',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VolumeUp color="info" />
                    <Box>
                      <Typography fontWeight="semibold">Sound Notifications</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Play sounds for notifications
                      </Typography>
                    </Box>
                  </Box>
                  <Switch
                    checked={soundEnabled}
                    onChange={() => setSoundEnabled(!soundEnabled)}
                    color="primary"
                  />
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'grey.200',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Vibration color="success" />
                    <Box>
                      <Typography fontWeight="semibold">Vibration</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Vibrate for notifications
                      </Typography>
                    </Box>
                  </Box>
                  <Switch
                    checked={vibrationEnabled}
                    onChange={() => setVibrationEnabled(!vibrationEnabled)}
                    color="primary"
                  />
                </Paper>
              </Stack>
            </Paper>
          </Stack>
        </Box>
      </Form>
    </Card>
  );
}

export default SettingsProfileNotifications;
