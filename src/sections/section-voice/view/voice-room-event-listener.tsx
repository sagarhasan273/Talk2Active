// src/components/voice-room-event-listener.tsx

import { useGetRoomsQuery } from '@/core/apis';
import { useSocket } from '@/core/contexts/app-context/context-socket';
import { useRoomTools } from '@/core/slices';
import { SOCKET_EVENTS } from '@/lib/socket-events';
import { RoomParticipantType, RoomType } from '@/types/type-room';

import React, { useEffect } from 'react';

export const VoiceRoomEventListener: React.FC = () => {
  const { socket } = useSocket();

  const { addRoom, updateRoom, addParticipantToRoom, removeParticipantFromRoom } = useRoomTools();
  

  useGetRoomsQuery(null);

  useEffect(() => {
    if (!socket) return;

    const handleNewRoom = (data: { room: RoomType }) => {
      if (data?.room) {
        addRoom(data.room);
      }
    };

    const handleRoomUpdate = (data: { room: RoomType }) => {
      if (data?.room) {
        updateRoom(data.room);
      }
    };

    const handleUserJoin = (data: {
      roomId: string;
      participant: RoomParticipantType;
    }) => {
      try {
        if (data?.roomId && data?.participant) {
          addParticipantToRoom(data.roomId, data.participant);
        }
      } catch (e) {
        console.error('Failed to update room participants on join:', e);
      }
    };

    const handleUserLeave = (data: { roomId: string; participantId: string }) => {
      try {
        if (data?.roomId && data?.participantId) {
          removeParticipantFromRoom(data.roomId, String(data.participantId));
        }
      } catch (e) {
        console.error('Failed to handle participant leave:', e);
      }
    };

    socket.on(SOCKET_EVENTS.BROADCAST_NEW_ROOM, handleNewRoom);
    socket.on(SOCKET_EVENTS.BROADCAST_ROOM_UPDATE, handleRoomUpdate);
    socket.on(SOCKET_EVENTS.BROADCAST_USER_JOIN, handleUserJoin);
    socket.on(SOCKET_EVENTS.BROADCAST_USER_LEAVE, handleUserLeave);

    return () => {
      socket.off(SOCKET_EVENTS.BROADCAST_NEW_ROOM, handleNewRoom);
      socket.off(SOCKET_EVENTS.BROADCAST_ROOM_UPDATE, handleRoomUpdate);
      socket.off(SOCKET_EVENTS.BROADCAST_USER_JOIN, handleUserJoin);
      socket.off(SOCKET_EVENTS.BROADCAST_USER_LEAVE, handleUserLeave);
    };
  }, [socket, addRoom, addParticipantToRoom, removeParticipantFromRoom]);

  // This component acts purely as a background logic container, so it renders nothing
  return null;
};

export default VoiceRoomEventListener;
