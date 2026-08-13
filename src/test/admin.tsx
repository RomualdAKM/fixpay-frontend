import { HttpResponse, http } from "msw";

import type { User } from "@/lib/api/types";

import { envelope } from "./msw/handlers";
import { server } from "./msw/server";

export const ADMIN_BASE = "http://localhost:8000";

/** Build an authenticated user carrying the given permission slugs. */
export function adminUser(permissions: string[], roles: string[] = []): User {
  return {
    uuid: "admin-uuid",
    name: "Admin Test",
    email: "admin@fixpay.me",
    referral_code: null,
    kyc_level: 1,
    status: "active",
    pin_set: true,
    email_verified: true,
    roles: roles.length ? roles : ["config_admin"],
    permissions,
  };
}

/** Make GET /api/me resolve to the given user for the current test. */
export function seedMe(user: User): void {
  server.use(
    http.get(`${ADMIN_BASE}/api/me`, () => HttpResponse.json(envelope(user))),
  );
}
