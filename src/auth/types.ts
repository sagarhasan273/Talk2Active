import type { UserType } from 'src/types/user';

export type AuthState = {
  authUser: UserType;
  loading: boolean;
};

export type AuthContextValue = {
  authUser: UserType;
  loading: boolean;
  authenticated: boolean;
  unauthenticated: boolean;
  checkUserSession?: () => Promise<void>;
};
