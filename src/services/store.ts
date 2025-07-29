// store.ts
import { configureStore } from '@reduxjs/toolkit';

import { userApi } from './slices/user-api';

export const store = configureStore({
  reducer: {
    [userApi.reducerPath]: userApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(userApi.middleware),
});
