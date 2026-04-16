"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { fetchMyOrders } from "@/store/slices/orderSlice";
import {
  FiArrowLeft,
  FiHash,
  FiCalendar,
  FiCreditCard,
  FiLock,
  FiCheckCircle,
  FiAlertCircle,
  FiShield,
  FiTag,
  FiArrowUpRight,
  FiUser,
} from "react-icons/fi";

type PaymentStatus = "unpaid" | "paid" | "refunded";
type ReleaseStatus = "locked" | "released";

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

const getBuyerName = (buyer: any) =>
  buyer?.username || buyer?.email || buyer?.name || "—";

// Try common image fields; adjust if your user serializer uses a different key
const getBuyerImageUrl = (buyer: any) => {
  return (
    buyer?.photo ||
    buyer?.image ||
    buyer?.avatar ||
    buyer?.profile_image ||
    buyer?.profileImage ||
    buyer?.profile?.image ||
    buyer?.profile?.photo ||
    ""
  );
};

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, error } = useSelector((s: RootState) => s.orders);

  useEffect(() => {
    if (!items || items.length === 0) dispatch(fetchMyOrders());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]); // avoid re-fetch loops

  const order = useMemo(() => {
    return (items ?? []).find((o) => String(o.id) === String(id)) ?? null;
  }, [items, id]);

  const createdAt = order?.created_at?.slice(0, 10) ?? "-";
  const payStatus = (order?.payment_status ?? "unpaid") as PaymentStatus;
  const releaseStatus = (order?.fund_release_status ?? "locked") as ReleaseStatus;

  const total = toNumber(order?.total_amount);
  const paid = toNumber(order?.paid_amount);
  const commission = toNumber(order?.commission);
  const sellerShare = toNumber(order?.seller_share);

  // ✅ profile image URL (Django media)
  const profileImageUrl = getBuyerImageUrl(order?.buyer);

  return (
    <div className="min-h-screen bg-[#f7f7fb] text-slate-900 dark:bg-gray-950 dark:text-slate-100 transition-colors">
      <div className="px-6 py-10">
        {/* Top bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              href="/wallet/orders"
              className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md
                         dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-100 dark:hover:bg-white/[0.06] dark:hover:border-orange-500/30 dark:shadow-none"
            >
              <FiArrowLeft />
              برگشت به سفارش‌ها
            </Link>

            <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
              جزئیات سفارش
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              این صفحه فقط برای مشاهده است و امکان ویرایش وجود ندارد.
            </p>

            {loading && (
              <div className="mt-4 rounded-2xl border border-black/10 bg-white/75 px-4 py-3 text-sm text-slate-700 shadow-sm
                              dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300 dark:shadow-none">
                در حال بارگذاری...
              </div>
            )}
            {error && (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700
                              dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
                {error}
              </div>
            )}
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

        {/* Not found */}
        {!loading && !order && (
          <div className="mt-6 rounded-3xl border border-black/10 bg-white/75 p-8 shadow-sm
                          dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              سفارش پیدا نشد
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              این شناسه در سیستم موجود نیست یا شما به آن دسترسی ندارید.
            </p>
          </div>
        )}

        {order && (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Main */}
            <div className="lg:col-span-8 space-y-6">
              {/* Header card */}
              <div className="overflow-hidden rounded-3xl border border-black/10 bg-white/75 shadow-sm
                              dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
                <div className="border-b border-black/10 px-6 py-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between
                                dark:border-white/[0.08]">
                  <div>
                    <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      شماره سفارش
                    </div>
                    <div className="mt-1 flex items-center gap-3">
                      <div className="text-lg font-extrabold text-slate-900 dark:text-white">
                        {order.order_number}
                      </div>
                      <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-slate-700
                                       dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-200">
                        <FiHash />
                        ID: {order.id}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <PaymentPill status={payStatus} />
                    <ReleasePill status={releaseStatus} />
                  </div>
                </div>

                {/* Buyer + meta */}
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Info icon={<FiCalendar />} label="تاریخ ایجاد" value={createdAt} />
                  <Info icon={<FiTag />} label="وضعیت پرداخت" value={paymentLabel(payStatus)} />
                  <Info icon={<FiLock />} label="وضعیت امانت" value={releaseLabel(releaseStatus)} />

                  {/* ✅ Buyer card with image */}
                  <div className="rounded-2xl border border-black/10 bg-white px-4 py-4 transition hover:border-orange-200 hover:shadow-sm
                                  dark:border-white/[0.08] dark:bg-white/[0.04] dark:hover:bg-white/[0.06] dark:hover:border-orange-500/30 dark:shadow-none">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                      <span className="text-slate-400 dark:text-slate-500">
                        <FiUser />
                      </span>
                      خریدار
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-2xl border border-black/10 bg-slate-50
                                      dark:border-white/[0.08] dark:bg-white/[0.03]">
                        {profileImageUrl ? (
                          <Image
                            src={profileImageUrl}
                            alt="Profile"
                            width={96}
                            height={96}
                            unoptimized
                            priority
                            style={{
                              width: "48px",
                              height: "48px",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center text-slate-400 dark:text-slate-500">
                            <FiUser />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold text-slate-900 dark:text-white">
                          {getBuyerName(order.buyer)}
                        </div>
                        <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                          {order.buyer?.email ?? "—"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amounts card */}
              <div className="overflow-hidden rounded-3xl border border-black/10 bg-white/75 shadow-sm
                              dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
                <div className="border-b border-black/10 px-6 py-5 dark:border-white/[0.08]">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    جزئیات مالی
                  </h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    مبلغ کل، پرداخت شده، کمیسیون و سهم فروشنده
                  </p>
                </div>

                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AmountCard
                    title="مبلغ کل سفارش"
                    value={money(total)}
                    hint="Total Amount"
                    accent="from-orange-600 to-amber-600"
                    icon={<FiCreditCard />}
                  />
                  <AmountCard
                    title="مبلغ پرداخت شده"
                    value={money(paid)}
                    hint="Paid Amount"
                    accent="from-emerald-600 to-emerald-500"
                    icon={<FiCheckCircle />}
                  />
                  <AmountCard
                    title="کمیسیون پلتفرم"
                    value={money(commission)}
                    hint="Commission"
                    accent="from-slate-700 to-slate-600"
                    icon={<FiTag />}
                  />
                  <AmountCard
                    title="سهم فروشنده"
                    value={money(sellerShare)}
                    hint="Seller Share"
                    accent="from-indigo-600 to-indigo-500"
                    icon={<FiArrowUpRight />}
                  />
                </div>

                <div className="px-6 pb-6">
                  <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-xs text-slate-700
                                  dark:border-orange-500/25 dark:bg-orange-500/10 dark:text-slate-200">
                    پول <b>قفل‌شده</b> بعد از تحویل سفارش و ختم شدن مهلت شکایت،{" "}
                    <b>آزاد</b> می‌شود.
                  </div>
                </div>
              </div>
            </div>

            {/* Side */}
            <div className="lg:col-span-4 space-y-6">
              {/* Summary */}
              <div className="rounded-3xl border border-black/10 bg-white/75 shadow-sm overflow-hidden
                              dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
                <div className="border-b border-black/10 px-6 py-5 dark:border-white/[0.08]">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    خلاصه سریع
                  </h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    برای اسکرین‌شات یا ارسال به پشتیبانی
                  </p>
                </div>
                <div className="p-6 grid grid-cols-1 gap-3">
                  <SummaryRow label="Order" value={order.order_number} />
                  <SummaryRow label="Order ID" value={String(order.id)} />
                  <SummaryRow label="Total" value={money(total)} />
                  <SummaryRow label="Paid" value={money(paid)} />
                  <SummaryRow label="Payment Status" value={paymentLabel(payStatus)} />
                  <SummaryRow label="Escrow" value={releaseLabel(releaseStatus)} />
                  <SummaryRow label="Date" value={createdAt} />
                </div>
              </div>

              {/* Help */}
              <div className="rounded-3xl border border-black/10 bg-white/75 shadow-sm
                              dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
                <div className="border-b border-black/10 px-6 py-5 dark:border-white/[0.08]">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    راهنما
                  </h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    وضعیت‌ها و معنی آن‌ها
                  </p>
                </div>

                <div className="p-6 space-y-3">
                  <Hint title="پرداخت نشده" text="سفارش ایجاد شده اما پرداخت انجام نشده است." />
                  <Hint title="پرداخت شد" text="پرداخت ثبت شده و سفارش فعال است." />
                  <Hint title="بازپرداخت" text="پرداخت برگشت داده شده است." />
                  <Hint title="قفل‌شده" text="پول در امانت است و بعد از شرایط آزاد می‌شود." />
                  <Hint title="آزاد شد" text="پول آزاد شده و قابل برداشت/تسویه است." />

                  <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-xs text-slate-700
                                  dark:border-orange-500/25 dark:bg-orange-500/10 dark:text-slate-200">
                    این صفحه فقط نمایش است. اگر مشکل دارید، با پشتیبانی تماس
                    بگیرید.
                  </div>
                </div>
              </div>

              {/* Support */}
              <div className="rounded-3xl border border-black/10 bg-white/75 shadow-sm
                              dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
                <div className="border-b border-black/10 px-6 py-5 dark:border-white/[0.08]">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    پشتیبانی
                  </h2>
                </div>
                <div className="p-6 space-y-3">
                  <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-slate-700
                                  dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-200">
                    اگر مشکلی دارید، شناسه سفارش و تاریخ را برای پشتیبانی ارسال
                    کنید.
                  </div>
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800
                                  dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                    <span className="inline-flex items-center gap-2">
                      <FiAlertCircle />
                      توصیه: از بخش «خلاصه سریع» اسکرین‌شات بگیرید.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white px-4 py-4 transition hover:border-orange-200 hover:shadow-sm
                    dark:border-white/[0.08] dark:bg-white/[0.04] dark:hover:bg-white/[0.06] dark:hover:border-orange-500/30 dark:shadow-none">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
        <span className="text-slate-400 dark:text-slate-500">{icon}</span>
        {label}
      </div>
      <div className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
        {value}
      </div>
    </div>
  );
}

function AmountCard({
  title,
  value,
  hint,
  accent,
  icon,
}: {
  title: string;
  value: string;
  hint: string;
  accent: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="group rounded-3xl border border-black/10 bg-white/75 backdrop-blur shadow-sm transition hover:-translate-y-1 hover:shadow-md
                    dark:border-white/[0.08] dark:bg-white/[0.04] dark:hover:bg-white/[0.06] dark:shadow-none dark:hover:translate-y-0">
      <div className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              {title}
            </div>
            <div className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
              {value}
            </div>
            <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {hint}
            </div>
          </div>

          <div className={`rounded-2xl bg-gradient-to-r ${accent} p-3 text-white shadow-sm dark:shadow-none`}>
            {icon}
          </div>
        </div>
      </div>
      <div className="h-1 w-full bg-gradient-to-r from-orange-500/40 to-amber-500/40 opacity-0 transition group-hover:opacity-100 dark:opacity-0" />
    </div>
  );
}

function PaymentPill({ status }: { status: PaymentStatus }) {
  const base =
    "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold";
  if (status === "unpaid") {
    return (
      <span className={`${base} bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200`}>
        <FiAlertCircle /> پرداخت نشده
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

function ReleasePill({ status }: { status: ReleaseStatus }) {
  const base =
    "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold";
  if (status === "locked") {
    return (
      <span className={`${base} bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200`}>
        <FiLock /> قفل‌شده
      </span>
    );
  }
  return (
    <span className={`${base} bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200`}>
      <FiCheckCircle /> آزاد شد
    </span>
  );
}

function paymentLabel(status: PaymentStatus) {
  if (status === "unpaid") return "پرداخت نشده";
  if (status === "paid") return "پرداخت شد";
  return "بازپرداخت";
}

function releaseLabel(status: ReleaseStatus) {
  if (status === "locked") return "قفل‌شده";
  return "آزاد شد";
}

function Hint({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 transition hover:border-orange-200 hover:shadow-sm
                    dark:border-white/[0.08] dark:bg-white/[0.04] dark:hover:bg-white/[0.06] dark:hover:border-orange-500/30 dark:shadow-none">
      <div className="text-sm font-bold text-slate-900 dark:text-white">
        {title}
      </div>
      <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
        {text}
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white px-4 py-3
                    dark:border-white/[0.08] dark:bg-white/[0.04]">
      <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
        {value}
      </div>
    </div>
  );
}
