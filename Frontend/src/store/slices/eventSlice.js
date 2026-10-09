import api from "@/api/api";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const uploadEventImage = createAsyncThunk("event/uploadEventImage", async (file, {rejectWithValue}) => {
  try {
    const formData = new FormData();
    formData.append("image", file);

    const data = await api.post("/api/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || {msg: "Image upload failed"});
  }
});

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

export const fetchPendingEvents = createAsyncThunk("event/fetchPendingEvents", async (_, {rejectWithValue}) => {
  try {
    const data = await api.get("/api/admin/events/pending");
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || {msg: "Unable to connect to the server"});
  }
});

export const approveEvent = createAsyncThunk("event/approveEvent", async (eventId, {rejectWithValue}) => {
  try {
    const data = await api.put(`/api/admin/events/${eventId}/approve`);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || {msg: "Unable to connect to the server"});
  }
});

export const rejectEvent = createAsyncThunk("event/rejectEvent", async ({id, reason}, {rejectWithValue}) => {
  try {
    const data = await api.put(`/api/admin/events/${id}/reject`, {reason});
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || {msg: "Unable to connect to the server"});
  }
});

// TICKET REQUESTS (exhibitor)
export const fetchBookingRequests = createAsyncThunk("event/fetchBookingRequests", async (_, {rejectWithValue}) => {
  try {
    const data = await api.get("/api/attendee-portal/requests");
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || {msg: "Unable to connect to the server"});
  }
});

export const approveBooking = createAsyncThunk("event/approveBooking", async (bookingId, {rejectWithValue}) => {
  try {
    const data = await api.put(`/api/attendee-portal/requests/${bookingId}/approve`);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || {msg: "Unable to connect to the server"});
  }
});

export const rejectBooking = createAsyncThunk("event/rejectBooking", async ({id, note}, {rejectWithValue}) => {
  try {
    const data = await api.put(`/api/attendee-portal/requests/${id}/reject`, {note});
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || {msg: "Unable to connect to the server"});
  }
});

export const updateEvent = createAsyncThunk("event/update", async ({id, data}, {rejectWithValue}) => {
  try {
    const res = await api.put(`/api/event/${id}`, data);
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || {error: "Could not update event"});
  }
});

export const addStall = createAsyncThunk("event/addStall", async ({eventId, data}, {rejectWithValue}) => {
  try {
    const res = await api.post(`/api/event/${eventId}/stalls`, data);
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || {error: "Unable to connect to the server"});
  }
});

export const updateStall = createAsyncThunk("event/updateStall", async ({eventId, stallId, data}, {rejectWithValue}) => {
  try {
    const res = await api.put(`/api/event/${eventId}/stalls/${stallId}`, data);
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || {error: "Unable to connect to the server"});
  }
});

export const deleteStall = createAsyncThunk("event/deleteStall", async ({eventId, stallId}, {rejectWithValue}) => {
  try {
    const res = await api.delete(`/api/event/${eventId}/stalls/${stallId}`);
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || {error: "Unable to connect to the server"});
  }
});

const initialState = {
  events: [],
  pendingEvents: [],
  requests: [],
  error: null,
  loading: false,
};

const replaceStalls = (state, action) => {
  const updated = action.payload.event;
  state.events = state.events.map((e) => (e._id === updated._id ? {...e, stalls: updated.stalls} : e));
};

const applyDecision = (state, booking) => {
  state.requests = state.requests.map((r) =>
    r._id === booking._id
      ? {...r, bookingStatus: booking.bookingStatus, passCode: booking.passCode, passStatus: booking.passStatus, decisionNote: booking.decisionNote}
      : r
  );
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
        state.requests = state.requests.map((r) =>
          r.event?._id === action.payload ? {...r, bookingStatus: "cancelled", decisionNote: "This event was cancelled by the exhibitor"} : r
        );
      })
      .addCase(fetchPendingEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingEvents.fulfilled, (state, action) => {
        state.pendingEvents = action.payload.events;
        state.loading = false;
      })
      .addCase(fetchPendingEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(approveEvent.fulfilled, (state, action) => {
        state.pendingEvents = state.pendingEvents.filter((event) => event._id !== action.payload.event._id);
      })
      .addCase(rejectEvent.fulfilled, (state, action) => {
        state.pendingEvents = state.pendingEvents.filter((event) => event._id !== action.payload.event._id);
      })
      .addCase(fetchBookingRequests.fulfilled, (state, action) => {
        state.requests = action.payload.requests;
      })
      .addCase(fetchBookingRequests.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(approveBooking.fulfilled, (state, action) => {
        applyDecision(state, action.payload.booking);
      })
      .addCase(rejectBooking.fulfilled, (state, action) => {
        applyDecision(state, action.payload.booking);
      })
      .addCase(addStall.fulfilled, replaceStalls)
      .addCase(updateStall.fulfilled, replaceStalls)
      .addCase(deleteStall.fulfilled, replaceStalls);
  },
});

export default eventSlice.reducer;