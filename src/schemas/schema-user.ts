import { z as zod } from 'zod';

import { PostTagsEnum } from 'src/enums/enum-post';

import { RelationshipWithUserSchema } from './schema-social';

export const UserSchema = zod
  .object({
    id: zod.string(),
    userId: zod.string().regex(/^USR\d{6}\d{4}$/, {
      message: 'User ID must follow the format USRYYYYMMDDCOUNTER',
    }),
    username: zod
      .string()
      .min(3, { message: 'Username must be at least 3 characters' })
      .max(30, { message: 'Username cannot exceed 30 characters' })
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: 'Username can only contain letters, numbers, and underscores',
      }),
    email: zod
      .string()
      .email({ message: 'Invalid email address' })
      .min(1, { message: 'Email is required' }),
    profilePhoto: zod.string().url({ message: 'Invalid URL for profile photo' }).optional(),
    coverPhoto: zod.string().url({ message: 'Invalid URL for cover photo' }).optional(),
    bio: zod.string().max(500, { message: 'Bio cannot exceed 500 characters' }).optional(),
    name: zod
      .string()
      .min(2, { message: 'Full name must be at least 2 characters' })
      .max(100, { message: 'Full name cannot exceed 100 characters' })
      .optional(),
    dateOfBirth: zod
      .date()
      .max(new Date(), { message: 'Date of birth cannot be in the future' })
      .optional(),
    gender: zod.enum(['male', 'female', 'other', 'prefer-not-to-say', '']).optional(),
    joinDate: zod
      .union([
        zod.string().datetime(), // ISO 8601 string
        zod.date(),
      ])
      .transform((val) => new Date(val))
      .optional(),
    lastActive: zod
      .union([
        zod.string().datetime(), // ISO 8601 string
        zod.date(),
      ])
      .transform((val) => new Date(val))
      .optional(), // Should be set server-side
    // Add createdAt and updatedAt to handle those fields
    createdAt: zod
      .union([zod.string().datetime(), zod.date()])
      .transform((val) => new Date(val))
      .optional(),

    updatedAt: zod
      .union([zod.string().datetime(), zod.date()])
      .transform((val) => new Date(val))
      .optional(),
    status: zod.enum(['online', 'offline', 'busy', 'brb', 'afk', 'zzz']).optional(),
    verified: zod.boolean().optional(),
    accountActive: zod.boolean().optional(),
    sessionTimeOut: zod.number().int().nonnegative().optional(),
    followerCount: zod.number().int().nonnegative(),
    friendCount: zod.number().int().nonnegative(),
    followingCount: zod.number().int().nonnegative(),
    profileVisibility: zod.enum(['public', 'private', 'friends-only']).default('public'),
    allowMessagesFrom: zod.enum(['everyone', 'friends', 'no-one']).default('everyone'),
    showActivityStatus: zod.boolean().default(true),
    showReadReceipts: zod.boolean().default(true),
    showLastSeen: zod.boolean().default(true),
    postCount: zod.number().int().nonnegative().optional(),
    location: zod
      .string()
      .max(100, { message: 'Location cannot exceed 100 characters' })
      .optional(),
    website: zod.string().url({ message: 'Invalid website URL' }).or(zod.literal('')).optional(),
    socialLinks: zod
      .object({
        facebook: zod
          .string()
          .url({ message: 'Invalid Facebook URL' })
          .or(zod.literal(''))
          .optional(),
        twitter: zod
          .string()
          .url({ message: 'Invalid Twitter URL' })
          .or(zod.literal(''))
          .optional(),
        instagram: zod
          .string()
          .url({ message: 'Invalid Instagram URL' })
          .or(zod.literal(''))
          .optional(),
        linkedin: zod
          .string()
          .url({ message: 'Invalid LinkedIn URL' })
          .or(zod.literal(''))
          .optional(),
      })
      .optional(),

    // Notification types
    pushNotification: zod.boolean(),
    smsNotification: zod.boolean(),
    likesNotification: zod.boolean(),
    repostNotification: zod.boolean(),
    commentsNotification: zod.boolean(),
    newFollowersNotification: zod.boolean(),

    directMessage: zod.boolean(),
    roomInvitations: zod.boolean(),
    liveEvents: zod.boolean(),

    soundNotification: zod.boolean(),
    vibrationForNotification: zod.boolean(),

    // Appearance types
    primaryColor: zod.enum(['blue', 'cyan', 'orange', 'purple', 'red']),
    themeMode: zod.boolean(),

    // categories
    tags: zod
      .array(zod.enum(Object.values(PostTagsEnum) as [string, ...string[]]))
      .max(30, 'Cannot have more than 30 tags')
      .default([]),
  })
  .strict(); // Using strict() to prevent unknown fields

// Then create a subset schema for the form
export const UserProfileFormSchema = UserSchema.pick({
  id: true,
  userId: true,
  name: true,
  username: true,
  email: true,
  profilePhoto: true,
  coverPhoto: true,
  accountActive: true,
  bio: true,
  location: true,
  website: true,
  status: true,
});

export const UserStatusSchema = UserSchema.pick({ id: true, status: true }).required({
  id: true,
  status: true,
});

export const UserTagsSchema = UserSchema.pick({ id: true, tags: true }).required({
  id: true,
  tags: true,
});

export const UserAccountUpdateSchema = UserSchema.pick({
  id: true,
  userId: true,
  username: true,
})
  .extend({
    password: zod
      .string()
      .min(1, { message: 'Password is required' })
      .min(8, { message: 'Password must be at least 8 characters!' }),
    newPassword: zod.string().min(8, { message: 'New password must be at least 8 characters!' }),
    confirmNewPassword: zod
      .string()
      .min(8, { message: 'Confirm new password must be at least 8 characters!' }),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });

export const UserAccountActivateUpdateSchema = UserSchema.pick({
  id: true,
  accountActive: true,
});

export const UserAccountSessionUpdateSchema = UserSchema.pick({
  id: true,
  sessionTimeOut: true,
});

export const UsersSchema = UserSchema.pick({
  id: true,
  userId: true,
  name: true,
  username: true,
  email: true,
  profilePhoto: true,
  coverPhoto: true,
  accountActive: true,
  bio: true,
  location: true,
  website: true,
  status: true,
  followerCount: true,
  followingCount: true,
  friendCount: true,
}).extend({
  relationShip: RelationshipWithUserSchema,
});
