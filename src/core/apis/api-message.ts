import type { ChatMessage } from 'src/types/type-room';

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { CONFIG } from 'src/config-global';

import { STORAGE_KEY } from 'src/auth/context/jwt';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export interface SendMessagePayload {
  userId?: string; // Optional if you pass it, but normally inferred from token
  recipientId: string;
  text: string;
  replyToId?: string;
  isSystem?: boolean;
  systemType?: 'info' | 'success' | 'warning' | 'error';
}

export interface UpdateMessagePayload {
  messageId: string;
  text: string;
}

export interface ToggleReactionPayload {
  messageId: string;
  emoji: string;
}

export interface ReadMessagesPayload {
  userId1: string;
  userId2: string;
}

export interface MessageResponse<T = any> {
  status?: boolean;
  success?: boolean;
  data: T;
  message?: string;
}

/* ------------------------------------------------------------------ */
/*  API Slice                                                         */
/* ------------------------------------------------------------------ */

export const messageApi = createApi({
  reducerPath: 'messageApi',
  baseQuery: fetchBaseQuery({
    baseUrl: CONFIG.serverUrl,
    prepareHeaders: (headers) => {
      const accessToken = localStorage.getItem(STORAGE_KEY);
      if (accessToken) {
        headers.set('authorization', `Bearer ${accessToken}`);
      }
      return headers;
    },
  }),
  tagTypes: ['chat-recall'],
  endpoints: (builder) => ({
    // Matches: GET /message/history/:targetUserId
    getHistory: builder.query<MessageResponse<ChatMessage[]>, string>({
      query: (targetUserId) => `message/history/${targetUserId}`,
      providesTags: ['chat-recall'],
    }),

    // Matches: POST /message/save
    saveMessage: builder.mutation<MessageResponse<ChatMessage>, SendMessagePayload>({
      query: (body) => ({
        url: 'message/save',
        method: 'POST',
        body,
      }),
      // We don't necessarily invalidate tags here because we update UI optimistically via Socket.io/State
      // but leaving it in keeps things perfectly synced if a refresh is needed.
      invalidatesTags: ['chat-recall'],
    }),

    // Matches: PATCH /message/:messageId
    updateMessage: builder.mutation<MessageResponse<ChatMessage>, UpdateMessagePayload>({
      query: ({ messageId, text }) => ({
        url: `message/${messageId}`,
        method: 'PATCH',
        body: { text },
      }),
      invalidatesTags: ['chat-recall'],
    }),

    // Matches: POST /message/:messageId/reactions
    toggleReaction: builder.mutation<MessageResponse<ChatMessage>, ToggleReactionPayload>({
      query: ({ messageId, emoji }) => ({
        url: `message/${messageId}/reactions`,
        method: 'POST',
        body: { emoji },
      }),
      invalidatesTags: ['chat-recall'],
    }),

    // Matches: POST /message/:userId1/:userId2/read
    readMessages: builder.mutation<MessageResponse<null>, ReadMessagesPayload>({
      query: ({ userId1, userId2 }) => ({
        url: `message/${userId1}/${userId2}/read`,
        method: 'POST',
      }),
      invalidatesTags: ['chat-recall'],
    }),
  }),
});

export const {
  useGetHistoryQuery,
  useSaveMessageMutation,
  useUpdateMessageMutation,
  useToggleReactionMutation,
  useReadMessagesMutation,
} = messageApi;
