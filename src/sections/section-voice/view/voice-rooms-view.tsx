import type { RoomResponse } from 'src/types/type-chat';

import { useState, useEffect } from 'react';

import { Box } from '@mui/material';

import { useGetRoomsQuery } from 'src/core/apis/api-chat';
import { useSocketContext } from 'src/core/contexts/socket-context';

import { Scrollbar } from 'src/components/scrollbar';

import VoiceRoomCard from '../voice-room-card';

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

    off('new-room-created', handleBroadcastNewRoom);
    on('new-room-created', handleBroadcastNewRoom);

    return () => off('new-room-created', handleBroadcastNewRoom);
  }, [on, off]);

  useEffect(() => {
    if (getRooms) {
      setRooms(getRooms?.data || []);
    }
  }, [getRooms]);

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
        {rooms.map((room) => (
          <VoiceRoomCard key={room.id} room={room} onJoinRoom={onJoinRoom} />
        ))}
      </Box>
    </Scrollbar>
  );
}
