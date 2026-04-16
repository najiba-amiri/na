"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FaHeart, FaClock, FaShoppingBag } from "react-icons/fa";
import { useTranslations } from "next-intl";

import { WishlistItem } from "@/store/slices/wishlistSlice";
import { CartItem } from "@/store/slices/cartSlice";

interface ProfileOrdersAndFavoritesProps {
  wishlistItems: WishlistItem[];
  cartItems: CartItem[];
}

const ProfileOrdersAndFavorites: React.FC<ProfileOrdersAndFavoritesProps> = ({
  wishlistItems,
  cartItems,
}) => {
  const t = useTranslations("ProfileOrdersAndFavorites");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      {/* ================== Latest Favorites ================== */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md rounded-xl p-5">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-100">
            <FaHeart className="text-pink-500" />
            {t("Your Latest Favorites")}
          </h3>
          <Link href="/wishlist">
            <button className="text-blue-500 dark:text-blue-400 hover:underline font-medium">
              {t("View All")}
            </button>
          </Link>
        </div>

        {wishlistItems && wishlistItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            {wishlistItems.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="flex flex-col items-center gap-2 bg-[#fffaf7] dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-transparent dark:border-gray-700"
              >
                {item.product.image ? (
                  <Image
                    width={80}
                    height={80}
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-20 h-20 object-contain"
                  />
                ) : (
                  <FaHeart className="text-pink-300 text-5xl" />
                )}
                <h4 className="text-sm font-medium text-gray-800 dark:text-gray-100 text-center">
                  {item.product.name}
                </h4>
                <p className="text-[#b16926] font-bold text-sm">
                  AFN {item.product.price}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-gray-500 dark:text-gray-400">
            <FaHeart className="text-pink-300 text-4xl mb-4" />
            <p>{t("You have no favorites yet")}</p>
          </div>
        )}
      </div>

      {/* ================== Recent Orders ================== */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md rounded-xl p-5">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-100">
            <FaClock className="text-[#f1a013]" />
            {t("Your Recent Orders")}
          </h3>
          <Link href="/cart">
            <button className="text-blue-500 dark:text-blue-400 hover:underline font-medium">
              {t("View All")}
            </button>
          </Link>
        </div>

        {cartItems && cartItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            {cartItems.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="flex flex-col items-center gap-2 bg-[#fffdf7] dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-transparent dark:border-gray-700"
              >
                {item.product.image ? (
                  <Image
                    width={80}
                    height={80}
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-20 h-20 object-contain"
                  />
                ) : (
                  <FaShoppingBag className="text-gray-400 dark:text-gray-500 text-5xl" />
                )}
                <h4 className="text-sm font-medium text-gray-800 dark:text-gray-100 text-center">
                  {item.product.name}
                </h4>
                <p className="text-[#b16926] font-bold text-sm">
                  AFN {item.subtotal}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10">
            <FaShoppingBag className="text-gray-400 dark:text-gray-500 text-4xl mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">{t("You have no orders yet")}</p>
            <Link href="/">
              <button className="bg-[#b16926] hover:bg-[#a05b20] text-white px-6 py-2 rounded-lg font-medium">
                {t("Start Shopping")}
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileOrdersAndFavorites;
