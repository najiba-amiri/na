"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslations } from "next-intl";

import { fetchProducts } from "@/store/slices/productSlice";
import type { RootState, AppDispatch } from "@/store/store";

import ProductsTopBar, {
  type SortKey,
  type FilterChip,
} from "./components/ProductsTopBar";
import ProductsFilterSidebar from "./components/ProductsFilterSidebar";
import ProductsFilterDrawer from "./components/ProductsFilterDrawer";
import ProductCard from "@/components/Utils/productCard";
import React from "react";

export default function Page() {
  const t = useTranslations("NewProducts");
  const dispatch = useDispatch<AppDispatch>();

  const { products } = useSelector(
    (state: RootState) => state.products
  );

  // ✅ Advanced filters state
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("best");

  // Basic filters
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [onlyBadged, setOnlyBadged] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // ✅ Filter chips
  const chips: FilterChip[] = useMemo(() => {
    const list: FilterChip[] = [];
    const q = query.trim();

    if (q) list.push({ key: "q", label: `Search: ${q}` });
    if (onlyBadged) list.push({ key: "badge", label: "Badged" });
    if (inStockOnly) list.push({ key: "stock", label: "In Stock" });

    if (minPrice !== "") list.push({ key: "min", label: `Min: ${minPrice}` });
    if (maxPrice !== "") list.push({ key: "max", label: `Max: ${maxPrice}` });

    if (selectedColors.length > 0)
      list.push({
        key: "colors",
        label: `Colors: ${selectedColors.join(", ")}`,
      });

    if (selectedSizes.length > 0)
      list.push({ key: "sizes", label: `Sizes: ${selectedSizes.join(", ")}` });

    if (selectedGenders.length > 0)
      list.push({
        key: "genders",
        label: `Gender: ${selectedGenders.join(", ")}`,
      });

    return list;
  }, [
    query,
    onlyBadged,
    inStockOnly,
    minPrice,
    maxPrice,
    selectedColors,
    selectedSizes,
    selectedGenders,
  ]);

  // ✅ Filtering logic
  const filteredProducts = useMemo(() => {
    const list = [...(products ?? [])];

    const getPrice = (p: any) => Number(p?.priceAFN ?? p?.price ?? 0);

    const getColor = (p: any) =>
      String(p?.color ?? p?.custom_fields?.color ?? "").toLowerCase();

    const getSize = (p: any) =>
      String(p?.size ?? p?.custom_fields?.size ?? "").toUpperCase();

    const getGender = (p: any) =>
      String(p?.gender ?? p?.custom_fields?.gender ?? "").toLowerCase();

    const isInStock = (p: any) => {
      // supports different shapes: in_stock, stock, quantity
      if (typeof p?.in_stock === "boolean") return p.in_stock;
      if (typeof p?.stock === "number") return p.stock > 0;
      if (typeof p?.quantity === "number") return p.quantity > 0;
      return true; // default true if field not present
    };

    // Search
    const q = query.trim().toLowerCase();
    let out = q
      ? list.filter((p: any) => {
          const name = String(p?.name ?? "").toLowerCase();
          const desc = String(p?.description ?? "").toLowerCase();
          return name.includes(q) || desc.includes(q);
        })
      : list;

    // Badged
    if (onlyBadged) out = out.filter((p: any) => Boolean(p?.badge));

    // Stock
    if (inStockOnly) out = out.filter((p: any) => isInStock(p));

    // Price
    if (minPrice !== "")
      out = out.filter((p: any) => getPrice(p) >= Number(minPrice));
    if (maxPrice !== "")
      out = out.filter((p: any) => getPrice(p) <= Number(maxPrice));

    // Colors
    if (selectedColors.length > 0) {
      const set = new Set(selectedColors.map((c) => c.toLowerCase()));
      out = out.filter((p: any) => set.has(getColor(p)));
    }

    // Sizes
    if (selectedSizes.length > 0) {
      const set = new Set(selectedSizes.map((s) => s.toUpperCase()));
      out = out.filter((p: any) => set.has(getSize(p)));
    }

    // Genders
    if (selectedGenders.length > 0) {
      const set = new Set(selectedGenders.map((g) => g.toLowerCase()));
      out = out.filter((p: any) => set.has(getGender(p)));
    }

    // Sort
    const sorted = [...out];
    sorted.sort((a: any, b: any) => {
      const pa = getPrice(a);
      const pb = getPrice(b);
      const na = String(a?.name ?? "");
      const nb = String(b?.name ?? "");

      switch (sort) {
        case "priceLow":
          return pa - pb;
        case "priceHigh":
          return pb - pa;
        case "nameAZ":
          return na.localeCompare(nb);
        case "nameZA":
          return nb.localeCompare(na);
        case "best":
        default:
          return 0;
      }
    });

    return sorted;
  }, [
    products,
    query,
    onlyBadged,
    inStockOnly,
    minPrice,
    maxPrice,
    selectedColors,
    selectedSizes,
    selectedGenders,
    sort,
  ]);

  // ✅ Reset all filters
  const clearAll = () => {
    setQuery("");
    setOnlyBadged(false);
    setInStockOnly(false);
    setMinPrice("");
    setMaxPrice("");
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedGenders([]);
    setSort("best");
  };

  // ✅ Remove a chip
  const removeChip = (key: string) => {
    if (key === "q") setQuery("");
    if (key === "badge") setOnlyBadged(false);
    if (key === "stock") setInStockOnly(false);
    if (key === "min") setMinPrice("");
    if (key === "max") setMaxPrice("");
    if (key === "colors") setSelectedColors([]);
    if (key === "sizes") setSelectedSizes([]);
    if (key === "genders") setSelectedGenders([]);
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-950 text-gray-700 dark:text-gray-200 overflow-hidden transition-colors">
      {/* Sticky TopBar */}
      <div className="sticky top-0 z-40 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur border-b border-gray-200 dark:border-gray-800">
        <ProductsTopBar
          itemCount={filteredProducts.length}
          query={query}
          setQuery={setQuery}
          sort={sort}
          setSort={setSort}
          chips={chips}
          removeChip={removeChip}
          clearAll={clearAll}
          onOpenFilters={() => setSidebarOpen(true)}
        />
      </div>

      <div className="mx-auto w-full px-3 sm:px-6 py-6 h-[calc(100vh-110px)]">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 h-full">
          {/* LEFT: Sticky filters */}
          <div className="hidden lg:block h-full">
            <div className="sticky top-[120px] h-[calc(100vh-150px)] overflow-auto pr-1">
              <ProductsFilterSidebar
                onlyBadged={onlyBadged}
                setOnlyBadged={setOnlyBadged}
                minPrice={minPrice}
                setMinPrice={setMinPrice}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                clearAll={clearAll}
                selectedColors={selectedColors}
                setSelectedColors={setSelectedColors}
                selectedSizes={selectedSizes}
                setSelectedSizes={setSelectedSizes}
                selectedGenders={selectedGenders}
                setSelectedGenders={setSelectedGenders}
                inStockOnly={inStockOnly}
                setInStockOnly={setInStockOnly}
              />
            </div>
          </div>

          {/* RIGHT: Drawer + Products scroll area */}
          <div className="h-full flex flex-col min-h-0">
            {/* Mobile Drawer (not part of grid columns visually) */}
            <ProductsFilterDrawer
              open={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              onlyBadged={onlyBadged}
              setOnlyBadged={setOnlyBadged}
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              clearAll={clearAll}
              selectedColors={selectedColors}
              setSelectedColors={setSelectedColors}
              selectedSizes={selectedSizes}
              setSelectedSizes={setSelectedSizes}
              selectedGenders={selectedGenders}
              setSelectedGenders={setSelectedGenders}
              inStockOnly={inStockOnly}
              setInStockOnly={setInStockOnly}
            />

            {/* Scroll only products */}
            <div className="flex-1 min-h-0 overflow-y-auto rounded-3xl">
              {/* Optional: inner padding */}
              <div className="pb-10">
                <ProductCard products={filteredProducts} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
