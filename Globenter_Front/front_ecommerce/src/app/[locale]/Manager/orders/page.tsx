"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import {
  fetchMyOrders,
  setOrderFilters,
  selectFilteredOrders,
} from "@/store/slices/orderSlice";
import {
  FiFilter,
  FiShield,
  FiLock,
  FiCheckCircle,
  FiClock,
  FiArrowUpRight,
  FiPackage,
} from "react-icons/fi";

type PaymentStatus = "unpaid" | "paid" | "refunded" | "all";
type ReleaseStatus = "locked" | "released" | "all";

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

export default function OrdersPage() {
  const dispatch = useDispatch<AppDispatch>();

  const ordersState = useSelector((s: RootState) => s.orders);
  const { loading, error, filters } = ordersState;

  const allOrders = useSelector((s: RootState) => s.orders.items);
  const filteredOrders = useSelector(selectFilteredOrders);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  const stats = useMemo(() => {
    const list = allOrders ?? [];
    const total = list.length;
    const paid = list.filter((o) => o.payment_status === "paid").length;
    const unpaid = list.filter((o) => o.payment_status === "unpaid").length;
    const refunded = list.filter((o) => o.payment_status === "refunded").length;
    const locked = list.filter((o) => o.fund_release_status === "locked").length;
    const released = list.filter((o) => o.fund_release_status === "released").length;

    const totalAmount = list.reduce(
      (acc, o) => acc + toNumber(o.total_amount),
      0
    );
    const paidAmount = list.reduce(
      (acc, o) => acc + toNumber(o.paid_amount),
      0
    );
    const commission = list.reduce(
      (acc, o) => acc + toNumber(o.commission),
      0
    );
    const sellerShare = list.reduce(
      (acc, o) => acc + toNumber(o.seller_share),
      0
    );

    return {
      total,
      paid,
      unpaid,
      refunded,
      locked,
      released,
      totalAmount,
      paidAmount,
      commission,
      sellerShare,
    };
  }, [allOrders]);

  const paymentTab = (val: PaymentStatus) =>
    dispatch(setOrderFilters({ payment_status: val }));

  const releaseTab = (val: ReleaseStatus) =>
    dispatch(setOrderFilters({ fund_release_status: val }));

  return (
    <div className="min-h-screen bg-[#f7f7fb] text-slate-900 dark:bg-gray-950 dark:text-slate-100 transition-colors">
      <div className="px-6 py-10">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
              سفارش‌ها
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              لیست سفارش‌های مالی شما + وضعیت پرداخت و امانت
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 rounded-2xl border border-black/10 bg-white/70 px-4 py-3 shadow-sm
                          dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
            <FiShield className="text-slate-600 dark:text-slate-400" />
            <div className="text-sm">
              <div className="font-semibold text-slate-900 dark:text-white">
                نمایش امن
              </div>
              <div className="text-slate-500 dark:text-slate-400 text-xs">
                فقط مشاهده
              </div>
            </div>
          </div>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="mt-6 rounded-2xl border border-black/10 bg-white/75 px-4 py-3 text-sm text-slate-700 shadow-sm
                          dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300 dark:shadow-none">
            در حال بارگذاری سفارش‌ها...
          </div>
        )}
        {error && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700
                          dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard
            title="مجموع سفارش‌ها"
            value={String(stats.total)}
            icon={<FiPackage />}
          />
          <StatCard
            title="مجموع مبلغ سفارش‌ها"
            value={money(stats.totalAmount)}
            icon={<FiArrowUpRight />}
          />
          <StatCard
            title="مبلغ پرداخت شده"
            value={money(stats.paidAmount)}
            icon={<FiCheckCircle />}
          />
          <StatCard
            title="امانت قفل‌شده"
            value={String(stats.locked)}
            icon={<FiLock />}
          />
        </div>

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
            <div className="text-sm text-slate-600 dark:text-slate-400">
              تعداد نمایش:{" "}
              <span className="font-bold text-slate-900 dark:text-white">
                {filteredOrders.length}
              </span>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* Payment tabs */}
            <div>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                وضعیت پرداخت
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <TabButton
                  active={filters.payment_status === "all"}
                  onClick={() => paymentTab("all")}
                >
                  همه <Badge>{stats.total}</Badge>
                </TabButton>
                <TabButton
                  active={filters.payment_status === "paid"}
                  onClick={() => paymentTab("paid")}
                >
                  پرداخت شد <Badge>{stats.paid}</Badge>
                </TabButton>
                <TabButton
                  active={filters.payment_status === "unpaid"}
                  onClick={() => paymentTab("unpaid")}
                >
                  پرداخت نشده <Badge>{stats.unpaid}</Badge>
                </TabButton>
                <TabButton
                  active={filters.payment_status === "refunded"}
                  onClick={() => paymentTab("refunded")}
                >
                  بازپرداخت <Badge>{stats.refunded}</Badge>
                </TabButton>
              </div>
            </div>

            {/* Release tabs */}
            <div>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                وضعیت امانت
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <TabButton
                  active={filters.fund_release_status === "all"}
                  onClick={() => releaseTab("all")}
                >
                  همه <Badge>{stats.total}</Badge>
                </TabButton>
                <TabButton
                  active={filters.fund_release_status === "locked"}
                  onClick={() => releaseTab("locked")}
                >
                  قفل‌شده <Badge>{stats.locked}</Badge>
                </TabButton>
                <TabButton
                  active={filters.fund_release_status === "released"}
                  onClick={() => releaseTab("released")}
                >
                  آزاد شده <Badge>{stats.released}</Badge>
                </TabButton>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="mt-6 overflow-hidden rounded-3xl border border-black/10 bg-white/75 shadow-sm
                        dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
          <div className="flex items-center justify-between border-b border-black/10 px-6 py-5
                          dark:border-white/[0.08]">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              لیست سفارش‌ها
            </h2>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              نمایش:{" "}
              <span className="font-bold text-slate-900 dark:text-white">
                {filteredOrders.length}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-950/40">
            {/* header */}
            <div className="grid grid-cols-12 gap-2 bg-slate-50 px-6 py-3 text-xs font-semibold text-slate-500
                            dark:bg-white/[0.03] dark:text-slate-400">
              <div className="col-span-3">شماره سفارش</div>
              <div className="col-span-2 text-right">مبلغ کل</div>
              <div className="col-span-2 text-right">پرداخت شده</div>
              <div className="col-span-2 text-right">کمیسیون</div>
              <div className="col-span-1">پرداخت</div>
              <div className="col-span-1">امانت</div>
              <div className="col-span-1">تاریخ</div>
            </div>

            {!loading && filteredOrders.length === 0 ? (
              <div className="px-6 py-10 text-center text-slate-600 dark:text-slate-400">
                سفارشی پیدا نشد. فیلترها را تغییر دهید.
              </div>
            ) : (
              filteredOrders.map((o) => {
                const createdAt = o.created_at?.slice(0, 10) ?? "-";
                return (
                  <Link
                    key={o.id}
                    href={`/wallet/orders/${o.id}`}
                    className="group grid grid-cols-12 gap-2 border-t border-black/5 px-6 py-4 transition hover:bg-orange-50/40
                               dark:border-white/[0.06] dark:hover:bg-orange-500/10"
                  >
                    <div className="col-span-3">
                      <div className="font-semibold text-slate-900 transition group-hover:text-orange-700 dark:text-slate-100 dark:group-hover:text-orange-300">
                        {o.order_number}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Seller share: {money(toNumber(o.seller_share))}
                      </div>
                    </div>

                    <div className="col-span-2 text-right font-bold text-slate-900 dark:text-white">
                      {money(toNumber(o.total_amount))}
                    </div>

                    <div className="col-span-2 text-right font-bold text-slate-900 dark:text-white">
                      {money(toNumber(o.paid_amount))}
                    </div>

                    <div className="col-span-2 text-right font-bold text-slate-900 dark:text-white">
                      {money(toNumber(o.commission))}
                    </div>

                    <div className="col-span-1">
                      <PaymentPill status={o.payment_status} />
                    </div>

                    <div className="col-span-1">
                      <ReleasePill status={o.fund_release_status} />
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

        {/* Notes */}
        <div className="mt-6 rounded-3xl border border-orange-200 bg-orange-50 px-6 py-4 text-sm text-slate-700
                        dark:border-orange-500/25 dark:bg-orange-500/10 dark:text-slate-200">
          <div className="font-bold mb-1">یادآوری</div>
          <div className="text-sm">
            پول <b>قفل‌شده</b> بعد از تحویل سفارش و ختم شدن مهلت شکایت، <b>آزاد</b>{" "}
            می‌شود.
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="group rounded-3xl border border-black/10 bg-white/75 backdrop-blur shadow-sm transition hover:-translate-y-1 hover:shadow-md
                    dark:border-white/[0.08] dark:bg-white/[0.04] dark:hover:bg-white/[0.06] dark:shadow-none dark:hover:translate-y-0">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              {title}
            </div>
            <div className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
              {value}
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 p-3 text-white shadow-sm dark:shadow-none">
            {icon}
          </div>
        </div>
      </div>
      <div className="h-1 w-full bg-gradient-to-r from-orange-500/40 to-amber-500/40 opacity-0 transition group-hover:opacity-100 dark:opacity-0" />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition",
        active
          ? "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-200"
          : "border-black/10 bg-white text-slate-800 hover:bg-orange-50/40 hover:border-orange-200 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-100 dark:hover:bg-orange-500/10 dark:hover:border-orange-500/30",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700
                     dark:bg-white/[0.06] dark:text-slate-200">
      {children}
    </span>
  );
}

function PaymentPill({ status }: { status: "unpaid" | "paid" | "refunded" }) {
  const base =
    "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold";

  if (status === "unpaid") {
    return (
      <span className={`${base} bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200`}>
        <FiClock /> پرداخت نشده
      </span>
    );
  }
  if (status === "paid") {
    return (
      <span className={`${base} bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200`}>
        <FiCheckCircle /> پرداخت شد
      </span>
    );
  }
  return (
    <span className={`${base} bg-slate-100 text-slate-700 dark:bg-white/[0.06] dark:text-slate-200`}>
      <FiArrowUpRight /> بازپرداخت
    </span>
  );
}

function ReleasePill({ status }: { status: "locked" | "released" }) {
  const base =
    "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold";

  if (status === "locked") {
    return (
      <span className={`${base} bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200`}>
        <FiLock /> قفل
      </span>
    );
  }
  return (
    <span className={`${base} bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200`}>
      <FiCheckCircle /> آزاد
    </span>
  );
}
