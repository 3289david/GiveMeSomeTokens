import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  // Middleware runs on Edge runtime where Prisma can't connect to DB.
  // Check cookie presence only; real session validation happens in Node.js
  // page/API handlers via `await auth()`.
  const sessionToken =
    req.cookies.get("__Secure-next-auth.session-token")?.value ||
    req.cookies.get("next-auth.session-token")?.value;
  const isLoggedIn = !!sessionToken;

  const { pathname } = req.nextUrl;
  const isAuthPage = pathname.startsWith("/login");
  const isProtected =
    pathname.startsWith("/dashboard") || pathname.startsWith("/wallet");

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
