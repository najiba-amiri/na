"use client";

import React, { useEffect } from "react";
import { FiX, FiRefreshCw } from "react-icons/fi";

type Props = {
  open: boolean;
  onClose: () => void;

  // existing
  onlyBadged: boolean;
  setOnlyBadged: (v: boolean) => void;

  minPrice: number | "";
  setMinPrice: (v: number | "") => void;

  maxPrice: number | "";
  setMaxPrice: (v: number | "") => void;

  clearAll: () => void;

  // ✅ NEW (same as sidebar)
  selectedColors: string[];
  setSelectedColors: (v: string[]) => void;

  selectedSizes: string[];
  setSelectedSizes: (v: string[]) => void;

  selectedGenders: string[];
  setSelectedGenders: (v: string[]) => void;

  inStockOnly: boolean;
  setInStockOnly: (v: boolean) => void;
};

// same options as sidebar (later you can replace with backend lists)
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

export default function ProductsFilterDrawer({
  open,
  onClose,
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
  // close on ESC
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-9999">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="absolute left-0 top-0 h-full w-[88%] max-w-sm bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">
        {/* Accent */}
        <div className="h-1.5 bg-gradient-to-r from-[#b16926] via-[#f1a013] to-[#b16926]" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <div className="font-extrabold text-gray-900 dark:text-gray-100">Filters</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Refine products like a real marketplace
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 dark:border-gray-700 px-2.5 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-200"
            aria-label="Close"
          >
            <FiX />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-148px)]">
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
                  setMinPrice(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                placeholder="Min"
                type="number"
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#b16926]/25 focus:border-[#b16926]/40"
              />
              <input
                value={maxPrice}
                onChange={(e) =>
                  setMaxPrice(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
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

        {/* Bottom actions */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={clearAll}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <FiRefreshCw />
              Reset
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl bg-[#b16926] px-3 py-3 text-sm font-extrabold text-white hover:opacity-95 active:scale-[0.99] transition"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
