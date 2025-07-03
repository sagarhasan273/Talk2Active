import { useDropzone } from 'react-dropzone';

import Box from '@mui/material/Box';
import { Stack, keyframes, Typography } from '@mui/material';

import { varAlpha } from 'src/theme/styles';

import { Iconify } from '../iconify';
import { uploadClasses } from './classes';

import type { UploadProps } from './types';

// ----------------------------------------------------------------------

// Define the spin animation
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export function UploadBox({
  placeholder,
  error,
  disabled,
  className,
  loading,
  loaderSx,
  sx,
  ...other
}: UploadProps) {
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    disabled,
    ...other,
  });

  const hasError = isDragReject || error;

  return (
    <Box
      {...getRootProps()}
      className={uploadClasses.uploadBox.concat(className ? ` ${className}` : '')}
      sx={{
        width: 64,
        height: 64,
        flexShrink: 0,
        display: 'flex',
        borderRadius: 1,
        cursor: 'pointer',
        alignItems: 'center',
        color: 'primary.light',
        justifyContent: 'center',

        bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.48),
        border: (theme) => `dashed 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
        ...(isDragActive && { opacity: 0.72 }),
        ...(disabled && { pointerEvents: 'none' }),
        ...(hasError && {
          color: 'error.main',
          borderColor: 'error.main',
          bgcolor: (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.08),
        }),
        '&:hover': { opacity: 0.72, color: 'common.white' },
        ...(loading && { bgcolor: 'none' }),
        ...sx,
      }}
    >
      <input {...getInputProps()} />

      {!loading &&
        (placeholder || (
          <Iconify
            icon="bi:camera-fill"
            sx={{
              '&:hover': {
                color: 'common.white',
              },
            }}
            width={28}
          />
        ))}

      {loading ? (
        <Stack direction="row">
          <Box
            sx={{
              width: 16,
              height: 16,
              border: '2px solid rgba(255, 255, 255, 0.24)',
              borderTopColor: 'common.white',
              borderRadius: '50%',
              animation: `${spin} 1s linear infinite`,
              mr: 1,
              ...loaderSx?.sx,
            }}
          />
          <Typography variant={loaderSx?.textVariant} sx={{ color: 'common.white' }}>
            Uploading...
          </Typography>
        </Stack>
      ) : null}
    </Box>
  );
}
