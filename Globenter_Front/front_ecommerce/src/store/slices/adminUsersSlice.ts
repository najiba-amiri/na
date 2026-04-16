import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api"; // your normal axios instance for /api routes

export type AdminUserItem = {
  id: number;
  username: string;
  email: string;
  is_staff?: boolean;
  is_superuser?: boolean;
  is_seller?: boolean;

  // optional profile fields (depending on your serializer)
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  role?: "buyer" | "seller" | "admin" | null;

  profile_image?: string | null;
  joined_date?: string | null;
};

type AdminUsersState = {
  items: AdminUserItem[];
  loading: boolean;
  error: string | null;

  // UI helpers
  q: string;
  page: number;
  pageSize: number;
};

const initialState: AdminUsersState = {
  items: [],
  loading: false,
  error: null,
  q: "",
  page: 1,
  pageSize: 12,
};

export const fetchAdminUsers = createAsyncThunk<
  AdminUserItem[],
  void,
  { rejectValue: string }
>("adminUsers/fetchAdminUsers", async (_, { rejectWithValue }) => {
  try {
    // ✅ accounts endpoint is under /api/accounts/...
    const res = await api.get("/accounts/admin/users/");
    // API can return either {results: []} or [] depending on your view
    const data = res.data;
    if (Array.isArray(data)) return data as AdminUserItem[];
    if (Array.isArray(data?.results)) return data.results as AdminUserItem[];
    return rejectWithValue("Unexpected response from users API.");
  } catch (err: any) {
    const msg =
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      err?.message ||
      "Failed to load users.";
    return rejectWithValue(String(msg));
  }
});

const adminUsersSlice = createSlice({
  name: "adminUsers",
  initialState,
  reducers: {
    setAdminUsersQuery(state, action: PayloadAction<string>) {
      state.q = action.payload;
      state.page = 1;
    },
    setAdminUsersPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    setAdminUsersPageSize(state, action: PayloadAction<number>) {
      state.pageSize = action.payload;
      state.page = 1;
    },
    // optional: update one row after topup
    patchAdminUser(state, action: PayloadAction<Partial<AdminUserItem> & { id: number }>) {
      const idx = state.items.findIndex((u) => u.id === action.payload.id);
      if (idx !== -1) state.items[idx] = { ...state.items[idx], ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load users.";
      });
  },
});

export const {
  setAdminUsersQuery,
  setAdminUsersPage,
  setAdminUsersPageSize,
  patchAdminUser,
} = adminUsersSlice.actions;

export default adminUsersSlice.reducer;
