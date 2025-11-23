import type { PayloadAction } from '@reduxjs/toolkit';
import type { RoomResponse } from 'src/types/type-chat';

import { createSlice } from '@reduxjs/toolkit';

import type { RootState } from '../types';

// Define auth state interface
interface RoomState {
  room: RoomResponse;
  loading: boolean;
}

// Initial state
const initialState: RoomState = {
  room: {} as RoomResponse,
  loading: false,
};

export const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    setRoom: (state, action: PayloadAction<RoomState['room']>) => {
      state.room = action.payload;
    },
    setRoomLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setRoom, setRoomLoading } = roomSlice.actions;

// Selectors with proper typing
export const selectRoom = (state: RootState) => state.room.room;
export const selectRoomLoading = (state: RootState) => state.room.loading;
