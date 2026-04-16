"use client";

import MainIcon from "@/components/Utils/mainIcon";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, Product } from "@/store/slices/productSlice";
import { useEffect, useState, useRef } from "react";
import { AppDispatch, RootState } from "@/store/store";
import { FaSearch, FaUserTie } from "react-icons/fa"; // ✅ added FaUserTie

const MainNav = () => {
  const t = useTranslations("MainNav");
  const locale = useLocale();
  const isRtl = locale === "fa" || locale === "ps";
  const dispatch = useDispatch<AppDispatch>();
  const { products, loading, hasFetched } = useSelector(
    (state: RootState) => state.products
  );

  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ((!products || products.length === 0) && !loading && !hasFetched) {
      dispatch(fetchProducts() as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, products, loading, hasFetched]);

  // Filter logic
  useEffect(() => {
    if (query.trim() === "") {
      setFiltered([]);
      setShowDropdown(false);
      return;
    }
    const results = products.filter((p: Product) =>
      p.name.toLowerCase().includes(query.toLowerCase())
    );
    setFiltered(results.slice(0, 6));
    setShowDropdown(true);
  }, [query, products]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full bg-white dark:bg-gray-900 py-3 md:py-7 md:sticky top-0 z-[120] shadow-md dark:shadow-gray-950/50 transition-colors duration-200">
      <div className="grid grid-cols-1 md:grid-cols-12 items-center max-w-[96%] md:max-w-[90%] mx-auto px-2 md:px-6 gap-3 md:gap-4">
        {/* Logo */}
        <div
          className={`flex justify-center md:col-span-3 order-1 ${
            isRtl ? "md:order-3 md:justify-end" : "md:order-1 md:justify-start"
          }`}
        >
          <Image
            src="/assets/images/logo/Globenter-03.png"
            alt="Logo"
            width={100}
            height={100}
            className="w-[84px] md:w-[110px] h-auto object-contain dark:brightness-110"
          />
        </div>

        {/* Search Bar */}
        <div
          className="relative flex justify-center md:col-span-6 order-2 my-1 md:my-0"
          ref={dropdownRef}
        >
          <div className="flex items-center w-full max-w-3xl border-2 border-[#b16926] rounded-full overflow-hidden bg-white dark:bg-gray-800">
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              className={`w-full px-4 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 dark:placeholder-gray-400 focus:outline-none ${
                isRtl ? "text-right" : "text-left"
              }`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowDropdown(filtered.length > 0)}
            />
            <button className="px-4 py-2 text-[#b16926]">
              <FaSearch />
            </button>
          </div>

          {/* Search Dropdown */}
          {showDropdown && (
            <div className="absolute top-[105%] w-full max-w-3xl bg-white dark:bg-gray-800 border border-[#b16926]/20 dark:border-gray-700 shadow-xl rounded-xl overflow-hidden z-30 animate-fadeIn">
              {filtered.length > 0 ? (
                filtered.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className={`flex justify-between items-center px-4 py-2 hover:bg-[#fff5ee] dark:hover:bg-gray-700 transition-all border-b last:border-none border-gray-100 dark:border-gray-700 ${
                      isRtl ? "text-right" : "text-left"
                    }`}
                    onClick={() => {
                      setQuery("");
                      setShowDropdown(false);
                    }}
                  >
                    <div className="flex flex-col leading-tight">
                      <span className="font-semibold text-[#b16926] text-sm line-clamp-1">
                        {product.name}
                      </span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {product.price} AFN
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm font-semibold text-[#0e1f41] dark:text-gray-200">
                      <FaUserTie className="text-[#b16926]" />
                      <span>{product.owner_name || "Unknown"}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-3 text-center text-gray-500 dark:text-gray-400 text-sm">
                  No products found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Icons */}
        <div className={`md:col-span-3 ${isRtl ? "md:order-1" : "md:order-3"}`}>
          <MainIcon isRtl={isRtl} />
        </div>
      </div>
    </div>
  );
};

export default MainNav;
