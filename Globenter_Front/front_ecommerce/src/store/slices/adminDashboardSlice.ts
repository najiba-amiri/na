import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { financeApi } from "@/lib/financeApi";

export type AdminFinanceDashboard = {
  total_platform_income: string;
  total_escrow_balance: string;
  total_pending_inbound_payments: number;
  payout_requests_pending_count: number;
  payout_requests_rejected_count: number;
  unread_alerts_count: number;
};

type AdminDashboardState = {
  data: AdminFinanceDashboard | null;
  loading: boolean;
  error: string | null;
};

const initialState: AdminDashboardState = {
  data: null,
  loading: false,
  error: null,
};

export const fetchAdminFinanceDashboard = createAsyncThunk<
  AdminFinanceDashboard,
  void,
  { rejectValue: string }
>("adminFinanceDashboard/fetch", async (_, { rejectWithValue }) => {
  try {
    const res = await financeApi.get<AdminFinanceDashboard>(
      "/finance/api/alerts/admin/dashboard/"
    );
    return res.data;
  } catch (err: any) {
    const status = err?.response?.status;
    const msg =
      status === 403
        ? "Admin access required for finance dashboard."
        : err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to load finance dashboard";
    return rejectWithValue(msg);
  }
});

const adminDashboardSlice = createSlice({
  name: "adminFinanceDashboard",
  initialState,
  reducers: {
    clearAdminDashboardError(state) {
      state.error = null;
    },
    resetAdminDashboardState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminFinanceDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAdminFinanceDashboard.fulfilled,
        (state, action: PayloadAction<AdminFinanceDashboard>) => {
          state.loading = false;
          state.data = action.payload;
        }
      )
      .addCase(fetchAdminFinanceDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load finance dashboard";
      });
  },
});

export const { clearAdminDashboardError, resetAdminDashboardState } =
  adminDashboardSlice.actions;

export default adminDashboardSlice.reducer;
