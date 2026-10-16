import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/api/api";

export const fetchWebsiteSettings = createAsyncThunk(
  "websiteSettings/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/website-settings");
      return response.data.settings;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error ||
          error.message ||
          "Could not load website settings"
      );
    }
  },
  {
    condition: (_, { getState }) => {
      const { loaded, loading } = getState().websiteSettings;
      return !loaded && !loading;
    },
  }
);

const websiteSettingsSlice = createSlice({
  name: "websiteSettings",
  initialState: {
    settings: null,
    loading: false,
    error: null,
    loaded: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWebsiteSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWebsiteSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
        state.loading = false;
        state.loaded = true;
      })
      .addCase(fetchWebsiteSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export default websiteSettingsSlice.reducer;
