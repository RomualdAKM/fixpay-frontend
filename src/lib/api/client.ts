import { API_BASE, CSRF_COOKIE_URL } from "@/lib/env";

import { ApiError, type ApiEnvelope } from "./ApiError";

/**
 * The single fetch wrapper for the FixPay API.
 *
 * Responsibilities:
 * - prefix every path with `${NEXT_PUBLIC_API_URL}/api`;
 * - always send `credentials: "include"`, `Accept: application/json` and
 *   `X-Requested-With: XMLHttpRequest` (the header Sanctum uses to detect an
 *   XHR/SPA request);
 * - drive the stateful CSRF handshake: before the first mutating request it
 *   GETs `/sanctum/csrf-cookie` to seed `XSRF-TOKEN`, then echoes the decoded
 *   cookie value in `X-XSRF-TOKEN`;
 * - unwrap the `{ message, data, errors }` envelope and return `data`;
 * - throw a typed `ApiError` on any non-2xx response;
 * - on 419 (expired/desynced CSRF) re-seed the cookie and retry exactly once;
 * - optionally attach an `X-Pin-Ticket` header for money operations / reveals.
 *
 * No token is ever read from or written to localStorage: auth rides entirely on
 * the httpOnly session cookie set by the backend.
 */

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const XSRF_COOKIE_NAME = "XSRF-TOKEN";
const XSRF_HEADER_NAME = "X-XSRF-TOKEN";

export interface ApiFetchOptions {
  method?: string;
  /**
   * Request body. A `FormData` is sent as-is (multipart, for KYC document
   * uploads) and the browser sets its own `Content-Type` boundary; any other
   * value is JSON-serialized and sent with `Content-Type: application/json`.
   */
  body?: unknown;
  /** Single-use PIN ticket, echoed as `X-Pin-Ticket` for money operations. */
  pinTicket?: string;
  /** Extra headers, merged last (wins over defaults). */
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

/** Read a cookie value from `document.cookie`, URL-decoded. Null on the server. */
export function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${name}=`;
  const segment = document.cookie
    .split("; ")
    .find((row) => row.startsWith(prefix));
  if (segment === undefined) return null;
  return decodeURIComponent(segment.slice(prefix.length));
}

/** GET the CSRF cookie endpoint so the browser stores a fresh `XSRF-TOKEN`. */
async function seedCsrfCookie(): Promise<void> {
  await fetch(CSRF_COOKIE_URL, {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
  });
}

/** Ensure an `XSRF-TOKEN` cookie exists before a mutating request. */
async function ensureCsrfCookie(): Promise<void> {
  if (readCookie(XSRF_COOKIE_NAME) === null) {
    await seedCsrfCookie();
  }
}

function buildHeaders(
  method: string,
  options: ApiFetchOptions,
  hasBody: boolean,
): Headers {
  const headers = new Headers({
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  });

  // A FormData body must NOT carry an explicit Content-Type: the browser
  // computes the multipart boundary itself. Only JSON bodies are typed here.
  if (hasBody && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (MUTATING_METHODS.has(method)) {
    const xsrf = readCookie(XSRF_COOKIE_NAME);
    if (xsrf !== null) headers.set(XSRF_HEADER_NAME, xsrf);
  }

  if (options.pinTicket !== undefined) {
    headers.set("X-Pin-Ticket", options.pinTicket);
  }

  if (options.headers) {
    for (const [key, value] of Object.entries(options.headers)) {
      headers.set(key, value);
    }
  }

  return headers;
}

async function parseEnvelope<T>(response: Response): Promise<ApiEnvelope<T>> {
  if (response.status === 204) {
    return { message: null, data: null, errors: null };
  }
  const text = await response.text();
  if (text === "") {
    return { message: null, data: null, errors: null };
  }
  try {
    return JSON.parse(text) as ApiEnvelope<T>;
  } catch {
    // A non-JSON body (HTML error page, gateway timeout) still needs a typed
    // failure rather than a raw SyntaxError bubbling out of the client.
    return {
      message: response.statusText || "Unexpected response",
      data: null,
      errors: null,
    };
  }
}

async function performRequest(
  path: string,
  method: string,
  options: ApiFetchOptions,
  ensureCsrf: boolean,
): Promise<Response> {
  const hasBody = options.body !== undefined;

  if (ensureCsrf && MUTATING_METHODS.has(method)) {
    await ensureCsrfCookie();
  }

  const body = hasBody
    ? options.body instanceof FormData
      ? options.body
      : JSON.stringify(options.body)
    : undefined;

  return fetch(`${API_BASE}${path}`, {
    method,
    credentials: "include",
    headers: buildHeaders(method, options, hasBody),
    body,
    signal: options.signal,
  });
}

/**
 * The unwrapped `data` plus the transport metadata a caller may need to branch
 * on. The HTTP `status` is the honest signal that separates a write applied
 * directly (200/201) from one parked behind maker-checker approval (202); the
 * `message` is the backend's machine key (e.g. `pricing_rule_change_requested`).
 */
export interface ApiResult<T> {
  data: T;
  status: number;
  message: string | null;
}

/**
 * Execute an API request and return the unwrapped `data` together with the HTTP
 * `status` and envelope `message`. Callers that only need the payload use
 * `apiFetch`; the admin write flow uses this to tell "applied" from "pending
 * approval" (202) without a second guess.
 */
export async function apiFetchResult<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<ApiResult<T>> {
  const method = (options.method ?? "GET").toUpperCase();

  let response = await performRequest(path, method, options, true);

  // 419 = CSRF token mismatch/expired. Force a fresh cookie and retry once.
  // The retry skips the ensure step since we just re-seeded unconditionally.
  if (response.status === 419) {
    await seedCsrfCookie();
    response = await performRequest(path, method, options, false);
  }

  const envelope = await parseEnvelope<T>(response);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      envelope.message ?? response.statusText ?? "Request failed",
      envelope.errors,
    );
  }

  return {
    data: envelope.data as T,
    status: response.status,
    message: envelope.message,
  };
}

/**
 * Execute an API request and return the unwrapped `data`.
 * `T` is the shape of the envelope's `data` field for this endpoint.
 */
export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  return (await apiFetchResult<T>(path, options)).data;
}
