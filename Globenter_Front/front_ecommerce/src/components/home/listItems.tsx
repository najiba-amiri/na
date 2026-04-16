"use client";

import { useEffect } from "react";
import { FaHeadphones } from "react-icons/fa";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { fetchCategories } from "@/store/slices/categoriesSlice";
import { CategoriesDropdown } from "@/components/Utils/categoriesData";

const ListItems = () => {
  const t = useTranslations("ListItems");
  const dispatch = useDispatch();

  // Get categories from Redux
  const { categories: categoriesFromStore, loading, hasFetched, error } = useSelector(
    (state: RootState) => state.categories
  );

  useEffect(() => {
    if (!categoriesFromStore.length && !loading && !hasFetched) {
      dispatch(fetchCategories() as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, categoriesFromStore.length, loading, hasFetched]);

  const navLinks = [
    { href: "/", label: t("Home") },
    { href: "/products", label: t("Products") },
    { href: "/aboutUs", label: t("About Us") },
    { href: "/blog", label: t("Blog") },
    { href: "/support", label: t("Support"), icon: <FaHeadphones className="inline-block ml-1" /> },
  ];

  return (
    <nav className="hidden md:block bg_color sticky top-0 z-30 py-1">
      <div className="container mx-auto flex justify-between items-center px-4 relative">
        {/* Categories Dropdown */}
        <CategoriesDropdown
          categories={categoriesFromStore}
          loading={loading}
          error={error}
        />

        {/* Desktop Navigation */}
        <ul className="hidden md:flex flex-1 justify-center space-x-10 text-white font-medium">
          {navLinks.map((link, idx) => (
            <li key={idx}>
              <Link href={link.href} className="relative group flex items-center gap-1">
                {link.label} {link.icon && link.icon}
                <span className="absolute left-0 -bottom-1 w-0  bg-[#d39d5b] transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default ListItems;
