import Box from '@mui/material/Box';
import { Stack, useTheme, GlobalStyles } from '@mui/material';

import { CONFIG } from 'src/config-global';
import { UserContent } from 'src/layouts/user';
import { backgroundImages } from 'src/assets/background';

import { useSettingsContext } from 'src/components/settings';

import { LabelValue } from '../components';
import { AvaterBadgeButton } from '../components/avater-badge-button';

// ----------------------------------------------------------------------

type Props = {
  profileImage?: string;
};

export function UserHeader({
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
            '--user-info-lineheight': '12px',

            '--user-label-value-display': 'flex',

            '--user-profile-image-button-size': '15px',
            '--user-profile-image-button-bottom': '5px',
            '--user-profile-image-button-right': '5px',

            [theme.breakpoints.down('sm')]: {
              '--user-label-value-display': 'none',
              '--user-info-gap': '5px',
            },

            [theme.breakpoints.up('sm')]: {
              '--user-profile-header-container': '250px',

              '--user-image-size': '120px',

              '--user-info-gap': '15px',
              '--user-info-left': '20px',
              '--user-info-bottom': '12px',
              '--user-info-fontsize': '12px',
              '--user-info-lineheight': '14px',

              '--user-profile-image-button-size': '24px',
              '--user-profile-image-button-bottom': '8px',
              '--user-profile-image-button-right': '8px',
            },

            [theme.breakpoints.up('md')]: {
              '--user-profile-header-container': '320px',

              '--user-image-size': '150px',

              '--user-info-gap': '15px',
              '--user-info-left': '25px',
              '--user-info-bottom': '15px',
              '--user-info-fontsize': '14px',
              '--user-info-lineheight': '16px',
            },
          },
        }}
      />
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
          justifyContent="space-between"
          sx={{
            position: 'absolute',
            flex: 1,
            bottom: 'var(--user-info-bottom)',
            left: 'var(--user-info-left)',
            right: 'var(--user-info-left)',
            gap: 'var(--user-info-gap)',
          }}
        >
          <Stack
            direction="row"
            alignItems="flex-end"
            sx={{
              gap: 'var(--user-info-gap)',
            }}
          >
            <AvaterBadgeButton src={profileImage} />
            <Stack
              direction="column"
              sx={{
                [theme.breakpoints.down('sm')]: {
                  gap: 'var(--user-info-gap)',
                },
              }}
            >
              <LabelValue label="Sagar Hasan" userId="YdsdYh992" />
              <Stack
                direction="row"
                sx={{
                  gap: 'var(--user-info-gap)',
                }}
              >
                <LabelValue
                  label="Followers"
                  value={80}
                  sx={{
                    [theme.breakpoints.up('sm')]: {
                      display: 'none',
                    },
                  }}
                />
                <LabelValue
                  label="Friends"
                  value={15}
                  sx={{
                    [theme.breakpoints.up('sm')]: {
                      display: 'none',
                    },
                  }}
                />
                <LabelValue
                  label="Followings"
                  value={5}
                  sx={{
                    [theme.breakpoints.up('sm')]: {
                      display: 'none',
                    },
                  }}
                />
              </Stack>
            </Stack>
          </Stack>
          <Stack direction="row" sx={{ gap: 'var(--user-info-gap)' }}>
            <LabelValue
              label="Followers"
              value={80}
              sx={{ display: 'var(--user-label-value-display)' }}
            />
            <LabelValue
              label="Friends"
              value={15}
              sx={{ display: 'var(--user-label-value-display)' }}
            />
            <LabelValue
              label="Followings"
              value={5}
              sx={{ display: 'var(--user-label-value-display)' }}
            />
          </Stack>
        </Stack>
      </Box>
    </UserContent>
  );
}
