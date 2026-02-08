import type { z } from 'zod';
import type { RelationshipTypeEnum, RelationshipStatusEnum } from 'src/enums/enum-social';
import type {
  UserStatsSchema,
  RelationshipSchema,
  RelationshipListSchema,
  CreateRelationshipSchema,
  UpdateRelationshipSchema,
  RelationshipResponseSchema,
  BatchRelationshipStatusSchema,
} from 'src/schemas/schema-social';

import type { UserType } from './type-user';

// Types for TypeScript
export type RelationshipType = z.infer<typeof RelationshipSchema>;
export type RelationshipInput = z.infer<typeof CreateRelationshipSchema>;
export type FollowRequestInput = z.infer<typeof CreateRelationshipSchema>;
export type UpdateRelationship = z.infer<typeof UpdateRelationshipSchema>;
export type RelationshipResponse = z.infer<typeof RelationshipResponseSchema>;
export type UserStats = z.infer<typeof UserStatsSchema>;
export type RelationshipListResponse = z.infer<typeof RelationshipListSchema>;
export type BatchRelationshipStatus = z.infer<typeof BatchRelationshipStatusSchema>;
export type RelationshipStatusEnumProps =
  (typeof RelationshipStatusEnum)[keyof typeof RelationshipStatusEnum];
export type RelationshipTypeEnumProps =
  (typeof RelationshipTypeEnum)[keyof typeof RelationshipTypeEnum];
export type AuthorRelationship = {
  relationship: 'following' | 'followers' | 'friends' | 'blocked' | 'pending' | 'none';
  following: boolean;
  followers: boolean;
  friends: boolean;
  blocked: boolean;
  pending: boolean;
};
export type AllRelationsType = {
  accountDetails: UserType;
  latestMessage: {
    _id: string;
    text: string;
    time: string;
    createdAt: string;
  } | null;
  relation: 'friend' | 'following' | 'follower';
  status: RelationshipStatusEnumProps;
  type: RelationshipTypeEnumProps;
};
