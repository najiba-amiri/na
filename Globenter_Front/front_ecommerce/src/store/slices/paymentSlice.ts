import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

type PaymentState = {
  loading: boolean;
  error: string | null;
  paymentUrl: string | null;
};

const initialState: PaymentState = {
  loading: false,
  error: null,
  paymentUrl: null,
};

// ✅ Thunk: create session and return payment_url
export const createHesabPaySessionThunk = createAsyncThunk<
  string, // return payment_url
  { email?: string }, // args
  { state: any; rejectValue: string }
>("payment/createHesabPaySession", async ({ email }, { getState, rejectWithValue }) => {
  try {
    const state = getState();

    // ⚠️ We don't know your cart structure yet, so we try common patterns:
    const cartState = state.cart;

    const cartItems =
      cartState?.items ||
      cartState?.cartItems ||
      cartState?.products ||
      cartState?.list ||
      [];

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return rejectWithValue("Cart is empty");
    }

    const items = cartItems.map((p: any) => ({
      id: String(p.id ?? p.product_id ?? p.product?.id),
      name: String(p.name ?? p.title ?? p.product?.name ?? "Product"),
      price: Number(p.price ?? p.product?.price),
      quantity: Number(p.quantity ?? p.qty ?? 1),
    }));

    // Basic validation
    if (items.some((i: any) => !i.id || !i.name || !Number.isFinite(i.price) || i.price <= 0)) {
      return rejectWithValue("Invalid cart items (missing id/name/price). Check cartSlice structure.");
    }

    const res = await fetch("/api/hesabpay/create-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, items }),
    });

    const data = await res.json();

    if (!res.ok) {
      return rejectWithValue(data?.error || "Create session failed");
    }

    if (!data?.payment_url) {
      return rejectWithValue("No payment_url returned from server");
    }

    return data.payment_url as string;
  } catch (err: any) {
    return rejectWithValue(err?.message || "Checkout failed");
  }
});

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    resetPayment(state) {
      state.loading = false;
      state.error = null;
      state.paymentUrl = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createHesabPaySessionThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.paymentUrl = null;
      })
      .addCase(createHesabPaySessionThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentUrl = action.payload;
      })
      .addCase(createHesabPaySessionThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Payment failed";
      });
  },
});

export const { resetPayment } = paymentSlice.actions;
export default paymentSlice.reducer;
