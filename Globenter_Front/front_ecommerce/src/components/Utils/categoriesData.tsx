"use client";

import React, { useState, useRef, useEffect, Key } from "react";
import Link from "next/link";
import { slugify } from "@/components/Utils/slugify";
import { FaChevronRight } from "react-icons/fa";
import { Category } from "@/store/slices/categoriesSlice";
import { useTranslations } from "next-intl";

interface Subcategory {
  id: Key | null | undefined;
  label: string;
  href: string;
}

interface CategoryItem {
  id: Key | null | undefined;
  label: string;
  href: string;
  subcategories?: Subcategory[];
}

export const mapCategoriesData = (
  categories: Category[] | undefined
): CategoryItem[] => {
  if (!Array.isArray(categories)) return [];

  return categories.map((c) => {
    const parentSlug = c.slug || slugify(c.name);
    const subcategories =
      Array.isArray(c.children) && c.children.length > 0
        ? c.children.map((child) => ({
            label: child.name,
            href: `/categories/${child.slug || slugify(child.name)}`,
            id: child.id,
          }))
        : [];

    return {
      label: c.name,
      href: `/categories/${parentSlug}`,
      subcategories,
      id: c.id,
    };
  });
};

interface CategoriesDropdownProps {
  categories: Category[] | undefined;
  loading: boolean;
  error: string | null;
}

export const CategoriesDropdown: React.FC<CategoriesDropdownProps> = ({
  categories,
  loading,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("CategoriesDropdown");

  const mappedCategories = mapCategoriesData(categories);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef} aria-haspopup="menu">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-4 py-3 bg-[#b16926] hover:bg-[#f1a013] hover:text-black transition-colors cursor-pointer text-white font-semibold uppercase rounded-md"
        aria-expanded={isOpen}
        aria-controls="categories-dropdown"
      >
        <FaChevronRight className="mr-2" />
        {t("categories")}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          id="categories-dropdown"
          className="absolute top-full mt-2 w-[250px] md:w-[800px] bg-white rounded-lg shadow-xl flex flex-col md:flex-row z-50 overflow-hidden"
          role="menu"
        >
          {loading ? (
            <p className="p-4 text-gray-500">{t("loadingCategories")}</p>
          ) : error ? (
            <p className="p-4 text-red-500">{error}</p>
          ) : mappedCategories.length === 0 ? (
            <p className="p-4 text-gray-500">{t("noCategories")}</p>
          ) : (
            <>
              {/* Left: Category List */}
              <div className="w-full md:w-1/3 border-r border-gray-200 max-h-96 overflow-y-auto">
                {mappedCategories.map((cat, idx) => (
                  <Link
                    key={cat.id}
                    href={cat.href}
                    className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors rounded-none hover:bg-[#f1a013] hover:text-black ${
                      activeCategory === idx
                        ? "bg-[#b16926] text-white font-semibold"
                        : "text-gray-700"
                    }`}
                    onMouseEnter={() => setActiveCategory(idx)}
                    role="menuitem"
                  >
                    <span>{cat.label}</span>
                    {cat.subcategories?.length ? (
                      <FaChevronRight
                        className={`transition-transform ${
                          activeCategory === idx ? "rotate-90" : ""
                        }`}
                      />
                    ) : null}
                  </Link>
                ))}
              </div>

              {/* Right: Subcategories */}
              <div className="w-full md:w-2/3 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {mappedCategories[activeCategory]?.subcategories?.map((sub) => (
                  <Link
                    key={sub.id}
                    href={sub.href}
                    className="block p-4 rounded-lg hover:shadow-lg hover:bg-[#f1a013] transition-colors border border-gray-100"
                    role="menuitem"
                  >
                    <p className="font-medium text-gray-800 hover:text-black">
                      {sub.label}
                    </p>
                    <span className="text-sm text-[#b16926] mt-2 inline-block font-semibold">
                      ← {t("viewAll")}
                    </span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoriesDropdown;
