import type { Dispatch, SetStateAction } from 'react';
import type {
  UserAccountUpdateSchema,
  UserSchema,
} from 'src/schemas/schema-user';
import type { z as zod } from 'zod';

// ----------------------------------------------------------------------
export type UserType = zod.infer<typeof UserSchema>;

export type UserAccountUpdateType = zod.infer<typeof UserAccountUpdateSchema>;

// ----------------------------------------------------------------------

export type UserContextTypes = {
  user: UserType | null;
  loading: boolean;
  setUser: Dispatch<SetStateAction<UserType | null>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
};
