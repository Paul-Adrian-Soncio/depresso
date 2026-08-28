import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE_NAME, isValidSessionToken } from "@/lib/admin-session";

// Proxy (formerly "middleware") always runs on the Node.js runtime as of
// Next.js 16, which is why this can use node:crypto in
// lib/admin-session.ts without an explicit runtime opt-in.
export const config = {
  matcher: ["/admin/:path*"],
};

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  if (!isValidSessionToken(token)) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
