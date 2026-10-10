import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/api/api";

export const fetchBookmarks = createAsyncThunk("bookmark/fetch", async (userId, { rejectWithValue }) => {
  try {
    const [events, expos] = await Promise.all([
      api.get("/api/attendee-portal/bookmarks"),
      api.get("/api/attendee-portal/expo-bookmarks"),
    ]);
    return { events: events.data.bookmarks, expos: expos.data.bookmarks };
  } catch (error) {
    return rejectWithValue(error.response?.data ?? { error: error.message });
  }
});

export const toggleBookmark = createAsyncThunk("bookmark/toggle", async (event, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/api/attendee-portal/bookmarks/${event._id}`);
    return { event, bookmarked: data.bookmarked };
  } catch (error) {
    return rejectWithValue(error.response?.data ?? { error: error.message });
  }
});

export const toggleExpoBookmark = createAsyncThunk("bookmark/toggleExpo", async (expo, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/api/attendee-portal/expo-bookmarks/${expo._id}`);
    return { expo, bookmarked: data.bookmarked };
  } catch (error) {
    return rejectWithValue(error.response?.data ?? { error: error.message });
  }
});

const bookmarkSlice = createSlice({
  name: "bookmark",
  initialState: { items: [], expoItems: [], loadedFor: null },
  reducers: {
    clearBookmarks: (state) => {
      state.items = [];
      state.expoItems = [];
      state.loadedFor = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookmarks.fulfilled, (state, action) => {
        state.items = action.payload.events;
        state.expoItems = action.payload.expos;
        state.loadedFor = action.meta.arg;
      })
      .addCase(fetchBookmarks.rejected, (state, action) => {
        state.loadedFor = action.meta.arg;
      })
      .addCase(toggleBookmark.fulfilled, (state, action) => {
        const { event, bookmarked } = action.payload;
        state.items = bookmarked
          ? [event, ...state.items.filter((e) => e._id !== event._id)]
          : state.items.filter((e) => e._id !== event._id);
      })
      .addCase(toggleExpoBookmark.fulfilled, (state, action) => {
        const { expo, bookmarked } = action.payload;
        state.expoItems = bookmarked
          ? [expo, ...state.expoItems.filter((e) => e._id !== expo._id)]
          : state.expoItems.filter((e) => e._id !== expo._id);
      });
  },
});

export const { clearBookmarks } = bookmarkSlice.actions;
export default bookmarkSlice.reducer;