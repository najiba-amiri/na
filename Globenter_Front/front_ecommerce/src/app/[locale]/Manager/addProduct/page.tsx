"use client";

import dynamic from "next/dynamic";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { createProduct } from "@/store/slices/productSlice";
import { fetchSellerStats } from "@/store/slices/sellerSlice";
import { toast } from "react-hot-toast";
import React, { useEffect, useMemo, useRef } from "react";
import { useTranslations } from "next-intl";

const GeneralInformation = dynamic(() => import("@/components/products/GeneralInformation"), { ssr: false });
const PriceStock = dynamic(() => import("@/components/products/PriceStock"), { ssr: false });
const Attributes = dynamic(() => import("@/components/products/Attributes"), { ssr: false });
const Images = dynamic(() => import("@/components/products/Images"), { ssr: false });
const ExtraSettings = dynamic(() => import("@/components/products/ExtraSettings"), { ssr: false });

const MAX_FREE_PRODUCTS = 3;

const AddProductPage: React.FC = () => {
  const t = useTranslations("AddProduct");
  const dispatch = useDispatch<AppDispatch>();

  const { loading } = useSelector((state: RootState) => state.products);

  // ✅ your store key for seller is Seller (capital S)
  const sellerState = useSelector((state: RootState) => (state as any).Seller);
  const sellerStats = sellerState?.stats ?? null;
  const sellerStatsLoading = sellerState?.loading ?? false;

  // show current count if available
  const currentCount = useMemo(() => {
    const apiCount = sellerStats?.product_count != null ? Number(sellerStats.product_count) : NaN;
    const arrCount = Array.isArray(sellerStats?.products) ? sellerStats.products.length : NaN;
    if (!Number.isNaN(apiCount)) return apiCount;
    if (!Number.isNaN(arrCount)) return arrCount;
    return 0;
  }, [sellerStats]);

  // fetch stats on load (if endpoint works for this user)
  useEffect(() => {
    dispatch(fetchSellerStats()).catch(() => {});
  }, [dispatch]);

  const methods = useForm<any>({
    defaultValues: {
      name: "",
      description: "",
      category: "",
      brand: "",
      tags: [],
      gender: "all",
      price: 0,
      wholesale_price: 0,
      min_order_qty: 1,
      stock: 0,
      unit: "piece",
      size: "",
      color: "",
      badge: "",
      main_image: null,
      variants: [] as any[],
      status: "active",
      featured: false,
      custom_fields: {
        material: "",
        lining: "",
        care_instructions: "",
        origin: "",
        warranty: "",
        color_options: "",
        model: "",
        sku: "",
        voltage: "",
        power_watt: "",
        battery_capacity: "",
        connectivity: "",
        screen_size: "",
        storage: "",
        ram: "",
        processor: "",
      },
      attributes: [],
      images: [],
    },
  });

  const imagesRef = useRef<any>(null);

  const onSubmit: SubmitHandler<any> = async (data) => {
    try {
      /**
       * ✅ MAIN RULE (TEMP FRONTEND):
       * - If this user can access /seller/stats/ (200 OK), treat them as Seller and enforce limit.
       * - If /seller/stats/ is forbidden or fails, we don't enforce (admin/unlimited).
       */
      let shouldEnforceLimit = false;
      let latestCount = 0;

      try {
        const latest = await dispatch(fetchSellerStats()).unwrap();

        shouldEnforceLimit = true; // ✅ seller confirmed
        const apiCount = latest?.product_count != null ? Number(latest.product_count) : NaN;
        const arrCount = Array.isArray(latest?.products) ? latest.products.length : NaN;

        if (!Number.isNaN(apiCount)) latestCount = apiCount;
        else if (!Number.isNaN(arrCount)) latestCount = arrCount;
        else latestCount = 0;

        if (latestCount >= MAX_FREE_PRODUCTS) {
          toast.error(
            `شما به سقف ${MAX_FREE_PRODUCTS} محصول رسیده‌اید. برای افزودن بیشتر، باید از طرف ادمین ارتقا داده شوید.`
          );
          return; // ✅ STOP HERE
        }
      } catch (e) {
        // ✅ cannot fetch seller stats => do not enforce (admin/unlimited)
        shouldEnforceLimit = false;
      }

      const formData = new FormData();

      [
        "name",
        "description",
        "price",
        "stock",
        "gender",
        "status",
        "unit",
        "size",
        "color",
        "badge",
      ].forEach((field) => {
        if (data[field] !== undefined && data[field] !== null) {
          formData.append(field, data[field]);
        }
      });

      formData.append("category", String(data.category || ""));
      formData.append("brand", String(data.brand || ""));
      formData.append("featured", String(data.featured || false));
      formData.append("min_order_qty", String(data.min_order_qty || 1));
      formData.append("wholesale_price", String(data.wholesale_price || "0"));

      if (Array.isArray(data.tags) && data.tags.length > 0) {
        data.tags.forEach((tag: string) => formData.append("tags", tag));
      }

      formData.append("custom_fields", JSON.stringify(data.custom_fields || {}));
      formData.append("attributes", JSON.stringify(data.attributes || []));
      formData.append("variants", JSON.stringify(data.variants || []));

      if (Array.isArray(data.images) && data.images.length > 0) {
        const mainImg = data.images.find(
          (img: any) => img.is_main && img.file instanceof File
        );
        if (mainImg?.file) formData.append("image", mainImg.file);

        data.images
          .filter((img: any) => !img.is_main && img.file instanceof File)
          .forEach((img: any) => formData.append("images", img.file));

        const imageMeta = data.images.map((img: any, idx: number) => ({
          alt_text: img.alt_text || "",
          is_main: img.is_main || false,
          order: idx + 1,
        }));
        formData.append("images_meta", JSON.stringify(imageMeta));
      }

      const res = await dispatch(createProduct(formData)).unwrap();

      toast.success(`✅ ${res.name} ${t("toastSuccess")}`);

      methods.reset();
      imagesRef.current?.resetImages();

      // refresh stats after create (only if seller stats endpoint works)
      if (shouldEnforceLimit) {
        dispatch(fetchSellerStats()).catch(() => {});
      }
    } catch (err: any) {
      toast.error(err?.response?.data || err.message || t("toastError"));
    }
  };

  const initialDefaultsRef = useRef(methods.getValues());
  const defaultValues = initialDefaultsRef.current;

  // UI disable: if stats are available and count >= 3, disable button
  const disableCreateButton =
    loading || (sellerStats && currentCount >= MAX_FREE_PRODUCTS);

  return (
    <div className="p-10 space-y-10">
      <h1 className="text-2xl font-semibold mb-6">{t("title")}</h1>

      {/* Banner only if sellerStats exists (meaning endpoint worked) */}
      {sellerStats && (
        <div className="rounded-lg border p-4 bg-yellow-50 text-yellow-900">
          <div className="font-semibold">محدودیت محصولات فروشنده</div>
          <div className="text-sm mt-1">
            شما تا <b>{MAX_FREE_PRODUCTS}</b> محصول می‌توانید اضافه کنید.
            <br />
            تعداد فعلی: <b>{sellerStatsLoading ? "..." : currentCount}</b> / {MAX_FREE_PRODUCTS}
          </div>

          {currentCount >= MAX_FREE_PRODUCTS && (
            <div className="text-sm mt-2">
              ✅ شما به سقف مجاز رسیده‌اید. برای افزایش سقف باید ادمین حساب شما را ارتقا دهد.
            </div>
          )}
        </div>
      )}

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-10">
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">{t("generalInfo")}</h2>
            <GeneralInformation
              register={methods.register}
              setValue={methods.setValue}
              watch={methods.watch}
              defaultValues={defaultValues}
            />
            <hr className="border-gray-300 mt-4" />
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">{t("priceStock")}</h2>
            <PriceStock
              register={methods.register}
              setValue={methods.setValue}
              watch={methods.watch}
              defaultValues={defaultValues}
            />
            <hr className="border-gray-300 mt-4" />
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">{t("attributes")}</h2>
            <Attributes
              register={methods.register}
              setValue={methods.setValue}
              watch={methods.watch}
              control={methods.control}
              defaultValues={defaultValues}
            />
            <hr className="border-gray-300 mt-4" />
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">{t("images")}</h2>
            <Images
              register={methods.register}
              setValue={methods.setValue}
              watch={methods.watch}
              defaultValues={defaultValues}
            />
            <hr className="border-gray-300 mt-4" />
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">{t("extraSettings")}</h2>
            <ExtraSettings register={methods.register} watch={methods.watch} />
            <hr className="border-gray-300 mt-4" />
          </section>

          <div className="flex justify-end mt-6">
            <button
              type="submit"
              disabled={disableCreateButton}
              className={`rounded-md bg-green-600 px-6 py-2 text-white font-semibold hover:bg-green-700 ${
                disableCreateButton ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {loading ? t("saving") : t("createButton")}
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default AddProductPage;
