import type { UserType } from 'src/types/user';
import type { AllRelationsType } from 'src/types/type-social';
import type { IconButtonProps } from '@mui/material/IconButton';

import { m } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useState, useEffect, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { Stack, Avatar, Tooltip } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { selectAccount } from 'src/core/slices';
import { MessageTypingIllustration } from 'src/assets/illustrations';
import {
  useGetFriendsQuery,
  useGetFollowingQuery,
  useGetAllRelationsQuery,
} from 'src/core/apis/api-social';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';

import { SocialItem } from './social-item';

// ----------------------------------------------------------------------

const HEADER_TABS = [
  { icon: <Iconify icon="foundation:social-myspace" />, value: 'social', label: 'People' },
  { icon: <Iconify icon="tabler:message-filled" />, value: 'message', label: 'Message' },
];

const TABS = [
  { label: 'All', value: 'all', icon: 'lsicon:user-all-filled' },
  { label: 'Friends', value: 'friends', icon: 'fa-solid:user-friends' },
  {
    label: 'Following',
    value: 'following',
    icon: 'streamline-sharp:following-solid',
  },
];

// ----------------------------------------------------------------------

export type SocialDrawerProps = IconButtonProps;

export function SocialDrawer({ sx, ...other }: SocialDrawerProps) {
  const drawer = useBoolean();

  const user = useSelector(selectAccount);

  const [headerTab, setHeaderTab] = useState('social');
  const [currentTab, setCurrentTab] = useState('');
  const [selectedForMessage, setSelectedForMessage] = useState<Partial<UserType>>({});
  const [people, setPoeple] = useState<AllRelationsType[]>([]);

  const { data: allRelations } = useGetAllRelationsQuery(user.id, {
    skip: currentTab !== 'all',
  });

  const { data: friends } = useGetFriendsQuery(user.id, {
    skip: currentTab !== 'friends',
  });

  const { data: following } = useGetFollowingQuery(user.id, {
    skip: currentTab !== 'following',
  });

  const handleChangeHeaderTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setHeaderTab(newValue);
  }, []);

  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }, []);

  const messagingWith = {
    icon: (
      <Avatar
        src={selectedForMessage.profilePhoto}
        alt={selectedForMessage.name}
        sx={{ width: 24, height: 24 }}
      />
    ),
    label: (
      <Tooltip title="Sagar Hasan">
        <Stack sx={{ position: 'relative' }}>
          <Typography
            sx={{
              maxWidth: 100,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'block',
            }}
          >
            {selectedForMessage.name}
          </Typography>

          <MessageTypingIllustration sx={{ position: 'absolute', top: 12, left: -5 }} />
        </Stack>
      </Tooltip>
    ),
    value: 'messaging-with',
  };

  const renderHead = (
    <CustomTabs value={headerTab} onChange={handleChangeHeaderTab}>
      {[...HEADER_TABS].map((tab) => (
        <Tab
          key={tab.value}
          iconPosition="start"
          value={tab.value}
          label={tab.label}
          icon={tab.icon}
          sx={{
            minWidth: 100,
            '&.MuiButtonBase-root': {
              px: 1.5,
            },
          }}
        />
      ))}
      {selectedForMessage.name && (
        <Tab
          iconPosition="start"
          value={messagingWith.value}
          label={messagingWith.label}
          icon={messagingWith.icon}
          sx={{
            minWidth: 120,
            maxWidth: 160,
            '&.MuiButtonBase-root': {
              px: 1.5,
            },
          }}
        />
      )}
    </CustomTabs>
  );

  const renderTabs = (
    <CustomTabs variant="fullWidth" value={currentTab} onChange={handleChangeTab}>
      {TABS.map((tab) => (
        <Tab
          key={tab.value}
          iconPosition="start"
          value={tab.value}
          label={tab.label}
          icon={<Iconify icon={tab.icon} />}
        />
      ))}
    </CustomTabs>
  );

  const renderList = (
    <Scrollbar>
      <Box component="ul">
        {people.map((relation, index) => (
          <Box component="li" key={index} sx={{ display: 'flex' }}>
            <SocialItem
              relation={relation}
              onClick={() => setSelectedForMessage(relation.accountDetails)}
            />
          </Box>
        ))}
      </Box>
    </Scrollbar>
  );

  useEffect(() => {
    if (currentTab === 'all' && allRelations?.data) {
      setPoeple(allRelations.data);
    }
    if (currentTab === 'friends' && friends?.data) {
      setPoeple(friends.data);
    }
    if (currentTab === 'following' && following?.data) {
      setPoeple(following.data);
    }
  }, [currentTab, allRelations, friends, following, setPoeple]);

  return (
    <>
      <IconButton
        component={m.button}
        whileTap="tap"
        onClick={() => {
          drawer.onTrue();
          setCurrentTab((prev) => (prev === '' ? 'all' : prev));
        }}
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
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48">
          <path
            fill="currentColor"
            stroke="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M22.818 28.465c0 .694-.596 1.252-1.286 1.182c-6.358-.644-11.32-6.013-11.32-12.541s4.962-11.897 11.32-12.541c.69-.07 1.286.488 1.286 1.182zm2.364-8.93c0-.694.596-1.252 1.286-1.182c6.358.644 11.32 6.013 11.32 12.541s-4.962 11.897-11.32 12.541c-.69.07-1.286-.488-1.286-1.182z"
            strokeWidth="1"
          />
          <circle
            cx="16.515"
            cy="37.197"
            r="6.303"
            fill="currentColor"
            stroke="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1"
          />
          <circle
            cx="31.485"
            cy="10.803"
            r="6.303"
            fill="currentColor"
            stroke="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1"
          />
        </svg>
        <Typography variant="caption">Social</Typography>
      </IconButton>

      <Drawer
        open={drawer.value}
        onClose={drawer.onFalse}
        anchor="right"
        slotProps={{ backdrop: { invisible: true } }}
        PaperProps={{ sx: { width: 1, maxWidth: 420 } }}
      >
        {renderHead}

        {headerTab === 'social' && renderTabs}

        {headerTab === 'social' && renderList}

        {headerTab === 'social' && (
          <Box sx={{ p: 1 }}>
            <Button fullWidth size="large">
              View all
            </Button>
          </Box>
        )}
      </Drawer>
    </>
  );
}
