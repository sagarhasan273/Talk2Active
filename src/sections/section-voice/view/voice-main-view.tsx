import type { RoomResponse } from 'src/types/type-chat';

import { useState } from 'react';

import { Box, Button, Typography } from '@mui/material';

import { VoiceRoomLayout } from 'src/layouts/voice-room';
import { useRoomTools } from 'src/core/slices/slice-room';

import { Scrollbar } from 'src/components/scrollbar';

import VoiceRoomsView from './voice-rooms-view';
import VoiceRoomFindButton from '../voice-room-find-button';
import VoiceUserProfileView from './voice-user-profile-view';
import VoiceRoomEntryButton from '../voice-room-entry-button';
import { VoiceRoomView } from '../voice-room/voice-room-view';

// ----------------------------------------------------------------------

type selectedTabType = 'find' | 'entry';

export function VoiceMainView() {
  const { room, setRoom } = useRoomTools();

  const [selectedTab, setSelectedTab] = useState<selectedTabType>('find');

  const handleJoinRoom = async (roomSelected: RoomResponse) => {
    setRoom(roomSelected);
    setSelectedTab('entry');
  };

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
            borderColor: 'divider',
            opacity: 0.7,
            '&:hover': {
              opacity: 1,
              borderColor: 'text.secondary',
            },
          }}
        >
          Create New Room
        </Button>
      </Box>
    </Box>
  );

  const leftSidebar = (
    <Scrollbar>
      <VoiceUserProfileView />
      <VoiceRoomFindButton
        selected={selectedTab === 'find'}
        onClick={() => {
          setSelectedTab('find');
        }}
      />

      <VoiceRoomEntryButton
        selected={selectedTab === 'entry'}
        room={room}
        onClick={handleJoinRoom}
      />
    </Scrollbar>
  );

  const rightSidebar = (
    <Box sx={{ width: 1, backgroundColor: 'background.neutral', height: '100%' }} />
  );

  const mainContent =
    selectedTab === 'find' ? <VoiceRoomsView onJoinRoom={handleJoinRoom} /> : <VoiceRoomView />;

  const footer = <Box sx={{ height: 1, backgroundColor: 'background.neutral' }} />;

  return (
    <VoiceRoomLayout
      header={header}
      leftSidebar={leftSidebar}
      rightSidebar={rightSidebar}
      mainContent={mainContent}
      footer={footer}
    />
  );
}
