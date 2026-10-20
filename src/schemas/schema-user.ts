import { z } from 'zod';
import { DatePreprocessor } from './schema-chat';

const passwordRule = z.string().min(8, { message: 'Password must be at least 8 characters' });

// Main User Schema
export const UserBaseSchema = z.object({
  userId: z.string(),
  genUserId: z.string().regex(/^USR[A-F0-9]{10}$/, {
    message: 'User ID must follow the format USRXXXXXXXXXX',
  }),
  googleId: z.string(),
  username: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters' })
    .max(30, { message: 'Username cannot exceed 30 characters' })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: 'Username can only contain letters, numbers, and underscores',
    })
    .optional(),
  email: z
    .string()
    .email({ message: 'Invalid email address' })
    .min(1, { message: 'Email is required' }),
  profilePhoto: z.string().url({ message: 'Invalid URL for profile photo' }),
  bio: z.string().max(500, { message: 'Bio cannot exceed 500 characters' }),
  name: z
    .string()
    .min(2, { message: 'Full name must be at least 2 characters' })
    .max(100, { message: 'Full name cannot exceed 100 characters' })
    .optional(),
  password: z
    .string()
    .min(1, { message: 'Password is required' })
    .regex(/^\$argon2[id]?d?\$v=\d+\$m=\d+,t=\d+,p=\d+\$[a-zA-Z0-9+/]+\$[a-zA-Z0-9+/]+/, {
      message: 'Password must be a valid Argon2 hash',
    })
    .optional(),
  lastActive: z.union([z.string(), z.date()]).optional(),
  verified: z.boolean(),
  accountType: z.enum(['admin', 'supporter', 'member']),
  follower_count: z.number().int().nonnegative(),
  following_count: z.number().int().nonnegative(),
  friend_count: z.number().int().nonnegative(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
}).strict();

export const UserSchema = UserBaseSchema.omit({
  googleId: true,
  password: true,
});

// Derived Auth & Update Schemas
export const CreateUserSchema = UserBaseSchema.pick({
  username: true,
  email: true,
  name: true,
}).extend({
  password: passwordRule,
});

export const LogInUserSchema = UserBaseSchema.pick({
  email: true,
}).extend({
  password: passwordRule,
});

export const UpdateUserSchema = UserBaseSchema.pick({
  genUserId: true,
  username: true,
  email: true,
  name: true,
  profilePhoto: true,
  bio: true,
})
  .partial()
  .extend({
    userId: z.string(),
  });

export const UserAccountUpdateSchema = UserBaseSchema.pick({
  username: true,
  genUserId: true,
}).extend({
  userId: z.string(),
  password: passwordRule,
  newPassword: z.string().min(8, { message: 'New password must be at least 8 characters' }),
});

// Room & Participant Schemas
export const HostSchema = UserSchema.omit({
  email: true,
  lastActive: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  isFollowing: z.boolean().default(false),
  isBlocked: z.boolean().default(false),
});

export const ParticipantSchema = HostSchema.extend({
  isHost: z.boolean().default(false),
});

export const RoomParticipantSchema = ParticipantSchema.extend({
  joinedAt: DatePreprocessor,
  isSelf: z.boolean().optional().default(false),
});
