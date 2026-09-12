import type { RoomResponse } from 'src/types/type-chat';

export type ParticipantUser = {
  id: string;
  name: string;
  profilePhoto: string | null;
  verified: boolean;
  accountType?: any;
  status?: string;
  username?: string;
};

export type Participant = {
  user: ParticipantUser;
  joinedAt: string;
};

export type VoiceRoomCardProps = {
  roomData: RoomResponse;
  onJoinRoom: (room: RoomResponse) => void;
};
