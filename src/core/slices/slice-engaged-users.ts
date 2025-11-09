import type { PayloadAction } from '@reduxjs/toolkit';
import type { PostResponseType } from 'src/types/post';

import { createSlice } from '@reduxjs/toolkit';

import type { RootState } from '../store';

// Define auth state interface
interface UsersState {
  users: PostResponseType[];
  loading: boolean;
}

// Initial state
const initialState: UsersState = {
  users: [] as PostResponseType[],
  loading: false,
};

export const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<UsersState['users']>) => {
      state.users = action.payload;
    },
    setUsersLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setUsers, setUsersLoading } = usersSlice.actions;

// Selectors with proper typing
export const selectUsers = (state: RootState) => state.users.users;
export const selectUsersLoading = (state: RootState) => state.users.loading;
