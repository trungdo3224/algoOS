import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../features/user/userSlice";
import problemReducer from "../features/problems/problemSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    problems: problemReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;