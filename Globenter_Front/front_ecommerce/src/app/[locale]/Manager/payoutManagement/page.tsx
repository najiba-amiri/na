"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import {
  fetchAdminPayoutRequests,
  adminApprovePayout,
  adminRejectPayout,
  adminMarkPayoutPaid,
  AdminPayoutRequest,
} from "@/store/slices/adminPayoutSlice";
import {
  FiCheckCircle,
  FiXCircle,
  FiDollarSign,
  FiRefreshCcw,
} from "react-icons/fi";

type Status = "pending" | "approved" | "rejected" | "paid" | "all";

function StatusPill({ status }: { status: AdminPayoutRequest["status"] }) {
  const map: Record<
    AdminPayoutRequest["status"],
    { label: string; cls: string }
  > = {
    pending: {
      label: "در انتظار",
      cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/20",
    },
    approved: {
      label: "تایید شده",
      cls: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-200 dark:border-blue-500/20",
    },
    rejected: {
      label: "رد شده",
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

export default function AdminPayoutManagementPage() {
  const dispatch = useDispatch<AppDispatch>();
  const adminPayout = useSelector((s: RootState) => s.adminPayout);
  const userProfile = useSelector((s: RootState) => s.profile.data);
  const role = (userProfile?.role || "user").toLowerCase();
  const isAdmin = role === "admin";

  const [tab, setTab] = useState<Status>("all");

  useEffect(() => {
    if (isAdmin) dispatch(fetchAdminPayoutRequests());
  }, [dispatch, isAdmin]);

  const filtered = useMemo(() => {
    const items = adminPayout.items || [];
    if (tab === "all") return items;
    return items.filter((x) => x.status === tab);
  }, [adminPayout.items, tab]);

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

  return (
    <div className="min-h-screen bg-[#f7f7fb] text-slate-900 dark:bg-gray-950 dark:text-slate-100 transition-colors">
      <div className="px-6 py-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              مدیریت برداشت‌ها (ادمین)
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              تایید، رد و ثبت پرداخت نهایی برای درخواست‌های برداشت.
            </p>
          </div>

          <button
            onClick={() => dispatch(fetchAdminPayoutRequests())}
            className="group inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md
                       dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-100 dark:hover:bg-white/[0.06] dark:hover:border-orange-500/30 dark:shadow-none"
          >
            <FiRefreshCcw
              className={`text-slate-500 transition group-hover:text-orange-600 dark:text-slate-400 dark:group-hover:text-orange-300 ${
                adminPayout.loading ? "animate-spin" : ""
              }`}
            />
            تازه‌سازی
          </button>
        </div>

        {/* status */}
        {adminPayout.loading && (
          <div className="rounded-2xl border border-black/10 bg-white/75 px-4 py-3 text-sm text-slate-700 shadow-sm
                          dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300 dark:shadow-none">
            در حال بارگذاری درخواست‌ها...
          </div>
        )}
        {adminPayout.error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700
                          dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
            {adminPayout.error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {(["all", "pending", "approved", "paid", "rejected"] as Status[]).map(
            (s) => (
              <button
                key={s}
                onClick={() => setTab(s)}
                className={[
                  "rounded-2xl px-4 py-2 text-sm font-semibold border shadow-sm transition",
                  "dark:shadow-none",
                  tab === s
                    ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white border-orange-200 dark:border-orange-500/30"
                    : "bg-white border-black/10 text-slate-700 hover:border-orange-200 dark:bg-white/[0.04] dark:text-slate-200 dark:border-white/[0.08] dark:hover:bg-white/[0.06] dark:hover:border-orange-500/30",
                ].join(" ")}
              >
                {s === "all"
                  ? "همه"
                  : s === "pending"
                  ? "در انتظار"
                  : s === "approved"
                  ? "تایید شده"
                  : s === "paid"
                  ? "پرداخت شد"
                  : "رد شده"}
              </button>
            )
          )}
        </div>

        {/* Table */}
        <div className="rounded-3xl border border-black/10 bg-white/75 backdrop-blur shadow-sm
                        dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
          <div className="flex items-center justify-between gap-3 border-b border-black/10 px-6 py-5
                          dark:border-white/[0.08]">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                لیست درخواست‌ها
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                برای هر درخواست، ابتدا تایید کنید، سپس پس از پرداخت واقعی، «پرداخت شد»
                را بزنید.
              </p>
            </div>

            <div className="text-sm text-slate-600 dark:text-slate-400">
              {filtered.length} مورد
            </div>
          </div>

          <div className="p-3 sm:p-4">
            <div className="overflow-hidden rounded-2xl border border-black/10 bg-white
                            dark:border-white/[0.08] dark:bg-gray-950/40">
              <div className="grid grid-cols-12 gap-2 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500
                              dark:bg-white/[0.03] dark:text-slate-400">
                <div className="col-span-2">ID</div>
                <div className="col-span-2 text-right">مبلغ</div>
                <div className="col-span-2">روش</div>
                <div className="col-span-3">اطلاعات بانکی</div>
                <div className="col-span-1">وضعیت</div>
                <div className="col-span-2 text-right">عملیات</div>
              </div>

              {filtered.length === 0 && !adminPayout.loading ? (
                <div className="px-4 py-6 text-sm text-slate-600 dark:text-slate-400">
                  موردی برای نمایش وجود ندارد.
                </div>
              ) : (
                filtered.map((p) => (
                  <div
                    key={p.id}
                    className="grid grid-cols-12 gap-2 border-t border-black/5 px-4 py-3 text-sm
                               dark:border-white/[0.06] dark:hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="col-span-2 font-semibold text-slate-800 dark:text-slate-200">
                      #{p.id}
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Wallet: {p.wallet}
                      </div>
                    </div>

                    <div className="col-span-2 text-right font-extrabold text-slate-900 dark:text-white">
                      {p.amount}
                    </div>

                    <div className="col-span-2">
                      <span className="inline-flex rounded-full border border-black/10 bg-white px-2 py-1 text-xs font-semibold text-slate-700
                                       dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-200">
                        {p.payment_method === "bank" ? "بانکی" : "داخلی"}
                      </span>
                    </div>

                    <div className="col-span-3 text-slate-700 break-words dark:text-slate-300">
                      {p.bank_account || "-"}
                    </div>

                    <div className="col-span-1">
                      <StatusPill status={p.status} />
                    </div>

                    <div className="col-span-2 flex justify-end gap-2">
                      {/* Approve */}
                      <button
                        disabled={adminPayout.updating || p.status !== "pending"}
                        onClick={() => dispatch(adminApprovePayout({ id: p.id }))}
                        className={[
                          "inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold shadow-sm border transition",
                          "dark:shadow-none",
                          p.status === "pending"
                            ? "bg-white border-emerald-200 text-emerald-700 hover:-translate-y-0.5 hover:shadow-md dark:bg-white/[0.04] dark:border-emerald-500/30 dark:text-emerald-200 dark:hover:bg-emerald-500/10 dark:hover:border-emerald-500/40 dark:hover:translate-y-0"
                            : "bg-slate-100 border-black/10 text-slate-400 cursor-not-allowed dark:bg-white/[0.03] dark:border-white/[0.06] dark:text-slate-500",
                        ].join(" ")}
                      >
                        <FiCheckCircle />
                        تایید
                      </button>

                      {/* Reject */}
                      <button
                        disabled={adminPayout.updating || p.status !== "pending"}
                        onClick={() => {
                          const note = window.prompt("دلیل رد (اختیاری):") || "";
                          dispatch(adminRejectPayout({ id: p.id, note }));
                        }}
                        className={[
                          "inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold shadow-sm border transition",
                          "dark:shadow-none",
                          p.status === "pending"
                            ? "bg-white border-rose-200 text-rose-700 hover:-translate-y-0.5 hover:shadow-md dark:bg-white/[0.04] dark:border-rose-500/30 dark:text-rose-200 dark:hover:bg-rose-500/10 dark:hover:border-rose-500/40 dark:hover:translate-y-0"
                            : "bg-slate-100 border-black/10 text-slate-400 cursor-not-allowed dark:bg-white/[0.03] dark:border-white/[0.06] dark:text-slate-500",
                        ].join(" ")}
                      >
                        <FiXCircle />
                        رد
                      </button>

                      {/* Mark Paid */}
                      <button
                        disabled={adminPayout.updating || p.status !== "approved"}
                        onClick={() => dispatch(adminMarkPayoutPaid({ id: p.id }))}
                        className={[
                          "inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold shadow-sm border transition",
                          "dark:shadow-none",
                          p.status === "approved"
                            ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white border-orange-200 hover:opacity-95 hover:-translate-y-0.5 dark:border-orange-500/30 dark:hover:translate-y-0"
                            : "bg-slate-100 border-black/10 text-slate-400 cursor-not-allowed dark:bg-white/[0.03] dark:border-white/[0.06] dark:text-slate-500",
                        ].join(" ")}
                      >
                        <FiDollarSign />
                        پرداخت شد
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-3 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-xs text-slate-700
                            dark:border-orange-500/25 dark:bg-orange-500/10 dark:text-slate-200">
              نکته: «پرداخت شد» فقط وقتی فعال می‌شود که درخواست قبلاً «تایید شده»
              باشد.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
