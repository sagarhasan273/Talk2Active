import type { RoomResponse } from 'src/types/type-chat';

import { VerifiedIcon } from 'lucide-react';
import React, { useState, useCallback } from 'react';

import AddIcon from '@mui/icons-material/Add';
import { Box, Button, Tooltip, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { toastErrorResponse } from 'src/utils/response';

import { useCredentials } from 'src/core/slices';
import { VoiceRoomLayout } from 'src/layouts/voice-room';
import { useRoomTools } from 'src/core/slices/slice-room';
import { useSocketContext } from 'src/core/contexts/socket-context';
import { useWebRTCContext } from 'src/core/contexts/webRTC-context';
import { useLeaveRoomMutation, useUpdateUserRecentRoomsMutation } from 'src/core/apis';

import { Scrollbar } from 'src/components/scrollbar';
import { LoginPromptDialog } from 'src/components/custom-dialog';

import VoiceRoomsView from './voice-rooms-view';
import VoiceUserProfileView from './voice-user-profile-view';
import { CreateRoomModal } from '../voice-create-room-modal';
import { VoiceRoomFindButton } from '../voice-room-find-button';
import VoiceRoomSelectButton from '../voice-room-select-button';
import { VoiceRoomView } from '../voice-room-view/voice-room-view';

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
  const { user, isAuthenticated } = useCredentials();

  const editRoomBoolean = useBoolean();

  const isAuthOpen = useBoolean();

  const { emit } = useSocketContext();

  const {
    room,
    userVoiceState,
    currentRooms,
    setRoom,
    setCurrentRooms,
    updateUserVoiceState,
    resetParticipants,
    clearChatRoomMessages,
  } = useRoomTools();
  const { roomId } = userVoiceState;

  const webRTC = useWebRTCContext();
  const { cleanup: cleanupWebRTC } = webRTC;

  const [selectedTab, setSelectedTab] = useState<selectedTabType>('find');

  const [updateUserRecentRooms] = useUpdateUserRecentRoomsMutation();
  const [leaveRoom] = useLeaveRoomMutation();

  const handleJoinRoom = useCallback(
    async (roomSelected: RoomResponse) => {
      if (!isAuthenticated) {
        isAuthOpen.onTrue();
        return;
      }

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
    [
      user.id,
      currentRooms,
      isAuthenticated,
      isAuthOpen,
      setCurrentRooms,
      updateUserRecentRooms,
      setRoom,
    ]
  );

  const handelLeaveChat = useCallback(async () => {
    const joinedRoomId = roomId || (sessionStorage.getItem('joinedRoomId') as string);
    let response = null;

    if (joinedRoomId)
      response = await leaveRoom({
        roomId: joinedRoomId,
        userId: user.id,
        name: user.name,
      }).unwrap();

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

      clearChatRoomMessages();

      sessionStorage.removeItem('joinedRoomId');
    } else {
      console.error(response?.message || 'Failed to leave chat');
    }
  }, [
    roomId,
    cleanupWebRTC,
    emit,
    leaveRoom,
    resetParticipants,
    clearChatRoomMessages,
    updateUserVoiceState,
    user.id,
    user.name,
  ]);

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
        <Tooltip
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <VerifiedIcon style={{ fontSize: 12 }} />
              <span>Verified accounts only</span>
            </Box>
          }
          arrow
          placement="top"
        >
          <span>
            {' '}
            {/* Span needed for disabled button tooltip to work */}
            <Button
              variant="contained"
              size="small"
              sx={{
                borderRadius: '20px',
                px: 2,
                opacity: 0.6,
                cursor: 'not-allowed',
              }}
              disabled
            >
              Quick Join
            </Button>
          </span>
        </Tooltip>

        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          sx={{
            borderRadius: '20px',
            px: 1,
            color: 'primary.main',
            borderColor: 'primary.main',
            '& .MuiButton-startIcon': {
              mr: 0.3,
            },
            '&:hover': {
              borderColor: 'primary.light',
            },
          }}
          onClick={isAuthenticated ? editRoomBoolean.onTrue : isAuthOpen.onTrue}
        >
          Create New Room
        </Button>
      </Box>
    </Box>
  );

  const leftSidebar = (
    <Scrollbar sx={{ height: 1 }}>
      {isAuthenticated && <VoiceUserProfileView onLeave={handelLeaveChat} />}
      <VoiceRoomFindButton
        selected={selectedTab === 'find'}
        onClick={() => {
          setSelectedTab('find');
        }}
      />

      {isAuthenticated &&
        currentRooms.map((recentRoom) => (
          <VoiceRoomSelectButton
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
    <Scrollbar sx={{ height: 1 }}>
      <TabPanel value={selectedTab === 'find' ? 0 : 1} index={0}>
        <VoiceRoomsView onJoinRoom={handleJoinRoom} />
      </TabPanel>

      <TabPanel value={selectedTab !== 'find' ? 1 : 0} index={1}>
        <VoiceRoomView onLeave={handelLeaveChat} />
      </TabPanel>
    </Scrollbar>
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

      <LoginPromptDialog openBoolean={isAuthOpen} />
    </>
  );
}
