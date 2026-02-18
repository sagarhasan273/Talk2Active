import type { RoomResponse } from 'src/types/type-chat';

import React from 'react';

import { Box } from '@mui/material';

import { useGetRoomsQuery } from 'src/core/apis/api-chat';

import { Scrollbar } from 'src/components/scrollbar';

import VoiceRoomCard from '../voice-room-card';

interface RoomListProps {
  onJoinRoom: (room: RoomResponse) => void;
}

export default function VoiceRoomsView({ onJoinRoom }: RoomListProps) {
  const { data: rooms } = useGetRoomsQuery(null);

  return (
    <Scrollbar sx={{ height: '100%' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          color: 'white',
          position: 'relative',
          gap: 2,
          px: 1,
        }}
      >
        {rooms?.data.map((room) => (
          <VoiceRoomCard room={room} onJoinRoom={onJoinRoom} />
        ))}
      </Box>
    </Scrollbar>
  );
}
