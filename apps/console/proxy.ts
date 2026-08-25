import { NextRequest, NextResponse } from "next/server";
import { PROTECTED_ROUTES, ROUTES } from "@/constants/routes";
import {
  SESSION_COOKIE_NAME,
  SESSION_RETURN_TO_PARAM,
} from "@/constants/session";

function isProtected(pathname: string) {
  return PROTECTED_ROUTES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function safeReturnTo(request: NextRequest) {
  const value = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  return value.startsWith("/") && !value.startsWith("//") ? value : ROUTES.platform;
}

export function proxy(request: NextRequest) {
  const session = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const pathname = request.nextUrl.pathname;

  if (pathname === ROUTES.login && session) {
    return NextResponse.redirect(new URL(ROUTES.platform, request.url));
  }

  if (!isProtected(pathname)) {
    return NextResponse.next();
  }

  if (!session) {
    const login = new URL(ROUTES.login, request.url);
    login.searchParams.set(SESSION_RETURN_TO_PARAM, safeReturnTo(request));
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/superadmin/:path*",
    "/clients/:path*",
    "/rewards/:path*",
    "/proofs/:path*",
    "/audit/:path*",
    "/compute/:path*",
    "/roles/:path*",
  ],
};
