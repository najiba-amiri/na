"use client";

import React, { useEffect } from "react";
import Badge from "../ui/badge/Badge";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";

import { fetchUsers } from "@/store/slices/userSlice";
import { fetchProducts } from "@/store/slices/productSlice";
import { fetchSellerStats } from "@/store/slices/sellerSlice"; // adjust if your path differs

import { HiUsers } from "react-icons/hi2";
import { FiBox } from "react-icons/fi";
import { AiOutlineArrowUp, AiOutlineArrowDown } from "react-icons/ai";
import { HiOutlineCubeTransparent } from "react-icons/hi2";

const tone = {
  blue: "from-sky-500/15 to-blue-600/10 group-hover:border-sky-200 dark:group-hover:border-sky-800/60",
  amber:
    "from-amber-500/15 to-orange-600/10 group-hover:border-amber-200 dark:group-hover:border-amber-800/60",
  violet:
    "from-violet-500/15 to-fuchsia-600/10 group-hover:border-violet-200 dark:group-hover:border-violet-800/60",
  emerald:
    "from-emerald-500/15 to-teal-600/10 group-hover:border-emerald-200 dark:group-hover:border-emerald-800/60",
};

function Card({
  title,
  value,
  icon,
  badge,
  loading,
  subtitle,
  glow,
}: {
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  badge?: React.ReactNode;
  loading?: boolean;
  subtitle?: string;
  glow: string;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 md:p-6
      shadow-sm hover:shadow-xl transition-all duration-300 dark:border-gray-800 dark:bg-white/[0.03] ${glow}`}
    >
      <div
        className={`pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full blur-3xl
        bg-gradient-to-br ${glow.split(" ")[0]} ${glow.split(" ")[1]} opacity-60 group-hover:opacity-90 transition-opacity duration-300`}
      />

      <div
        className={`relative flex items-center justify-center w-12 h-12 rounded-xl
        bg-gradient-to-br ${glow.split(" ")[0]} ${glow.split(" ")[1]}
        ring-1 ring-gray-200/60 dark:ring-gray-800/70`}
      >
        {icon}
      </div>

      <div className="mt-5 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {title}
          </span>

          <h4 className="mt-2 font-extrabold tracking-tight text-gray-900 dark:text-white/90 text-2xl">
            {loading ? (
              <span className="inline-block h-7 w-20 animate-pulse rounded-md bg-gray-200/70 dark:bg-gray-800/70" />
            ) : (
              value
            )}
          </h4>

          {subtitle ? (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          ) : null}
        </div>

        {badge ? <div className="shrink-0">{badge}</div> : null}
      </div>
    </div>
  );
}

export const EcommerceMetrics: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { users, loading: usersLoading } = useSelector(
    (state: RootState) => state.users
  );

  const { products, loading: productsLoading } = useSelector(
    (state: RootState) => state.products
  );

  // ✅ IMPORTANT FIX: your store key is Seller (capital S)
  const sellerState = useSelector((state: RootState) => state.Seller);
  const stats = sellerState?.stats ?? null;
  const sellerLoading = sellerState?.loading ?? false;
  const sellerError = sellerState?.error ?? null;

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchProducts());
    dispatch(fetchSellerStats());
  }, [dispatch]);

  const myProductsCount = stats?.product_count ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      <Card
        title="مشتریان"
        value={users.length}
        loading={usersLoading}
        icon={<HiUsers className="text-gray-900 dark:text-white/90 text-xl" />}
        badge={
          <Badge color="success">
            <AiOutlineArrowUp className="text-green-500" />
            11.01%
          </Badge>
        }
        subtitle="مجموع کاربران ثبت‌نام‌شده"
        glow={tone.blue}
      />

      <Card
        title="سفارش‌ها"
        value={0}
        icon={<FiBox className="text-gray-900 dark:text-white/90 text-xl" />}
        badge={
          <Badge color="error">
            <AiOutlineArrowDown className="text-red-500" />
            0%
          </Badge>
        }
        subtitle="به‌زودی"
        glow={tone.amber}
      />

      <Card
        title="محصولات"
        value={products.length}
        loading={productsLoading}
        icon={
          <HiOutlineCubeTransparent className="text-gray-900 dark:text-white/90 text-xl" />
        }
        badge={
          <Badge color="success">
            <AiOutlineArrowUp className="text-green-500" />
            {products.length > 0 ? "100%" : "0%"}
          </Badge>
        }
        subtitle="همه محصولات فروشگاه"
        glow={tone.violet}
      />

      <Card
        title="محصولات من"
        value={myProductsCount}
        loading={sellerLoading}
        icon={<FiBox className="text-gray-900 dark:text-white/90 text-xl" />}
        badge={
          sellerError ? (
            <Badge color="error">
              <AiOutlineArrowDown className="text-red-500" />
              خطا
            </Badge>
          ) : (
            <Badge color="success">
              <AiOutlineArrowUp className="text-green-500" />
              فعال
            </Badge>
          )
        }
        subtitle={sellerError ? String(sellerError) : "محصولات متعلق به شما"}
        glow={tone.emerald}
      />
    </div>
  );
};
