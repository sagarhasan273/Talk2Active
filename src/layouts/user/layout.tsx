// src/layouts/user/user-layout.tsx

import type { NavSectionProps } from 'src/components/nav-section';

import { useResponsive } from '@/hooks/use-responsive';

import { Box } from '@mui/material';
import { useTheme, type Breakpoint, type SxProps, type Theme } from '@mui/material/styles';

import { getUserStatus } from 'src/assets/data/status';
import { useCredentials } from 'src/core/slices';

import { Logo } from 'src/components/logo';

import { GoogleLogInView } from 'src/auth/view/google-log-in-view';

import { layoutClasses } from '../classes';
import { AccountDrawer } from '../components/account-drawer';
import { SocialDrawer } from '../components/social-drawer';
import { _user_account } from '../config-nav-account';
import { HeaderSection } from '../core/header-section';
import { LayoutSection } from '../core/layout-section';
import { SocialBootstrapper } from '../social-bootstrapper';
import { UserMain } from './main';

export type UserLayoutProps = {
  sx?: SxProps<Theme>;
  children: React.ReactNode;
  header?: {
    sx?: SxProps<Theme>;
  };
  data?: {
    nav?: NavSectionProps['data'];
  };
};

export function UserLayout({ sx, children, header, data }: UserLayoutProps) {
  const theme = useTheme();

  const { isAuthenticated } = useCredentials();

  const isMobile = useResponsive('down', 'sm');

  const layoutQuery: Breakpoint = 'lg';

  return (
    <LayoutSection
      headerSection={
        <HeaderSection
          layoutQuery={layoutQuery}
          sx={{
            flexShrink: 0,
            height: {
              xs: 'var(--layout-header-mobile-height)',
              sm: 'var(--layout-header-desktop-height)',
            },
            ...header?.sx,
          }}
          slots={{
            leftArea: (
              <>
                <Logo
                  sx={{
                    display: 'none',
                    [theme.breakpoints.up(layoutQuery)]: { display: 'inline-flex' },
                  }}
                />
              </>
            ),
            rightArea: (
              <Box display="flex" alignItems="center" gap={{ xs: 0, sm: 0.75 }}>
                {isMobile && isAuthenticated && <SocialDrawer sx={{ mt: 0.5 }} />}
                {isAuthenticated && <AccountDrawer data={_user_account} status={getUserStatus()} />}
                {!isAuthenticated && <GoogleLogInView sx={{ ml: 1 }} />}
              </Box>
            ),
          }}
        />
      }
      cssVars={{
        '--layout-transition-easing': 'linear',
        '--layout-transition-duration': '120ms',
        '--layout-nav-mini-width': '88px',
        '--layout-nav-vertical-width': '300px',
        '--layout-nav-horizontal-height': '64px',
        '--layout-dashboard-content-pt': theme.spacing(1),
        '--layout-dashboard-content-pb': theme.spacing(8),
        '--layout-dashboard-content-px': theme.spacing(5),
      }}
      sx={{
        [`& .${layoutClasses.hasSidebar}`]: {
          [theme.breakpoints.up(layoutQuery)]: {
            transition: theme.transitions.create(['padding-left'], {
              easing: 'var(--layout-transition-easing)',
              duration: 'var(--layout-transition-duration)',
            }),
            pl: 'var(--layout-nav-vertical-width)',
          },
        },
        ...sx,
      }}
    >
      <SocialBootstrapper>
        <UserMain>{children}</UserMain>
      </SocialBootstrapper>
    </LayoutSection>
  );
}
