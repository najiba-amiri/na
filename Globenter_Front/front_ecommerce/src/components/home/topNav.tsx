"use client";

import { FC, useEffect, useState } from "react";
import Lang from "@/components/Lang";
import NotificationDrawer from "@/components/Utils/notifiction";
import { useTranslations } from "next-intl";
import AdvertisingText from "@/components/Utils/AvertisingText";
import { useTheme } from "@/Dashboard/context/ThemeContext";
import { FiSun, FiMoon, FiGrid } from "react-icons/fi";
import { Link } from "@/i18n/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchProfile } from "@/store/slices/profileSlice";

const TopNav: FC = () => {
  const t = useTranslations("TopNav");
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { data: profile, loading, hasFetched } = useSelector(
    (state: RootState) => state.profile
  );
  const role = profile?.role?.toLowerCase();
  const canAccessManager = role === "admin" || role === "seller";

  useEffect(() => {
    if (!profile && !loading && !hasFetched) {
      dispatch(fetchProfile(false));
    }
  }, [dispatch, profile, loading, hasFetched]);

  return (
    <div className="relative z-[220]">
      <div className="bg_color dark:bg-gray-900 text-white text-sm py-2 px-3 md:px-4 relative border-b border-transparent dark:border-gray-800 overflow-visible">
        <div className="max-w-[95%] mx-auto flex items-center justify-between gap-2 md:gap-4">
          <div className="flex items-center gap-2 md:gap-4 text-base shrink-0">
            <Lang />
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200"
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? (
                <FiSun size={16} className="text-yellow-300" />
              ) : (
                <FiMoon size={16} className="text-white" />
              )}
              <span className="text-xs font-medium hidden sm:inline">
                {theme === "dark" ? "Light" : "Dark"}
              </span>
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 min-w-0 flex-1">
            <div className="hidden sm:block min-w-0 max-w-[220px] md:max-w-none overflow-hidden">
              <AdvertisingText />
            </div>
            {canAccessManager && (
              <Link
                href="/Manager"
                className="inline-flex items-center gap-1 px-2.5 md:px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors text-[11px] md:text-xs whitespace-nowrap"
              >
                <FiGrid size={14} />
                <span>{t("Dashboard")}</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <NotificationDrawer 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </div>
  );
};

export default TopNav;
