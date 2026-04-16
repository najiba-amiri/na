"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiShoppingCart, FiTrash, FiImage } from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { fetchCart, removeCartItem } from "@/store/slices/cartSlice";
import { useTranslations } from "next-intl"; // ✅ added
import { addToCart } from "@/store/slices/cartSlice";

export default function CartNotif() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { items = [], totalItems = 0, totalPrice = 0 } = useSelector(
    (state: RootState) => state.cart
  );

  const t = useTranslations("CartNotif"); // ✅ translations namespace

  const hasLoaded = useRef(false);
  useEffect(() => {
    if (!hasLoaded.current && items.length === 0) {
      hasLoaded.current = true;
      dispatch(fetchCart());
    }
  }, [dispatch, items.length]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setIsCartOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getImageUrl = (image?: string | null) => {
    if (!image) return null;
    if (image.startsWith("http")) return image;
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "https://globenter.com";
    return `${baseURL}${image.startsWith("/") ? image : `/${image}`}`;
  };

  const handleRemove = async (itemId: number) => {
    try {
      await dispatch(removeCartItem(itemId)).unwrap();
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  return (
    <div className="relative z-1000" ref={cartRef}>
      {/* Cart Icon */}
      <div
        className="flex flex-col items-center cursor-pointer relative"
        onClick={() => setIsCartOpen((prev) => !prev)}
      >
        <FiShoppingCart size={24} />
        {totalItems > 0 && (
          <span className="absolute -top-3 -right-3 bg-[#f1a013] text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
            {totalItems}
          </span>
        )}
        <span className="text-sm mt-1">{t("Cart")}</span>
      </div>

      {/* Dropdown */}
      {isCartOpen && (
        <div className="absolute -left-[100%] md:right-0 mt-3 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          {/* Header */}
          <div className="bg-[#b16926] text-white px-4 py-2 rounded-t-lg flex justify-between items-center">
            <span className="font-semibold">{t("Your Cart")}</span>
            <span className="bg-[#f1a013] text-white text-xs px-2 py-1 rounded-full">
              {totalItems}
            </span>
          </div>

          {/* Items */}
          <div className="max-h-72 overflow-y-auto">
            {items.length === 0 ? (
              <p className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                {t("Your cart is empty")}
              </p>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  {/* Product Image */}
                  <div className="w-12 h-12 relative flex-shrink-0 rounded overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    {item.product.image ? (
                      <Image
                        src={getImageUrl(item.product.image)!}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <FiImage size={24} className="text-gray-400" />
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                      {item.product.name}
                    </p>
                    <p className="text-sm font-semibold text-[#b16926] mt-1">
                      {Number(item.product.price).toLocaleString()} {t("AFN")}
                    </p>
                  </div>

                  {/* Quantity & Delete */}
                  <div className="flex flex-col items-center justify-between ml-3">
                    <span className="text-sm font-medium dark:text-gray-200">{item.quantity}</span>
                    <button
                      className="text-gray-500 hover:text-red-600 mt-1"
                      onClick={() => handleRemove(item.id)}
                    >
                      <FiTrash size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Total */}
          {items.length > 0 && (
            <div className="flex justify-between px-4 py-2 font-semibold text-[#b16926] border-t dark:border-gray-700">
              <span>{t("Total")}</span>
              <span>
                {(totalPrice || 0).toLocaleString()} {t("AFN")}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="p-4 space-y-2">
            <Link href="/cart" className="block w-full">
              <button className="w-full bg-[#f1a013] text-white py-2 rounded-lg hover:bg-[#f1a013]/90">
                {t("View Cart")}
              </button>
            </Link>
            <Link href="/checkout" className="block w-full">
              <button className="w-full border border-[#b16926] text-[#b16926] dark:text-[#e39b4a] py-2 rounded-lg hover:bg-[#b16926]/10">
                {t("Check Out")}
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
