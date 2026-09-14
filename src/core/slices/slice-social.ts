import type { PayloadAction } from '@reduxjs/toolkit';
import type { Message, Reaction } from 'src/types/type-room';
import type { AllRelationsType } from 'src/types/type-social';
import type { UserType } from 'src/types/type-user';

import { createSlice } from '@reduxjs/toolkit';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState } from '../types';

// Define auth state interface
interface SocialState {
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
        if (person.accountDetails.userId === action.payload.userId) {
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

      if (tempChatPeople) {
        state.chatPeople.unshift(tempChatPeople);
      }

      state.individualMessages[userId].push({
        ...action.payload.message,
        isUnread: state.selectedForMessage.userId === userId ? false : action.payload.message.isUnread,
        startOfUnread:
          !state.isUnreadIndividualMessage &&
          (state.selectedForMessage.userId === userId ? false : action.payload.message.isUnread),
      });

      state.isUnreadIndividualMessage = hasUnread;
    },

    pushUnreadMessageId: (state, action: PayloadAction<string>) => {
      if (!state.readMessageIds.includes(action.payload)) {
        state.readMessageIds.push(action.payload);
      }
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
      if (state.selectedForMessage?.userId) {
        state.individualMessages[state.selectedForMessage.userId]?.forEach((msg) => {
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
      action: PayloadAction<{ userId: UserType['userId']; isUnread?: boolean }>
    ) {
      let tempUnreadCount = false;

      state.chatPeople.forEach((person) => {
        if (person.accountDetails.userId === action.payload.userId) {
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
  setChatPeople,
  setChatPeopleLoading,
  setSelectedForMessage,
  addIndividualMessage,
  setIndividualMessages,
  reactionIndividualMessage,
  clearUnreadIndividualMessages,
} = socialSlice.actions;

// Selectors with proper typing
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
