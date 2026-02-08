import type { UserType } from 'src/types/type-user';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Message, Reaction } from 'src/types/type-room';
import type { AllRelationsType } from 'src/types/type-social';

import { useMemo } from 'react';
import { createSlice } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState } from '../types';

// Define auth state interface
interface SocialState {
  friends: UserType[];
  loading: boolean;
  chatPeople: AllRelationsType[];
  chatPeopleLoading: boolean;
  individualMessages: { [userId: string]: Message[] };
  isUnreadIndividualMessage: boolean;
}

// Initial state
const initialState: SocialState = {
  friends: [] as UserType[],
  loading: false,
  chatPeople: [] as AllRelationsType[],
  chatPeopleLoading: false,
  individualMessages: {},
  isUnreadIndividualMessage: false,
};

export const socialSlice = createSlice({
  name: 'social',
  initialState,
  reducers: {
    setFriends: (state, action: PayloadAction<SocialState['friends']>) => {
      state.friends = action.payload;
    },

    setChatPeople: (state, action: PayloadAction<SocialState['chatPeople']>) => {
      state.chatPeople = action.payload;
    },

    setUnreadChatPeople(
      state,
      action: PayloadAction<{ userId: UserType['id']; isUnread?: boolean }>
    ) {
      state.chatPeople.map((person) => {
        if (person.accountDetails.id === action.payload.userId) {
          return {
            ...person,
            latestMessage: {
              ...person.latestMessage,
              _id: person.latestMessage?._id || '',
              isUnread: action.payload.isUnread ?? false,
            },
          };
        }
        return person;
      });
    },

    sortChatPeople: (state) => {
      state.chatPeople.sort((a, b) => {
        const timeA = new Date(a.latestMessage?.createdAt || '').getTime() || 0;
        const timeB = new Date(b.latestMessage?.createdAt || '').getTime() || 0;
        return timeB - timeA;
      });
    },

    setChatPeopleLoading: (state, action: PayloadAction<boolean>) => {
      state.chatPeopleLoading = action.payload;
    },

    setFriendsLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    addIndividualMessage: (state, action: PayloadAction<{ userId: string; message: Message }>) => {
      const { userId } = action.payload;

      if (!state.individualMessages[userId]) {
        state.individualMessages[userId] = [];
      }

      let tempChatPeople = null;

      state.chatPeople = state.chatPeople.filter((person) => {
        if (person.accountDetails.id === userId) {
          tempChatPeople = {
            ...person,
            latestMessage: {
              _id: action.payload.message.id || '',
              text: action.payload.message.text,
              time: action.payload.message.time,
              createdAt: new Date().toISOString(),
              isUnread: true,
            },
          };
          return false;
        }
        return true;
      });

      if (tempChatPeople) {
        state.chatPeople.unshift(tempChatPeople);
      }

      state.individualMessages[userId].push({
        ...action.payload.message,
      });
    },

    editIndividualMessage: (
      state,
      action: PayloadAction<{
        userId: string;
        messageId: Message['id'];
        text: Message['text'];
        time?: Message['time'];
      }>
    ) => {
      state.individualMessages[action.payload.userId]?.forEach((msg) => {
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
        userId: string;
        messageId: Message['id'];
        text?: Message['text'];
        time?: Message['time'];
      }>
    ) => {
      state.individualMessages[action.payload.userId]?.forEach((msg) => {
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
      action: PayloadAction<{ userId?: string; messageId: Message['id']; reaction: Reaction }>
    ) => {
      if (action.payload.userId && action.payload.userId !== '') {
        state.individualMessages[action.payload.userId]?.forEach((msg) => {
          if (msg.id === action.payload.messageId) {
            msg.reactions = [...(msg.reactions || []), action.payload.reaction];
          }
        });
      }
    },

    reactionPopIndividualMessage: (
      state,
      action: PayloadAction<{ userId?: string; messageId: Message['id']; reaction: Reaction }>
    ) => {
      if (!action.payload.userId || action.payload.userId === '') return;
      state.individualMessages[action.payload.userId]?.forEach((msg) => {
        if (msg.id === action.payload.messageId) {
          msg.reactions = (msg.reactions || []).filter(
            (reaction) =>
              !(
                reaction.userId === action.payload.reaction.userId &&
                reaction.emoji === action.payload.reaction.emoji
              )
          );
        }
      });
    },

    clearUnreadIndividualMessages: (state, action: PayloadAction<string>) => {
      state.isUnreadIndividualMessage = false;
      state.individualMessages[action.payload]?.forEach((msg) => {
        msg.isUnread = false;
        msg.startOfUnread = false;
      });
    },
  },
});

export const {
  setFriends,
  setFriendsLoading,
  setChatPeople,
  sortChatPeople,
  setChatPeopleLoading,
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
const selectChatPeople = (state: RootState) => state.social.chatPeople;
const selectChatPeopleLoading = (state: RootState) => state.social.chatPeopleLoading;
const selectIndividualMessages = (state: RootState) => state.social.individualMessages;
const selectIsUnreadIndividualMessage = (state: RootState) =>
  state.social.isUnreadIndividualMessage;

export const useMessagesTools = () => {
  const dispatch = useDispatch();

  const individualMessages = useSelector(selectIndividualMessages);
  const isUnreadIndividualMessage = useSelector(selectIsUnreadIndividualMessage);
  const chatPeople = useSelector(selectChatPeople);
  const chatPeopleLoading = useSelector(selectChatPeopleLoading);

  const memoizedMessages = useMemo(
    () => ({
      individualMessages,
      isUnreadIndividualMessage,
      chatPeople,
      chatPeopleLoading,

      setChatPeople: (payload: AllRelationsType[]) => dispatch(setChatPeople(payload)),
      sortChatPeople: () => dispatch(sortChatPeople()),
      setChatPeopleLoading: (loading: boolean) => dispatch(setChatPeopleLoading(loading)),
      addIndividualMessage: ({ userId, message }: { userId: string; message: Message }) =>
        dispatch(addIndividualMessage({ userId, message })),
      editIndividualMessage: (payload: {
        userId: string;
        messageId: Message['id'];
        text: Message['text'];
        time?: Message['time'];
      }) => dispatch(editIndividualMessage(payload)),
      deleteIndividualMessage: (payload: {
        userId: string;
        messageId: Message['id'];
        text?: Message['text'];
        time?: Message['time'];
      }) => dispatch(deleteIndividualMessage(payload)),
      reactionIndividualMessage: (payload: {
        userId?: string;
        messageId: Message['id'];
        reaction: Reaction;
      }) => dispatch(reactionIndividualMessage(payload)),
      reactionPopIndividualMessage: (payload: {
        userId?: string;
        messageId: Message['id'];
        reaction: Reaction;
      }) => dispatch(reactionPopIndividualMessage(payload)),
      clearUnreadIndividualMessages: (userId: string) =>
        dispatch(clearUnreadIndividualMessages(userId)),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chatPeople, chatPeopleLoading, individualMessages, isUnreadIndividualMessage]
  );
  return memoizedMessages;
};
