"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { fetchMyTransactions } from "@/store/slices/transactionsSlice";
import {
  FiArrowDownLeft,
  FiArrowUpRight,
  FiSearch,
  FiFilter,
  FiX,
} from "react-icons/fi";

type TxCategory =
  | "order_payment"
  | "commission"
  | "payout"
  | "refund"
  | "adjustment";
type TxStatus = "pending" | "approved" | "rejected" | "paid";
type TxDirection = "in" | "out";
type TxMethod = "bank" | "internal";

const toNumber = (v: unknown) => {
  const n = typeof v === "number" ? v : Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
};

const money = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "AFN",
    maximumFractionDigits: 0,
  }).format(n);

const categoryLabel: Record<TxCategory, string> = {
  order_payment: "پرداخت سفارش",
  commission: "کمیسیون",
  payout: "برداشت",
  refund: "بازپرداخت",
  adjustment: "تنظیمات سیستمی",
};

const methodLabel: Record<TxMethod, string> = {
  bank: "بانکی",
  internal: "داخلی",
};

export default function TransactionsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, error } = useSelector(
    (s: RootState) => s.transactions
  );

  // Filters (UI)
  const [q, setQ] = useState("");
  const [direction, setDirection] = useState<TxDirection | "all">("all");
  const [status, setStatus] = useState<TxStatus | "all">("all");
  const [category, setCategory] = useState<TxCategory | "all">("all");
  const [method, setMethod] = useState<TxMethod | "all">("all");
  const [from, setFrom] = useState(""); // YYYY-MM-DD
  const [to, setTo] = useState(""); // YYYY-MM-DD

  useEffect(() => {
    dispatch(fetchMyTransactions());
  }, [dispatch]);

  const filtered = useMemo(() => {
    const all = [...(items ?? [])];

    // newest first
    all.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return all.filter((tx) => {
      const createdAt = tx.created_at?.slice(0, 10) ?? "";
      const note =
        tx.related_order != null
          ? `order ${tx.related_order}`
          : tx.admin_note ?? "";

      const text = `${tx.id} ${note} ${tx.related_order ?? ""} ${tx.category} ${
        tx.payment_method
      }`.toLowerCase();

      if (q.trim() && !text.includes(q.trim().toLowerCase())) return false;

      if (direction !== "all" && tx.type !== direction) return false;
      if (status !== "all" && tx.status !== status) return false;
      if (category !== "all" && (tx.category as any) !== category) return false;
      if (method !== "all" && (tx.payment_method as any) !== method)
        return false;

      if (from && createdAt && createdAt < from) return false;
      if (to && createdAt && createdAt > to) return false;

      return true;
    });
  }, [items, q, direction, status, category, method, from, to]);

  const clearFilters = () => {
    setQ("");
    setDirection("all");
    setStatus("all");
    setCategory("all");
    setMethod("all");
    setFrom("");
    setTo("");
  };

  return (
    <div className="min-h-screen bg-[#f7f7fb] text-slate-900 dark:bg-gray-950 dark:text-slate-100 transition-colors">
      <div className="px-6 py-10">
        {/* Header */}
        <div className="flex items-start justify-end gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
              تراکنش‌ها
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              تاریخچه کامل تراکنش‌های کیف پول شما
            </p>
          </div>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="mt-6 rounded-2xl border border-black/10 bg-white/75 px-4 py-3 text-sm text-slate-700 shadow-sm
                          dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300 dark:shadow-none">
            در حال بارگذاری تراکنش‌ها...
          </div>
        )}
        {error && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700
                          dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mt-6 rounded-3xl border border-black/10 bg-white/75 shadow-sm
                        dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
          <div className="flex items-center justify-between gap-3 border-b border-black/10 px-6 py-5
                          dark:border-white/[0.08]">
            <div className="flex items-center gap-2">
              <FiFilter className="text-slate-500 dark:text-slate-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                فیلترها
              </h2>
            </div>

            <button
              type="button"
              onClick={clearFilters}
              className="group inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md
                         dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-100 dark:hover:bg-white/[0.06] dark:hover:border-orange-500/30 dark:shadow-none"
            >
              <FiX className="text-slate-500 transition group-hover:text-orange-700 dark:text-slate-400 dark:group-hover:text-orange-300" />
              پاک کردن
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 p-6 lg:grid-cols-12">
            {/* Search */}
            <div className="lg:col-span-4">
              <Label>جستجو</Label>
              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-3 transition focus-within:border-orange-200
                              dark:border-white/[0.08] dark:bg-white/[0.04] dark:focus-within:border-orange-500/30">
                <FiSearch className="text-slate-400 dark:text-slate-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="شناسه، یادداشت، شماره سفارش..."
                  className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400
                             dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Direction */}
            <div className="lg:col-span-2">
              <Label>نوع</Label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as any)}
                className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-200
                           dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-100 dark:focus:border-orange-500/30"
              >
                <option value="all">همه</option>
                <option value="in">ورودی</option>
                <option value="out">خروجی</option>
              </select>
            </div>

            {/* Status */}
            <div className="lg:col-span-2">
              <Label>وضعیت</Label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-200
                           dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-100 dark:focus:border-orange-500/30"
              >
                <option value="all">همه</option>
                <option value="pending">در انتظار</option>
                <option value="approved">تأیید شد</option>
                <option value="rejected">رد شد</option>
                <option value="paid">پرداخت شد</option>
              </select>
            </div>

            {/* Category */}
            <div className="lg:col-span-2">
              <Label>دسته‌بندی</Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-200
                           dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-100 dark:focus:border-orange-500/30"
              >
                <option value="all">همه</option>
                <option value="order_payment">پرداخت سفارش</option>
                <option value="commission">کمیسیون</option>
                <option value="payout">برداشت</option>
                <option value="refund">بازپرداخت</option>
                <option value="adjustment">تنظیمات سیستمی</option>
              </select>
            </div>

            {/* Method */}
            <div className="lg:col-span-1">
              <Label>روش</Label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-200
                           dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-100 dark:focus:border-orange-500/30"
              >
                <option value="all">همه</option>
                <option value="bank">بانکی</option>
                <option value="internal">داخلی</option>
              </select>
            </div>

            {/* Date from */}
            <div className="lg:col-span-1">
              <Label>از</Label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-200
                           dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-100 dark:focus:border-orange-500/30"
              />
            </div>

            {/* Date to */}
            <div className="lg:col-span-1">
              <Label>تا</Label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-200
                           dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-100 dark:focus:border-orange-500/30"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="mt-6 overflow-hidden rounded-3xl border border-black/10 bg-white/75 shadow-sm
                        dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
          <div className="flex items-center justify-between border-b border-black/10 px-6 py-5
                          dark:border-white/[0.08]">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              لیست تراکنش‌ها
            </h2>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              تعداد:{" "}
              <span className="font-bold text-slate-900 dark:text-white">
                {filtered.length}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-950/40">
            {/* header */}
            <div className="grid grid-cols-12 gap-2 bg-slate-50 px-6 py-3 text-xs font-semibold text-slate-500
                            dark:bg-white/[0.03] dark:text-slate-400">
              <div className="col-span-3">شناسه / جزئیات</div>
              <div className="col-span-2 text-right">مبلغ</div>
              <div className="col-span-2">ورودی/خروجی</div>
              <div className="col-span-2">دسته‌بندی</div>
              <div className="col-span-1">روش</div>
              <div className="col-span-1">وضعیت</div>
              <div className="col-span-1">تاریخ</div>
            </div>

            {!loading && filtered.length === 0 ? (
              <div className="px-6 py-10 text-center text-slate-600 dark:text-slate-400">
                چیزی پیدا نشد. فیلترها را تغییر دهید.
              </div>
            ) : (
              filtered.map((tx) => {
                const direction = tx.type as TxDirection;
                const amountN = toNumber(tx.amount);
                const createdAt = tx.created_at?.slice(0, 10) ?? "-";
                const note =
                  tx.related_order != null
                    ? `سفارش #${tx.related_order}`
                    : tx.admin_note ?? "—";

                return (
                  <Link
                    key={tx.id}
                    href={"#"}
                    className="group grid grid-cols-12 gap-2 border-t border-black/5 px-6 py-4 transition hover:bg-orange-50/40
                               dark:border-white/[0.06] dark:hover:bg-orange-500/10"
                  >
                    <div className="col-span-3">
                      <div className="font-semibold text-slate-900 transition group-hover:text-orange-700 dark:text-slate-100 dark:group-hover:text-orange-300">
                        TX #{tx.id}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {note}
                        {tx.related_order != null
                          ? ` · سفارش ${tx.related_order}`
                          : ""}
                      </div>
                    </div>

                    <div className="col-span-2 text-right font-bold">
                      <span
                        className={
                          direction === "in"
                            ? "text-emerald-700 dark:text-emerald-200"
                            : "text-rose-700 dark:text-rose-200"
                        }
                      >
                        {direction === "in" ? "+" : "-"}
                        {money(amountN)}
                      </span>
                    </div>

                    <div className="col-span-2">
                      {direction === "in" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700
                                         dark:bg-emerald-500/10 dark:text-emerald-200">
                          <FiArrowDownLeft />
                          ورودی
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700
                                         dark:bg-rose-500/10 dark:text-rose-200">
                          <FiArrowUpRight />
                          خروجی
                        </span>
                      )}
                    </div>

                    <div className="col-span-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {categoryLabel[tx.category as TxCategory] ?? tx.category}
                    </div>

                    <div className="col-span-1 text-sm text-slate-700 dark:text-slate-300">
                      {methodLabel[tx.payment_method as TxMethod] ??
                        tx.payment_method}
                    </div>

                    <div className="col-span-1">
                      <StatusPill status={tx.status as TxStatus} />
                    </div>

                    <div className="col-span-1 text-sm text-slate-600 dark:text-slate-400">
                      {createdAt}
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
      {children}
    </div>
  );
}

function StatusPill({ status }: { status: TxStatus }) {
  const base =
    "inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold";
  if (status === "pending")
    return (
      <span className={`${base} bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200`}>
        در انتظار
      </span>
    );
  if (status === "approved")
    return (
      <span className={`${base} bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200`}>
        تأیید شد
      </span>
    );
  if (status === "rejected")
    return (
      <span className={`${base} bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200`}>
        رد شد
      </span>
    );
  return (
    <span className={`${base} bg-slate-100 text-slate-700 dark:bg-white/[0.06] dark:text-slate-200`}>
      پرداخت شد
    </span>
  );
}
