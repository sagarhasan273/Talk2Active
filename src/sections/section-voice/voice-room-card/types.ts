// src/sections/section-voice/voice-room-card/types.ts

import type { RoomType } from 'src/types/type-chat';

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
  roomData: RoomType;
  onJoinRoom: (room: RoomType) => void;
};
