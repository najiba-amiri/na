"use client";

import Image from "next/image";
import { FaShoppingCart, FaRegHeart, FaEye } from "react-icons/fa";
import { useState } from "react";

export default function Page() {
  const products = [
    {
      id: 1,
      name: "Leather Handbag",
      priceAFN: 900.0,
      priceUSD: 13.24,
      specialTag: "Special",
      image: "/assets/images/products/shal_3.jpg",
      description: "A premium quality leather handbag for everyday use.",
    },

  ];


  return (
    <div className="bg-gray-100 text-gray-600 py-10 px-4 text-center">
      {/* Header Section */}
      <div className="max-w-[90%] mx-auto">
        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-extrabold mb-6">
                 THE CATEGOIE NAME HERE 
        </h1>

  
      </div>

      {/* Products Section */}
      <div className="mt-8 w-full px-2 sm:px-4 md:px-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300 group"
          >
            {/* Product Image */}
            <div className="relative w-full h-48 bg-gray-50 flex items-center justify-center overflow-hidden">
              {product.specialTag && (
                <span className="absolute  top-3 left-3 bg-[#f1a013] text-white text-xs px-2 py-1 rounded-md shadow">
                  {product.specialTag}
                </span>
              )}
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-contain p-4 transform transition-transform duration-500 ease-in-out group-hover:scale-110"
                sizes="100vw"
              />
              {/* Favorite Icon */}
              <button
                type="button"
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
              >
                <FaRegHeart size={18} />
              </button>
            </div>

            {/* Product Details */}
            <div className="p-4 flex flex-col flex-grow">
              <div className="grid grid-cols-2 gap-3 items-start">
                {/* Name + Description */}
                <div className="text-left">
                  <h3 className="font-medium text-gray-800 text-sm line-clamp-1">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                </div>
                {/* Prices */}
                <div className="text-right">
                  <div className="text-[#b16926] font-bold text-sm sm:text-base">
                    ${product.priceUSD.toFixed(2)}
                  </div>
                  <div className="text-gray-500 text-xs sm:text-sm">
                    {product.priceAFN.toLocaleString("fa-AF")} افغانی
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-4 py-3 border-t border-gray-100">
              <div className="flex gap-2 justify-center sm:justify-between">
                <button
                  type="button"
                  className="flex items-center gap-1 bg-[#b16926] hover:bg-[#a35e21] text-white px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                >
                  <FaShoppingCart size={14} /> Add
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1 bg-[#f1a013] hover:bg-[#d99511] text-white px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                >
                  <FaEye size={14} /> View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
