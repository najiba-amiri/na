"use client";

import { Link } from "@/i18n/navigation";
import { usePathname } from "next/navigation";
import { FiHome, FiBox, FiHeadphones, FiGrid } from "react-icons/fi";

const items = [
  { href: "/", label: "Home", icon: FiHome },
  { href: "/products", label: "Products", icon: FiBox },
  { href: "/support", label: "Support", icon: FiHeadphones },
  { href: "/Manager", label: "Dashboard", icon: FiGrid },
];

export default function MobileBottomNav() {
  const pathname = usePathname() || "";

  const isActive = (href: string) => {
    if (href === "/") return /^\/[a-z]{2}(\/)?$/.test(pathname);
    return pathname.includes(href);
  };

  return (
    <nav
      className="md:hidden fixed bottom-1.5 left-0 right-0 z-[220] px-3 supports-[padding:max(0px)]:pb-[env(safe-area-inset-bottom)]"
      aria-label="Mobile bottom navigation"
    >
      <ul className="grid grid-cols-4 h-[62px] rounded-[18px] bg-[#b16926] text-white shadow-[0_8px_20px_rgba(0,0,0,0.24)]">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className="relative h-full flex flex-col items-center justify-center"
              >
                {active ? (
                  <>
                    <span className="absolute -top-4 h-11 w-11 rounded-full bg-[#f1a013] border-[3px] border-white dark:border-gray-950 shadow-[0_6px_12px_rgba(0,0,0,0.22)] grid place-items-center">
                      <Icon className="text-[18px] text-[#7a3f0f]" />
                    </span>
                    <span className="mt-6 text-[10px] font-bold text-white">
                      {item.label}
                    </span>
                  </>
                ) : (
                  <>
                    <Icon className="text-[17px] text-white/90" />
                    <span className="mt-0.5 text-[9px] font-medium text-white/90">
                      {item.label}
                    </span>
                  </>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
