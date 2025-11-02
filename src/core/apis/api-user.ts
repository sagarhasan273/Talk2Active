// services/userApi.ts
import type { ResponseType } from 'src/types/common';
import type {
  UserType,
  UserTagsType,
  UserStatusType,
  UserProfileFormType,
  UserAccountUpdateType,
  UserAccountSessionUpdateType,
  UserAccountActivateUpdateType,
} from 'src/types/user';

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

    updateUser: builder.mutation<ResponseType, Partial<UserProfileFormType>>({
      query: (body) => ({
        url: `user/profile/update`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['user-recall'],
    }),

    updateUserStatus: builder.mutation<ResponseType, Partial<UserStatusType>>({
      query: (body) => ({
        url: `user/profile/update`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['user-recall'],
    }),

    updateUserTags: builder.mutation<ResponseType, Partial<UserTagsType>>({
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

    updateUserAccount: builder.mutation<
      ResponseType,
      Omit<UserAccountUpdateType, 'confirmNewPassword'>
    >({
      query: (body) => ({
        url: `user/account/update`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['user-recall'],
    }),

    updateUserAccountActivate: builder.mutation<ResponseType, UserAccountActivateUpdateType>({
      query: (body) => ({
        url: `user/profile/update/activate`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['user-recall'],
    }),

    updateUserAccountSession: builder.mutation<ResponseType, UserAccountSessionUpdateType>({
      query: (body) => ({
        url: `user/profile/update/session`,
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
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useUpdateUserAccountMutation,
  useUpdateUserAccountSessionMutation,
  useUpdateUserAccountActivateMutation,
  useUpdateUserStatusMutation,
  useUpdateUserTagsMutation,
  useCreateUserMutation,
  useDeleteUserMutation,
} = userApi;
