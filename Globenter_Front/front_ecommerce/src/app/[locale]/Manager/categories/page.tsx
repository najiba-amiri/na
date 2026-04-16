"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, SubmitHandler } from "react-hook-form";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { AppDispatch, RootState } from "@/store/store";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  Category,
} from "@/store/slices/categoriesSlice";

const MySwal = withReactContent(Swal);

interface CategoryFormInputs {
  name: string;
  description?: string;
  parent?: number | null;
}

const CategoryListPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, loading } = useSelector(
    (state: RootState) => state.categories
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<
    (CategoryFormInputs & { id?: number }) | null
  >(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormInputs>();

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const openModalForCreate = (parentId: number | null = null) => {
    setEditingCategory({
      parent: parentId,
      name: "",
    });
    reset({ name: "", description: "", parent: parentId });
    setIsModalOpen(true);
  };

  const openModalForEdit = (category: Category) => {
    setEditingCategory(category);
    reset({
      name: category.name,
      description: category.description || "",
      parent: category.parent || null,
    });
    setIsModalOpen(true);
  };

  const onSubmit: SubmitHandler<CategoryFormInputs> = async (data) => {
    const payload = {
      name: data.name,
      description: data.description || "",
      parent: data.parent || null,
    };

    try {
      if (editingCategory?.id) {
        await dispatch(
          updateCategory({ id: editingCategory.id, data: payload })
        ).unwrap();
        MySwal.fire("Success", "Category updated successfully", "success");
      } else {
        await dispatch(createCategory(payload)).unwrap();
        MySwal.fire("Success", "Category created successfully", "success");
      }
      closeModal();
    } catch (err: any) {
      MySwal.fire("Error", err || "Failed to save category", "error");
    }
  };

  const handleDelete = (id: number) => {
    MySwal.fire({
      title: "Are you sure?",
      text: "This will delete the category and all its children!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4f46e5",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await dispatch(deleteCategory(id)).unwrap();
          MySwal.fire("Deleted!", "Category has been deleted.", "success");
        } catch (err: any) {
          MySwal.fire("Error", err || "Failed to delete category", "error");
        }
      }
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    reset();
  };

  // Recursive category rendering without action buttons for nested categories
  const renderCategories = (cats: Category[], level = 0, isTopLevel = true) => {
    return cats.map((category) => (
      <React.Fragment key={category.id}>
        <tr className="hover:bg-gray-50 transition-colors">
          <td
            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
            style={{ paddingLeft: `${level * 20 + 12}px` }}
          >
            {category.name}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {category.description}
          </td>
          <td className="px-6 py-4 text-right text-sm flex gap-2 justify-end">
            {isTopLevel && (
              <>
                <button
                  onClick={() => openModalForEdit(category)}
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  <FiEdit size={18} />
                </button>

                <button
                  onClick={() => handleDelete(category.id)}
                  className="text-red-500 hover:text-red-600"
                  title="Delete Category"
                >
                  <FiTrash2 size={18} />
                </button>

                <button
                  onClick={() => openModalForCreate(category.id)}
                  className="text-green-600 hover:text-green-500"
                  title="Add Child Category"
                >
                  + Child
                </button>
              </>
            )}
          </td>
        </tr>
        {category.children &&
          renderCategories(category.children, level + 1, false)}
      </React.Fragment>
    ));
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 md:gap-0">
        <h1 className="text-2xl font-semibold">Categories</h1>
        <button
          onClick={() => openModalForCreate()}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500"
        >
          Create Category
        </button>
      </div>

      {/* Category Table */}
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
            {renderCategories(categories)}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-500 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            onClick={closeModal}
          ></div>

          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative z-50">
            <h2 className="text-xl font-semibold mb-4">
              {editingCategory?.id ? "Edit Category" : "Create Category"}
            </h2>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Category Name"
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
                  placeholder="Category Description"
                  {...register("description")}
                  rows={3}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 focus:outline-indigo-600 focus:ring-1 focus:ring-indigo-600 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Parent Category
                </label>
                <select
                  {...register("parent")}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 sm:text-sm"
                >
                  <option value="">None</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-500"
                >
                  {loading
                    ? editingCategory?.id
                      ? "Updating..."
                      : "Creating..."
                    : editingCategory?.id
                    ? "Update"
                    : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryListPage;
