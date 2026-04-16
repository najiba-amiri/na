"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // Map slugs to human-friendly names
  const nameMap: Record<string, string> = {
    products: "Products",
    camera: "Camera",
    "ut-enim-ad-minima": "Ut enim ad minima",
  };

  return (
    <nav className="text-sm flex items-center space-x-2">
      {/* Home link */}
      <Link href="/" className="text-white hover:underline">
        Home
      </Link>

      {segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/");
        const isLast = index === segments.length - 1;
        const label = nameMap[segment] || decodeURIComponent(segment);

        return (
          <div key={index} className="flex items-center space-x-2">
            {/* Separator */}
            <span className="text-gray-400">{">"}</span>

            {/* Link or final text */}
            {isLast ? (
              <span className="text-red-500">{label}</span>
            ) : (
              <Link href={href} className=" hover:underline">
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
