"use client";

import { useEffect } from "react";
import Image from "next/image";
import { FiShoppingCart, FiTrash, FiImage } from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import {
  fetchWishlist,
  removeFromWishlist,
  WishlistItem,
} from "@/store/slices/wishlistSlice";
import { addToCart } from "@/store/slices/cartSlice";
import { toast } from "react-hot-toast";

export default function WishlistPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, totalItems, loading } = useSelector(
    (state: RootState) => state.wishlist
  );

  // Fetch wishlist on mount
  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleRemove = async (itemId: number) => {
    try {
      await dispatch(removeFromWishlist(itemId)).unwrap();
      toast.success("Removed from wishlist");
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const handleAddToCart = async (item: WishlistItem) => {
    try {
      await dispatch(addToCart({ product: item.product, quantity: 1 })).unwrap();
      toast.success(`${item.product.name} added to cart`);
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  const getImageUrl = (image?: string | null) => {
    if (!image) return null;
    if (image.startsWith("http")) return image;
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "https://globenter.com";
    return `${baseURL}${image.startsWith("/") ? image : `/${image}`}`;
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-950 min-h-screen text-gray-900 dark:text-gray-100">
      <div className="w-[90%] mx-auto">
        {/* Title */}
        <h1 className="text-3xl font-bold mb-6 text-[#b16926]">My Wishlist</h1>

        {loading && <p className="text-center text-gray-500 dark:text-gray-400">Loading...</p>}

        {!loading && items.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400">Your wishlist is empty</p>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {!loading &&
            items.map((item: WishlistItem) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg rounded-2xl overflow-hidden"
              >
                {/* Image */}
                <div className="w-full h-48 relative bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  {item.product.image ? (
                    <Image
                      src={getImageUrl(item.product.image)!}
                      alt={item.product.name}
                      fill
                      className="object-contain p-4"
                      unoptimized
                      sizes="100vw"
                    />
                  ) : (
                    <div className="w-16 h-16 flex items-center justify-center">
                      <FiImage size={32} className="text-gray-400 dark:text-gray-500" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h2 className="font-semibold text-lg">{item.product.name}</h2>
                  {item.product.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.product.description}
                    </p>
                  )}
                  <p className="text-[#b16926] font-bold mt-2">
                    {item.product.price} AFN
                  </p>

                  {/* Buttons */}
                  <div className="flex gap-2 mt-4">
                    <button
                      className="flex-1 bg-[#b16926] hover:bg-[#f1a013] text-white py-2 rounded-lg transition flex items-center justify-center gap-1"
                      onClick={() => handleAddToCart(item)}
                    >
                      <FiShoppingCart size={16} /> Add to Cart
                    </button>
                    <button
                      className="bg-[#f1a013] hover:bg-[#b16926] text-white px-3 py-2 rounded-lg flex items-center justify-center"
                      onClick={() => handleRemove(item.id)}
                    >
                      <FiTrash size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
