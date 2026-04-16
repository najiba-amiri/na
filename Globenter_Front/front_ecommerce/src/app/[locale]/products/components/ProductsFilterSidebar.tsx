"use client";

import React from "react";
import { FiRefreshCw } from "react-icons/fi";

type Props = {
  // existing
  onlyBadged: boolean;
  setOnlyBadged: (v: boolean) => void;

  minPrice: number | "";
  setMinPrice: (v: number | "") => void;

  maxPrice: number | "";
  setMaxPrice: (v: number | "") => void;

  clearAll: () => void;

  // ✅ NEW (match drawer + page)
  selectedColors: string[];
  setSelectedColors: (v: string[]) => void;

  selectedSizes: string[];
  setSelectedSizes: (v: string[]) => void;

  selectedGenders: string[];
  setSelectedGenders: (v: string[]) => void;

  inStockOnly: boolean;
  setInStockOnly: (v: boolean) => void;
};

// same options as drawer (later you can replace with backend lists)
const COLOR_OPTIONS = [
  { key: "black", label: "Black", dot: "#111827" },
  { key: "white", label: "White", dot: "#ffffff" },
  { key: "brown", label: "Brown", dot: "#7c4a2d" },
  { key: "beige", label: "Beige", dot: "#e7d7c1" },
  { key: "blue", label: "Blue", dot: "#2563eb" },
  { key: "green", label: "Green", dot: "#16a34a" },
  { key: "red", label: "Red", dot: "#dc2626" },
];

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL"];

const GENDER_OPTIONS = [
  { key: "male", label: "Men" },
  { key: "female", label: "Women" },
  { key: "kids", label: "Kids" },
];

function toggleInArray(arr: string[], value: string) {
  return arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value];
}

export default function ProductsFilterSidebar({
  onlyBadged,
  setOnlyBadged,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  clearAll,
  selectedColors,
  setSelectedColors,
  selectedSizes,
  setSelectedSizes,
  selectedGenders,
  setSelectedGenders,
  inStockOnly,
  setInStockOnly,
}: Props) {
  return (
    <aside className="hidden lg:block">
      <div className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        {/* Accent */}
        <div className="h-1.5 bg-gradient-to-r from-[#b16926] via-[#f1a013] to-[#b16926]" />

        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-gray-100">Filters</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Refine products like a real marketplace
              </p>
            </div>

            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              title="Reset all filters"
            >
              <FiRefreshCw className="text-gray-500" />
              Reset
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {/* Quick Filters */}
            <section className="rounded-2xl bg-gray-50 dark:bg-gray-800/50 p-3 border border-gray-200/70 dark:border-gray-700/70">
              <h3 className="text-xs font-extrabold text-gray-900 dark:text-gray-100">
                Quick Filters
              </h3>

              <div className="mt-3 space-y-2">
                <label className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-gray-700 dark:text-gray-300">Badged Products</span>
                  <input
                    type="checkbox"
                    className="accent-[#b16926]"
                    checked={onlyBadged}
                    onChange={(e) => setOnlyBadged(e.target.checked)}
                  />
                </label>

                <label className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-gray-700 dark:text-gray-300">In Stock Only</span>
                  <input
                    type="checkbox"
                    className="accent-[#b16926]"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                  />
                </label>
              </div>
            </section>

            {/* Price */}
            <section className="rounded-2xl bg-gray-50 dark:bg-gray-800/50 p-3 border border-gray-200/70 dark:border-gray-700/70">
              <h3 className="text-xs font-extrabold text-gray-900 dark:text-gray-100">Price</h3>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <input
                  value={minPrice}
                  onChange={(e) =>
                    setMinPrice(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  placeholder="Min"
                  type="number"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#b16926]/25 focus:border-[#b16926]/40"
                />
                <input
                  value={maxPrice}
                  onChange={(e) =>
                    setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  placeholder="Max"
                  type="number"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#b16926]/25 focus:border-[#b16926]/40"
                />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMinPrice("");
                    setMaxPrice(500);
                  }}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Under 500
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMinPrice(500);
                    setMaxPrice(1000);
                  }}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  500 - 1000
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMinPrice(1000);
                    setMaxPrice(1500);
                  }}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  1000 - 1500
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMinPrice(1500);
                    setMaxPrice("");
                  }}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  1500+
                </button>
              </div>
            </section>

            {/* Gender */}
            <section className="rounded-2xl bg-gray-50 dark:bg-gray-800/50 p-3 border border-gray-200/70 dark:border-gray-700/70">
              <h3 className="text-xs font-extrabold text-gray-900 dark:text-gray-100">Gender</h3>

              <div className="mt-3 flex flex-wrap gap-2">
                {GENDER_OPTIONS.map((g) => {
                  const active = selectedGenders.includes(g.key);
                  return (
                    <button
                      key={g.key}
                      type="button"
                      onClick={() =>
                        setSelectedGenders(toggleInArray(selectedGenders, g.key))
                      }
                      className={`rounded-full px-3 py-2 text-xs font-semibold border transition ${
                        active
                          ? "bg-[#b16926] text-white border-[#b16926]"
                          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      {g.label}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Colors */}
            <section className="rounded-2xl bg-gray-50 dark:bg-gray-800/50 p-3 border border-gray-200/70 dark:border-gray-700/70">
              <h3 className="text-xs font-extrabold text-gray-900 dark:text-gray-100">Color</h3>

              <div className="mt-3 grid grid-cols-2 gap-2">
                {COLOR_OPTIONS.map((c) => {
                  const active = selectedColors.includes(c.key);
                  return (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() =>
                        setSelectedColors(toggleInArray(selectedColors, c.key))
                      }
                      className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold border transition ${
                        active
                          ? "bg-[#b16926]/10 border-[#b16926]/30 text-gray-900 dark:text-gray-100"
                          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      <span>{c.label}</span>
                      <span
                        className={`h-3 w-3 rounded-full border ${
                          active ? "border-[#b16926]" : "border-gray-300"
                        }`}
                        style={{ background: c.dot }}
                      />
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Sizes */}
            <section className="rounded-2xl bg-gray-50 dark:bg-gray-800/50 p-3 border border-gray-200/70 dark:border-gray-700/70">
              <h3 className="text-xs font-extrabold text-gray-900 dark:text-gray-100">Size</h3>

              <div className="mt-3 flex flex-wrap gap-2">
                {SIZE_OPTIONS.map((s) => {
                  const active = selectedSizes.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() =>
                        setSelectedSizes(toggleInArray(selectedSizes, s))
                      }
                      className={`rounded-xl px-3 py-2 text-xs font-extrabold border transition ${
                        active
                          ? "bg-[#b16926] text-white border-[#b16926]"
                          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Tip */}
            <section className="rounded-2xl border border-[#b16926]/20 bg-gradient-to-br from-[#b16926]/10 to-[#f1a013]/10 p-3">
              <div className="text-xs font-extrabold text-gray-900 dark:text-gray-100">Tip</div>
              <p className="mt-1 text-[11px] text-gray-600 dark:text-gray-400">
                Next step: connect filters to backend query params for real server-side filtering.
              </p>
            </section>
          </div>
        </div>
      </div>
    </aside>
  );
}
