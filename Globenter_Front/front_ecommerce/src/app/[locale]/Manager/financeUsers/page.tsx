"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";

import {
  fetchAdminUsers,
  setAdminUsersQuery,
  setAdminUsersPage,
  setAdminUsersPageSize,
  type AdminUserItem,
} from "@/store/slices/adminUsersSlice";

import {
  adminTopupWallet,
  clearAdminTopupError,
  clearAdminTopupResult,
} from "@/store/slices/adminWalletTopupSlice";

import toast from "react-hot-toast";
import { FiSearch, FiPlus, FiRefreshCw, FiX } from "react-icons/fi";

const safeStr = (v: any) =>
  typeof v === "string" ? v : v == null ? "" : String(v);

export default function AdminUsersFinancePage() {
  const dispatch = useDispatch<AppDispatch>();
  const usersState = useSelector((s: RootState) => s.adminUsers);
  const topupState = useSelector((s: RootState) => s.adminWalletTopup);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<AdminUserItem | null>(null);

  // modal fields
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState<string>("");

  useEffect(() => {
    dispatch(fetchAdminUsers());
  }, [dispatch]);

  const filtered = useMemo(() => {
    const q = usersState.q.trim().toLowerCase();
    if (!q) return usersState.items;
    return usersState.items.filter((u) => {
      const hay = [
        u.username,
        u.email,
        u.first_name,
        u.last_name,
        u.phone,
        u.role,
      ]
        .map(safeStr)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [usersState.items, usersState.q]);

  const total = filtered.length;
  const pageSize = usersState.pageSize;
  const page = usersState.page;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const pageClamped = Math.min(page, pages);

  const paged = useMemo(() => {
    const start = (pageClamped - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, pageClamped, pageSize]);

  const openTopup = (u: AdminUserItem) => {
    dispatch(clearAdminTopupError());
    dispatch(clearAdminTopupResult());
    setSelected(u);
    setAmount("");
    setNote("");
    setOpen(true);
  };

  const closeTopup = () => {
    setOpen(false);
    setSelected(null);
  };

  const submitTopup = async () => {
    if (!selected) return;

    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) {
      toast.error("لطفاً مبلغ معتبر وارد کنید");
      return;
    }

    const loadingId = toast.loading("در حال افزودن پول...");

    const payload = {
      user_id: selected.id,
      amount: amount,
      note: note || "Admin top-up",
    };

    const res = await dispatch(adminTopupWallet(payload) as any);

    toast.dismiss(loadingId);

    if (res?.meta?.requestStatus === "fulfilled") {
      toast.success(`✅ موفقانه ${amount} AFN اضافه شد`);
      closeTopup();
      // optional refresh
      // dispatch(fetchAdminUsers());
    } else {
      const msg = res?.payload || topupState?.error || "Topup failed";
      toast.error(String(msg));
    }
  };

  const loading = usersState.loading;
  const error = usersState.error;

  return (
    <div className="min-h-screen bg-[#f7f7fb] text-slate-900 dark:bg-gray-950 dark:text-slate-100 transition-colors">
      <div className="px-6 py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold">مدیریت کاربران (ادمین)</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              لیست کاربران + افزودن پول به کیف پول کاربر
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => dispatch(fetchAdminUsers())}
              className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md
                         dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-100 dark:hover:bg-white/[0.06] dark:shadow-none dark:hover:translate-y-0"
            >
              <FiRefreshCw />
              رفرش
            </button>
          </div>
        </div>

        {/* search + pageSize */}
        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="md:col-span-8">
            <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-white/75 px-4 py-3 shadow-sm
                            dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
              <FiSearch className="text-slate-500 dark:text-slate-400" />
              <input
                value={usersState.q}
                onChange={(e) => dispatch(setAdminUsersQuery(e.target.value))}
                placeholder="جستجو: نام کاربری، ایمیل، شماره..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="md:col-span-4">
            <div className="rounded-2xl border border-black/10 bg-white/75 px-4 py-3 shadow-sm
                            dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  نمایش در هر صفحه
                </div>
                <select
                  value={usersState.pageSize}
                  onChange={(e) =>
                    dispatch(setAdminUsersPageSize(Number(e.target.value)))
                  }
                  className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-slate-800
                             dark:border-white/[0.08] dark:bg-gray-950/40 dark:text-slate-100"
                >
                  {[8, 12, 20, 40].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* status */}
        {loading && (
          <div className="mt-6 rounded-2xl border border-black/10 bg-white/75 px-4 py-3 text-sm text-slate-700 shadow-sm
                          dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300 dark:shadow-none">
            در حال دریافت لیست کاربران...
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700
                          dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </div>
        )}

        {/* table */}
        <div className="mt-6 overflow-hidden rounded-3xl border border-black/10 bg-white/75 shadow-sm backdrop-blur
                        dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
          <div className="grid grid-cols-12 gap-2 border-b border-black/10 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500
                          dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-400">
            <div className="col-span-3">کاربر</div>
            <div className="col-span-3">ایمیل</div>
            <div className="col-span-2">نقش</div>
            <div className="col-span-2">شماره</div>
            <div className="col-span-2 text-right">عملیات</div>
          </div>

          {!loading && paged.length === 0 ? (
            <div className="px-4 py-6 text-sm text-slate-600 dark:text-slate-400">
              کاربری یافت نشد.
            </div>
          ) : (
            paged.map((u) => (
              <div
                key={u.id}
                className="grid grid-cols-12 gap-2 border-t border-black/5 px-4 py-3 text-sm hover:bg-orange-50/40
                           dark:border-white/[0.06] dark:hover:bg-orange-500/10"
              >
                <div className="col-span-3">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    {u.username}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    ID: {u.id}
                  </div>
                </div>

                <div className="col-span-3 text-slate-700 dark:text-slate-300">
                  {u.email || "-"}
                </div>

                <div className="col-span-2">
                  <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700
                                   dark:bg-white/[0.06] dark:text-slate-200">
                    {u.role ||
                      (u.is_superuser
                        ? "admin"
                        : u.is_seller
                        ? "seller"
                        : "buyer")}
                  </span>
                </div>

                <div className="col-span-2 text-slate-700 dark:text-slate-300">
                  {u.phone || "-"}
                </div>

                <div className="col-span-2 flex justify-end">
                  <button
                    onClick={() => openTopup(u)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:opacity-95 hover:-translate-y-0.5
                               dark:shadow-none dark:hover:translate-y-0"
                  >
                    <FiPlus />
                    افزودن پول
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* pagination */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {total} کاربر — صفحه {pageClamped} از {pages}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                dispatch(setAdminUsersPage(Math.max(1, pageClamped - 1)))
              }
              className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-slate-800
                         dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-100"
              disabled={pageClamped === 1}
            >
              قبلی
            </button>

            <button
              onClick={() =>
                dispatch(setAdminUsersPage(Math.min(pages, pageClamped + 1)))
              }
              className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-slate-800
                         dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-100"
              disabled={pageClamped === pages}
            >
              بعدی
            </button>
          </div>
        </div>
      </div>

      {/* Topup modal */}
      {open && selected && (
        <div className="fixed inset-0 z-500 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeTopup}
          />

          <div
            className="relative w-full max-w-lg rounded-3xl border border-black/10 bg-white p-6 shadow-xl
                       dark:border-white/[0.08] dark:bg-gray-950"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-extrabold">افزودن پول به کیف پول</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  کاربر:{" "}
                  <span className="font-semibold">{selected.username}</span>{" "}
                  (ID: {selected.id})
                </p>
              </div>

              <button
                onClick={closeTopup}
                className="rounded-2xl border border-black/10 bg-white p-2 text-slate-700 hover:bg-slate-50
                           dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.06]"
              >
                <FiX />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  مبلغ (AFN)
                </label>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="مثلاً 2000.00"
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none
                             focus:border-orange-300 focus:ring-2 focus:ring-orange-200
                             dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-100 dark:focus:ring-orange-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  یادداشت (اختیاری)
                </label>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="مثلاً test topup"
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none
                             focus:border-orange-300 focus:ring-2 focus:ring-orange-200
                             dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-100 dark:focus:ring-orange-500/20"
                />
              </div>

              {topupState?.error && (
                <div
                  className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700
                             dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200"
                >
                  {topupState.error}
                </div>
              )}

              <button
                onClick={submitTopup}
                disabled={topupState?.loading}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 px-5 py-4 text-sm font-extrabold text-white shadow-sm transition hover:opacity-95
                           disabled:cursor-not-allowed disabled:opacity-60 dark:shadow-none"
              >
                {topupState?.loading ? "در حال ثبت..." : "ثبت و افزودن پول"}
              </button>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                این عملیات از مسیر{" "}
                <span className="font-mono">/finance/api/wallets/admin/topup/</span>{" "}
                انجام می‌شود.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
