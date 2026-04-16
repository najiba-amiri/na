

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";

// -------------------------
// 1️⃣ Async Thunks
// -------------------------

export const fetchCategories = createAsyncThunk(
  "categories/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/categories/");
      return res.data; // expecting nested JSON
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
  {
    condition: (_, { getState }) => {
      const state = (getState() as { categories: CategoriesState }).categories;
      if (state.loading) return false;
      if (state.hasFetched && state.categories.length > 0) return false;
      return true;
    },
  }
);

export const createCategory = createAsyncThunk(
  "categories/create",
  async (
    payload: { name: string; description: string; parent?: number | null },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.post("/categories/", payload);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateCategory = createAsyncThunk(
  "categories/update",
  async (
    { id, data }: { id: number; data: { name: string; description: string; parent?: number | null } },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.put(`/categories/${id}/`, data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "categories/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/categories/${id}/`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// -------------------------
// 2️⃣ Types
// -------------------------
export interface Category {
  slug: string;
  id: number;
  name: string;
  description: string;
  parent: number | null;
  children?: Category[];
}

interface CategoriesState {
  categories: Category[];
  loading: boolean;
  hasFetched: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  categories: [],
  loading: false,
  hasFetched: false,
  error: null,
};

// -------------------------
// 3️⃣ Helper for nested updates
// -------------------------
const updateCategoryInTree = (tree: Category[], updated: Category): Category[] =>
  tree.map((cat) => {
    if (cat.id === updated.id) return { ...updated };
    if (cat.children) return { ...cat, children: updateCategoryInTree(cat.children, updated) };
    return cat;
  });

const deleteCategoryFromTree = (tree: Category[], id: number): Category[] =>
  tree
    .filter((cat) => cat.id !== id)
    .map((cat) => (cat.children ? { ...cat, children: deleteCategoryFromTree(cat.children, id) } : cat));

// -------------------------
// 4️⃣ Slice
// -------------------------
const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch
    builder.addCase(fetchCategories.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
      state.loading = false;
      state.hasFetched = true;
      state.categories = action.payload;
    });
    builder.addCase(fetchCategories.rejected, (state, action) => {
      state.loading = false;
      state.hasFetched = true;
      state.error = action.payload as string;
    });

    // Create
    builder.addCase(createCategory.fulfilled, (state, action: PayloadAction<Category>) => {
      const cat = action.payload;
      if (!cat.parent) state.categories.push(cat);
      else {
        const addToParent = (tree: Category[]): Category[] =>
          tree.map((c) => {
            if (c.id === cat.parent) {
              const children = c.children ? [...c.children, cat] : [cat];
              return { ...c, children };
            }
            if (c.children) return { ...c, children: addToParent(c.children) };
            return c;
          });
        state.categories = addToParent(state.categories);
      }
    });

    // Update
    builder.addCase(updateCategory.fulfilled, (state, action: PayloadAction<Category>) => {
      state.categories = updateCategoryInTree(state.categories, action.payload);
    });

    // Delete
    builder.addCase(deleteCategory.fulfilled, (state, action: PayloadAction<number>) => {
      state.categories = deleteCategoryFromTree(state.categories, action.payload);
    });
  },
});

export default categoriesSlice.reducer;

// -------------------------
// Selector helpers
// -------------------------
export const findCategoryBySlug = (categories: Category[], slug: string): Category | null => {
  for (const cat of categories) {
    if (cat.slug === slug) return cat;
    if (cat.children && cat.children.length > 0) {
      const found = findCategoryBySlug(cat.children, slug);
      if (found) return found;
    }
  }
  return null;
};

export const collectChildSlugs = (category: Category): string[] => {
  const result: string[] = [];
  if (category.children && category.children.length > 0) {
    for (const child of category.children) {
      result.push(child.slug, ...collectChildSlugs(child));
    }
  }
  return result;
};
