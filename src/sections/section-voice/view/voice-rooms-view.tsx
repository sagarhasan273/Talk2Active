import type { RoomResponse } from 'src/types/type-chat';

import { useState, useEffect } from 'react';

import { Box, Typography } from '@mui/material';

import { useGetRoomsQuery } from 'src/core/apis/api-chat';
import { useSocketContext } from 'src/core/contexts/socket-context';

import VoiceRoomCard from '../voice-room-card';
import { VoiceRoomsEmptyState } from './voice-no-rooms-view';

interface RoomListProps {
  onJoinRoom: (room: RoomResponse) => void;
}

export default function VoiceRoomsView({ onJoinRoom }: RoomListProps) {
  const { on, off } = useSocketContext();

  const [rooms, setRooms] = useState<RoomResponse[]>([]);

  const { data: getRooms } = useGetRoomsQuery(null);

  useEffect(() => {
    const handleBroadcastNewRoom = (data: any) => {
      setRooms((prev) => [data.room, ...prev]);
    };

    const handleBroadcastRemoveRoom = (data: any) => {
      setRooms((prev) => prev.filter((room) => room.id !== data?.roomId));
    };

    off('new-room-created', handleBroadcastNewRoom);
    off('room-remove-from-list', handleBroadcastRemoveRoom);

    on('new-room-created', handleBroadcastNewRoom);
    on('room-remove-from-list', handleBroadcastRemoveRoom);

    return () => {
      off('new-room-created', handleBroadcastNewRoom);
      off('room-remove-from-list', handleBroadcastRemoveRoom);
    };
  }, [on, off]);

  useEffect(() => {
    if (getRooms) {
      setRooms(getRooms?.data || []);
    }
  }, [getRooms]);

  // Loading state
  if (!getRooms) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          minHeight: 400,
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              border: '3px solid',
              borderColor: 'primary.main',
              borderTopColor: 'transparent',
              animation: 'spin 1s linear infinite',
              mx: 'auto',
              mb: 2,
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            }}
          />
          <Typography variant="body1" color="text.secondary">
            Loading rooms...
          </Typography>
        </Box>
      </Box>
    );
  }

  // Empty state
  if (rooms.length === 0) {
    return <VoiceRoomsEmptyState />;
  }

  // Normal room list
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        alignItems: 'stretch',
        justifyContent: 'center',
        flexDirection: 'column',
        color: 'white',
        position: 'relative',
        gap: 2,
        px: { xs: 0, sm: 1 },
      }}
    >
      {rooms.map((room) => (
        <VoiceRoomCard key={room.id} roomData={room} onJoinRoom={onJoinRoom} />
      ))}
    </Box>
  );
}
