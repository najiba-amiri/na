"use client";

import React, { useEffect } from "react";
import { UseFormRegister, UseFormSetValue, UseFormWatch, Control, useFieldArray } from "react-hook-form";
import { FaPlus, FaTrash } from "react-icons/fa";
import { useTranslations } from "next-intl";

interface AttributesProps {
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  control: Control<any>;
  defaultValues?: any;
}

export default function Attributes({
  register,
  setValue,
  watch,
  control,
  defaultValues,
}: AttributesProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "attributes",
  });

  const t = useTranslations("GeneralInformation.Attributes");

  // Reset values when defaultValues change
  useEffect(() => {
    if (defaultValues?.attributes) {
      setValue("attributes", defaultValues.attributes);
    }
  }, [defaultValues, setValue]);

  return (
    <div className="space-y-6 border-t border-gray-200 pt-6">
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center bg-gray-50 p-4 rounded-lg shadow-sm"
        >
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">{t("name")}</label>
            <input
              {...register(`attributes.${index}.name`)}
              type="text"
              placeholder={t("placeholders.name")}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 focus:outline-indigo-600 focus:ring-1 focus:ring-indigo-600 sm:text-sm"
            />
          </div>

          {/* Value */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">{t("value")}</label>
            <input
              {...register(`attributes.${index}.value`)}
              type="text"
              placeholder={t("placeholders.value")}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 focus:outline-indigo-600 focus:ring-1 focus:ring-indigo-600 sm:text-sm"
            />
          </div>

          {/* Attribute Type */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">{t("type")}</label>
            <select
              {...register(`attributes.${index}.attribute_type`)}
              className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 focus:outline-indigo-600 focus:ring-1 focus:ring-indigo-600 sm:text-sm"
            >
              <option value="string">{t("types.string")}</option>
              <option value="number">{t("types.number")}</option>
              <option value="boolean">{t("types.boolean")}</option>
            </select>
          </div>

          {/* Remove */}
          <div className="flex justify-end pt-6 sm:pt-8">
            <button
              type="button"
              onClick={() => remove(index)}
              className="text-red-600 hover:text-red-800 text-sm flex items-center gap-2"
            >
              <FaTrash /> {t("remove")}
            </button>
          </div>
        </div>
      ))}

      {/* Add New Attribute */}
      <button
        type="button"
        onClick={() => append({ name: "", value: "", attribute_type: "string" })}
        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
      >
        <FaPlus /> {t("addAttribute")}
      </button>
    </div>
  );
}
