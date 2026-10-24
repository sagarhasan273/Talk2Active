import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { STORAGE_KEY } from 'src/auth/context/jwt';
import { CONFIG } from 'src/config-global';
import type { ResponseType } from 'src/types/type-common';

// Adjust these types based on your actual data structures
export interface FeedbackType {
  _id: string;
  userId: any;
  type: string;
  content: string;
  images: string[];
  referenceUrl?: string;
  likes: string[];
  dislikes: string[];
  createdAt: string;
}

export interface GetFeedbacksArgs {
  page?: number;
  limit?: number;
}

export const feedbackApi = createApi({
  reducerPath: 'feedbackApi',
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
  tagTypes: ['feedback-recall'],
  endpoints: (builder) => ({
    getFeedbacks: builder.query<{ data: { feedbacks: FeedbackType[]; pagination: any }; status: boolean }, GetFeedbacksArgs>({
      query: ({ page = 1, limit = 10 }) => {
        return `feedback/get?page=${page}&limit=${limit}`;
      },
      providesTags: ['feedback-recall'],
    }),

    createFeedback: builder.mutation<ResponseType, Partial<any>>({
      query: (body) => ({
        url: `feedback/create`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['feedback-recall'],
    }),

    reactToFeedback: builder.mutation<ResponseType, { feedbackId: string; action: 'LIKE' | 'DISLIKE' }>({
      query: ({ feedbackId, action }) => ({
        url: `feedback/${feedbackId}/react`,
        method: 'PUT',
        body: { action },
      }),
      // Avoid full refetch on reaction if possible, or keep it simple and invalidate:
      invalidatesTags: ['feedback-recall'],
    }),

    uploadFeedbackImage: builder.mutation<{ status: boolean; data: { imageUrl: string } }, FormData>({
      query: (formData) => ({
        url: `upload/image`, // Update this to match your actual backend upload route
        method: 'POST',
        body: formData,
      }),
      // No invalidation needed here, it just returns a URL to be used in createFeedback
    }),
  }),
});

export const {
  useGetFeedbacksQuery,
  useCreateFeedbackMutation,
  useReactToFeedbackMutation,
  useUploadFeedbackImageMutation,
} = feedbackApi;