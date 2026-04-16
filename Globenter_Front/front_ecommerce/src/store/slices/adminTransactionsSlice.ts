import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { financeApi } from "@/lib/financeApi";

export type AdminTransaction = {
  id: number;
  wallet: number;
  amount: string;
  type: "in" | "out";
  category: "order_payment" | "commission" | "payout" | "refund" | "adjustment";
  payment_method: "internal" | "bank";
  status: "pending" | "approved" | "rejected" | "paid";
  related_order: number | null;
  created_at: string;
  updated_at: string;
  admin_note: string | null;
};

type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

function normalizeListResponse<T>(data: any): {
  results: T[];
  next: string | null;
  count: number | null;
} {
  if (Array.isArray(data)) {
    return { results: data as T[], next: null, count: (data as T[]).length };
  }
  if (data && Array.isArray(data.results)) {
    return {
      results: data.results as T[],
      next: data.next ?? null,
      count: typeof data.count === "number" ? data.count : null,
    };
  }
  return { results: [], next: null, count: null };
}

export type AdminTxFilters = {
  status?: "" | "pending" | "approved" | "rejected" | "paid";
  type?: "" | "in" | "out";
  category?: "" | "order_payment" | "commission" | "payout" | "refund" | "adjustment";
  payment_method?: "" | "internal" | "bank";
  wallet?: "" | string; // wallet id
  from?: "" | string;   // YYYY-MM-DD
  to?: "" | string;     // YYYY-MM-DD
};

type AdminTransactionsState = {
  items: AdminTransaction[];
  loading: boolean;
  error: string | null;
  next: string | null;
  count: number | null;
  filters: AdminTxFilters;
};

const initialState: AdminTransactionsState = {
  items: [],
  loading: false,
  error: null,
  next: null,
  count: null,
  filters: {
    status: "",
    type: "",
    category: "",
    payment_method: "",
    wallet: "",
    from: "",
    to: "",
  },
};

function buildQuery(filters: AdminTxFilters) {
  const p = new URLSearchParams();
  if (filters.status) p.set("status", filters.status);
  if (filters.type) p.set("type", filters.type);
  if (filters.category) p.set("category", filters.category);
  if (filters.payment_method) p.set("payment_method", filters.payment_method);
  if (filters.wallet) p.set("wallet", filters.wallet);
  if (filters.from) p.set("from", filters.from);
  if (filters.to) p.set("to", filters.to);
  const q = p.toString();
  return q ? `?${q}` : "";
}

/**
 * GET /finance/api/transactions/ (admin sees all)
 */
export const fetchAdminTransactions = createAsyncThunk<
  { items: AdminTransaction[]; next: string | null; count: number | null },
  void,
  { state: any; rejectValue: string }
>("adminTx/fetch", async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState() as any;
    const filters: AdminTxFilters = state.adminTransactions?.filters ?? {};
    const qs = buildQuery(filters);

    const res = await financeApi.get<AdminTransaction[] | Paginated<AdminTransaction>>(
      `/finance/api/transactions/${qs}`
    );
    const normalized = normalizeListResponse<AdminTransaction>(res.data);
    return { items: normalized.results, next: normalized.next, count: normalized.count };
  } catch (err: any) {
    const status = err?.response?.status;
    const msg =
      status === 403
        ? "Admin access required."
        : err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to fetch transactions";
    return rejectWithValue(msg);
  }
});

const adminTransactionsSlice = createSlice({
  name: "adminTransactions",
  initialState,
  reducers: {
    clearAdminTransactionsError(state) {
      state.error = null;
    },
    resetAdminTransactionsState() {
      return initialState;
    },
    setAdminTxFilters(state, action: PayloadAction<Partial<AdminTxFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetAdminTxFilters(state) {
      state.filters = {
        status: "",
        type: "",
        category: "",
        payment_method: "",
        wallet: "",
        from: "",
        to: "",
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAdminTransactions.fulfilled,
        (
          state,
          action: PayloadAction<{ items: AdminTransaction[]; next: string | null; count: number | null }>
        ) => {
          state.loading = false;
          state.items = action.payload.items;
          state.next = action.payload.next;
          state.count = action.payload.count;
        }
      )
      .addCase(fetchAdminTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch transactions";
      });
  },
});

export const {
  clearAdminTransactionsError,
  resetAdminTransactionsState,
  setAdminTxFilters,
  resetAdminTxFilters,
} = adminTransactionsSlice.actions;

export default adminTransactionsSlice.reducer;
