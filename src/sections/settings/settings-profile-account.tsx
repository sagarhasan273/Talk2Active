import type { UserAccountUpdateType } from 'src/types/user';

import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Box,
  Card,
  Stack,
  Button,
  styled,
  Typography,
  IconButton,
  InputAdornment,
} from '@mui/material';

import { useUserContext } from 'src/routes/components';

import { useUpdateUserAccountMutation, useUpdateUserMutation } from 'src/services/user-api';
import { UserAccountUpdateSchema } from 'src/schemas/user';

import { Form, Field } from 'src/components/hook-form';
import { LoadingScreen } from 'src/components/loading-screen';
import { toastErrorResponse, toastSuccessResponse } from 'src/utils/response';

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: theme.palette.common.white,
  '&:hover': {
    background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
    transform: 'scale(1.05)',
  },
}));

const getFormData = (user: Partial<UserAccountUpdateType> | null) => ({
  id: user?.id || '',
  userId: user?.userId || '',
  username: user?.username || '',
  password: '',
  newPassword: '',
  confirmNewPassword: '',
});

function SettingsProfileAccount() {
  const { user, setUser, loading } = useUserContext();

  const [showPassword, setShowPassword] = useState(false);

  const [updateUser] = useUpdateUserAccountMutation();

  const methods = useForm<UserAccountUpdateType>({
    resolver: zodResolver(UserAccountUpdateSchema),
    defaultValues: getFormData(user),
  });

  const {
    watch,
    reset,

    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (!user?.id) {
        toast.error('User ID is required for updating account');
        return;
      }

      const formData = {
        id: user.id,
        userId: data.userId,
        username: data.username,
        password: data.password,
        newPassword: data.newPassword,
      };

      const response = await updateUser(formData);
      if (response?.data?.status) {
        setUser({ ...user, ...formData });
        toastSuccessResponse(response || 'Account updated successfully');
      } else {
        toastErrorResponse(response);
      }

      const updatedUser = getFormData(data);
      reset(updatedUser);
    } catch (err) {
      console.log(err);
      toast.error(err?.data?.message || 'Failed to update account');
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
            Account Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your account security and preferences
          </Typography>
        </Box>

        <Stack spacing={3}>
          <Field.Text label="Username" name="username" variant="outlined" size="small" />

          <Field.Text
            label="Current Password"
            name="password"
            placeholder="Enter current password"
            variant="outlined"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </IconButton>
                </InputAdornment>
              ),
              type: showPassword ? 'text' : 'password',
            }}
            size="small"
          />

          <Field.Text
            label="New Password"
            name="newPassword"
            placeholder="Enter new password"
            variant="outlined"
            size="small"
            type="password"
          />

          <Field.Text
            label="Confirm New Password"
            name="confirmNewPassword"
            placeholder="Confirm new password"
            variant="outlined"
            size="small"
            type="password"
          />

          <GradientButton type="submit" sx={{ borderRadius: 3 }} disabled={isSubmitting}>
            Update Password
          </GradientButton>
        </Stack>
      </Form>
    </Card>
  );
}

export default SettingsProfileAccount;
