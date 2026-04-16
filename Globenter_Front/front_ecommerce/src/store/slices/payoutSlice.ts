import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { financeApi } from "@/lib/financeApi";

// DRF Decimal => string
export type PayoutRequest = {
  id: number;
  wallet: number;
  amount: string;
  payment_method: "internal" | "bank";
  bank_account: string | null;
  status: "pending" | "approved" | "rejected" | "paid";
  receipt_file: string | null; // URL from DRF if configured
  created_at: string;
  updated_at: string;
};

type PayoutState = {
  items: PayoutRequest[];
  loading: boolean;
  creating: boolean;
  updating: boolean;
  error: string | null;

  next: string | null;
  count: number | null;
};

const initialState: PayoutState = {
  items: [],
  loading: false,
  creating: false,
  updating: false,
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
 * GET /finance/api/payout-requests/
 */
export const fetchMyPayoutRequests = createAsyncThunk<
  { items: PayoutRequest[]; next: string | null; count: number | null },
  void,
  { rejectValue: string }
>("payout/fetchMyPayoutRequests", async (_, { rejectWithValue }) => {
  try {
    const res = await financeApi.get<PayoutRequest[] | Paginated<PayoutRequest>>(
      "/finance/api/payout-requests/"
    );
    const normalized = normalizeListResponse<PayoutRequest>(res.data);
    return { items: normalized.results, next: normalized.next, count: normalized.count };
  } catch (err: any) {
    const msg =
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      "Failed to fetch payout requests";
    return rejectWithValue(msg);
  }
});

export type CreatePayoutRequestPayload = {
  wallet: number;
  amount: string | number;
  payment_method: "internal" | "bank";
  bank_account?: string | null;
  // receipt_file is File upload => handled separately (FormData) if needed
};

/**
 * POST /finance/api/payout-requests/
 */
export const createPayoutRequest = createAsyncThunk<
  PayoutRequest,
  CreatePayoutRequestPayload,
  { rejectValue: string }
>("payout/createPayoutRequest", async (payload, { rejectWithValue }) => {
  try {
    const res = await financeApi.post<PayoutRequest>(
      "/finance/api/payout-requests/",
      payload
    );
    return res.data;
  } catch (err: any) {
    // DRF often returns field errors as object
    const data = err?.response?.data;
    const msg =
      data?.detail ||
      (typeof data === "string" ? data : null) ||
      "Failed to create payout request";
    return rejectWithValue(msg);
  }
});

/**
 * Upload receipt or patch fields:
 * PATCH /finance/api/payout-requests/:id/
 *
 * If uploading a file, use FormData + multipart.
 */
export type UpdatePayoutRequestPayload =
  | {
      id: number;
      bank_account?: string | null;
      payment_method?: "internal" | "bank";
    }
  | {
      id: number;
      receipt_file: File;
    };

export const updatePayoutRequest = createAsyncThunk<
  PayoutRequest,
  UpdatePayoutRequestPayload,
  { rejectValue: string }
>("payout/updatePayoutRequest", async (payload, { rejectWithValue }) => {
  try {
    const { id, ...rest } = payload as any;

    // If file upload
    if (rest.receipt_file instanceof File) {
      const form = new FormData();
      form.append("receipt_file", rest.receipt_file);

      const res = await financeApi.patch<PayoutRequest>(
        `/finance/api/payout-requests/${id}/`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return res.data;
    }

    // Normal patch (JSON)
    const res = await financeApi.patch<PayoutRequest>(
      `/finance/api/payout-requests/${id}/`,
      rest
    );
    return res.data;
  } catch (err: any) {
    const msg =
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      "Failed to update payout request";
    return rejectWithValue(msg);
  }
});

const payoutSlice = createSlice({
  name: "payout",
  initialState,
  reducers: {
    clearPayoutError(state) {
      state.error = null;
    },
    resetPayoutState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // fetch
    builder
      .addCase(fetchMyPayoutRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchMyPayoutRequests.fulfilled,
        (
          state,
          action: PayloadAction<{
            items: PayoutRequest[];
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
      .addCase(fetchMyPayoutRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch payout requests";
      });

    // create
    builder
      .addCase(createPayoutRequest.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createPayoutRequest.fulfilled, (state, action: PayloadAction<PayoutRequest>) => {
        state.creating = false;
        state.items = [action.payload, ...state.items];
        if (typeof state.count === "number") state.count += 1;
      })
      .addCase(createPayoutRequest.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload || "Failed to create payout request";
      });

    // update
    builder
      .addCase(updatePayoutRequest.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updatePayoutRequest.fulfilled, (state, action: PayloadAction<PayoutRequest>) => {
        state.updating = false;
        const idx = state.items.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
        else state.items = [action.payload, ...state.items];
      })
      .addCase(updatePayoutRequest.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload || "Failed to update payout request";
      });
  },
});

export const { clearPayoutError, resetPayoutState } = payoutSlice.actions;
export default payoutSlice.reducer;
