// services/userApi.ts
import type { ResponseType } from 'src/types/type-common';
import type {
  UserType,
} from 'src/types/type-user';

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { CONFIG } from 'src/config-global';

import { STORAGE_KEY } from 'src/auth/context/jwt/constant';

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl: CONFIG.serverUrl,
    prepareHeaders: (headers, { getState }) => {
      const accessToken = sessionStorage.getItem(STORAGE_KEY);
      if (accessToken) {
        headers.set('authorization', `Bearer ${accessToken}`);
      }
      return headers;
    },
  }), // your REST API base
  tagTypes: ['user-recall'],
  endpoints: (builder) => ({
    getUser: builder.query<ResponseType, null>({
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
  }),
});

export const {
  useGetUserQuery,
  useGetUserByIdQuery,
  useUpdateUserRecentRoomsMutation,
  useCreateUserMutation,
  useDeleteUserMutation,
} = userApi;
