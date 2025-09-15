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
import { useUpdateUserMutation } from 'src/core/apis/api-user';

import { Form } from 'src/components/hook-form';
import { LoadingScreen } from 'src/components/loading-screen';
import { useUpdateUserNotificationMutation } from 'src/core/apis';

const getFormData = (user: UserType | null) => ({
  id: user?.id || '',
  pushNotification: user?.pushNotification || false,
  smsNotification: user?.smsNotification || false,
  likesNotification: user?.likesNotification || false,
  repostNotification: user?.repostNotification || false,
  commentsNotification: user?.commentsNotification || false,
  newFollowersNotification: user?.newFollowersNotification || false,
  directMessage: user?.directMessage || false,
  roomInvitations: user?.roomInvitations || false,
  liveEvents: user?.liveEvents || false,
  soundNotification: user?.soundNotification || false,
  vibrationForNotification: user?.vibrationForNotification || false,
});

const notificationCategories = [
  {
    title: 'Social Interactions',
    description: 'Notifications about your social activity',
    items: [
      { key: 'likesNotification', label: 'Likes', description: 'When someone likes your posts' },
      { key: 'repostNotification', label: 'Reposts', description: 'When someone reposts your content' },
      { key: 'commentsNotification', label: 'Comments', description: 'When someone comments on your posts' },
      { key: 'newFollowersNotification', label: 'New Followers', description: 'When someone follows you' },
    ],
  },
  {
    title: 'Messages & Communication',
    description: 'Direct communication notifications',
    items: [
      { key: 'directMessage', label: 'Direct Messages', description: 'New private messages' },
      {
        key: 'roomInvitations',
        label: 'Room Invitations',
        description: 'Invites to language rooms',
      },
      { key: 'liveEvents', label: 'Live Events', description: 'Live sessions and events' },
    ],
  }
];

const deliveryMethods = [
  { key: 'pushNotification', label: 'Push Notifications', icon: Smartphone },
  { key: 'smsNotification', label: 'SMS Notifications', icon: MessageSquare },
];

function SettingsProfileNotifications() {
  const { user, loading } = useUserContext();

  const [updateUser] = useUpdateUserNotificationMutation();

  const methods = useForm<UserType>({
    resolver: zodResolver(UserSchema),
    defaultValues: getFormData(user),
  });

  const { watch, reset, handleSubmit, setValue } = methods;

  const values = watch();

  const onSubmit = async (data: any) => {
    try {
      if (!user?.id) {
        toast.error('User ID is required for updating privacy settings');
        return;
      }
      const response = await updateUser({ ...values, ...data, id: user.id });
      if (response.data?.status) {
        toast.success(response.data?.message || 'Privacy setting updated successfully');
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      reset(getFormData(user));
    }
  }, [user, loading, reset]);

  if (loading && !values) return <LoadingScreen />;

  return (
    <Card sx={{ p: { xs: 1, sm: 2 }, borderRadius: 1, backgroundColor: 'background.neutral' }}>
      <Form methods={methods}>
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
                          checked={!!values[method.key as keyof typeof values]}
                          onChange={() => {
                            setValue(method.key as keyof typeof values, !values[method.key as keyof typeof values]
                            );
                            onSubmit({ [method.key]: !values[method.key as keyof typeof values] });
                          }
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
                        checked={!!values[item.key as keyof typeof values]}
                        onChange={() => {
                          setValue(item.key as keyof typeof values, !values[item.key as keyof typeof values]
                          )
                          onSubmit({ [item.key]: !values[item.key as keyof typeof values] });
                        }
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
                    checked={values.soundNotification}
                    onChange={() => {
                      setValue('soundNotification', !values.soundNotification)
                      onSubmit({ soundNotification: !values.soundNotification });
                    }}
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
                    opacity: 0.5
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
                    checked={values.vibrationForNotification}
                    onChange={() => {
                      setValue('vibrationForNotification', !values.vibrationForNotification);
                      onSubmit({ vibrationForNotification: !values.vibrationForNotification });
                    }}
                    color="primary"
                    disabled
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
