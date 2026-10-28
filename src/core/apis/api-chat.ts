import type { KickUserInput, LeaveRoomUserInput, RoomJoinInput, RoomType } from '@/types/type-room';

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { CONFIG } from 'src/config-global';

import { STORAGE_KEY } from 'src/auth/context/jwt';
import { setRoom, setRooms, setRoomsLoading, updateRoomLanguageCounts } from '../slices';

export const chatApi = createApi({
  reducerPath: 'chatApi',
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
  tagTypes: ['chat-recall', 'room-by-id-recall'],
  endpoints: (builder) => ({
    getRooms: builder.query<{ data: RoomType[]; status: boolean }, null>({
      query: () => `room/list`,
      providesTags: ['chat-recall'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        dispatch(setRoomsLoading(true));

        try {
          const { data } = await queryFulfilled;

          if (data?.status && Array.isArray(data.data)) {

            dispatch(setRooms(data.data));

            const languageCounts = data.data.reduce((acc: Record<string, number>, room) => {
              if (Array.isArray(room.languages)) {
                room.languages.forEach((langCode) => {
                  acc[langCode] = (acc[langCode] || 0) + 1;
                });
              }
              return acc;
            }, {});

            languageCounts['all'] = data.data.length;

            dispatch(updateRoomLanguageCounts(languageCounts));
          }
        } catch (error) {
          // Handle or ignore network errors
        } finally {
          dispatch(setRoomsLoading(false));
        }
      },
    }),
    getRoomById: builder.query<{ data: RoomType; status: boolean }, string>({
      query: (roomId) => `room/${roomId}`,
      providesTags: ['room-by-id-recall'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.status) {
            dispatch(setRoom(data.data));
          }
        } catch (error) {
          // Handle or ignore network errors
        } finally {
          // Handle finally
        }
      },
    }),

    createRoom: builder.mutation<{ message: string; status: boolean }, Partial<any>>({
      query: (body) => ({
        url: `room/create`,
        method: 'POST',
        body,
      }),
      // invalidatesTags: ['chat-recall'],
    }),

    updateRoom: builder.mutation<{ message: string; status: boolean }, Partial<any>>({
      query: (body) => ({
        url: `room/update`,
        method: 'POST',
        body,
      }),
      // invalidatesTags: ['chat-recall'],
    }),

    joinRoomRequest: builder.mutation<{
      message: string; status: boolean, data: {
        roomId: string,
        token: string,
        room: RoomType
      }
    }, RoomJoinInput>({
      query: (input) => ({
        url: `livekit/${input.roomId}/join-request`,
        method: 'POST',
        body: input,
      }),
    }),

    joinRoom: builder.mutation<{
      message: string; status: boolean, data: {
        roomId: string,
        token: string,
        room: RoomType
      }
    }, RoomJoinInput>({
      query: (input) => ({
        url: `room/${input.roomId}/join`,
        method: 'POST',
        body: input,
      }),
      // invalidatesTags: ['chat-recall'],
    }),

    leaveRoom: builder.mutation<{ message: string; status: boolean }, LeaveRoomUserInput>({
      query: (body) => ({
        url: `room/${body.roomId}/leave`,
        method: 'POST',
        body,
      }),
      // invalidatesTags: ['chat-recall'],
    }),

    kickUser: builder.mutation<{ message: string; status: boolean }, KickUserInput>({
      query: (body) => ({
        url: `room/${body.roomId}/kick`,
        method: 'POST',
        body,
      }),
      // invalidatesTags: ['chat-recall'],
    }),
  }),
});

export const {
  useGetRoomsQuery,
  useGetRoomByIdQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useJoinRoomRequestMutation,
  useJoinRoomMutation,
  useLeaveRoomMutation,
  useKickUserMutation
} = chatApi;
