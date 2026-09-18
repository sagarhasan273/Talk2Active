// src/sections/section-voice/voice-room-card/types.ts

import type { RoomResponse } from 'src/types/type-chat';

export interface ParticipantUser {
  id?: string;
  userId?: string;
  name: string;
  profilePhoto?: string | null;
  verified?: boolean;
  accountType?: string;
  level?: string;
}

export type VoiceRoomCardProps = {
  roomData: RoomResponse;
  onJoinRoom: (room: RoomResponse) => void;
};
