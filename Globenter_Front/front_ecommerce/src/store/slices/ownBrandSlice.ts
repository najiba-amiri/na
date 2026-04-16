import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";
import { fetchProfile } from "@/store/slices/profileSlice";

export type Brand = {
  id: number;
  name: string;
  user: number;
};

type OwnBrandState = {
  items: Brand[];
  loading: boolean;
  error: string | null;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
};

const initialState: OwnBrandState = {
  items: [],
  loading: false,
  error: null,
  creating: false,
  updating: false,
  deleting: false,
};

// ✅ baseURL already includes /api, so DO NOT add /api here
const BRAND_BASE = "/mybrand/";

export const fetchMyBrands = createAsyncThunk<Brand[]>(
  "ownBrand/fetchMyBrands",
  async (_, thunkAPI) => {
    try {
      const res = await api.get(BRAND_BASE);
      return res.data as Brand[];
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to fetch brands"
      );
    }
  }
);

export const createBrand = createAsyncThunk<Brand, { name: string }>(
  "ownBrand/createBrand",
  async ({ name }, thunkAPI) => {
    try {
      const state: any = thunkAPI.getState();

      if (!state?.profile?.data) {
        const result = await thunkAPI.dispatch(fetchProfile(false) as any);
        if (fetchProfile.rejected.match(result)) {
          throw new Error((result.payload as string) || "Failed to load profile");
        }
      }

      const res = await api.post(BRAND_BASE, { name });
      return res.data as Brand;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          error.message ||
          "Failed to create brand"
      );
    }
  }
);

export const updateBrandName = createAsyncThunk<
  Brand,
  { id: number; name: string }
>("ownBrand/updateBrandName", async ({ id, name }, thunkAPI) => {
  try {
    const res = await api.patch(`${BRAND_BASE}${id}/`, { name });
    return res.data as Brand;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.detail ||
        error.response?.data?.message ||
        "Failed to update brand"
    );
  }
});

export const deleteBrand = createAsyncThunk<number, { id: number }>(
  "ownBrand/deleteBrand",
  async ({ id }, thunkAPI) => {
    try {
      await api.delete(`${BRAND_BASE}${id}/`);
      return id;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to delete brand"
      );
    }
  }
);

const ownBrandSlice = createSlice({
  name: "ownBrand",
  initialState,
  reducers: {
    clearBrandError(state) {
      state.error = null;
    },
    setBrands(state, action: PayloadAction<Brand[]>) {
      state.items = action.payload;
    },
    resetBrandsState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchMyBrands.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMyBrands.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload;
    });
    builder.addCase(fetchMyBrands.rejected, (state, action: any) => {
      state.loading = false;
      state.error = action.payload || "Failed to fetch brands";
    });

    builder.addCase(createBrand.pending, (state) => {
      state.creating = true;
      state.error = null;
    });
    builder.addCase(createBrand.fulfilled, (state, action) => {
      state.creating = false;
      state.items = [action.payload, ...state.items];
    });
    builder.addCase(createBrand.rejected, (state, action: any) => {
      state.creating = false;
      state.error = action.payload || "Failed to create brand";
    });

    builder.addCase(updateBrandName.pending, (state) => {
      state.updating = true;
      state.error = null;
    });
    builder.addCase(updateBrandName.fulfilled, (state, action) => {
      state.updating = false;
      const updated = action.payload;
      const idx = state.items.findIndex((b) => b.id === updated.id);
      if (idx !== -1) state.items[idx] = updated;
    });
    builder.addCase(updateBrandName.rejected, (state, action: any) => {
      state.updating = false;
      state.error = action.payload || "Failed to update brand";
    });

    builder.addCase(deleteBrand.pending, (state) => {
      state.deleting = true;
      state.error = null;
    });
    builder.addCase(deleteBrand.fulfilled, (state, action) => {
      state.deleting = false;
      state.items = state.items.filter((b) => b.id !== action.payload);
    });
    builder.addCase(deleteBrand.rejected, (state, action: any) => {
      state.deleting = false;
      state.error = action.payload || "Failed to delete brand";
    });
  },
});

export const { clearBrandError, setBrands, resetBrandsState } =
  ownBrandSlice.actions;

export default ownBrandSlice.reducer;

export const selectMyBrands = (state: any) => state.ownBrand.items as Brand[];
export const selectOwnBrandLoading = (state: any) => state.ownBrand.loading as boolean;
export const selectOwnBrandError = (state: any) => state.ownBrand.error as string | null;
export const selectOwnBrandCreating = (state: any) => state.ownBrand.creating as boolean;
export const selectOwnBrandUpdating = (state: any) => state.ownBrand.updating as boolean;
export const selectOwnBrandDeleting = (state: any) => state.ownBrand.deleting as boolean;
