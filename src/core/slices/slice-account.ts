import type { PayloadAction } from '@reduxjs/toolkit';
import type { UserType, UsersType } from 'src/types/type-user';

import { createSlice } from '@reduxjs/toolkit';

import type { RootState } from '../types';

// Define auth state interface
interface UserState {
  user: UserType;
  users: UsersType[];
  isAuthenticated: boolean;
  loading: boolean;
}

// Initial state
const initialState: UserState = {
  user: {} as UserType,
  users: [] as UsersType[],
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
    logout: (state) => {
      state.user = {} as UserType;
      state.isAuthenticated = false;
    },
    setAccountLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setAccount, setUsers, logout, setAccountLoading } = accountSlice.actions;

// Selectors with proper typing
export const selectAccount = (state: RootState) => state.account.user;
export const selectUsers = (state: RootState) => state.account.users;
export const selectIsAuthenticated = (state: RootState) => state.account.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.account.loading;
