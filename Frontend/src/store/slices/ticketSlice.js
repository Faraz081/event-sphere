import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchExpoTickets,
  approveExpoTicket,
  rejectExpoTicket,
  cancelExpoTicket,
} from "@/api/adminTicketService";

export const loadTickets = createAsyncThunk(
  "tickets/load",
  async (params, { rejectWithValue }) => {
    try {
      const data = await fetchExpoTickets(params);
      return data.tickets;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Could not load tickets");
    }
  }
);

export const approveTicket = createAsyncThunk(
  "tickets/approve",
  async (id, { rejectWithValue }) => {
    try {
      const data = await approveExpoTicket(id);
      return data.ticket;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Could not approve ticket");
    }
  }
);

export const rejectTicket = createAsyncThunk(
  "tickets/reject",
  async ({ id, note }, { rejectWithValue }) => {
    try {
      const data = await rejectExpoTicket(id, note);
      return data.ticket;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Could not reject ticket");
    }
  }
);

export const cancelTicket = createAsyncThunk(
  "tickets/cancel",
  async ({ id, note }, { rejectWithValue }) => {
    try {
      const data = await cancelExpoTicket(id, note || "Cancelled by admin");
      return data.ticket;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Could not cancel ticket");
    }
  }
);

const replaceTicket = (state, action) => {
  state.items = state.items.map((t) =>
    t._id === action.payload._id ? action.payload : t
  );
};

const ticketSlice = createSlice({
  name: "tickets",
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(approveTicket.fulfilled, replaceTicket)
      .addCase(rejectTicket.fulfilled, replaceTicket)
      .addCase(cancelTicket.fulfilled, replaceTicket);
  },
});

export default ticketSlice.reducer;