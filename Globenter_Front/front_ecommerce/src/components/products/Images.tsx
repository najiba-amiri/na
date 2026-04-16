"use client";

import React, {
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { FaTrash, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { useTranslations } from "next-intl";

interface ImageItem {
  file?: File;
  url?: string;
  alt_text: string;
  is_main: boolean;
  order: number;
}

interface ImagesProps {
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  defaultValues?: any;
}

// ForwardRef so parent can reset images
const Images = forwardRef(
  ({ register, setValue, watch, defaultValues }: ImagesProps, ref) => {
    const t = useTranslations("Images");
    const [images, setImages] = useState<ImageItem[]>(defaultValues?.images || []);

    // Expose reset function to parent
    useImperativeHandle(ref, () => ({
      resetImages: () => setImages([]),
    }));

    // Sync with form
    useEffect(() => {
      setValue("images", images);
    }, [images, setValue]);

    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return;

      const newFiles: ImageItem[] = Array.from(e.target.files).map((file, idx) => ({
        file,
        alt_text: "",
        is_main: images.length === 0 && idx === 0,
        order: images.length + idx + 1,
      }));

      setImages((prev) => [...prev, ...newFiles]);
    };

    // Alt text update
    const handleAltTextChange = (index: number, value: string) => {
      const updated = [...images];
      updated[index].alt_text = value;
      setImages(updated);
    };

    // Set main image
    const handleSetMain = (index: number) => {
      const updated = images.map((img, i) => ({ ...img, is_main: i === index }));
      setImages(updated);
    };

    // Delete image
    const handleDelete = (index: number) => {
      let updated = images.filter((_, i) => i !== index);
      updated = updated.map((img, idx) => ({ ...img, order: idx + 1 }));
      if (!updated.some((img) => img.is_main) && updated.length > 0) {
        updated[0].is_main = true;
      }
      setImages(updated);
    };

    // Reorder
    const moveUp = (index: number) => {
      if (index === 0) return;
      const updated = [...images];
      [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
      updated.forEach((img, idx) => (img.order = idx + 1));
      setImages(updated);
    };

    const moveDown = (index: number) => {
      if (index === images.length - 1) return;
      const updated = [...images];
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
      updated.forEach((img, idx) => (img.order = idx + 1));
      setImages(updated);
    };

    return (
      <div className="space-y-4">
        {/* Upload */}
        <label className="block w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer text-center hover:border-blue-500 hover:bg-gray-50 transition">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <span className="text-gray-500">{t("uploadLabel")}</span>
        </label>

        {/* Info */}
        <p className="text-xs text-gray-500 mb-2">{t("infoText")}</p>

        {/* Images Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((img, idx) => (
            <div
              key={idx}
              className={`border rounded-md overflow-hidden relative ${
                img.is_main ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-300"
              }`}
            >
              {/* Preview */}
              <img
                src={img.file ? URL.createObjectURL(img.file) : img.url}
                alt={img.alt_text || t("altTextPlaceholder")}
                className="w-full h-48 object-cover"
              />

              {/* Overlay Actions */}
              <div className="absolute top-2 right-2 flex flex-col space-y-1">
                <button
                  type="button"
                  onClick={() => handleDelete(idx)}
                  className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                  title={t("deleteTooltip")}
                >
                  <FaTrash size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => moveUp(idx)}
                  className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                  title={t("moveUpTooltip")}
                >
                  <FaArrowUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => moveDown(idx)}
                  className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                  title={t("moveDownTooltip")}
                >
                  <FaArrowDown size={14} />
                </button>
              </div>

              {/* Alt text */}
              <input
                type="text"
                value={img.alt_text}
                onChange={(e) => handleAltTextChange(idx, e.target.value)}
                placeholder={t("altTextPlaceholder")}
                className="block w-full px-2 py-1 border-t border-gray-300 text-sm"
              />

              {/* Main selector */}
              <div className="absolute bottom-2 left-2 flex items-center space-x-2 bg-white bg-opacity-70 px-2 py-1 rounded">
                <input
                  type="radio"
                  checked={img.is_main}
                  onChange={() => handleSetMain(idx)}
                  className="accent-blue-500"
                />
                <label className="text-xs text-gray-700">{t("mainLabel")}</label>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

Images.displayName = "Images";
export default Images;
