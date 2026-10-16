// src/components/room-unload-listener.tsx

import { useGetRoomsQuery } from '@/core/apis';
import { useSocket } from '@/core/contexts/context-socket';
import { useRoomTools } from '@/core/slices';
import React from 'react';
import useVoiceRoomListener from './view/hook-voice-room-listener';

interface VoiceRoomListenerProps { }

export const VoiceRoomListener: React.FC<VoiceRoomListenerProps> = () => {
  const { socket } = useSocket();
  const { addRoom, addParticipantToRoom, removeParticipantFromRoom } = useRoomTools();

  useVoiceRoomListener({
    socket,
    addRoom,
    addParticipantToRoom,
    removeParticipantFromRoom,
  });

  useGetRoomsQuery(null);

  return null;
};
