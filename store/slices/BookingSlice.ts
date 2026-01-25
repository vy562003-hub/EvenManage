

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const API_BASE = process.env.EXPO_PUBLIC_API_URL_BOOKING;
const BOOK_NOW = process.env.EXPO_PUBLIC_API_URL_BOOKING_FINAL
const BOOKINGS = process.env.EXPO_PUBLIC_API_URL_BOOKINGS_CUSTOMER;

// 1️⃣ Async thunk
export const submitBooking = createAsyncThunk(
  "booking/submit",
  async (
    {
      customerId,
      organizerId,
      services,
      date,
      note,
    }: {
      customerId: string;
      organizerId: string;
      services: any[];
      date: string;
      note?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch(BOOK_NOW!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          organizerId,
          services,
          date,
          note,
          status: "pending",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data.error || "Booking failed");
      }

      return data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);


// Show all booking for a user 
export const fetchBookingHistory = createAsyncThunk(
    "bookingHistory/fetch",
    async (userId: string, { rejectWithValue }) => {
      try {
        console.log(userId,'userid from booking slice');
        
        const res:any = await fetch(`${BOOKINGS}/${userId}`);
        const data = await res.json();
        console.log('booking data from slice',res,"data",data);
        
  
        if (!res.ok) {
          return rejectWithValue(data.error || "Failed to fetch history");
        }
        if(data){
          return data || [];

        }else{
          return res["_data"]
        }
        
      } catch (err: any) {
        return rejectWithValue(err.message);
      }
    }
  );

const bookingSlice = createSlice({
    name: "booking",
    initialState: {
        list: [] as any[],
      loading: false,
      success: false,
      error: null as string | null,
    },
    reducers: {
      resetBookingState(state) {
        state.loading = false;
        state.success = false;
        state.error = null;
      },
    },
    extraReducers: (builder) => {
      builder

      // add here also update user bookings 
        .addCase(submitBooking.pending, (state) => {
          state.loading = true;
          state.error = null;
          state.success = false;
        })
        .addCase(submitBooking.fulfilled, (state) => {
          state.loading = false;
          state.success = true;
        })
        .addCase(submitBooking.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload as string;
        })

        // fetching customer users

        .addCase(fetchBookingHistory.pending, (state) => {
            state.loading = true;
            state.error = null;
          })
          .addCase(fetchBookingHistory.fulfilled, (state, action) => {
            state.loading = false;
            state.list = action.payload;
          })
          .addCase(fetchBookingHistory.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
          });
    },
  });
  
  export const { resetBookingState } = bookingSlice.actions;
  export default bookingSlice.reducer;
  