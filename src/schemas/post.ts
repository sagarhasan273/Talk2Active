import { z } from 'zod';

import { PostTagsEnum } from 'src/enums/post';

// Media Schema
export const MediaSchema = z.object({
  type: z.enum(['image', 'images', 'gif', 'youtube', 'video', 'caption', 'quote']).default('quote'),
  urls: z.array(z.string().url()).default([]).optional(),
  content: z
    .string()
    .min(1, 'Content cannot be empty')
    .max(500, 'Content cannot exceed 500 characters')
    .trim()
    .optional(),
  authorName: z.string().default('').optional(),
  videoUrl: z.string().url().default('').optional(),
});

// Engagement Schema
export const EngagementSchema = z.object({
  likes: z.number().int().nonnegative().default(0),
  dislikes: z.number().int().nonnegative().default(0),
  pins: z.number().int().nonnegative().default(0),
});

// Main Post Schema
export const PostSchema = z.object({
  author: z.string(),
  media: MediaSchema.default({ type: 'quote', urls: [], content: '' }),
  tags: z
    .array(z.enum(Object.values(PostTagsEnum) as [string, ...string[]]))
    .max(30, 'Cannot have more than 30 tags')
    .default([]),
  engagement: EngagementSchema.default({ likes: 0, dislikes: 0, pins: 0 }),
  isDeleted: z.boolean().default(false),
  deletedAt: z.date().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

// Schema for creating a new post (excludes auto-generated fields)
export const CreatePostSchema = PostSchema.omit({
  engagement: true,
  isDeleted: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
});

// Schema for updating a post
export const UpdatePostSchema = PostSchema.partial().extend({
  postId: z.string(),
});

// Schema for API response (transformed data)
export const PostResponseSchema = PostSchema.omit({
  author: true,
  isDeleted: true,
  deletedAt: true,
  updatedAt: true,
}).extend({
  id: z.string(),
  isLiked: z.boolean().default(false),
  isDisliked: z.boolean().default(false),
  isPinned: z.boolean().default(false),
  authorDetails: z
    .object({
      _id: z.string(),
      username: z.string(),
      name: z.string().optional(),
      profilePhoto: z.string().url().optional(),
      verified: z.boolean().default(false),
    })
    .optional(),
});
