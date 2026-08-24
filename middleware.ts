import { NextResponse, type NextRequest } from "next/server";
import {
  defaultLocale,
  isLocale,
  localeCookieName,
  locales,
  stripLocale,
} from "./lib/i18n/config";

/**
 * Locale routing middleware:
 * - URL keeps the locale prefix (`/en`, `/es`) so the language persists while
 *   navigating — pages are never duplicated.
 * - `/` and unprefixed legacy paths are redirected to the persisted locale
 *   (cookie) or, for first-time visitors, to English (the default language).
 * - A cookie is always written with the active locale for cross-session
 *   persistence and for future Admin/content logic.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The Admin panel is intentionally not locale-prefixed and lives outside
  // the storefront routing rules.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return NextResponse.next();
  }

  const firstSegment = pathname.split("/")[1];

  if (isLocale(firstSegment)) {
    const response = NextResponse.next();
    const cookieLocale = request.cookies.get(localeCookieName)?.value;
    if (cookieLocale !== firstSegment) {
      response.cookies.set(localeCookieName, firstSegment, {
        path: "/",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
      });
    }
    return response;
  }

  const cookieLocale = request.cookies.get(localeCookieName)?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;

  const url = request.nextUrl.clone();
  const rest = stripLocale(pathname);
  url.pathname = `/${locale}${rest === "/" ? "" : rest}`;

  const response = NextResponse.redirect(url);
  response.cookies.set(localeCookieName, locale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}

export const config = {
  // Match everything except Next internals and static files (which carry dots).
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
  // Middleware runs on Vercel's Edge runtime by default; force it explicitly so
  // Vercel bundles it correctly (instead of as an ESM-loaded Node function).
  runtime: "edge",
};
