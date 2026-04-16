"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { fetchMyWallet } from "@/store/slices/walletSlice";
import { fetchMyTransactions } from "@/store/slices/transactionsSlice";
import {
  FiArrowUpRight,
  FiArrowDownLeft,
  FiLock,
  FiCreditCard,
  FiFilter,
} from "react-icons/fi";

type TxCategory =
  | "order_payment"
  | "commission"
  | "payout"
  | "refund"
  | "adjustment";
type TxStatus = "pending" | "approved" | "rejected" | "paid";

const categoryLabel: Record<TxCategory, string> = {
  order_payment: "پرداخت سفارش",
  commission: "کمیسیون",
  payout: "برداشت",
  refund: "بازپرداخت",
  adjustment: "تنظیمات سیستمی",
};

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

export default function WalletPage() {
  const dispatch = useDispatch<AppDispatch>();

  const walletState = useSelector((s: RootState) => s.wallet);
  const txState = useSelector((s: RootState) => s.transactions);

  const wallet = walletState.wallet;

  const totalBalance = toNumber(wallet?.balance_total);
  const lockedBalance = toNumber(wallet?.balance_escrow);
  const availableBalance =
    wallet?.balance_available != null
      ? toNumber(wallet.balance_available)
      : Math.max(0, totalBalance - lockedBalance);

  const canWithdraw = availableBalance > 0;

  useEffect(() => {
    dispatch(fetchMyWallet());
    dispatch(fetchMyTransactions());
  }, [dispatch]);

  // show 5 recent (newest first)
  const recent = useMemo(() => {
    const items = [...(txState.items ?? [])];
    items.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return items.slice(0, 5);
  }, [txState.items]);

  const loading = walletState.loading || txState.loading;
  const error = walletState.error || txState.error;

  return (
    <div className="min-h-screen bg-[#f7f7fb] text-slate-900 dark:bg-gray-950 dark:text-slate-100 transition-colors">
      <div className="px-6 py-10">
        {/* Top status */}
        {loading && (
          <div className="rounded-2xl border border-black/10 bg-white/75 px-4 py-3 text-sm text-slate-700 shadow-sm
                          dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300 dark:shadow-none">
            در حال بارگذاری اطلاعات کیف پول...
          </div>
        )}
        {error && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700
                          dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </div>
        )}

        {/* Balance cards */}
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <BalanceCard
            title="موجودی کل"
            value={money(totalBalance)}
            icon={<FiCreditCard />}
            accent="from-orange-500 to-amber-500"
            hint="تمام پول موجود در کیف پول"
          />
          <BalanceCard
            title="موجودی قفل‌شده / امانت"
            value={money(lockedBalance)}
            icon={<FiLock />}
            accent="from-orange-500/80 to-amber-500/80"
            hint="پول در انتظار آزادسازی"
          />
          <BalanceCard
            title="موجودی قابل برداشت"
            value={money(availableBalance)}
            icon={<FiArrowUpRight />}
            accent="from-orange-600 to-amber-600"
            hint="پولی که اکنون قابل برداشت است"
          />
        </div>

        {/* Actions + Recent */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left column */}
          <div className="lg:col-span-8">
            <div className="rounded-3xl border border-black/10 bg-white/75 backdrop-blur shadow-sm
                            dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
              <div className="flex items-center justify-between gap-3 border-b border-black/10 px-6 py-5
                              dark:border-white/[0.08]">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    تراکنش‌های اخیر
                  </h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    آخرین فعالیت‌ها در کیف پول شما.
                  </p>
                </div>

                <Link
                  href="/Manager/Wallet/transactions"
                  className="group inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md
                             dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-100 dark:hover:bg-white/[0.06] dark:hover:border-orange-500/30 dark:shadow-none"
                >
                  <FiFilter className="text-slate-500 transition group-hover:text-orange-600 dark:text-slate-400 dark:group-hover:text-orange-300" />
                  مشاهده همه
                </Link>
              </div>

              <div className="p-3 sm:p-4">
                <div className="overflow-hidden rounded-2xl border border-black/10 bg-white
                                dark:border-white/[0.08] dark:bg-gray-950/40">
                  <div className="grid grid-cols-12 gap-2 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500
                                  dark:bg-white/[0.03] dark:text-slate-400">
                    <div className="col-span-4">دسته‌بندی</div>
                    <div className="col-span-2 text-right">مبلغ</div>
                    <div className="col-span-2">نوع</div>
                    <div className="col-span-2">وضعیت</div>
                    <div className="col-span-2">تاریخ</div>
                  </div>

                  {recent.length === 0 && !loading ? (
                    <div className="px-4 py-6 text-sm text-slate-600 dark:text-slate-400">
                      هنوز تراکنشی ثبت نشده است.
                    </div>
                  ) : (
                    recent.map((tx) => {
                      const direction = tx.type; // "in" | "out"
                      const amountN = toNumber(tx.amount);
                      const createdAt = tx.created_at?.slice(0, 10) ?? "-";
                      const note =
                        tx.related_order != null
                          ? `سفارش #${tx.related_order}`
                          : tx.admin_note || `TX #${tx.id}`;

                      return (
                        <Link
                          key={tx.id}
                          href={`#`}
                          className="group grid grid-cols-12 gap-2 border-t border-black/5 px-4 py-3 text-sm transition hover:bg-orange-50/40
                                     dark:border-white/[0.06] dark:hover:bg-orange-500/10"
                        >
                          <div className="col-span-4">
                            <div className="font-semibold text-slate-900 transition group-hover:text-orange-700 dark:text-slate-100 dark:group-hover:text-orange-300">
                              {categoryLabel[tx.category as TxCategory] ??
                                tx.category}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {note}
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

                          <div className="col-span-2 flex items-center gap-2 text-slate-700 dark:text-slate-300">
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

                          <div className="col-span-2">
                            <StatusPill status={tx.status as TxStatus} />
                          </div>

                          <div className="col-span-2 text-sm text-slate-600 dark:text-slate-400">
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

          {/* Right column */}
          <div className="lg:col-span-4">
            <div className="rounded-3xl border border-black/10 bg-white/75 backdrop-blur shadow-sm
                            dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
              <div className="border-b border-black/10 px-6 py-5 dark:border-white/[0.08]">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  امکانات
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  برداشت از موجودی قابل برداشت.
                </p>
              </div>

              <div className="space-y-4 p-6">
                <div className="rounded-2xl border border-black/10 bg-white px-4 py-4
                                dark:border-white/[0.08] dark:bg-white/[0.04]">
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    موجودی قابل برداشت
                  </div>
                  <div className="mt-1 text-2xl font-extrabold bg-gradient-to-r from-orange-700 to-amber-700 bg-clip-text text-transparent">
                    {money(availableBalance)}
                  </div>
                  <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    اگر موجودی قابل برداشت بیشتر از ۰ باشد، می‌توانید درخواست برداشت
                    ثبت کنید.
                  </div>
                </div>

                <Link
                  href="/Manager/payouts"
                  aria-disabled={!canWithdraw}
                  className={[
                    "group inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-bold shadow-sm transition",
                    canWithdraw
                      ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white hover:opacity-95 hover:-translate-y-0.5 dark:shadow-none dark:hover:translate-y-0"
                      : "cursor-not-allowed bg-slate-200 text-slate-500 dark:bg-white/[0.06] dark:text-slate-500",
                  ].join(" ")}
                  onClick={(e) => {
                    if (!canWithdraw) e.preventDefault();
                  }}
                >
                  درخواست برداشت
                  <FiArrowUpRight className="transition group-hover:translate-x-0.5" />
                </Link>

                <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-xs text-slate-700
                                dark:border-orange-500/25 dark:bg-orange-500/10 dark:text-slate-200">
                  پول قفل‌شده بعد از تحویل سفارش و ختم شدن مهلت شکایت آزاد می‌شود.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Small note if wallet not created yet */}
        {!loading && !error && !wallet && (
          <div className="mt-6 rounded-2xl border border-black/10 bg-white/75 px-4 py-3 text-sm text-slate-700
                          dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300">
            کیف پول شما هنوز ساخته نشده یا در دسترس نیست.
          </div>
        )}
      </div>
    </div>
  );
}

function BalanceCard({
  title,
  value,
  icon,
  accent,
  hint,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
  hint: string;
}) {
  return (
    <div className="group rounded-3xl border border-black/10 bg-white/75 backdrop-blur shadow-sm transition hover:-translate-y-1 hover:shadow-md
                    dark:border-white/[0.08] dark:bg-white/[0.04] dark:hover:bg-white/[0.06] dark:shadow-none dark:hover:translate-y-0">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {title}
            </div>
            <div className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
              {value}
            </div>
            <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {hint}
            </div>
          </div>

          <div
            className={`rounded-2xl bg-gradient-to-r ${accent} p-3 text-white shadow-sm dark:shadow-none`}
          >
            {icon}
          </div>
        </div>
      </div>
      <div className="h-1 w-full bg-gradient-to-r from-orange-500/40 to-amber-500/40 opacity-0 transition group-hover:opacity-100 dark:opacity-0" />
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
