"use client";

import { useRouter, usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { FaGlobeAmericas } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";

const Lang: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();
    const currentLocale = useLocale();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const changeLanguage = (locale: string) => {
        if (locale === currentLocale) return;
        router.replace(pathname, { locale });
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const languages = [
        { code: "en", label: "🇺🇸 English" },
        { code: "fa", label: "🇮🇷 Persian" },
        { code: "ps", label: "🇦🇫 Pashto" },
    ];
    const isRtl = currentLocale === "fa" || currentLocale === "ps";

    return (
<div className="relative inline-block text-left z-[260]" ref={dropdownRef}>
    <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-white text-sm font-medium rounded-full shadow transition-all duration-200"
    >
        <FaGlobeAmericas className="text-lg" />
        <span className="capitalize">{currentLocale}</span>
    </button>

   {isOpen && (
    <div
        className={`absolute mt-2 w-44 rounded-xl bg-white shadow-lg overflow-hidden z-[9999] ${
            isRtl ? "right-0 origin-top-right" : "left-0 origin-top-left"
        }`}
    >
        {languages.map(({ code, label }) => (
            <button
                key={code}
                onClick={() => {
                    changeLanguage(code);
                    setIsOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-orange-50 transition-colors duration-150 ${
                    code === currentLocale
                        ? "font-semibold bg-orange-100 text-orange-700"
                        : "text-gray-700"
                } ${isRtl ? "text-right justify-end" : "text-left justify-start"}`}
            >
                {label}
            </button>
        ))}
    </div>
)}

</div>

    );
};

export default Lang;
