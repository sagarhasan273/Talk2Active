import type { ResponseType } from 'src/types/type-common';
import type { RelationshipInput } from 'src/types/type-social';

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { CONFIG } from 'src/config-global';

import { STORAGE_KEY } from 'src/auth/context/jwt';

export const socialApi = createApi({
  reducerPath: 'socialApi',
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
  tagTypes: ['social-recall'],
  endpoints: (builder) => ({
    follow: builder.mutation<{ message: string; status: boolean }, Partial<RelationshipInput>>({
      query: (body) => ({
        url: `social/follow`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['social-recall'],
    }),

    unfollow: builder.mutation<{ message: string; status: boolean }, Partial<RelationshipInput>>({
      query: (body) => ({
        url: `social/unfollow`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['social-recall'],
    }),

    getFriends: builder.query<ResponseType, string>({
      query: (userId) => `social/friends/${userId}`,
      providesTags: ['social-recall'],
    }),

    getFollowing: builder.query<ResponseType, string>({
      query: (userId) => `social/following/${userId}`,
      providesTags: ['social-recall'],
    }),

    getAllRelations: builder.query<ResponseType, string>({
      query: (userId) => `social/all-relations/${userId}`,
      providesTags: ['social-recall'],
    }),
  }),
});

export const {
  useFollowMutation,
  useUnfollowMutation,
  useGetFriendsQuery,
  useGetFollowingQuery,
  useGetAllRelationsQuery,
} = socialApi;
