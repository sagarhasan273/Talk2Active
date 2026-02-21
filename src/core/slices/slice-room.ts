import type { UserType } from 'src/types/type-user';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RoomResponse } from 'src/types/type-chat';
import type { Message, Reaction, Participant } from 'src/types/type-room';

import { useMemo } from 'react';
import { createSlice } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import { CONFIG } from 'src/config-global';

import type { RootState, UserVoiceStateProps } from '../types';

// Define auth state interface
interface RoomState {
  room: RoomResponse;
  loading: boolean;
  participants: { [socketId: string]: Participant };
  userVoiceState: UserVoiceStateProps;
  chatRoomMessages: Message[];
  isUnreadChatRoomMessage: boolean;
}

// Initial state
const initialState: RoomState = {
  room: {} as RoomResponse,
  loading: false,
  participants: {} as { [socketId: string]: Participant },
  userVoiceState: {
    hasJoined: false,
    isMicMuted: false,
    isDeafened: false,
    volume: CONFIG.defaultOutputGain,
    micGain: CONFIG.defaultMicGain,
    isScreenSharing: false,
    statue: 'online',
  },
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

    addParticipant: (state, action: PayloadAction<Participant>) => {
      state.participants[action.payload.socketId] = action.payload;
    },

    updateParticipant: (state, action: PayloadAction<Partial<Participant>>) => {
      if (!action.payload?.socketId) {
        return;
      }

      state.participants[action.payload.socketId] = {
        ...state.participants[action.payload.socketId],
        ...action.payload,
      };
    },

    removeParticipant: (state, action: PayloadAction<string>) => {
      delete state.participants[action.payload];
    },

    updateParticipantAudio: (
      state,
      action: PayloadAction<{ socketId: string; isMuted: boolean }>
    ) => {
      const participant = state.participants[action.payload.socketId];
      if (participant) {
        participant.isMuted = action.payload.isMuted;
      }
    },

    updateParticipantStatus: (
      state,
      action: PayloadAction<{ socketId: string; status: UserType['status'] }>
    ) => {
      const participant = state.participants[action.payload.socketId];
      if (participant) {
        participant.status = action.payload.status;
      }
    },

    resetParticipants: (state) => {
      state.participants = {};
    },

    updateUserVoiceState: (state, action: PayloadAction<Partial<UserVoiceStateProps>>) => {
      state.userVoiceState = { ...state.userVoiceState, ...action.payload };
    },

    addChatRoomMessage: (state, action: PayloadAction<Message>) => {
      state.chatRoomMessages.push({
        ...action.payload,
        startOfUnread: !state.isUnreadChatRoomMessage === action.payload.isUnread,
      });
      state.isUnreadChatRoomMessage = action.payload.isUnread;
    },

    editChatRoomMessage: (
      state,
      action: PayloadAction<{
        messageId: Message['id'];
        text: Message['text'];
        time?: Message['time'];
      }>
    ) => {
      state.chatRoomMessages.forEach((msg) => {
        if (msg.id === action.payload.messageId) {
          msg.isEdited = true;
          msg.text = action.payload.text || msg.text;
          msg.time = action.payload.time || msg.time;
        }
      });
    },

    deleteChatRoomMessage: (
      state,
      action: PayloadAction<{
        messageId: Message['id'];
        text?: Message['text'];
        time?: Message['time'];
      }>
    ) => {
      state.chatRoomMessages.forEach((msg) => {
        if (msg.id === action.payload.messageId) {
          msg.isDeleted = true;
          msg.isEdited = false;
          msg.text = action.payload.text || '[This message was deleted]';
          msg.time = action.payload.time || msg.time;
        }
      });
    },

    reactionChatRoomMessage: (
      state,
      action: PayloadAction<{ messageId: Message['id']; reaction: Reaction }>
    ) => {
      state.chatRoomMessages.forEach((msg) => {
        if (msg.id === action.payload.messageId) {
          msg.reactions = [...(msg.reactions || []), action.payload.reaction];
        }
      });
    },

    reactionPopChatRoomMessage: (
      state,
      action: PayloadAction<{ messageId: Message['id']; reaction: Reaction }>
    ) => {
      state.chatRoomMessages.forEach((msg) => {
        if (msg.id === action.payload.messageId) {
          msg.reactions = (msg.reactions || []).filter(
            (reaction) => reaction.userId !== action.payload.reaction.userId
          );
        }
      });
    },

    clearUnreadChatRoomMessages: (state) => {
      state.isUnreadChatRoomMessage = false;
      state.chatRoomMessages.forEach((msg) => {
        msg.isUnread = false;
        msg.startOfUnread = false;
      });
    },
  },
});

const {
  setRoom,
  setRoomLoading,
  addParticipant,
  updateParticipant,
  removeParticipant,
  updateParticipantAudio,
  updateParticipantStatus,
  resetParticipants,
  updateUserVoiceState,
  addChatRoomMessage,
  editChatRoomMessage,
  deleteChatRoomMessage,
  reactionChatRoomMessage,
  reactionPopChatRoomMessage,
  clearUnreadChatRoomMessages,
} = roomSlice.actions;

// Selectors with proper typing
const selectRoom = (state: RootState) => state.room.room;
const selectRoomLoading = (state: RootState) => state.room.loading;
const selectParticipants = (state: RootState) => state.room.participants;
const selectChatRoomMessages = (state: RootState) => state.room.chatRoomMessages;
const selectIsUnreadChatRoomMessage = (state: RootState) => state.room.isUnreadChatRoomMessage;
const selectUserVoiceState = (state: RootState) => state.room.userVoiceState;

export const useRoomTools = () => {
  const dispatch = useDispatch();

  const room = useSelector(selectRoom);
  const loading = useSelector(selectRoomLoading);
  const participants = useSelector(selectParticipants);
  const chatRoomMessages = useSelector(selectChatRoomMessages);
  const isUnreadChatRoomMessage = useSelector(selectIsUnreadChatRoomMessage);
  const userVoiceState = useSelector(selectUserVoiceState);

  const memoizedRoom = useMemo(
    () => ({
      room,
      loading,
      participants,
      chatRoomMessages,
      isUnreadChatRoomMessage,
      userVoiceState,
      setRoom: (roomData: RoomResponse) => dispatch(setRoom(roomData)),
      setRoomLoading: (isLoading: boolean) => dispatch(setRoomLoading(isLoading)),
      addParticipant: (participant: Participant) => dispatch(addParticipant(participant)),
      updateParticipant: (participant: Partial<Participant>) =>
        dispatch(updateParticipant(participant)),
      removeParticipant: (socketId: string) => dispatch(removeParticipant(socketId)),
      updateParticipantAudio: (payload: { socketId: string; isMuted: boolean }) =>
        dispatch(updateParticipantAudio(payload)),
      updateParticipantStatus: (payload: { socketId: string; status: UserType['status'] }) =>
        dispatch(updateParticipantStatus(payload)),
      resetParticipants: () => dispatch(resetParticipants()),
      updateUserVoiceState: (payload: Partial<UserVoiceStateProps>) =>
        dispatch(updateUserVoiceState(payload)),
      addChatRoomMessage: (message: Message) => dispatch(addChatRoomMessage(message)),
      editChatRoomMessage: (payload: {
        messageId: Message['id'];
        text: Message['text'];
        time?: Message['time'];
      }) => dispatch(editChatRoomMessage(payload)),
      deleteChatRoomMessage: (payload: {
        messageId: Message['id'];
        text?: Message['text'];
        time?: Message['time'];
      }) => dispatch(deleteChatRoomMessage(payload)),
      reactionChatRoomMessage: (payload: { messageId: Message['id']; reaction: Reaction }) =>
        dispatch(reactionChatRoomMessage(payload)),
      reactionPopChatRoomMessage: (payload: { messageId: Message['id']; reaction: Reaction }) =>
        dispatch(reactionPopChatRoomMessage(payload)),
      clearUnreadChatRoomMessages: () => dispatch(clearUnreadChatRoomMessages()),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [room, loading, participants, chatRoomMessages, isUnreadChatRoomMessage, userVoiceState]
  );
  return memoizedRoom;
};
