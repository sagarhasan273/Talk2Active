import type { PayloadAction } from '@reduxjs/toolkit';
import type { UserType, SelectedUserType } from 'src/types/type-user';

import { useMemo } from 'react';
import { createSlice } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState } from '../types';

// Define auth state interface
interface UserState {
  user: UserType;
  users: SelectedUserType[];
  selectedUser: SelectedUserType;
  isAuthenticated: boolean;
  loading: boolean;
}

// Initial state
const initialState: UserState = {
  user: {} as UserType,
  users: [] as SelectedUserType[],
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

export const { setAccount, setUsers, logout, setAccountLoading, setSelectedUser } =
  accountSlice.actions;

// Selectors with proper typing
export const selectAccount = (state: RootState) => state.account.user;
export const selectUsers = (state: RootState) => state.account.users;
export const selectSelectedAccount = (state: RootState) => state.account.selectedUser;
export const selectIsAuthenticated = (state: RootState) => state.account.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.account.loading;

export const useCredentials = () => {
  const dispatch = useDispatch();

  const user = useSelector(selectAccount);
  const selectedUser = useSelector(selectSelectedAccount);

  const memoCredentials = useMemo(
    () => ({
      user,
      selectedUser,
      setAccount: (payload: UserState['user']) => dispatch(setAccount(payload)),
      setSelectedUser: (payload: UserState['selectedUser']) => dispatch(setSelectedUser(payload)),
    }),
    [user, selectedUser, dispatch]
  );

  return memoCredentials;
};
