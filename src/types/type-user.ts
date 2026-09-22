import type { Dispatch, SetStateAction } from 'react';
import type {
  UserSchema
} from 'src/schemas/schema-user';
import type { z as zod } from 'zod';

// ----------------------------------------------------------------------
export type UserType = zod.infer<typeof UserSchema>;
