import type { RoomResponse } from 'src/types/type-chat';

import { useSelector } from 'react-redux';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import { Box, Button, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { toastErrorResponse } from 'src/utils/response';

import { selectAccount } from 'src/core/slices';
import { VoiceRoomLayout } from 'src/layouts/voice-room';
import { useRoomTools } from 'src/core/slices/slice-room';
import { useSocketContext } from 'src/core/contexts/socket-context';
import { useWebRTCContext } from 'src/core/contexts/webRTC-context';
import { useLeaveRoomMutation, useUpdateUserRecentRoomsMutation } from 'src/core/apis';

import { Scrollbar } from 'src/components/scrollbar';

import { useChatSocketListeners } from 'src/sections/section-chat-room/chat-hooks/chat-socket-listeners';

import VoiceRoomsView from './voice-rooms-view';
import VoiceRoomFindButton from '../voice-room-find-button';
import VoiceUserProfileView from './voice-user-profile-view';
import { CreateRoomModal } from '../voice-create-room-modal';
import VoiceRoomEntryButton from '../voice-room-entry-button';
import { VoiceRoomView } from '../voice-room/voice-room-view';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`voice-tabpanel-${index}`}
      aria-labelledby={`voice-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  );
}

// ----------------------------------------------------------------------

type selectedTabType = 'find' | 'entry';

export function VoiceMainView() {
  const user = useSelector(selectAccount);

  const editRoomBoolean = useBoolean();

  const { on, off, emit } = useSocketContext();

  const {
    room,
    userVoiceState,
    currentRooms,
    setRoom,
    setCurrentRooms,
    updateUserVoiceState,
    resetParticipants,
  } = useRoomTools();
  const { roomId, hasJoined } = userVoiceState;

  const webRTC = useWebRTCContext();
  const { cleanup: cleanupWebRTC } = webRTC;

  // Socket listeners
  useChatSocketListeners(webRTC);

  const setupChatSocketListenersRef = useRef<(() => void) | undefined>();

  const [selectedTab, setSelectedTab] = useState<selectedTabType>('find');

  const [updateUserRecentRooms] = useUpdateUserRecentRoomsMutation();
  const [leaveRoom] = useLeaveRoomMutation();

  const handleBroadcastNewRoom = useCallback(
    (data: any) => {
      const recentRoomIds = currentRooms?.map((currentRoom) => currentRoom?.room?.id);
      const hasJoinRecentRoom = recentRoomIds.includes(data?.joinInfo?.roomId);
      const hasLeaveRecentRoom = recentRoomIds.includes(data?.leaveInfo?.roomId);

      if (hasJoinRecentRoom || hasLeaveRecentRoom)
        setCurrentRooms(
          currentRooms.map((currentRoom) => {
            if (currentRoom?.room?.id === data?.joinInfo?.roomId) {
              return {
                ...currentRoom,
                room: {
                  ...currentRoom.room,
                  currentParticipants: [
                    ...(currentRoom.room.currentParticipants || []),
                    {
                      user: data.joinInfo.participant,
                      joinedAt: new Date().toISOString(),
                    },
                  ],
                },
              };
            }
            if (currentRoom?.room?.id === data?.leaveInfo?.roomId) {
              return {
                ...currentRoom,
                room: {
                  ...currentRoom.room,
                  currentParticipants: (currentRoom.room.currentParticipants || []).filter(
                    (participant) => participant?.user?.id === data?.leaveInfo?.participant?.userId
                  ),
                },
              };
            }
            return currentRoom;
          })
        );
    },
    [currentRooms, setCurrentRooms]
  );

  const handleJoinRoom = useCallback(
    async (roomSelected: RoomResponse) => {
      setRoom(roomSelected);
      setSelectedTab('entry');

      const roomExists = currentRooms.some((roomProp) => roomProp.room?.id === roomSelected.id);

      if (!roomExists) {
        const formData = {
          id: user.id,
          roomId: roomSelected.id,
        };

        const response = await updateUserRecentRooms(formData);

        if (response.data?.status) {
          setCurrentRooms([
            { room: roomSelected, joinedAt: new Date().toISOString() as unknown as string },
            ...currentRooms,
          ]);
        } else {
          toastErrorResponse(response);
        }
      }
    },
    [user.id, currentRooms, setCurrentRooms, updateUserRecentRooms, setRoom]
  );

  const handelLeaveChat = useCallback(async () => {
    if (setupChatSocketListenersRef.current) {
      setupChatSocketListenersRef.current?.();
      setupChatSocketListenersRef.current = undefined;
    }

    const joinedRoomId = roomId || (sessionStorage.getItem('joinedRoomId') as string);
    let response = null;

    if (joinedRoomId)
      response = await leaveRoom({ roomId: joinedRoomId, userId: user.id }).unwrap();

    if (response?.status) {
      emit('leave-voice-room', {
        roomId: joinedRoomId,
        userId: user.id,
        name: user.name,
      });

      // This cleanup keeps audio context alive
      cleanupWebRTC();

      updateUserVoiceState({ hasJoined: false, roomId: null });

      // Reset local state
      resetParticipants();

      sessionStorage.removeItem('joinedRoomId');
    } else {
      console.error(response?.message);
    }
  }, [
    cleanupWebRTC,
    emit,
    leaveRoom,
    resetParticipants,
    roomId,
    updateUserVoiceState,
    user.id,
    user.name,
  ]);

  useEffect(() => {
    off('recent-room-updated-with-participant', handleBroadcastNewRoom);
    on('recent-room-updated-with-participant', handleBroadcastNewRoom);

    return () => {
      off('recent-room-updated-with-participant', handleBroadcastNewRoom);
    };
  }, [on, off, handleBroadcastNewRoom]);

  // Cleanup on unmount
  useEffect(() => {
    console.log('User leave Clean up while component unmount.');
    return () => {
      handelLeaveChat();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const header = (
    <Box
      sx={{
        p: 2,
        pb: { xs: 1, sm: 2 },
        borderRadius: 2,
        height: '100%',
        backgroundColor: 'background.paper',
      }}
    >
      <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>
        Dive Into Conversation
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Explore and join voice rooms to connect with others in real-time.
      </Typography>

      <Box
        sx={{ my: 1, display: 'flex', gap: 1, justifyContent: 'flex-start', flexDirection: 'row' }}
      >
        <Button variant="contained" size="small" sx={{ borderRadius: '20px', px: 2 }}>
          Quick Join
        </Button>
        <Button
          variant="outlined"
          size="small"
          sx={{
            borderRadius: '20px',
            px: 1,
            color: 'text.secondary',
            borderColor: 'text.secondary',
            opacity: 0.7,
            '&:hover': {
              opacity: 1,
              borderColor: 'text.secondary',
            },
          }}
          onClick={editRoomBoolean.onTrue}
        >
          Create New Room
        </Button>
      </Box>
    </Box>
  );

  const leftSidebar = (
    <Scrollbar>
      <VoiceUserProfileView onLeave={handelLeaveChat} hasJoined={hasJoined} />
      <VoiceRoomFindButton
        selected={selectedTab === 'find'}
        onClick={() => {
          setSelectedTab('find');
        }}
      />

      {currentRooms.map((recentRoom) => (
        <VoiceRoomEntryButton
          key={recentRoom?.room?.id}
          selected={selectedTab === 'entry' && room.id === recentRoom?.room?.id}
          isJoined={userVoiceState.roomId === recentRoom?.room?.id}
          room={recentRoom?.room}
          onClick={handleJoinRoom}
        />
      ))}
    </Scrollbar>
  );

  const rightSidebar = (
    <Box sx={{ width: 1, backgroundColor: 'background.neutral', height: '100%' }} />
  );

  const mainContent = (
    <Box sx={{ width: '100%' }}>
      <TabPanel value={selectedTab === 'find' ? 0 : 1} index={0}>
        <VoiceRoomsView onJoinRoom={handleJoinRoom} />
      </TabPanel>

      <TabPanel value={selectedTab !== 'find' ? 1 : 0} index={1}>
        <VoiceRoomView onLeave={handelLeaveChat} />
      </TabPanel>
    </Box>
  );

  const footer = <Box sx={{ height: 1, backgroundColor: 'background.neutral' }} />;

  return (
    <>
      <VoiceRoomLayout
        header={header}
        leftSidebar={leftSidebar}
        rightSidebar={rightSidebar}
        mainContent={mainContent}
        footer={footer}
      />
      <CreateRoomModal
        open={editRoomBoolean.value}
        onClose={editRoomBoolean.onFalse}
        onCreateRoom={() => {}}
      />
    </>
  );
}
