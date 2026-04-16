"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { fetchSellerStats } from "@/store/slices/sellerSlice";
import Image from "next/image";
import { FaBoxOpen } from "react-icons/fa";

const SellerProductsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stats, loading, error } = useSelector((state: RootState) => state.Seller);

  useEffect(() => {
    dispatch(fetchSellerStats());
  }, [dispatch]);

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-dashed pb-4">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          <FaBoxOpen className="text-[#f1a013]" /> Your Products
        </h2>
        {stats && (
          <p className="text-gray-600 text-sm mt-2 md:mt-0">
            Total Products:{" "}
            <span className="text-[#b16926] font-semibold">
              {stats.product_count}
            </span>
          </p>
        )}
      </div>

      {/* Loading / Error / Empty */}
      {loading && <p className="text-gray-500 text-center mt-10">Loading products...</p>}
      {error && <p className="text-red-500 text-center mt-10">{error}</p>}
      {!loading && stats && stats.products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <FaBoxOpen className="text-gray-400 text-5xl mb-3" />
          <p className="text-gray-500 text-lg">No products added yet.</p>
        </div>
      )}

      {/* Product Grid */}
      {!loading && stats && stats.products.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-6">
          {stats.products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300 group relative"
            >
              {/* Product Image */}
              <div className="relative w-full h-44 bg-gray-50 flex items-center justify-center overflow-hidden">
                {product.badge && (
                  <span className="absolute top-3 left-3 bg-[#f1a013] text-white text-xs px-2 py-1 rounded-md shadow">
                    {product.badge}
                  </span>
                )}
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain p-4 transform transition-transform duration-500 ease-in-out group-hover:scale-110"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-400 text-sm">
                    No Image
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4 flex flex-col flex-grow">
                <h4 className="font-medium text-gray-800 text-sm line-clamp-1">
                  {product.name}
                </h4>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {product.description}
                </p>

                <div className="mt-3 flex justify-between items-center">
                  <p className="text-[#b16926] font-semibold text-sm">
                    ${Number(product.price).toFixed(2)}
                  </p>
                  <p className="text-gray-500 text-xs">Stock: {product.stock}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerProductsPage;
