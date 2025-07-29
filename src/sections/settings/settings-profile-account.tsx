import type { UserAccountUpdateType } from 'src/types/user';

import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, LogOut, Wifi } from 'lucide-react';
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
  MenuItem,
  TextField,
} from '@mui/material';

import { useUserContext } from 'src/routes/components';

import { useUpdateUserAccountMutation, useUpdateUserMutation } from 'src/services/slices/user-api';
import { UserAccountUpdateSchema } from 'src/schemas/user';

import { Form, Field } from 'src/components/hook-form';
import { LoadingScreen } from 'src/components/loading-screen';
import { toastErrorResponse, toastSuccessResponse } from 'src/utils/response';

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: theme.palette.common.white,
  '&:hover': {
    background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
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
  const [sessionTimeout, setSessionTimeout] = useState('10');

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

        <Card
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            px: { xs: 1, sm: 2 },
            py: 3,
            mb: { xs: 2, sm: 3 },
            borderRadius: { xs: 1, sm: 2, md: 3 },
          }}
        >
          <Field.Text label="Username" name="username" variant="outlined" size="small" disabled />

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

          <GradientButton type="submit" disabled={isSubmitting}>
            Update Password
          </GradientButton>
        </Card>

        {/* Session Management */}
        <Card sx={{
          borderRadius: { xs: 1, sm: 2, md: 3 },
          p: { xs: 1, sm: 2 },
          mb: 4
        }}>
          <Typography variant="h6" sx={{
            fontWeight: 'semibold',
            color: 'text.primary',
            mb: 2
          }}>
            Session Management
          </Typography>

          <Stack spacing={3}>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{
                mb: 1
              }}>
                Session Timeout
              </Typography>
              <TextField
                select
                fullWidth
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                variant="outlined"
                size='small'
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                    },
                    '&:hover fieldset': {
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    }
                  }
                }}
              >
                <MenuItem value="10">10 days</MenuItem>
                <MenuItem value="15">15 days</MenuItem>
                <MenuItem value="30">30 months</MenuItem>
                <MenuItem value="never">Never</MenuItem>
              </TextField>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Set how long your session remains active before automatic logout when you are away.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<LogOut />}
                sx={{
                  py: 1.5,
                  bgcolor: 'error.light',
                  color: 'error.dark',
                  textTransform: 'none',
                  fontWeight: 'semibold',
                  '&:hover': {
                    bgcolor: 'error.main',
                    color: 'white',
                  },
                }}
                disabled
              >
                Sign Out All Devices
              </Button>

              <Button
                fullWidth
                variant="contained"
                sx={{
                  py: 1.5,
                }}
                disabled
              >
                Save Session
              </Button>
            </Box>
          </Stack>
        </Card>
      </Form>
    </Card>
  );
}

export default SettingsProfileAccount;
