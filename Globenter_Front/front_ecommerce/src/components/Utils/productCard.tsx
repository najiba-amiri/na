"use client";

import { memo, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { addToCart } from "@/store/slices/cartSlice";
import {
  addToWishlist,
  removeFromWishlist,
} from "@/store/slices/wishlistSlice";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaShoppingCart, FaRegHeart, FaHeart, FaEye } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { getClientLocale, resolveLocalizedField } from "@/lib/productI18n";

interface Product {
  id: number;
  name: string;
  description?: string;
  name_i18n?: Record<string, string>;
  description_i18n?: Record<string, string>;
  price: number;
  priceAFN?: number;
  badge?: string;
  image?: string;
}

interface ProductCardProps {
  products: Product[];
  onImageLoaded?: (productId: number) => void;
}

function ProductCard({ products, onImageLoaded }: ProductCardProps) {
  const locale = getClientLocale();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const { data: profile, loading: profileLoading } = useSelector(
    (state: RootState) => state.profile
  );

  const wishlistIds = useMemo(
    () => new Set(wishlistItems.map((item) => item.product.id)),
    [wishlistItems]
  );

  const checkAuth = useCallback(() => {
    if (!profile && !profileLoading) {
      router.push("/auth/login");
      return false;
    }
    return true;
  }, [profile, profileLoading, router]);

  const handleAddToCart = useCallback(async (product: Product) => {
    if (!checkAuth()) return;
    try {
      await dispatch(addToCart({ product, quantity: 1 })).unwrap();
      toast.success(`${product.name} added to cart!`);
    } catch {
      toast.error("Failed to add to cart. Please try again.");
    }
  }, [checkAuth, dispatch]);

  const handleToggleWishlist = useCallback(async (product: Product) => {
    if (!checkAuth()) return;
    const inWishlist = wishlistItems.some(
      (item) => item.product.id === product.id
    );
    try {
      if (inWishlist) {
        const wishlistItem = wishlistItems.find(
          (item) => item.product.id === product.id
        );
        if (wishlistItem) {
          await dispatch(removeFromWishlist(wishlistItem.id)).unwrap();
          toast.success(`${product.name} removed from wishlist`);
        }
      } else {
        await dispatch(addToWishlist(product)).unwrap();
        toast.success(`${product.name} added to wishlist`);
      }
    } catch {
      toast.error("Failed to update wishlist. Try again.");
    }
  }, [checkAuth, dispatch, wishlistItems]);

  const isInWishlist = useCallback(
    (productId: number) => wishlistIds.has(productId),
    [wishlistIds]
  );
  return (
    <div className="w-full">
      <div
        className="grid items-stretch gap-3 sm:gap-4 md:gap-5
                 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5
                 px-2 sm:px-4 md:px-6 lg:px-8 py-2"
      >
        {products?.map((product) => {
          const displayName = resolveLocalizedField(
            product.name,
            product.name_i18n,
            locale
          );
          const displayDescription = resolveLocalizedField(
            product.description,
            product.description_i18n,
            locale
          );

          return (
            <div
            key={product.id}
            className="group relative h-full overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm
                     hover:shadow-xl dark:hover:shadow-gray-950/40 hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
            >
            {/* Image wrapper */}
            <Link
              href={`/products/${product.id}`}
              className="relative block aspect-[4/5] w-full overflow-hidden bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-800"
            >
              {product.badge && (
                <span className="absolute z-10 top-3 left-3 rounded-full bg-[#f1a013] px-3 py-1 text-[11px] font-extrabold text-white shadow">
                  {product.badge}
                </span>
              )}

              {product.image ? (
                <Image
                  src={product.image}
                  alt={displayName || "Product image"}
                  fill
                  priority={false}
                  className="object-contain p-5 transition-transform duration-500 ease-out group-hover:scale-[1.07]"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                  onLoadingComplete={() => onImageLoaded?.(product.id)}
                  onError={() => onImageLoaded?.(product.id)}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <FaEye className="text-gray-300 dark:text-gray-600" size={22} />
                </div>
              )}

              <div
                className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                         bg-[radial-gradient(ellipse_at_top,rgba(177,105,38,0.12),transparent_55%)]"
              />
            </Link>

            {/* Floating actions */}
            <div className="absolute right-3 top-3 z-[2] flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleToggleWishlist(product)}
                className="h-10 w-10 rounded-full bg-white/90 dark:bg-gray-700/90 backdrop-blur border border-gray-200 dark:border-gray-600 shadow-sm
                         grid place-items-center hover:scale-105 active:scale-95 transition"
                aria-label="Wishlist"
              >
                {isInWishlist(product.id) ? (
                  <FaHeart size={18} className="text-[#b16926]" />
                ) : (
                  <FaRegHeart
                    size={18}
                    className="text-gray-500 hover:text-[#b16926]"
                  />
                )}
              </button>

              <Link
                href={`/products/${product.id}`}
                className="h-10 w-10 rounded-full bg-white/90 dark:bg-gray-700/90 backdrop-blur border border-gray-200 dark:border-gray-600 shadow-sm
                         grid place-items-center hover:scale-105 active:scale-95 transition"
                aria-label="View"
              >
                <FaEye size={16} className="text-gray-600 dark:text-gray-300" />
              </Link>
            </div>

            {/* Details */}
            <div className="p-4 md:p-5 flex flex-col flex-1">
              <div className="flex items-start justify-between gap-3">
                {/* Left: name */}
                <div className="min-w-0">
                  <Link
                    href={`/products/${product.id}`}
                    className="
                       block font-extrabold text-gray-900 dark:text-gray-100
                       text-[13px] md:text-[15px]
                       leading-snug line-clamp-2 hover:underline
                     "
                  >
                    {displayName}
                  </Link>

                  {/* Description → hidden on small screens */}
                  <p className="hidden md:block mt-1.5 text-sm text-gray-500 dark:text-gray-400 leading-snug">
                    {displayDescription
                      ? `${displayDescription.slice(0, 22)}...`
                      : ""}
                  </p>
                </div>

                {/* Right: price */}
                <div className="shrink-0">
                  <div className="flex items-baseline gap-1">
                    <span
                      className="
            text-[#b16926] font-extrabold whitespace-nowrap
            text-base md:text-lg
          "
                    >
                      {Number(product.priceAFN || product.price).toLocaleString(
                        "fa-AF"
                      )}
                    </span>
                    <span
                      className="
            text-gray-900 dark:text-gray-200 font-extrabold
            text-xs md:text-sm
          "
                    >
                      AFG
                    </span>
                  </div>
                </div>
              </div>

              {/* Button — hidden on small screens */}
              <button
                onClick={() => handleAddToCart(product)}
                className="
    hidden md:inline-flex
    mt-2 w-full items-center justify-center gap-2
    rounded-2xl bg-[#b16926] text-white
    py-2.5 text-sm font-extrabold
    hover:bg-[#a35e21] active:scale-[0.99] transition
  "
              >
                <FaShoppingCart size={16} />
                افزودن به سبد
              </button>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(ProductCard);
