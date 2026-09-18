
import type { RoomResponse } from 'src/types/type-chat';
import type { FilterState } from '../voice-filter-rooms';

import { useEffect, useMemo, useState } from 'react';

import { Box } from '@mui/material';

import { Scrollbar } from '@/components/scrollbar';
import { useCredentials } from '@/core/slices';

import { useGetRoomsQuery } from 'src/core/apis/api-chat';

import { VoiceRoomCard } from '../voice-room-card';
import { RoomCardCreation } from '../voice-room-card/room-card-creation';

interface RoomListProps {
  query: FilterState;
  onSelectRoom: (room: RoomResponse) => void;
  onCreateRoom: () => void;
}

export default function VoiceRoomlist({
  query,
  onSelectRoom,
  onCreateRoom
}: RoomListProps) {
  const { user } = useCredentials();

  const [rooms, setRooms] = useState<RoomResponse[]>([]);

  const { data: getRooms } = useGetRoomsQuery(null);

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

  useEffect(() => {
    setRooms(getRooms?.data || []);
  }, [getRooms]);

  const sxCard = {
    height: 260,
    minHeight: 250,
    maxHeight: 270,
    maxWidth: 520,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
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
            gap: 1,
            mb: 10,
          }}
        >
          <RoomCardCreation
            onCreateRoom={onCreateRoom}
            sx={sxCard}
          />

          {filteredRooms.map((room) => (
            <VoiceRoomCard
              key={room.roomId}
              roomData={room}
              currentUserId={user.userId}
              onJoinRoom={onSelectRoom}
              sx={sxCard}
            />
          ))}
        </Box>
      </Scrollbar>
    </Box>
  );
}

