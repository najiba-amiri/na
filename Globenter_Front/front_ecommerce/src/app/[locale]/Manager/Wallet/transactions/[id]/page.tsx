"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import {
  fetchTransactionById,
  type TransactionItem,
} from "@/store/slices/transactionsSlice";

import {
  FiArrowLeft,
  FiArrowDownLeft,
  FiArrowUpRight,
  FiHash,
  FiCalendar,
  FiUser,
  FiTag,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiFileText,
} from "react-icons/fi";

type TxStatus = "pending" | "approved" | "rejected" | "paid";

type TxCategory =
  | "order_payment"
  | "commission"
  | "payout"
  | "refund"
  | "adjustment";

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

function StatusPill({ status }: { status: TxStatus }) {
  const base =
    "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-extrabold";

  if (status === "pending")
    return (
      <span className={`${base} bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200`}>
        <FiClock /> در انتظار
      </span>
    );
  if (status === "approved")
    return (
      <span className={`${base} bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200`}>
        <FiCheckCircle /> تأیید شد
      </span>
    );
  if (status === "rejected")
    return (
      <span className={`${base} bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200`}>
        <FiXCircle /> رد شد
      </span>
    );
  return (
    <span className={`${base} bg-slate-100 text-slate-700 dark:bg-white/[0.06] dark:text-slate-200`}>
      <FiCheckCircle /> پرداخت شد
    </span>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3
                    dark:border-white/[0.08] dark:bg-white/[0.04]">
      <div className="mt-0.5 text-slate-500 dark:text-slate-400">{icon}</div>
      <div className="min-w-0">
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {label}
        </div>
        <div className="mt-0.5 break-words text-sm font-bold text-slate-900 dark:text-slate-100">
          {value}
        </div>
      </div>
    </div>
  );
}

export default function TransactionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const txState = useSelector((s: RootState) => s.transactions);

  const idNum = useMemo(() => Number(params?.id), [params?.id]);

  // try to use cached item first
  const cached = useMemo(() => {
    if (!Number.isFinite(idNum)) return null;
    return txState.items?.find((t: any) => Number(t.id) === idNum) ?? null;
  }, [txState.items, idNum]);

  const tx: TransactionItem | null = txState.current?.id === idNum ? txState.current : cached;

  useEffect(() => {
    if (!Number.isFinite(idNum)) return;
    // always fetch to ensure it exists even on refresh
    dispatch(fetchTransactionById(idNum));
  }, [dispatch, idNum]);

  const loading = txState.currentLoading && !tx;
  const error = txState.currentError;

  return (
    <div className="min-h-screen bg-[#f7f7fb] text-slate-900 dark:bg-gray-950 dark:text-slate-100 transition-colors">
      <div className="px-6 py-10">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              کیف پول / تراکنش‌ها
            </div>
            <h1 className="mt-1 text-2xl font-extrabold">
              جزئیات تراکنش
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              اطلاعات کامل تراکنش و وضعیت آن.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md
                         dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-100 dark:hover:bg-white/[0.06] dark:shadow-none dark:hover:translate-y-0"
            >
              <FiArrowLeft />
              برگشت
            </button>

            <Link
              href="/Manager/Wallet/transactions"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 px-4 py-2 text-sm font-extrabold text-white shadow-sm transition hover:opacity-95
                         dark:shadow-none"
            >
              مشاهده لیست
            </Link>
          </div>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="mt-6 rounded-2xl border border-black/10 bg-white/75 px-4 py-3 text-sm text-slate-700 shadow-sm
                          dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300 dark:shadow-none">
            در حال بارگذاری جزئیات تراکنش...
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700
                          dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </div>
        )}

        {/* Not found */}
        {!loading && !error && !tx && (
          <div className="mt-6 rounded-2xl border border-black/10 bg-white/75 px-4 py-3 text-sm text-slate-700
                          dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300">
            تراکنش پیدا نشد یا دسترسی ندارید.
          </div>
        )}

        {/* Main content */}
        {tx && (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left: summary */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-black/10 bg-white/75 backdrop-blur shadow-sm
                              dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
                <div className="border-b border-black/10 px-6 py-5 dark:border-white/[0.08]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-extrabold">خلاصه تراکنش</h2>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        وضعیت و مبلغ تراکنش
                      </p>
                    </div>

                    <StatusPill status={tx.status as TxStatus} />
                  </div>
                </div>

                <div className="p-6">
                  <div className="rounded-3xl border border-black/10 bg-white p-5
                                  dark:border-white/[0.08] dark:bg-gray-950/40">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                        مبلغ
                      </div>
                      <div className="flex items-center gap-2">
                        {tx.type === "in" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-700
                                           dark:bg-emerald-500/10 dark:text-emerald-200">
                            <FiArrowDownLeft /> ورودی
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-extrabold text-rose-700
                                           dark:bg-rose-500/10 dark:text-rose-200">
                            <FiArrowUpRight /> خروجی
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 text-3xl font-extrabold">
                      <span
                        className={
                          tx.type === "in"
                            ? "text-emerald-700 dark:text-emerald-200"
                            : "text-rose-700 dark:text-rose-200"
                        }
                      >
                        {tx.type === "in" ? "+" : "-"}
                        {money(toNumber(tx.amount))}
                      </span>
                    </div>

                    <div className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                      {categoryLabel[tx.category as TxCategory] ?? tx.category}
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <InfoRow
                      icon={<FiHash />}
                      label="شناسه تراکنش"
                      value={`TX #${tx.id}`}
                    />

                    <InfoRow
                      icon={<FiCalendar />}
                      label="تاریخ ایجاد"
                      value={(tx.created_at || "").slice(0, 19).replace("T", " ")}
                    />

                    <InfoRow
                      icon={<FiTag />}
                      label="روش پرداخت"
                      value={tx.payment_method}
                    />

                    <InfoRow
                      icon={<FiUser />}
                      label="کاربر"
                      value={
                        tx.wallet_user?.username
                          ? `${tx.wallet_user.username} (${tx.wallet_user.email || "-"})`
                          : "-"
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: details */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-black/10 bg-white/75 backdrop-blur shadow-sm
                              dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
                <div className="border-b border-black/10 px-6 py-5 dark:border-white/[0.08]">
                  <h2 className="text-lg font-extrabold">جزئیات کامل</h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    اطلاعات دقیق‌تر مربوط به تراکنش
                  </p>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <InfoRow
                      icon={<FiTag />}
                      label="دسته‌بندی"
                      value={categoryLabel[tx.category as TxCategory] ?? tx.category}
                    />
                    <InfoRow
                      icon={<FiTag />}
                      label="نوع"
                      value={tx.type === "in" ? "ورودی" : "خروجی"}
                    />
                    <InfoRow
                      icon={<FiFileText />}
                      label="یادداشت"
                      value={tx.admin_note || "-"}
                    />
                    <InfoRow
                      icon={<FiHash />}
                      label="شناسه سفارش مرتبط"
                      value={tx.related_order != null ? String(tx.related_order) : "-"}
                    />
                    <InfoRow
                      icon={<FiHash />}
                      label="شناسه کیف پول"
                      value={tx.wallet != null ? String(tx.wallet) : "-"}
                    />
                    <InfoRow
                      icon={<FiCalendar />}
                      label="آخرین بروزرسانی"
                      value={(tx.updated_at || "").slice(0, 19).replace("T", " ")}
                    />
                  </div>

                  <div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-xs text-slate-700
                                  dark:border-orange-500/25 dark:bg-orange-500/10 dark:text-slate-200">
                    نکته: اگر این تراکنش مربوط به سفارش باشد، جزئیات سفارش از بخش سفارشات قابل مشاهده است.
                  </div>

                  {tx.related_order != null && (
                    <div className="mt-4">
                      <Link
                        href={`/Manager/orders/${tx.related_order}`}
                        className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-extrabold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md
                                   dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-100 dark:hover:bg-white/[0.06] dark:shadow-none dark:hover:translate-y-0"
                      >
                        مشاهده سفارش مرتبط
                        <FiArrowUpRight />
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* quick actions */}
              <div className="mt-6 rounded-3xl border border-black/10 bg-white/75 p-6 shadow-sm backdrop-blur
                              dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
                <h3 className="text-base font-extrabold">اقدامات سریع</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  مسیرهای مرتبط برای بررسی بیشتر
                </p>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/Manager/Wallet"
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:opacity-95
                               dark:shadow-none"
                  >
                    رفتن به کیف پول
                  </Link>

                  <Link
                    href="/Manager/Wallet/transactions"
                    className="inline-flex w-full items-center justify-center rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-extrabold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md
                               dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-100 dark:hover:bg-white/[0.06] dark:shadow-none dark:hover:translate-y-0"
                  >
                    لیست تراکنش‌ها
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
