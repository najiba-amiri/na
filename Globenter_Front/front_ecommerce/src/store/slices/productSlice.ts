import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";
import { toAbsoluteMediaUrl } from "@/lib/mediaUrl";

const PRODUCTS_CACHE_KEY_PREFIX = "globenter_products_cache_v1";
const PRODUCTS_CACHE_TTL_MS = 10 * 60 * 1000;
const SUPPORTED_LOCALES = new Set(["en", "fa", "ps"]);

function getCurrentLocale(): string {
  if (typeof window !== "undefined") {
    const pathSegment = window.location.pathname.split("/")[1];
    if (pathSegment && SUPPORTED_LOCALES.has(pathSegment)) return pathSegment;
  }
  if (typeof document !== "undefined") {
    const htmlLang = document.documentElement.lang;
    if (htmlLang && SUPPORTED_LOCALES.has(htmlLang)) return htmlLang;
  }
  return "en";
}

function getLocaleCacheKey(locale: string): string {
  return `${PRODUCTS_CACHE_KEY_PREFIX}_${locale}`;
}

function readProductsCache(locale: string): Product[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(getLocaleCacheKey(locale));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { timestamp: number; data: Product[] };
    if (!parsed?.timestamp || !Array.isArray(parsed?.data)) return null;
    if (Date.now() - parsed.timestamp > PRODUCTS_CACHE_TTL_MS) return null;
    return normalizeProducts(parsed.data);
  } catch {
    return null;
  }
}

function writeProductsCache(locale: string, data: Product[]) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      getLocaleCacheKey(locale),
      JSON.stringify({ timestamp: Date.now(), data: normalizeProducts(data) })
    );
  } catch {
    // Ignore storage quota / private mode errors
  }
}

// ----------------------------
// Interfaces
// ----------------------------
export interface Product {
  id: number;
  name: string;
  description?: string;
  name_i18n?: Record<string, string>;
  description_i18n?: Record<string, string>;
  price: number;
  priceAFN?: number;
  stock?: number;
  color?: string;
  size?: string;
  badge?: string;
  gender?: string;
  brand?: string;
  category: string;
  category_slug?: string;
  category_name?: string;
  brand_slug?: string;
  brand_name?: string;
  tags?: string[];
  wholesale_price?: number;
  min_order_qty?: number;
  unit?: string;
  status?: string;
  featured?: boolean;
  custom_fields?: Record<string, any>;
  attributes?: any[];
  images?: string[];
  image?: string;
  owner_name?: string;
}

function normalizeProduct(product: Product): Product {
  const extractedImages: string[] = [];

  if (typeof product.image === "string") {
    const normalizedMain = toAbsoluteMediaUrl(product.image);
    if (normalizedMain) extractedImages.push(normalizedMain);
  }

  if (Array.isArray(product.images)) {
    for (const entry of product.images as any[]) {
      if (typeof entry === "string") {
        const normalized = toAbsoluteMediaUrl(entry);
        if (normalized) extractedImages.push(normalized);
        continue;
      }

      if (entry && typeof entry === "object") {
        const candidate =
          (typeof entry.image === "string" && entry.image) ||
          (typeof entry.url === "string" && entry.url) ||
          "";
        const normalized = toAbsoluteMediaUrl(candidate);
        if (normalized) extractedImages.push(normalized);
      }
    }
  }

  const uniqueImages = Array.from(new Set(extractedImages));

  return {
    ...product,
    image: uniqueImages[0] || product.image,
    images: uniqueImages.length ? uniqueImages : product.images,
  };
}

function normalizeProducts(products: Product[]): Product[] {
  return products.map(normalizeProduct);
}

// ----------------------------
// Async Thunks
// ----------------------------

// ✅ Fetch all products
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const locale = getCurrentLocale();
      const cached = readProductsCache(locale);
      if (cached) return cached;
      const res = await api.get("/products/", { params: { locale } });
      const normalized = normalizeProducts(res.data as Product[]);
      writeProductsCache(locale, normalized);
      return normalized;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  },
  {
    condition: (_, { getState }) => {
      const state = (getState() as { products: ProductState }).products;
      const locale = getCurrentLocale();
      if (state.loading) return false;
      if (state.hasFetched && state.fetchedLocale === locale) return false;
      return true;
    },
  }
);

// ✅ Fetch products by category (multiple category slugs)
export const fetchProductsByCategory = createAsyncThunk(
  "products/fetchByCategory",
  async (slugs: string[], { rejectWithValue }) => {
    try {
      const locale = getCurrentLocale();
      const res = await api.get("/products/", {
        params: { category: slugs.join(","), locale },
      });
      return normalizeProducts(res.data as Product[]);
    } catch (error: any) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// ✅ Create product
export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (productData: FormData, { rejectWithValue }) => {
    try {
      const res = await api.post("/seller/products/", productData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return normalizeProduct(res.data as Product);
    } catch (error: any) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// ✅ Update product
export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async (
    { id, payload }: { id: number; payload: Record<string, any> },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.patch(`/seller/products/${id}/`, payload);
      return normalizeProduct(res.data as Product);
    } catch (error: any) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// ✅ Delete product
export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/seller/products/${id}/`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// ----------------------------
// State Type
// ----------------------------
interface ProductState {
  products: Product[];
  currentProduct: Record<string, any>;
  loading: boolean;
  hasFetched: boolean;
  fetchedLocale: string | null;
  error: string | Record<string, any> | null;
}

const initialState: ProductState = {
  products: [],
  currentProduct: {
    name: "",
    description: "",
    price: "",
    stock: "",
    color: "",
    size: "",
    badge: "",
    gender: "",
    brand: "",
    category: "",
    tags: [],
    wholesale_price: "",
    min_order_qty: "",
    unit: "",
    status: "active",
    featured: false,
    custom_fields: {},
    attributes: [],
    images: [],
  },
  loading: false,
  hasFetched: false,
  fetchedLocale: null,
  error: null,
};

// ----------------------------
// Slice
// ----------------------------
const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setCurrentProductField: (
      state,
      action: PayloadAction<{ field: string; value: any }>
    ) => {
      const { field, value } = action.payload;
      state.currentProduct[field] = value;
    },

    setNestedProductField: (
      state,
      action: PayloadAction<{ parent: string; field: string; value: any }>
    ) => {
      const { parent, field, value } = action.payload;
      if (!state.currentProduct[parent]) state.currentProduct[parent] = {};
      state.currentProduct[parent][field] = value;
    },

    addProductImage: (state, action: PayloadAction<any>) => {
      state.currentProduct.images.push(action.payload);
    },

    removeProductImage: (state, action: PayloadAction<number>) => {
      state.currentProduct.images = state.currentProduct.images.filter(
        (_: any, index: number) => index !== action.payload
      );
    },

    resetCurrentProduct: (state) => {
      state.currentProduct = { ...initialState.currentProduct };
    },
  },

  // ----------------------------
  // Extra Reducers
  // ----------------------------
  extraReducers: (builder) => {
    // 🟢 Fetch products
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.loading = false;
        state.hasFetched = true;
        state.fetchedLocale = getCurrentLocale();
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.hasFetched = true;
        state.fetchedLocale = getCurrentLocale();
        state.error = action.payload as any;
      });

    // 🟢 Fetch by category
    builder
      .addCase(fetchProductsByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchProductsByCategory.fulfilled,
        (state, action: PayloadAction<any[]>) => {
          state.loading = false;
          state.hasFetched = true;
          state.products = action.payload;
        }
      )
      .addCase(fetchProductsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.hasFetched = true;
        state.error = action.payload as any;
      });

    // 🟢 Create product
    builder
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.push(action.payload);
        state.currentProduct = { ...initialState.currentProduct };
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as any;
      });

    // 🟢 Update product
    builder
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.products.findIndex(
          (p) => p.id === action.payload.id
        );
        if (index !== -1) state.products[index] = action.payload;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as any;
      });

    // 🟢 Delete product
    builder
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.products = state.products.filter((p) => p.id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as any;
      });
  },
});

// ----------------------------
// Exports
// ----------------------------
export const {
  setCurrentProductField,
  setNestedProductField,
  addProductImage,
  removeProductImage,
  resetCurrentProduct,
} = productSlice.actions;

export default productSlice.reducer;
