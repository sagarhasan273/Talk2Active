import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { CONFIG } from 'src/config-global';

import { STORAGE_KEY } from 'src/auth/context/jwt';
import { CreatePostInput, PostResponseType, UpdatePostInput } from 'src/types/post';

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

        createPost: builder.mutation<
            { message: string; status: boolean },
            Partial<CreatePostInput>
        >({
            query: (body) => ({
                url: `post/create`,
                method: 'POST',
                body,
            }),
            invalidatesTags: ['post-recall'],
        }),

        updatePostEngagementLike: builder.mutation<
            { message: string; status: boolean },
            Partial<any>
        >({
            query: (body) => ({
                url: `post-engagement/like`,
                method: 'POST',
                body,
            }),
            invalidatesTags: [],
        }),

        updatePostEngagementDisike: builder.mutation<
            { message: string; status: boolean },
            Partial<any>
        >({
            query: (body) => ({
                url: `post-engagement/dislike`,
                method: 'POST',
                body,
            }),
            invalidatesTags: [],
        }),
    }),
});

export const {
    useGetPostsQuery,
    useCreatePostMutation,
    useUpdatePostEngagementLikeMutation,
    useUpdatePostEngagementDisikeMutation,
} = postApi;
