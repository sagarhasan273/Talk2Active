import type { LucideIcon } from 'lucide-react';
import type {
  JoinRoomSchema,
  LeaveRoomSchema,
  RoomBaseSchema,
  RoomCreateSchema,
  RoomSchema,
  RoomUpdateSchema,
} from 'src/schemas/schema-chat';
import type { z } from 'zod';

import type { UserType } from './type-user';

export type RoomBase = z.infer<typeof RoomBaseSchema>;
export type CreateRoomInput = z.infer<typeof RoomCreateSchema>;
export type UpdateRoomInput = z.infer<typeof RoomUpdateSchema>;
export type RoomResponse = z.infer<typeof RoomSchema>;
export type JoinRoomInput = z.infer<typeof JoinRoomSchema>;
export type LeaveRoomInput = z.infer<typeof LeaveRoomSchema>;

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
