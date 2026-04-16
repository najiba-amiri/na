import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { financeApi } from "@/lib/financeApi";

export type AdminPayoutRequest = {
  id: number;
  wallet: number;
  amount: string;
  payment_method: "internal" | "bank";
  bank_account: string | null;
  status: "pending" | "approved" | "rejected" | "paid";
  receipt_file: string | null;
  created_at: string;
  updated_at: string;
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

type AdminPayoutState = {
  items: AdminPayoutRequest[];
  loading: boolean;
  updating: boolean;
  error: string | null;
  next: string | null;
  count: number | null;
};

const initialState: AdminPayoutState = {
  items: [],
  loading: false,
  updating: false,
  error: null,
  next: null,
  count: null,
};

/**
 * ✅ Admin list (your backend get_queryset returns ALL for staff)
 * GET /finance/api/payout-requests/
 */
export const fetchAdminPayoutRequests = createAsyncThunk<
  { items: AdminPayoutRequest[]; next: string | null; count: number | null },
  void,
  { rejectValue: string }
>("adminPayout/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const res = await financeApi.get<AdminPayoutRequest[] | Paginated<AdminPayoutRequest>>(
      "/finance/api/payout-requests/"
    );
    const normalized = normalizeListResponse<AdminPayoutRequest>(res.data);
    return { items: normalized.results, next: normalized.next, count: normalized.count };
  } catch (err: any) {
    const status = err?.response?.status;
    const msg =
      status === 403
        ? "Admin access required."
        : err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to fetch payout requests";
    return rejectWithValue(msg);
  }
});

/**
 * POST /finance/api/payout-requests/:id/approve/
 */
export const adminApprovePayout = createAsyncThunk<
  AdminPayoutRequest,
  { id: number },
  { rejectValue: string }
>("adminPayout/approve", async ({ id }, { rejectWithValue }) => {
  try {
    const res = await financeApi.post<AdminPayoutRequest>(
      `/finance/api/payout-requests/${id}/approve/`,
      {}
    );
    return res.data;
  } catch (err: any) {
    const msg =
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      "Failed to approve payout request";
    return rejectWithValue(msg);
  }
});

/**
 * POST /finance/api/payout-requests/:id/reject/
 */
export const adminRejectPayout = createAsyncThunk<
  { id: number; status: "rejected"; note?: string },
  { id: number; note?: string },
  { rejectValue: string }
>("adminPayout/reject", async ({ id, note }, { rejectWithValue }) => {
  try {
    const res = await financeApi.post<{ id: number; status: "rejected"; note?: string }>(
      `/finance/api/payout-requests/${id}/reject/`,
      { note: note || "" }
    );
    return res.data;
  } catch (err: any) {
    const msg =
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      "Failed to reject payout request";
    return rejectWithValue(msg);
  }
});

/**
 * POST /finance/api/payout-requests/:id/mark-paid/
 * returns { payout_request, wallet, transaction } on backend
 */
export const adminMarkPayoutPaid = createAsyncThunk<
  { payout_request: AdminPayoutRequest },
  { id: number },
  { rejectValue: string }
>("adminPayout/markPaid", async ({ id }, { rejectWithValue }) => {
  try {
    const res = await financeApi.post<{ payout_request: AdminPayoutRequest }>(
      `/finance/api/payout-requests/${id}/mark-paid/`,
      {}
    );
    return res.data;
  } catch (err: any) {
    const msg =
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      "Failed to mark payout as paid";
    return rejectWithValue(msg);
  }
});

const adminPayoutSlice = createSlice({
  name: "adminPayout",
  initialState,
  reducers: {
    clearAdminPayoutError(state) {
      state.error = null;
    },
    resetAdminPayoutState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // fetch
    builder
      .addCase(fetchAdminPayoutRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAdminPayoutRequests.fulfilled,
        (
          state,
          action: PayloadAction<{ items: AdminPayoutRequest[]; next: string | null; count: number | null }>
        ) => {
          state.loading = false;
          state.items = action.payload.items;
          state.next = action.payload.next;
          state.count = action.payload.count;
        }
      )
      .addCase(fetchAdminPayoutRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch payout requests";
      });

    // approve
    builder
      .addCase(adminApprovePayout.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(adminApprovePayout.fulfilled, (state, action: PayloadAction<AdminPayoutRequest>) => {
        state.updating = false;
        const idx = state.items.findIndex((x) => x.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
        else state.items = [action.payload, ...state.items];
      })
      .addCase(adminApprovePayout.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload || "Failed to approve payout";
      });

    // reject
    builder
      .addCase(adminRejectPayout.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(adminRejectPayout.fulfilled, (state, action) => {
        state.updating = false;
        const idx = state.items.findIndex((x) => x.id === action.payload.id);
        if (idx !== -1) {
          state.items[idx] = { ...state.items[idx], status: "rejected" };
        }
      })
      .addCase(adminRejectPayout.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload || "Failed to reject payout";
      });

    // mark paid
    builder
      .addCase(adminMarkPayoutPaid.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(adminMarkPayoutPaid.fulfilled, (state, action) => {
        state.updating = false;
        const pr = action.payload.payout_request;
        const idx = state.items.findIndex((x) => x.id === pr.id);
        if (idx !== -1) state.items[idx] = pr;
        else state.items = [pr, ...state.items];
      })
      .addCase(adminMarkPayoutPaid.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload || "Failed to mark paid";
      });
  },
});

export const { clearAdminPayoutError, resetAdminPayoutState } = adminPayoutSlice.actions;
export default adminPayoutSlice.reducer;
