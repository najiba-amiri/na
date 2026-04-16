"use client";

import React from "react";
import { FiFilter, FiX, FiSearch } from "react-icons/fi";

export type SortKey = "best" | "priceLow" | "priceHigh" | "nameAZ" | "nameZA";

export type FilterChip = {
  key: string;
  label: string;
};

type Props = {
  itemCount: number;

  query: string;
  setQuery: (v: string) => void;

  sort: SortKey;
  setSort: (v: SortKey) => void;

  chips: FilterChip[];
  removeChip: (key: string) => void;
  clearAll: () => void;

  onOpenFilters: () => void;
};

export default function ProductsTopBar({
  itemCount,
  query,
  setQuery,
  sort,
  setSort,
  chips,
  removeChip,
  clearAll,
  onOpenFilters,
}: Props) {
  return (
    <div className="relative z-10">
      <div className="mx-auto px-3 sm:px-6 pt-4">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
          {/* Accent */}
          <div className="h-1 bg-gradient-to-r from-[#b16926] via-[#f1a013] to-[#b16926]" />

          {/* Main row */}
          <div className="relative px-4 py-4 flex items-center justify-between gap-3">
            {/* Left */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={onOpenFilters}
                className="lg:hidden inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200"
              >
                <FiFilter />
                فیلترها
              </button>

              <span className="hidden sm:inline-flex rounded-full border border-[#b16926]/20 bg-[#b16926]/10 px-3 py-1 text-xs font-semibold text-[#b16926]">
                {itemCount.toLocaleString()} مورد
              </span>
            </div>

            {/* Center title + underline */}
            <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-gray-100 whitespace-nowrap leading-tight">
                تمام محصولات
              </h1>
              <div className="mx-auto mt-1 h-1 w-24 rounded-full bg-gradient-to-r from-[#b16926] via-[#f1a013] to-[#b16926]" />
            </div>

            {/* Right */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search */}
              <div className="relative hidden sm:block w-[220px] md:w-[280px]">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="جستجو…"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 pl-9 pr-3 py-2 text-sm
                             focus:outline-none focus:ring-2 focus:ring-[#b16926]/25"
                />
              </div>

              {/* Sort */}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-[#b16926]/25"
              >
                <option value="best">بهترین</option>
                <option value="priceLow">قیمت ↑</option>
                <option value="priceHigh">قیمت ↓</option>
                <option value="nameAZ">نام A–Z</option>
                <option value="nameZA">نام Z–A</option>
              </select>
            </div>
          </div>

          {/* Chips row */}
          {chips.length > 0 && (
            <div className="px-4 pb-3 flex flex-wrap items-center gap-2 border-t border-gray-100 dark:border-gray-800">
              {chips.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => removeChip(c.key)}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-200 px-3 py-1.5 text-xs font-semibold
                             hover:bg-[#b16926]/5"
                  title="Remove"
                >
                  <span className="truncate max-w-[220px]">{c.label}</span>
                  <FiX className="text-gray-400" />
                </button>
              ))}

              <button
                type="button"
                onClick={clearAll}
                className="ml-auto rounded-full bg-[#b16926] px-3 py-1.5 text-xs font-extrabold text-white hover:opacity-95"
              >
                حذف همه
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
