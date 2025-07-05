export type UserType = Record<string, any> | null;

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
