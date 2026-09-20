import type { PayloadAction } from '@reduxjs/toolkit';
import type { RoomParticipantType, RoomType } from 'src/types/type-chat';

import { createSlice } from '@reduxjs/toolkit';
import { useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState } from '../types';

// Define auth state interface
interface RoomState {
  room: null | RoomType;
  loading: boolean;
  participants: { [userId: string]: RoomParticipantType };
  isUnreadRoomMessage: boolean;
}

// Initial state
const initialState: RoomState = {
  room: null,
  loading: false,
  participants: {} as { [userId: string]: RoomParticipantType },
  isUnreadRoomMessage: false,
};

export const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    setRoom: (state, action: PayloadAction<RoomState['room']>) => {
      state.room = action.payload;

      if (action.payload?.participants) {
        action.payload.participants.forEach(participant => {
          state.participants[participant.userId] = participant;
        });
      }
    },

    setRoomLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    addParticipant: (state, action: PayloadAction<RoomParticipantType>) => {
      state.participants[action.payload.userId] = action.payload;
    },

    updateParticipant: (state, action: PayloadAction<Partial<RoomParticipantType>>) => {
      if (!action.payload?.userId) {
        return;
      }

      state.participants[action.payload.userId] = {
        ...state.participants[action.payload.userId],
        ...action.payload,
      };
    },



    removeParticipant: (state, action: PayloadAction<string>) => {
      if (!state.participants[action.payload]) {
        let removeUserId = null;
        Object.values(state.participants).forEach((participant) => {
          if (participant.userId === action.payload) {
            removeUserId = participant.userId;
          }
        });
        if (removeUserId) delete state.participants[removeUserId];
      }
      if (action.payload) delete state.participants[action.payload];
    },

    resetParticipants: (state) => {
      state.participants = {};
    },
  },
});

const {
  setRoom,
  setRoomLoading,
  addParticipant,
  updateParticipant,
  removeParticipant,
  resetParticipants,
} = roomSlice.actions;

// Selectors with proper typing
const selectRoom = (state: RootState) => state.room.room;
const selectRoomLoading = (state: RootState) => state.room.loading;
const selectParticipants = (state: RootState) => state.room.participants;
const selectisUnreadRoomMessage = (state: RootState) => state.room.isUnreadRoomMessage;

export const useRoomTools = () => {
  const dispatch = useDispatch();

  const room = useSelector(selectRoom);
  const loading = useSelector(selectRoomLoading);
  const participants = useSelector(selectParticipants);
  const isUnreadRoomMessage = useSelector(selectisUnreadRoomMessage);

  const setTimeOutRef = useRef<ReturnType<typeof setTimeout>>();

  const memoizedRoom = useMemo(
    () => ({
      room,
      loading,
      participants,
      isUnreadRoomMessage,
      setRoom: (roomData: RoomType | null) => dispatch(setRoom(roomData)),
      setRoomLoading: (isLoading: boolean) => dispatch(setRoomLoading(isLoading)),
      addParticipant: (participant: RoomParticipantType) => dispatch(addParticipant(participant)),
      updateParticipant: (participant: Partial<RoomParticipantType>) =>
        dispatch(updateParticipant(participant)),
      removeParticipant: (userId: string) => dispatch(removeParticipant(userId)),
      resetParticipants: () => dispatch(resetParticipants()),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      room,
      loading,
      participants,
      isUnreadRoomMessage,
    ]
  );

  useEffect(
    () => () => {
      if (setTimeOutRef.current) {
        clearTimeout(setTimeOutRef.current);
      }
    },
    []
  );

  return memoizedRoom;
};
