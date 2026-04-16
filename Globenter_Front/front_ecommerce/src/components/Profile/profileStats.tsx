"use client";

import React from "react";
import { FaUser, FaHeart, FaMapMarkerAlt, FaShoppingBag } from "react-icons/fa";
import { useTranslations } from "next-intl";

interface Address {
  address_line: string;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  country?: string | null;
}

interface ProfileStatsProps {
  profile: {
    joined_date?: string | null;
    phone?: string | null;
    addresses?: Address[];
  };
  wishlistItems: any[];
  cartItems: any[];
}

const ProfileStats: React.FC<ProfileStatsProps> = ({
  profile,
  wishlistItems,
  cartItems,
}) => {
  const t = useTranslations("ProfileStats"); // ✅ translation namespace

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
      {/* Member Since */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md rounded-xl p-5 grid grid-rows-[auto_auto] gap-4 text-center w-full max-w-sm">
        <div className="grid grid-cols-2 items-center gap-4">
          <div className="flex justify-center">
            <FaUser className="text-purple-500 text-5xl" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t("Member Since")}</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {profile.joined_date
                ? new Date(profile.joined_date).toLocaleDateString()
                : "N/A"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t("Status")}: {t("Active")}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t("Phone")}: {profile.phone}</p>
          </div>
        </div>
      </div>

      {/* Favorites */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md rounded-xl p-5 grid grid-rows-[auto_auto] gap-4 max-w-sm">
        <div className="grid grid-cols-2 items-center gap-4">
          <div className="flex justify-center">
            <FaHeart className="text-pink-500 text-5xl" />
          </div>
          <div className="text-left flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t("Favorite Products")}</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{wishlistItems.length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t("Wishlist")}</p>
          </div>
        </div>
      </div>

      {/* Addresses */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md rounded-xl p-5 max-w-sm">
        <div className="flex items-center gap-4 mb-4">
          <FaMapMarkerAlt className="text-blue-500 text-5xl" />
          <div className="text-left">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t("Registered Addresses")}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t("Your Addresses")}</p>
          </div>
        </div>

        <div className="space-y-3">
          {profile.addresses && profile.addresses.length > 0 ? (
            profile.addresses.map((addr, idx) => (
              <div
                key={idx}
                className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-center"
              >
                <p className="font-medium text-gray-900 dark:text-gray-100">{addr.address_line}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {addr.city}, {addr.state}, {addr.zip_code}, {addr.country}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center">{t("No addresses registered")}</p>
          )}
        </div>
      </div>

      {/* Orders */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md rounded-xl p-5 grid grid-rows-[auto_auto] gap-4 max-w-sm">
        <div className="grid grid-cols-2 items-center gap-4">
          <div className="flex justify-center">
            <FaShoppingBag className="text-orange-500 text-5xl" />
          </div>
          <div className="text-left flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t("Active Orders")}</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{cartItems.length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t("Processing")}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileStats;
