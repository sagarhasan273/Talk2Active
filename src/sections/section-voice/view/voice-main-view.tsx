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
import { useUpdateUserRecentRoomsMutation } from 'src/core/apis';

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
  const isActive = value === index;

  return (
    <Box
      role="tabpanel"
      hidden={!isActive}
      id={`voice-tabpanel-${index}`}
      aria-labelledby={`voice-tab-${index}`}
      sx={{
        height: isActive ? '100%' : 0, // ← full height when active
        minHeight: 0,
        overflow: 'hidden',
        display: isActive ? 'flex' : 'none', // ← flex so child fills height
        flexDirection: 'column',
      }}
      {...other}
    >
      {isActive && (
        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          {children}
        </Box>
      )}
    </Box>
  );
}

// ----------------------------------------------------------------------

type selectedTabType = 'find' | 'entry';

export function VoiceMainView() {
  const { user, isAuthenticated } = useCredentials();

  const editRoomBoolean = useBoolean();

  const isAuthOpen = useBoolean();

  const { room, userVoiceState, currentRooms, setRoom, setCurrentRooms } = useRoomTools();

  const [selectedTab, setSelectedTab] = useState<selectedTabType>('find');

  const [updateUserRecentRooms] = useUpdateUserRecentRoomsMutation();

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
        Explore and join voice channels to connect with others in real-time.
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
          Create New Channel
        </Button>
      </Box>
    </Box>
  );

  const leftSidebar = (
    <Scrollbar sx={{ height: 1 }}>
      {isAuthenticated && <VoiceUserProfileView />}
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
    <>
      <TabPanel value={selectedTab === 'find' ? 0 : 1} index={0}>
        <Scrollbar sx={{ height: 1 }}>
          <VoiceRoomsView onJoinRoom={handleJoinRoom} />
        </Scrollbar>
      </TabPanel>

      <TabPanel value={selectedTab !== 'find' ? 1 : 0} index={1}>
        <VoiceRoomView />
      </TabPanel>
    </>
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
        inVoice={userVoiceState.hasJoined}
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
