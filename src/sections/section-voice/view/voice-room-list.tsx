
import type { RoomResponse } from 'src/types/type-chat';
import type { FilterState } from '../voice-filter-rooms';

import { useState, useEffect, useMemo } from 'react';

import { Box } from '@mui/material';

import { useCredentials } from '@/core/slices';
import { Scrollbar } from '@/components/scrollbar';

import { useGetRoomsQuery } from 'src/core/apis/api-chat';

import { VoiceRoomsEmptyState } from './voice-room-empty';
import { VoiceRoomCard, RoomCardCreation } from '../voice-room-card';

interface RoomListProps {
  query: FilterState;
  onJoinRoom: (room: RoomResponse) => void;
}

export default function VoiceRoomlist({
  onJoinRoom,
  query,
}: RoomListProps) {
  const { user } = useCredentials();

  const [rooms, setRooms] = useState<RoomResponse[]>([]);

  const { data: getRooms } = useGetRoomsQuery(null);

  useEffect(() => {
    setRooms(getRooms?.data || []);
  }, [getRooms]);

  const filteredRooms = useMemo(() => {
    const search = query.searchQuery.trim().toLowerCase();

    return rooms.filter((room) => {
      const matchesSearch =
        !search ||
        room.topic.toLowerCase().includes(search);

      const matchesLanguage =
        query.selectedLanguage === 'all' ||
        room.languages.includes(query.selectedLanguage);

      const matchesLevel =
        query.selectedLevel === 'all' ||
        room.level === query.selectedLevel;

      const matchesCapacity =
        !query.hideFullRooms ||
        room.participants.length < room.max_participants;

      const matchesActive =
        !query.showActiveOnly ||
        room.isActive;

      return (
        matchesSearch &&
        matchesLanguage &&
        matchesLevel &&
        matchesCapacity &&
        matchesActive
      );
    });
  }, [rooms, query]);

  if (filteredRooms.length === 0) {
    return <VoiceRoomsEmptyState />;
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        overflow: 'hidden',
      }}
    >
        <Scrollbar sx={{ height: 1 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              alignItems: 'stretch',
              justifyContent: 'center',
              position: 'relative',
              gap: 2,
              mb: 10,
            }}
          >
            <RoomCardCreation
              onCreateRoom={() => {
                const createRoomEvent = new CustomEvent('create-room', {
                  bubbles: true,
                  cancelable: true,
                });

                window.dispatchEvent(createRoomEvent);
              }}
            />

            {filteredRooms.map((room) => (
              <VoiceRoomCard
                key={room.roomId}
                roomData={room}
                currentUserId={user.userId}
                onJoinRoom={onJoinRoom}
              />
            ))}
          </Box>
        </Scrollbar>
      </Box>
  );
}

