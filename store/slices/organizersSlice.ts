import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || "http://YOUR_SERVER_URL";
const API_BASE_ID = process.env.EXPO_PUBLIC_API_URL_ID || "http://YOUR_SERVER_URL";
const API_MAIN = process.env.EXPO_PUBLIC_API_BASE_ORGANIZER;


// 1️⃣ fetches all organizer details
export const fetchOrganizers = createAsyncThunk(
  'organizers/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(API_BASE!);
      const data = await res.json();
      return data || [];
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);


/* 2️⃣ FETCH ORGANIZER BY ID
 */
export const fetchOrganizerById = createAsyncThunk(
  "organizers/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_ID}/${id}`,{ credentials: "include",
    });
      const data = await res.json();
      console.log(data,'organizer data');
      
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);



/* ============================
   FETCH DASHBOARD STATS
============================ */
export const fetchDashboardStats = createAsyncThunk(
    "dashboard/fetchStats",
    async (userId: string, { rejectWithValue }) => {
      try {
        const res = await fetch(
          `${API_MAIN}/api/booking/organizer/${userId}`
        );
  
        const data = await res.json();
  
        if (!res.ok) {
          return rejectWithValue(data.error || "Failed to load stats");
        }
  
        // 🔥 compute stats here (business logic belongs in Redux)
        const pending = data.filter(
          (b: any) => b.status === "pending"
        ).length;
  
        const completed = data.filter(
          (b: any) => b.status === "completed"
        ).length;
  
        return {
          total: data.length,
          pending,
          completed,
        };
      } catch (err: any) {
        return rejectWithValue(err.message);
      }
    }
  );


  /* ============================
   UPLOAD ORGANIZER MEDIA
============================ */
export const uploadOrganizerMedia = createAsyncThunk(
    "organizerMedia/upload",
    async (
      {
        userId,
        file,
      }: {
        userId: string;
        file: any;
      },
      { rejectWithValue }
    ) => {
      try {
        const uri = file.uri;
        const filename = uri.split("/").pop();
        const ext = filename?.split(".").pop();
  
        const type =
          file.type === "video"
            ? `video/${ext}`
            : `image/${ext}`;
  
        const formData = new FormData();
        formData.append(
          "file",
          { uri, name: filename, type } as any
        );

        console.log(`${API_MAIN}/api/organizer/gallery/upload/${userId}`,'`${API_MAIN}/api/organizer/gallery/upload/${userId}`');
        
  
        const res = await fetch(
          `${API_MAIN}/api/organizer/gallery/upload/${userId}`,
          {
            method: "POST",
            body: formData,
            // ❗ DO NOT set Content-Type manually
          }
        );
  
        const data = await res.json();
  
        if (!res.ok) {
          return rejectWithValue(data.error || "Upload failed");
        }
  
        return data; // updated gallery array
      } catch (err: any) {
        return rejectWithValue(err.message);
      }
    }
  );

// delete the data
  export const deleteOrganizerMedia = createAsyncThunk(
    "organizerMedia/delete",
    async (
      {
        userId,
        url,
      }: {
        userId: string;
        url: string;
      },
      { rejectWithValue }
    ) => {
      try {
        const res = await fetch(
          `${API_MAIN}/api/organizer/gallery/delete/${userId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url }),
          }
        );
  
        const data = await res.json();
  
        if (!res.ok) {
          return rejectWithValue(data.error || "Delete failed");
        }
  
        return data; // updated gallery array
      } catch (err: any) {
        return rejectWithValue(err.message);
      }
    }
  );


  // organizer services changes

  export const saveServicesAsync = createAsyncThunk(
    "services/save",
    async (
      {
        userId,
        services,
      }: {
        userId: string;
        services: any[];
      },
      { rejectWithValue }
    ) => {
      try {
        const res = await fetch(
          `${API_MAIN}/api/organizer/services/${userId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ services }),
          }
        );
  
        const data = await res.json();

        
  
        if (!res.ok) {
          return rejectWithValue(
            data.error || "Failed to save services"
          );
        }
  
        return data; // backend response (updated organizer / services)
      } catch (err: any) {
        return rejectWithValue(err.message);
      }
    }
  );


  /* ============================
   UPDATE BOOKING STATUS
============================ */
export const updateBookingStatus = createAsyncThunk(
    "booking/updateStatus",
    async (
      {
        bookingId,
        status,
      }: {
        bookingId: string;
        status: string;
      },
      { rejectWithValue }
    ) => {
      try {
        const res = await fetch(
          `${API_MAIN}/api/booking/${bookingId}/status`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          }
        );
  
        const data = await res.json();
  
        if (!res.ok) {
          return rejectWithValue(data.error || "Status update failed");
        }
  
        return {
          bookingId,
          status,
        };
      } catch (err: any) {
        return rejectWithValue(err.message);
      }
    }
  );

  /* ============================
   LOAD ORGANIZER BOOKINGS
============================ */
export const fetchOrganizerBookings = createAsyncThunk(
    "booking/fetchOrganizerBookings",
    async (userId: string, { rejectWithValue }) => {
      try {
        const res = await fetch(
          `${API_MAIN}/api/booking/organizer/${userId}`
        );
  
        const data = await res.json();
  
        if (!res.ok) {
          return rejectWithValue(
            data.error || "Failed to fetch bookings"
          );
        }
  
        return data; // bookings array
      } catch (err: any) {
        return rejectWithValue(err.message);
      }
    }
  );


  
/* ============================
   UPLOAD BILL PDF
============================ */
export const uploadBookingBill = createAsyncThunk(
    "booking/uploadBill",
    async (
      {
        bookingId,
        file,
      }: {
        bookingId: string;
        file: any;
      },
      { rejectWithValue }
    ) => {
      try {
        const formData = new FormData();
        formData.append("bill", {
          uri: file.uri,
          name: file.name,
          type: "application/pdf",
        } as any);
  
        const res = await fetch(
          `${API_MAIN}/api/booking/upload-bill/${bookingId}`,
          {
            method: "POST",
            body: formData,
            // ❗ DO NOT set Content-Type manually
          }
        );
  
        const data = await res.json();
  
        if (!res.ok) {
          return rejectWithValue(data.error || "Upload failed");
        }
  
        return data; // updated booking
      } catch (err: any) {
        return rejectWithValue(err.message);
      }
    }
  );


  /* ============================
   FETCH SINGLE BOOKING
============================ */
export const fetchBookingById = createAsyncThunk(
    "booking/fetchById",
    async (bookingId: string, { rejectWithValue }) => {
      try {
        const res = await fetch(`${API_MAIN}/api/booking/${bookingId}`);
        const data = await res.json();
  
        if (!res.ok) {
          return rejectWithValue(
            data.error || "Failed to fetch booking"
          );
        }
  
        return data; // single booking object
      } catch (err: any) {
        return rejectWithValue(err.message);
      }
    }
  );


// 2️⃣ Slice
const organizersSlice = createSlice({
  name: 'organizers',
  initialState: {
      // list screen
      userId: null as any,
      list: [] as any[],  // customer side -> stores list of organizers , organizer side -> stores list of booking by organizer
      loading: true,
  
      // details screen
      selectedOrganizer: null as any, // customer -> show page of organizer , organizer -> a selected booking
      bigMedia: null as any,
      stats: {
        total: 0,
        pending: 0,
        completed: 0,
      },
  
      error: null as string | null,
  },
  reducers: {
    // 🔹 when user taps on gallery item
    setBigMedia(state, action) {
      state.bigMedia = action.payload;
    },

    // 🔹 cleanup when leaving details screen
    clearSelectedOrganizer(state) {
      state.selectedOrganizer = null;
      state.bigMedia = null;
      state.loading = true;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrganizers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrganizers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchOrganizers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })


      //for by id

      .addCase(fetchOrganizerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrganizerById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrganizer = action.payload;
        state.userId = action.payload.userId

        // ⭐ SAME LOGIC YOU HAD IN useEffect
        if (action.payload?.gallery?.length > 0) {
          state.bigMedia = action.payload.gallery[0];
        }
      })
      .addCase(fetchOrganizerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // stats organizer home page

      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // upload media

      builder
      .addCase(uploadOrganizerMedia.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      /* .addCase(uploadOrganizerMedia.fulfilled, (state, action) => {
        state.loading = false;
        // update in userslice gallery
        state.userdata.gallery = action.payload; // 🔥 server is truth
      }) */
      .addCase(uploadOrganizerMedia.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* ===== DELETE MEDIA ===== */
      .addCase(deleteOrganizerMedia.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      /* .addCase(deleteOrganizerMedia.fulfilled, (state, action) => {
        state.loading = false;
        state.gallery = action.payload; // 🔥 server truth
      }) */
      .addCase(deleteOrganizerMedia.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // services update 

      /* ===== SAVE SERVICES ===== */
      .addCase(saveServicesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      /* .addCase(saveServicesAsync.fulfilled, (state, action) => {
        state.loading = false;
        // optional: update services from server
        state.services = action.payload.services ?? state.services;
      })  in user slice*/
      .addCase(saveServicesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* ===== UPDATE STATUS ===== */
      .addCase(updateBookingStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        state.loading = false;

        const { bookingId, status } = action.payload;

        const booking = state.list.find(
          (b) => b._id === bookingId
        );
        if (booking) {
          booking.status = status;
        }
      })
      .addCase(updateBookingStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* ===== LOAD BOOKINGS ===== */
      .addCase(fetchOrganizerBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrganizerBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchOrganizerBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

       /* ===== FETCH SINGLE ===== */
       .addCase(fetchBookingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrganizer = action.payload;
      })
      .addCase(fetchBookingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      

      /* ===== UPLOAD BILL ===== */
      .addCase(uploadBookingBill.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadBookingBill.fulfilled, (state, action) => {
        state.loading = false;

        // 🔥 update booking inside list
        const updated = action.payload;
        const index = state.list.findIndex(
          (b) => b._id === updated._id
        );

        if (index !== -1) {
          state.list[index] = updated;
        }

        state.selectedOrganizer = updated;
      })
      .addCase(uploadBookingBill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
    setBigMedia,
    clearSelectedOrganizer,
  } = organizersSlice.actions;

export default organizersSlice.reducer;
