import type { Message } from 'src/types/type-room';

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { CONFIG } from 'src/config-global';

import { STORAGE_KEY } from 'src/auth/context/jwt';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export interface SendMessagePayload {
  userId?: string;
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
      const accessToken = sessionStorage.getItem(STORAGE_KEY);
      if (accessToken) {
        headers.set('authorization', `Bearer ${accessToken}`);
      }
      return headers;
    },
  }),
  tagTypes: ['chat-recall'],
  endpoints: (builder) => ({
    // Matches: GET /message/history/:targetUserId
    getHistory: builder.query<MessageResponse<Message[]>, string>({
      query: (targetUserId) => `message/history/${targetUserId}`,
      providesTags: ['chat-recall'],
    }),

    // Matches: POST /message/save
    saveMessage: builder.mutation<MessageResponse<Message>, SendMessagePayload>({
      query: (body) => ({
        url: 'message/save',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['chat-recall'],
    }),

    // Matches: PATCH /message/:messageId
    updateMessage: builder.mutation<MessageResponse<Message>, UpdateMessagePayload>({
      query: ({ messageId, text }) => ({
        url: `message/${messageId}`,
        method: 'PATCH',
        body: { text },
      }),
      invalidatesTags: ['chat-recall'],
    }),

    // Matches: POST /message/:messageId/reactions
    toggleReaction: builder.mutation<MessageResponse<Message>, ToggleReactionPayload>({
      query: ({ messageId, emoji }) => ({
        url: `message/${messageId}/reactions`,
        method: 'POST',
        body: { emoji },
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
} = messageApi;