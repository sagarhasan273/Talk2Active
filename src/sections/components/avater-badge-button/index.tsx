import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { Stack, Avatar, useTheme, IconButton } from '@mui/material';

import { varAlpha } from 'src/theme/styles';

import { useSettingsContext } from 'src/components/settings';

import type { AvaterBadgeButtonProps } from './types';

export function AvaterBadgeButton({ src = 'noimage' }: AvaterBadgeButtonProps) {
  const theme = useTheme();
  const settings = useSettingsContext();

  return (
    <Stack sx={{ position: 'relative' }}>
      <Avatar
        sx={{
          width: 'var(--user-image-size)',
          height: 'var(--user-image-size)',
        }}
        alt="The intended file is not exist!"
        src={src}
      />
      <IconButton
        sx={{
          position: 'absolute',
          bottom: 'var(--user-profile-image-button-bottom)',
          right: 'var(--user-profile-image-button-right)',
          padding: '2px',
          borderRadius: '5px',
          bgcolor: varAlpha(
            theme.vars.palette.grey[
              settings?.colorScheme === 'light' ? '100Channel' : '900Channel'
            ],
            0.8
          ),
          '&:hover': {
            background: varAlpha(
              theme.vars.palette.grey[
                settings?.colorScheme === 'light' ? '100Channel' : '900Channel'
              ],
              0.8
            ),
          },
        }}
        disableRipple
      >
        <PhotoCameraIcon
          sx={{
            height: 'var(--user-profile-image-button-size)',
            width: 'var(--user-profile-image-button-size)',
          }}
        />
      </IconButton>
    </Stack>
  );
}
