"use client";

import React, { useEffect, useState } from "react";
import { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { createCategory, fetchCategories } from "@/store/slices/categoriesSlice";
import { fetchMyBrands } from "@/store/slices/ownBrandSlice";
import { useTranslations } from "next-intl";
import { toast } from "react-hot-toast";

interface GeneralInformationProps {
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  defaultValues?: any;
}

export default function GeneralInformation({
  register,
  setValue,
  watch,
  defaultValues,
}: GeneralInformationProps) {
  const t = useTranslations("GeneralInformation");

  const dispatch = useDispatch<AppDispatch>();

  const categories =
    useSelector((state: RootState) => state.categories.categories) ?? [];

  // ✅ switched to ownBrandSlice
  const brands = useSelector((state: RootState) => state.ownBrand.items) ?? [];

  const [tagInput, setTagInput] = useState<string>("");
  const [creatingElectronics, setCreatingElectronics] = useState(false);

  useEffect(() => {
    if (!defaultValues) return;

    setValue("name", defaultValues.name ?? "");
    setValue("description", defaultValues.description ?? "");
    setValue("category", defaultValues.category ?? "");
    setValue("brand", defaultValues.brand ?? "");
    setValue("gender", defaultValues.gender ?? "all");
    setValue("tags", defaultValues.tags ?? []);
    setValue("custom_fields", {
      material: defaultValues.custom_fields?.material ?? "",
      lining: defaultValues.custom_fields?.lining ?? "",
      care_instructions: defaultValues.custom_fields?.care_instructions ?? "",
      origin: defaultValues.custom_fields?.origin ?? "",
      warranty: defaultValues.custom_fields?.warranty ?? "",
      color_options: defaultValues.custom_fields?.color_options ?? "",
      model: defaultValues.custom_fields?.model ?? "",
      sku: defaultValues.custom_fields?.sku ?? "",
      voltage: defaultValues.custom_fields?.voltage ?? "",
      power_watt: defaultValues.custom_fields?.power_watt ?? "",
      battery_capacity: defaultValues.custom_fields?.battery_capacity ?? "",
      connectivity: defaultValues.custom_fields?.connectivity ?? "",
      screen_size: defaultValues.custom_fields?.screen_size ?? "",
      storage: defaultValues.custom_fields?.storage ?? "",
      ram: defaultValues.custom_fields?.ram ?? "",
      processor: defaultValues.custom_fields?.processor ?? "",
    });
    setValue("color", defaultValues.color ?? "");
    setValue("size", defaultValues.size ?? "");
    setValue("badge", defaultValues.badge ?? "");

    // ✅ keep tag input synced when editing
    setTagInput((defaultValues.tags ?? []).join(", "));
  }, [defaultValues, setValue]);

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTagInput(val);
    const tagArray = val
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    setValue("tags", tagArray);
  };

  useEffect(() => {
    if (!categories || categories.length === 0) dispatch(fetchCategories());
    if (!brands || brands.length === 0) dispatch(fetchMyBrands());
  }, [dispatch, categories, brands]);

  const renderCategories = (cats: any[], prefix = "") => {
    return cats.map((cat) => (
      <React.Fragment key={cat.id}>
        <option value={cat.id}>
          {prefix}
          {cat.name}
        </option>
        {cat.children && cat.children.length > 0 &&
          renderCategories(cat.children, `${prefix}— `)}
      </React.Fragment>
    ));
  };

  const findCategoryById = (cats: any[], id: number): any | null => {
    for (const cat of cats) {
      if (cat.id === id) return cat;
      if (Array.isArray(cat.children) && cat.children.length > 0) {
        const childMatch = findCategoryById(cat.children, id);
        if (childMatch) return childMatch;
      }
    }
    return null;
  };

  const findCategoryByName = (cats: any[], target: string): any | null => {
    const normalizedTarget = target.trim().toLowerCase();
    for (const cat of cats) {
      if ((cat?.name || "").trim().toLowerCase() === normalizedTarget) return cat;
      if (Array.isArray(cat?.children) && cat.children.length > 0) {
        const childMatch = findCategoryByName(cat.children, target);
        if (childMatch) return childMatch;
      }
    }
    return null;
  };

  const handleAddElectronicsCategory = async () => {
    const existing = findCategoryByName(categories, "Electronics");
    if (existing?.id) {
      setValue("category", String(existing.id));
      toast.success("Electronics category selected.");
      return;
    }

    try {
      setCreatingElectronics(true);
      const created = await dispatch(
        createCategory({
          name: "Electronics",
          description: "Electronic products",
          parent: null,
        })
      ).unwrap();
      setValue("category", String(created.id));
      toast.success("Electronics category created and selected.");
    } catch (error: any) {
      toast.error(
        typeof error === "string"
          ? error
          : error?.detail || "Failed to create Electronics category."
      );
    } finally {
      setCreatingElectronics(false);
    }
  };

  const selectedCategoryId = Number(watch("category"));
  const selectedCategory = findCategoryById(categories, selectedCategoryId);
  const normalizedCategoryKey = String(
    selectedCategory?.slug || selectedCategory?.name || ""
  )
    .trim()
    .toLowerCase();

  const isElectronics =
    normalizedCategoryKey.includes("electronic") ||
    normalizedCategoryKey.includes("electronics");
  const isClothing =
    normalizedCategoryKey.includes("cloth") ||
    normalizedCategoryKey.includes("clothes") ||
    normalizedCategoryKey.includes("cloths") ||
    normalizedCategoryKey.includes("clothing") ||
    normalizedCategoryKey.includes("apparel") ||
    normalizedCategoryKey.includes("fashion");

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* Product Name */}
      <div className="col-span-full">
        <label className="block text-sm font-medium text-gray-900 mb-1">
          {t("productName")} <span className="text-red-500">*</span>
        </label>
        <input
          {...register("name", { required: true })}
          type="text"
          placeholder={t("placeholders.name")}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400
                 focus:outline-none focus:ring-1 focus:ring-indigo-600 sm:text-sm"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          {t("category")} <span className="text-red-500">*</span>
        </label>
        <div className="mb-2">
          <button
            type="button"
            onClick={handleAddElectronicsCategory}
            disabled={creatingElectronics}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold text-white ${
              creatingElectronics
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#b16926] hover:bg-[#9f5d21]"
            }`}
          >
            {creatingElectronics ? "Creating..." : "Add Electronics"}
          </button>
        </div>
        <select
          {...register("category", { required: true })}
          className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10
           focus:outline-none focus:ring-1 focus:ring-indigo-600 sm:text-sm"
        >
          <option value="">{t("selectCategory")}</option>
          {renderCategories(categories)}
        </select>
      </div>

      {/* Brand */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          {t("brand")} <span className="text-red-500">*</span>
        </label>
        <select
          {...register("brand", { required: true })}
          className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10
                 focus:outline-none focus:ring-1 focus:ring-indigo-600 sm:text-sm"
        >
          <option value="">{t("selectBrand")}</option>
          {brands.map((b: any) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Category-driven fields */}
      {!isElectronics && (
        <>
          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              {t("gender")}
            </label>
            <select
              {...register("gender")}
              className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10
                   focus:outline-none focus:ring-1 focus:ring-indigo-600 sm:text-sm"
            >
              <option value="all">{t("genders.all")}</option>
              <option value="male">{t("genders.male")}</option>
              <option value="female">{t("genders.female")}</option>
              <option value="kids">{t("genders.kids")}</option>
            </select>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              {t("color")}
            </label>
            <input
              {...register("color")}
              type="text"
              placeholder={t("placeholders.color")}
              className="block w-full rounded-md border border-gray-300 px-3 py-2
                   focus:outline-none focus:ring-1 focus:ring-indigo-600 sm:text-sm"
            />
          </div>

          {/* Size */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              {t("size")}
            </label>
            <input
              {...register("size")}
              type="text"
              placeholder={t("placeholders.size")}
              className="block w-full rounded-md border border-gray-300 px-3 py-2
                   focus:outline-none focus:ring-1 focus:ring-indigo-600 sm:text-sm"
            />
          </div>

          {/* Badge */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              {t("badge")}
            </label>
            <input
              {...register("badge")}
              type="text"
              placeholder={t("placeholders.badge")}
              className="block w-full rounded-md border border-gray-300 px-3 py-2
                   focus:outline-none focus:ring-1 focus:ring-indigo-600 sm:text-sm"
            />
          </div>
        </>
      )}

      {(isClothing || (!isElectronics && !isClothing)) && (
        <div className="col-span-full sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {["material", "lining", "care_instructions", "origin"].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                {t(`customFields.${field}`)}
              </label>
              <input
                {...register(`custom_fields.${field}`)}
                type="text"
                placeholder={t(`placeholders.${field}`)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2
                       focus:outline-none focus:ring-1 focus:ring-indigo-600 sm:text-sm"
              />
            </div>
          ))}
        </div>
      )}

      {/* Description */}
      <div className="col-span-full">
        <label className="block text-sm font-medium text-gray-900 mb-1">
          {t("description")} <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register("description", { required: true })}
          rows={4}
          placeholder={t("placeholders.description")}
          className="block w-full rounded-md border border-gray-300 px-3 py-2
                 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-600 sm:text-sm"
        />
      </div>

      {/* Electronics Specs (shown only for Electronics category) */}
      {isElectronics && (
        <div className="col-span-full rounded-lg border border-[#b16926]/30 bg-[#fff7ef] p-4">
          <h3 className="text-sm font-semibold text-[#7a4a1f] mb-3">
            Electronics Specifications (Optional)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Warranty</label>
              <input
                {...register("custom_fields.warranty")}
                type="text"
                placeholder="e.g. 12 months"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-600 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Origin</label>
              <input
                {...register("custom_fields.origin")}
                type="text"
                placeholder="e.g. China"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-600 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Model</label>
              <input
                {...register("custom_fields.model")}
                type="text"
                placeholder="e.g. iPhone 13"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-600 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">SKU</label>
              <input
                {...register("custom_fields.sku")}
                type="text"
                placeholder="e.g. EL-IPH13-128"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-600 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Voltage</label>
              <input
                {...register("custom_fields.voltage")}
                type="text"
                placeholder="e.g. 220V"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-600 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Power (Watt)</label>
              <input
                {...register("custom_fields.power_watt")}
                type="text"
                placeholder="e.g. 65W"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-600 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Battery Capacity</label>
              <input
                {...register("custom_fields.battery_capacity")}
                type="text"
                placeholder="e.g. 5000mAh"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-600 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Connectivity</label>
              <input
                {...register("custom_fields.connectivity")}
                type="text"
                placeholder="e.g. WiFi, Bluetooth 5.2"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-600 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Screen Size</label>
              <input
                {...register("custom_fields.screen_size")}
                type="text"
                placeholder="e.g. 6.5 inch"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-600 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Storage</label>
              <input
                {...register("custom_fields.storage")}
                type="text"
                placeholder="e.g. 128GB"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-600 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">RAM</label>
              <input
                {...register("custom_fields.ram")}
                type="text"
                placeholder="e.g. 8GB"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-600 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Processor</label>
              <input
                {...register("custom_fields.processor")}
                type="text"
                placeholder="e.g. Snapdragon 8 Gen 2"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-600 sm:text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tags */}
      <div className="col-span-full">
        <label className="block text-sm font-medium text-gray-900 mb-1">
          {t("tags")}
        </label>
        <input
          type="text"
          placeholder={t("placeholders.tags")}
          value={tagInput}
          onChange={handleTagChange}
          className="block w-full rounded-md border border-gray-300 px-3 py-2
                 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-600 sm:text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">{t("tagsHint")}</p>
      </div>
    </div>
  );
}
