import type { UserType } from 'src/types/user';

import { toast } from 'sonner';
import { Sun, Moon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import { Box, Card, Stack, Paper, Switch, Typography } from '@mui/material';

import { UserSchema } from 'src/schemas/schema-user';
import { useUpdateUserAppearanceMutation } from 'src/core/apis';
import { selectAccount, selectAuthLoading } from 'src/core/slices';

import { Form } from 'src/components/hook-form';
import { useSettingsContext } from 'src/components/settings';
import { LoadingScreen } from 'src/components/loading-screen';
import { NavOptions } from 'src/components/settings/drawer/nav-options';

const getFormData = (user: UserType | null) => ({
  id: user?.id || '',
  primaryColor: user?.primaryColor,
  themeMode: user?.themeMode,
});

function SettingsProfileAppearance() {
  const user = useSelector(selectAccount);
  const loading = useSelector(selectAuthLoading);
  const settings = useSettingsContext();

  const [isDarkMode, setIsDarkMode] = useState(false);

  const [updateUser] = useUpdateUserAppearanceMutation();

  const methods = useForm<UserType>({
    resolver: zodResolver(UserSchema),
    defaultValues: getFormData(user),
  });

  const { watch, reset } = methods;

  const values = watch();

  const onSubmit = async (data: any) => {
    try {
      if (!user.id) {
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

  const renderColor = (
    <NavOptions
      value={{
        color: settings.primaryColor,
      }}
      onClickOption={{
        color: (newValue) => {
          settings.onUpdateField('primaryColor', newValue);
          onSubmit({ primaryColor: newValue });
        },
      }}
      options={{
        colors: ['blue', 'cyan', 'orange', 'purple', 'red'],
      }}
    />
  );

  if (loading && !values) return <LoadingScreen />;

  return (
    <Card sx={{ p: { xs: 1, sm: 2 }, borderRadius: 1, backgroundColor: 'background.neutral' }}>
      <Form methods={methods}>
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
                onChange={() => {
                  setIsDarkMode(!isDarkMode);
                  onSubmit({ themeMode: !isDarkMode });
                }}
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
