"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
  FaWhatsapp,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import { CiImageOn } from "react-icons/ci";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { Address, updateProfile } from "@/store/slices/profileSlice";
import { toast } from "react-hot-toast";

interface ProfileModalProps {
  onClose: () => void;
}

type EditableAddress = Address & { local_id: string };
const SOCIAL_KEYS = ["facebook", "instagram", "linkedin", "twitter", "whatsapp"] as const;
type SocialKey = (typeof SOCIAL_KEYS)[number];

type ProfileFormData = {
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
  profile_image: File | null;
  profile_image_preview: string;
  social_links: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    whatsapp?: string;
  };
  addresses: EditableAddress[];
};

const ProfileModal: React.FC<ProfileModalProps> = ({ onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const profile = useSelector((state: RootState) => state.profile.data);

  const [formData, setFormData] = useState<ProfileFormData>({
    first_name: "",
    last_name: "",
    phone: "",
    role: "",
    profile_image: null,
    profile_image_preview: "",
    social_links: {},
    addresses: [],
  });

  const addressTemplate = useMemo<EditableAddress>(
    () => ({
      local_id: `${Date.now()}-${Math.random()}`,
      address_line: "",
      city: "",
      state: "",
      zip_code: "",
      country: "",
      is_primary: false,
    }),
    []
  );

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone: profile.phone || "",
        role: profile.role || "",
        profile_image: null,
        profile_image_preview: profile.profile_image_url || profile.profile_image || "",
        social_links: profile.social_links || {},
        addresses: (profile.addresses || []).map((addr) => ({
          ...addr,
          local_id: `${addr.id || "new"}-${Math.random()}`,
        })),
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("social_links.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        social_links: { ...prev.social_links, [key]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const updateAddressField = (
    localId: string,
    field: keyof Address,
    value: string | boolean
  ) => {
    setFormData((prev) => {
      const nextAddresses = prev.addresses.map((addr) => {
        if (addr.local_id !== localId) return addr;
        return {
          ...addr,
          [field]: value,
        };
      });

      // Keep one primary address at a time.
      if (field === "is_primary" && value === true) {
        return {
          ...prev,
          addresses: nextAddresses.map((addr) =>
            addr.local_id === localId ? { ...addr, is_primary: true } : { ...addr, is_primary: false }
          ),
        };
      }

      return { ...prev, addresses: nextAddresses };
    });
  };

  const addAddress = () => {
    setFormData((prev) => ({
      ...prev,
      addresses: [...prev.addresses, { ...addressTemplate, local_id: `${Date.now()}-${Math.random()}` }],
    }));
  };

  const removeAddress = (localId: string) => {
    setFormData((prev) => ({
      ...prev,
      addresses: prev.addresses.filter((addr) => addr.local_id !== localId),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const primaryCount = formData.addresses.filter((addr) => addr.is_primary).length;
    if (primaryCount > 1) {
      toast.error("Only one address can be primary.");
      return;
    }

    const cleanedSocialLinks = Object.fromEntries(
      Object.entries(formData.social_links).filter(([, value]) => typeof value === "string" && value.trim() !== "")
    );

    const addressesPayload = formData.addresses
      .filter((addr) => addr.address_line.trim() && addr.city.trim() && addr.country.trim())
      .map((addr) => ({
        ...(addr.id ? { id: addr.id } : {}),
        address_line: addr.address_line.trim(),
        city: addr.city.trim(),
        state: addr.state?.trim() || "",
        zip_code: addr.zip_code?.trim() || "",
        country: addr.country.trim(),
        is_primary: Boolean(addr.is_primary),
      }));

    try {
      if (formData.profile_image) {
        const payload = new FormData();
        payload.append("first_name", formData.first_name);
        payload.append("last_name", formData.last_name);
        payload.append("phone", formData.phone);
        payload.append("role", formData.role);
        payload.append("social_links", JSON.stringify(cleanedSocialLinks));
        payload.append("addresses", JSON.stringify(addressesPayload));
        payload.append("profile_image", formData.profile_image);

        await dispatch(updateProfile({ data: payload, method: "PATCH" })).unwrap();
      } else {
        await dispatch(
          updateProfile({
            method: "PATCH",
            data: {
              first_name: formData.first_name,
              last_name: formData.last_name,
              phone: formData.phone,
              role: formData.role,
              social_links: cleanedSocialLinks,
              addresses: addressesPayload,
            },
          })
        ).unwrap();
      }

      toast.success("Profile updated!");
      onClose();
    } catch (err: any) {
      toast.error(err || "Failed to update profile.");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-start z-[5000] p-4 overflow-auto pt-10"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 p-6 rounded-2xl w-full max-w-3xl shadow-2xl relative animate-fade-in border-t-8 border-[#b16926]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 text-gray-400 dark:text-gray-500 hover:text-[#b16926] transition"
        >
          ✖
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center text-[#b16926]">
          Complete Your Profile
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              name="first_name"
              placeholder="First Name"
              value={formData.first_name}
              onChange={handleChange}
              required
              className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-2 border-[#f1a013] shadow-sm hover:shadow-md transition p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f1a013] placeholder-gray-400 dark:placeholder-gray-500"
            />
            <input
              type="text"
              name="last_name"
              placeholder="Last Name"
              value={formData.last_name}
              onChange={handleChange}
              required
              className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-2 border-[#f1a013] shadow-sm hover:shadow-md transition p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f1a013] placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-2 border-[#f1a013] shadow-sm hover:shadow-md transition p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f1a013] placeholder-gray-400 dark:placeholder-gray-500"
            />
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-2 border-[#f1a013] shadow-sm hover:shadow-md transition p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f1a013] placeholder-gray-400 dark:placeholder-gray-500"
            >
              <option value="">Select Role</option>
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
            </select>
          </div>

          {/* Image Upload */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer bg-[#f1a013]/10 px-4 py-2 rounded-xl hover:bg-[#f1a013]/20 text-[#b16926] font-medium transition">
              <CiImageOn size={22} />
              Upload Image
              <input
                type="file"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    setFormData((prev) => ({
                      ...prev,
                      profile_image: file,
                      profile_image_preview: URL.createObjectURL(file),
                    }));
                  }
                }}
                className="hidden"
              />
            </label>
            {formData.profile_image_preview && (
              <img
                src={formData.profile_image_preview}
                alt="Profile Preview"
                className="w-20 h-20 rounded-full object-cover border-2 border-[#b16926]"
              />
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Addresses</h3>
              <button
                type="button"
                onClick={addAddress}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#f1a013]/20 text-[#b16926] hover:bg-[#f1a013]/30 transition"
              >
                <FaPlus size={12} />
                Add Address
              </button>
            </div>

            {formData.addresses.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">No addresses yet.</p>
            )}

            {formData.addresses.map((address, index) => (
              <div
                key={address.local_id}
                className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm text-gray-700 dark:text-gray-200">
                    Address #{index + 1}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeAddress(address.local_id)}
                    className="text-red-500 hover:text-red-600"
                    aria-label="Remove address"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Address line"
                    value={address.address_line}
                    onChange={(e) =>
                      updateAddressField(address.local_id, "address_line", e.target.value)
                    }
                    className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 p-2.5 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={address.city}
                    onChange={(e) => updateAddressField(address.local_id, "city", e.target.value)}
                    className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 p-2.5 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={address.state || ""}
                    onChange={(e) => updateAddressField(address.local_id, "state", e.target.value)}
                    className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 p-2.5 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Zip code"
                    value={address.zip_code || ""}
                    onChange={(e) =>
                      updateAddressField(address.local_id, "zip_code", e.target.value)
                    }
                    className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 p-2.5 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    value={address.country}
                    onChange={(e) =>
                      updateAddressField(address.local_id, "country", e.target.value)
                    }
                    className="w-full sm:col-span-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 p-2.5 rounded-lg"
                  />
                </div>

                <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                  <input
                    type="checkbox"
                    checked={address.is_primary}
                    onChange={(e) =>
                      updateAddressField(address.local_id, "is_primary", e.target.checked)
                    }
                  />
                  Primary address
                </label>
              </div>
            ))}
          </div>

          {/* Social Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SOCIAL_KEYS.map((platform: SocialKey) => (
                <div key={platform} className="relative flex items-center gap-2">
                  <span className="absolute left-3 text-[#b16926]">
                    {platform === "facebook" && <FaFacebookF />}
                    {platform === "instagram" && <FaInstagram />}
                    {platform === "linkedin" && <FaLinkedinIn />}
                    {platform === "twitter" && <FaTwitter />}
                    {platform === "whatsapp" && <FaWhatsapp />}
                  </span>
                  <input
                    type="text"
                    name={`social_links.${platform}`}
                    placeholder={`${platform.charAt(0).toUpperCase() + platform.slice(1)} URL`}
                    value={formData.social_links?.[platform] || ""}
                    onChange={handleChange}
                    className="pl-10 w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-2 border-[#f1a013] shadow-sm hover:shadow-md transition p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f1a013] placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>
              ))}
          </div>

          <button
            type="submit"
            className="w-full   bg-[#f1a013] p-3 rounded-xl font-semibold hover:opacity-90 shadow-md transition mt-4"
          >
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
