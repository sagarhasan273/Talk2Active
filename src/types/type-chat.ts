import type { z } from 'zod';
import type { LucideIcon } from 'lucide-react';
import type {
  RoomBaseSchema,
  RecentRoomSchema,
  RoomCreateSchema,
  RoomResponseSchema,
} from 'src/schemas/schema-chat';

import type { UserType } from './type-user';

export type RoomBase = z.infer<typeof RoomBaseSchema>;
export type CreateRoomInput = z.infer<typeof RoomCreateSchema>;
export type RoomResponse = z.infer<typeof RoomResponseSchema>;
export type RecentRoomResponse = z.infer<typeof RecentRoomSchema>;

export interface ChatUserStatus {
  name: UserType['status'];
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
