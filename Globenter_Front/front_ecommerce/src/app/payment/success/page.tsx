"use client";

import { FiCheckCircle, FiClock } from "react-icons/fi";
import Link from "next/link";

export default function Success() {
  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-[#fff7ed] via-white to-[#f5f7ff] flex items-center justify-center px-4">
      {/* soft background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="absolute -bottom-28 -right-28 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl" />
      </div>

      {/* Card */}
      <div className="relative max-w-md w-full rounded-3xl border border-white/60 bg-white/80 backdrop-blur shadow-xl p-8 text-center">
        {/* Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
          <FiCheckCircle size={36} />
        </div>

        {/* Title */}
        <h1 className="mt-6 text-2xl sm:text-3xl font-extrabold text-gray-900">
          Payment Successful 🎉
        </h1>

        {/* Message */}
        <p className="mt-3 text-gray-700 leading-relaxed">
          Thank you! We’ve received your payment successfully.
        </p>

        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
          <FiClock />
          <span>Your payment is now being verified.</span>
        </div>

        {/* Info box */}
        <div className="mt-6 rounded-2xl border border-white/60 bg-white/70 p-4 text-sm text-gray-700">
          This usually takes only a short time.  
          Once verified, your order will be processed automatically.
        </div>

        {/* Actions */}
        <div className="mt-8 space-y-3">
          <Link href="/">
            <button className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 py-3 font-bold text-white shadow-md hover:opacity-95 transition">
              Continue Shopping
            </button>
          </Link>

          <Link href="/orders">
            <button className="w-full rounded-2xl border border-orange-300 text-orange-600 py-3 font-semibold hover:bg-orange-50 transition">
              View My Orders
            </button>
          </Link>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-xs text-gray-500">
          If you have any questions, please contact our support team.
        </p>
      </div>
    </div>
  );
}
