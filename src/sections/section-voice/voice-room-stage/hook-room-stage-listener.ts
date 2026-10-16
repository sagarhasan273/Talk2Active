// src/components/room-unload-listener.tsx (or your hook file path)

import useRoomSounds from '@/hooks/use-room-sounds';
import { SOCKET_EVENTS } from '@/lib/socket-events';
import type { RoomParticipantType } from '@/types/type-room';
import { useEffect } from 'react';
import type { Socket } from 'socket.io-client';

interface UseRoomStageListenerProps {
  socket: Socket | null | undefined;
  roomId?: string | null;
  addParticipantToRoom: (roomId: string, participant: RoomParticipantType) => void;
  removeParticipantFromRoom: (roomId: string, participantId: string) => void;
}

export const useRoomStageListener = ({
  socket,
  roomId,
  addParticipantToRoom,
  removeParticipantFromRoom,
}: UseRoomStageListenerProps) => {
  const { playUserJoin, playUserLeave } = useRoomSounds();

  useEffect(() => {
    if (!socket || !roomId) return;

    // 1. Add Participant on Join
    const handleUserJoin = (data: { roomId: string; participant: RoomParticipantType }) => {
      if (String(data?.roomId) === String(roomId) && data?.participant) {
        addParticipantToRoom(roomId, data.participant);
        playUserJoin();
      }
    };

    // 2. Remove Participant on Leave
    const handleUserLeave = (data: { roomId: string; participantId: string }) => {
      if (String(data?.roomId) === String(roomId) && data?.participantId) {
        removeParticipantFromRoom(roomId, String(data.participantId));
        playUserLeave();
      }
    };

    socket.on(SOCKET_EVENTS.BROADCAST_USER_JOIN, handleUserJoin);
    socket.on(SOCKET_EVENTS.BROADCAST_USER_LEAVE, handleUserLeave);

    return () => {
      socket.off(SOCKET_EVENTS.BROADCAST_USER_JOIN, handleUserJoin);
      socket.off(SOCKET_EVENTS.BROADCAST_USER_LEAVE, handleUserLeave);
    };
  }, [socket, roomId, addParticipantToRoom, removeParticipantFromRoom, playUserJoin, playUserLeave]);
};

export default useRoomStageListener;
