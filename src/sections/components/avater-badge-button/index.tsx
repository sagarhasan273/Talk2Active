import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { Box, Stack, Avatar, useTheme, IconButton } from '@mui/material';

import { varAlpha } from 'src/theme/styles';

import { useSettingsContext } from 'src/components/settings';

import type { AvaterBadgeButtonProps } from './types';

export function AvaterBadgeButton({ src = 'noimage' }: AvaterBadgeButtonProps) {
  const theme = useTheme();
  const settings = useSettingsContext();

  return (
    <Stack>
      <Box sx={{ mx: 'auto', position: 'relative' }}>
        <Avatar
          sx={{
            mx: 'auto',
            width: { xs: 64, md: 128 },
            height: { xs: 64, md: 128 },
            border: `solid 2px ${theme.vars.palette.common.white}`,
          }}
          alt="The intended file is not exist!"
          src={src}
        />
        <IconButton
          sx={{
            position: 'absolute',
            bottom: -4,
            right: -4,
            padding: '2px',
            borderRadius: '5px',
            width: { xs: 22, md: 34 },
            height: { xs: 22, md: 34 },
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
      </Box>
    </Stack>
  );
}
