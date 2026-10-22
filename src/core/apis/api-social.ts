import type { ResponseType } from 'src/types/type-common';
import type { RelationshipInput, UserStats } from 'src/types/type-social';

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { CONFIG } from 'src/config-global';

import { STORAGE_KEY } from 'src/auth/context/jwt';
import { setBlockedUserIds, setFollowing, setFriends } from '../slices';

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

    getFollowers: builder.query<ResponseType, { userId: string; page: number; search: string }>({
      query: ({ userId, page, search }) => ({
        url: `social/${userId}/followers`,
        params: {
          page,
          limit: 20,
          ...(search ? { search } : {})
        },
      }),
      providesTags: ['social-recall'],

      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        return `${endpointName}-${queryArgs.userId}-${queryArgs.search || ''}`;
      },

      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) {
          return newItems;
        }

        const newData = Array.isArray(newItems) ? newItems : newItems?.data ?? [];

        if (Array.isArray(currentCache)) {
          currentCache.push(...newData);
        } else if (currentCache?.data && Array.isArray(currentCache.data)) {
          currentCache.data.push(...newData);
        }
      },

      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page !== previousArg?.page;
      },
    }),

    getFollowing: builder.query<ResponseType, string | undefined>({
      query: (userId) => `social/${userId}/following`,
      providesTags: ['social-recall'],
    }),

    getAllRelations: builder.query<ResponseType, string | undefined>({
      query: (userId) => `social/${userId}/all-relations`,
      providesTags: ['social-recall'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          if (data?.data) {
            const { friends = [], followings = [], blockedUsers = [] } = data.data;

            dispatch(setFollowing(followings));
            dispatch(setFriends(friends));

            const blockedIds = blockedUsers
              .map((item: any) => item?.accountDetails?.userId?.toString())
              .filter(Boolean);

            dispatch(setBlockedUserIds(blockedIds));
          }
        } catch (err) {
          // Do nothing on error, or add error handling logic here
        }
      },
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

    reportUser: builder.mutation<any, { requesterId: string; targetUserId: string; reason: string }>({
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
