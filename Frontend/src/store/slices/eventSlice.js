import api from "@/api/api";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const createEvent = createAsyncThunk("event/createEvent", async (eventData, {rejectWithValue}) => {
  try {
    const data = await api.post("/api/event", eventData);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || {msg: "Unable to connect to the server"});
  }
});

export const fetchMyEvents = createAsyncThunk("event/fetchMyEvents", async (_, {rejectWithValue}) => {
  try {
    const data = await api.get("/api/event/mine");
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || {msg: "Unable to connect to the server"});
  }
});

export const deleteEvent = createAsyncThunk("event/deleteEvent", async (eventId, {rejectWithValue}) => {
  try {
    await api.delete(`/api/event/${eventId}`);
    return eventId;
  } catch (error) {
    return rejectWithValue(error.response?.data || {msg: "Unable to connect to the server"});
  }
});

const initialState = {
  events: [],
  error: null,
  loading: false,
};

const eventSlice = createSlice({
  name: "event",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyEvents.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyEvents.fulfilled, (state, action) => {
        state.events = action.payload.events;
        state.loading = false;
      })
      .addCase(fetchMyEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.events.push(action.payload.event);
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.events = state.events.filter((e) => e._id !== action.payload);
      });
  },
});

export default eventSlice.reducer;