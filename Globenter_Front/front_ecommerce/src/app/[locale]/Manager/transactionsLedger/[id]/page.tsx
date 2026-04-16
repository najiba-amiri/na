"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { financeApi } from "@/lib/financeApi";
import { FiArrowLeft, FiInfo, FiLock, FiUser } from "react-icons/fi";

type Tx = {
  id: number;
  wallet: number;
  amount: string;
  type: "in" | "out";
  category: string;
  payment_method: string;
  status: string;
  related_order: number | null;
  created_at: string;
  updated_at: string;
  admin_note: string | null;

  // if you added serializer field:
  wallet_user?: { id: number; username: string; email: string } | null;
};

function StatusPill({ status }: { status: string }) {
  const base =
    "inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold";

  if (status === "paid")
    return (
      <span
        className={`${base} bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:border-emerald-500/20`}
      >
        paid
      </span>
    );
  if (status === "approved")
    return (
      <span
        className={`${base} bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-200 dark:border-blue-500/20`}
      >
        approved
      </span>
    );
  if (status === "pending")
    return (
      <span
        className={`${base} bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/20`}
      >
        pending
      </span>
    );
  if (status === "rejected")
    return (
      <span
        className={`${base} bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-200 dark:border-rose-500/20`}
      >
        rejected
      </span>
    );
  return (
    <span
      className={`${base} bg-slate-50 text-slate-700 border-black/10 dark:bg-white/[0.04] dark:text-slate-200 dark:border-white/[0.08]`}
    >
      {status}
    </span>
  );
}

export default function AdminTransactionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const [tx, setTx] = useState<Tx | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await financeApi.get<Tx>(`/finance/api/transactions/${id}/`);
      setTx(res.data);
    } catch (e: any) {
      setError(
        e?.response?.data?.detail ||
          e?.response?.data?.message ||
          "Failed to load transaction"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div className="min-h-screen bg-[#f7f7fb] text-slate-900 dark:bg-gray-950 dark:text-slate-100 transition-colors">
      <div className="px-6 py-10 space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md
                       dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-100 dark:hover:bg-white/[0.06] dark:hover:border-orange-500/30 dark:shadow-none"
          >
            <FiArrowLeft />
            برگشت
          </button>

          <div className="text-sm text-slate-600 dark:text-slate-400">
            {tx ? `TX #${tx.id}` : "Transaction"}
          </div>
        </div>

        {loading && (
          <div className="rounded-2xl border border-black/10 bg-white/75 px-4 py-3 text-sm text-slate-700 shadow-sm
                          dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300 dark:shadow-none">
            در حال بارگذاری جزئیات...
          </div>
        )}
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700
                          dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </div>
        )}

        {!loading && tx && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left */}
            <div className="lg:col-span-8">
              <div className="rounded-3xl border border-black/10 bg-white/75 backdrop-blur shadow-sm
                              dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
                <div className="border-b border-black/10 px-6 py-5 dark:border-white/[0.08]">
                  <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                    جزئیات تراکنش
                  </h1>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    این اطلاعات فقط برای مشاهده است.
                  </p>
                </div>

                <div className="p-6 space-y-4">
                  <Row label="شناسه" value={`TX #${tx.id}`} />
                  <Row label="مبلغ" value={tx.amount} strong />
                  <Row
                    label="نوع"
                    value={tx.type === "in" ? "ورودی" : "خروجی"}
                  />
                  <Row label="دسته‌بندی" value={tx.category} />
                  <Row label="روش پرداخت" value={tx.payment_method} />
                  <Row
                    label="وضعیت"
                    valueNode={<StatusPill status={tx.status} />}
                  />
                  <Row
                    label="Order مرتبط"
                    value={tx.related_order ? `#${tx.related_order}` : "-"}
                  />
                  <Row
                    label="تاریخ ایجاد"
                    value={tx.created_at?.slice(0, 19).replace("T", " ")}
                  />
                  <Row
                    label="آخرین آپدیت"
                    value={tx.updated_at?.slice(0, 19).replace("T", " ")}
                  />
                  <Row label="یادداشت ادمین" value={tx.admin_note || "-"} />
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="lg:col-span-4 space-y-6">
              <div className="rounded-3xl border border-black/10 bg-white/75 backdrop-blur shadow-sm
                              dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
                <div className="border-b border-black/10 px-6 py-5 flex items-center gap-2
                                dark:border-white/[0.08]">
                  <FiUser className="text-slate-600 dark:text-slate-400" />
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      کاربر
                    </h2>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      اطلاعات مالک کیف پول
                    </p>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <Row label="Wallet ID" value={String(tx.wallet)} />
                  <Row
                    label="User"
                    value={
                      tx.wallet_user
                        ? `${tx.wallet_user.username} (${tx.wallet_user.email})`
                        : "— (optional serializer field)"
                    }
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-orange-200 bg-orange-50 px-6 py-5 text-sm text-slate-700
                              dark:border-orange-500/25 dark:bg-orange-500/10 dark:text-slate-200">
                <div className="flex items-start gap-2">
                  <FiInfo className="mt-0.5" />
                  <div>
                    <div className="font-bold">نکته</div>
                    <div className="mt-1">
                      تغییر وضعیت‌ها باید از طریق عملیات مالی انجام شود
                      (Inbound/Payout/Release Funds).
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-black/10 bg-white/75 px-6 py-5 text-sm text-slate-700
                              dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300 dark:shadow-none">
                <div className="flex items-start gap-2">
                  <FiLock className="mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      Read-only
                    </div>
                    <div className="mt-1">
                      این صفحه فقط برای مشاهده است و امکان ویرایش ندارد.
                    </div>
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

function Row({
  label,
  value,
  strong,
  valueNode,
}: {
  label: string;
  value?: string;
  strong?: boolean;
  valueNode?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-black/5 pb-3
                    dark:border-white/[0.06]">
      <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
        {label}
      </div>
      <div
        className={`text-sm text-slate-900 dark:text-slate-100 text-right ${
          strong ? "font-extrabold" : ""
        }`}
      >
        {valueNode ? valueNode : value || "-"}
      </div>
    </div>
  );
}
