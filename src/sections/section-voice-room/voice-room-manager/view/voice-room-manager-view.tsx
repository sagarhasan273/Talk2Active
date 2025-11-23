import type { RoomResponse } from 'src/types/type-chat';

import React from 'react';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';

import { useRouter } from 'src/routes/route-hooks';

import { selectAccount } from 'src/core/slices';
import { useJoinRoomMutation } from 'src/core/apis';
import { setRoom } from 'src/core/slices/slice-room';

import { VoiceRoomList } from '../../voice-room-list';

export const VoiceRoomManager: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const user = useSelector(selectAccount);

  const [joinRoom] = useJoinRoomMutation();

  const handleJoinRoom = async (room: RoomResponse) => {
    const response = await joinRoom({ roomId: room.id, userId: user.id }).unwrap();
    if (response.status) {
      dispatch(setRoom(room));
      router.push(`/voice-room/${room.id}`);
      toast.success('Joined the room successfully');
    }
  };

  return <VoiceRoomList onJoinRoom={handleJoinRoom} />;
};
