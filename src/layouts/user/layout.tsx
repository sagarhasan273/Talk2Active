import type { NavSectionProps } from 'src/components/nav-section';

import { Box } from '@mui/material';
import { useTheme, type Theme, type SxProps, type Breakpoint } from '@mui/material/styles';

import { _contacts, _notifications } from 'src/_mock';
import { getUserStatus } from 'src/assets/data/status';

import { Logo } from 'src/components/logo';
import { useSettingsContext } from 'src/components/settings';

import { UserMain } from './main';
import { layoutClasses } from '../classes';
import { useNavColorVars } from './styles';
import { _user_account } from '../config-nav-account';
import { LayoutSection } from '../core/layout-section';
import { HeaderSection } from '../core/header-section';
import { FeedButton } from '../components/feed-button';
import { AccountDrawer } from '../components/account-drawer';
import { LanguagePopover } from '../components/language-popover';
import { ContactsPopover } from '../components/contacts-popover';
import { VoiceChatButton } from '../components/voice-chat-button';
import { NotificationsDrawer } from '../components/notifications-drawer';

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

  const settings = useSettingsContext();

  const navColorVars = useNavColorVars(theme, settings);

  const layoutQuery: Breakpoint = 'lg';

  return (
    <LayoutSection
      headerSection={
        <HeaderSection
          layoutQuery={layoutQuery}
          slotProps={{
            container: {
              maxWidth: false,
            },
          }}
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
                {/* -- Language popover -- */}
                <LanguagePopover
                  data={[
                    { value: 'en', label: 'English', countryCode: 'GB' },
                    { value: 'fr', label: 'French', countryCode: 'FR' },
                    { value: 'vi', label: 'Vietnamese', countryCode: 'VN' },
                    { value: 'cn', label: 'Chinese', countryCode: 'CN' },
                    { value: 'ar', label: 'Arabic', countryCode: 'SA' },
                  ]}
                />
                {/* -- Notifications popover -- */}
                <NotificationsDrawer data={_notifications} />
                {/* --Feed Page */}
                <FeedButton />
                {/* --Voice Chat Page */}
                <VoiceChatButton />
                {/* -- Contacts popover -- */}
                <ContactsPopover data={_contacts} />
                {/* -- Account drawer -- */}
                <AccountDrawer data={_user_account} status={getUserStatus('active')} />
              </Box>
            ),
          }}
        />
      }
      cssVars={{
        ...navColorVars.layout,
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
