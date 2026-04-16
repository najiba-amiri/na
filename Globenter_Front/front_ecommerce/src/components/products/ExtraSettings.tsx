"use client";

import React from "react";
import { UseFormRegister, UseFormWatch } from "react-hook-form";
import { useTranslations } from "next-intl";

interface ExtraSettingsProps {
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
}

export default function ExtraSettings({ register, watch }: ExtraSettingsProps) {
  const t = useTranslations("ExtraSettings");
  const isFeatured = watch("featured");

  return (
    <div className="space-y-6 border-t border-gray-200 pt-6">

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          {t("statusLabel")}
        </label>
        <select
          {...register("status")}
          className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 focus:outline-indigo-600 focus:ring-1 focus:ring-indigo-600 sm:text-sm"
        >
          <option value="active">{t("statusActive")}</option>
          <option value="inactive">{t("statusInactive")}</option>
        </select>
      </div>

      {/* Featured */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          {...register("featured")}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label className="text-sm font-medium text-gray-900">{t("featuredLabel")}</label>
      </div>

      {/* Warranty */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          {t("warrantyLabel")}
        </label>
        <input
          type="text"
          placeholder={t("warrantyPlaceholder")}
          {...register("custom_fields.warranty")}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 focus:outline-indigo-600 focus:ring-1 focus:ring-indigo-600 sm:text-sm"
        />
      </div>

      {/* Color Options */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          {t("colorOptionsLabel")}
        </label>
        <input
          type="text"
          placeholder={t("colorOptionsPlaceholder")}
          {...register("custom_fields.color_options")}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 focus:outline-indigo-600 focus:ring-1 focus:ring-indigo-600 sm:text-sm"
        />
      </div>
    </div>
  );
}
