"use client";

import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { FaStar, FaShoppingBag } from "react-icons/fa";

const AdvertisingText = () => {
  const { products, loading } = useSelector((state: RootState) => state.products);
  const [currentAd, setCurrentAd] = useState<string>("Loading offers...");
  const productsRef = useRef(products);
  productsRef.current = products;

  useEffect(() => {
    if (!loading && productsRef.current.length > 0) {
      const pickRandom = () => {
        const p = productsRef.current;
        const randomProduct = p[Math.floor(Math.random() * p.length)];
        setCurrentAd(`${randomProduct.name}: ${randomProduct.description || ""}`);
      };
      pickRandom();
      const interval = setInterval(pickRandom, 5000);
      return () => clearInterval(interval);
    }
  }, [loading, products.length]);

  return (
    <div className="flex-1 mx-8 overflow-hidden">
      <div className="relative py-1 px-4 flex items-center gap-3 overflow-hidden">
        <FaStar className="text-white animate-pulse" size={16} />
        <div className="whitespace-nowrap animate-marquee text-sm font-semibold text-white transition-opacity duration-500">
          {loading ? "Loading latest products..." : currentAd}
        </div>
        <FaShoppingBag className="text-white animate-bounce" size={16} />
      </div>
    </div>
  );
};

export default AdvertisingText;
