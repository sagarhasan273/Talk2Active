import type { UserType } from 'src/types/user';

import { toast } from 'sonner';
import { Sun, Moon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import { Box, Card, Stack, Paper, Switch, Typography } from '@mui/material';

import { useUserContext } from 'src/routes/components';

import { UserSchema } from 'src/schemas/user';
import { useUpdateUserMutation } from 'src/services/user-api';

import { Form } from 'src/components/hook-form';
import { useSettingsContext } from 'src/components/settings';
import { LoadingScreen } from 'src/components/loading-screen';
import { NavOptions } from 'src/components/settings/drawer/nav-options';

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

function SettingsProfileAppearance() {
  const { user, loading } = useUserContext();
  const settings = useSettingsContext();

  const [isDarkMode, setIsDarkMode] = useState(false);

  const [updateUser] = useUpdateUserMutation();

  const methods = useForm<UserType>({
    resolver: zodResolver(UserSchema),
    defaultValues: getFormData(user),
  });

  const { watch, reset, handleSubmit } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    try {
      const response = await updateUser({ ...data });
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

  const renderColor = (
    <NavOptions
      value={{
        color: settings.primaryColor,
      }}
      onClickOption={{
        color: (newValue) => settings.onUpdateField('primaryColor', newValue),
      }}
      options={{
        colors: ['blue', 'cyan', 'orange', 'purple', 'red'],
      }}
    />
  );

  if (loading && !values) return <LoadingScreen />;

  return (
    <Card sx={{ p: { xs: 1, sm: 2 }, borderRadius: 1, backgroundColor: 'background.neutral' }}>
      <Form methods={methods} onSubmit={onSubmit}>
        <Box mb={4}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Appearance
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Customize how the app looks and feels
          </Typography>
        </Box>

        <Stack spacing={2}>
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 3 }}>
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
        <Stack sx={{ mt: 3 }}>{renderColor}</Stack>
      </Form>
    </Card>
  );
}

export default SettingsProfileAppearance;
