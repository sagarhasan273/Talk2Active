import type { store } from './store';

// These types will now be inferred correctly from the full state.
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
