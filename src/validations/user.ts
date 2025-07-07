import { z as zod } from 'zod';

export const UserSchema = zod
  .object({
    _id: zod.string().optional(), // Optional for creation, required for updates
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
    followersCount: zod.number().int().nonnegative().optional(),
    followingCount: zod.number().int().nonnegative().optional(),
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
  })
  .strict(); // Using strict() to prevent unknown fields

// Type for TypeScript
export type UserType = zod.infer<typeof UserSchema>;

// Then create a subset schema for the form
export const UserProfileFormSchema = UserSchema.pick({
  _id: true,
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

export const UserStatusSchema = UserSchema.required({
  _id: true,
  status: true,
});

export type UserProfileFormType = zod.infer<typeof UserProfileFormSchema>;
export type UserStatusType = zod.infer<typeof UserStatusSchema>;
