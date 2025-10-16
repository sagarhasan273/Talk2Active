import type { IconButtonProps } from '@mui/material/IconButton';

import { m } from 'framer-motion';
import { useState, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import SvgIcon from '@mui/material/SvgIcon';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { useBoolean } from 'src/hooks/use-boolean';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';

import { NotificationItem } from './notification-item';

import type { NotificationItemProps } from './notification-item';

// ----------------------------------------------------------------------

const TABS = [
  { value: 'all', label: 'All', count: 22 },
  { value: 'unread', label: 'Unread', count: 12 },
  { value: 'archived', label: 'Archived', count: 10 },
];

// ----------------------------------------------------------------------

export type NotificationsDrawerProps = IconButtonProps & {
  data?: NotificationItemProps[];
};

export function NotificationsDrawer({ data = [], sx, ...other }: NotificationsDrawerProps) {
  const drawer = useBoolean();

  const [currentTab, setCurrentTab] = useState('all');

  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }, []);

  const [notifications, setNotifications] = useState(data);

  const totalUnRead = notifications.filter((item) => item.isUnRead === true).length;

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((notification) => ({ ...notification, isUnRead: false })));
  };

  const renderHead = (
    <Stack direction="row" alignItems="center" sx={{ py: 2, pl: 2.5, pr: 1, minHeight: 68 }}>
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        Notifications
      </Typography>

      {!!totalUnRead && (
        <Tooltip title="Mark all as read">
          <IconButton color="primary" onClick={handleMarkAllAsRead}>
            <Iconify icon="eva:done-all-fill" />
          </IconButton>
        </Tooltip>
      )}

      <IconButton onClick={drawer.onFalse} sx={{ display: { xs: 'inline-flex', sm: 'none' } }}>
        <Iconify icon="mingcute:close-line" />
      </IconButton>

      <IconButton>
        <Iconify icon="solar:settings-bold-duotone" />
      </IconButton>
    </Stack>
  );

  const renderTabs = (
    <CustomTabs variant="fullWidth" value={currentTab} onChange={handleChangeTab}>
      {TABS.map((tab) => (
        <Tab
          key={tab.value}
          iconPosition="end"
          value={tab.value}
          label={tab.label}
          icon={
            <Label
              variant={((tab.value === 'all' || tab.value === currentTab) && 'filled') || 'soft'}
              color={
                (tab.value === 'unread' && 'info') ||
                (tab.value === 'archived' && 'success') ||
                'default'
              }
            >
              {tab.count}
            </Label>
          }
        />
      ))}
    </CustomTabs>
  );

  const renderList = (
    <Scrollbar>
      <Box component="ul">
        {notifications?.map((notification) => (
          <Box component="li" key={notification.id} sx={{ display: 'flex' }}>
            <NotificationItem notification={notification} />
          </Box>
        ))}
      </Box>
    </Scrollbar>
  );

  return (
    <>
      <IconButton
        component={m.button}
        whileTap="tap"
        onClick={drawer.onTrue}
        sx={{
          color: 'primary.main',
          display: 'flex',
          flexDirection: 'column',
          ustifyContent: 'center',
          alignItems: 'center',
          ...(drawer.value && { color: 'primary.dark' }),
          ...sx,
        }}
        disableRipple
        {...other}
      >
        <Badge
          badgeContent={totalUnRead}
          color="error"
          sx={{
            '& .MuiBadge-badge': {
              fontSize: '0.6rem',
              height: '14px',
              width: '14px',
              minWidth: '14px',
            },
          }}
        >
          <SvgIcon>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M3 18a1 1 0 0 1-.894-1.447L4 12.763V10a8 8 0 1 1 16 0v2.764l1.894 3.789A1 1 0 0 1 21 18zm9 4a4 4 0 0 1-3.874-3h7.748A4 4 0 0 1 12 22"
              />
            </svg>
          </SvgIcon>
        </Badge>
        <Typography variant="caption">Notifications</Typography>
      </IconButton>

      <Drawer
        open={drawer.value}
        onClose={drawer.onFalse}
        anchor="right"
        slotProps={{ backdrop: { invisible: true } }}
        PaperProps={{ sx: { width: 1, maxWidth: 420 } }}
      >
        {renderHead}

        {renderTabs}

        {renderList}

        <Box sx={{ p: 1 }}>
          <Button fullWidth size="large">
            View all
          </Button>
        </Box>
      </Drawer>
    </>
  );
}
