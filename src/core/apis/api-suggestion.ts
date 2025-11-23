import type { ResponseType } from 'src/types/type-common';

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { CONFIG } from 'src/config-global';

import { STORAGE_KEY } from 'src/auth/context/jwt';

export const suggestionApi = createApi({
  reducerPath: 'suggestionApi',
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
  tagTypes: ['suggestion-recall'],
  endpoints: (builder) => ({
    getNewUsers: builder.query<ResponseType, string>({
      query: (userId) => `suggestion/new-users/${userId}`,
      providesTags: ['suggestion-recall'],
    }),
  }),
});

export const { useGetNewUsersQuery } = suggestionApi;
