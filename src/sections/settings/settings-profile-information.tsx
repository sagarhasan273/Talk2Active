import type { UserProfile } from 'src/types/post';

import React from 'react';
import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Link, MapPin, Upload, FileText } from 'lucide-react';

import { Box, Grid, Stack, Button, styled, useTheme, Typography, CardContent } from '@mui/material';

import axiosInstance, { endpoints } from 'src/utils/axios';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: theme.palette.common.white,
  '&:hover': {
    background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
    transform: 'scale(1.05)',
  },
}));

export type FormSchemaType = zod.infer<typeof FormSchema>;

export const FormSchema = zod.object({
  name: zod
    .string()
    .min(1, { message: 'Full name is required!' })
    .min(6, { message: 'Mininum 6 characters!' })
    .max(32, { message: 'Maximum 32 characters!' }),
  username: zod
    .string()
    .min(1, { message: 'User name is required!' })
    .min(6, { message: 'Mininum 6 characters!' })
    .max(32, { message: 'Maximum 32 characters!' }),
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  bio: zod.string().min(0, { message: 'Add your bio!' }),
  location: zod.string().min(0, { message: 'Add your bio!' }),
  website: zod.string().min(0, { message: 'Add your location!' }),

  // phoneNumber: schemaHelper.phoneNumber({ isValidPhoneNumber }),
  // password: zod
  //   .string()
  //   .min(1, { message: 'Password is required!' })
  //   .min(6, { message: 'Password is too short!' }),
  // confirmPassword: zod.string().min(1, { message: 'Confirm password is required!' }),

  profilePhoto: zod.string().min(1, { message: 'There is no Profile Photo!' }),
  coverPhoto: zod.string().min(1, { message: 'There is no Cover Photo!' }),
});
// .refine((data) => data.password === data.confirmPassword, {
//   message: 'Passwords do not match!',
//   path: ['confirmPassword'],
// });

interface SettingsProfileInformationProps {
  profile: UserProfile;
}

function SettingsProfileInformation({ profile }: SettingsProfileInformationProps) {
  const theme = useTheme();

  const defaultValues = {
    name: profile.name,
    username: profile.username,
    email: 'sagarhasan273@gmail.com',
    bio: profile.bio,
    location: profile.location,
    website: profile.website,
    profilePhoto: profile.avatar,
    coverPhoto: profile.coverImage,
  };

  const methods = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues,
  });

  const {
    watch,
    reset,
    setValue,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const values = watch();
  console.log(errors);
  const onSubmit = handleSubmit(async (data) => {
    console.log(data);
    try {
      const response = await axiosInstance.post(endpoints.user.profile, data);
      reset();
      console.info('DATA', response);
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <CardContent sx={{ p: 4 }}>
      <Box mb={4}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Profile Information
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Update your profile details and images
        </Typography>
      </Box>
      <Form methods={methods} onSubmit={onSubmit}>
        {/* Cover Image */}
        <Box mb={4}>
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
              src={values.coverPhoto}
              alt="Cover"
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <Box
              className="cover-overlay"
              sx={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                opacity: 0,
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
              />
            </Box>
          </Box>
        </Box>

        {/* Avatar */}
        <Box mb={4}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Profile Picture
          </Typography>
          <Stack direction="row" alignItems="center" spacing={3}>
            <Box sx={{ position: 'relative', '&:hover .avatar-overlay': { opacity: 1 } }}>
              <Box
                component="img"
                src={values.profilePhoto}
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
                  opacity: 0,
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
                name="name"
                label={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <User size={16} />
                    <span>Display Name</span>
                  </Stack>
                }
                value={values.name}
                placeholder="Your display name"
                InputProps={{
                  sx: { borderRadius: 3 },
                }}
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
                value={values.username}
                placeholder="@username"
                variant="outlined"
                InputProps={{
                  sx: { borderRadius: 3 },
                }}
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
            value={values.email}
            placeholder="Write Email..."
            variant="outlined"
            inputProps={{ maxLength: 60 }}
            InputProps={{
              sx: { borderRadius: 3 },
            }}
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
            value={values.bio}
            placeholder="Tell us about yourself..."
            variant="outlined"
            inputProps={{ maxLength: 160 }}
            InputProps={{
              sx: { borderRadius: 3 },
            }}
          />
          <Typography variant="caption" color="text.secondary" textAlign="right">
            {values.bio.length}/160
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
                value={values.location}
                placeholder="Your location"
                variant="outlined"
                InputProps={{
                  sx: { borderRadius: 3 },
                }}
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
                value={values.website}
                placeholder="yourwebsite.com"
                variant="outlined"
                InputProps={{
                  sx: { borderRadius: 3 },
                }}
              />
            </Grid>
          </Grid>
        </Stack>

        {/* Save Button */}
        <Box mt={4} pt={3} borderTop={`1px solid ${theme.palette.divider}`}>
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
    </CardContent>
  );
}

export default SettingsProfileInformation;
