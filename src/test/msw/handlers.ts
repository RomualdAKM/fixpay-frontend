import { HttpResponse, http } from "msw";

import type { Money, User } from "@/lib/api/types";

/**
 * MSW handlers mirroring the Laravel API, faithful to the
 * `{ message, data, errors }` envelope (App\Support\ApiResponse). The base URL
 * matches `src/lib/env` defaults (http://localhost:8000).
 */

const BASE = "http://localhost:8000";

/** Build the success envelope. */
export function envelope<T>(data: T, message: string | null = null) {
  return { message, data, errors: null };
}

/** Build the error envelope. */
export function errorEnvelope(
  message: string,
  errors: Record<string, unknown> | null = null,
) {
  return { message, data: null, errors };
}

/** XOF money helper (scale 0 — minor equals major, always an integer). */
export function xof(amountMinor: number): Money {
  return { amount_minor: amountMinor, currency: "XOF", scale: 0 };
}

export const testUser: User = {
  uuid: "11111111-1111-1111-1111-111111111111",
  name: "Jean Dupont",
  email: "jean.dupont@email.com",
  referral_code: "FP-JD2024",
  kyc_level: 1,
  status: "active",
  pin_set: true,
  email_verified: true,
  roles: ["user"],
  permissions: [],
};

/** USD money helper (scale 2 — cents, two decimals) for card fixtures. */
export function usd(amountMinor: number): Money {
  return { amount_minor: amountMinor, currency: "USD", scale: 2 };
}

/**
 * Default handlers. /me defaults to 401 (guest) so tests opt into an
 * authenticated session explicitly via `server.use(...)`.
 */
export const handlers = [
  http.get(`${BASE}/sanctum/csrf-cookie`, () =>
    new HttpResponse(null, { status: 204 }),
  ),

  http.get(`${BASE}/api/me`, () =>
    HttpResponse.json(errorEnvelope("Unauthenticated."), { status: 401 }),
  ),

  http.post(`${BASE}/api/login`, () =>
    HttpResponse.json(
      envelope({ token: "plain-text-token", user: testUser }, "authenticated"),
    ),
  ),

  http.post(`${BASE}/api/register`, () =>
    HttpResponse.json(errorEnvelope("verification_email_sent"), {
      status: 202,
    }),
  ),

  http.post(`${BASE}/api/logout`, () =>
    HttpResponse.json(envelope(null, "logged_out")),
  ),

  http.post(`${BASE}/api/pin`, () =>
    HttpResponse.json(envelope(null, "pin_set")),
  ),

  http.post(`${BASE}/api/pin/verify`, () =>
    HttpResponse.json(
      envelope(
        { ticket: "one-time-ticket-abc", action: "withdraw", expires_in: 120 },
        "pin_verified",
      ),
    ),
  ),
];
