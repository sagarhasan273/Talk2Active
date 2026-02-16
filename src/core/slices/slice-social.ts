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
  selectedForMessage: Partial<UserType>;
  individualMessages: { [userId: string]: Message[] };
  readMessageIds: string[];
  isUnreadIndividualMessage: boolean;
}

// Initial state
const initialState: SocialState = {
  friends: [] as UserType[],
  loading: false,
  chatPeople: [] as AllRelationsType[],
  chatPeopleLoading: false,
  selectedForMessage: {} as Partial<UserType>,
  individualMessages: {},
  readMessageIds: [] as string[],
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
      let tempUnreadCount = false;

      state.chatPeople.forEach((person) => {
        if (person?.latestMessage?.isUnread) {
          tempUnreadCount = true;
        }
      });

      if (tempUnreadCount) {
        state.isUnreadIndividualMessage = true;
      } else {
        state.isUnreadIndividualMessage = false;
      }
    },

    setChatPeopleLoading: (state, action: PayloadAction<boolean>) => {
      state.chatPeopleLoading = action.payload;
    },

    setFriendsLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setSelectedForMessage: (state, action: PayloadAction<Partial<UserType>>) => {
      state.selectedForMessage = action.payload;

      let hasUnreadMessages = false;

      state.chatPeople.forEach((person) => {
        if (person.accountDetails.id === action.payload.id) {
          person.latestMessage = {
            ...person.latestMessage,
            isUnread: false,
          } as AllRelationsType['latestMessage'];
        }
        if (person?.latestMessage?.isUnread) {
          hasUnreadMessages = true;
        }
      });

      state.isUnreadIndividualMessage = hasUnreadMessages;
    },

    setIndividualMessages: (
      state,
      action: PayloadAction<{ userId: string; messages: Message[] }>
    ) => {
      const { userId, messages } = action.payload;
      if (!state.individualMessages[userId]) {
        state.individualMessages[userId] = [...messages];
      }
    },

    addIndividualMessage: (state, action: PayloadAction<{ userId: string; message: Message }>) => {
      const { userId } = action.payload;

      if (!state.individualMessages[userId]) {
        state.individualMessages[userId] = [];
      }

      let tempChatPeople = null;
      let hasUnread = false;

      state.chatPeople = state.chatPeople.filter((person) => {
        if (person.accountDetails.id === userId) {
          tempChatPeople = {
            ...person,
            latestMessage: {
              _id: action.payload.message.id || '',
              text: action.payload.message.text,
              time: action.payload.message.time,
              createdAt: new Date().toISOString(),
              isUnread:
                person.accountDetails.id === state.selectedForMessage?.id
                  ? false
                  : action.payload.message.isUnread,
            },
          };

          if (tempChatPeople.latestMessage?.isUnread) {
            hasUnread = true;
          }

          return false;
        }
        return true;
      });

      if (tempChatPeople) {
        state.chatPeople.unshift(tempChatPeople);
      }

      state.individualMessages[userId].push({
        ...action.payload.message,
        isUnread: state.selectedForMessage.id === userId ? false : action.payload.message.isUnread,
        startOfUnread:
          !state.isUnreadIndividualMessage &&
          (state.selectedForMessage.id === userId ? false : action.payload.message.isUnread),
      });

      state.isUnreadIndividualMessage = hasUnread;

      if (
        state.selectedForMessage.id === userId &&
        action.payload.message.isUnread &&
        action.payload.message.id &&
        !state.readMessageIds.includes(action.payload.message.id)
      ) {
        state.readMessageIds.push(action.payload.message.id || '');
      }
    },

    pushUnreadMessageId: (state, action: PayloadAction<string>) => {
      if (!state.readMessageIds.includes(action.payload)) {
        state.readMessageIds.push(action.payload);
      }
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
            const hasReact = msg.reactions?.some(
              (reaction) =>
                reaction.userId === action.payload.reaction.userId &&
                reaction.emoji === action.payload.reaction.emoji
            );

            if (hasReact) {
              msg.reactions =
                (msg.reactions || []).filter(
                  (reaction) =>
                    !(
                      reaction.userId === action.payload.reaction.userId &&
                      reaction.emoji === action.payload.reaction.emoji
                    )
                ) || [];
            } else {
              msg.reactions = [...(msg.reactions || []), action.payload.reaction];
            }
          }
        });
      }
    },

    clearUnreadIndividualMessages: (state) => {
      state.isUnreadIndividualMessage = false;
      if (state.selectedForMessage?.id) {
        state.individualMessages[state.selectedForMessage.id]?.forEach((msg) => {
          if (msg.isUnread && msg.id && !state.readMessageIds.includes(msg.id)) {
            state.readMessageIds.push(msg.id);
          }
          msg.isUnread = false;
          msg.startOfUnread = false;
        });
      }
    },

    setUnreadChatPeople(
      state,
      action: PayloadAction<{ userId: UserType['id']; isUnread?: boolean }>
    ) {
      let tempUnreadCount = false;

      state.chatPeople.forEach((person) => {
        if (person.accountDetails.id === action.payload.userId) {
          person.latestMessage = {
            ...person.latestMessage,
            isUnread: action.payload.isUnread === undefined ? false : action.payload.isUnread,
          } as AllRelationsType['latestMessage'];

          if (person?.latestMessage?.isUnread) {
            tempUnreadCount = true;
          }
        }
      });

      if (tempUnreadCount) {
        state.isUnreadIndividualMessage = true;
      } else {
        state.isUnreadIndividualMessage = false;
      }
    },
  },
});

export const {
  setFriends,
  setFriendsLoading,
  setChatPeople,
  setChatPeopleLoading,
  setSelectedForMessage,
  addIndividualMessage,
  setIndividualMessages,
  editIndividualMessage,
  deleteIndividualMessage,
  reactionIndividualMessage,
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
  const selectedForMessage = useSelector((state: RootState) => state.social.selectedForMessage);
  const readMessageIds = useSelector((state: RootState) => state.social.readMessageIds);

  const memoizedMessages = useMemo(
    () => ({
      individualMessages,
      isUnreadIndividualMessage,
      readMessageIds,
      chatPeople,
      chatPeopleLoading,
      selectedForMessage,
      setChatPeople: (payload: AllRelationsType[]) => dispatch(setChatPeople(payload)),
      setChatPeopleLoading: (loading: boolean) => dispatch(setChatPeopleLoading(loading)),
      setSelectedForMessage: (user: Partial<UserType>) => dispatch(setSelectedForMessage(user)),
      setIndividualMessages: ({ userId, messages }: { userId: string; messages: Message[] }) =>
        dispatch(setIndividualMessages({ userId, messages })),
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
      clearUnreadIndividualMessages: () => dispatch(clearUnreadIndividualMessages()),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      chatPeople,
      chatPeopleLoading,
      selectedForMessage,
      individualMessages,
      isUnreadIndividualMessage,
      readMessageIds,
    ]
  );
  return memoizedMessages;
};
