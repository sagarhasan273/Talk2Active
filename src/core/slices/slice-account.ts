import type { PayloadAction } from '@reduxjs/toolkit';
import type { AllRelationsType } from 'src/types/type-social';
import type { UserType } from 'src/types/type-user';

import { createSlice } from '@reduxjs/toolkit';
import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState } from '../types';

// Define auth state interface
interface UserState {
  user: UserType;
  friends: AllRelationsType[];
  following: AllRelationsType[];
  follower: AllRelationsType[];

  isAuthenticated: boolean;
  loading: boolean;
}

// Initial state
const initialState: UserState = {
  user: {} as UserType,

  friends: [],
  following: [],
  follower: [],
  isAuthenticated: false,
  loading: false,
};

export const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    setAccount: (state, action: PayloadAction<UserState['user']>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },

    setFriends: (state, action: PayloadAction<UserState['friends']>) => {
      state.friends = action.payload;
    },
    setFollowing: (state, action: PayloadAction<UserState['following']>) => {
      state.following = action.payload;
    },
    setFollower: (state, action: PayloadAction<UserState['follower']>) => {
      state.follower = action.payload;
    },

    logout: (state) => {
      state.user = {} as UserType;
      state.isAuthenticated = false;
    },
    setAccountLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setAccount,
  setFollower,
  setFollowing,
  setFriends,
  logout,
  setAccountLoading,
} = accountSlice.actions;

// Selectors with proper typing
export const selectAccount = (state: RootState) => state.account.user;
export const selectFollower = (state: RootState) => state.account.follower;
export const selectFollowing = (state: RootState) => state.account.following;
export const selectFriends = (state: RootState) => state.account.friends;
export const selectIsAuthenticated = (state: RootState) => state.account.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.account.loading;

export const useCredentials = () => {
  const dispatch = useDispatch();

  const user = useSelector(selectAccount);
  const follower = useSelector(selectFollower);
  const following = useSelector(selectFollowing);
  const friends = useSelector(selectFriends);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const followingIds = useMemo(
    () =>
      new Set([
        ...following.map((f) => f?.accountDetails?.userId),
        ...friends.map((f) => f?.accountDetails?.userId),
      ]),
    [following, friends]
  );

  const checkIfFollowing = useCallback(
    (targetUserId: string) => followingIds.has(targetUserId),
    [followingIds]
  );

  const memoCredentials = useMemo(
    () => ({
      isAuthenticated,
      user,
      follower,
      following,
      friends,
      setAccount: (payload: UserState['user']) => dispatch(setAccount(payload)),
      setFollower: (payload: UserState['follower']) => dispatch(setFollower(payload)),
      setFollowing: (payload: UserState['following']) => dispatch(setFollowing(payload)),
      setFriends: (payload: UserState['friends']) => dispatch(setFriends(payload)),
      checkIfFollowing,
    }),
    [isAuthenticated, user, follower, following, friends, checkIfFollowing, dispatch]
  );

  return memoCredentials;
};
