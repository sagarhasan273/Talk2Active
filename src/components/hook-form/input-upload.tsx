import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import { toast } from 'sonner';
import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import FormHelperText from '@mui/material/FormHelperText';

import { uploadImage } from 'src/utils/helper';

import { Upload, UploadBox, UploadAvatar } from '../upload';

import type { UploadProps } from '../upload';

// ----------------------------------------------------------------------

type Props = UploadProps & {
  name: string;
  uploading?: UseBooleanReturn;
};

// ----------------------------------------------------------------------

export function RHFUploadAvatar({ name, ...other }: Props) {
  const { control, setValue } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const onDrop = (acceptedFiles: File[]) => {
          const value = acceptedFiles[0];

          setValue(name, value, { shouldValidate: true });
        };

        return (
          <div>
            <UploadAvatar value={field.value} error={!!error} onDrop={onDrop} {...other} />

            {!!error && (
              <FormHelperText error sx={{ px: 2, textAlign: 'center' }}>
                {error.message}
              </FormHelperText>
            )}
          </div>
        );
      }}
    />
  );
}

// ----------------------------------------------------------------------

export function RHFUploadBox({ name, multiple, helperText, loaderSx, uploading, ...other }: Props) {
  const { control, setValue } = useFormContext();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const uploadProps = {
          multiple,
          accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.heic', '.heif'] },
          error: !!error,
          helperText: error?.message ?? helperText,
        };

        const onDrop = async (acceptedFiles: File[]) => {
          uploading?.onTrue();
          setIsLoading(true);
          if (multiple) {
            const images = await Promise.all(acceptedFiles.map((file) => uploadImage(file)));
            setValue(
              name,
              images.map((img) => img?.imageUrl),
              { shouldValidate: true }
            );
          } else {
            const image = await uploadImage(acceptedFiles[0]);
            setValue(name, image?.imageUrl, { shouldValidate: true });
          }
          setIsLoading(false);
          uploading?.onFalse();
          toast.info('Save the changes.');
        };

        return (
          <UploadBox
            {...uploadProps}
            value={field.value}
            onDrop={onDrop}
            error={!!error}
            {...other}
            loading={isLoading}
            disabled={isLoading}
            loaderSx={loaderSx}
          />
        );
      }}
    />
  );
}

// ----------------------------------------------------------------------

export function RHFUpload({ name, multiple, helperText, ...other }: Props) {
  const { control, setValue } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const uploadProps = {
          multiple,
          accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.heic', '.heif'] },
          error: !!error,
          helperText: error?.message ?? helperText,
        };

        const onDrop = async (acceptedFiles: File[]) => {
          const value = multiple ? [...field.value, ...acceptedFiles] : acceptedFiles[0];

          setValue(name, value, { shouldValidate: true });
        };

        return <Upload {...uploadProps} value={field.value} onDrop={onDrop} {...other} />;
      }}
    />
  );
}
