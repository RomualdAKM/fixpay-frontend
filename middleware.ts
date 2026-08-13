import { NextResponse, type NextRequest } from "next/server";

/**
 * Coarse, cookie-based redirect between the auth screens and the app.
 *
 * The authoritative guard is client-side (`src/lib/auth/RouteGuard`), driven by
 * GET /api/me. This middleware is only a first pass:
 *
 * - If the Laravel session cookie is present and the user lands on an auth
 *   screen, bounce them into the app. This direction is always safe.
 * - The reverse (no cookie on a protected route → /login) is gated behind
 *   `NEXT_PUBLIC_MIDDLEWARE_GUARD=strict`. In a split-origin dev setup
 *   (front :3000 / API :8000) the session cookie is scoped to the API origin
 *   and is NEVER visible here, so eagerly redirecting would lock authenticated
 *   users out. Enable strict mode only when the front and API share an origin
 *   (same domain or a reverse proxy).
 */

const SESSION_COOKIE_NAME =
  (process.env.NEXT_PUBLIC_SESSION_COOKIE ?? "").trim() || "laravel_session";

const STRICT = process.env.NEXT_PUBLIC_MIDDLEWARE_GUARD === "strict";

/** Routes reachable without a session. */
const PUBLIC_PATHS = ["/onboarding", "/login", "/register", "/verify-email"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE_NAME);
  const onPublicPath = isPublicPath(pathname);

  if (hasSession && onPublicPath && pathname !== "/onboarding") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (STRICT && !hasSession && !onPublicPath) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
