"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { fetchProducts } from "@/store/slices/productSlice";
import { addToCart } from "@/store/slices/cartSlice";
import Image from "next/image";
import {
  FaShoppingCart,
  FaStar,
  FaStore,
  FaPalette,
  FaRuler,
  FaTags,
  FaBoxOpen,
  FaLayerGroup,
  FaGlobe,
  FaCertificate,
  FaIndustry,
  FaMapMarkerAlt,
  FaInfoCircle,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import { AppDispatch, RootState } from "@/store/store";

export default function ProductViewPage() {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const { products, error } = useSelector(
    (state: RootState) => state.products
  );

  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState<string | null>(null);

  const product = products.find((p) => String(p.id) === String(id));

  // Fetch products if not loaded
  useEffect(() => {
    if (!products.length) {
      dispatch(fetchProducts() as any);
    } else if (product) {
      let mainImg: string | null = null;

      if (Array.isArray(product.image)) {
        mainImg = product.image[0] || null;
      } else {
        mainImg = product.image || null;
      }

      setMainImage(mainImg);
    }
  }, [dispatch, products.length, product]);

  if (error)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-950 text-red-500 dark:text-red-400 text-xl font-semibold">
        {typeof error === "string" ? error : error.message}
      </div>
    );
  if (!product)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-950 text-gray-500 dark:text-gray-400 text-xl font-medium">
        Product not found.
      </div>
    );

  const allImages = [
    ...(Array.isArray(product.image)
      ? product.image
      : product.image
      ? [product.image]
      : []),
    ...(product.images?.map((img: any) => img.image) || []),
  ].filter(Boolean);

  const handleAddToCart = async () => {
    if (!product) return;

    const productForCart = {
      ...product,
      image: mainImage || allImages[0] || "",
    };

    try {
      await dispatch(addToCart({ product: productForCart, quantity })).unwrap();
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      toast.error("Failed to add product to cart");
    }
  };

  const totalPrice = product.price * quantity;
  const custom = product.custom_fields || {};

  const details = [
    { icon: <FaTags />, label: "Category", value: product.category_name },
    { icon: <FaIndustry />, label: "Brand", value: product.brand_name },
    { icon: <FaBoxOpen />, label: "Unit", value: product.unit },
    { icon: <FaCertificate />, label: "Warranty", value: custom.warranty },
    { icon: <FaLayerGroup />, label: "Material", value: custom.material },
    { icon: <FaGlobe />, label: "Origin", value: custom.origin },
    { icon: <FaMapMarkerAlt />, label: "Gender", value: product.gender },
    {
      icon: <FaTags />,
      label: "Tags",
      value: product.tags?.length ? product.tags.join(", ") : "",
    },
    { icon: <FaBoxOpen />, label: "Min Order Qty", value: product.min_order_qty },
    { icon: <FaRuler />, label: "Care Instructions", value: custom.care_instructions },
    { icon: <FaPalette />, label: "Color Options", value: custom.color_options },
    {
      icon: <FaShoppingCart />,
      label: "Wholesale Price",
      value: product.wholesale_price ? `${product.wholesale_price} AFN` : "",
    },
  ].filter((d) => d.value && d.value !== "—");

  return (
    <div className="bg-[#fffaf3] dark:bg-gray-950 py-5 px-5 sm:px-8 lg:px-12 text-gray-900 dark:text-gray-100">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-lg border border-[#f1a013]/20 dark:border-gray-800 p-6 sm:p-10 md:p-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* LEFT: Main Image */}
          <div className="flex flex-col items-center">
            <div className="relative w-full max-w-[750px] h-[600px] bg-[#fffaf3] dark:bg-gray-800 rounded-3xl overflow-hidden shadow-inner">
              {mainImage ? (
                <Image
                  key={mainImage}
                  src={mainImage}
                  alt={product.name}
                  fill
                  className="object-contain transition-transform duration-500 ease-in-out hover:scale-105"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 italic">
                  No image available
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Product Info */}
          <div className="flex flex-col justify-start space-y-6">
            <div>
              <h1 className="text-4xl font-extrabold text-[#b16926] mb-3">
                {product.name}
              </h1>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300 mb-3">
                <FaStore className="text-[#f1a013]" />
                <span className="text-base">
                  Seller:{" "}
                  <span className="font-semibold text-[#b16926]">
                    {product.owner_name || "Unknown Seller"}
                  </span>
                </span>
              </div>

              <div className="flex text-yellow-400 mb-4 text-lg">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} />
                ))}
              </div>

              <div className="text-4xl font-bold text-[#b16926]">
                {product.price} <span className="text-base text-gray-500 dark:text-gray-400">AFN</span>
              </div>
              <div className="mt-1 text-gray-600 dark:text-gray-300 text-sm">
                Total: <span className="font-semibold text-[#b16926]">{totalPrice} AFN</span>
              </div>
            </div>

            {/* Attributes */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 text-gray-700 dark:text-gray-300 text-sm mt-4">
              <div className="flex items-center gap-2">
                <FaPalette className="text-[#f1a013]" />
                <span>
                  <strong>Color:</strong> {product.color || "—"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FaRuler className="text-[#f1a013]" />
                <span>
                  <strong>Size:</strong> {product.size || "—"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FaShoppingCart className="text-[#f1a013]" />
                <span>
                  <strong>Stock:</strong>{" "}
                  {product.stock != null ? (
                    product.stock > 0 ? (
                      <span className="text-green-600">Available</span>
                    ) : (
                      <span className="text-red-600">Out of Stock</span>
                    )
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500">N/A</span>
                  )}
                </span>
              </div>
            </div>

            {/* Quantity + Add to Cart */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pt-4 border-t border-gray-200 dark:border-gray-800 mt-2">
              <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-full overflow-hidden">
                <button
                  className="px-4 text-[#b16926] text-lg hover:bg-[#b16926]/10 dark:hover:bg-[#f1a013]/10"
                  onClick={() => setQuantity((prev) => (prev > 1 ? prev - 1 : 1))}
                >
                  -
                </button>
                <span className="px-6 font-semibold">{quantity}</span>
                <button
                  className="px-4 text-[#b16926] text-lg hover:bg-[#b16926]/10 dark:hover:bg-[#f1a013]/10"
                  onClick={() => setQuantity((prev) => prev + 1)}
                >
                  +
                </button>
              </div>

              <button
                className="w-full sm:w-auto flex items-center justify-center gap-3 bg-gradient-to-r from-[#b16926] to-[#f1a013] text-white py-3 px-10 rounded-full text-lg font-semibold transition-transform hover:scale-[1.03] shadow-md"
                onClick={handleAddToCart}
              >
                <FaShoppingCart /> Add to Cart
              </button>
            </div>

            {/* Sub-images below details */}
            {allImages.length > 1 && (
              <div className="mt-6 flex gap-3 overflow-x-auto scrollbar-hide px-2 py-2">
                {allImages.map((img, idx) => (
                  <div
                    key={idx}
                    className={`flex-shrink-0 w-24 h-24 border rounded-xl overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-200 ${
                      img === mainImage ? "ring-2 ring-[#f1a013]" : ""
                    }`}
                    onClick={() => setMainImage(img)}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${idx}`}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Description + Additional Details */}
        <div className="mt-14 border-t border-gray-200 dark:border-gray-800 pt-10">
          <h2 className="text-2xl font-bold text-[#b16926] mb-4">
            Product Description
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base sm:text-lg mb-8">
            {product.description || "No description available."}
          </p>

          {details.length > 0 && (
            <>
              <h3 className="text-xl font-semibold text-[#b16926] mb-4 flex items-center gap-2">
                <FaInfoCircle /> Additional Details
              </h3>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 text-gray-700 dark:text-gray-300 text-sm">
                {details.map((d, i) => (
                  <Detail key={i} icon={d.icon} label={d.label} value={d.value} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Detail({ icon, label, value }: any) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#fffdfb] dark:bg-gray-800 border border-[#f1a013]/20 dark:border-gray-700 hover:shadow-md transition-all">
      <div className="text-[#f1a013] mt-1 text-lg">{icon}</div>
      <div>
        <p className="text-sm font-semibold text-[#b16926]">{label}</p>
        <p className="text-gray-700 dark:text-gray-300 text-sm">{value}</p>
      </div>
    </div>
  );
}
