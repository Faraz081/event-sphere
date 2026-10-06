import api from "@/api/api";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchExpos = createAsyncThunk(
  "booth/fetchExpos",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/exhibitor-profile/applications");
      const expos = data.applications.filter((a) => a.status === "approved" && a.expo).map((a) => a.expo);
      return { expos };
    } catch (error) {
      return rejectWithValue(error.response?.data || { msg: "Unable to connect to the server" });
    }
  }
);

// FETCH AVAILABLE BOOTHS
export const fetchAvailableBooths = createAsyncThunk(
  "booth/fetchAvailableBooths",
  async (expoId, { rejectWithValue }) => {
    try {
      const data = await api.get(`/api/booth/available?expo=${expoId}`);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { msg: "Unable to connect to the server" });
    }
  }
);

// RESERVE BOOTH
export const reserveBooth = createAsyncThunk(
  "booth/reserveBooth",
  async (boothId, { rejectWithValue }) => {
    try {
      const data = await api.put(`/api/booth/${boothId}/reserve`);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { msg: "Unable to connect to the server" });
    }
  }
);

// FETCH MY BOOTH
export const fetchMyBooth = createAsyncThunk(
  "booth/fetchMyBooth",
  async (_, { rejectWithValue }) => {
    try {
      const data = await api.get("/api/booth/mine");
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { msg: "Unable to connect to the server" });
    }
  }
);

// RELEASE BOOTH
export const releaseBooth = createAsyncThunk(
  "booth/releaseBooth",
  async (boothId, { rejectWithValue }) => {
    try {
      const data = await api.put(`/api/booth/${boothId}/release`);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { msg: "Unable to connect to the server" });
    }
  }
);

export const updateBoothDetails = createAsyncThunk("booth/updateBoothDetails", async ({boothId, products, staff}, {rejectWithValue}) => {
  try {
    const data = await api.put(`/api/booth/${boothId}/details`, {products, staff});
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || {msg: "Unable to connect to the server"});
  }
});

const initialState = {
  expos: [],
  booths: [],
  error: null,
  loading: false,
  myBooth: null,
  myBooths: [],
};

const boothSlice = createSlice({
  name: "booth",
  initialState,
  reducers: {},

  extraReducers: (builder) => {

    builder

      // FETCH EXPOS
      .addCase(fetchExpos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpos.fulfilled, (state, action) => {
        state.expos = action.payload.expos;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchExpos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // FETCH AVAILABLE BOOTHS
      .addCase(fetchAvailableBooths.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableBooths.fulfilled, (state, action) => {
        state.booths = action.payload.booths;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchAvailableBooths.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // RESERVE BOOTH
      .addCase(reserveBooth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reserveBooth.fulfilled, (state, action) => {
        state.booths = state.booths.filter((b) => b._id !== action.payload.booth._id);
        state.myBooths.push(action.payload.booth);
        state.myBooth = state.myBooths[0] ?? null;
        state.loading = false;
        state.error = null;
      })
      .addCase(reserveBooth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

        // FETCH MY BOOTH
      .addCase(fetchMyBooth.fulfilled, (state, action) => {
        state.myBooths = action.payload.booths ?? [action.payload.booth].filter(Boolean);
        state.myBooth = state.myBooths[0] ?? null;
      })
      .addCase(fetchMyBooth.rejected, (state) => {
        state.myBooth = null;
        state.myBooths = [];
      })

        // RELEASE BOOTH
      .addCase(releaseBooth.fulfilled, (state, action) => {
        state.myBooths = state.myBooths.filter((booth) => booth._id !== action.payload.booth._id);
        state.myBooth = state.myBooths[0] ?? null;
        state.loading = false;
        state.error = null;
      })
      .addCase(releaseBooth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateBoothDetails.fulfilled, (state, action) => {
        state.myBooths = state.myBooths.map((booth) => booth._id === action.payload.booth._id ? action.payload.booth : booth);
        state.myBooth = state.myBooths[0] ?? null;
      })
      .addCase(updateBoothDetails.rejected, (state, action) => {
        state.error = action.payload;
      })

  },
});

export default boothSlice.reducer;
