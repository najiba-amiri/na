import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { financeApi } from "@/lib/financeApi";

export type Order = {
  id: number;
  buyer: { id: number; username: string; email: string } | null;

  order_number: string;
  total_amount: string;   // Decimal -> string
  paid_amount: string;
  commission: string;
  seller_share: string;

  payment_status: "unpaid" | "paid" | "refunded";
  fund_release_status: "locked" | "released";

  created_at: string;
};

type OrderFilters = {
  payment_status?: "unpaid" | "paid" | "refunded" | "all";
  fund_release_status?: "locked" | "released" | "all";
};

type OrderState = {
  items: Order[];
  loading: boolean;
  creating: boolean;
  updating: boolean;
  error: string | null;

  next: string | null;
  count: number | null;

  // UI filters
  filters: OrderFilters;
};

const initialState: OrderState = {
  items: [],
  loading: false,
  creating: false,
  updating: false,
  error: null,
  next: null,
  count: null,
  filters: {
    payment_status: "all",
    fund_release_status: "all",
  },
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
 * GET /finance/api/orders/
 */
export const fetchMyOrders = createAsyncThunk<
  { items: Order[]; next: string | null; count: number | null },
  void,
  { rejectValue: string }
>("orders/fetchMyOrders", async (_, { rejectWithValue }) => {
  try {
    const res = await financeApi.get<Order[] | Paginated<Order>>(
      "/finance/api/orders/"
    );
    const normalized = normalizeListResponse<Order>(res.data);
    return {
      items: normalized.results,
      next: normalized.next,
      count: normalized.count,
    };
  } catch (err: any) {
    const msg =
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      "Failed to fetch orders";
    return rejectWithValue(msg);
  }
});

export type CreateOrderPayload = {
  order_number: string;
  total_amount: string | number;
  paid_amount?: string | number;
  commission?: string | number;
  seller_share?: string | number;
  payment_status?: "unpaid" | "paid" | "refunded";
  fund_release_status?: "locked" | "released";
};

/**
 * POST /finance/api/orders/
 * NOTE: buyer is read-only in serializer.
 * Backend should set buyer=request.user in perform_create
 */
export const createOrder = createAsyncThunk<
  Order,
  CreateOrderPayload,
  { rejectValue: string }
>("orders/createOrder", async (payload, { rejectWithValue }) => {
  try {
    const res = await financeApi.post<Order>("/finance/api/orders/", payload);
    return res.data;
  } catch (err: any) {
    const data = err?.response?.data;
    const msg =
      data?.detail ||
      data?.message ||
      "Failed to create order";
    return rejectWithValue(msg);
  }
});

export type UpdateOrderPayload = {
  id: number;
  payment_status?: "unpaid" | "paid" | "refunded";
  fund_release_status?: "locked" | "released";
  paid_amount?: string | number;
  commission?: string | number;
  seller_share?: string | number;
  total_amount?: string | number;
};

/**
 * PATCH /finance/api/orders/:id/
 */
export const updateOrder = createAsyncThunk<
  Order,
  UpdateOrderPayload,
  { rejectValue: string }
>("orders/updateOrder", async (payload, { rejectWithValue }) => {
  try {
    const { id, ...patch } = payload;
    const res = await financeApi.patch<Order>(
      `/finance/api/orders/${id}/`,
      patch
    );
    return res.data;
  } catch (err: any) {
    const msg =
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      "Failed to update order";
    return rejectWithValue(msg);
  }
});

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearOrderError(state) {
      state.error = null;
    },
    resetOrderState() {
      return initialState;
    },

    // UI filters
    setOrderFilters(state, action: PayloadAction<OrderFilters>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetOrderFilters(state) {
      state.filters = { payment_status: "all", fund_release_status: "all" };
    },
  },
  extraReducers: (builder) => {
    // fetch
    builder
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchMyOrders.fulfilled,
        (
          state,
          action: PayloadAction<{
            items: Order[];
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
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch orders";
      });

    // create
    builder
      .addCase(createOrder.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action: PayloadAction<Order>) => {
        state.creating = false;
        state.items = [action.payload, ...state.items];
        if (typeof state.count === "number") state.count += 1;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload || "Failed to create order";
      });

    // update
    builder
      .addCase(updateOrder.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateOrder.fulfilled, (state, action: PayloadAction<Order>) => {
        state.updating = false;
        const idx = state.items.findIndex((o) => o.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
        else state.items = [action.payload, ...state.items];
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload || "Failed to update order";
      });
  },
});

export const {
  clearOrderError,
  resetOrderState,
  setOrderFilters,
  resetOrderFilters,
} = orderSlice.actions;

export default orderSlice.reducer;

/**
 * ✅ Selector to get filtered orders (client-side)
 * Use this in UI to show Paid/Unpaid + Locked/Released tabs.
 */
export const selectFilteredOrders = (state: any): Order[] => {
  const { items, filters } = state.orders as OrderState;

  return items.filter((o) => {
    const payOk =
      !filters.payment_status ||
      filters.payment_status === "all" ||
      o.payment_status === filters.payment_status;

    const releaseOk =
      !filters.fund_release_status ||
      filters.fund_release_status === "all" ||
      o.fund_release_status === filters.fund_release_status;

    return payOk && releaseOk;
  });
};
