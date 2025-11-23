import { configureStore } from '@reduxjs/toolkit';

import { roomSlice } from './slices/slice-room';
import { postsSlice } from './slices/slice-posts';
import { accountSlice } from './slices/slice-account';
import { userApi, postApi, chatApi, socialApi, settingsApi, suggestionApi } from './apis';

const apis = [userApi, settingsApi, postApi, socialApi, suggestionApi, chatApi];

// Combine reducers
const rootReducer = {
  account: accountSlice.reducer,
  posts: postsSlice.reducer,
  room: roomSlice.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [settingsApi.reducerPath]: settingsApi.reducer,
  [postApi.reducerPath]: postApi.reducer,
  [socialApi.reducerPath]: socialApi.reducer,
  [suggestionApi.reducerPath]: suggestionApi.reducer,
  [chatApi.reducerPath]: chatApi.reducer,
};

export const store = configureStore({
  // 2. Pass that pre-built object to the store. ✅
  reducer: rootReducer,

  // This middleware configuration will now work correctly.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apis.map((api) => api.middleware)),
});
