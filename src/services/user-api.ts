// services/userApi.ts
import type { IUserProfile } from 'src/types/user';

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
  endpoints: (builder) => ({
    getUserById: builder.query<{ user: IUserProfile; status: boolean }, string>({
      query: (id) => `user/profile/${id}`,
    }),
    updateUser: builder.mutation<IUserProfile, Partial<IUserProfile>>({
      query: (body) => ({
        url: `profile/update`,
        method: 'POST',
        body,
      }),
    }),
    createUser: builder.mutation<IUserProfile, IUserProfile>({
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
