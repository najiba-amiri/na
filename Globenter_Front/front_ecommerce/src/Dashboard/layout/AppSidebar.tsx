"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useSidebar } from "../context/SidebarContext";

// Icons (nicer + consistent)
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { MdExpandMore } from "react-icons/md";
import {
  FiHome,
  FiShoppingBag,
  FiUsers,
  FiTag,
  FiGrid,
  FiLayers,
  FiShield,
  FiDollarSign,
  FiTrendingUp,
  FiArrowDownLeft,
  FiArrowUpRight,
  FiBookOpen,
  FiCreditCard,
  FiBriefcase,
  FiPackage,
  FiList,
  FiInbox,
} from "react-icons/fi";
import { GiPayMoney } from "react-icons/gi";

// ============================================
// 🔹 Types
// ============================================
type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: {
    name: string;
    path: string;
    pro?: boolean;
    new?: boolean;
    icon?: React.ReactNode;
  }[];
};

// ============================================
// 🔹 Sidebar Component
// ============================================
const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const userProfile = useSelector((state: RootState) => state.profile.data);
  const role = (userProfile?.role || "user").toLowerCase();
  const isAdmin = role === "admin";

  // ==============================
  // 🔹 Menu Configuration
  // ==============================
  const navItems: NavItem[] = [
    {
      icon: <FiHome className="text-[20px]" />,
      name: "داشبورد",
      path: "/Manager/",
    },

    // ✅ Admin money grouped in one item (with subcategories)
    ...(isAdmin
      ? [
          {
            icon: <FiDollarSign className="text-[20px]" />,
            name: "مالی (ادمین)",
            subItems: [
              {
                name: "داشبورد مالی",
                path: "/Manager/financeDashboard",
                icon: <FiTrendingUp className="text-[16px]" />,
              },
              {
                name: "پرداخت‌های ورودی",
                path: "/Manager/inboundPayments",
                icon: <FiArrowDownLeft className="text-[16px]" />,
              },
              {
                name: "مدیریت برداشت‌ها",
                path: "/Manager/payoutManagement",
                icon: <FiArrowUpRight className="text-[16px]" />,
              },
              {
                name: "دفتر کل تراکنش‌ها",
                path: "/Manager/transactionsLedger",
                icon: <FiBookOpen className="text-[16px]" />,
              },
              {
                name: "واریز دستی به کیف پول",
                path: "/Manager/financeUsers",
                icon: <GiPayMoney className="text-[16px]" />,
              },
            ],
          } as NavItem,
        ]
      : []),

    {
      icon: <FiShoppingBag className="text-[20px]" />,
      name: "مدیریت محصولات",
      subItems: [
        {
          name: "لیست همه محصولات",
          path: "/Manager/listProduct",
          pro: false,
          icon: <FiList className="text-[16px]" />,
        },
        {
          name: "لیست محصولات من",
          path: "/Manager/listMyProduct",
          pro: false,
          icon: <FiPackage className="text-[16px]" />,
        },
        {
          name: "افزودن محصول",
          path: "/Manager/addProduct",
          pro: false,
          icon: <FiInbox className="text-[16px]" />,
        },
      ],
    },
    {
      icon: <FiUsers className="text-[20px]" />,
      name: "کاربران",
      subItems: [
        {
          name: "لیست کاربران",
          path: "/Manager/listUsers",
          pro: false,
          icon: <FiUsers className="text-[16px]" />,
        },
      ],
    },
    {
      icon: <FiBriefcase className="text-[20px]" />,
      name: "برندها",
      path: "/Manager/brand",
    },
    {
      icon: <FiLayers className="text-[20px]" />,
      name: "برندهای من",
      path: "/Manager/myBrand",
    },
    {
      icon: <FiGrid className="text-[20px]" />,
      name: "دسته‌بندی‌ها",
      path: "/Manager/categories",
    },
  ];

  const othersItems: NavItem[] = [
    {
      icon: <FiCreditCard className="text-[20px]" />,
      name: "کیف پول",
      subItems: [
        {
          name: "نمای کلی",
          path: "/Manager/Wallet",
          icon: <FiCreditCard className="text-[16px]" />,
        },
        {
          name: "تراکنش‌ها",
          path: "/Manager/Wallet/transactions",
          icon: <FiBookOpen className="text-[16px]" />,
        },
        {
          name: "درخواست برداشت",
          path: "/Manager/payouts",
          icon: <FiArrowUpRight className="text-[16px]" />,
        },
        {
          name: "سفارشات",
          path: "/Manager/orders",
          icon: <FiShoppingBag className="text-[16px]" />,
        },
      ],
    },
  ];

  // ==============================
  // 🔹 Role-based Filtering
  // ==============================
  const filteredNavItems = navItems
    .map((item) => {
      // Admin-only items
      if (item.name === "کاربران" && !isAdmin) return null;
      if (item.name === "برندها" && !isAdmin) return null;

      // Ecommerce: only "List Products" is admin-only
      if (item.name === "مدیریت محصولات") {
        const filteredSubItems = item.subItems?.filter((sub) => {
          if (sub.name === "لیست همه محصولات" && !isAdmin) return false;
          return true;
        });
        return { ...item, subItems: filteredSubItems };
      }

      return item;
    })
    .filter(Boolean) as NavItem[];

  // ==============================
  // 🔹 Component Logic
  // ==============================
  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);

  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {},
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prev) =>
      prev && prev.type === menuType && prev.index === index
        ? null
        : { type: menuType, index },
    );
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-2">
      {items.map((nav, index) => {
        const isOpen =
          openSubmenu?.type === menuType && openSubmenu?.index === index;

        const anySubActive = !!nav.subItems?.some((s) => isActive(s.path));
        const mainActive = nav.path ? isActive(nav.path) : false;

        const activeLike = mainActive || anySubActive || isOpen;

        return (
          <li key={`${menuType}-${nav.name}-${index}`} className="select-none">
            {nav.subItems ? (
              <button
                onClick={() => handleSubmenuToggle(index, menuType)}
                className={[
                  "group w-full rounded-2xl px-3 py-2.5 text-sm font-semibold transition",
                  "flex items-center gap-3",
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "lg:justify-start",
                  // base colors
                  "text-gray-700 hover:text-gray-900 hover:bg-gray-100",
                  "dark:text-gray-300 dark:hover:text-white/90 dark:hover:bg-white/[0.06]",
                  // border + ring-ish
                  "border border-transparent hover:border-gray-200 dark:hover:border-white/[0.08]",
                  // active
                  activeLike
                    ? "bg-brand-50 text-brand-500 border-brand-100 dark:bg-brand-500/[0.12] dark:text-brand-400 dark:border-white/[0.08]"
                    : "",
                ].join(" ")}
              >
                <span
                  className={[
                    "shrink-0 rounded-xl p-2 transition",
                    activeLike
                      ? "text-brand-500 dark:text-brand-400 bg-brand-50/70 dark:bg-brand-500/[0.10]"
                      : "text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/[0.03] group-hover:text-gray-700 dark:group-hover:text-gray-200",
                  ].join(" ")}
                >
                  {nav.icon}
                </span>

                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="truncate">{nav.name}</span>
                )}

                {(isExpanded || isHovered || isMobileOpen) && (
                  <MdExpandMore
                    className={[
                      "ml-auto h-5 w-5 transition-transform duration-200",
                      isOpen
                        ? "rotate-180 text-brand-500 dark:text-brand-400"
                        : "text-gray-400 dark:text-gray-500",
                    ].join(" ")}
                  />
                )}
              </button>
            ) : (
              nav.path && (
                <Link
                  href={nav.path}
                  className={[
                    "group w-full rounded-2xl px-3 py-2.5 text-sm font-semibold transition",
                    "flex items-center gap-3",
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "lg:justify-start",
                    "text-gray-700 hover:text-gray-900 hover:bg-gray-100",
                    "dark:text-gray-300 dark:hover:text-white/90 dark:hover:bg-white/[0.06]",
                    "border border-transparent hover:border-gray-200 dark:hover:border-white/[0.08]",
                    isActive(nav.path)
                      ? "bg-brand-50 text-brand-500 border-brand-100 dark:bg-brand-500/[0.12] dark:text-brand-400 dark:border-white/[0.08]"
                      : "",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "shrink-0 rounded-xl p-2 transition",
                      isActive(nav.path)
                        ? "text-brand-500 dark:text-brand-400 bg-brand-50/70 dark:bg-brand-500/[0.10]"
                        : "text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/[0.03] group-hover:text-gray-700 dark:group-hover:text-gray-200",
                    ].join(" ")}
                  >
                    {nav.icon}
                  </span>

                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="truncate">{nav.name}</span>
                  )}
                </Link>
              )
            )}

            {/* Sub Items */}
            {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
              <div
                ref={(el) => {
                  subMenuRefs.current[`${menuType}-${index}`] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height: isOpen
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
                }}
              >
                <ul className="mt-2 space-y-1 pl-4">
                  {nav.subItems.map((subItem) => {
                    const active = isActive(subItem.path);

                    return (
                      <li key={subItem.name}>
                        <Link
                          href={subItem.path}
                          className={[
                            "group flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
                            "border border-transparent",
                            active
                              ? "bg-brand-50 text-brand-500 border-brand-100 dark:bg-brand-500/[0.12] dark:text-brand-400 dark:border-white/[0.08]"
                              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:border-gray-200 dark:text-gray-300 dark:hover:bg-white/[0.06] dark:hover:text-white/90 dark:hover:border-white/[0.08]",
                          ].join(" ")}
                        >
                          <span
                            className={[
                              "inline-flex h-8 w-8 items-center justify-center rounded-lg transition",
                              active
                                ? "bg-brand-50/70 text-brand-500 dark:bg-brand-500/[0.10] dark:text-brand-400"
                                : "bg-gray-50 text-gray-500 group-hover:text-gray-700 dark:bg-white/[0.03] dark:text-gray-400 dark:group-hover:text-gray-200",
                            ].join(" ")}
                          >
                            {subItem.icon ?? <FiTag className="text-[16px]" />}
                          </span>

                          <span className="truncate">{subItem.name}</span>

                          {/* small active dot */}
                          {active && (
                            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-500 dark:bg-brand-400" />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  // ==============================
  // 🔹 Handle submenu auto-open
  // ==============================
  useEffect(() => {
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? filteredNavItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems?.some((sub) => isActive(sub.path))) {
          setOpenSubmenu({ type: menuType as "main" | "others", index });
        }
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  // ==============================
  // 🔹 Render Sidebar
  // ==============================
  const showText = isExpanded || isHovered || isMobileOpen;

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 h-screen z-50 border-r transition-all duration-300 ease-in-out
        bg-white text-gray-900 border-gray-200
        dark:bg-gray-900 dark:text-gray-100 dark:border-gray-800
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
              ? "w-[290px]"
              : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Brand */}
      <div
        className={`py-8 flex ${!showText ? "lg:justify-center" : "justify-start"}`}
      >
        <Link href="/" className="flex items-center gap-3">
          {showText ? (
            <>
              <Image
                className="dark:hidden"
                src="/assets/images/logo/Globenter-03.png"
                alt="Logo"
                width={110}
                height={40}
                priority
              />
              <Image
                className="hidden dark:block"
                src="/assets/images/logo/Globenter-03.png"
                alt="Logo"
                width={110}
                height={40}
                priority
              />
            </>
          ) : (
            <Image
              src="/assets/images/logo/Globenter-05.png"
              alt="Logo"
              width={34}
              height={34}
              priority
            />
          )}
        </Link>
      </div>

      {/* Menu */}
      <div className="flex flex-col overflow-y-auto pb-6 no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-6">
            <div>
              <h2
                className={`mb-3 text-[11px] uppercase tracking-wider flex leading-[20px] text-gray-400
                  ${!showText ? "lg:justify-center" : "justify-start"}`}
              >
                {showText ? (
                  "منو"
                ) : (
                  <HiOutlineDotsHorizontal className="text-xl" />
                )}
              </h2>
              {renderMenuItems(filteredNavItems, "main")}
            </div>

            <div>
              <h2
                className={`mb-3 text-[11px] uppercase tracking-wider flex leading-[20px] text-gray-400
                  ${!showText ? "lg:justify-center" : "justify-start"}`}
              >
                {showText ? (
                  "بخش‌های دیگر"
                ) : (
                  <HiOutlineDotsHorizontal className="text-xl" />
                )}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>

            {/* Footer hint (optional) */}
            {showText && (
              <div
                className="mt-2 rounded-2xl border border-black/10 bg-gray-50 px-4 py-3 text-xs text-gray-600
                              dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-gray-400"
              >
                <div className="flex items-center gap-2">
                  <FiShield className="opacity-80" />
                  <span>مدیریت حرفه‌ای با دسترسی نقش‌ها</span>
                </div>
              </div>
            )}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
