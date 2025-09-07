import { CreatePostSchema, MediaSchema, PostResponseSchema, PostSchema, UpdatePostSchema } from "src/schemas/post";
import { z } from "zod";

export interface Post {
  id: string;
  content: string;
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  timestamp: Date;
  likes: number;
  reposts: number;
  comments: Comment[];
  isLiked: boolean;
  isReposted: boolean;
  repostedBy?: {
    name: string;
    username: string;
    timestamp: Date;
  };
  originalPost?: Post;
}

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
export type PostType = z.infer<typeof PostSchema>;
export type CreatePostInput = z.infer<typeof CreatePostSchema>;
export type UpdatePostInput = z.infer<typeof UpdatePostSchema>;
export type PostResponse = z.infer<typeof PostResponseSchema>;
export type Media = z.infer<typeof MediaSchema>;