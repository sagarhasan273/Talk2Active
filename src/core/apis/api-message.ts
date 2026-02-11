import type { Message } from 'src/types/type-room';

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { CONFIG } from 'src/config-global';

import { STORAGE_KEY } from 'src/auth/context/jwt';

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
    getConversation: builder.query<
      { messages: Message[]; status: boolean; chatUserId: string },
      { userId1: string; userId2: string }
    >({
      query: ({ userId1, userId2 }) => `message/${userId1}/${userId2}`,
      providesTags: ['chat-recall'],
    }),
  }),
});

export const { useGetConversationQuery } = messageApi;
