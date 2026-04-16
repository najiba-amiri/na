"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { fetchMyWallet } from "@/store/slices/walletSlice";
import {
  createPayoutRequest,
  fetchMyPayoutRequests,
  type PayoutRequest as ApiPayoutRequest,
} from "@/store/slices/payoutSlice";
import {
  FiArrowUpRight,
  FiCreditCard,
  FiSend,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiClock,
} from "react-icons/fi";

type PayoutStatus = "pending" | "approved" | "rejected" | "paid";
type PayoutMethod = "bank" | "internal";

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

const methodLabel: Record<PayoutMethod, string> = {
  bank: "بانکی",
  internal: "انتقال داخلی (والت)",
};

// Optional: mask a bank/account number for display
const maskAccount = (s: string) => {
  const x = (s || "").trim();
  if (x.length <= 6) return x;
  return `${x.slice(0, 4)}•••••${x.slice(-3)}`;
};

export default function PayoutRequestPage() {
  const dispatch = useDispatch<AppDispatch>();

  const walletState = useSelector((s: RootState) => s.wallet);
  const payoutState = useSelector((s: RootState) => s.payout);

  const wallet = walletState.wallet;
  const availableBalance = toNumber(wallet?.balance_available);

  // Form state
  const [amount, setAmount] = useState<string>("100");
  const [method, setMethod] = useState<PayoutMethod>("bank");
  const [accountNumber, setAccountNumber] = useState<string>("");

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchMyWallet());
    dispatch(fetchMyPayoutRequests());
  }, [dispatch]);

  const requests = useMemo(() => {
    const items = [...(payoutState.items ?? [])];
    items.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return items;
  }, [payoutState.items]);

  const canSubmit = () => {
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) return false;
    if (amt > availableBalance) return false;
    if (method === "bank" && accountNumber.trim().length < 6) return false;
    return true;
  };

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const amt = Number(amount);

    if (!Number.isFinite(amt) || amt <= 0) {
      setFormError("لطفاً مبلغ درست وارد کنید.");
      return;
    }
    if (amt > availableBalance) {
      setFormError("مبلغ بیشتر از موجودی قابل برداشت است.");
      return;
    }
    if (method === "bank" && accountNumber.trim().length < 6) {
      setFormError("لطفاً شماره حساب/کارت را درست وارد کنید.");
      return;
    }

    // Need wallet id to create payout request
    if (!wallet?.id) {
      setFormError("کیف پول شما در دسترس نیست. دوباره تلاش کنید.");
      return;
    }

    try {
      await dispatch(
        createPayoutRequest({
          wallet: wallet.id,
          amount: amt,
          payment_method: method,
          bank_account: method === "bank" ? accountNumber.trim() : null,
        })
      ).unwrap();

      setFormSuccess("درخواست برداشت موفقانه ثبت شد.");
      setAmount("100");
      setAccountNumber("");
    } catch (err: any) {
      setFormError(
        typeof err === "string" ? err : "ثبت درخواست برداشت ناموفق بود."
      );
    }
  };

  const loading = walletState.loading || payoutState.loading;
  const error = walletState.error || payoutState.error;

  return (
    <div className="min-h-screen bg-[#f7f7fb] text-slate-900 dark:bg-gray-950 dark:text-slate-100 transition-colors">
      <div className="px-6 py-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
              درخواست برداشت
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              درخواست خود را ثبت کنید و وضعیت آن را دنبال نمایید.
            </p>
          </div>

          <div className="hidden rounded-3xl border border-black/10 bg-white/75 px-5 py-4 shadow-sm sm:block
                          dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              موجودی قابل برداشت
            </div>
            <div className="mt-1 text-2xl font-extrabold bg-gradient-to-r from-orange-700 to-amber-700 bg-clip-text text-transparent">
              {money(availableBalance)}
            </div>
          </div>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="mt-6 rounded-2xl border border-black/10 bg-white/75 px-4 py-3 text-sm text-slate-700 shadow-sm
                          dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300 dark:shadow-none">
            در حال بارگذاری اطلاعات...
          </div>
        )}
        {error && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700
                          dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Form */}
          <div className="lg:col-span-5">
            <div className="overflow-hidden rounded-3xl border border-black/10 bg-white/75 shadow-sm
                            dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
              <div className="border-b border-black/10 px-6 py-5 dark:border-white/[0.08]">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  فورم درخواست
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  معلومات را دقیق وارد کنید تا روند سریع‌تر انجام شود.
                </p>
              </div>

              <form onSubmit={submitRequest} className="space-y-4 p-6">
                {/* Amount */}
                <div>
                  <Label>مبلغ</Label>
                  <div className="mt-2 flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-3 transition focus-within:border-orange-200
                                  dark:border-white/[0.08] dark:bg-white/[0.04] dark:focus-within:border-orange-500/30">
                    <FiArrowUpRight className="text-slate-400 dark:text-slate-400" />
                    <input
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="مثلاً 100"
                      inputMode="numeric"
                      className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400
                                 dark:text-slate-100 dark:placeholder:text-slate-500"
                    />
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      AFN
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    حداکثر:{" "}
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {money(availableBalance)}
                    </span>
                  </div>
                </div>

                {/* Method */}
                <div>
                  <Label>روش برداشت</Label>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setMethod("bank")}
                      className={[
                        "rounded-2xl border px-4 py-3 text-sm font-semibold transition hover:-translate-y-0.5",
                        "dark:hover:translate-y-0",
                        method === "bank"
                          ? "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-200"
                          : "border-black/10 bg-white text-slate-800 hover:bg-orange-50/40 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-100 dark:hover:bg-orange-500/10 dark:hover:border-orange-500/30",
                      ].join(" ")}
                    >
                      <span className="inline-flex items-center gap-2">
                        <FiCreditCard />
                        بانکی
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMethod("internal")}
                      className={[
                        "rounded-2xl border px-4 py-3 text-sm font-semibold transition hover:-translate-y-0.5",
                        "dark:hover:translate-y-0",
                        method === "internal"
                          ? "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-200"
                          : "border-black/10 bg-white text-slate-800 hover:bg-orange-50/40 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-100 dark:hover:bg-orange-500/10 dark:hover:border-orange-500/30",
                      ].join(" ")}
                    >
                      <span className="inline-flex items-center gap-2">
                        <FiSend />
                        انتقال داخلی
                      </span>
                    </button>
                  </div>
                </div>

                {/* Account/Card */}
                {method === "bank" ? (
                  <div>
                    <Label>شماره کارت / حساب</Label>
                    <div className="mt-2 flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-3 transition focus-within:border-orange-200
                                    dark:border-white/[0.08] dark:bg-white/[0.04] dark:focus-within:border-orange-500/30">
                      <FiCreditCard className="text-slate-400 dark:text-slate-400" />
                      <input
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="مثلاً 0792xxxxxxx یا شماره حساب"
                        className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400
                                   dark:text-slate-100 dark:placeholder:text-slate-500"
                      />
                    </div>
                    <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      لطفاً معلومات را دقیق وارد کنید.
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-xs text-slate-700
                                  dark:border-orange-500/25 dark:bg-orange-500/10 dark:text-slate-200">
                    برای انتقال داخلی، پول به کیف پول داخلی شما انتقال می‌شود.
                  </div>
                )}

                {/* Alerts */}
                {formError && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700
                                  dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
                    <span className="inline-flex items-center gap-2">
                      <FiAlertCircle />
                      {formError}
                    </span>
                  </div>
                )}
                {formSuccess && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700
                                  dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                    <span className="inline-flex items-center gap-2">
                      <FiCheckCircle />
                      {formSuccess}
                    </span>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!canSubmit() || payoutState.creating}
                  className={[
                    "w-full rounded-2xl px-5 py-4 text-sm font-bold shadow-sm transition",
                    "dark:shadow-none",
                    canSubmit() && !payoutState.creating
                      ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white hover:opacity-95 hover:-translate-y-0.5 dark:hover:translate-y-0"
                      : "cursor-not-allowed bg-slate-200 text-slate-500 dark:bg-white/[0.06] dark:text-slate-500",
                  ].join(" ")}
                >
                  {payoutState.creating ? "در حال ثبت..." : "ثبت درخواست برداشت"}
                </button>

                <div className="text-xs text-slate-500 dark:text-slate-400">
                  بعد از تأیید مالی، وضعیت تغییر می‌کند. بعد از پرداخت کامل، درخواست
                  غیرقابل تغییر می‌شود.
                </div>
              </form>
            </div>
          </div>

          {/* Requests list */}
          <div className="lg:col-span-7">
            <div className="overflow-hidden rounded-3xl border border-black/10 bg-white/75 shadow-sm
                            dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
              <div className="flex items-center justify-between border-b border-black/10 px-6 py-5
                              dark:border-white/[0.08]">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    درخواست‌های شما
                  </h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    لیست درخواست‌ها و وضعیت آن‌ها.
                  </p>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  تعداد:{" "}
                  <span className="font-bold text-slate-900 dark:text-white">
                    {requests.length}
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-950/40">
                {/* header */}
                <div className="grid grid-cols-12 gap-2 bg-slate-50 px-6 py-3 text-xs font-semibold text-slate-500
                                dark:bg-white/[0.03] dark:text-slate-400">
                  <div className="col-span-3">شناسه</div>
                  <div className="col-span-2 text-right">مبلغ</div>
                  <div className="col-span-3">روش</div>
                  <div className="col-span-2">وضعیت</div>
                  <div className="col-span-2">تاریخ</div>
                </div>

                {!loading && requests.length === 0 ? (
                  <div className="px-6 py-10 text-center text-slate-600 dark:text-slate-400">
                    هنوز درخواست برداشتی ثبت نشده است.
                  </div>
                ) : (
                  requests.map((r: ApiPayoutRequest) => {
                    const createdAt = r.created_at?.slice(0, 10) ?? "-";
                    const methodVal = r.payment_method as PayoutMethod;
                    const acct =
                      methodVal === "bank"
                        ? maskAccount(r.bank_account || "")
                        : "Wallet Transfer";

                    return (
                      <div
                        key={r.id}
                        className="grid grid-cols-12 gap-2 border-t border-black/5 px-6 py-4 transition hover:bg-orange-50/40
                                   dark:border-white/[0.06] dark:hover:bg-orange-500/10"
                      >
                        <div className="col-span-3">
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            #{r.id}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {r.receipt_file ? "رسید آپلود شده" : "—"}
                          </div>
                        </div>

                        <div className="col-span-2 text-right font-bold text-slate-900 dark:text-white">
                          {money(toNumber(r.amount))}
                        </div>

                        <div className="col-span-3">
                          <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {methodLabel[methodVal] ?? r.payment_method}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {acct}
                          </div>
                        </div>

                        <div className="col-span-2">
                          <PayoutStatusPill status={r.status as PayoutStatus} />
                        </div>

                        <div className="col-span-2 text-sm text-slate-600 dark:text-slate-400">
                          {createdAt}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="mt-4 rounded-3xl border border-orange-200 bg-orange-50 px-6 py-4 text-sm text-slate-700
                            dark:border-orange-500/25 dark:bg-orange-500/10 dark:text-slate-200">
              <div className="mb-1 font-bold">یادآوری</div>
              <div className="text-sm">
                وضعیت‌ها: <b>در انتظار</b> → <b>تأیید شد</b> / <b>رد شد</b> →{" "}
                <b>پرداخت شد</b>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
      {children}
    </div>
  );
}

function PayoutStatusPill({ status }: { status: PayoutStatus }) {
  const base =
    "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold";

  if (status === "pending")
    return (
      <span className={`${base} bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200`}>
        <FiClock />
        در انتظار
      </span>
    );

  if (status === "approved")
    return (
      <span className={`${base} bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200`}>
        <FiCheckCircle />
        تأیید شد
      </span>
    );

  if (status === "rejected")
    return (
      <span className={`${base} bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200`}>
        <FiXCircle />
        رد شد
      </span>
    );

  return (
    <span className={`${base} bg-slate-100 text-slate-700 dark:bg-white/[0.06] dark:text-slate-200`}>
      <FiCheckCircle />
      پرداخت شد
    </span>
  );
}
