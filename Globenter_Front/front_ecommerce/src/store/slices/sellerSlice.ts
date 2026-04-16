// store/sellerSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api"; // Axios instance

// ---------------------------
// Types
// ---------------------------
interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  stock: number;
  badge?: string;
  color?: string;
  size?: string;
  image?: string | null;
  owner_name: string;
  category_name: string;
  created_at: string;
  updated_at: string;
}

interface SellerStats {
  product_count: number;
  products: Product[];
}

interface SellerState {
  stats: SellerStats | null;
  loading: boolean;
  error: string | null;
}

// ---------------------------
// Initial State
// ---------------------------
const initialState: SellerState = {
  stats: null,
  loading: false,
  error: null,
};

// ---------------------------
// Async Thunk
// ---------------------------
export const fetchSellerStats = createAsyncThunk<
  SellerStats,
  void, // no argument needed
  { rejectValue: string }
>("seller/fetchStats", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/seller/stats/"); // Axios handles baseURL & token
    return res.data as SellerStats;
  } catch (err: any) {
    // Handle errors gracefully
    return rejectWithValue(err.response?.data?.detail || err.message || "Failed to fetch seller stats");
  }
});

// ---------------------------
// Slice
// ---------------------------
const sellerSlice = createSlice({
  name: "seller",
  initialState,
  reducers: {
    clearSellerStats: (state) => {
      state.stats = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSellerStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSellerStats.fulfilled, (state, action: PayloadAction<SellerStats>) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchSellerStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch seller stats";
      });
  },
});

// ---------------------------
// Exports
// ---------------------------
export const { clearSellerStats } = sellerSlice.actions;
export default sellerSlice.reducer;
