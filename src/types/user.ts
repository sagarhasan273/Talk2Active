import type { z as zod } from 'zod';
import type { Dispatch, SetStateAction } from 'react';
import type {
  UserSchema,
  UserStatusSchema,
  UserProfileFormSchema,
  UserAccountUpdateSchema,
} from 'src/schemas/user';

// ----------------------------------------------------------------------
export type UserType = zod.infer<typeof UserSchema>;
export type UserProfileFormType = zod.infer<typeof UserProfileFormSchema>;
export type UserStatusType = zod.infer<typeof UserStatusSchema>;
export type UserAccountUpdateType = zod.infer<typeof UserAccountUpdateSchema>;

// ----------------------------------------------------------------------

export type UserContextTypes = {
  user: UserType | null;
  loading: boolean;
  setUser: Dispatch<SetStateAction<UserType | null>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
};
