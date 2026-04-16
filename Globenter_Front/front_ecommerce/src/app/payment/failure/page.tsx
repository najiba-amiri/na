"use client";

import { FiXCircle, FiRefreshCcw, FiHelpCircle } from "react-icons/fi";
import Link from "next/link";

export default function Failure() {
  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-[#fff1f2] via-white to-[#fdf2f8] flex items-center justify-center px-4">
      {/* soft background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-red-200/40 blur-3xl" />
        <div className="absolute -bottom-28 -right-28 h-80 w-80 rounded-full bg-rose-200/40 blur-3xl" />
      </div>

      {/* Card */}
      <div className="relative max-w-md w-full rounded-3xl border border-white/60 bg-white/80 backdrop-blur shadow-xl p-8 text-center">
        {/* Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
          <FiXCircle size={36} />
        </div>

        {/* Title */}
        <h1 className="mt-6 text-2xl sm:text-3xl font-extrabold text-gray-900">
          Payment Failed
        </h1>

        {/* Message */}
        <p className="mt-3 text-gray-700 leading-relaxed">
          Unfortunately, your payment was not completed.
        </p>

        <div className="mt-4 text-sm text-gray-600">
          This can happen due to a network issue or payment interruption.
        </div>

        {/* Info box */}
        <div className="mt-6 rounded-2xl border border-white/60 bg-white/70 p-4 text-sm text-gray-700">
          No money has been deducted from your account.  
          Please try again or choose a different payment method.
        </div>

        {/* Actions */}
        <div className="mt-8 space-y-3">
          <Link href="/checkout">
            <button className="w-full rounded-2xl bg-gradient-to-r from-red-500 to-rose-500 py-3 font-bold text-white shadow-md hover:opacity-95 transition inline-flex items-center justify-center gap-2">
              <FiRefreshCcw />
              Try Payment Again
            </button>
          </Link>

          <Link href="/">
            <button className="w-full rounded-2xl border border-red-300 text-red-600 py-3 font-semibold hover:bg-red-50 transition">
              Return to Home
            </button>
          </Link>

          <Link href="/support">
            <button className="w-full text-sm text-gray-500 hover:text-gray-700 inline-flex items-center justify-center gap-1 mt-2">
              <FiHelpCircle />
              Contact Support
            </button>
          </Link>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-xs text-gray-500">
          If the problem persists, our support team is here to help.
        </p>
      </div>
    </div>
  );
}
