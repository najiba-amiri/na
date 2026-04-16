import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { financeApi } from "@/lib/financeApi";

export type TransactionItem = {
  id: number;
  amount: string;
  type: "in" | "out";
  category: string;
  payment_method: string;
  status: "pending" | "approved" | "rejected" | "paid";
  created_at: string;
  updated_at: string;
  admin_note?: string | null;
  wallet?: number;
  related_order?: number | null;
  wallet_user?: { id: number; username: string; email: string } | null;
};

type TransactionsState = {
  items: TransactionItem[];
  loading: boolean;
  error: string | null;

  // ✅ new for detail page
  current: TransactionItem | null;
  currentLoading: boolean;
  currentError: string | null;
};

const initialState: TransactionsState = {
  items: [],
  loading: false,
  error: null,

  current: null,
  currentLoading: false,
  currentError: null,
};

// ✅ you already have this
export const fetchMyTransactions = createAsyncThunk<
  TransactionItem[],
  void,
  { rejectValue: string }
>("transactions/fetchMy", async (_, { rejectWithValue }) => {
  try {
    const res = await financeApi.get("/finance/api/transactions/");
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    return rejectWithValue("Unexpected response from transactions API.");
  } catch (err: any) {
    const msg =
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      err?.message ||
      "Failed to load transactions.";
    return rejectWithValue(String(msg));
  }
});

// ✅ NEW: fetch one transaction by id
export const fetchTransactionById = createAsyncThunk<
  TransactionItem,
  number,
  { rejectValue: string }
>("transactions/fetchById", async (id, { rejectWithValue }) => {
  try {
    // DRF detail endpoint
    const res = await financeApi.get(`/finance/api/transactions/${id}/`);
    return res.data as TransactionItem;
  } catch (err: any) {
    const msg =
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      err?.message ||
      "Failed to load transaction details.";
    return rejectWithValue(String(msg));
  }
});

const transactionsSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    clearCurrentTransaction(state) {
      state.current = null;
      state.currentError = null;
      state.currentLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // list
      .addCase(fetchMyTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchMyTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load transactions.";
      })

      // detail
      .addCase(fetchTransactionById.pending, (state) => {
        state.currentLoading = true;
        state.currentError = null;
      })
      .addCase(fetchTransactionById.fulfilled, (state, action) => {
        state.currentLoading = false;
        state.current = action.payload;

        // optional: also sync into items list if missing
        const idx = state.items.findIndex((t) => t.id === action.payload.id);
        if (idx === -1) state.items.unshift(action.payload);
        else state.items[idx] = action.payload;
      })
      .addCase(fetchTransactionById.rejected, (state, action) => {
        state.currentLoading = false;
        state.currentError = action.payload || "Failed to load transaction details.";
      });
  },
});

export const { clearCurrentTransaction } = transactionsSlice.actions;
export default transactionsSlice.reducer;
