import type { UserType } from 'src/types/type-user';

export type AuthState = {
  authUser: UserType;
  loading: boolean;
};

export type AuthContextValue = {
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  loadCredentials: (user: UserType) => void;
  unloadCredentials: () => void;
  checkUserSession?: () => Promise<void>;
};
