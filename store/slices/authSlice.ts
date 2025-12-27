import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";


const USER_ID = process.env.EXPO_PUBLIC_USER_ID_LOCAL;

export const fetchUser = createAsyncThunk(
  "auth/fetchUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(USER_ID!, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        // 👇 same error you were throwing before
        return rejectWithValue(data.error || "Failed");
      }

      // 👇 replaces setUserID(data.userId)
      return data.userId;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);


const authSlice = createSlice({
    name: "auth",
    initialState: {
      userId: null as string | null,
      loading: false,
      error: null as string | null,
    },
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(fetchUser.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchUser.fulfilled, (state, action) => {
          state.loading = false;
          state.userId = action.payload.userId;
        })
        .addCase(fetchUser.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload as string;
        });
    },
  });
  

  export default authSlice.reducer;