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
  socketId: string;
  userId: string;
  name: string;
  kicked?: boolean;
};
