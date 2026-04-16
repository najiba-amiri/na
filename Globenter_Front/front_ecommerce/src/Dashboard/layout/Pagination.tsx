"use client";

import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const handlePrev = () => currentPage > 1 && onPageChange(currentPage - 1);
  const handleNext = () => currentPage < totalPages && onPageChange(currentPage + 1);

  return (
    <div className="flex items-center justify-between mt-6">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Showing <span className="font-medium">{(currentPage - 1) * 7 + 1}</span>–
        <span className="font-medium">{Math.min(currentPage * 7, totalPages * 7)}</span> of{" "}
        <span className="font-medium">{totalPages * 7}</span> pages
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className={`flex items-center justify-center w-8 h-8 rounded-md border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 transition ${
            currentPage === 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100 dark:hover:bg-white/10"
          }`}
        >
          <FaChevronLeft className="w-3 h-3" />
        </button>

        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => onPageChange(i + 1)}
            className={`w-8 h-8 rounded-md text-sm font-medium transition ${
              currentPage === i + 1
                ? "bg-indigo-600 text-white"
                : "border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`flex items-center justify-center w-8 h-8 rounded-md border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 transition ${
            currentPage === totalPages ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100 dark:hover:bg-white/10"
          }`}
        >
          <FaChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
