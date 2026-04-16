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
  badge?: string;
}

export interface WishlistItem {
  id: number; // wishlist item id from backend
  product: Product;
  added_at: string;
}

export interface WishlistState {
  items: WishlistItem[];
  totalItems: number;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: WishlistState = {
  items: [],
  totalItems: 0,
  loading: false,
  error: null,
};

// Async thunks

// Fetch wishlist
export const fetchWishlist = createAsyncThunk<WishlistState>(
  "wishlist/fetchWishlist",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/wishlist/");
      const data = response.data;
      return {
        items: data.items || [],
        totalItems: data.total_items || 0,
        loading: false,
        error: null,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message || "Unknown error");
    }
  },
  {
    condition: () => {
      const accessToken = Cookies.get("access");
      return Boolean(accessToken);
    },
  }
);

// Add to wishlist
export const addToWishlist = createAsyncThunk<WishlistState, Product>(
  "wishlist/addToWishlist",
  async (product, { rejectWithValue }) => {
    try {
      const response = await api.post("/wishlist/add/", { product_id: product.id });
      const data = response.data;
      return {
        items: data.items || [],
        totalItems: data.total_items || 0,
        loading: false,
        error: null,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message || "Unknown error");
    }
  }
);

// Remove from wishlist
export const removeFromWishlist = createAsyncThunk<WishlistState, number>(
  "wishlist/removeFromWishlist",
  async (itemId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/wishlist/remove/${itemId}/`);
      const data = response.data;
      return {
        items: data.items || [],
        totalItems: data.total_items || 0,
        loading: false,
        error: null,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message || "Unknown error");
    }
  }
);

// Slice
const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    clearWishlist: (state) => {
      state.items = [];
      state.totalItems = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action: PayloadAction<WishlistState>) => {
        state.loading = false;
        state.items = action.payload.items;
        state.totalItems = action.payload.totalItems;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Add
      .addCase(addToWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, (state, action: PayloadAction<WishlistState>) => {
        state.loading = false;
        state.items = action.payload.items;
        state.totalItems = action.payload.totalItems;
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Remove
      .addCase(removeFromWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action: PayloadAction<WishlistState>) => {
        state.loading = false;
        state.items = action.payload.items;
        state.totalItems = action.payload.totalItems;
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
