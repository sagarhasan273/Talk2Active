import type { Room } from 'src/types/room';

import React, { useState } from 'react';

import { VoiceRoomList } from '../../voice-room-list';
import { VoiceRoomChat } from '../../voice-room-chat';

export const VoiceRoomManager: React.FC = () => {
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);

  const handleJoinRoom = (room: Room) => {
    setCurrentRoom(room);
  };

  const handleLeaveRoom = () => {
    setCurrentRoom(null);
  };

  return (
    <>
      {currentRoom ? (
        <VoiceRoomChat room={currentRoom} onLeaveRoom={handleLeaveRoom} />
      ) : (
        <VoiceRoomList onJoinRoom={handleJoinRoom} />
      )}
    </>
  );
};
