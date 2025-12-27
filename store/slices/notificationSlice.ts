import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const saveToken = createAsyncThunk(
  "notifications/saveToken",
  async (token: string) => {
    await fetch(process.env.EXPO_PUBLIC_SAVE_TOKEN_LOCAL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ token }),
    });
  }
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState: { status: "idle" as "idle" | "loading" | "success" },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(saveToken.pending, (state) => {
        state.status = "loading";
      })
      .addCase(saveToken.fulfilled, (state) => {
        state.status = "success";
      });
  },
});

export default notificationSlice.reducer;
