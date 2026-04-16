import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { financeApi } from "@/lib/financeApi";

export type FinancialAlert = {
  id: number;
  alert_type: "payout_request" | "pending_payment" | "suspicious";
  message: string;
  is_read: boolean;
  created_at: string;
};

type AlertsState = {
  items: FinancialAlert[];
  loading: boolean;
  updating: boolean;
  creating: boolean;
  error: string | null;

  next: string | null;
  count: number | null;
};

const initialState: AlertsState = {
  items: [],
  loading: false,
  updating: false,
  creating: false,
  error: null,
  next: null,
  count: null,
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

/**
 * GET /finance/api/alerts/
 * Admin only
 */
export const fetchFinanceAlerts = createAsyncThunk<
  { items: FinancialAlert[]; next: string | null; count: number | null },
  void,
  { rejectValue: string }
>("financeAlerts/fetchFinanceAlerts", async (_, { rejectWithValue }) => {
  try {
    const res = await financeApi.get<FinancialAlert[] | Paginated<FinancialAlert>>(
      "/finance/api/alerts/"
    );
    const normalized = normalizeListResponse<FinancialAlert>(res.data);
    return {
      items: normalized.results,
      next: normalized.next,
      count: normalized.count,
    };
  } catch (err: any) {
    const status = err?.response?.status;
    const msg =
      status === 403
        ? "You are not allowed to view finance alerts (Admin only)."
        : err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to fetch finance alerts";
    return rejectWithValue(msg);
  }
});

/**
 * PATCH /finance/api/alerts/:id/
 * Mark read/unread
 */
export const markFinanceAlertRead = createAsyncThunk<
  FinancialAlert,
  { id: number; is_read: boolean },
  { rejectValue: string }
>("financeAlerts/markFinanceAlertRead", async ({ id, is_read }, { rejectWithValue }) => {
  try {
    const res = await financeApi.patch<FinancialAlert>(
      `/finance/api/alerts/${id}/`,
      { is_read }
    );
    return res.data;
  } catch (err: any) {
    const msg =
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      "Failed to update alert";
    return rejectWithValue(msg);
  }
});

/**
 * (Optional) POST /finance/api/alerts/
 * Admin create an alert manually
 */
export const createFinanceAlert = createAsyncThunk<
  FinancialAlert,
  { alert_type: FinancialAlert["alert_type"]; message: string },
  { rejectValue: string }
>("financeAlerts/createFinanceAlert", async (payload, { rejectWithValue }) => {
  try {
    const res = await financeApi.post<FinancialAlert>("/finance/api/alerts/", payload);
    return res.data;
  } catch (err: any) {
    const msg =
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      "Failed to create alert";
    return rejectWithValue(msg);
  }
});

const financeAlertSlice = createSlice({
  name: "financeAlerts",
  initialState,
  reducers: {
    clearFinanceAlertError(state) {
      state.error = null;
    },
    resetFinanceAlertState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // fetch
    builder
      .addCase(fetchFinanceAlerts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchFinanceAlerts.fulfilled,
        (
          state,
          action: PayloadAction<{
            items: FinancialAlert[];
            next: string | null;
            count: number | null;
          }>
        ) => {
          state.loading = false;
          state.items = action.payload.items;
          state.next = action.payload.next;
          state.count = action.payload.count;
        }
      )
      .addCase(fetchFinanceAlerts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch finance alerts";
      });

    // update read/unread
    builder
      .addCase(markFinanceAlertRead.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(markFinanceAlertRead.fulfilled, (state, action: PayloadAction<FinancialAlert>) => {
        state.updating = false;
        const idx = state.items.findIndex((a) => a.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
        else state.items = [action.payload, ...state.items];
      })
      .addCase(markFinanceAlertRead.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload || "Failed to update alert";
      });

    // create
    builder
      .addCase(createFinanceAlert.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createFinanceAlert.fulfilled, (state, action: PayloadAction<FinancialAlert>) => {
        state.creating = false;
        state.items = [action.payload, ...state.items];
        if (typeof state.count === "number") state.count += 1;
      })
      .addCase(createFinanceAlert.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload || "Failed to create alert";
      });
  },
});

export const { clearFinanceAlertError, resetFinanceAlertState } =
  financeAlertSlice.actions;

export default financeAlertSlice.reducer;

/**
 * Helpful selectors
 */
export const selectUnreadFinanceAlerts = (state: any) =>
  (state.financeAlerts.items as FinancialAlert[]).filter((a) => !a.is_read);
