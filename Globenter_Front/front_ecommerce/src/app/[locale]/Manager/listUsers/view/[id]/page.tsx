"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import Swal from "sweetalert2";

import { fetchUsers } from "@/store/slices/userSlice";
import {
  FaArrowLeft,
  FaEdit,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaUser,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaTwitter,
  FaWhatsapp,
  FaCalendarAlt,
} from "react-icons/fa";

const roleColors: Record<string, string> = {
  buyer: "bg-blue-100 text-blue-700 border-blue-200",
  seller: "bg-emerald-100 text-emerald-700 border-emerald-200",
  admin: "bg-purple-100 text-purple-700 border-purple-200",
};

const ViewUserPage: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading } = useSelector((state: RootState) => state.users);

  // Try to find user in store
  const userId = Number(id);
  const user = useMemo(() => users.find((u) => u.id === userId), [users, userId]);

  // If store is empty (refresh / direct open), load users
  useEffect(() => {
    if (!users.length) dispatch(fetchUsers());
  }, [dispatch, users.length]);

  // If finished loading and still not found, show error
  useEffect(() => {
    if (!loading && users.length && !user) {
      Swal.fire("Not found", "User not found", "error");
      router.push("/Manager/listUsers/1");
    }
  }, [loading, users.length, user, router]);

  if (loading || !user) return null;

  const fullName = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || user.username;

  const roleClass =
    roleColors[(user.role || "").toLowerCase()] ||
    "bg-gray-100 text-gray-700 border-gray-200";

  const social = user.social_links || {};
  const addresses = user.addresses || [];
  const primary = addresses.find((a: any) => a?.is_primary) || addresses[0];

  const SocialItem = ({
    href,
    label,
    icon,
  }: {
    href: string;
    label: string;
    icon: React.ReactNode;
  }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-gray-50 transition"
      title={label}
    >
      <span className="text-gray-700">{icon}</span>
      <span className="text-sm text-gray-700">{label}</span>
    </a>
  );

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* Top bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 transition"
          >
            <FaArrowLeft />
            Back
          </button>

          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
            View User
          </h1>
        </div>

        <Link
          href={`/Manager/listUsers/${user.id}`}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
        >
          <FaEdit />
          Edit User
        </Link>
      </div>

      {/* Main card */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Profile card */}
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border flex items-center justify-center">
              {user.profile_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.profile_image_url}
                  alt={fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaUser className="text-gray-400" size={30} />
              )}
            </div>

            <div className="min-w-0">
              <p className="text-lg font-semibold text-gray-900 truncate">{fullName}</p>
              <p className="text-sm text-gray-500 truncate">@{user.username}</p>

              <span
                className={`inline-flex mt-2 items-center px-3 py-1 rounded-full text-xs border ${roleClass}`}
              >
                {(user.role || "user").toUpperCase()}
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3 text-gray-700">
              <FaEnvelope className="text-gray-400" />
              <span className="text-sm break-all">{user.email}</span>
            </div>

            {user.phone ? (
              <div className="flex items-center gap-3 text-gray-700">
                <FaPhoneAlt className="text-gray-400" />
                <span className="text-sm">{user.phone}</span>
              </div>
            ) : null}

            {user.joined_date ? (
              <div className="flex items-center gap-3 text-gray-700">
                <FaCalendarAlt className="text-gray-400" />
                <span className="text-sm">{user.joined_date}</span>
              </div>
            ) : null}

            {primary?.address_line ? (
              <div className="flex items-start gap-3 text-gray-700">
                <FaMapMarkerAlt className="text-gray-400 mt-1" />
                <div className="text-sm">
                  <div className="font-medium text-gray-800">
                    {primary.address_line}
                  </div>
                  <div className="text-gray-600">
                    {[primary.city, primary.state, primary.country].filter(Boolean).join(", ")}
                  </div>
                  {primary.zip_code ? (
                    <div className="text-gray-500">ZIP: {primary.zip_code}</div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                No address saved.
              </div>
            )}
          </div>
        </div>

        {/* Right: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Social links */}
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Links</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {social.facebook ? (
                <SocialItem href={social.facebook} label="Facebook" icon={<FaFacebook />} />
              ) : null}
              {social.instagram ? (
                <SocialItem href={social.instagram} label="Instagram" icon={<FaInstagram />} />
              ) : null}
              {social.linkedin ? (
                <SocialItem href={social.linkedin} label="LinkedIn" icon={<FaLinkedin />} />
              ) : null}
              {social.twitter ? (
                <SocialItem href={social.twitter} label="Twitter/X" icon={<FaTwitter />} />
              ) : null}
              {social.whatsapp ? (
                <SocialItem href={social.whatsapp} label="WhatsApp" icon={<FaWhatsapp />} />
              ) : null}

              {/* Empty state */}
              {!social.facebook &&
              !social.instagram &&
              !social.linkedin &&
              !social.twitter &&
              !social.whatsapp ? (
                <div className="text-sm text-gray-500">
                  No social links added.
                </div>
              ) : null}
            </div>
          </div>

          {/* Addresses */}
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Addresses</h2>

            {addresses.length ? (
              <div className="space-y-4">
                {addresses.map((a: any, idx: number) => (
                  <div
                    key={a?.id ?? idx}
                    className="rounded-xl border p-4 flex flex-col md:flex-row md:items-start md:justify-between gap-3"
                  >
                    <div>
                      <div className="font-semibold text-gray-900">
                        {a?.address_line || "—"}
                      </div>
                      <div className="text-sm text-gray-600">
                        {[a?.city, a?.state, a?.country].filter(Boolean).join(", ") || "—"}
                      </div>
                      {a?.zip_code ? (
                        <div className="text-sm text-gray-500">ZIP: {a.zip_code}</div>
                      ) : null}
                    </div>

                    {a?.is_primary ? (
                      <span className="inline-flex h-fit items-center px-3 py-1 rounded-full text-xs border bg-amber-100 text-amber-700 border-amber-200">
                        Primary
                      </span>
                    ) : (
                      <span className="inline-flex h-fit items-center px-3 py-1 rounded-full text-xs border bg-gray-100 text-gray-700 border-gray-200">
                        Secondary
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No addresses added.</div>
            )}
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={`/Manager/listUsers/${user.id}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
              >
                <FaEdit />
                Edit User
              </Link>

              <Link
                href="/Manager/listUsers/1"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 transition"
              >
                <FaArrowLeft />
                Back to Users
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewUserPage;
