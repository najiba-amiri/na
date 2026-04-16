import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // ✅ Do NOT let next-intl touch finance routes
  if (
    pathname.startsWith("/finance") ||
    pathname.startsWith("/en/finance") ||
    pathname.startsWith("/fa/finance")
  ) {
    return NextResponse.next();
  }

  // ✅ Also skip any wallet routes if you have them like /wallet/...
  if (
    pathname.startsWith("/wallet") ||
    pathname.startsWith("/en/wallet") ||
    pathname.startsWith("/fa/wallet")
  ) {
    return NextResponse.next();
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
