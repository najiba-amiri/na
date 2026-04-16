"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiHeart, FiShoppingCart, FiTrash, FiImage } from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import {
  fetchWishlist,
  removeFromWishlist,
  WishlistItem,
} from "@/store/slices/wishlistSlice";
import { addToCart } from "@/store/slices/cartSlice";
import { useTranslations } from "next-intl"; // ✅ added

export default function Wishlist() {
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const wishlistRef = useRef<HTMLDivElement>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { items, totalItems, loading } = useSelector(
    (state: RootState) => state.wishlist
  );

  const t = useTranslations("Wishlist"); // ✅ translation namespace

  const hasLoaded = useRef(false);
  useEffect(() => {
    if (!hasLoaded.current && items.length === 0) {
      hasLoaded.current = true;
      dispatch(fetchWishlist());
    }
  }, [dispatch, items.length]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wishlistRef.current &&
        !wishlistRef.current.contains(event.target as Node)
      ) {
        setIsWishlistOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRemove = (itemId: number) => {
    dispatch(removeFromWishlist(itemId));
  };

  const handleAddToCart = (product: any) => {
    dispatch(addToCart({ product, quantity: 1 }));
  };

  // Helper for fallback image
  const getImageUrl = (image?: string | null) => {
    if (!image) return null;
    if (image.startsWith("http")) return image;
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "https://globenter.com";
    return `${baseURL}${image.startsWith("/") ? image : `/${image}`}`;
  };

  return (
    <div className="relative z-1000" ref={wishlistRef}>
      {/* Wishlist Icon */}
      <div
        className="flex flex-col items-center cursor-pointer relative"
        onClick={() => setIsWishlistOpen((prev) => !prev)}
      >
        <FiHeart size={24} />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-[#f1a013] text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
            {totalItems}
          </span>
        )}
        <span className="text-sm mt-1">{t("Wishlist")}</span>
      </div>

      {/* Dropdown */}
      {isWishlistOpen && (
        <div className="absolute -left-[100%] md:right-0 mt-3 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          {/* Header */}
          <div className="bg-[#b16926] text-white px-4 py-2 rounded-t-lg flex justify-between items-center">
            <span className="font-semibold">{t("Your Wishlist")}</span>
            <span className="bg-[#f1a013] text-white text-xs px-2 py-1 rounded-full">
              {totalItems}
            </span>
          </div>

          {/* Wishlist Items */}
          {!loading && items.length === 0 && (
            <p className="p-4 text-center text-gray-500 dark:text-gray-400">{t("Your wishlist is empty")}</p>
          )}

          {!loading &&
            items.map((item: WishlistItem) => (
              <div key={item.id} className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
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
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.product.name}</p>
                  <p className="text-sm font-semibold text-[#b16926]">
                    {item.product.price} {t("AFN")}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    className="text-gray-500 hover:text-red-600"
                    onClick={() => handleRemove(item.id)}
                    title={t("Remove")}
                  >
                    <FiTrash size={18} />
                  </button>
                  <button
                    className="text-gray-500 hover:text-[#b16926]"
                    onClick={() => handleAddToCart(item.product)}
                    title={t("Add to Cart")}
                  >
                    <FiShoppingCart size={18} />
                  </button>
                </div>
              </div>
            ))}

          {/* Actions */}
          <div className="p-4">
            <Link href="/wishlist" className="block w-full">
              <button className="w-full bg-[#f1a013] text-white py-2 rounded-lg hover:bg-[#f1a013]/90">
                {t("View Wishlist")}
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
