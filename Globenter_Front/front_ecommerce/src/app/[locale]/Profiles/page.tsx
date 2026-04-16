"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchProfile } from "@/store/slices/profileSlice";
import { fetchWishlist } from "@/store/slices/wishlistSlice";
import { fetchCart } from "@/store/slices/cartSlice";
import { CiImageOn } from "react-icons/ci";
import { FaEnvelope, FaCreditCard, FaUserShield } from "react-icons/fa";
import Image from "next/image";

// ✅ Dynamic imports
const ProfileModal = dynamic(() => import("@/components/Profile/profileModel"), {
  ssr: false,
});
const ProfileStats = dynamic(() => import("@/components/Profile/profileStats"), {
  ssr: false,
});
const ProfileOrFa = dynamic(() => import("@/components/Profile/profileOrFa"), {
  ssr: false,
});
const ProfileSeller = dynamic(
  () => import("@/components/Profile/profileSeller"),
  { ssr: false }
);

export default function ProfilePage() {
  const dispatch = useDispatch<AppDispatch>();

  const {
    data: profile,
    loading: profileLoading,
    error: profileError,
  } = useSelector((state: RootState) => state.profile);

  const { items: wishlistItems } = useSelector(
    (state: RootState) => state.wishlist
  );
  const { items: cartItems } = useSelector(
    (state: RootState) => state.cart
  );

  const [showForm, setShowForm] = useState(false);
  const [askToComplete, setAskToComplete] = useState(false);

  // ✅ Fetch data
  useEffect(() => {
    dispatch(fetchProfile(false));
    dispatch(fetchWishlist());
    dispatch(fetchCart());
  }, [dispatch]);

  // ✅ Ask to complete profile (NOT for admin)
  useEffect(() => {
    const roleLower = profile?.role?.toLowerCase();
    const isAdminNow = roleLower === "admin";

    if (
      profile &&
      !isAdminNow &&
      (!profile.first_name || !profile.last_name || !profile.role)
    ) {
      setAskToComplete(true);
    } else {
      setAskToComplete(false);
    }
  }, [profile]);

  if (profileError)
    return <p className="text-center mt-10 text-red-600 dark:text-red-400">{profileError}</p>;
  if (!profile)
    return <p className="text-center mt-10 text-gray-700 dark:text-gray-300">No profile data found.</p>;

  // 🔐 Normalize role
  const role = profile.role?.toLowerCase();

  // ✅ Role flags
  const isAdmin = role === "admin";
  const isSeller = role === "seller";

  return (
    <div className="bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-5 min-h-screen">
      {/* ⚠️ Complete profile warning (hidden for admin) */}
      {askToComplete && !showForm && !isAdmin && (
        <div className="p-4 bg-[#ffe79a] dark:bg-amber-900/40 rounded-md text-center mb-4 border border-amber-200 dark:border-amber-700">
          <p className="mb-2">
            Your profile is incomplete. Do you want to complete it now?
          </p>
          <button
            onClick={() => {
              setShowForm(true);
              setAskToComplete(false);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Yes, Complete Profile
          </button>
        </div>
      )}

      {/* 🧑‍💼 Profile Header */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div
          className="h-50 flex justify-end items-start p-4 bg-cover bg-center flex-wrap gap-2"
          style={{
            backgroundImage:
              "url('/assets/images/background/profileback.svg')",
          }}
        >
          {/* ✅ Hide Edit Profile only for admin */}
          {!isAdmin && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 text-[#b16926] px-4 py-2 rounded-full font-semibold shadow-lg hover:bg-white dark:hover:bg-gray-800 transition"
            >
              <FaCreditCard size={16} /> Edit Profile
            </button>
          )}

          <button className="flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 text-[#b16926] px-4 py-2 rounded-full font-semibold shadow-lg hover:bg-white dark:hover:bg-gray-800 transition">
            <FaEnvelope size={16} /> Messages
          </button>
        </div>

        {/* 👤 Profile Info */}
        <div className="flex items-center p-6">
          <div className="w-30 h-30 relative -mt-25 border-4 border-white dark:border-gray-900 rounded-full overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            {(profile.profile_image_url || profile.profile_image) ? (
              <Image
                src={profile.profile_image_url || profile.profile_image || ""}
                alt={profile.full_name || profile.username || "User"}
                width={80}
                height={80}
                className="object-cover w-full h-full"
              />
            ) : (
              <CiImageOn className="text-gray-400 dark:text-gray-500 text-5xl" />
            )}
          </div>

          <div className="ml-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {profile.full_name || `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || profile.username}
            </h1>

            {/* 🛡️ Role badge */}
            <p
              className="inline-flex items-center gap-2
              bg-gradient-to-r from-[#b16926] to-[#f1a013]
              text-white text-sm font-semibold px-4 py-1.5
              rounded-full shadow-md"
            >
              <FaUserShield />
              {profile.role}
            </p>
          </div>
        </div>
      </div>

      {/* 📊 Stats */}
      <ProfileStats
        profile={profile}
        wishlistItems={wishlistItems}
        cartItems={cartItems}
      />

      {/* 🧑‍💻 Seller Section */}
      {isSeller && <ProfileSeller />}

      {/* 🛍️ Orders & Favorites */}
      <ProfileOrFa
        wishlistItems={wishlistItems}
        cartItems={cartItems}
      />

      {/* ✏️ Edit Modal (extra safety: never open for admin) */}
      {showForm && !isAdmin && (
        <ProfileModal onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}
