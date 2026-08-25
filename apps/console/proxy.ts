import { NextRequest, NextResponse } from "next/server";

const protectedPrefixes = ["/superadmin", "/clients", "/rewards", "/proofs", "/audit", "/compute", "/roles"];

export function proxy(request: NextRequest) {
  if (!protectedPrefixes.some((prefix) => request.nextUrl.pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  if (!request.cookies.get("powerchain_session")?.value) {
    const login = new URL("/login", request.url);
    login.searchParams.set("returnTo", request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/superadmin/:path*", "/clients/:path*", "/rewards/:path*", "/proofs/:path*", "/audit/:path*", "/compute/:path*", "/roles/:path*"],
};
