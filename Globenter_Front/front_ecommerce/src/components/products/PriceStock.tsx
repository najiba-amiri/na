"use client";

import React, { useEffect } from "react";
import {
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { useTranslations } from "next-intl";

interface PriceStockProps {
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  defaultValues?: any;
}

export default function PriceStock({
  register,
  setValue,
  watch,
  defaultValues,
}: PriceStockProps) {
const t = useTranslations("GeneralInformation.PriceStock");


  // Reset values if defaultValues change safely
  useEffect(() => {
    if (!defaultValues) return;

    const fields = ["price", "wholesale_price", "min_order_qty", "stock", "unit"];
    fields.forEach((key) => {
      const currentValue = watch(key);
      const defaultValue =
        key === "unit"
          ? defaultValues[key] ?? "piece"
          : Number(defaultValues[key] ?? 0);
      if (currentValue !== defaultValue) {
        setValue(key, defaultValue);
      }
    });
  }, [defaultValues, setValue, watch]);

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {/* Price */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          {t("price")} <span className="text-red-500">*</span>
        </label>
        <input
          {...register("price", { required: t("errors.price") })}
          type="number"
          step="0.01"
          min={0}
          placeholder={t("placeholders.price")}
          aria-label={t("price")}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 
                 focus:outline-indigo-600 focus:ring-1 focus:ring-indigo-600 sm:text-sm"
        />
      </div>

      {/* Wholesale Price */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          {t("wholesalePrice")}
        </label>
        <input
          {...register("wholesale_price")}
          type="number"
          step="0.01"
          min={0}
          placeholder={t("placeholders.wholesalePrice")}
          aria-label={t("wholesalePrice")}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 
                 focus:outline-indigo-600 focus:ring-1 focus:ring-indigo-600 sm:text-sm"
        />
      </div>

      {/* Min Order Quantity */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          {t("minOrderQty")} <span className="text-red-500">*</span>
        </label>
        <input
          {...register("min_order_qty", {
            required: t("errors.minOrderQty"),
          })}
          type="number"
          min={1}
          placeholder={t("placeholders.minOrderQty")}
          aria-label={t("minOrderQty")}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 
                 focus:outline-indigo-600 focus:ring-1 focus:ring-indigo-600 sm:text-sm"
        />
      </div>

      {/* Stock */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          {t("stock")} <span className="text-red-500">*</span>
        </label>
        <input
          {...register("stock", { required: t("errors.stock") })}
          type="number"
          min={0}
          placeholder={t("placeholders.stock")}
          aria-label={t("stock")}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 
                 focus:outline-indigo-600 focus:ring-1 focus:ring-indigo-600 sm:text-sm"
        />
      </div>

      {/* Unit */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          {t("unit")} <span className="text-red-500">*</span>
        </label>
        <input
          {...register("unit", { required: t("errors.unit") })}
          type="text"
          placeholder={t("placeholders.unit")}
          aria-label={t("unit")}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 
                 focus:outline-indigo-600 focus:ring-1 focus:ring-indigo-600 sm:text-sm"
        />
      </div>
    </div>
  );
}
