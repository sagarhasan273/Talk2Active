import type { IUserProfileCover } from 'src/types/user';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import ListItemText from '@mui/material/ListItemText';

import { varAlpha, bgGradient } from 'src/theme/styles';

import { LabelValue, AvatarBadgeButton } from '../components';

// ----------------------------------------------------------------------

export function ProfileCover({
  name,
  avatarUrl,
  userId,
  coverUrl,
  friends,
  followers,
  following,
}: IUserProfileCover) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        ...bgGradient({
          color: `0deg, ${varAlpha(theme.vars.palette.primary.darkerChannel, 0.8)}, ${varAlpha(theme.vars.palette.primary.darkerChannel, 0.8)}`,
          imgUrl: coverUrl,
        }),
        height: 'calc(100% - 48px)',
        color: 'common.white',
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        sx={{
          left: { md: 24 },
          bottom: { md: 24 },
          zIndex: { md: 10 },
          pt: { xs: 6, md: 0 },
          position: { md: 'absolute' },
          width: { sm: 'auto', md: 'calc(100% - 40px)' },
        }}
      >
        <AvatarBadgeButton src={avatarUrl} />

        <ListItemText
          sx={{ mt: 3, ml: { md: 3 }, textAlign: { xs: 'center', md: 'unset' } }}
          primary={name}
          secondary={`Id: ${userId}`}
          primaryTypographyProps={{ typography: 'h4' }}
          secondaryTypographyProps={{
            color: 'inherit',
            component: 'span',
            typography: 'caption',
            sx: { opacity: 0.48 },
          }}
        />

        <Stack
          direction="row"
          sx={{
            gap: '5px',
            mt: 1,
            display: 'flex-end',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <LabelValue label="Followers" value={followers} />
          <LabelValue label="Friends" value={friends} />
          <LabelValue label="Followings" value={following} />
        </Stack>
      </Stack>
    </Box>
  );
}
