import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/api/api";

// SEND OTP
export const sendResetOtp = createAsyncThunk(
  "forgotPassword/sendResetOtp",
  async (email, { rejectWithValue }) => {
    try {
      const data = await api.post("/api/verify-email", { email });
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { error: "Unable to connect to the server" }
      );
    }
  }
);

// VERIFY OTP
export const verifyResetOtp = createAsyncThunk(
  "forgotPassword/verifyResetOtp",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const data = await api.post("/api/verify-otp", { email, otp });
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { error: "Unable to connect to the server" }
      );
    }
  }
);

// RESET PASSWORD
export const resetPassword = createAsyncThunk(
  "forgotPassword/resetPassword",
  async ({ email, otp, newPassword }, { rejectWithValue }) => {
    try {
      const data = await api.post("/api/reset-password", {
        email,
        otp,
        newPassword,
      });

      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { error: "Unable to connect to the server" }
      );
    }
  }
);

const initialState = {
  email: "",
  otp: "",
  loading: false,
  error: null,
};

const forgotPasswordSlice = createSlice({
  name: "forgotPassword",
  initialState,

  reducers: {
    setEmail: (state, action) => {
      state.email = action.payload;
    },

    setOtp: (state, action) => {
      state.otp = action.payload;
    },

    clearForgotPassword: (state) => {
      state.email = "";
      state.otp = "";
      state.loading = false;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // SEND OTP
      .addCase(sendResetOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendResetOtp.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(sendResetOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // VERIFY OTP
      .addCase(verifyResetOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyResetOtp.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(verifyResetOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // RESET PASSWORD
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setEmail,
  setOtp,
  clearForgotPassword,
} = forgotPasswordSlice.actions;

export default forgotPasswordSlice.reducer;