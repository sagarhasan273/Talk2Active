import type { PayloadAction } from '@reduxjs/toolkit';
import type { AllRelationsType } from 'src/types/type-social';
import type { UserType, SelectedUserType } from 'src/types/type-user';

import { useMemo, useCallback } from 'react';
import { createSlice } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState } from '../types';

// Define auth state interface
interface UserState {
  user: UserType;
  users: SelectedUserType[];
  friends: AllRelationsType[];
  following: AllRelationsType[];
  follower: AllRelationsType[];
  selectedUser: SelectedUserType;
  isAuthenticated: boolean;
  loading: boolean;
}

// Initial state
const initialState: UserState = {
  user: {} as UserType,
  users: [] as SelectedUserType[],
  friends: [],
  following: [],
  follower: [],
  selectedUser: {} as SelectedUserType,
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
    setUsers: (state, action: PayloadAction<UserState['users']>) => {
      state.users = action.payload;
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
    setSelectedUser: (state, action: PayloadAction<UserState['selectedUser']>) => {
      state.selectedUser = action.payload;
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
  setUsers,
  setFollower,
  setFollowing,
  setFriends,
  logout,
  setAccountLoading,
  setSelectedUser,
} = accountSlice.actions;

// Selectors with proper typing
export const selectAccount = (state: RootState) => state.account.user;
export const selectUsers = (state: RootState) => state.account.users;
export const selectFollower = (state: RootState) => state.account.follower;
export const selectFollowing = (state: RootState) => state.account.following;
export const selectFriends = (state: RootState) => state.account.friends;
export const selectSelectedAccount = (state: RootState) => state.account.selectedUser;
export const selectIsAuthenticated = (state: RootState) => state.account.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.account.loading;

export const useCredentials = () => {
  const dispatch = useDispatch();

  const user = useSelector(selectAccount);
  const selectedUser = useSelector(selectSelectedAccount);
  const follower = useSelector(selectFollower);
  const following = useSelector(selectFollowing);
  const friends = useSelector(selectFriends);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const checkIfFollowing = useCallback(
    (targetUserId: string) => {
      console.log(targetUserId, friends, following);
      if (
        targetUserId &&
        following.map((temp) => temp?.accountDetails?.id).includes(targetUserId)
      ) {
        return true;
      }
      if (targetUserId && friends.map((temp) => temp?.accountDetails?.id).includes(targetUserId)) {
        return true;
      }
      return false;
    },
    [following, friends]
  );

  const memoCredentials = useMemo(
    () => ({
      isAuthenticated,
      user,
      follower,
      following,
      friends,
      selectedUser,
      setAccount: (payload: UserState['user']) => dispatch(setAccount(payload)),
      setFollower: (payload: UserState['follower']) => dispatch(setFollower(payload)),
      setFollowing: (payload: UserState['following']) => dispatch(setFollowing(payload)),
      setFriends: (payload: UserState['friends']) => dispatch(setFriends(payload)),
      setSelectedUser: (payload: UserState['selectedUser']) => dispatch(setSelectedUser(payload)),
      checkIfFollowing,
    }),
    [isAuthenticated, user, follower, following, friends, selectedUser, checkIfFollowing, dispatch]
  );

  return memoCredentials;
};
