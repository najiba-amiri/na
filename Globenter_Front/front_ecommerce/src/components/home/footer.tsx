"use client";

import {
  FaPhoneAlt,
  FaEnvelope,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaWhatsapp,
} from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="bg-slate-900 dark:bg-gray-950 text-white mt-2 dark:border-t dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Logo & Description */}
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-2 mb-4">
            <Image
              src="/assets/images/logo/Globenter-05.png"
              alt={t("Glob Enter Logo")}
              width={50}
              height={50}
              className="object-contain"
            />
            <span className="text-xl font-bold text-[#f1a013]">{t("Glob Enter")}</span>
          </div>
          <p className="text-sm mb-4">{t("Description")}</p>
          <p className="flex items-center gap-2 mb-2">
            <FaPhoneAlt className="text-[#f1a013]" /> +93 773386211{" "}
            <FaWhatsapp className="text-[#25D366]" />
          </p>
          <p className="flex items-center gap-2">
            <FaEnvelope className="text-[#f1a013]" /> info@globenter.com
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-[#f1a013] font-semibold mb-4">{t("Quick Links")}</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/" className="hover:text-[#f1a013]">{t("Home")}</Link>
            </li>
            <li>
              <Link href="/products" className="hover:text-[#f1a013]">{t("Products")}</Link>
            </li>
            <li>
              <Link href="/support" className="hover:text-[#f1a013]">{t("Support")}</Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-[#f1a013]">{t("Blog")}</Link>
            </li>
            <li>
              <Link
                href="/policy"
                className="inline-flex items-center rounded-full border border-[#f1a013]/40 px-3 py-1.5 text-[#f1a013] hover:bg-[#f1a013] hover:text-slate-900 transition-colors"
              >
                {t("Policies")}
              </Link>
            </li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-[#f1a013] font-semibold mb-4">{t("Categories")}</h3>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:text-[#f1a013]">{t("Makeup & Beauty")}</a>
            </li>
            <li>
              <a href="#" className="hover:text-[#f1a013]">{t("Shoes")}</a>
            </li>
            <li>
              <a href="#" className="hover:text-[#f1a013]">{t("Clothing")}</a>
            </li>
             
          </ul>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="border-t border-[#c2d388]/30 py-4">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>
            © 2025 <span className="text-[#f1a013]">{t("Glob Enter")}</span> Inc. {t("All Rights Reserved")}
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a
              href="https://www.facebook.com/share/1Fnp9X5ykt/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#f1a013]"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#f1a013]"
            >
              <FaTwitter />
            </a>
            <a
              href="https://www.instagram.com/globenter/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#f1a013]"
            >
              <FaInstagram />
            </a>
            <a
              href="https://www.linkedin.com/company/globenter/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#f1a013]"
            >
              <FaLinkedin />
            </a>
            <a
              href="https://www.youtube.com/@Globenter"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#f1a013]"
            >
              <FaYoutube />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
