import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  output: "standalone",

  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },

  images: {
    // Allow Next Image optimizer to fetch localhost media in development.
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "8000", pathname: "/media/**" },
      { protocol: "http", hostname: "localhost", port: "8000", pathname: "/images/**" },
      { protocol: "https", hostname: "globenter.com", pathname: "/media/**" },
      { protocol: "https", hostname: "globenter.com", pathname: "/images/**" },
    ],
    formats: ["image/avif", "image/webp"],
  },

  reactStrictMode: true,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          { key: "Cross-Origin-Embedder-Policy", value: "unsafe-none" },
        ],
      },
    ];
  },

  webpack(config: any) {
    // Modify the default file loader to skip SVG
    const fileLoaderRule = config.module.rules.find((rule: any) => rule.test?.test?.(".svg"));
    if (fileLoaderRule) {
      fileLoaderRule.exclude = /\.svg$/i;
    }

    // Add @svgr/webpack for SVG imports
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
