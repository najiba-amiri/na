import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import LayoutWrapper from "@/components/layoutWrapper";
import "./globals.css";

// DASHBOARD / TEMPLATE CONTEXT
import { SidebarProvider } from "@/Dashboard/context/SidebarContext";
import { ThemeProvider } from "@/Dashboard/context/ThemeContext";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Globe Enter",
  description: "B to B Marketplace for Digital Products",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isRtl = locale === "fa" || locale === "ps";

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale} dir={isRtl ? "rtl" : "ltr"}>
      <body
        className={`${outfit.className} antialiased dark:bg-gray-900`}
      >
        <NextIntlClientProvider locale={locale}>
          <ThemeProvider>
            <SidebarProvider>
              <LayoutWrapper locale={locale}>{children}</LayoutWrapper>
            </SidebarProvider>
          </ThemeProvider>

          {/* Global notifications */}
          <Toaster position="top-center" reverseOrder={false} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
