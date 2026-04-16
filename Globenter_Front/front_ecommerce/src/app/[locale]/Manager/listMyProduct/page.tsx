"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaBoxOpen,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { deleteProduct } from "@/store/slices/productSlice";
import { fetchSellerStats } from "@/store/slices/sellerSlice";
import Pagination from "@/Dashboard/layout/Pagination";
import Swal from "sweetalert2";
import { toast } from "react-hot-toast";
import Badge from "@/Dashboard/components/ui/badge/Badge";

const OwnerProductListPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stats, loading, error } = useSelector(
    (state: RootState) => state.Seller
  );

  const itemsPerPage = 7;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchSellerStats());
  }, [dispatch]);

  const products = stats?.products || [];

  // -----------------------------
  // Selection
  // -----------------------------
  const handleSelect = (id: number) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const allIds = currentProducts.map((p) => p.id);
    const allSelected = allIds.every((id) => selectedProducts.includes(id));
    setSelectedProducts(allSelected ? [] : allIds);
  };

  // -----------------------------
  // Delete
  // -----------------------------
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will delete the product permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deleteProduct(id)).unwrap();
        toast.success("Product deleted successfully!");
      } catch (err: any) {
        toast.error(err?.message || "Failed to delete product");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) {
      toast.error("No products selected");
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `This will delete ${selectedProducts.length} products permanently!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete all!",
    });

    if (result.isConfirmed) {
      try {
        for (const id of selectedProducts) {
          await dispatch(deleteProduct(id)).unwrap();
        }
        toast.success("Selected products deleted successfully!");
        setSelectedProducts([]);
      } catch (err: any) {
        toast.error(err?.message || "Failed to delete some products");
      }
    }
  };

  const formatPrice = (price: number | string) =>
    `$${parseFloat(String(price)).toFixed(2)}`;

  // -----------------------------
  // Search & Pagination
  // -----------------------------
  const filteredProducts = products.filter((product: any) => {
    const term = searchTerm.toLowerCase();
    return (
      product.name?.toLowerCase().includes(term) ||
      product.category_name?.toLowerCase().includes(term) ||
      product.brand_name?.toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="p-5 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
            My Products
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage products that you own.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            {selectedProducts.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <FaTrash /> Delete Selected
              </button>
            )}
            <Link
              href="/Manager/addProduct"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <FaPlus /> Add Product
            </Link>
          </div>
        </div>
      </div>

      {/* Table / Empty State */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03] p-5">
        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">
            Loading products...
          </p>
        ) : error ? (
          <p className="text-red-500">
            Error: {typeof error === "string" ? error : JSON.stringify(error)}
          </p>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FaBoxOpen className="text-gray-400 text-6xl mb-4" />
            <p className="text-gray-500 text-lg mb-2">
              You haven’t added any products yet.
            </p>
            <Link
              href="/Manager/addProduct"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg text-sm font-medium"
            >
              Add Your First Product
            </Link>
          </div>
        ) : (
          <>
            <div className="max-w-full overflow-x-auto">
              <table className="min-w-[1200px] w-full border-collapse">
                <thead className="border-b border-gray-100 dark:border-white/[0.05]">
                  <tr>
                    <th className="px-5 py-3 text-start text-sm">
                      <input
                        type="checkbox"
                        checked={
                          currentProducts.length > 0 &&
                          currentProducts.every((p) =>
                            selectedProducts.includes(p.id)
                          )
                        }
                        onChange={handleSelectAll}
                      />
                    </th>
                    {[
                      "Product",
                      "Category",
                      "Brand",
                      "Price",
                      "Stock",
                      "Status",
                      "Created At",
                      "Tags",
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

                <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {currentProducts.map((product: any) => (
                    <tr
                      key={product.id}
                      className="transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-white/5"
                    >
                      <td className="px-5 py-4 text-start">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => handleSelect(product.id)}
                        />
                      </td>

                      <td className="px-5 py-4 text-start">
                        <Link
                          href={`/Manager/viewProduct/${product.id}`}
                          className="flex items-center gap-3 hover:underline"
                        >
                          <div className="w-12 h-12 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <Image
                              width={48}
                              height={48}
                              src={
                                product.image ||
                                "/assets/images/placeholder.png"
                              }
                              alt={product.name}
                              className="object-cover"
                            />
                          </div>
                          <span className="font-medium text-gray-800 dark:text-white/90">
                            {product.name}
                          </span>
                        </Link>
                      </td>

                      <td className="px-4 py-3 text-gray-600 text-sm dark:text-gray-400">
                        {product.category_name || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm dark:text-gray-400">
                        {product.brand_name || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-800 font-medium text-sm dark:text-gray-300">
                        {formatPrice(product.price)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge
                          size="sm"
                          color={product.stock > 0 ? "success" : "error"}
                        >
                          {product.stock > 0 ? "In Stock" : "Out of Stock"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge
                          size="sm"
                          color={
                            product.status === "active"
                              ? "success"
                              : product.status === "inactive"
                              ? "warning"
                              : undefined
                          }
                        >
                          {product.status.charAt(0).toUpperCase() +
                            product.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm dark:text-gray-400">
                        {new Date(product.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm dark:text-gray-400">
                        {product.tags && product.tags.length > 0
                          ? product.tags.join(", ")
                          : "-"}
                      </td>

                      <td className="px-4 py-3 text-sm flex items-center gap-2">
                        <Link
                          href={`/Manager/listProduct/${product.id}`}
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <FaEdit />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-800 flex items-center gap-1"
                        >
                          <FaTrash />
                        </button>
                        <Link
                          href={`/Manager/listProduct/${product.id}`}
                          className="text-gray-600 hover:text-gray-900 flex items-center gap-1 ml-2"
                        >
                          <FaEye />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default OwnerProductListPage;
