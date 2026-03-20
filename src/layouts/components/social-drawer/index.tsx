import type { UserType } from 'src/types/type-user';
import type { AllRelationsType } from 'src/types/type-social';
import type { IconButtonProps } from '@mui/material/IconButton';

import { m } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import { Stack, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Diversity2Icon from '@mui/icons-material/Diversity2';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import { fUsername } from 'src/utils/helper';

import { useCredentials, useMessagesTools } from 'src/core/slices';
import { useSocketContext } from 'src/core/contexts/socket-context';
import { MessageTypingIllustration } from 'src/assets/illustrations';
import { useGetConversationQuery, useReadMessagesMutation } from 'src/core/apis/api-message';
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
import { useSocialSocketListeners } from './social-listeners';

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

  useSocialSocketListeners();

  const { user, setFriends, setFollowing } = useCredentials();
  const {
    isUnreadIndividualMessage,
    chatPeople,
    setChatPeople,
    individualMessages,
    setIndividualMessages,
    selectedForMessage,
    setSelectedForMessage,
  } = useMessagesTools();

  const { emit } = useSocketContext();

  const [headerTab, setHeaderTab] = useState('social');
  const [currentTab, setCurrentTab] = useState('');

  const [people, setPeople] = useState<AllRelationsType[]>([]);
  const [chatUser, setChatUser] = useState<Partial<UserType>>({});

  const { data: allRelations } = useGetAllRelationsQuery(user.id);

  const { data: friendsQuery } = useGetFriendsQuery(user.id);

  const { data: followingQuery } = useGetFollowingQuery(user.id);

  const { data, isLoading, isFetching } = useGetConversationQuery(
    {
      userId1: user.id,
      userId2: chatUser.id || '',
    },
    {
      skip: !chatUser.id,
    }
  );

  const [updateReadMessages] = useReadMessagesMutation();

  const handleChangeHeaderTab = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      setHeaderTab(newValue);
      if (newValue === 'messaging-with') {
        setSelectedForMessage(chatUser);
        emit('listening-to-user', {
          userId: user.id,
          listenerId: chatUser.id,
        });
      } else {
        setSelectedForMessage({});
        emit('stop-listening-to-user', {
          userId: user.id,
        });
      }
    },
    [user.id, chatUser, emit, setSelectedForMessage]
  );

  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }, []);

  const handleSelectedForMessage = useCallback(
    (accountDetails: Partial<UserType>) => {
      setHeaderTab('messaging-with');
      setChatUser(accountDetails);
      setSelectedForMessage(accountDetails);
      emit('listening-to-user', {
        userId: user.id,
        listenerId: accountDetails.id,
      });
    },
    [user.id, setChatUser, setSelectedForMessage, emit]
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

      {smDown && (
        <IconButton sx={{ ml: 'auto' }} size="medium" onClick={drawer.onFalse}>
          <CloseIcon sx={{ fontSize: '1.4rem' }} />
        </IconButton>
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
              onClick={async () => {
                handleSelectedForMessage(relation.accountDetails);
                if (relation?.latestMessage?.isUnread) {
                  await updateReadMessages({
                    userId1: user.id,
                    userId2: relation.accountDetails.id,
                  });
                }
              }}
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
              onClick={async () => {
                handleSelectedForMessage(relation.accountDetails);
                if (relation?.latestMessage?.isUnread) {
                  await updateReadMessages({
                    userId1: user.id,
                    userId2: relation.accountDetails.id,
                  });
                }
              }}
              isChat
            />
          </Box>
        ))}
      </Box>
    </Scrollbar>
  );

  useEffect(() => {
    if (
      !(isLoading || isFetching) &&
      data?.messages &&
      data?.chatUserId &&
      !individualMessages[data?.chatUserId]
    ) {
      setIndividualMessages({ userId: data?.chatUserId, messages: data.messages || [] });
    }
  }, [data, isLoading, isFetching, individualMessages, setIndividualMessages, chatUser]);

  useEffect(() => {
    if (currentTab === 'all' && allRelations?.data) {
      setPeople(allRelations.data);
    }
    if (currentTab === 'friends' && friendsQuery?.data) {
      setPeople(friendsQuery.data);
    }

    if (friendsQuery?.data && !chatPeople.length) {
      setChatPeople(friendsQuery.data);
    }
    if (currentTab === 'following' && followingQuery?.data) {
      setPeople(followingQuery.data);
    }
  }, [
    currentTab,
    headerTab,
    allRelations,
    friendsQuery,
    followingQuery,
    chatPeople,
    setPeople,
    setFriends,
    setFollowing,
    setChatPeople,
  ]);

  useEffect(() => {
    if (friendsQuery?.data) {
      console.log('friends query updated');
      setFriends(friendsQuery.data || []);
    }
  }, [friendsQuery, setFriends]);

  useEffect(() => {
    if (followingQuery?.data) {
      console.log('following query updated');
      setFollowing(followingQuery.data || []);
    }
  }, [followingQuery, setFollowing]);

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

        <Diversity2Icon />

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
