import type { RoomParticipantType, RoomType } from '@/types/type-room';
import type { PayloadAction } from '@reduxjs/toolkit';

import { createSlice } from '@reduxjs/toolkit';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState } from '../types';

interface RoomState {
  roomId: null | string;
  room: null | RoomType;
  loading: boolean;
  participants: { [userId: string]: RoomParticipantType };
  isUnreadRoomMessage: boolean;
}

// Initial state
const initialState: RoomState = {
  roomId: null,
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
      if (action.payload?.roomId) {
        state.roomId = action.payload.roomId
        state.room = action.payload;
      }

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

    resetRoom: (state) => {
      state.roomId = null;
      state.room = null;
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
  resetRoom,
} = roomSlice.actions;

export const selectRoom = (state: RootState) => state.room.room;
export const selectRoomLoading = (state: RootState) => state.room.loading;
export const selectParticipants = (state: RootState) => state.room.participants;
export const selectisUnreadRoomMessage = (state: RootState) => state.room.isUnreadRoomMessage;

export const useRoomTools = () => {
  const dispatch = useDispatch();

  const roomId = useSelector((state: RootState) => state.room.roomId);
  const room = useSelector(selectRoom);
  const loading = useSelector(selectRoomLoading);
  const participants = useSelector(selectParticipants);
  const isUnreadRoomMessage = useSelector(selectisUnreadRoomMessage);


  const memoizedRoom = useMemo(
    () => ({
      roomId,
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
      resetRoom: () => dispatch(resetRoom()),
    }),
    [
      roomId,
      room,
      loading,
      participants,
      isUnreadRoomMessage,
    ]
  );

  return memoizedRoom;
};
