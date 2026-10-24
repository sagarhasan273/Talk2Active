import { configureStore } from '@reduxjs/toolkit';

import {
  chatApi,
  feedbackApi,
  inventoryApi,
  messageApi,
  postApi,
  socialApi,
  suggestionApi,
  userApi,
} from './apis';
import { accountSlice, postsSlice, roomSlice } from './slices';

const apis = [userApi, postApi, socialApi, suggestionApi, chatApi, messageApi, inventoryApi, feedbackApi];

// Combine reducers
const rootReducer = {
  account: accountSlice.reducer,
  posts: postsSlice.reducer,
  room: roomSlice.reducer,

  [userApi.reducerPath]: userApi.reducer,
  [postApi.reducerPath]: postApi.reducer,
  [socialApi.reducerPath]: socialApi.reducer,
  [feedbackApi.reducerPath]: feedbackApi.reducer,
  [suggestionApi.reducerPath]: suggestionApi.reducer,
  [chatApi.reducerPath]: chatApi.reducer,
  [messageApi.reducerPath]: messageApi.reducer,
  [inventoryApi.reducerPath]: inventoryApi.reducer,
};

export const store = configureStore({
  reducer: rootReducer,

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apis.map((api) => api.middleware)),
});
