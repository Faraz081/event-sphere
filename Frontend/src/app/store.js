import { configureStore } from "@reduxjs/toolkit";

import authReducer from "@/features/auth/authSlice";
import forgotPasswordReducer from "@/features/auth/forgotPasswordSlice";
import boothReducer from "@/features/boothSlice";
import eventReducer from "@/features/eventSlice";
import messageReducer from "@/features/messageSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    forgotPassword: forgotPasswordReducer,
    booth: boothReducer,
    event: eventReducer,
    message: messageReducer,
  },
});