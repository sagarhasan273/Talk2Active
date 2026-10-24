import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { STORAGE_KEY } from 'src/auth/context/jwt';
import { CONFIG } from 'src/config-global';
import type { ResponseType } from 'src/types/type-common';

export interface FeedbackType {
  id: string; // Updated to match the backend JSON transform
  user: any; // Populated user object
  type: string;
  status: 'PENDING' | 'VIEWED_BY_ADMIN' | 'RESOLVED';
  content: string;
  images: string[];
  referenceUrl?: string;
  likeCount: number; // Replaced likes array
  dislikeCount: number; // Replaced dislikes array
  currentUserReaction?: 'LIKE' | 'DISLIKE' | null; // Dynamic state for the frontend
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

    updateFeedback: builder.mutation<{ status: boolean; data: { feedback: FeedbackType } }, Partial<any>>({
      query: (formData) => ({
        url: `feedback/update`,
        method: 'POST', // or 'PUT'/'PATCH' depending on your controller
        body: formData,
      }),
      // invalidatesTags: ['feedback-recall'],
    }),

    deleteFeedback: builder.mutation<ResponseType, string>({
      query: (id) => ({
        url: `feedback/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['feedback-recall'],
    }),

    reactToFeedback: builder.mutation<ResponseType, { feedbackId: string; action: 'LIKE' | 'DISLIKE' }>({
      query: ({ feedbackId, action }) => ({
        url: `feedback/${feedbackId}/react`,
        method: 'PUT',
        body: { action },
      }),
      // invalidatesTags: ['feedback-recall'],
    }),

    updateFeedbackStatus: builder.mutation<
      ResponseType,
      { feedbackId: string; status: 'PENDING' | 'VIEWED_BY_ADMIN' | 'RESOLVED'; page?: number; limit?: number }
    >({
      query: ({ feedbackId, status }) => ({
        url: `feedback/${feedbackId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      async onQueryStarted({ feedbackId, status, page = 1, limit = 10 }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          feedbackApi.util.updateQueryData('getFeedbacks', { page, limit }, (draft) => {
            const feedback = draft.data.feedbacks.find((fb) => fb.id === feedbackId);
            if (feedback) {
              feedback.status = status;
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const {
  useGetFeedbacksQuery,
  useCreateFeedbackMutation,
  useReactToFeedbackMutation,
  useUpdateFeedbackMutation,
  useDeleteFeedbackMutation,
  useUpdateFeedbackStatusMutation
} = feedbackApi;
