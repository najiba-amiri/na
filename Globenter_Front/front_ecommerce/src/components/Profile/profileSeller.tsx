"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaBoxOpen, FaMoneyCheckAlt, FaShoppingBag } from "react-icons/fa";
import { FcSalesPerformance } from "react-icons/fc";

import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { fetchSellerStats } from "@/store/slices/sellerSlice";

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  stock: number;
  image?: string | null;
}

const ProfileSeller: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stats, loading, error } = useSelector((state: RootState) => state.Seller);

  useEffect(() => {
    dispatch(fetchSellerStats());
  }, [dispatch]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 ">
      {/* ================== YOUR PRODUCTS ================== */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md rounded-xl p-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-dashed border-gray-200 dark:border-gray-700 pb-3">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-100">
            <FaBoxOpen className="text-[#f1a013]" />
            Your Products
          </h3>
          <Link href="/seller/products">
            <button className="text-blue-500 dark:text-blue-400 hover:underline font-medium">
              View All
            </button>
          </Link>
        </div>

        {/* Product count */}
        {stats && stats.products.length > 0 && (
          <div className="mt-3 mb-4 text-sm text-gray-600 dark:text-gray-400 font-medium">
            Total Products:{" "}
            <span>
              {stats.products.length}
            </span>
          </div>
        )}

        {/* Loading / Error / Products List */}
        {loading ? (
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading products...</p>
        ) : error ? (
          <p className="mt-4 text-red-500">{error}</p>
        ) : stats && stats.products.length > 0 ? (
          <div className="flex flex-col gap-3 max-h-[360px] overflow-y-auto pr-2 mt-2">
            {stats.products.map((item: Product) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 bg-[#fffdf7] dark:bg-gray-800 p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-transparent dark:border-gray-700"
              >
                <div className="flex items-center gap-4">
                  {item.image ? (
                    <Image
                      width={70}
                      height={70}
                      src={item.image}
                      alt={item.name}
                      className="w-[70px] h-[70px] object-contain rounded-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                    />
                  ) : (
                    <FaShoppingBag className="text-gray-400 dark:text-gray-500 text-5xl" />
                  )}
                  <div>
                    <h4 className="text-base font-medium text-gray-800 dark:text-gray-100">{item.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Stock: {item.stock}</p>
                  </div>
                </div>

                <p className="text-[#b16926] font-bold text-sm whitespace-nowrap">
                  AFN {item.price}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10">
            <FaBoxOpen className="text-gray-400 dark:text-gray-500 text-4xl mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              You haven’t added any products yet.
            </p>
          </div>
        )}
      </div>

      {/* ================== SALES ================== */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md rounded-xl p-5">
        <div className="flex items-center justify-between border-b border-dashed border-gray-200 dark:border-gray-700 pb-3">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-100">
            <FcSalesPerformance />
            Sales
          </h3>
          <Link href="/seller/sales">
            <button className="text-blue-500 dark:text-blue-400 hover:underline font-medium">
              View All
            </button>
          </Link>
        </div>

        {/* Placeholder: Replace with real sales data */}
        <div className="flex flex-col items-center justify-center py-10 text-gray-500 dark:text-gray-400">
          <FaMoneyCheckAlt className="text-green-300 text-4xl mb-4" />
          <p>You have no sales yet.</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileSeller;
