import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { offleashApi } from "./api";

export const store = configureStore({
  reducer: {
    [offleashApi.reducerPath]: offleashApi.reducer,
  },
  middleware: (getDefault) => getDefault().concat(offleashApi.middleware),
});

// refetchOnFocus/refetchOnReconnect 지원
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
