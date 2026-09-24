import api from "@/api/api";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// LOGIN
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (userData, { rejectWithValue }) => {
    try {
      const data = await api.post("/api/login", userData);
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { msg: "Unable to connect to the server" }
      );
    }
  }
);


// REGISTER
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const data = await api.post("/api/register", userData);
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { msg: "Unable to connect to the server" }
      );
    }
  }
);


const storedUser = localStorage.getItem("eventsphere_current_user");

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  error: null,
  loading: false,
};


const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.error = null;
      state.loading = false;
      localStorage.removeItem("eventsphere_current_user");
    },
  },

  extraReducers: (builder) => {

    builder

      // LOGIN PENDING
      .addCase(loginUser.pending, (state) => {

        state.loading = true;
        state.error = null;

      })


      // LOGIN FULFILLED
      .addCase(loginUser.fulfilled, (state, action) => {

        state.user = action.payload.user;
        state.loading = false;
        state.error = null;

        localStorage.setItem(
          "eventsphere_current_user",
          JSON.stringify(action.payload.user)
        );

      })


      // LOGIN REJECTED
      .addCase(loginUser.rejected, (state, action) => {

        state.loading = false;
        state.error = action.payload;

      })


      // REGISTER PENDING
      .addCase(registerUser.pending, (state) => {

        state.loading = true;
        state.error = null;

      })


      // REGISTER FULFILLED
      .addCase(registerUser.fulfilled, (state, action) => {

        state.loading = false;
        state.error = null;

      })


      // REGISTER REJECTED
      .addCase(registerUser.rejected, (state, action) => {

        state.loading = false;
        state.error = action.payload;

      });

  },

});


export const { logout } = authSlice.actions;

export default authSlice.reducer;