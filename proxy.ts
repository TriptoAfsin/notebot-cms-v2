import { NextRequest, NextResponse } from "next/server";

/**
 * Routing convenience only — NOT an authorization boundary.
 *
 * This checks that a session cookie is *present*; it does not validate it. That is deliberate:
 * validating means a DB round-trip on every request, and better-auth's session lookup is not
 * edge-safe. Anyone can forge the cookie's presence, and server actions are POST endpoints that
 * do not pass through here at all.
 *
 * Real enforcement lives in the actions via `requireUser()` from lib/session.ts. If you add a
 * mutating action, guard it there — do not assume this file protects it.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't need auth.
  //
  // /api/v1 is listed because it authenticates itself with an x-api-key header. The matcher
  // below catches every path, so without this the ingest endpoint would be 302'd to /login and
  // a machine caller would receive an HTML login page with a 200.
  const publicRoutes = ["/login", "/api/auth", "/api/v1", "/setup", "/submit", "/invite"];
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check for session cookie (secure prefix is added when using HTTPS)
  const sessionCookie =
    request.cookies.get("__Secure-better-auth.session_token") ||
    request.cookies.get("better-auth.session_token");
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|.*\\.ico$).*)",
  ],
};
