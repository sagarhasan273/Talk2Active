import type { RoomResponse } from 'src/types/type-chat';

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { CONFIG } from 'src/config-global';

import { STORAGE_KEY } from 'src/auth/context/jwt';

export const chatApi = createApi({
  reducerPath: 'chatApi',
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
    getRooms: builder.query<{ data: RoomResponse[]; status: boolean }, null>({
      query: () => `room/list`,
      providesTags: ['chat-recall'],
    }),

    getRoomById: builder.query<{ data: RoomResponse; status: boolean }, string>({
      query: (roomId) => `room/${roomId}`,
      providesTags: ['chat-recall'],
    }),

    createRoom: builder.mutation<{ message: string; status: boolean }, Partial<any>>({
      query: (body) => ({
        url: `room/create`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['chat-recall'],
    }),

    joinRoom: builder.mutation<
      { message: string; status: boolean },
      { roomId: string; userId: string }
    >({
      query: ({ roomId, userId }) => ({
        url: `room/${roomId}/join`,
        method: 'POST',
        body: { userId },
      }),
      invalidatesTags: ['chat-recall'],
    }),

    leaveRoom: builder.mutation<
      { message: string; status: boolean },
      { roomId: string; userId: string }
    >({
      query: ({ roomId, userId }) => ({
        url: `room/${roomId}/leave`,
        method: 'POST',
        body: { userId },
      }),
      invalidatesTags: ['chat-recall'],
    }),
  }),
});

export const {
  useGetRoomsQuery,
  useGetRoomByIdQuery,
  useCreateRoomMutation,
  useJoinRoomMutation,
  useLeaveRoomMutation,
} = chatApi;
