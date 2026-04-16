"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchProducts } from "@/store/slices/productSlice";
import {
  FaStar,
  FaTag,
  FaBox,
  FaPalette,
  FaRuler,
  FaHeart,
  FaUser,
} from "react-icons/fa";
import Image from "next/image";

const ViewProductPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const { products, error } = useSelector(
    (state: RootState) => state.products
  );
  const [mainImage, setMainImage] = useState<string | null>(null);

  const product = products.find((p) => p.id === Number(id));
useEffect(() => {
  if (!products.length) {
    dispatch(fetchProducts());
  } else if (product) {
    let mainImg: string | null = null;

    if (Array.isArray(product.image)) {
      // if image is an array, take the first element
      mainImg = product.image[0] || null;
    } else {
      mainImg = product.image || null;
    }

    setMainImage(mainImg);
  }
}, [dispatch, products.length, product]);


  if (error)
    return (
      <p className="text-center mt-10 text-red-500">{JSON.stringify(error)}</p>
    );
  if (!product) return <p className="text-center mt-10">Product not found</p>;

  // Combine main image with sub-images for thumbnails
  const allImages = [
    product.image,
    ...(product.images?.map((img: any) => img.image) || []),
  ];

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
            {product.name}
          </h1>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <FaUser className="text-black text-lg" />
            <span className="text-xl"> : {product.owner_name || "N/A"}</span>
          </div>
        </div>
        <span className="text-3xl font-semibold text-green-600">
          {product.price}AFN
        </span>
      </div>

      {/* Images */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Main Image */}
        <div className="flex-1 border rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow duration-200">
          <div className="relative w-full h-[400px] md:h-[500px]">
            {mainImage && (
              <Image
                src={mainImage}
                alt={product.name}
                fill
                className="object-cover w-full h-full"
              />
            )}
          </div>

          {/* Thumbnails */}
          <div className="flex gap-3 mt-4 overflow-x-auto scrollbar-hide px-2 py-2">
            {allImages.map((imgUrl, idx) => (
              <div
                key={idx}
                className={`flex-shrink-0 w-24 h-24 border rounded-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-200 ${
                  imgUrl === mainImage ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => setMainImage(imgUrl)}
              >
                <Image
                  src={imgUrl}
                  alt={`Thumbnail ${idx}`}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-1 bg-white dark:bg-gray-900 shadow-md rounded-lg p-6 space-y-6">
          {/* Description */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
              Description
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mt-2">
              {product.description}
            </p>
          </div>

          {/* Attributes */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <FaBox className="text-blue-500" />
              <span className="font-medium text-gray-600 dark:text-gray-300">
                Category:
              </span>{" "}
              {product.category_name}
            </div>
            <div className="flex items-center gap-2">
              <FaHeart className="text-pink-500" />
              <span className="font-medium text-gray-600 dark:text-gray-300">
                Brand:
              </span>{" "}
              {product.brand_name}
            </div>
            <div className="flex items-center gap-2">
              <FaBox className="text-green-500" />
              <span className="font-medium text-gray-600 dark:text-gray-300">
                Stock:
              </span>{" "}
              {product.stock}
            </div>
            <div className="flex items-center gap-2">
              <FaRuler className="text-yellow-500" />
              <span className="font-medium text-gray-600 dark:text-gray-300">
                Size:
              </span>{" "}
              {product.size || "-"}
            </div>
            <div className="flex items-center gap-2">
              <FaPalette className="text-purple-500" />
              <span className="font-medium text-gray-600 dark:text-gray-300">
                Color:
              </span>{" "}
              {product.color || "-"}
            </div>
            <div className="flex items-center gap-2">
              <FaStar className="text-orange-400" />
              <span className="font-medium text-gray-600 dark:text-gray-300">
                Status:
              </span>
              <span
                className={
                  product.status === "active"
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {product.status}
              </span>
            </div>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {product.tags.map((tag: string, idx) => (
                  <span
                    key={idx}
                    className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm px-2 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition"
                  >
                    <FaTag size={12} /> {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Custom Fields */}
          {product.custom_fields &&
            Object.keys(product.custom_fields).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                  Custom Fields
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(product.custom_fields).map(
                    ([key, value], idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-white dark:bg-gray-900 
                     border-l-4 border-gray-300 rounded-md shadow-sm px-4 py-3 
                     transition hover:shadow-md"
                      >
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                          {key.replace(/_/g, " ")}
                        </span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[60%] text-right">
                          {value as string}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ViewProductPage;
