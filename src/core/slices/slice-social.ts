import type { UserType } from 'src/types/type-user';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Message, Reaction } from 'src/types/type-room';

import { useMemo } from 'react';
import { createSlice } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState } from '../types';

// Define auth state interface
interface SocialState {
  friends: UserType[];
  loading: boolean;
  individualMessages: Message[];
  isUnreadIndividualMessage: boolean;
}

// Initial state
const initialState: SocialState = {
  friends: [] as UserType[],
  loading: false,
  individualMessages: [],
  isUnreadIndividualMessage: false,
};

export const socialSlice = createSlice({
  name: 'social',
  initialState,
  reducers: {
    setFriends: (state, action: PayloadAction<SocialState['friends']>) => {
      state.friends = action.payload;
    },
    setFriendsLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    addIndividualMessage: (state, action: PayloadAction<Message>) => {
      state.individualMessages.push({
        ...action.payload,
      });
    },

    editIndividualMessage: (
      state,
      action: PayloadAction<{
        messageId: Message['id'];
        text: Message['text'];
        time?: Message['time'];
      }>
    ) => {
      state.individualMessages.forEach((msg) => {
        if (msg.id === action.payload.messageId) {
          msg.isEdited = true;
          msg.text = action.payload.text || msg.text;
          msg.time = action.payload.time || msg.time;
        }
      });
    },

    deleteIndividualMessage: (
      state,
      action: PayloadAction<{
        messageId: Message['id'];
        text?: Message['text'];
        time?: Message['time'];
      }>
    ) => {
      state.individualMessages.forEach((msg) => {
        if (msg.id === action.payload.messageId) {
          msg.isDeleted = true;
          msg.isEdited = false;
          msg.text = action.payload.text || '[This message was deleted]';
          msg.time = action.payload.time || msg.time;
        }
      });
    },

    reactionIndividualMessage: (
      state,
      action: PayloadAction<{ messageId: Message['id']; reaction: Reaction }>
    ) => {
      state.individualMessages.forEach((msg) => {
        if (msg.id === action.payload.messageId) {
          msg.reactions = [...(msg.reactions || []), action.payload.reaction];
        }
      });
    },

    reactionPopIndividualMessage: (
      state,
      action: PayloadAction<{ messageId: Message['id']; reaction: Reaction }>
    ) => {
      state.individualMessages.forEach((msg) => {
        if (msg.id === action.payload.messageId) {
          msg.reactions = (msg.reactions || []).filter(
            (reaction) => reaction.userId !== action.payload.reaction.userId
          );
        }
      });
    },

    clearUnreadIndividualMessages: (state) => {
      state.isUnreadIndividualMessage = false;
      state.individualMessages.forEach((msg) => {
        msg.isUnread = false;
        msg.startOfUnread = false;
      });
    },
  },
});

export const {
  setFriends,
  setFriendsLoading,
  addIndividualMessage,
  editIndividualMessage,
  deleteIndividualMessage,
  reactionIndividualMessage,
  reactionPopIndividualMessage,
  clearUnreadIndividualMessages,
} = socialSlice.actions;

// Selectors with proper typing
export const selectFriends = (state: RootState) => state.social.friends;
export const selectFriendsLoading = (state: RootState) => state.social.loading;
const selectIndividualMessages = (state: RootState) => state.social.individualMessages;
const selectIsUnreadIndividualMessage = (state: RootState) =>
  state.social.isUnreadIndividualMessage;

export const useMessagesTools = () => {
  const dispatch = useDispatch();

  const individualMessages = useSelector(selectIndividualMessages);
  const isUnreadIndividualMessage = useSelector(selectIsUnreadIndividualMessage);

  const memoizedMessages = useMemo(
    () => ({
      individualMessages,
      isUnreadIndividualMessage,
      addIndividualMessage: (message: Message) => dispatch(addIndividualMessage(message)),
      editIndividualMessage: (payload: {
        messageId: Message['id'];
        text: Message['text'];
        time?: Message['time'];
      }) => dispatch(editIndividualMessage(payload)),
      deleteIndividualMessage: (payload: {
        messageId: Message['id'];
        text?: Message['text'];
        time?: Message['time'];
      }) => dispatch(deleteIndividualMessage(payload)),
      reactionIndividualMessage: (payload: { messageId: Message['id']; reaction: Reaction }) =>
        dispatch(reactionIndividualMessage(payload)),
      reactionPopIndividualMessage: (payload: { messageId: Message['id']; reaction: Reaction }) =>
        dispatch(reactionPopIndividualMessage(payload)),
      clearUnreadIndividualMessages: () => dispatch(clearUnreadIndividualMessages()),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [individualMessages, isUnreadIndividualMessage]
  );
  return memoizedMessages;
};
