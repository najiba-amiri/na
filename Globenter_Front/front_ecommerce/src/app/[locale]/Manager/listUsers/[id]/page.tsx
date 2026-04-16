"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { updateUser } from "@/store/slices/userSlice";
import { useForm, useFieldArray } from "react-hook-form";
import Swal from "sweetalert2";

interface FormValues {
  first_name?: string;
  last_name?: string;
  username?: string;
  email?: string;
  role?: string;
  profile_image?: File | null;
  phone?: string;
  social_links?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    whatsapp?: string;
    twitter?: string;
  };
  addresses?: {
    id?: number;
    address_line?: string;
    city?: string;
    state?: string;
    country?: string;
    zip_code?: string;
    is_primary?: boolean;
  }[];
}

const EditUserPage: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading } = useSelector((state: RootState) => state.users);

  const user = users.find((u) => u.id === Number(id));
  const [imagePreview, setImagePreview] = useState<string | null>(
    user?.profile_image_url || null
  );

  const { register, handleSubmit, setValue, control } = useForm<FormValues>({
    defaultValues: {
      first_name: user?.first_name,
      last_name: user?.last_name,
      username: user?.username,
      email: user?.email,
      role: user?.role,
      phone: user?.phone,
      social_links: user?.social_links || {},
      addresses: user?.addresses || [],
      profile_image: null,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "addresses",
  });

  useEffect(() => {
    if (user) {
      setValue("first_name", user.first_name);
      setValue("last_name", user.last_name);
      setValue("username", user.username);
      setValue("email", user.email);
      setValue("role", user.role);
      setValue("phone", user.phone);
      setValue("social_links", user.social_links || {});
      setValue("addresses", user.addresses || []);
    }
  }, [user, setValue]);

  if (loading || !user) return null;

  const onSubmit = (data: FormValues) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (key === "social_links" && value) {
        formData.append(key, JSON.stringify(value));
      } else if (key === "addresses" && value) {
        formData.append(key, JSON.stringify(value));
      } else if (key === "profile_image" && value) {
        formData.append(key, value as File);
      } else if (value !== undefined && value !== null) {
        formData.append(key, value as string);
      }
    });

    dispatch(updateUser({ id: user.id, formData }))
      .unwrap()
      .then(() => {
        Swal.fire("Success", "User updated successfully", "success");
        router.push("/Manager/listUsers/1");
      })
      .catch((err) => Swal.fire("Error", err, "error"));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setValue("profile_image", file);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Edit User</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Profile Image */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 overflow-hidden rounded-full bg-gray-100">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Profile"
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-gray-500">No Image</span>
            )}
          </div>
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <input
            {...register("first_name")}
            placeholder="First Name"
            className="border p-2 rounded"
          />
          <input
            {...register("last_name")}
            placeholder="Last Name"
            className="border p-2 rounded"
          />
          <input
            {...register("username")}
            placeholder="Username"
            className="border p-2 rounded"
          />
          <input
            {...register("email")}
            placeholder="Email"
            type="email"
            className="border p-2 rounded"
          />
          <input
            {...register("phone")}
            placeholder="Phone"
            className="border p-2 rounded"
          />
          <select {...register("role")} className="border p-2 rounded">
            <option value="">Select Role</option>
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
          </select>
        </div>

        {/* Social Links */}
        <div>
          <h2 className="font-semibold mb-2">Social Links</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              {...register("social_links.facebook")}
              placeholder="Facebook"
              className="border p-2 rounded"
            />
            <input
              {...register("social_links.instagram")}
              placeholder="Instagram"
              className="border p-2 rounded"
            />
            <input
              {...register("social_links.linkedin")}
              placeholder="LinkedIn"
              className="border p-2 rounded"
            />
            <input
              {...register("social_links.twitter")}
              placeholder="Twitter"
              className="border p-2 rounded"
            />
            <input
              {...register("social_links.whatsapp")}
              placeholder="WhatsApp"
              className="border p-2 rounded"
            />
          </div>
        </div>

        {/* Addresses */}
        <div>
          <h2 className="font-semibold mb-2">Addresses</h2>
          {fields.map((field, idx) => (
            <div key={field.id} className="grid grid-cols-2 gap-4 mb-2">
              <input
                {...register(`addresses.${idx}.address_line`)}
                placeholder="Address Line"
                defaultValue={field.address_line}
                className="border p-2 rounded"
              />
              <input
                {...register(`addresses.${idx}.city`)}
                placeholder="City"
                defaultValue={field.city}
                className="border p-2 rounded"
              />
              <input
                {...register(`addresses.${idx}.state`)}
                placeholder="State"
                defaultValue={field.state}
                className="border p-2 rounded"
              />
              <input
                {...register(`addresses.${idx}.country`)}
                placeholder="Country"
                defaultValue={field.country}
                className="border p-2 rounded"
              />
              <input
                {...register(`addresses.${idx}.zip_code`)}
                placeholder="Zip Code"
                defaultValue={field.zip_code}
                className="border p-2 rounded"
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register(`addresses.${idx}.is_primary`)}
                  defaultChecked={field.is_primary}
                />
                Primary
              </label>
              <button
                type="button"
                className="text-red-500 mt-2"
                onClick={() => remove(idx)}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="px-2 py-1 bg-green-600 text-white rounded"
            onClick={() =>
              append({
                address_line: "",
                city: "",
                state: "",
                country: "",
                zip_code: "",
                is_primary: false,
              })
            }
          >
            Add Address
          </button>
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Update User
        </button>
      </form>
    </div>
  );
};

export default EditUserPage;
