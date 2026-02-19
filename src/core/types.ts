import type { UserType } from 'src/types/type-user';

import type { store } from './store';

// These types will now be inferred correctly from the full state.
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export type UserVoiceStateProps = {
  hasJoined: boolean;
  isMicMuted: boolean;
  isDeafened: boolean;
  volume: number;
  micGain: number;
  isScreenSharing: boolean;
  statue: UserType['status'];
  micError?: string;
};
