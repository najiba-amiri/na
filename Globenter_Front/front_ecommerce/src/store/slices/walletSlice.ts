import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { financeApi } from "@/lib/financeApi";

export type Wallet = {
  id: number;
  user: { id: number; username: string; email: string } | null;
  balance_total: string;      // DRF Decimal comes as string
  balance_escrow: string;
  balance_available: string;
};

type WalletState = {
  wallet: Wallet | null;
  loading: boolean;
  error: string | null;
};

const initialState: WalletState = {
  wallet: null,
  loading: false,
  error: null,
};

/**
 * Backend WalletViewSet returns list filtered by user
 * GET /finance/api/wallets/
 * Usually returns [ { wallet... } ] (one item array)
 */
export const fetchMyWallet = createAsyncThunk<
  Wallet | null,
  void,
  { rejectValue: string }
>("wallet/fetchMyWallet", async (_, { rejectWithValue }) => {
  try {
    const res = await financeApi.get<Wallet[]>("/finance/api/wallets/");
    const first = Array.isArray(res.data) ? res.data[0] : null;
    return first ?? null;
  } catch (err: any) {
    const msg =
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      "Failed to fetch wallet";
    return rejectWithValue(msg);
  }
});

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    clearWalletError(state) {
      state.error = null;
    },
    resetWalletState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyWallet.fulfilled, (state, action: PayloadAction<Wallet | null>) => {
        state.loading = false;
        state.wallet = action.payload;
      })
      .addCase(fetchMyWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch wallet";
      });
  },
});

export const { clearWalletError, resetWalletState } = walletSlice.actions;
export default walletSlice.reducer;
