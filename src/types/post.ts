import type { z } from 'zod';
import type {
  PostSchema,
  MediaSchema,
  CreatePostSchema,
  UpdatePostSchema,
  PostResponseSchema,
  GetPostsByUserIdSchemaInput,
} from 'src/schemas/schema-post';

export interface Comment {
  id: string;
  content: string;
  author: {
    name: string;
    username: string;
  };
  timestamp: Date;
}

// Type definitions
export type Post = z.infer<typeof PostSchema>;
export type CreatePostInput = z.infer<typeof CreatePostSchema>;
export type UpdatePostInput = z.infer<typeof UpdatePostSchema>;
export type PostResponseType = z.infer<typeof PostResponseSchema>;
export type GetPostsByUserIdInput = z.infer<typeof GetPostsByUserIdSchemaInput>;
export type Media = z.infer<typeof MediaSchema>;
