import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import React from "react";
import { routing } from "@/i18n/routing";
import ManagerProviders from "./ManagerProviders";

export interface ManagerLayoutProps {
  children: React.ReactNode;
  // 👇 Match Next's LayoutProps: params is Promise<{ locale: string }>
  params: Promise<{
    locale: string;
  }>;
}

export default async function ManagerLayout({ children, params }: ManagerLayoutProps) {
  // ✅ Unwrap params (Next 16 dynamic API is a Promise)
  const { locale } = await params;

  // ✅ Runtime check: make sure it's one of your supported locales
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    throw new Error(`Locale '${locale}' not found`);
  }

  // ✅ Delegate client-only stuff to client component
  return <ManagerProviders locale={locale}>{children}</ManagerProviders>;
}
