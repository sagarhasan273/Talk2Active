import type { IceServersResponse } from 'src/types/type-ice-servers';

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { CONFIG } from 'src/config-global';

import { STORAGE_KEY } from 'src/auth/context/jwt';

export const inventoryApi = createApi({
  reducerPath: 'inventoryApi',
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
  tagTypes: ['inventory-recall'],
  endpoints: (builder) => ({
    iceServers: builder.query<IceServersResponse, void>({
      query: () => `inventory/ice-servers`,
      providesTags: ['inventory-recall'],
    }),
  }),
});

export const { useIceServersQuery } = inventoryApi;
