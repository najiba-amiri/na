"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { fetchCart } from "@/store/slices/cartSlice";
import Image from "next/image";
import {
  FiArrowRight,
  FiBox,
  FiLock,
  FiCreditCard,
  FiDollarSign,
  FiCheck,
} from "react-icons/fi";

type HesabPayItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type PayMethod = "hesabpay" | "cash_on_delivery";

const CheckoutPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const cart = useSelector((state: RootState) => state.cart);
  const cartItems = cart.items ?? [];

  const [selectedMethod, setSelectedMethod] = useState<PayMethod>("hesabpay");
  const [loadingPay, setLoadingPay] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const getImageUrl = (image?: string | null) => {
    if (!image) return null;
    // if already absolute
    if (image.startsWith("http")) return image;
    // if your backend returns relative (e.g. /images/xxx.png) then build URL
    const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
    return `${base}${image.startsWith("/") ? "" : "/"}${image}`;
  };

  const itemsForPayment: HesabPayItem[] = useMemo(() => {
    return cartItems
      .filter((ci) => ci?.product?.id && ci?.product?.name)
      .map((ci) => ({
        id: String(ci.product.id),
        name: ci.product.name,
        price: Number(ci.product.price) || 0,
        quantity: Number(ci.quantity) || 1,
      }))
      .filter((i) => i.price > 0 && i.quantity > 0);
  }, [cartItems]);

  const subtotal = useMemo(
    () => itemsForPayment.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [itemsForPayment],
  );

  const money = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "AFN",
      maximumFractionDigits: 0,
    }).format(n);

  const cartIsEmpty = itemsForPayment.length === 0;

  const handlePayWithHesabPay = async () => {
    if (cartIsEmpty) return;

    try {
      setPayError(null);
      setInfoMsg(null);
      setLoadingPay(true);

      const res = await fetch("/api/hesabpay/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: itemsForPayment }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Payment failed");
      if (!data?.payment_url) throw new Error("Payment link not available");

      window.location.href = data.payment_url;
    } catch (err: any) {
      setPayError(err?.message || "Unable to start payment");
      setLoadingPay(false);
    }
  };

  const handleCashOnDelivery = async () => {
    setInfoMsg(
      "Cash on Delivery selected. Order will be placed and paid upon delivery.",
    );
  };

  const handleContinue = () => {
    if (selectedMethod === "hesabpay") return handlePayWithHesabPay();
    return handleCashOnDelivery();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff7ed] via-white to-[#f5f7ff] dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 text-gray-900 dark:text-gray-100">
      <div className="mx-auto px-4 py-10">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-extrabold">Checkout</h1>
          <div className="flex items-center gap-2 rounded-xl bg-white/70 dark:bg-gray-900/60 px-4 py-2 border border-gray-200 dark:border-gray-700">
            <FiLock />
            <span className="text-sm font-semibold">Secure checkout</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT */}
          <div className="lg:col-span-8 space-y-6">
            {/* Payment methods */}
            <div className="rounded-3xl bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <h2 className="text-xl font-extrabold mb-4">
                Select Payment Method
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* HesabPay */}
                <div
                  onClick={() => setSelectedMethod("hesabpay")}
                  className={`relative cursor-pointer rounded-2xl border-2 p-6 h-[180px] transition
                  ${
                    selectedMethod === "hesabpay"
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-500/10"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-orange-300"
                  }`}
                >
                  {selectedMethod === "hesabpay" && (
                    <div className="absolute top-4 right-4 text-orange-600">
                      <FiCheck size={20} />
                    </div>
                  )}

                  <div className="flex h-full flex-col justify-between">
                    <div className="flex items-center gap-4">
                      <div className="rounded-xl p-2">
                        <Image
                          src="/assets/images/logo/hessabpay.jpeg"
                          alt="HesabPay"
                          width={32}
                          height={32}
                          className="rounded-lg"
                        />
                      </div>

                      <div>
                        <h3 className="text-xl font-extrabold">
                          HesabPay (Online)
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          Redirect to secure payment page
                        </p>
                      </div>
                    </div>

                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Fast • Secure • Recommended
                    </div>
                  </div>
                </div>

                {/* Cash on Delivery */}
                <div
                  onClick={() => setSelectedMethod("cash_on_delivery")}
                  className={`relative cursor-pointer rounded-2xl border-2 p-6 h-[180px] transition
                  ${
                    selectedMethod === "cash_on_delivery"
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-500/10"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-orange-300"
                  }`}
                >
                  {selectedMethod === "cash_on_delivery" && (
                    <div className="absolute top-4 right-4 text-orange-600">
                      <FiCheck size={20} />
                    </div>
                  )}

                  <div className="flex h-full flex-col justify-between">
                    <div className="flex items-center gap-4">
                        <div className="rounded-xl bg-gray-900 dark:bg-gray-800 p-4 text-white">
                        <FiDollarSign size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-extrabold">
                          Cash on Delivery
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          Pay when you receive the goods
                        </p>
                      </div>
                    </div>

                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Offline payment • Pay at delivery
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleContinue}
              disabled={loadingPay || cart.loading || cartIsEmpty}
              className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 py-4 text-white text-lg font-extrabold shadow-md disabled:opacity-60"
            >
              <span className="inline-flex items-center gap-2">
                {loadingPay
                  ? "Processing..."
                  : selectedMethod === "hesabpay"
                    ? "Pay with HesabPay"
                    : "Place Order"}
                <FiArrowRight />
              </span>
            </button>

            {payError && (
              <div className="rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-4 text-red-700 dark:text-red-300">
                {payError}
              </div>
            )}

            {infoMsg && (
              <div className="rounded-xl bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 p-4 text-orange-800 dark:text-orange-300">
                {infoMsg}
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-4">
            <OrderSummary
              items={cartItems}
              money={money}
              subtotal={subtotal}
              getImageUrl={getImageUrl}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

function OrderSummary({
  items,
  money,
  subtotal,
  getImageUrl,
}: {
  items: any[];
  money: (n: number) => string;
  subtotal: number;
  getImageUrl: (image?: string | null) => string | null;
}) {
  const safeItems = (items ?? []).filter((x) => x?.product);

  return (
    <div className="rounded-3xl bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-extrabold">Order Summary</h2>
        <span className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <FiBox />
          {safeItems.length} items
        </span>
      </div>

      <div className="space-y-3">
        {safeItems.map((ci) => {
          const img = getImageUrl(
            ci.product?.image || ci.product?.thumbnail || ci.product?.photo,
          );
          return (
            <div
              key={ci.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-3 transition hover:bg-orange-50/40 dark:hover:bg-orange-500/10"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  {img ? (
                    <Image
                      src={img}
                      alt={ci.product?.name || "Product"}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs text-gray-400 dark:text-gray-500">
                      No img
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {ci.product.name}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Qty: {ci.quantity} · Unit: {money(ci.product.price)}
                  </div>
                </div>
              </div>

              <strong className="text-gray-900 dark:text-gray-100">
                {money(ci.product.price * ci.quantity)}
              </strong>
            </div>
          );
        })}
      </div>

      <div className="my-4 h-px bg-gray-200 dark:bg-gray-700" />

      <div className="flex justify-between text-lg font-extrabold">
        <span>Total</span>
        <span className="text-orange-600">{money(subtotal)}</span>
      </div>
    </div>
  );
}

export default CheckoutPage;
