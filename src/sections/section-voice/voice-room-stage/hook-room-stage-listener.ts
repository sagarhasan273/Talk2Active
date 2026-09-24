import type { RoomParticipantType } from '@/types/type-room';
import { useEffect } from 'react';
import type { Socket } from 'socket.io-client';

const SOCKET_EVENTS = {
  BROADCAST_USER_JOIN: 'broadcart_user_join',
  BROADCAST_USER_LEAVE: 'broadcart_user_leave',
} as const;

interface UseRoomStageListenerProps {
  socket: Socket | null | undefined;
  roomId?: string | null;
  addParticipant: (participant: RoomParticipantType) => void;
  removeParticipant: (participantId: string) => void;
}

export const useRoomStageListener = ({
  socket,
  roomId,
  addParticipant,
  removeParticipant,
}: UseRoomStageListenerProps) => {
  useEffect(() => {
    if (!socket || !roomId) return;

    // 1. Add Participant on Join
    const handleUserJoin = (data: { roomId: string; participant: RoomParticipantType }) => {
      if (String(data?.roomId) === String(roomId) && data?.participant) {
        addParticipant(data.participant);
      }
    };

    // 2. Remove Participant on Leave
    const handleUserLeave = (data: { roomId: string; participantId: string }) => {
      if (String(data?.roomId) === String(roomId) && data?.participantId) {
        removeParticipant(String(data.participantId));
      }
    };

    socket.on(SOCKET_EVENTS.BROADCAST_USER_JOIN, handleUserJoin);
    socket.on(SOCKET_EVENTS.BROADCAST_USER_LEAVE, handleUserLeave);

    return () => {
      socket.off(SOCKET_EVENTS.BROADCAST_USER_JOIN, handleUserJoin);
      socket.off(SOCKET_EVENTS.BROADCAST_USER_LEAVE, handleUserLeave);
    };
  }, [socket, roomId, addParticipant, removeParticipant]);
};

export default useRoomStageListener;
