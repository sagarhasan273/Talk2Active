import type { z as zod } from 'zod';
import type { Dispatch, SetStateAction } from 'react';
import type {
  UserSchema,
  UsersSchema,
  UserTagsSchema,
  UserStatusSchema,
  UserProfileFormSchema,
  UserAccountUpdateSchema,
  UserAccountSessionUpdateSchema,
  UserAccountActivateUpdateSchema,
} from 'src/schemas/schema-user';

// ----------------------------------------------------------------------
export type UserType = zod.infer<typeof UserSchema>;
export type UsersType = zod.infer<typeof UsersSchema>;
export type UserProfileFormType = zod.infer<typeof UserProfileFormSchema>;
export type UserStatusType = zod.infer<typeof UserStatusSchema>;
export type UserTagsType = zod.infer<typeof UserTagsSchema>;
export type UserAccountUpdateType = zod.infer<typeof UserAccountUpdateSchema>;
export type UserAccountActivateUpdateType = zod.infer<typeof UserAccountActivateUpdateSchema>;
export type UserAccountSessionUpdateType = zod.infer<typeof UserAccountSessionUpdateSchema>;

// ----------------------------------------------------------------------

export type UserContextTypes = {
  user: UserType | null;
  loading: boolean;
  setUser: Dispatch<SetStateAction<UserType | null>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
};
