"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  fetchCategories,
  findCategoryBySlug,
  collectChildSlugs,
} from "@/store/slices/categoriesSlice";
import { fetchProductsByCategory } from "@/store/slices/productSlice";
import { addToCart } from "@/store/slices/cartSlice";
import {
  addToWishlist,
  removeFromWishlist,
} from "@/store/slices/wishlistSlice";
import { FaShoppingCart, FaRegHeart, FaHeart, FaEye, FaExclamationCircle, FaArrowLeft } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: categorySlug } = React.use(params);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { categories, loading: catLoading } = useSelector(
    (state: RootState) => state.categories
  );
  const { products, loading: prodLoading, error } = useSelector(
    (state: RootState) => state.products
  );
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const { data: profile, loading: profileLoading } = useSelector(
    (state: RootState) => state.profile
  );

  const categoryName = categorySlug.replace(/-/g, " ");

  const checkAuth = () => {
    if (!profile && !profileLoading) {
      router.push("/auth/login");
      return false;
    }
    return true;
  };

  const handleAddToCart = async (product: any) => {
    if (!checkAuth()) return;
    try {
      await dispatch(addToCart({ product, quantity: 1 })).unwrap();
      toast.success(`${product.name} added to cart!`);
    } catch (err: any) {
      toast.error("Failed to add to cart. Please try again.");
    }
  };

  const handleToggleWishlist = async (product: any) => {
    if (!checkAuth()) return;
    const isInWishlist = wishlistItems.some(
      (item) => item.product.id === product.id
    );
    try {
      if (isInWishlist) {
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
    } catch (err: any) {
      toast.error("Failed to update wishlist. Try again.");
    }
  };

  const isInWishlist = (productId: number) =>
    wishlistItems.some((item) => item.product.id === productId);

  useEffect(() => {
    dispatch(fetchCategories()).then((res: any) => {
      const category = findCategoryBySlug(res.payload, categorySlug);
      if (category) {
        const slugs = [category.slug, ...collectChildSlugs(category)];
        dispatch(fetchProductsByCategory(slugs));
      }
    });
  }, [dispatch, categorySlug]);

  if (catLoading || prodLoading) {
    return <div className="text-center py-20 text-gray-500">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-20 text-red-500">{String(error)}</div>;
  }

  if (products.length === 0) {
    return (
      <div className="bg-gray-100 text-gray-600 py-20 px-4 flex flex-col items-center justify-center min-h-[60vh]">
        <FaExclamationCircle className="text-6xl text-[#b16926] mb-6" />
        <h2 className="text-3xl md:text-4xl font-bold mb-2">Oops!</h2>
        <p className="text-gray-500 mb-6 text-center">
          No products found for <span className="font-semibold">{categoryName}</span>.
        </p>
        <Link
          href="/categories"
          className="flex items-center gap-2 px-6 py-3 bg-[#b16926] text-white rounded-md hover:bg-[#9f5820] transition"
        >
          <FaArrowLeft /> Back to Categories
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 text-gray-600 py-10 px-4">
      <div className="max-w-7xl mx-auto mb-10 text-center">
        <h1 className="text-3xl md:text-5xl font-extrabold mb-3 capitalize">{categoryName}</h1>
        <p className="text-gray-500 text-lg md:text-xl">
          Browse all products in <span className="font-semibold">{categoryName}</span>
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-300 relative group"
          >
            <Link
              href={`/products/${product.id}`}
              className="relative w-full h-64 bg-gray-50 flex items-center justify-center overflow-hidden"
            >
              {product.badge && (
                <span className="absolute z-10 top-3 left-3 bg-[#f1a013] text-black text-xs font-semibold px-3 py-1 rounded-md shadow">
                  {product.badge}
                </span>
              )}
              {product.image ? (
                <Image
                  src={Array.isArray(product.image) ? product.image[0] ?? "" : product.image}
                  alt={product.name}
                  fill
                  className="object-contain p-4 transform transition-transform duration-500 ease-in-out group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <FaEye className="text-gray-400 text-5xl" />
                </div>
              )}
            </Link>

            {/* Wishlist button */}
            <button
              type="button"
              onClick={() => handleToggleWishlist(product)}
              className="absolute top-3 right-3 transition-colors"
            >
              {isInWishlist(product.id) ? (
                <FaHeart size={18} className="text-[#b16926]" />
              ) : (
                <FaRegHeart size={18} className="text-gray-400 hover:text-[#b16926]" />
              )}
            </button>

            <div className="p-5 flex flex-col flex-grow">
              <h2 className="font-semibold text-gray-800 mb-2 text-lg line-clamp-1">{product.name}</h2>
              <p className="text-[#b16926] font-bold text-xl">${product.price.toLocaleString()}</p>
            </div>

            <div className="px-5 py-4 border-t border-gray-100 flex gap-3 justify-center sm:justify-between">
              <button
                onClick={() => handleAddToCart(product)}
                className="flex items-center gap-2 bg-[#b16926] hover:bg-[#9f5820] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
              >
                <FaShoppingCart />
              </button>
              <Link href={`/products/${product.id}`}>
                <button className="flex items-center gap-2 bg-[#f1a013] hover:bg-[#d99511] text-black px-4 py-2 rounded-lg text-sm font-medium transition-all">
                  <FaEye />
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
