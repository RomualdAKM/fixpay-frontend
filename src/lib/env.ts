/**
 * Typed access to the public runtime configuration.
 *
 * Only `NEXT_PUBLIC_*` variables are readable in the browser, and Next inlines
 * them at build time, so they must be referenced as full static property
 * accesses (`process.env.NEXT_PUBLIC_API_URL`) rather than through a dynamic
 * key — a computed access would not be replaced and would read `undefined`.
 */

/** Strip a single trailing slash so callers can always append `/api/...`. */
function normalizeBaseUrl(raw: string | undefined): string {
  const value = (raw ?? "").trim() || "http://localhost:8000";
  return value.replace(/\/+$/, "");
}

/** Base URL of the Laravel API, e.g. `http://localhost:8000` (no trailing /). */
export const API_URL = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL);

/** Prefix for all application routes: `${API_URL}/api`. */
export const API_BASE = `${API_URL}/api`;

/** Endpoint that seeds the `XSRF-TOKEN` cookie for stateful SPA auth. */
export const CSRF_COOKIE_URL = `${API_URL}/sanctum/csrf-cookie`;

/**
 * Name of the Laravel session cookie (middleware-only coarse check). Falls back
 * to the Laravel default derived from `APP_NAME=Laravel`.
 */
export const SESSION_COOKIE_NAME =
  (process.env.NEXT_PUBLIC_SESSION_COOKIE ?? "").trim() || "laravel_session";
