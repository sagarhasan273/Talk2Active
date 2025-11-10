import type { PayloadAction } from '@reduxjs/toolkit';
import type { PostResponseType } from 'src/types/post';

import { createSlice } from '@reduxjs/toolkit';

import type { RootState } from '../types';

// Define auth state interface
interface PostsState {
  posts: PostResponseType[];
  loading: boolean;
}

// Initial state
const initialState: PostsState = {
  posts: [] as PostResponseType[],
  loading: false,
};

export const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setPosts: (state, action: PayloadAction<PostsState['posts']>) => {
      state.posts = action.payload;
    },
    setPostsLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setPosts, setPostsLoading } = postsSlice.actions;

// Selectors with proper typing
export const selectPosts = (state: RootState) => state.posts.posts;
export const selectPostsLoading = (state: RootState) => state.posts.loading;
