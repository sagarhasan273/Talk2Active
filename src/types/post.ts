import type { z } from 'zod';
import type {
  PostSchema,
  MediaSchema,
  CreatePostSchema,
  UpdatePostSchema,
  PostResponseSchema,
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

export interface UserProfile {
  name: string;
  username: string;
  avatar: string;
  bio: string;
  location: string;
  website: string;
  joinDate: Date;
  followers: number;
  following: number;
  posts: number;
  verified: boolean;
  coverImage: string;
}

// Type definitions
export type Post = z.infer<typeof PostSchema>;
export type CreatePostInput = z.infer<typeof CreatePostSchema>;
export type UpdatePostInput = z.infer<typeof UpdatePostSchema>;
export type PostResponseType = z.infer<typeof PostResponseSchema>;
export type Media = z.infer<typeof MediaSchema>;
