import { configureStore } from "@reduxjs/toolkit";
import { weatherApi } from "./api/weatherApi";
import { geocodingApi } from "./api/geocodingApi";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    [weatherApi.reducerPath]: weatherApi.reducer,
    [geocodingApi.reducerPath]: geocodingApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(weatherApi.middleware)
      .concat(geocodingApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
