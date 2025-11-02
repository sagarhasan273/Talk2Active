import type { UserType } from 'src/types/user';
import type { PayloadAction } from '@reduxjs/toolkit';

import { createSlice } from '@reduxjs/toolkit';

import type { RootState } from '../store';

// Define auth state interface
interface UserState {
  user: UserType;
  isAuthenticated: boolean;
  loading: boolean;
}

// Initial state
const initialState: UserState = {
  user: {} as UserType,
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
    logout: (state) => {
      state.user = {} as UserType;
      state.isAuthenticated = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setAccount, logout, setLoading } = accountSlice.actions;

// Selectors with proper typing
export const selectAccount = (state: RootState) => state.account.user;
export const selectIsAuthenticated = (state: RootState) => state.account.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.account.loading;
