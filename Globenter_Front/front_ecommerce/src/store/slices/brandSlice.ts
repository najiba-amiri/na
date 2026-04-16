

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api"; // your Axios instance

// -------------------------
// 1️⃣ Async Thunks
// -------------------------

// Fetch all brands
export const fetchBrands = createAsyncThunk(
  "brands/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/brands/");
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Create a brand
export const createBrand = createAsyncThunk(
  "brands/create",
  async (payload: { name: string; description?: string }, { rejectWithValue }) => {
    try {
      const res = await api.post("/brands/", payload);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Update a brand
export const updateBrand = createAsyncThunk(
  "brands/update",
  async (
    { id, data }: { id: number; data: { name: string; description?: string } },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.put(`/brands/${id}/`, data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Delete a brand
export const deleteBrand = createAsyncThunk(
  "brands/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/brands/${id}/`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// -------------------------
// 2️⃣ Slice
// -------------------------
interface Brand {
  id: number;
  name: string;
  description?: string;
}

interface BrandsState {
  brands: Brand[];
  loading: boolean;
  error: string | null;
}

const initialState: BrandsState = {
  brands: [],
  loading: false,
  error: null,
};

const brandsSlice = createSlice({
  name: "brands",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch brands
    builder.addCase(fetchBrands.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchBrands.fulfilled, (state, action: PayloadAction<Brand[]>) => {
      state.loading = false;
      state.brands = action.payload;
    });
    builder.addCase(fetchBrands.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create brand
    builder.addCase(createBrand.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createBrand.fulfilled, (state, action: PayloadAction<Brand>) => {
      state.loading = false;
      state.brands.push(action.payload);
    });
    builder.addCase(createBrand.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update brand
    builder.addCase(updateBrand.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateBrand.fulfilled, (state, action: PayloadAction<Brand>) => {
      state.loading = false;
      const index = state.brands.findIndex((b) => b.id === action.payload.id);
      if (index !== -1) state.brands[index] = action.payload;
    });
    builder.addCase(updateBrand.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete brand
    builder.addCase(deleteBrand.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteBrand.fulfilled, (state, action: PayloadAction<number>) => {
      state.loading = false;
      state.brands = state.brands.filter((b) => b.id !== action.payload);
    });
    builder.addCase(deleteBrand.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export default brandsSlice.reducer;
