"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useMemo, useEffect, useState } from "react";
import Slider from "react-slick";
import Image from "next/image";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { getClientLocale, resolveLocalizedField } from "@/lib/productI18n";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function CustomArrowLeft(props: any) {
  const { onClick } = props;
  return (
    <button
      className="hidden md:absolute top-1/2 left-2 md:left-4 transform -translate-y-1/2 bg-gray-50 dark:bg-gray-700 p-2 md:p-3 rounded-full shadow-md hover:bg-gray-200 dark:hover:bg-gray-600"
      onClick={onClick}
    >
      <FaChevronLeft className="text-gray-700 dark:text-gray-200 text-sm md:text-base" />
    </button>
  );
}

function CustomArrowRight(props: any) {
  const { onClick } = props;
  return (
    <button
      className="hidden md:absolute top-1/2 right-2 md:right-4 transform -translate-y-1/2 bg-gray-50 dark:bg-gray-700 p-2 md:p-3 rounded-full shadow-md hover:bg-gray-200 dark:hover:bg-gray-600"
      onClick={onClick}
    >
      <FaChevronRight className="text-gray-700 dark:text-gray-200 text-sm md:text-base" />
    </button>
  );
}

const settings = {
  dots: true,
  infinite: true,
  autoplay: true,
  autoplaySpeed: 3500,
  speed: 1500,
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: true,
  lazyLoad: "ondemand" as const,
  prevArrow: <CustomArrowLeft />,
  nextArrow: <CustomArrowRight />,
};

const HeroSlider = () => {
  const { products, loading, hasFetched, error } = useSelector(
    (state: RootState) => state.products
  );
  const [isFirstHeroImageLoaded, setIsFirstHeroImageLoaded] = useState(false);
  const locale = getClientLocale();

  const randomProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 8);
  }, [products]);

  useEffect(() => {
    setIsFirstHeroImageLoaded(false);
  }, [randomProducts]);

  const firstSlideHasImage = Boolean(randomProducts[0]?.image);

  const shouldShowSkeleton =
    (!hasFetched && randomProducts.length === 0) ||
    loading ||
    (randomProducts.length > 0 && firstSlideHasImage && !isFirstHeroImageLoaded);

  if (hasFetched && !loading && randomProducts.length === 0)
    return <div className="text-center py-10 dark:text-gray-400">No products to show</div>;

  return (
    <div className="relative mt-5">
      {shouldShowSkeleton && (
        <div className="w-full bg-white dark:bg-gray-900 overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between h-full px-4 md:px-32 py-6 md:py-12 gap-4 md:gap-12 animate-pulse">
            <div className="w-full md:w-[40%] space-y-4">
              <div className="h-10 md:h-16 w-11/12 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-10 md:h-16 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-5 md:h-6 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="flex gap-3 pt-2">
                <div className="h-10 w-32 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="h-10 w-32 rounded-full bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
            <div className="w-full md:w-[50%] mt-4 md:mt-0">
              <div className="w-full h-[250px] md:h-[400px] lg:h-[500px] rounded-xl bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        </div>
      )}

      <div
        className={`transition-opacity duration-300 ${
          shouldShowSkeleton ? "opacity-0 pointer-events-none absolute inset-0" : "opacity-100"
        }`}
      >
        <Slider {...settings}>
          {randomProducts.map((product, index) => {
            const displayName = resolveLocalizedField(
              product.name,
              (product as any).name_i18n,
              locale
            );
            const displayDescription = resolveLocalizedField(
              product.description,
              (product as any).description_i18n,
              locale
            );

            return (
              <div
              key={product.id}
              className="relative w-full bg-white dark:bg-gray-900 overflow-hidden"
            >
              <div className="flex flex-col md:flex-row items-center justify-between h-full px-4 md:px-32 py-6 md:py-12 gap-4 md:gap-12">
                <div className="w-full md:w-[40%] text-center md:text-left">
                  <h2 className="text-2xl md:text-6xl font-extrabold leading-snug text-[#b16926]">
                    {displayName}
                  </h2>
                  <p className="font-semibold text-md md:text-xl mt-2 md:mt-4 uppercase text-[#f1a013]">
                    {displayDescription || "No description"}
                  </p>
                </div>

                <div className="w-full md:w-[50%] mt-4 md:mt-0 flex justify-center">
                  {product.image ? (
                    <div className="relative w-full h-[250px] md:h-[400px] lg:h-[500px]">
                      <Image
                        src={product.image}
                        alt={displayName || "Product image"}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority={index === 0}
                        onLoadingComplete={() => {
                          if (index === 0) setIsFirstHeroImageLoaded(true);
                        }}
                        onError={() => {
                          if (index === 0) setIsFirstHeroImageLoaded(true);
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-[250px] md:h-[400px] lg:h-[500px] bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 text-sm md:text-base">
                      No image available
                    </div>
                  )}
                </div>
              </div>
            </div>
            );
          })}
        </Slider>
      </div>
    </div>
  );
};

export default HeroSlider;
