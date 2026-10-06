import { configureStore } from "@reduxjs/toolkit";

import authReducer from "@/store/slices/authSlice";
import forgotPasswordReducer from "@/store/slices/forgotPasswordSlice";
import boothReducer from "@/store/slices/boothSlice";
import eventReducer from "@/store/slices/eventSlice";
import messageReducer from "@/store/slices/messageSlice";
import ticketReducer from "./slices/ticketSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    forgotPassword: forgotPasswordReducer,
    booth: boothReducer,
    event: eventReducer,
    message: messageReducer,
    tickets: ticketReducer,
  },
});