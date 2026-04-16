"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import {
  fetchAdminTransactions,
  setAdminTxFilters,
  resetAdminTxFilters,
  AdminTransaction,
} from "@/store/slices/adminTransactionsSlice";
import { FiRefreshCcw, FiFilter, FiX } from "react-icons/fi";

function StatusPill({ status }: { status: AdminTransaction["status"] }) {
  const map: Record<
    AdminTransaction["status"],
    { label: string; cls: string }
  > = {
    pending: {
      label: "در انتظار",
      cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/20",
    },
    approved: {
      label: "تایید",
      cls: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-200 dark:border-blue-500/20",
    },
    rejected: {
      label: "رد",
      cls: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-200 dark:border-rose-500/20",
    },
    paid: {
      label: "پرداخت شد",
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:border-emerald-500/20",
    },
  };
  const s = map[status];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold ${s.cls}`}
    >
      {s.label}
    </span>
  );
}

function TypePill({ type }: { type: AdminTransaction["type"] }) {
  return type === "in" ? (
    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
      ورودی
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">
      خروجی
    </span>
  );
}

const categoryLabel: Record<string, string> = {
  order_payment: "پرداخت سفارش",
  commission: "کمیسیون",
  payout: "برداشت",
  refund: "بازگشت پول",
  adjustment: "سیستمی",
};

export default function AdminTransactionsLedgerPage() {
  const dispatch = useDispatch<AppDispatch>();
  const tx = useSelector((s: RootState) => s.adminTransactions);
  const userProfile = useSelector((s: RootState) => s.profile.data);
  const role = (userProfile?.role || "user").toLowerCase();
  const isAdmin = role === "admin";

  useEffect(() => {
    if (isAdmin) dispatch(fetchAdminTransactions());
  }, [dispatch, isAdmin]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#f7f7fb] text-slate-900 dark:bg-gray-950 dark:text-slate-100 transition-colors">
        <div className="px-6 py-10">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
            دسترسی غیرمجاز — این صفحه فقط برای ادمین است.
          </div>
        </div>
      </div>
    );
  }

  const f = tx.filters;

  return (
    <div className="min-h-screen bg-[#f7f7fb] text-slate-900 dark:bg-gray-950 dark:text-slate-100 transition-colors">
      <div className="px-6 py-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              دفتر کل تراکنش‌ها (ادمین)
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              مشاهده تمام تراکنش‌ها + فیلتر بر اساس وضعیت، نوع، دسته‌بندی و تاریخ.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => dispatch(fetchAdminTransactions())}
              className="group inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md
                         dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-100 dark:hover:bg-white/[0.06] dark:hover:border-orange-500/30 dark:shadow-none"
            >
              <FiRefreshCcw
                className={`text-slate-500 transition group-hover:text-orange-600 dark:text-slate-400 dark:group-hover:text-orange-300 ${
                  tx.loading ? "animate-spin" : ""
                }`}
              />
              تازه‌سازی
            </button>
          </div>
        </div>

        {tx.loading && (
          <div className="rounded-2xl border border-black/10 bg-white/75 px-4 py-3 text-sm text-slate-700 shadow-sm
                          dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300 dark:shadow-none">
            در حال بارگذاری تراکنش‌ها...
          </div>
        )}
        {tx.error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700
                          dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
            {tx.error}
          </div>
        )}

        {/* Filters */}
        <div className="rounded-3xl border border-black/10 bg-white/75 backdrop-blur shadow-sm
                        dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
          <div className="flex items-center justify-between gap-3 border-b border-black/10 px-6 py-5
                          dark:border-white/[0.08]">
            <div className="flex items-center gap-2">
              <div className="rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 p-2 text-white shadow-sm dark:shadow-none">
                <FiFilter />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  فیلترها
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  بعد از تغییر فیلترها، روی «اعمال فیلتر» بزنید.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                dispatch(resetAdminTxFilters());
                dispatch(fetchAdminTransactions());
              }}
              className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md
                         dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-100 dark:hover:bg-white/[0.06] dark:hover:border-orange-500/30 dark:shadow-none"
            >
              <FiX className="text-slate-500 dark:text-slate-400" />
              پاک کردن
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <select
              value={f.status || ""}
              onChange={(e) =>
                dispatch(setAdminTxFilters({ status: e.target.value as any }))
              }
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-slate-800
                         dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-100"
            >
              <option value="">وضعیت: همه</option>
              <option value="pending">pending</option>
              <option value="approved">approved</option>
              <option value="rejected">rejected</option>
              <option value="paid">paid</option>
            </select>

            <select
              value={f.type || ""}
              onChange={(e) =>
                dispatch(setAdminTxFilters({ type: e.target.value as any }))
              }
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-slate-800
                         dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-100"
            >
              <option value="">نوع: همه</option>
              <option value="in">in</option>
              <option value="out">out</option>
            </select>

            <select
              value={f.category || ""}
              onChange={(e) =>
                dispatch(setAdminTxFilters({ category: e.target.value as any }))
              }
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-slate-800
                         dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-100"
            >
              <option value="">دسته‌بندی: همه</option>
              <option value="order_payment">order_payment</option>
              <option value="commission">commission</option>
              <option value="payout">payout</option>
              <option value="refund">refund</option>
              <option value="adjustment">adjustment</option>
            </select>

            <select
              value={f.payment_method || ""}
              onChange={(e) =>
                dispatch(
                  setAdminTxFilters({ payment_method: e.target.value as any })
                )
              }
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-slate-800
                         dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-100"
            >
              <option value="">روش پرداخت: همه</option>
              <option value="internal">internal</option>
              <option value="bank">bank</option>
            </select>

            <input
              value={f.from || ""}
              onChange={(e) => dispatch(setAdminTxFilters({ from: e.target.value }))}
              type="date"
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-slate-800
                         dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-100"
            />

            <input
              value={f.to || ""}
              onChange={(e) => dispatch(setAdminTxFilters({ to: e.target.value }))}
              type="date"
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-slate-800
                         dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-100"
            />

            <button
              onClick={() => dispatch(fetchAdminTransactions())}
              className="md:col-span-3 lg:col-span-6 mt-2 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-95 hover:-translate-y-0.5
                         dark:shadow-none dark:hover:translate-y-0"
            >
              اعمال فیلتر
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-3xl border border-black/10 bg-white/75 backdrop-blur shadow-sm
                        dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
          <div className="flex items-center justify-between gap-3 border-b border-black/10 px-6 py-5
                          dark:border-white/[0.08]">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                تراکنش‌ها
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                جدیدترین تراکنش‌ها در بالا نمایش داده می‌شود.
              </p>
            </div>

            <div className="text-sm text-slate-600 dark:text-slate-400">
              {tx.items?.length || 0} مورد
            </div>
          </div>

          <div className="p-3 sm:p-4">
            <div className="overflow-hidden rounded-2xl border border-black/10 bg-white
                            dark:border-white/[0.08] dark:bg-gray-950/40">
              <div className="grid grid-cols-12 gap-2 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500
                              dark:bg-white/[0.03] dark:text-slate-400">
                <div className="col-span-2">شناسه</div>
                <div className="col-span-2 text-right">مبلغ</div>
                <div className="col-span-2">نوع</div>
                <div className="col-span-2">دسته</div>
                <div className="col-span-2">وضعیت</div>
                <div className="col-span-2">تاریخ</div>
              </div>

              {(!tx.items || tx.items.length === 0) && !tx.loading ? (
                <div className="px-4 py-6 text-sm text-slate-600 dark:text-slate-400">
                  تراکنشی یافت نشد.
                </div>
              ) : (
                (tx.items || []).map((t: AdminTransaction) => (
                  <Link
                    key={t.id}
                    href={`/Manager/transactionsLedger/${t.id}`}
                    className="grid grid-cols-12 gap-2 border-t border-black/5 px-4 py-3 text-sm transition hover:bg-orange-50/40
                               dark:border-white/[0.06] dark:hover:bg-orange-500/10"
                  >
                    <div className="col-span-2 font-semibold text-slate-900 dark:text-slate-100">
                      TX #{t.id}
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Wallet: {t.wallet}
                      </div>
                    </div>

                    <div className="col-span-2 text-right font-extrabold">
                      <span
                        className={
                          t.type === "in"
                            ? "text-emerald-700 dark:text-emerald-200"
                            : "text-rose-700 dark:text-rose-200"
                        }
                      >
                        {t.type === "in" ? "+" : "-"}
                        {t.amount}
                      </span>
                    </div>

                    <div className="col-span-2">
                      <TypePill type={t.type} />
                    </div>

                    <div className="col-span-2">
                      <span className="text-slate-800 font-semibold dark:text-slate-200">
                        {categoryLabel[t.category] || t.category}
                      </span>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {t.payment_method}
                      </div>
                    </div>

                    <div className="col-span-2">
                      <StatusPill status={t.status} />
                    </div>

                    <div className="col-span-2 text-sm text-slate-600 dark:text-slate-400">
                      {t.created_at?.slice(0, 10) || "-"}
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {t.related_order
                          ? `Order #${t.related_order}`
                          : t.admin_note || ""}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
