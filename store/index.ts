import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import chatReducer from "./slices/chatSlice";
import organizersReducer from './slices/organizersSlice';
import bookingReducer from "./slices/BookingSlice";
import userReducer from "./slices/userSlice";



export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    organizers: organizersReducer,
    booking: bookingReducer,
    user: userReducer,


  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
