import { Stack, useTheme, Typography } from '@mui/material';

import { varAlpha } from 'src/theme/styles';

import { useSettingsContext } from 'src/components/settings';

import type { LabelValueProps } from './types';

export function LabelValue({
  label = 'Talk2Active',
  value = 0,
  userId = undefined,
  sx,
}: LabelValueProps) {
  const theme = useTheme();
  const settings = useSettingsContext();

  return (
    <Stack
      direction={userId ? 'column' : 'column-reverse'}
      sx={{
        padding: '4px 10px',
        borderRadius: '10px',
        bgcolor: varAlpha(
          theme.vars.palette.grey[settings?.colorScheme === 'light' ? '100Channel' : '900Channel'],
          0.8
        ),
        overflow: 'hidden',
        [theme.breakpoints.down('sm')]: {
          borderRadius: '5px',
        },
        ...sx,
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          fontSize: 'var(--user-info-fontsize)',
          lineHeight: 'var(--user-info-lineheight)',
          opacity: userId ? 1 : 0.8,
          cursor: 'default',
          ...(!userId
            ? {
                [theme.breakpoints.down('sm')]: {
                  fontSize: '8px',
                  lineHeight: '10px',
                  opacity: 0.5,
                },
              }
            : { textAlign: 'left' }),
        }}
      >
        {label}
      </Typography>

      {userId && (
        <Typography
          variant="caption"
          sx={{
            fontSize: '10px',
            opacity: 0.5,
          }}
        >
          {`Id: ${userId}`}
        </Typography>
      )}
      {!userId && (
        <Typography
          variant="caption"
          sx={{
            fontSize: 'var(--user-info-fontsize)',
            lineHeight: 'var(--user-info-lineheight)',
            opacity: 0.8,
            textAlign: 'center',
            cursor: 'default',
            ...(!userId
              ? {
                  [theme.breakpoints.down('sm')]: {
                    fontSize: '8px',
                    lineHeight: '10px',
                    opacity: 0.5,
                  },
                }
              : {}),
          }}
        >
          {value.toString()}
        </Typography>
      )}
    </Stack>
  );
}
