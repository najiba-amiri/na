"use client";

import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { logoutUser } from "@/store/slices/authSlice";
import { fetchProfile, clearProfile } from "@/store/slices/profileSlice";
import { BiMessageSquareDots } from "react-icons/bi";
import { FiUser, FiHeart, FiLogOut } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import Cart from "@/components/Utils/CartNotif";
import Wishlist from "@/components/Utils/Wishlist";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface MainIconProps {
  isRtl?: boolean;
}

const MainIcon = ({ isRtl = false }: MainIconProps) => {
  const t = useTranslations("MainNav");
  const [isHydrated, setIsHydrated] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const { data: profile, loading, hasFetched } = useSelector(
    (state: RootState) => state.profile
  );
  const { access: accessToken, user: authUser } = useSelector(
    (state: RootState) => state.auth
  );
  const isAuthenticated = Boolean(accessToken || authUser);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const cartRef = useRef<HTMLDivElement>(null);
  const wishlistRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated && !profile && !loading) {
      dispatch(fetchProfile(!hasFetched));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, isAuthenticated, profile, loading, hasFetched]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setIsCartOpen(false);
      }
      if (
        wishlistRef.current &&
        !wishlistRef.current.contains(event.target as Node)
      ) {
        setIsWishlistOpen(false);
      }
      if (
        accountRef.current &&
        !accountRef.current.contains(event.target as Node)
      ) {
        setIsAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      const resultAction = await dispatch(logoutUser()).unwrap();
      if (resultAction) {
        toast.success(t("LogoutSuccess"));

        dispatch(clearProfile());
        router.refresh();
        router.push("/");
      }
    } catch (err: any) {
      let message = t("LogoutFailed");
      if (typeof err === "string") message = err;
      else if (err?.detail) message = err.detail;
      else if (Array.isArray(err)) message = err.join(", ");
      toast.error(message);
    }
  };

  // Get full image URL if available
  const getProfileImageUrl = () => {
    if (profile?.profile_image_url) return profile.profile_image_url;
    return profile?.profile_image || null;
  };

  const profileImageUrl = getProfileImageUrl();
  const displayName =
    profile?.full_name || profile?.username || profile?.first_name || authUser?.username || t("User");
  const showAuthenticatedUi = isHydrated && (Boolean(profile) || isAuthenticated);

  return (
    <>
      <div
        className={`hidden md:flex items-center ${
          isRtl ? "justify-start" : "justify-end"
        }`}
      >
        <div
          className={`flex items-center gap-8 text-gray-700 dark:text-gray-300 flex-shrink-0 ${
            isRtl ? "flex-row-reverse" : ""
          }`}
        >
          {/* Cart */}
          <Cart />

          {/* Wishlist */}
          <Wishlist />
          {/* Messages */}
          <Link href="/messages" className="flex flex-col items-center">
            <BiMessageSquareDots size={24} />
            <span className="text-sm mt-1">{t("Messages")}</span>
          </Link>

          {/* Account */}
          <div className="relative" ref={accountRef}>
            <button
              type="button"
              className="flex flex-col items-center cursor-pointer rounded-xl px-2 py-1.5 transition-colors hover:bg-white/10 dark:hover:bg-gray-800/70"
              onClick={() => {
                setIsAccountOpen((prev) => !prev);
                setIsCartOpen(false);
                setIsWishlistOpen(false);
              }}
            >
              {showAuthenticatedUi ? (
                <>
                  <div className="w-8 h-8 rounded-full border overflow-hidden flex items-center justify-center shadow-sm">
                    {profileImageUrl ? (
                      <Image
                        src={profileImageUrl}
                        alt={displayName}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <FaUserCircle className="text-gray-400 w-full h-full" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-1">
                    {displayName}
                  </span>
                </>
              ) : (
                <>
                  <FiUser size={24} />
                  <span className="text-sm mt-1">{t("Account")}</span>
                </>
              )}
            </button>

            {isAccountOpen && (
              <div
                className={`absolute top-full mt-2 w-56 max-w-[calc(100vw-1rem)] rounded-2xl border border-white/10 bg-slate-800/95 shadow-2xl backdrop-blur-md z-[5000] overflow-hidden ${
                  isRtl ? "left-0" : "right-0"
                }`}
              >
                {showAuthenticatedUi ? (
                  <>
                    <Link
                      href="/Profiles"
                      className={`flex items-center gap-3 px-5 py-3 text-gray-100 hover:bg-[#f1a013]/15 hover:text-[#f1a013] transition-colors duration-200 ${
                        isRtl ? "flex-row-reverse text-right" : "text-left"
                      }`}
                    >
                      <FiUser className="text-[#f1a013] text-lg" />
                      <span className="font-medium">{t("Profile")}</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className={`flex items-center gap-3 w-full px-5 py-3 text-gray-100 hover:bg-[#f1a013]/15 hover:text-[#f1a013] transition-colors duration-200 ${
                        isRtl ? "flex-row-reverse text-right" : "text-left"
                      }`}
                    >
                      <FiLogOut className="text-[#f1a013] text-lg" />
                      <span className="font-medium">{t("Logout")}</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className={`flex items-center gap-3 px-5 py-3 text-gray-100 hover:bg-[#f1a013]/15 hover:text-[#f1a013] transition-colors duration-200 ${
                        isRtl ? "flex-row-reverse text-right" : "text-left"
                      }`}
                    >
                      <FiUser className="text-[#f1a013] text-lg" />
                      <span className="font-medium">{t("Login")}</span>
                    </Link>
                    <Link
                      href="/auth/register"
                      className={`flex items-center gap-3 px-5 py-3 text-gray-100 hover:bg-[#f1a013]/15 hover:text-[#f1a013] transition-colors duration-200 ${
                        isRtl ? "flex-row-reverse text-right" : "text-left"
                      }`}
                    >
                      <FiHeart className="text-[#f1a013] text-lg" />
                      <span className="font-medium">{t("Register")}</span>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MainIcon;
