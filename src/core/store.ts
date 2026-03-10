import { configureStore } from '@reduxjs/toolkit';

import { socialSlice } from './slices/slice-social';
import { roomSlice, postsSlice, accountSlice } from './slices';
import {
  userApi,
  postApi,
  chatApi,
  socialApi,
  messageApi,
  settingsApi,
  inventoryApi,
  suggestionApi,
} from './apis';

const apis = [userApi, settingsApi, postApi, socialApi, suggestionApi, chatApi, messageApi, inventoryApi];

// Combine reducers
const rootReducer = {
  account: accountSlice.reducer,
  posts: postsSlice.reducer,
  room: roomSlice.reducer,
  social: socialSlice.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [settingsApi.reducerPath]: settingsApi.reducer,
  [postApi.reducerPath]: postApi.reducer,
  [socialApi.reducerPath]: socialApi.reducer,
  [suggestionApi.reducerPath]: suggestionApi.reducer,
  [chatApi.reducerPath]: chatApi.reducer,
  [messageApi.reducerPath]: messageApi.reducer,
  [inventoryApi.reducerPath]: inventoryApi.reducer,
};

export const store = configureStore({
  // 2. Pass that pre-built object to the store. ✅
  reducer: rootReducer,

  // This middleware configuration will now work correctly.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apis.map((api) => api.middleware)),
});
