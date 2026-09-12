import type { NavSectionProps } from 'src/components/nav-section';

import { useResponsive } from '@/hooks/use-responsive';

import { Box } from '@mui/material';
import { useTheme, type Theme, type SxProps, type Breakpoint } from '@mui/material/styles';

import { useCredentials } from 'src/core/slices';
import { getUserStatus } from 'src/assets/data/status';

import { Logo } from 'src/components/logo';

import { GoogleLogInView } from 'src/auth/view/google-log-in-view';

import { UserMain } from './main';
import { layoutClasses } from '../classes';
import { _user_account } from '../config-nav-account';
import { LayoutSection } from '../core/layout-section';
import { HeaderSection } from '../core/header-section';
import { SocialDrawer } from '../components/social-drawer';
import { AccountDrawer } from '../components/account-drawer';

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
          sx={header?.sx}
          slots={{
            leftArea: (
              <>
                {/* -- Logo -- */}
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
                {/* -- Social popover -- */}
                {isMobile && isAuthenticated && <SocialDrawer sx={{ mt: 0.5 }} />}

                {/* -- Account drawer -- */}
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
      <UserMain>{children}</UserMain>
    </LayoutSection>
  );
}
