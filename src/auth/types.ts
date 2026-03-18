import type { UserType } from 'src/types/type-user';
import type { RecentRoomResponse } from 'src/types/type-chat';

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
  loadCredentials: (user: UserType, recentRooms: RecentRoomResponse) => void;
};
