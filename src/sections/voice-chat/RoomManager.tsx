import type { Room } from 'src/types/room';

import React, { useState } from 'react';

import ChatRoom from './ChatRoom';
import RoomList from './RoomList';

const RoomManager: React.FC = () => {
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
        <ChatRoom room={currentRoom} onLeaveRoom={handleLeaveRoom} />
      ) : (
        <RoomList onJoinRoom={handleJoinRoom} />
      )}
    </>
  );
};

export default RoomManager;
