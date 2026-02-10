import type { UserType } from 'src/types/type-user';
import type { AllRelationsType } from 'src/types/type-social';
import type { IconButtonProps } from '@mui/material/IconButton';

import { m } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useState, useEffect, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import { Stack, Tooltip } from '@mui/material';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import { fUsername } from 'src/utils/helper';

import { selectAccount, useMessagesTools } from 'src/core/slices';
import { MessageTypingIllustration } from 'src/assets/illustrations';
import { VoiceRoomMessageIndividual } from 'src/layouts/components/social-drawer/message-individual';
import {
  useGetFriendsQuery,
  useGetFollowingQuery,
  useGetAllRelationsQuery,
} from 'src/core/apis/api-social';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import { AvatarUser } from 'src/components/avatar-user';

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
  const smDown = useResponsive('down', 'sm');

  const drawer = useBoolean();

  const user = useSelector(selectAccount);
  const {
    isUnreadIndividualMessage,
    chatPeople,
    setChatPeople,
    selectedForMessage,
    setSelectedForMessage,
  } = useMessagesTools();

  const [headerTab, setHeaderTab] = useState('social');
  const [currentTab, setCurrentTab] = useState('');

  const [people, setPeople] = useState<AllRelationsType[]>([]);
  const [chatUser, setChatUser] = useState<Partial<UserType>>({});

  const { data: allRelations } = useGetAllRelationsQuery(user.id, {
    skip: currentTab !== 'all',
  });

  const { data: friends } = useGetFriendsQuery(user.id, {
    skip: !chatPeople,
  });

  const { data: following } = useGetFollowingQuery(user.id, {
    skip: currentTab !== 'following',
  });

  const handleChangeHeaderTab = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      setHeaderTab(newValue);
      if (newValue === 'messaging-with') {
        setSelectedForMessage(chatUser);
      } else {
        setSelectedForMessage({});
      }
    },
    [chatUser, setSelectedForMessage]
  );

  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }, []);

  const handleSelectedForMessage = useCallback(
    (accountDetails: Partial<UserType>) => {
      setHeaderTab('messaging-with');
      setChatUser(accountDetails);
      setSelectedForMessage(accountDetails);
    },
    [setChatUser, setSelectedForMessage]
  );

  const messagingWith = {
    icon: (
      <AvatarUser
        avatarUrl={chatUser.profilePhoto || null}
        name={chatUser.name ?? 'TS'}
        verified={chatUser.verified ?? false}
        sx={{ width: 24, height: 24, fontSize: 10 }}
      />
    ),
    label: (
      <Tooltip title={chatUser.name || 'Unknown User'}>
        <Stack sx={{ position: 'relative' }}>
          <Typography
            sx={{
              maxWidth: smDown ? 50 : 120,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'block',
            }}
          >
            {smDown ? fUsername(chatUser.name) : chatUser.name}
          </Typography>

          <MessageTypingIllustration sx={{ position: 'absolute', top: 12 }} />
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
          label={smDown ? undefined : tab.label}
          icon={
            <Stack>
              {isUnreadIndividualMessage && tab.value === 'message' && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 5,
                    right: 5,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: 'error.main',
                    zIndex: 1,
                  }}
                />
              )}
              {tab.icon}
            </Stack>
          }
          sx={{
            minWidth: smDown ? 50 : 100,
            '&.MuiButtonBase-root': {
              px: 1.5,
              '&.Mui-selected': {
                color: 'common.black',
              },
            },
          }}
        />
      ))}
      {chatUser.name && (
        <Tab
          iconPosition="start"
          value={messagingWith.value}
          label={messagingWith.label}
          icon={messagingWith.icon}
          sx={{
            minWidth: smDown ? 50 : 120,
            maxWidth: smDown ? 80 : 160,
            gap: 0.5,
            '&.MuiButtonBase-root': {
              px: 1.5,
              '&.Mui-selected': {
                color: 'common.black',
              },
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
          sx={{
            '&.Mui-selected': {
              color: 'common.black',
            },
          }}
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
              onClick={() => handleSelectedForMessage(relation.accountDetails)}
            />
          </Box>
        ))}
      </Box>
    </Scrollbar>
  );

  const renderMessageList = (
    <Scrollbar>
      <Box component="ul">
        {chatPeople.map((relation, index) => (
          <Box component="li" key={index} sx={{ display: 'flex' }}>
            <SocialItem
              relation={relation}
              onClick={() => handleSelectedForMessage(relation.accountDetails)}
              isChat
            />
          </Box>
        ))}
      </Box>
    </Scrollbar>
  );

  useEffect(() => {
    if (currentTab === 'all' && allRelations?.data) {
      setPeople(allRelations.data);
    }
    if (currentTab === 'friends' && friends?.data) {
      setPeople(friends.data);
    }
    if (friends?.data && !chatPeople.length) {
      setChatPeople(friends.data);
    }
    if (currentTab === 'following' && following?.data) {
      setPeople(following.data);
    }
  }, [
    currentTab,
    headerTab,
    allRelations,
    friends,
    following,
    chatPeople,
    setPeople,
    setChatPeople,
  ]);

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
        {/* Simple dot indicator */}
        {isUnreadIndividualMessage && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: 'error.main',
              zIndex: 1,
            }}
          />
        )}

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

        {headerTab === 'message' && renderMessageList}

        {headerTab === 'messaging-with' && (
          <VoiceRoomMessageIndividual
            targetUserInfo={{
              userId: selectedForMessage?.id,
              name: selectedForMessage?.name,
              avatar: selectedForMessage?.profilePhoto,
            }}
          />
        )}

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
