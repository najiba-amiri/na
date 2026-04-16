import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api"; // your axios instance
import Cookies from "js-cookie";

// Interfaces
export interface Product {
  id: number;
  name: string;
  price: number | string;
  image?: string;
  description?: string;
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  subtotal: number;
}
interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  loading: false,
  error: null,
};

// Async thunks
export const fetchCart = createAsyncThunk<CartState>(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/cart/");
      const data = response.data;
      return {
        items: data.items,
        totalItems: data.total_items,
        totalPrice: Number(data.total_price),
        loading: false,
        error: null,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
  {
    condition: () => {
      const accessToken = Cookies.get("access");
      return Boolean(accessToken);
    },
  }
);

export const addToCart = createAsyncThunk<
  CartState,
  { product: Product; quantity: number }
>("cart/addToCart", async ({ product, quantity }, { rejectWithValue }) => {
  try {
    const response = await api.post("/cart/add/", {
      product_id: product.id,
      quantity,
    });
    const data = response.data;
    return {
      items: data.items,
      totalItems: data.total_items,
      totalPrice: Number(data.total_price),
      loading: false,
      error: null,
    };
  } catch (error: any) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const updateCartItem = createAsyncThunk<
  CartState,
  { itemId: number; quantity: number }
>("cart/updateCartItem", async ({ itemId, quantity }, { rejectWithValue }) => {
  try {
    // Send itemId in the body, PATCH to /cart/update/
    const response = await api.patch("/cart/update/", { item_id: itemId, quantity });
    const data = response.data;
    return {
      items: data.items,
      totalItems: data.total_items,
      totalPrice: Number(data.total_price),
      loading: false,
      error: null,
    };
  } catch (error: any) {
    return rejectWithValue(error.response?.data || error.message);
  }
});


export const removeCartItem = createAsyncThunk<CartState, number>(
  "cart/removeCartItem",
  async (itemId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/cart/remove/${itemId}/`);
      const data = response.data;
      return {
        items: data.items,
        totalItems: data.total_items,
        totalPrice: Number(data.total_price),
        loading: false,
        error: null,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Slice
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalPrice = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action: PayloadAction<CartState>) => {
        state.loading = false;
        state.items = action.payload.items;
        state.totalItems = action.payload.totalItems;
        state.totalPrice = action.payload.totalPrice;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Add to cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action: PayloadAction<CartState>) => {
        state.loading = false;
        state.items = action.payload.items;
        state.totalItems = action.payload.totalItems;
        state.totalPrice = action.payload.totalPrice;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update item
      .addCase(updateCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action: PayloadAction<CartState>) => {
        state.loading = false;
        state.items = action.payload.items;
        state.totalItems = action.payload.totalItems;
        state.totalPrice = action.payload.totalPrice;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Remove item
      .addCase(removeCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeCartItem.fulfilled, (state, action: PayloadAction<CartState>) => {
        state.loading = false;
        state.items = action.payload.items;
        state.totalItems = action.payload.totalItems;
        state.totalPrice = action.payload.totalPrice;
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
