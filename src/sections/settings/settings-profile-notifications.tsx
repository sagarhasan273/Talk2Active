import type { UserType } from 'src/validations/user';

import { toast } from 'sonner';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { grey } from '@mui/material/colors';
import { Box, Card, Paper, Stack, Switch, Typography } from '@mui/material';

import { useUserContext } from 'src/routes/components';

import { UserSchema } from 'src/validations/user';
import { useUpdateUserMutation } from 'src/services/user-api';

import { Form } from 'src/components/hook-form';
import { LoadingScreen } from 'src/components/loading-screen';

const getFormData = (user: UserType | null) => ({
  _id: user?._id || '',
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

function SettingsProfileNotifications() {
  const { user, loading } = useUserContext();

  const [notifications, setNotifications] = React.useState<Record<string, boolean>>({
    likes: true,
    reposts: true,
    comments: true,
    follows: true,
    mentions: true,
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
      const response = await updateUser({ _id: user?._id, ...data });
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
            <Paper key={key} elevation={0} sx={{ p: 2, bgcolor: grey[50], borderRadius: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle1" fontWeight="medium" textTransform="capitalize">
                    {key}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Get notified when someone{' '}
                    {key === 'follows' ? 'follows you' : `${key} your posts`}
                  </Typography>
                </Box>
                <Switch
                  checked={value}
                  onChange={() => setNotifications((prev) => ({ ...prev, [key]: !value }))}
                  color="primary"
                />
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Form>
    </Card>
  );
}

export default SettingsProfileNotifications;
