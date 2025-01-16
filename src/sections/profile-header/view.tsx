import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Stack, Avatar, useTheme, GlobalStyles } from '@mui/material';

import { CONFIG } from 'src/config-global';
import { varAlpha } from 'src/theme/styles';
import { UserContent } from 'src/layouts/user';
import { backgroundImages } from 'src/assets/background';

import { useSettingsContext } from 'src/components/settings';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  profileImage?: string;
};

export function UserHeader({
  title = 'Blank',
  profileImage = `${CONFIG.assetsDir}/assets/images/profile/profileImage.jpg`,
}: Props) {
  const theme = useTheme();
  const settings = useSettingsContext();

  return (
    <UserContent maxWidth="lg">
      <GlobalStyles
        styles={{
          body: {
            '--user-profile-header-container': '180px',

            '--user-image-size': '100px',

            '--user-info-gap': '10px',
            '--user-info-left': '10px',
            '--user-info-bottom': '10px',
            '--user-info-fontsize': '10px',

            [theme.breakpoints.up('sm')]: {
              '--user-profile-header-container': '250px',

              '--user-image-size': '120px',

              '--user-info-gap': '15px',
              '--user-info-left': '20px',
              '--user-info-bottom': '12px',
              '--user-info-fontsize': '12px',
            },

            [theme.breakpoints.up('md')]: {
              '--user-profile-header-container': '320px',

              '--user-image-size': '150px',

              '--user-info-gap': '15px',
              '--user-info-left': '25px',
              '--user-info-bottom': '15px',
              '--user-info-fontsize': '14px',
            },
          },
        }}
      />
      <Typography variant="h4"> {title} </Typography>
      <Box
        component="main"
        sx={{
          mt: 4,
          width: 1,
          height: 'var(--user-profile-header-container)',
          borderRadius: 2,
          backgroundImage:
            settings?.colorScheme === 'light'
              ? backgroundImages?.auth.loginLightImageUrl
              : backgroundImages?.auth.loginDarkImageUrl,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        <Stack
          direction="row"
          alignItems="flex-end"
          sx={{
            position: 'absolute',
            flex: 1,
            bottom: 'var(--user-info-bottom)',
            left: 'var(--user-info-left)',
            right: 'var(--user-info-left)',
            gap: 'var(--user-info-gap)',
          }}
        >
          <Avatar
            sx={{
              width: 'var(--user-image-size)',
              height: 'var(--user-image-size)',
            }}
            alt="The intended file is not exist!"
            src={profileImage}
          />
          <Stack
            sx={{
              padding: '2px 10px',
              borderRadius: '10px',
              bgcolor: varAlpha(
                theme.vars.palette.grey[
                  settings?.colorScheme === 'light' ? '100Channel' : '900Channel'
                ],
                0.5
              ),
              border: `dashed 1px ${theme.vars.palette.divider}`,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontSize: 'var(--user-info-fontsize)' }}>
              Sagar Hasan Sagar Hasan Sagar Hasan Sagar Hasan
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontSize: 'var(--user-info-fontsize)', opacity: 0.5 }}
            >
              Id: YdsdYh992
            </Typography>
          </Stack>
          <Stack
            sx={{
              padding: '2px 10px',
              borderRadius: '10px',
              bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.5),
              border: `dashed 1px ${theme.vars.palette.divider}`,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontSize: 'var(--user-info-fontsize)' }}>
              Sagar
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontSize: 'var(--user-info-fontsize)', opacity: 0.5 }}
            >
              Id: YdsdYh992
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </UserContent>
  );
}
