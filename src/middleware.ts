import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const session = req.auth;
  const isLoggedIn = !!session;
  const role = session?.user?.role;
  const onboardingComplete = session?.user?.onboardingComplete;
  const path = req.nextUrl.pathname;

  // Public paths — always allow
  if (
    path.startsWith("/login") ||
    path.startsWith("/signup") ||
    path.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  // Public read-only pages (unauthenticated visitors can browse)
  if (path === "/" || path.startsWith("/events")) {
    return NextResponse.next();
  }

  // Require login for everything else
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // Attendee onboarding redirect
  if (role === "attendee" && !onboardingComplete && path !== "/onboarding") {
    return NextResponse.redirect(new URL("/onboarding", req.nextUrl));
  }

  // Admin-only
  if (path.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  // Club-only
  if (path.startsWith("/club") && role !== "club") {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
