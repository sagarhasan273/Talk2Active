import type { UserType } from 'src/types/user';

import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Link, MapPin, FileText } from 'lucide-react';

import {
  Box,
  Grid,
  Card,
  Stack,
  Button,
  styled,
  useTheme,
  keyframes,
  Typography,
} from '@mui/material';

import { useUserContext } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { UserSchema } from 'src/schemas/user';
import { useUpdateUserMutation } from 'src/services/user-api';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { LoadingScreen } from 'src/components/loading-screen';

// ------------------------------------------

// Define animations
const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const bounceAnimation = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: theme.palette.common.white,

  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,

    boxShadow: `0 5px 8px 3px ${theme.palette.primary.lighter}`,
  },
  '&.activating': {
    animation: `${pulseAnimation} 0.5s ease-in-out`,
  },
  '&.active': {
    background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  },
  '&.inactive': {
    background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  },
}));

const AnimatedIcon = styled(Box)(() => ({
  display: 'inline-flex',
  animation: `${bounceAnimation} 0.5s ease-in-out`,
  '&:hover': {
    animation: `${pulseAnimation} 0.5s ease-in-out`,
  },
  '&.activating': {
    animation: `${pulseAnimation} 0.5s ease-in-out`,
  },
}));

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

function SettingsProfileInformation() {
  const { user, loading } = useUserContext();

  const theme = useTheme();

  const coverPhotoBoolean = useBoolean(false);
  const profilePhotoBoolean = useBoolean(false);

  const [isAnimating, setIsAnimating] = useState(false);

  const [updateUser] = useUpdateUserMutation();

  const methods = useForm<UserType>({
    resolver: zodResolver(UserSchema),
    defaultValues: getFormData(user),
  });

  const {
    watch,
    reset,
    setValue,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = methods;

  const values = watch();

  const handleAccountActiveClick = async () => {
    setIsAnimating(true);
    try {
      if (!user?.id) {
        toast.error('User ID is required for updating profile');
        return;
      }
      const response = await updateUser({
        id: user.id,
        accountActive: !user?.accountActive,
      });

      if (response?.data?.status) {
        toast.success(`Profile ${!user?.accountActive ? 'Activated' : 'Deactivated'}`);
      }
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (!user?.id) {
        toast.error('User ID is required for updating profile');
        return;
      }
      const response = await updateUser({ ...data, id: user.id });
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
      <Box mb={2}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Profile Information
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Update your profile details and images
        </Typography>
      </Box>
      <Form methods={methods} onSubmit={onSubmit}>
        {/* Cover Image */}
        <Box mb={2}>
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
              src={values?.coverPhoto}
              alt="Cover"
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <Box
              className="cover-overlay"
              sx={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                opacity: coverPhotoBoolean.value ? 1 : 0,
                transition: 'opacity 300ms',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Field.UploadBox
                name="coverPhoto"
                maxSize={3145728}
                onDelete={() => setValue('coverPhoto', '', { shouldValidate: true })}
                uploading={coverPhotoBoolean}
              />
            </Box>
          </Box>
        </Box>

        {/* Avatar */}
        <Box mb={2}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Profile Picture
          </Typography>
          <Stack sx={{ display: 'grid', gridTemplateColumns: '96px 1fr', gap: 2 }}>
            <Box sx={{ position: 'relative', '&:hover .avatar-overlay': { opacity: 1 } }}>
              <Box
                component="img"
                src={values?.profilePhoto}
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
                  opacity: profilePhotoBoolean.value ? 1 : 0,
                  transition: 'opacity 300ms',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Field.UploadBox
                  name="profilePhoto"
                  maxSize={3145728}
                  onDelete={() => setValue('profilePhoto', '', { shouldValidate: true })}
                  sx={{ bgcolor: 'none' }}
                  loaderSx={{
                    sx: {
                      width: 14,
                      height: 14,
                    },
                    textVariant: 'caption',
                  }}
                  uploading={profilePhotoBoolean}
                />
              </Box>
            </Box>
            <Box>
              <GradientButton
                onClick={handleAccountActiveClick}
                className={`${isAnimating ? 'activating' : ''} ${user?.accountActive ? 'active' : 'inactive'}`}
                startIcon={
                  <AnimatedIcon className={`${isAnimating ? 'activating' : ''}`}>
                    {user?.accountActive ? (
                      <Iconify icon="entypo:emoji-happy" width={20} height={20} />
                    ) : (
                      <Iconify icon="fa-regular:sad-tear" width={20} height={20} />
                    )}
                  </AnimatedIcon>
                }
                sx={{ borderRadius: 6 }}
                disabled={isAnimating}
              >
                {user?.accountActive ? 'Activated' : 'Deactivated'}
              </GradientButton>
              <Typography variant="caption" color="text.secondary" mt={1} display="block">
                This account will be deactivated automatically after you leave the app.
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Form Fields */}
        <Stack spacing={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Field.Text
                key="name-field"
                name="name"
                label={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <User size={16} />
                    <span>Display Name</span>
                  </Stack>
                }
                value={values?.name}
                placeholder="Your display name"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Field.Text
                name="username"
                label={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Mail size={16} />
                    <span>Username</span>
                  </Stack>
                }
                value={values?.username}
                placeholder="@username"
                variant="outlined"
                size="small"
              />
            </Grid>
          </Grid>

          <Field.Text
            name="email"
            label={
              <Stack direction="row" alignItems="center" spacing={1}>
                <FileText size={16} />
                <span>Email</span>
              </Stack>
            }
            value={values?.email}
            placeholder="Write Email..."
            variant="outlined"
            inputProps={{ maxLength: 60 }}
            size="small"
          />
          <Field.Text
            name="bio"
            multiline
            rows={4}
            label={
              <Stack direction="row" alignItems="center" spacing={1}>
                <FileText size={16} />
                <span>Bio</span>
              </Stack>
            }
            placeholder="Tell us about yourself..."
            variant="outlined"
            inputProps={{ maxLength: 160 }}
            InputProps={{
              sx: {
                '& .MuiInputBase-input:focus': {
                  borderRadius: 0,
                },
              },
            }}
            size="small"
          />
          <Typography variant="caption" color="text.secondary" textAlign="right">
            {values?.bio?.length}/160
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Field.Text
                name="location"
                label={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <MapPin size={16} />
                    <span>Location</span>
                  </Stack>
                }
                value={values?.location}
                placeholder="Your location"
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Field.Text
                name="website"
                label={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Link size={16} />
                    <span>Website</span>
                  </Stack>
                }
                value={values?.website}
                placeholder="yourwebsite.com"
                variant="outlined"
                size="small"
              />
            </Grid>
          </Grid>
        </Stack>

        {/* Save Button */}
        <Box mt={4} mb={4} pt={3} borderTop={`1px solid ${theme.palette.divider}`}>
          <Button
            type="submit"
            startIcon={<Iconify icon={isSubmitting ? 'eos-icons:loading' : 'mi:save'} />}
            sx={{ borderRadius: 3, boxShadow: 3, px: 1.5 }}
            disabled={isSubmitting || !isDirty}
          >
            Save Changes
          </Button>
        </Box>
      </Form>
    </Card>
  );
}

export default SettingsProfileInformation;
