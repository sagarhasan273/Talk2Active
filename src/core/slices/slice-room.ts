import type { UserType } from 'src/types/type-user';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RoomResponse } from 'src/types/type-chat';
import type { Participant, ChatRoomMessage } from 'src/sections/section-chat-room/type';

import { useMemo } from 'react';
import { createSlice } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState } from '../types';

// Define auth state interface
interface RoomState {
  room: RoomResponse;
  loading: boolean;
  remoteParticipants: { [socketId: string]: Participant };
  chatRoomMessages: ChatRoomMessage[];
  isUnreadChatRoomMessage: boolean;
}

// Initial state
const initialState: RoomState = {
  room: {} as RoomResponse,
  loading: false,
  remoteParticipants: {} as { [socketId: string]: Participant },
  chatRoomMessages: [],
  isUnreadChatRoomMessage: false,
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

    addRemoteParticipant: (state, action: PayloadAction<Participant>) => {
      state.remoteParticipants[action.payload.socketId] = action.payload;
    },

    removeRemoteParticipant: (state, action: PayloadAction<string>) => {
      delete state.remoteParticipants[action.payload];
    },

    updateRemoteParticipantAudio: (
      state,
      action: PayloadAction<{ socketId: string; isMuted: boolean }>
    ) => {
      const participant = state.remoteParticipants[action.payload.socketId];
      if (participant) {
        participant.isMuted = action.payload.isMuted;
      }
    },
    updateRemoteParticipantStatus: (
      state,
      action: PayloadAction<{ socketId: string; status: UserType['status'] }>
    ) => {
      const participant = state.remoteParticipants[action.payload.socketId];
      if (participant) {
        participant.status = action.payload.status;
      }
    },

    resetRemoteParticipants: (state) => {
      state.remoteParticipants = {};
    },

    addChatRoomMessage: (state, action: PayloadAction<ChatRoomMessage>) => {
      state.chatRoomMessages.push(action.payload);
      state.isUnreadChatRoomMessage = action.payload.isUnread;
    },

    clearUnreadChatRoomMessages: (state) => {
      state.isUnreadChatRoomMessage = false;
      state.chatRoomMessages.forEach((msg) => {
        msg.isUnread = false;
      });
    },
  },
});

const {
  setRoom,
  setRoomLoading,
  addRemoteParticipant,
  removeRemoteParticipant,
  updateRemoteParticipantAudio,
  updateRemoteParticipantStatus,
  resetRemoteParticipants,
  addChatRoomMessage,
  clearUnreadChatRoomMessages,
} = roomSlice.actions;

// Selectors with proper typing
const selectRoom = (state: RootState) => state.room.room;
const selectRoomLoading = (state: RootState) => state.room.loading;
const selectRemoteParticipants = (state: RootState) => state.room.remoteParticipants;
const selectChatRoomMessages = (state: RootState) => state.room.chatRoomMessages;
const selectIsUnreadChatRoomMessage = (state: RootState) => state.room.isUnreadChatRoomMessage;

export const useRoomTools = () => {
  const dispatch = useDispatch();

  const room = useSelector(selectRoom);
  const loading = useSelector(selectRoomLoading);
  const remoteParticipants = useSelector(selectRemoteParticipants);
  const chatRoomMessages = useSelector(selectChatRoomMessages);
  const isUnreadChatRoomMessage = useSelector(selectIsUnreadChatRoomMessage);

  const memoizedRoom = useMemo(
    () => ({
      room,
      loading,
      remoteParticipants,
      chatRoomMessages,
      isUnreadChatRoomMessage,
      setRoom: (roomData: RoomResponse) => dispatch(setRoom(roomData)),
      setRoomLoading: (isLoading: boolean) => dispatch(setRoomLoading(isLoading)),
      addRemoteParticipant: (participant: Participant) =>
        dispatch(addRemoteParticipant(participant)),
      removeRemoteParticipant: (socketId: string) => dispatch(removeRemoteParticipant(socketId)),
      updateRemoteParticipantAudio: (payload: { socketId: string; isMuted: boolean }) =>
        dispatch(updateRemoteParticipantAudio(payload)),
      updateRemoteParticipantStatus: (payload: { socketId: string; status: UserType['status'] }) =>
        dispatch(updateRemoteParticipantStatus(payload)),
      resetRemoteParticipants: () => dispatch(resetRemoteParticipants()),
      addChatRoomMessage: (message: ChatRoomMessage) => dispatch(addChatRoomMessage(message)),
      clearUnreadChatRoomMessages: () => dispatch(clearUnreadChatRoomMessages()),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [room, loading, remoteParticipants, chatRoomMessages, isUnreadChatRoomMessage]
  );
  return memoizedRoom;
};
