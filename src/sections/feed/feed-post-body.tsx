import { z as zod } from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import React, { useMemo, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import { Box, Card, Stack, Button, InputBase } from '@mui/material';

import { varAlpha } from 'src/theme/styles';
import { _coursesFeatured } from 'src/_mock';
import { UserContent } from 'src/layouts/user';

import { Iconify } from 'src/components/iconify';
import { Form, Field, schemaHelper } from 'src/components/hook-form';

import FeedPostList from './feed-post-list';

export type NewProductSchemaType = zod.infer<typeof NewProductSchema>;

export const NewProductSchema = zod.object({
  caption: schemaHelper.editor({ message: { required_error: 'Description is required!' } }),
  images: schemaHelper.files({ message: { required_error: 'Images is required!' } }),
});

export default function FeedPostBody() {
  const defaultValues = useMemo(
    () => ({
      caption: '',
      images: [],
    }),
    []
  );

  const methods = useForm<NewProductSchemaType>({
    resolver: zodResolver(NewProductSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
      toast.success('Create success!');
      console.info('DATA', data);
    } catch (error) {
      console.error(error);
    }
  });

  const values = watch();
  console.log('values', values, 'isSubmitting', isSubmitting);

  const handleRemoveFile = useCallback(
    (inputFile: File | string) => {
      const filtered = values.images && values.images?.filter((file) => file !== inputFile);
      setValue('images', filtered);
    },
    [setValue, values.images]
  );

  const handleRemoveAllFiles = useCallback(() => {
    setValue('images', [], { shouldValidate: true });
  }, [setValue]);

  const imagesUpload = (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.secondary' }}>
      <Field.Upload
        multiple
        thumbnail
        name="images"
        maxSize={3145728}
        onRemove={handleRemoveFile}
        onRemoveAll={handleRemoveAllFiles}
        onUpload={() => console.info('ON UPLOAD')}
        placeholder={
          <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 1 }}>
            <Iconify icon="solar:gallery-wide-bold" width={24} sx={{ color: 'success.main' }} />
            Images
          </Stack>
        }
        sxRoot={{ p: 0, px: 0.5, width: 'fit-content' }}
      />
    </Stack>
  );

  const renderPostInput = (
    <Form methods={methods} onSubmit={onSubmit}>
      <Card sx={{ p: 3 }}>
        <InputBase
          multiline
          fullWidth
          rows={3}
          placeholder="Share what you are thinking here..."
          sx={{
            p: 1,
            mb: 2,
            borderRadius: 1,
            border: (theme) => `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.2)}`,
          }}
        />

        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          {imagesUpload}
          <Button variant="contained">Post</Button>
        </Stack>
      </Card>
    </Form>
  );
  return (
    <UserContent
      maxWidth="md"
      sx={{
        p: { xs: 1, sm: 1, md: 3 },
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { sm: '1fr', md: '30% 1fr' },
          columnGap: { xs: 1, sm: 1, md: 2 },
          rowGap: { xs: 1, sm: 1, md: 2 },
        }}
      >
        <Stack>
          <Card sx={{ p: 3 }} />
        </Stack>

        <Stack gap={2}>
          {renderPostInput}
          <FeedPostList list={_coursesFeatured} />
        </Stack>
      </Box>
    </UserContent>
  );
}
