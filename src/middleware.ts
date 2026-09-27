import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

const ADMIN_EMAIL = "muhammaddanyal4949@gmail.com";

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isProtectedRoute = ["/dashboard", "/packages", "/deposit", "/tasks", "/wallet", "/withdrawal", "/profile"].some((route) => pathname.startsWith(route)) || isAdminRoute;
  const isAuthRoute = pathname === "/login" || pathname === "/signup";

  if (isAdminRoute) {
    if (!user) return NextResponse.redirect(new URL("/login", request.url));
    if (user.email?.toLowerCase() !== ADMIN_EMAIL) return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isProtectedRoute && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && user) return NextResponse.redirect(new URL("/dashboard", request.url));
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
