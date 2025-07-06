import type { UserType } from 'src/validations/user';

import { toast } from 'sonner';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { grey } from '@mui/material/colors';
import { Box, Card, Stack, Paper, Radio, Typography } from '@mui/material';

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

function SettingsProfilePrivacy() {
  const { user, loading } = useUserContext();

  const [updateUser] = useUpdateUserMutation();

  const methods = useForm<UserType>({
    resolver: zodResolver(UserSchema),
    defaultValues: getFormData(user),
  });

  const {
    watch,
    reset,

    handleSubmit,
  } = methods;

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
      </Form>
    </Card>
  );
}

export default SettingsProfilePrivacy;
