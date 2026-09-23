import type { ConnectionState, LocalParticipant, Participant, RemoteParticipant } from 'livekit-client';
import type { LucideIcon } from 'lucide-react';
import type {
  RoomCreateSchema,
  RoomJoinSchema,
  RoomLeaveSchema,
  RoomParticipantSchema,
  RoomSchema,
  RoomUpdateSchema
} from 'src/schemas/schema-chat';
import type { z } from 'zod';


import type { UserType } from './type-user';

export type RoomType = z.infer<typeof RoomSchema>;
export type RoomParticipantType = z.infer<typeof RoomParticipantSchema>;
export type CreateRoomInput = z.infer<typeof RoomCreateSchema>;
export type UpdateRoomInput = z.infer<typeof RoomUpdateSchema>;
export type RoomJoinInput = z.infer<typeof RoomJoinSchema>;
export type RoomLeaveInput = z.infer<typeof RoomLeaveSchema>;

export interface ChatUserStatus {
  name: string;
  label: string;
  icon: LucideIcon;
  color:
  | 'success.main'
  | 'error.light'
  | 'yellow.main'
  | 'orange.main'
  | 'stone.main'
  | 'stone.dark';
  bgColor: 'success' | 'error' | 'yellow' | 'orange' | 'stone' | 'stone';
  bgColorChannel:
  | 'mainChannel'
  | 'lightChannel'
  | 'lighterChannel'
  | 'darkChannel'
  | 'darkerChannel';
}

export type JoinRoomUserInput = {
  roomId: string;
  socketId: string;
  userId: string;
  name: string;
  profilePhoto: string;
  isMuted: boolean;
  status: string;
  userType: 'host' | 'guest';
  verified: UserType['verified'];
  accountType: UserType['accountType'];
};

export type LeaveRoomUserInput = {
  roomId: string;
  userId: string;
  kicked?: boolean;
};

export interface ParticipantMetadataType {
  name?: string;
  username?: string;
  verified?: boolean;
  profilePhoto?: string;
  genUserId?: string;
  accountType?: 'user' | 'creator' | 'admin' | 'guest' | string;
  isHost?: boolean;
  status?: 'online' | 'busy' | 'brb' | 'afk' | 'zzz' | 'offline' | string;
  [key: string]: unknown;
}

export type ParticipantRoomRole = 'host' | 'co-host' | 'speaker' | 'listener';

export type ParticipantAudioState = 'speaking' | 'unmuted' | 'muted' | 'listening';

export type ParticipantStageType = {
  // Identifiers
  id: string;
  userId: string;
  genUserId?: string;

  // Profile & Details
  name: string;
  username: string;
  profilePhoto: string;
  verified: boolean;
  accountType?: UserType['accountType'];
  status?: string;
  joinedAt: string,
  bio?: string,

  // Room State & Permissions
  role: ParticipantRoomRole;
  isHost: boolean;
  isSelf: boolean;
  handRaised: boolean;
  activeReactionEmoji: string | null;

  audioState?: ParticipantAudioState;
  isSpeaking?: boolean;
  connectionStatus?: ConnectionState;
  hasJoin?: boolean;

  isFollowing: boolean;
  isBlocked: boolean;
  follower_count: number,
  following_count: number,
  friend_count: number,

  rawParticipant: Participant | RemoteParticipant | LocalParticipant;
}

export interface ChatReaction {
  emoji: string;
  count: number;
  reactedBySelf?: boolean;
}

export interface ChatMessage {
  id: string;
  authorId: string;
  authorName: string;
  avatarUrl?: string;
  text: string;
  imageUrl?: string;
  timestamp: string;
  editedAt?: string;
  replyToId?: string;
  isSelf?: boolean;
  privateTo?: { id: string; name: string };
  reactions?: ChatReaction[];
}
