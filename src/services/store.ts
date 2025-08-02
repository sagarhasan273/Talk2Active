import { configureStore } from '@reduxjs/toolkit';
import { apis } from './apis';

export const store = configureStore({
  // 1. Dynamically add the reducer for each API slice
  reducer: apis.reduce(
    (acc, api) => ({ ...acc, [api.reducerPath]: api.reducer }),
    {}
  ),

  // 2. Dynamically add the middleware for each API slice
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apis.map((api) => api.middleware)),
});