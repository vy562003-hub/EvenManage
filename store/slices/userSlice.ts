import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { uploadOrganizerMedia,deleteOrganizerMedia,saveServicesAsync } from "./organizersSlice";

const USER_ID =process.env.EXPO_PUBLIC_USER_ID_LOCAL;
const API_BASE = process.env.EXPO_PUBLIC_API_BASE;
const LOGIN_CONNECT = process.env.EXPO_PUBLIC_LOGIN_CONNECT_LOCAL 


// 1️⃣ get user id using sessions 
export const fetchUser = createAsyncThunk(
  "user/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(USER_ID!, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || "Failed");
      }

      return data; // { userId: "..." }
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// fetch user by ID
export const fetchUserProfile = createAsyncThunk(
    "user/fetchProfile",
    async (userId: string, { rejectWithValue }) => {
      try {
        const res = await fetch(`${API_BASE}/${userId}`);
        const data = await res.json();
  
        if (!res.ok) {
          return rejectWithValue(data.error || "Failed to fetch profile");
        }
  
        return data; // full user object
      } catch (err: any) {
        return rejectWithValue(err.message);
      }
    }
  );


  /* ============================
   UPLOAD PROFILE IMAGE
============================ */
export const uploadProfileImage = createAsyncThunk(
    "user/uploadImage",
    async (
      {
        userId,
        uri,
      }: {
        userId: string;
        uri: string;
      },
      { rejectWithValue }
    ) => {
      try {
        const filename = uri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename || "");
        const type = match ? `image/${match[1]}` : "image";
  
        const formData = new FormData();
        formData.append(
          "image",
          { uri, name: filename, type } as any
        );
  
        const res = await fetch(`${API_BASE}/upload/${userId}`, {
          method: "POST",
          headers: { "Content-Type": "multipart/form-data" },
          body: formData,
          // ❗ DO NOT set Content-Type manually for multipart
        });
  
        const data = await res.json();
  
        if (!res.ok) {
          return rejectWithValue(data.error || "Upload failed");
        }
  
        return data; // ----> [ --> updated-user-object <-- ] <----
      } catch (err: any) {
        return rejectWithValue(err.message);
      }
    }
  );

  // update profile details

  
  export const updateUserProfile = createAsyncThunk(
    "user/updateProfile",
    async (
      {userId,obj}:any,
      { rejectWithValue }
    ) => {
      try {
        const res = await fetch(`${API_BASE}/${userId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(obj),
        });
  
        const data = await res.json();

        
  
        if (!res.ok) {
          return rejectWithValue(data.error || "Failed to update");
        }
  
        return data; // updated user object
      } catch (err: any) {
        return rejectWithValue(err.message);
      }
    }
  );


  // LOGIN 

  export const loginUser = createAsyncThunk(
    "user/login",
    async (
      {
        email,
        password,
        userType,
      }: {
        email: string;
        password: string;
        userType: string;
      },
      { rejectWithValue }
    ) => {
      try {

        let response = null as any;

        if(userType == 'customer'){
         response = await fetch(LOGIN_CONNECT!, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password, userType }),
        });
      }else{
        response = await fetch(LOGIN_CONNECT!, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          //credentials: "include",
          body: JSON.stringify({ email, password, userType }),
        });


      }
        
        
  
        const data = await response.json();
        console.log(data,'got organoizer data in thunk');
        
  
        if (!response.ok) {
          return rejectWithValue(data.error || "Login failed");
        }
  
        return data; 
        // expected: { userId, user }
      } catch (err: any) {
        return rejectWithValue(err.message);
      }
    }
  );

const userSlice = createSlice({
    name: "user",
    initialState: {
      userId: null as string | null,
      loading: false,
      error: null as string | null,
      userdata: null as any
    },
    reducers: {
      clearUser(state) {
        state.userId = null;
        state.error = null;
        state.loading = false;
      },
    },
    extraReducers: (builder) => {
      builder
        .addCase(fetchUser.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchUser.fulfilled, (state, action) => {
          state.loading = false;
          state.userId = action.payload.userId;
          state.userdata = action.payload;
        })
        .addCase(fetchUser.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload as string;
        })
        /* ===== FETCH PROFILE ===== */
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.userdata = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* ===== UPLOAD IMAGE ===== */
    .addCase(uploadProfileImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadProfileImage.fulfilled, (state, action) => {
        state.loading = false;
        state.userdata = action.payload;  // 🔥 server is new truth
      })
      .addCase(uploadProfileImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* ===== UPDATE PROFILE ===== */
    .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.userdata = action.payload; // 🔥 server is new truth
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* ===== LOGIN ===== */
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;

        // 🔥 adapt based on backend response
        state.userId =
          action.payload.userId || action.payload.user?._id;

        state.userdata =
          action.payload.user || action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // organizer upload media 
      .addCase(uploadOrganizerMedia.fulfilled, (state, action) => {
        state.loading = false;
        // update in userslice gallery
        state.userdata.gallery = action.payload; // 🔥 server is truth
      })
       // organizer delete media 

      .addCase(deleteOrganizerMedia.fulfilled, (state, action) => {
        state.loading = false;
        state.userdata.gallery = action.payload; // 🔥 server truth
      })

      // save updates of organizer services

      .addCase(saveServicesAsync.fulfilled, (state, action) => {
        state.loading = false;
        // optional: update services from server
        state.userdata.services = action.payload.services;
      })
    },
  });
  
  export const { clearUser } = userSlice.actions;
  export default userSlice.reducer;
  