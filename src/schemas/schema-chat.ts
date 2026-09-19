import { z } from 'zod';

import { LanguageLevelEnum } from 'src/enums/enum-chat';

import { HostSchema, ParticipantSchema, UserSchema } from './schema-user';

export const DatePreprocessor = z.preprocess(
  (arg) => (typeof arg === 'string' || arg instanceof Date ? new Date(arg as any) : arg),
  z.date()
);


// Base participant entry (user can be an unpopulated ObjectId or populated profile)
export const RoomParticipantBaseSchema = z.object({
  user: z.union([z.string(), ParticipantSchema]),
  joinedAt: DatePreprocessor,
  isHost: z.boolean().default(false),

});

// Populated participant entry (specifically returns ParticipantResponseSchema)
export const RoomParticipantSchema = ParticipantSchema.extend({
  joinedAt: DatePreprocessor,
  isHost: z.boolean().default(false),
});

export const RoomBaseSchema = z.object({
  roomId: z.string(),
  room_key: z.string().regex(/^RM[A-F0-9]{10}$/, {
    message: 'Room key must follow the format RMXXXXXXXXXX',
  }),
  topic: z.string().min(1, "name is required"),
  welcome_message: z.string().optional().default('Welcome to the room!'),
  languages: z.array(z.string().min(1, "languages is required")),
  level: z.nativeEnum(LanguageLevelEnum),
  max_participants: z.number().int().nonnegative().optional().default(10),
  host: z.union([z.string(), UserSchema]),
  participants: z.array(RoomParticipantSchema).default([]),
  isActive: z.boolean().optional().default(true),
  kickedUserIds: z.array(z.string()).optional(),

  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Schema to validate incoming create payloads (timestamps not expected)
export const RoomCreateSchema = RoomBaseSchema.pick({
  topic: true,
  welcome_message: true,
  languages: true,
  level: true,
  max_participants: true,
  host: true
});

export const RoomUpdateSchema = RoomBaseSchema.pick({
  topic: true,
  welcome_message: true,
  languages: true,
  level: true,
  max_participants: true,
  host: true,
  isActive: true,
}).partial().extend({
  roomId: z.string()
});

// Schema for populated API DB responses
export const RoomSchema = RoomBaseSchema.extend({
  host: HostSchema,
  participants: z.array(RoomParticipantSchema).default([]),
});

// Stage actions
export const RoomJoinSchema = z.object({
  roomId: z.string(),
  userId: z.string(),
  isHost: z.boolean().optional().default(false),
});

export const RoomLeaveSchema = z.object({
  roomId: z.string(),
  userId: z.string(),
  kicked: z.boolean().optional().default(false),
});


