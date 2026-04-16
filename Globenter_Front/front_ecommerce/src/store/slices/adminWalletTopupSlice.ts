import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { financeApi } from "@/lib/financeApi";


type TopupPayload = {
  user_id?: number;
  email?: string;
  amount: string | number;
  note?: string;
};

type TopupResult = {
  wallet: any;
  transaction: any;
};

type AdminWalletTopupState = {
  loading: boolean;
  error: string | null;
  lastResult: TopupResult | null;
};

const initialState: AdminWalletTopupState = {
  loading: false,
  error: null,
  lastResult: null,
};

export const adminTopupWallet = createAsyncThunk<
  TopupResult,
  TopupPayload,
  { rejectValue: string }
>("adminWalletTopup/topup", async (payload, { rejectWithValue }) => {
  try {
    // ✅ MUST end with slash because APPEND_SLASH=True (and POST)
    const res = await financeApi.post(
      `/finance/api/wallets/admin/topup/`,
      payload
    );
    return res.data as TopupResult;
  } catch (err: any) {
    const msg =
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      JSON.stringify(err?.response?.data || {}) ||
      err?.message ||
      "Topup failed";
    return rejectWithValue(msg);
  }
});

const adminWalletTopupSlice = createSlice({
  name: "adminWalletTopup",
  initialState,
  reducers: {
    clearAdminTopupError(state) {
      state.error = null;
    },
    clearAdminTopupResult(state) {
      state.lastResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(adminTopupWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminTopupWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.lastResult = action.payload;
      })
      .addCase(adminTopupWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Topup failed";
      });
  },
});

export const { clearAdminTopupError, clearAdminTopupResult } =
  adminWalletTopupSlice.actions;

export default adminWalletTopupSlice.reducer;
