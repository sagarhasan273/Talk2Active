import type { RelationshipInput } from 'src/types/social';

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
  }),
});

export const { useFollowMutation, useUnfollowMutation } = socialApi;
