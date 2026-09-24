// src/components/room-unload-listener.tsx
import { useSocket } from '@/core/contexts/context-socket';
import { useRoomTools } from '@/core/slices';
import React from 'react';
import useRoomStageListener from './voice-room-stage/hook-room-statge-listener';

interface RoomStageListenerProps {
}

export const RoomStageListener: React.FC<RoomStageListenerProps> = ({
}) => {
  const { socket } = useSocket();
  const { roomId, addParticipant, removeParticipant } = useRoomTools();

  useRoomStageListener({
    socket,
    roomId,
    addParticipant,
    removeParticipant,
  });

  return null;
};