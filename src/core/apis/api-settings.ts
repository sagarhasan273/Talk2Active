import type {
  UpdateUserAppearanceType,
  UpdateUserNotificationType,
  UserPrivacySettingUpdateType,
} from 'src/types/settings';

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { CONFIG } from 'src/config-global';

import { STORAGE_KEY } from 'src/auth/context/jwt';

export const settingsApi = createApi({
  reducerPath: 'settingsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: CONFIG.serverUrl,
    prepareHeaders: (headers) => {
      const accessToken = sessionStorage.getItem(STORAGE_KEY);
      if (accessToken) {
        headers.set('authorization', `Bearer ${accessToken}`);
      }
      return headers;
    },
  }), // your REST API base
  tagTypes: ['user-recall'],
  endpoints: (builder) => ({
    updateUserPrivacy: builder.mutation<
      { message: string; status: boolean },
      Partial<UserPrivacySettingUpdateType>
    >({
      query: (body) => ({
        url: `settings/privacy`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['user-recall'],
    }),

    updateUserNotification: builder.mutation<
      { message: string; status: boolean },
      Partial<UpdateUserNotificationType>
    >({
      query: (body) => ({
        url: `settings/notification`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['user-recall'],
    }),

    updateUserAppearance: builder.mutation<
      { message: string; status: boolean },
      Partial<UpdateUserAppearanceType>
    >({
      query: (body) => ({
        url: `settings/appearance`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['user-recall'],
    }),
  }),
});

export const {
  useUpdateUserPrivacyMutation,
  useUpdateUserNotificationMutation,
  useUpdateUserAppearanceMutation,
} = settingsApi;
