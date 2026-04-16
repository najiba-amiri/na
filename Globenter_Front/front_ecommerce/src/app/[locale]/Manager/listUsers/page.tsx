"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { fetchUsers, deleteUser, User } from "@/store/slices/userSlice";
import Image from "next/image";
import { FaTrash,FaEye, FaEdit } from "react-icons/fa";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Optional: badge for roles
const RoleBadge: React.FC<{ role?: string }> = ({ role }) => {
  if (!role) return null;
  const bgColor =
    role.toLowerCase() === "admin"
      ? "bg-red-100 text-red-800"
      : role.toLowerCase() === "seller"
      ? "bg-yellow-100 text-yellow-800"
      : "bg-green-100 text-green-800";

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${bgColor}`}>
      {role}
    </span>
  );
};

const UserListPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { users } = useSelector((state: RootState) => state.users);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const filteredUsers = users.filter(
    (user) =>
      user.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(search.toLowerCase()) ||
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.role?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (userId: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteUser(userId))
          .unwrap()
          .then(() => {
            Swal.fire("Deleted!", "User has been deleted.", "success");
          })
          .catch((error) => {
            Swal.fire("Error!", error, "error");
          });
      }
    });
  };

  const handleEdit = (userId: number) => {
    router.push(`/users/edit/${userId}`);
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Users List</h1>
      </div>

      {/* Search input */}
      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border border-gray-300 p-2 rounded w-full mb-6"
      />

      {/* Table container */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm p-5">
        <div className="max-w-full overflow-x-auto">
          <table className="min-w-[900px] w-full border-collapse">
            <thead className="border-b border-gray-100">
              <tr>
                {[
                  "#",
                  "Profile",
                  "Full Name",
                  "Username",
                  "Role",
                  "Phone",
                  "Joined Date",
                  "Actions",
                ].map((col) => (
                  <th
                    key={col}
                    className="px-5 py-3 font-medium text-gray-500 text-start text-sm"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user: User, index: number) => (
                  <tr
                    key={user.id}
                    className="transition-colors duration-200 hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-5 py-4 text-sm text-center">
                      {index + 1}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="w-12 h-12 overflow-hidden rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                        {user.profile_image ? (
                          <Image
                            width={48}
                            height={48}
                            src={user.profile_image}
                            alt={user.username}
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-gray-500 font-medium">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-gray-800">
                      {user.first_name || ""} {user.last_name || ""}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {user.username}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 text-center">
                      {user.phone || "—"}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 text-center">
                      {user.joined_date
                        ? new Date(user.joined_date).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-5 py-4 flex gap-4 justify-start items-center">
                      {/* Edit */}
                      <Link
                        href={`/Manager/listUsers/${user.id}`}
                        className="text-blue-600 hover:text-blue-800 transition"
                        title="Edit user"
                      >
                        <FaEdit size={16} />
                      </Link>

                      {/* View */}
                      <Link
                        href={`/Manager/listUsers/view/${user.id}`}
                        className="text-yellow-500 hover:text-yellow-700 transition"
                        title="View user"
                      >
                        <FaEye size={16} />
                      </Link>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-800 transition"
                        title="Delete user"
                      >
                        <FaTrash size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center text-gray-500 py-6 text-sm"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserListPage;
