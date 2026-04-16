"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import {
  FiCheckCircle,
  FiXCircle,
  FiRefreshCcw,
  FiArrowDownLeft,
} from "react-icons/fi";

// We will call backend directly for now (no slice yet) to keep it fast.
// If you prefer Redux slice, say and I’ll convert it.
import { financeApi } from "@/lib/financeApi";

type InboundPayment = {
  id: number;
  amount: string;
  payment_method: "bank" | "internal";
  status: "pending" | "approved" | "rejected";
  created_at: string;
  order: number;
  user: number;
  created_by: number;
  admin_note?: string | null;
};

type StatusTab = "all" | "pending" | "approved" | "rejected";

function StatusPill({ status }: { status: InboundPayment["status"] }) {
  const map: Record<InboundPayment["status"], { label: string; cls: string }> = {
    pending: {
      label: "در انتظار",
      cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/20",
    },
    approved: {
      label: "تایید شده",
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:border-emerald-500/20",
    },
    rejected: {
      label: "رد شده",
      cls: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-200 dark:border-rose-500/20",
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

export default function AdminInboundPaymentsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const userProfile = useSelector((s: RootState) => s.profile.data);
  const role = (userProfile?.role || "user").toLowerCase();
  const isAdmin = role === "admin";

  const [tab, setTab] = useState<StatusTab>("all");
  const [items, setItems] = useState<InboundPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await financeApi.get<InboundPayment[]>(
        "/finance/api/inbound-payments/"
      );
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (e: any) {
      setError(
        e?.response?.data?.detail ||
          e?.response?.data?.message ||
          "Failed to load inbound payments"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const filtered = useMemo(() => {
    if (tab === "all") return items;
    return items.filter((x: InboundPayment) => x.status === tab);
  }, [items, tab]);

  const approve = async (id: number) => {
    try {
      setUpdating(true);
      await financeApi.post(`/finance/api/inbound-payments/${id}/approve/`, {});
      await load();
    } catch (e: any) {
      setError(
        e?.response?.data?.detail || e?.response?.data?.message || "Approve failed"
      );
    } finally {
      setUpdating(false);
    }
  };

  const reject = async (id: number) => {
    try {
      const note = window.prompt("دلیل رد (اختیاری):") || "";
      setUpdating(true);
      await financeApi.post(`/finance/api/inbound-payments/${id}/reject/`, {
        note,
      });
      await load();
    } catch (e: any) {
      setError(
        e?.response?.data?.detail || e?.response?.data?.message || "Reject failed"
      );
    } finally {
      setUpdating(false);
    }
  };

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
              پرداخت‌های ورودی (ادمین)
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              بررسی و تایید پرداخت‌های ورودی برای سفارش‌ها.
            </p>
          </div>

          <button
            onClick={load}
            className="group inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md
                       dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-100 dark:hover:bg-white/[0.06] dark:hover:border-orange-500/30"
          >
            <FiRefreshCcw
              className={`text-slate-500 transition group-hover:text-orange-600 dark:text-slate-400 dark:group-hover:text-orange-300 ${
                loading ? "animate-spin" : ""
              }`}
            />
            تازه‌سازی
          </button>
        </div>

        {loading && (
          <div className="rounded-2xl border border-black/10 bg-white/75 px-4 py-3 text-sm text-slate-700 shadow-sm
                          dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300">
            در حال بارگذاری پرداخت‌های ورودی...
          </div>
        )}
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700
                          dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {(["all", "pending", "approved", "rejected"] as StatusTab[]).map((s) => {
            const isActive = tab === s;
            return (
              <button
                key={s}
                onClick={() => setTab(s)}
                className={[
                  "rounded-2xl px-4 py-2 text-sm font-semibold border shadow-sm transition",
                  "dark:shadow-none",
                  isActive
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
                  : "رد شده"}
              </button>
            );
          })}
        </div>

        {/* Table Card */}
        <div className="rounded-3xl border border-black/10 bg-white/75 backdrop-blur shadow-sm
                        dark:border-white/[0.08] dark:bg-white/[0.035] dark:shadow-none">
          <div className="flex items-center justify-between gap-3 border-b border-black/10 px-6 py-5
                          dark:border-white/[0.08]">
            <div className="flex items-center gap-2">
              <div className="rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 p-2 text-white shadow-sm dark:shadow-none">
                <FiArrowDownLeft />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  لیست پرداخت‌ها
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  تایید پرداخت باعث ایجاد تراکنش و قفل شدن مبلغ در escrow می‌شود.
                </p>
              </div>
            </div>

            <div className="text-sm text-slate-600 dark:text-slate-400">
              {filtered.length} مورد
            </div>
          </div>

          <div className="p-3 sm:p-4">
            {/* Inner table wrapper - prevent "light corners" on dark mode */}
            <div className="overflow-hidden rounded-2xl border border-black/10 bg-white
                            dark:border-white/[0.08] dark:bg-gray-950/45">
              <div className="grid grid-cols-12 gap-2 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500
                              dark:bg-white/[0.03] dark:text-slate-400">
                <div className="col-span-2">ID</div>
                <div className="col-span-2 text-right">مبلغ</div>
                <div className="col-span-2">روش</div>
                <div className="col-span-2">سفارش</div>
                <div className="col-span-2">کاربر</div>
                <div className="col-span-1">وضعیت</div>
                <div className="col-span-1 text-right">عملیات</div>
              </div>

              {filtered.length === 0 && !loading ? (
                <div className="px-4 py-6 text-sm text-slate-600 dark:text-slate-400">
                  موردی برای نمایش وجود ندارد.
                </div>
              ) : (
                filtered.map((p: InboundPayment) => (
                  <div
                    key={p.id}
                    className="grid grid-cols-12 gap-2 border-t border-black/5 px-4 py-3 text-sm
                               dark:border-white/[0.06] dark:hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="col-span-2 font-semibold text-slate-800 dark:text-slate-200">
                      #{p.id}
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

                    <div className="col-span-2 text-slate-700 dark:text-slate-300">
                      #{p.order}
                    </div>
                    <div className="col-span-2 text-slate-700 dark:text-slate-300">
                      User #{p.user}
                    </div>

                    <div className="col-span-1">
                      <StatusPill status={p.status} />
                    </div>

                    <div className="col-span-1 flex justify-end gap-2">
                      <button
                        disabled={updating || p.status !== "pending"}
                        onClick={() => approve(p.id)}
                        className={[
                          "inline-flex items-center justify-center rounded-xl border px-3 py-2 text-xs font-bold shadow-sm transition",
                          "dark:shadow-none",
                          p.status === "pending"
                            ? "bg-white border-emerald-200 text-emerald-700 hover:-translate-y-0.5 hover:shadow-md dark:bg-white/[0.04] dark:border-emerald-500/30 dark:text-emerald-200 dark:hover:bg-emerald-500/10 dark:hover:border-emerald-500/40 dark:hover:translate-y-0"
                            : "bg-slate-100 border-black/10 text-slate-400 cursor-not-allowed dark:bg-white/[0.03] dark:border-white/[0.06] dark:text-slate-500",
                        ].join(" ")}
                        title="Approve"
                      >
                        <FiCheckCircle />
                      </button>

                      <button
                        disabled={updating || p.status !== "pending"}
                        onClick={() => reject(p.id)}
                        className={[
                          "inline-flex items-center justify-center rounded-xl border px-3 py-2 text-xs font-bold shadow-sm transition",
                          "dark:shadow-none",
                          p.status === "pending"
                            ? "bg-white border-rose-200 text-rose-700 hover:-translate-y-0.5 hover:shadow-md dark:bg-white/[0.04] dark:border-rose-500/30 dark:text-rose-200 dark:hover:bg-rose-500/10 dark:hover:border-rose-500/40 dark:hover:translate-y-0"
                            : "bg-slate-100 border-black/10 text-slate-400 cursor-not-allowed dark:bg-white/[0.03] dark:border-white/[0.06] dark:text-slate-500",
                        ].join(" ")}
                        title="Reject"
                      >
                        <FiXCircle />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-3 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-xs text-slate-700
                            dark:border-orange-500/25 dark:bg-orange-500/10 dark:text-slate-200">
              نکته: فقط پرداخت‌های «در انتظار» قابل تایید/رد هستند.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
