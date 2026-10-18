import type { ResponseType } from 'src/types/type-common';
import type { RelationshipInput, UserStats } from 'src/types/type-social';

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { CONFIG } from 'src/config-global';

import { STORAGE_KEY } from 'src/auth/context/jwt';

export const socialApi = createApi({
  reducerPath: 'socialApi',
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
  tagTypes: ['social-recall'],
  endpoints: (builder) => ({
    follow: builder.mutation<{ message: string; status: boolean, data: UserStats[] }, Partial<RelationshipInput>>({
      query: (body) => ({
        url: `social/follow`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['social-recall'],
    }),

    unfollow: builder.mutation<{ message: string; status: boolean, data: UserStats[] }, Partial<RelationshipInput>>({
      query: (body) => ({
        url: `social/unfollow`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['social-recall'],
    }),

    getFriends: builder.query<ResponseType, string | undefined>({
      query: (userId) => `social/${userId}/friends`,
      providesTags: ['social-recall'],
    }),

    getFollowers: builder.query<ResponseType, string | undefined>({
      query: (userId) => `social/${userId}/followers`,
      providesTags: ['social-recall'],
    }),

    getFollowing: builder.query<ResponseType, string | undefined>({
      query: (userId) => `social/${userId}/following`,
      providesTags: ['social-recall'],
    }),

    getAllRelations: builder.query<ResponseType, string | undefined>({
      query: (userId) => `social/${userId}/all-relations`,
      providesTags: ['social-recall'],
    }),

    getBlockedUsers: builder.query<ResponseType, string | undefined>({
      query: (userId) => `social/${userId}/blocked`,
      providesTags: ['social-recall'],
    }),

    blockUser: builder.mutation<any, { requester: string; recipient: string }>({
      query: (data) => ({
        url: '/social/block',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['social-recall'],
    }),

    unblockUser: builder.mutation<any, { requester: string; recipient: string }>({
      query: (data) => ({
        url: '/social/unblock',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['social-recall'],
    }),

    reportUser: builder.mutation<any, { requester: string; recipient: string; reason: string }>({
      query: (data) => ({
        url: '/social/report',
        method: 'POST',
        body: data,
      }),
    }),

    // Mutation to toggle block status
    toggleBlockUser: builder.mutation<
      { status: boolean; isBlocked: boolean; message: string },
      { targetUserId: string }
    >({
      query: ({ targetUserId }) => ({
        url: '/social/block-toggle',
        method: 'POST',
        body: { targetUserId },
      }),
      // Automatically invalidate related cache queries
      invalidatesTags: ['social-recall'],
    }),
  }),
});

export const {
  useFollowMutation,
  useUnfollowMutation,
  useGetFriendsQuery,
  useGetFollowersQuery,
  useGetFollowingQuery,
  useGetAllRelationsQuery,
  useGetBlockedUsersQuery,
  useToggleBlockUserMutation,
  useBlockUserMutation,
  useUnblockUserMutation,
  useReportUserMutation
} = socialApi;
