"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, SubmitHandler } from "react-hook-form";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { AppDispatch, RootState } from "@/store/store";
import {
  fetchBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from "@/store/slices/brandSlice";
import { FiEdit, FiTrash2 } from "react-icons/fi";

const MySwal = withReactContent(Swal);

interface BrandFormInputs {
  name: string;
  description?: string;
}

const BrandListPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { brands, loading } = useSelector((state: RootState) => state.brands);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BrandFormInputs>();

  useEffect(() => {
    dispatch(fetchBrands());
  }, [dispatch]);

  const openModalForCreate = () => {
    setEditingBrand(null);
    reset({ name: "", description: "" });
    setIsModalOpen(true);
  };

  const openModalForEdit = (brand: {
    id: number;
    name: string;
    description?: string;
  }) => {
    setEditingBrand(brand.id);
    reset({ name: brand.name, description: brand.description || "" });
    setIsModalOpen(true);
  };

  const onSubmit: SubmitHandler<BrandFormInputs> = async (data) => {
    try {
      if (editingBrand) {
        await dispatch(updateBrand({ id: editingBrand, data })).unwrap();
        MySwal.fire("Success", "Brand updated successfully", "success");
      } else {
        await dispatch(createBrand(data)).unwrap();
        MySwal.fire("Success", "Brand created successfully", "success");
      }
      setIsModalOpen(false);
      reset();
    } catch (err: any) {
      MySwal.fire("Error", err?.message || "Failed to save brand", "error");
    }
  };

  const handleDelete = (id: number) => {
    MySwal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4f46e5",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await dispatch(deleteBrand(id)).unwrap();
          MySwal.fire("Deleted!", "Brand has been deleted.", "success");
        } catch (err: any) {
          MySwal.fire(
            "Error",
            err?.message || "Failed to delete brand",
            "error"
          );
        }
      }
    });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Brands</h1>
        <button
          onClick={openModalForCreate}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500"
        >
          Create Brand
        </button>
      </div>

      {/* Brand Table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-right text-sm">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {brands.map((brand) => (
              <tr key={brand.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {brand.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {brand.description}
                </td>
                <td className="px-6 py-4 text-right text-sm flex justify-end gap-3">
                  <button
                    onClick={() => openModalForEdit(brand)}
                    className="text-indigo-600 hover:text-indigo-500"
                  >
                    <FiEdit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(brand.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-500 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>

          <div className="bg-white rounded-lg shadow-xl z-50 w-full max-w-md p-6 relative">
            <h2 className="text-xl font-semibold mb-4">
              {editingBrand ? "Edit Brand" : "Create Brand"}
            </h2>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Brand Name"
                  {...register("name", { required: "Name is required" })}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 focus:outline-indigo-600 focus:ring-1 focus:ring-indigo-600 sm:text-sm"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Brand Description"
                  {...register("description")}
                  rows={3}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 focus:outline-indigo-600 focus:ring-1 focus:ring-indigo-600 sm:text-sm"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-500"
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandListPage;
