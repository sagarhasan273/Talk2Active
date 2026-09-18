import type { Breakpoint, SxProps, Theme } from '@mui/material/styles';
import type { NavSectionProps } from 'src/components/nav-section';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

import { useBoolean } from 'src/hooks/use-boolean';

import { _contacts, _notifications } from 'src/_mock';

import { Logo } from 'src/components/logo';

import { AccountDrawer } from '../components/account-drawer';
import { ContactsPopover } from '../components/contacts-popover';
import { MenuButton } from '../components/menu-button';
import { NotificationsDrawer } from '../components/notifications-drawer';
import { Searchbar } from '../components/searchbar';
import { SettingsButton } from '../components/settings-button';
import { _account } from '../config-nav-account';
import { navData as dashboardNavData } from '../config-nav-dashboard';
import { HeaderSection } from '../core/header-section';
import { LayoutSection } from '../core/layout-section';
import { Main } from './main';
import { NavMobile } from './nav-mobile';
import { StyledDivider } from './styles';

// ----------------------------------------------------------------------

export type DashboardLayoutProps = {
  sx?: SxProps<Theme>;
  children: React.ReactNode;
  header?: {
    sx?: SxProps<Theme>;
  };
  data?: {
    nav?: NavSectionProps['data'];
  };
};

export function DashboardLayout({ sx, children, header, data }: DashboardLayoutProps) {
  const theme = useTheme();

  const mobileNavOpen = useBoolean();

  const layoutQuery: Breakpoint = 'lg';

  const navData = data?.nav ?? dashboardNavData;

  return (
    <LayoutSection
      /** **************************************
       * Header
       *************************************** */
      headerSection={
        <HeaderSection
          layoutQuery={layoutQuery}
          sx={header?.sx}
          slots={{
            topArea: (
              <Alert severity="info" sx={{ display: 'none', borderRadius: 0 }}>
                This is an info Alert.
              </Alert>
            ),
            leftArea: (
              <>
                {/* -- Nav mobile -- */}
                <MenuButton
                  onClick={mobileNavOpen.onTrue}
                  sx={{
                    mr: 1,
                    ml: -1,
                    [theme.breakpoints.up(layoutQuery)]: { display: 'none' },
                  }}
                />
                <NavMobile
                  data={navData}
                  open={mobileNavOpen.value}
                  onClose={mobileNavOpen.onFalse}
                />
                {/* -- Logo -- */}
                <Logo
                  sx={{
                    display: 'none',
                    [theme.breakpoints.up(layoutQuery)]: { display: 'inline-flex' },
                  }}
                />

                {/* -- Divider -- */}
                <StyledDivider sx={{ [theme.breakpoints.up(layoutQuery)]: { display: 'flex' } }} />
              </>
            ),
            rightArea: (
              <Box display="flex" alignItems="center" gap={{ xs: 0, sm: 0.75 }}>
                {/* -- Searchbar -- */}
                <Searchbar data={navData} />
                {/* -- Notifications popover -- */}
                <NotificationsDrawer data={_notifications} />
                {/* -- Contacts popover -- */}
                <ContactsPopover data={_contacts} />
                {/* -- Settings button -- */}
                <SettingsButton />
                {/* -- Account drawer -- */}
                <AccountDrawer data={_account} />
              </Box>
            ),
          }}
        />
      }
      /** **************************************
       * Footer
       *************************************** */
      footerSection={null}
      /** **************************************
       * Style
       *************************************** */
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
    >
      <Main>{children}</Main>
    </LayoutSection>
  );
}
