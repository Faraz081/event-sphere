import api from "@/api/api";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// FETCH CONTACTS
export const fetchContacts = createAsyncThunk(
  "message/fetchContacts",
  async (_, { rejectWithValue }) => {
    try {
      const data = await api.get("/api/message/contacts");
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { msg: "Unable to connect to the server" });
    }
  }
);

// FETCH CONVERSATION
export const fetchConversation = createAsyncThunk(
  "message/fetchConversation",
  async (userId, { rejectWithValue }) => {
    try {
      const data = await api.get(`/api/message/${userId}`);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { msg: "Unable to connect to the server" });
    }
  }
);

// SEND MESSAGE
export const sendMessage = createAsyncThunk(
  "message/sendMessage",
  async ({ receiver, content }, { rejectWithValue }) => {
    try {
      const data = await api.post("/api/message", { receiver, content });
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { msg: "Unable to connect to the server" });
    }
  }
);

// FETCH UNREAD COUNTS
export const fetchUnreadCounts = createAsyncThunk(
  "message/fetchUnreadCounts",
  async (_, { rejectWithValue }) => {
    try {
      const data = await api.get("/api/message/unread");
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { msg: "Unable to connect to the server" });
    }
  }
);

// MARK AS READ
export const markAsRead = createAsyncThunk(
  "message/markAsRead",
  async (userId, { rejectWithValue }) => {
    try {
      const data = await api.put(`/api/message/${userId}/read`);
      return { userId, ...data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { msg: "Unable to connect to the server" });
    }
  }
);

const initialState = {
  contacts: [],
  conversation: [],
  unread: [],
  error: null,
  loading: false,
};

const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {},

  extraReducers: (builder) => {

    builder

      // FETCH CONTACTS
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.contacts = action.payload.contacts;
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.error = action.payload;
      })

      // FETCH CONVERSATION
      .addCase(fetchConversation.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchConversation.fulfilled, (state, action) => {
        state.conversation = action.payload.messages;
        state.loading = false;
      })
      .addCase(fetchConversation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // SEND MESSAGE
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.conversation.push(action.payload.message);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload;
      })

      // FETCH UNREAD COUNTS
      .addCase(fetchUnreadCounts.fulfilled, (state, action) => {
        state.unread = action.payload.unread;
      })

      // MARK AS READ
      .addCase(markAsRead.fulfilled, (state, action) => {
        state.unread = state.unread.filter((u) => u._id !== action.payload.userId);
      });

  },
});

export default messageSlice.reducer;