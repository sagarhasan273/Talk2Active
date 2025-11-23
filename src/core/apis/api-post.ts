import type { ResponseType } from 'src/types/type-common';
import type {
  CreatePostInput,
  UpdatePostInput,
  PostResponseType,
  GetPostsByUserIdInput,
} from 'src/types/type-post';

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { CONFIG } from 'src/config-global';

import { STORAGE_KEY } from 'src/auth/context/jwt';

export const postApi = createApi({
  reducerPath: 'postApi',
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
  tagTypes: ['post-recall'],
  endpoints: (builder) => ({
    getPosts: builder.query<{ data: PostResponseType[]; status: boolean }, { userId: string }>({
      query: ({ userId }) => {
        const input = JSON.stringify({ userId });
        return `post/list?input=${encodeURIComponent(input)}`;
      },
      providesTags: ['post-recall'],
    }),

    getPostsByUserId: builder.query<
      { data: PostResponseType[]; status: boolean },
      GetPostsByUserIdInput
    >({
      query: ({ userId, type }) => {
        const input = JSON.stringify({ userId, type });
        return `post/list/profile?input=${input}`;
      },
      providesTags: ['post-recall'],
    }),

    createPost: builder.mutation<ResponseType, Partial<CreatePostInput>>({
      query: (body) => ({
        url: `post/create`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['post-recall'],
    }),

    updatePost: builder.mutation<ResponseType, Partial<UpdatePostInput>>({
      query: (body) => ({
        url: `post/update`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['post-recall'],
    }),

    deletePost: builder.mutation<ResponseType, Partial<UpdatePostInput>>({
      query: (body) => ({
        url: `post/delete`,
        method: 'DELETE',
        body,
      }),
      invalidatesTags: ['post-recall'],
    }),

    updatePostEngagementLike: builder.mutation<ResponseType, Partial<any>>({
      query: (body) => ({
        url: `post-engagement/like`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),

    updatePostEngagementDisike: builder.mutation<ResponseType, Partial<any>>({
      query: (body) => ({
        url: `post-engagement/dislike`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),

    updatePostEngagementPin: builder.mutation<ResponseType, Partial<any>>({
      query: (body) => ({
        url: `post-engagement/pinpost`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
  }),
});

export const {
  useGetPostsQuery,
  useGetPostsByUserIdQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useUpdatePostEngagementLikeMutation,
  useUpdatePostEngagementDisikeMutation,
  useUpdatePostEngagementPinMutation,
} = postApi;
