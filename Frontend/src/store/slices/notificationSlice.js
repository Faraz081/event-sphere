import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/api/api";

export const fetchNotifications = createAsyncThunk("notification/fetch", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/api/attendee-portal/notifications");
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data ?? { error: error.message });
  }
});

export const markNotificationRead = createAsyncThunk("notification/read", async (id, { rejectWithValue }) => {
  try {
    await api.put(`/api/attendee-portal/notifications/${id}/read`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data ?? { error: error.message });
  }
});

export const markAllNotificationsRead = createAsyncThunk("notification/readAll", async (_, { rejectWithValue }) => {
  try {
    await api.put("/api/attendee-portal/notifications/read-all");
    return true;
  } catch (error) {
    return rejectWithValue(error.response?.data ?? { error: error.message });
  }
});

const notificationSlice = createSlice({
  name: "notification",
  initialState: { items: [], unreadCount: 0, loaded: false },
  reducers: {
    clearNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
      state.loaded = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.items = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
        state.loaded = true;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const item = state.items.find((n) => n._id === action.payload);

        if (item && !item.isRead) {
          item.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.items.forEach((n) => { n.isRead = true; });
        state.unreadCount = 0;
      });
  },
});

export const { clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;