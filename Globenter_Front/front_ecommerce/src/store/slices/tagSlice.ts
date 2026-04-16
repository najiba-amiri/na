

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api"; // your Axios instance

// -------------------------
// 1️⃣ Async Thunks
// -------------------------

// Fetch all tags
export const fetchTags = createAsyncThunk(
  "tags/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/tags/");
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Create a tag
export const createTag = createAsyncThunk(
  "tags/create",
  async (payload: { name: string; slug: string }, { rejectWithValue }) => {
    try {
      const res = await api.post("/tags/", payload);
      return res.data; // backend returns {id, name, slug}
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Update a tag
export const updateTag = createAsyncThunk(
  "tags/update",
  async (
    { id, data }: { id: number; data: { name: string; slug: string } },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.put(`/tags/${id}/`, data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Delete a tag
export const deleteTag = createAsyncThunk(
  "tags/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/tags/${id}/`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// -------------------------
// 2️⃣ Slice
// -------------------------

interface Tag {
  id: number;
  name: string;
  slug: string;
}

interface TagsState {
  tags: Tag[];
  loading: boolean;
  error: string | null;
}

const initialState: TagsState = {
  tags: [],
  loading: false,
  error: null,
};

const tagsSlice = createSlice({
  name: "tags",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch tags
    builder.addCase(fetchTags.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTags.fulfilled, (state, action: PayloadAction<Tag[]>) => {
      state.loading = false;
      state.tags = action.payload;
    });
    builder.addCase(fetchTags.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create tag
    builder.addCase(createTag.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createTag.fulfilled, (state, action: PayloadAction<Tag>) => {
      state.loading = false;
      state.tags.push(action.payload);
    });
    builder.addCase(createTag.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update tag
    builder.addCase(updateTag.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateTag.fulfilled, (state, action: PayloadAction<Tag>) => {
      state.loading = false;
      const index = state.tags.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) state.tags[index] = action.payload;
    });
    builder.addCase(updateTag.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete tag
    builder.addCase(deleteTag.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteTag.fulfilled, (state, action: PayloadAction<number>) => {
      state.loading = false;
      state.tags = state.tags.filter((t) => t.id !== action.payload);
    });
    builder.addCase(deleteTag.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export default tagsSlice.reducer;
