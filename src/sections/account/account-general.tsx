import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { fData } from 'src/utils/format-number';

import { toast } from 'src/components/snackbar';
import { Form, Field, schemaHelper } from 'src/components/hook-form';

import { useMockedUser } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export type UpdateUserSchemaType = zod.infer<typeof UpdateUserSchema>;

export const UpdateUserSchema = zod.object({
  displayName: zod.string().min(1, { message: 'Name is required!' }),
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  photoURL: schemaHelper.file({ message: { required_error: 'Avatar is required!' } }),
  country: schemaHelper.objectOrNull({ message: { required_error: 'Country is required!' } }),
  nativeLanguage: zod.string().min(1, { message: 'Address is required!' }),
  secondaryLanguage: zod.string().min(1, { message: 'Address is required!' }),
  state: zod.string().min(1, { message: 'State is required!' }),
  about: zod.string().min(1, { message: 'About is required!' }),
  // Not required
  isPublic: zod.boolean(),
});

export function AccountGeneral() {
  const { user } = useMockedUser();

  const defaultValues = {
    displayName: user?.displayName || '',
    email: user?.email || '',
    photoURL: user?.photoURL || null,
    country: user?.country || '',
    address: user?.address || '',
    state: user?.state || '',
    nativeLanguage: user?.nativeLanguage || '',
    secondaryLanguage: user?.secondaryLanguage || '',
    about: user?.about || '',
    isPublic: user?.isPublic || false,
  };

  const methods = useForm<UpdateUserSchemaType>({
    mode: 'all',
    resolver: zodResolver(UpdateUserSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success('Update success!');
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Card
            sx={{
              pt: 10,
              pb: 5,
              px: 3,
              textAlign: 'center',
            }}
          >
            <Field.UploadAvatar
              name="photoURL"
              maxSize={3145728}
              helperText={
                <Typography
                  variant="caption"
                  sx={{
                    mt: 3,
                    mx: 'auto',
                    display: 'block',
                    textAlign: 'center',
                    color: 'text.disabled',
                  }}
                >
                  Allowed *.jpeg, *.jpg, *.png, *.gif
                  <br /> max size of {fData(3145728)}
                </Typography>
              }
            />

            <Field.Switch
              name="isPublic"
              labelPlacement="start"
              label="Public profile"
              sx={{ mt: 5 }}
            />

            <Button variant="soft" color="error" sx={{ mt: 3 }}>
              Delete user
            </Button>
          </Card>
        </Grid>

        <Grid xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
            >
              <Field.Text name="displayName" label="Name" />
              <Field.Text name="email" label="Email address" />
              <Field.CountrySelect name="country" label="Country" placeholder="Choose a country" />
              <Field.Text name="state" label="State/region" />
              <Field.Text name="nativeLanguage" label="Native Language" />
              <Field.Text name="secondaryLanguage" label="Secondary Language" />
            </Box>

            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
              <Field.Text name="about" multiline rows={4} label="About" />

              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                Save changes
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}
