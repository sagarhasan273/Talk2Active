import type { UserType } from 'src/validations/user';

import { toast } from 'sonner';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Link, MapPin, Upload, FileText } from 'lucide-react';

import { Box, Grid, Card, Stack, Button, styled, useTheme, Typography } from '@mui/material';

import { useUserContext } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { UserSchema } from 'src/validations/user';
import { useUpdateUserMutation } from 'src/services/user-api';

import { Iconify } from 'src/components/iconify';
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

const getFormData = (user: UserType | null) => ({
  _id: user?._id || '',
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
    formState: { isSubmitting },
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
          <Stack direction="row" alignItems="center" spacing={3}>
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
                onClick={() => {}}
                startIcon={<Upload size={16} />}
                sx={{ borderRadius: 6 }}
              >
                {/* {isUploading ? (
                  <>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        border: '2px solid rgba(255, 255, 255, 0.2)',
                        borderTopColor: 'common.white',
                        borderRadius: '50%',
                        animation: `${spin} 1s linear infinite`,
                        mr: 1,
                      }}
                    />
                    Uploading...
                  </>
                ) : (
                  'Upload New'
                )} */}
                Upload New
              </GradientButton>
              <Typography variant="caption" color="text.secondary" mt={1} display="block">
                JPG, PNG or GIF. Max size 5MB.
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
            disabled={isSubmitting}
          >
            Save Changes
          </Button>
        </Box>
      </Form>
    </Card>
  );
}

export default SettingsProfileInformation;
