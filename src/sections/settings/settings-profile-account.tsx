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

import { useUpdateUserMutation } from 'src/services/user-api';
import { UserAccountUpdateSchema } from 'src/validations/user';

import { Form, Field } from 'src/components/hook-form';
import { LoadingScreen } from 'src/components/loading-screen';

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: theme.palette.common.white,
  '&:hover': {
    background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
    transform: 'scale(1.05)',
  },
}));

const getFormData = (user: Partial<UserAccountUpdateType> | null) => ({
  _id: user?._id || '',
  userId: user?.userId || '',
  username: user?.username || '',
  password: '',
  newPassword: '',
  confirmNewPassword: '',
});

function SettingsProfileAccount() {
  const { user, loading } = useUserContext();

  const [showPassword, setShowPassword] = useState(false);

  const [updateUser] = useUpdateUserMutation();

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
  console.log('ERRORS', errors);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const formData = {
        _id: user?._id,
        userId: data.userId,
        username: data.username,
        password: data.password,
        newPassword: data.newPassword,
      };
      const response = await updateUser(formData);
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
