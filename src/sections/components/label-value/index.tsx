import { Stack, useTheme, Typography } from '@mui/material';

import { fNumber } from 'src/utils/format-number';

import { varAlpha } from 'src/theme/styles';

import type { LabelValueProps } from './types';

export function LabelValue({
  label = 'Talk2Active',
  value = 0,
  sx,
}: LabelValueProps) {
  const theme = useTheme();

  return (
    <Stack
      direction="column-reverse"
      sx={{
        padding: '6px 10px',
        borderRadius: '10px',
        bgcolor: varAlpha(
          theme.vars.palette.grey[theme.palette.mode === 'light' ? '600Channel' : '900Channel'],
          0.8
        ),
        overflow: 'hidden',
        [theme.breakpoints.down('md')]: {
          borderRadius: '5px',
          padding: '4px 10px',
        },
        ...sx,
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          opacity: 0.8,
          cursor: 'default',
          [theme.breakpoints.down('md')]: {
            fontSize: '10px',
            lineHeight: '12px',
          },

        }}
      >
        {label}
      </Typography>

      <Typography
        variant="caption"
        sx={{
          textAlign: 'center',
          cursor: 'default',

          [theme.breakpoints.down('md')]: {
            fontSize: '10px',
            lineHeight: '12px',
          },

        }}
      >
        {fNumber(value)}
      </Typography>

    </Stack>
  );
}
