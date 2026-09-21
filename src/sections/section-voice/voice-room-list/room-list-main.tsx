import type { RoomParticipantType, RoomType } from 'src/types/type-chat';
import type { FilterState } from '../voice-filter-rooms';

import { useEffect, useMemo, useState } from 'react';

import { Box } from '@mui/material';

import { Scrollbar } from '@/components/scrollbar';
import { useCredentials } from '@/core/slices';

import { useGetRoomsQuery } from 'src/core/apis/api-chat';

import { useSocket } from '@/core/contexts/socket-context';
import { SOCKET_EVENTS } from '@/lib/socket-events';
import { RoomCardCreation } from './room-list-card-creation';
import { VoiceRoomCard } from './room-list-card-main';

const sxCard = {
  height: 260,
  minHeight: 250,
  maxHeight: 270,
  width: '100%',
  maxWidth: { xs: '100%', sm: 1, md: 520 },
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
};

interface RoomlistMainProps {
  query: FilterState;
  onSelectRoom: (room: RoomType) => void;
  onCreateRoom: () => void;
}

export function RoomlistMain({
  query,
  onSelectRoom,
  onCreateRoom,
}: RoomlistMainProps) {
  const { user } = useCredentials();

  const { socket } = useSocket();

  const [rooms, setRooms] = useState<RoomType[]>([]);

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
    if (!socket) return;

    const handleNewRoom = (data: {
      room: RoomType
    }) => {
      console.log(data);
      if (data.room) {
        setRooms(prev => ([data.room, ...prev]))
      }
    }

    const handleUserJoin = (data: {
      roomId: string,
      participant: RoomParticipantType
    }) => {
      try {
        if (data?.roomId && data?.participant) {
          const newParticipant = data.participant;
          const newParticipantId = newParticipant.userId?.toString();


          setRooms((prev) =>
            prev.map((room) => {
              if (room.roomId !== data.roomId) return room;

              // Prevent adding duplicate participant
              const alreadyExists = room.participants.some((p: RoomParticipantType) => {
                const currentId = p.userId?.toString();
                return currentId === newParticipantId;
              });

              if (alreadyExists) return room;


              return {
                ...room,
                participants: [...room.participants, newParticipant],
              };
            })
          );
        }
      } catch (e) {
        console.error('Failed to update room participants:', e);
      }
    };

    const handleUserLeave = (data: {
      roomId: string,
      participantId: string
    }) => {
      try {
        if (data?.roomId && data?.participantId) {
          const leavingUserId = data.participantId.toString();

          setRooms((prev) =>
            prev
              .map((room) => {
                if (room.roomId !== data.roomId) return room;

                // Remove the specific participant
                const updatedParticipants = (room.participants || []).filter((p: RoomParticipantType) => {
                  const currentId = p.userId?.toString();
                  return currentId !== leavingUserId;
                });

                return {
                  ...room,
                  participants: updatedParticipants,
                };
              })
          );
        }
      } catch (e) {
        console.error('Failed to handle participant leave:', e);
      }
    };

    socket.on(SOCKET_EVENTS.BROADCAST_NEW_ROOM, handleNewRoom);
    socket.on(SOCKET_EVENTS.BROADCAST_USER_JOIN, handleUserJoin);
    socket.on(SOCKET_EVENTS.BROADCAST_USER_LEAVE, handleUserLeave);

    return () => {
      socket.off(SOCKET_EVENTS.BROADCAST_NEW_ROOM, handleNewRoom);
      socket.off(SOCKET_EVENTS.BROADCAST_USER_JOIN, handleUserJoin);
      socket.off(SOCKET_EVENTS.BROADCAST_USER_LEAVE, handleUserLeave);
    };
  }, [socket]);

  useEffect(() => {
    setRooms(getRooms?.data || []);
  }, [getRooms]);

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
            // xs: 1 column taking 100% width; sm+: auto-filling left-aligned columns
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(auto-fill, minmax(340px, 1fr))',
            },
            alignItems: 'stretch',
            justifyContent: 'flex-start', // Keeps cards left-aligned
            position: 'relative',
            gap: 1.5,
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
              currentUserId={user?.userId}
              onJoinRoom={onSelectRoom}
              sx={sxCard}
            />
          ))}
        </Box>
      </Scrollbar>
    </Box>
  );
}
