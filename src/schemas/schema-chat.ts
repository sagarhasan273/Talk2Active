import { z } from 'zod';

import { LanguageLevelEnum } from 'src/enums/enum-chat';

import { UserSchema } from './schema-user';

export const RoomBaseSchema = z.object({
  topic: z.string().min(1, 'topic is required'),
  welcome_message: z.string().optional().default('Welcome to the room!'),
  languages: z.array(z.string().min(1, 'language is required')),
  level: z.nativeEnum(LanguageLevelEnum),
  max_participants: z.number().int().nonnegative().optional().default(10),
  host: z.string(),
  participants: z
    .array(
      z.object({
        user: z.string(),
        joinedAt: z.string().datetime(),
      })
    )
    .optional()
    .default([]),
  isActive: z.boolean().optional().default(true),
});

// Schema to validate incoming create payloads (timestamps not expected)
export const RoomCreateSchema = RoomBaseSchema.pick({
  topic: true,
  welcome_message: true,
  languages: true,
  level: true,
  max_participants: true,
  host: true,
});

export const RoomUpdateSchema = RoomBaseSchema.pick({
  topic: true,
  welcome_message: true,
  languages: true,
  level: true,
  max_participants: true,
  host: true,
  isActive: true,
})
  .partial()
  .extend({
    roomId: z.string(),
  });

// Schema to validate objects returned from DB (includes mongoose timestamps)
export const RoomResponseSchema = RoomBaseSchema.extend({
  roomId: z.string(),
  host: UserSchema,
  participants: z
    .array(
      z.object({
        user: UserSchema,
        joinedAt: z.string().datetime(),
      })
    )
    .optional()
    .default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const RecentRoomSchema = z.array(
  z.object({
    room: RoomResponseSchema,
    joinedAt: z.string(),
  })
);
