"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import Link from "next/link";
import {
  FiBell,
  FiRefreshCcw,
  FiDollarSign,
  FiLock,
  FiArrowDownLeft,
  FiArrowUpRight,
  FiCheckCircle,
  FiAlertTriangle,
} from "react-icons/fi";

import { fetchAdminFinanceDashboard } from "@/store/slices/adminDashboardSlice";
import {
  fetchFinanceAlerts,
  markFinanceAlertRead,
} from "@/store/slices/financeAlertSlice";

function StatCard({
  title,
  value,
  icon,
  accent = "from-orange-600 to-amber-600",
  hint,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  accent?: string;
  hint?: string;
}) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white/75 backdrop-blur shadow-sm dark:border-white/[0.08] dark:bg-white/[0.04]">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {title}
            </div>

            <div className="mt-2 text-2xl font-extrabold">
              <span
                className={`bg-gradient-to-r ${accent} bg-clip-text text-transparent`}
              >
                {value}
              </span>
            </div>

            {hint ? (
              <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {hint}
              </div>
            ) : null}
          </div>

          <div
            className={`shrink-0 rounded-2xl bg-gradient-to-r ${accent} p-3 text-white shadow-sm`}
          >
            <div className="text-xl">{icon}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertTypeBadge({
  type,
}: {
  type: "payout_request" | "pending_payment" | "suspicious";
}) {
  const map: Record<
    string,
    { label: string; cls: string; icon: React.ReactNode }
  > = {
    payout_request: {
      label: "درخواست برداشت",
      cls: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-200 dark:border-orange-500/20",
      icon: <FiArrowUpRight />,
    },
    pending_payment: {
      label: "پرداخت معلق",
      cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/20",
      icon: <FiArrowDownLeft />,
    },
    suspicious: {
      label: "مشکوک",
      cls: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-200 dark:border-rose-500/20",
      icon: <FiAlertTriangle />,
    },
  };

  const t = map[type] || {
    label: type,
    cls: "bg-slate-50 text-slate-700 border-black/10 dark:bg-white/[0.04] dark:text-slate-200 dark:border-white/[0.08]",
    icon: <FiBell />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${t.cls}`}
    >
      {t.icon}
      {t.label}
    </span>
  );
}

export default function AdminFinanceDashboardPage() {
  const dispatch = useDispatch<AppDispatch>();

  const dashboard = useSelector((s: RootState) => s.adminFinanceDashboard);
  const alerts = useSelector((s: RootState) => s.financeAlerts);

  const k = dashboard.data;

  useEffect(() => {
    dispatch(fetchAdminFinanceDashboard());
    dispatch(fetchFinanceAlerts());
  }, [dispatch]);

  const refreshing = dashboard.loading || alerts.loading;

  return (
    <div className="min-h-screen bg-[#f7f7fb] text-slate-900 dark:bg-gray-950 dark:text-slate-100 transition-colors">
      <div className="px-6 py-10 space-y-6">
        {/* Top header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              پنل مالی (ادمین)
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              شاخص‌های کلیدی، اعلان‌ها و وضعیت عملیات مالی.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                dispatch(fetchAdminFinanceDashboard());
                dispatch(fetchFinanceAlerts());
              }}
              className="group inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md
                         dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-100 dark:hover:bg-white/[0.06] dark:hover:border-orange-500/30"
            >
              <FiRefreshCcw
                className={`text-slate-500 transition group-hover:text-orange-600 dark:text-slate-400 dark:group-hover:text-orange-300 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
              تازه‌سازی
            </button>

            <Link
              href="/Manager/inboundPayments"
              className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md
                         dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-100 dark:hover:bg-white/[0.06] dark:hover:border-orange-500/30"
            >
              <FiArrowDownLeft className="text-slate-500 dark:text-slate-400" />
              پرداخت‌های ورودی
            </Link>

            <Link
              href="/Manager/payoutManagement"
              className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md
                         dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-100 dark:hover:bg-white/[0.06] dark:hover:border-orange-500/30"
            >
              <FiArrowUpRight className="text-slate-500 dark:text-slate-400" />
              برداشت‌ها
            </Link>
          </div>
        </div>

        {/* status */}
        {(dashboard.loading || alerts.loading) && (
          <div className="rounded-2xl border border-black/10 bg-white/75 px-4 py-3 text-sm text-slate-700 shadow-sm
                          dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300">
            در حال بارگذاری اطلاعات پنل مالی...
          </div>
        )}

        {(dashboard.error || alerts.error) && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700
                          dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
            {dashboard.error || alerts.error}
          </div>
        )}

        {/* KPI cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard
            title="مجموع درآمد پلتفرم"
            value={k ? k.total_platform_income : "-"}
            icon={<FiDollarSign />}
            accent="from-orange-600 to-amber-600"
            hint="براساس مجموع commission سفارش‌ها"
          />
          <StatCard
            title="مجموع پول در امانت (Escrow)"
            value={k ? k.total_escrow_balance : "-"}
            icon={<FiLock />}
            accent="from-orange-500/80 to-amber-500/80"
            hint="پول‌های قفل‌شده تا آزادسازی"
          />
          <StatCard
            title="پرداخت‌های ورودی در انتظار"
            value={k ? String(k.total_pending_inbound_payments) : "-"}
            icon={<FiArrowDownLeft />}
            accent="from-orange-700 to-amber-700"
            hint="نیاز به تایید/رد توسط ادمین"
          />

          <StatCard
            title="درخواست‌های برداشت (Pending)"
            value={k ? String(k.payout_requests_pending_count) : "-"}
            icon={<FiArrowUpRight />}
            accent="from-orange-600 to-amber-600"
          />
          <StatCard
            title="درخواست‌های برداشت (Rejected)"
            value={k ? String(k.payout_requests_rejected_count) : "-"}
            icon={<FiAlertTriangle />}
            accent="from-orange-500 to-amber-500"
          />
          <StatCard
            title="اعلان‌های خوانده‌نشده"
            value={k ? String(k.unread_alerts_count) : "-"}
            icon={<FiBell />}
            accent="from-orange-600 to-amber-600"
          />
        </div>

        {/* Alerts table */}
        <div className="rounded-3xl border border-black/10 bg-white/75 backdrop-blur shadow-sm
                        dark:border-white/[0.08] dark:bg-white/[0.04]">
          <div className="flex items-center justify-between gap-3 border-b border-black/10 px-6 py-5
                          dark:border-white/[0.08]">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                اعلان‌ها
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                آخرین هشدارها و رویدادهای مالی (ادمین).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/admin/finance/alerts"
                className="group inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md
                           dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-100 dark:hover:bg-white/[0.06] dark:hover:border-orange-500/30"
              >
                <FiBell className="text-slate-500 transition group-hover:text-orange-600 dark:text-slate-400 dark:group-hover:text-orange-300" />
                مشاهده همه
              </Link>
            </div>
          </div>

          <div className="p-3 sm:p-4">
            <div className="overflow-hidden rounded-2xl border border-black/10 bg-white
                            dark:border-white/[0.08] dark:bg-gray-950/40">
              <div className="grid grid-cols-12 gap-2 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500
                              dark:bg-white/[0.03] dark:text-slate-400">
                <div className="col-span-3">نوع</div>
                <div className="col-span-6">پیام</div>
                <div className="col-span-2">تاریخ</div>
                <div className="col-span-1 text-right">عملیات</div>
              </div>

              {(alerts.items || []).length === 0 && !alerts.loading ? (
                <div className="px-4 py-6 text-sm text-slate-600 dark:text-slate-400">
                  هنوز اعلانی ثبت نشده است.
                </div>
              ) : (
                (alerts.items || []).slice(0, 10).map((a) => {
                  const date = a.created_at
                    ? new Date(a.created_at).toLocaleString()
                    : "-";

                  return (
                    <div
                      key={a.id}
                      className={[
                        "grid grid-cols-12 gap-2 border-t border-black/5 px-4 py-3 text-sm transition",
                        "dark:border-white/[0.06]",
                        a.is_read
                          ? "opacity-70"
                          : "hover:bg-orange-50/40 dark:hover:bg-orange-500/10",
                      ].join(" ")}
                    >
                      <div className="col-span-3 flex items-center gap-2">
                        <AlertTypeBadge type={a.alert_type} />
                        {!a.is_read && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700
                                           dark:bg-emerald-500/10 dark:text-emerald-200">
                            <FiCheckCircle />
                            جدید
                          </span>
                        )}
                      </div>

                      <div className="col-span-6 text-slate-800 break-words dark:text-slate-200">
                        {a.message}
                      </div>

                      <div className="col-span-2 text-sm text-slate-600 dark:text-slate-400">
                        {date}
                      </div>

                      <div className="col-span-1 flex justify-end">
                        <button
                          onClick={() =>
                            dispatch(
                              markFinanceAlertRead({
                                id: a.id,
                                is_read: !a.is_read,
                              })
                            )
                          }
                          className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md
                                     dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.06] dark:hover:border-orange-500/30"
                          title={a.is_read ? "علامت‌گذاری به‌عنوان خوانده‌نشده" : "علامت‌گذاری به‌عنوان خوانده‌شده"}
                        >
                          {a.is_read ? "خوانده‌نشده" : "خوانده‌شده"}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-3 text-xs text-slate-600 dark:text-slate-400">
              نکته: برای مدیریت کامل پرداخت‌های ورودی، برداشت‌ها و آزادسازی امانت،
              از صفحات مدیریت استفاده کنید.
            </div>
          </div>
        </div>

        {/* small note */}
        {!dashboard.loading && !dashboard.error && !k && (
          <div className="rounded-2xl border border-black/10 bg-white/75 px-4 py-3 text-sm text-slate-700
                          dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300">
            اطلاعات داشبورد در دسترس نیست.
          </div>
        )}
      </div>
    </div>
  );
}
