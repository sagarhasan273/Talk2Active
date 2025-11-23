import type { z } from 'zod';
import type { RoomBaseSchema, RoomCreateSchema, RoomResponseSchema } from 'src/schemas/schema-chat';

export type RoomBase = z.infer<typeof RoomBaseSchema>;
export type CreateRoomInput = z.infer<typeof RoomCreateSchema>;
export type RoomResponse = z.infer<typeof RoomResponseSchema>;
