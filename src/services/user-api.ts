// services/userApi.ts
import type { UserType, UserProfileFormType } from 'src/validations/user';

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { CONFIG } from 'src/config-global';

import { STORAGE_KEY } from 'src/auth/context/jwt';

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
    getUserById: builder.query<{ user: UserType; status: boolean }, string>({
      query: (id) => `user/profile/${id}`,
      providesTags: ['user-recall'],
    }),
    updateUser: builder.mutation<UserProfileFormType, Partial<UserProfileFormType>>({
      query: (body) => ({
        url: `user/profile/update`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['user-recall'],
    }),
    createUser: builder.mutation<UserType, UserType>({
      query: (newUser) => ({
        url: `users`,
        method: 'POST',
        body: newUser,
      }),
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
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useCreateUserMutation,
  useDeleteUserMutation,
} = userApi;
