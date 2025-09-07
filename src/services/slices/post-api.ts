import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { CONFIG } from 'src/config-global';

import { STORAGE_KEY } from 'src/auth/context/jwt';
import { CreatePostInput } from 'src/types/post';

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
    }),
});

export const {
    useCreatePostMutation,
} = postApi;
