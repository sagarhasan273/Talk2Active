// services/userApi.ts
import type { ResponseType } from 'src/types/type-common';
import type {
  SubmitRatingReq,
  SubmitRatingRes,
  UserRatingStatsRes
} from 'src/types/type-rating';
import type { UserType } from 'src/types/type-user';

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { CONFIG } from 'src/config-global';

import { STORAGE_KEY } from 'src/auth/context/jwt/constant';

export const userApi = createApi({
  reducerPath: 'userApi',
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
  tagTypes: ['user-recall', 'user-rating'],
  endpoints: (builder) => ({
    getMe: builder.query<ResponseType, null>({
      query: () => `user/u/me`,
      providesTags: ['user-recall'],
    }),

    getUserById: builder.query<{ user: UserType; status: boolean }, string>({
      query: (id) => `user/profile/${id}`,
      providesTags: ['user-recall'],
    }),

    createUser: builder.mutation<UserType, UserType>({
      query: (newUser) => ({
        url: `users`,
        method: 'POST',
        body: newUser,
      }),
    }),

    updateUserRecentRooms: builder.mutation<ResponseType, { id: string; roomId: string }>({
      query: (body) => ({
        url: `user/recent-room/update`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['user-recall'],
    }),

    deleteUser: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `users/${id}`,
        method: 'DELETE',
      }),
    }),

    // ------------------------------------------------------------------
    // Rating Endpoints
    // ------------------------------------------------------------------

    submitRating: builder.mutation<SubmitRatingRes, SubmitRatingReq>({
      query: (body) => ({
        url: `rating`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { targetUserId }) => [
        { type: 'user-rating', id: targetUserId },
        'user-recall',
      ],
    }),

    getUserRatingStats: builder.query<UserRatingStatsRes, string>({
      query: (userId) => `rating/stats/${userId}`,
      providesTags: (_result, _error, userId) => [{ type: 'user-rating', id: userId }],
    }),
  }),
});

export const {
  useGetMeQuery,
  useGetUserByIdQuery,
  useUpdateUserRecentRoomsMutation,
  useCreateUserMutation,
  useDeleteUserMutation,
  useSubmitRatingMutation,
  useGetUserRatingStatsQuery,
  useLazyGetUserRatingStatsQuery,
} = userApi;
