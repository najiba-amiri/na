"use client"

import dynamic from "next/dynamic";

function HeroSectionSkeleton() {
  return (
    <div className="w-full bg-white dark:bg-gray-900 overflow-hidden mt-5">
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
  );
}

function HomeProductsSkeleton() {
  return (
    <div className="bg-gray-50 dark:bg-gray-950 py-10 px-4">
      <div
        className="grid items-stretch gap-3 sm:gap-4 md:gap-5
                   grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5
                   px-2 sm:px-4 md:px-6 lg:px-8 py-2 animate-pulse"
      >
        {Array.from({ length: 10 }).map((_, index) => (
          <div
            key={`dynamic-product-skeleton-${index}`}
            className="h-full overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm"
          >
            <div className="aspect-[4/5] w-full bg-gray-200 dark:bg-gray-700" />
            <div className="p-4 md:p-5 space-y-3">
              <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="flex items-center justify-between">
                <div className="h-5 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-10 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
              <div className="hidden md:block h-10 w-full rounded-2xl bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const HeroSlider = dynamic(() => import("@/components/home/heroSlider"), {
  ssr: false,
  loading: () => <HeroSectionSkeleton />,
});

const HomeProduct = dynamic(() => import("@/components/products/homeProduct"), {
  ssr: false,
  loading: () => <HomeProductsSkeleton />,
});

export default function Home() {
  return (
   <main>
       <HeroSlider />
       <HomeProduct />
   </main>
  );
}
