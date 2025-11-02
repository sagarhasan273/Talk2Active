import { configureStore } from '@reduxjs/toolkit';

import { accountSlice } from './slices';
import { userApi, postApi, socialApi, settingsApi } from './apis';

const apis = [userApi, settingsApi, postApi, socialApi];

// Combine reducers
const rootReducer = {
  account: accountSlice.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [settingsApi.reducerPath]: settingsApi.reducer,
  [postApi.reducerPath]: postApi.reducer,
  [socialApi.reducerPath]: socialApi.reducer,
};

export const store = configureStore({
  // 2. Pass that pre-built object to the store. ✅
  reducer: rootReducer,

  // This middleware configuration will now work correctly.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apis.map((api) => api.middleware)),
});

// These types will now be inferred correctly from the full state.
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
