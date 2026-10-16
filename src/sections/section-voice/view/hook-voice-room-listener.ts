// src/hooks/use-voice-room-listener.ts

import { SOCKET_EVENTS } from '@/lib/socket-events';
import type { RoomParticipantType, RoomType } from '@/types/type-room';
import { useEffect } from 'react';
import type { Socket } from 'socket.io-client';

interface UseVoiceRoomListenerProps {
  socket: Socket | null | undefined;
  addRoom: (room: RoomType) => void;
  addParticipantToRoom: (roomId: string, participant: RoomParticipantType) => void;
  removeParticipantFromRoom: (roomId: string, participantId: string) => void;
}

export const useVoiceRoomListener = ({
  socket,
  addRoom,
  addParticipantToRoom,
  removeParticipantFromRoom,
}: UseVoiceRoomListenerProps) => {
  useEffect(() => {
    if (!socket) return;

    // 1. Handle New Room Broadcast
    const handleNewRoom = (data: { room: RoomType }) => {
      if (data?.room) {
        addRoom(data.room);
      }
    };

    // 2. Handle User Join Broadcast (for any room in the list)
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

    // 3. Handle User Leave Broadcast (for any room in the list)
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
    socket.on(SOCKET_EVENTS.BROADCAST_USER_JOIN, handleUserJoin);
    socket.on(SOCKET_EVENTS.BROADCAST_USER_LEAVE, handleUserLeave);

    return () => {
      socket.off(SOCKET_EVENTS.BROADCAST_NEW_ROOM, handleNewRoom);
      socket.off(SOCKET_EVENTS.BROADCAST_USER_JOIN, handleUserJoin);
      socket.off(SOCKET_EVENTS.BROADCAST_USER_LEAVE, handleUserLeave);
    };
  }, [socket, addRoom, addParticipantToRoom, removeParticipantFromRoom]);
};

export default useVoiceRoomListener;
