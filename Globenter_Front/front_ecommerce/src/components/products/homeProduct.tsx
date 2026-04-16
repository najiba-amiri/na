"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import ProductCard from "@/components/Utils/productCard";

function ProductGridSkeleton() {
  return (
    <div
      className="grid items-stretch gap-3 sm:gap-4 md:gap-5
                 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5
                 px-2 sm:px-4 md:px-6 lg:px-8 py-2 animate-pulse"
    >
      {Array.from({ length: 10 }).map((_, index) => (
        <div
          key={`product-skeleton-${index}`}
          className="h-full overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm"
        >
          <div className="aspect-[4/5] w-full bg-gray-200 dark:bg-gray-700" />
          <div className="p-4 md:p-5 space-y-3">
            <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="flex items-center justify-between">
              <div className="h-5 w-24 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-4 w-10 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="hidden md:block h-10 w-full rounded-2xl bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      ))}
    </div>
  );
}

const HomeProduct = () => {
  const { products, loading, hasFetched, error } = useSelector(
    (state: RootState) => state.products
  );
  const [loadedProductImageIds, setLoadedProductImageIds] = useState<Set<number>>(
    new Set()
  );

  const randomProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    const shuffled = [...products].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 15);
  }, [products]);

  const totalProductImages = useMemo(
    () => randomProducts.filter((product) => Boolean(product.image)).length,
    [randomProducts]
  );

  useEffect(() => {
    setLoadedProductImageIds(new Set());
  }, [randomProducts]);

  const handleProductImageLoaded = useCallback((productId: number) => {
    setLoadedProductImageIds((prev) => {
      if (prev.has(productId)) return prev;
      const next = new Set(prev);
      next.add(productId);
      return next;
    });
  }, []);

  const shouldShowSkeleton =
    (!hasFetched && randomProducts.length === 0) ||
    loading ||
    (randomProducts.length > 0 && loadedProductImageIds.size < totalProductImages);

  return (
    <div className="bg-gray-50 dark:bg-gray-950 text-gray-600 dark:text-gray-300 py-10 px-4 text-center transition-colors duration-200">
      {error && (
        <p className="text-red-600 text-center mt-10">
          {typeof error === "string"
            ? error
            : (error as any).message || JSON.stringify(error)}
        </p>
      )}
      <div className="relative">
        {shouldShowSkeleton && (
          <div className="transition-opacity duration-300">
            <ProductGridSkeleton />
          </div>
        )}

        <div
          className={`transition-opacity duration-300 ${
            shouldShowSkeleton ? "opacity-0 pointer-events-none absolute inset-0" : "opacity-100"
          }`}
        >
          <ProductCard
            products={randomProducts}
            onImageLoaded={handleProductImageLoaded}
          />
        </div>
      </div>

      {hasFetched && !loading && randomProducts.length === 0 && (
        <p className="text-center py-10 dark:text-gray-400">No products to show</p>
      )}
    </div>
  );
};

export default HomeProduct;
