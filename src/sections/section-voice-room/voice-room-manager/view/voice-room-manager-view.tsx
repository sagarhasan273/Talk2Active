import type { RoomResponse } from 'src/types/type-chat';

import React from 'react';
import { useDispatch } from 'react-redux';

import { useRouter } from 'src/routes/route-hooks';

import { setRoom } from 'src/core/slices/slice-room';

import { VoiceRoomList } from '../../voice-room-list';

export const VoiceRoomManager: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleJoinRoom = async (room: RoomResponse) => {
    dispatch(setRoom(room));
    router.push(`/voice-room/${room.id}`);
  };

  return <VoiceRoomList onJoinRoom={handleJoinRoom} />;
};
