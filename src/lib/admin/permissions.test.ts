import { describe, expect, it } from "vitest";

import type { User } from "@/lib/api/types";

import {
  hasAnyAdminPermission,
  hasPermission,
  Permission,
} from "./permissions";

function userWith(permissions: string[]): User {
  return {
    uuid: "u1",
    name: "Test",
    email: "t@example.com",
    referral_code: null,
    kyc_level: 1,
    status: "active",
    pin_set: true,
    email_verified: true,
    roles: [],
    permissions,
  };
}

describe("admin permissions helper", () => {
  it("hasPermission is null-safe and exact", () => {
    expect(hasPermission(null, Permission.ConfigRead)).toBe(false);
    expect(hasPermission(userWith([]), Permission.ConfigRead)).toBe(false);
    expect(
      hasPermission(userWith(["config.read"]), Permission.ConfigRead),
    ).toBe(true);
    // A near-miss slug must not match.
    expect(
      hasPermission(userWith(["config.write"]), Permission.ConfigRead),
    ).toBe(false);
  });

  it("hasAnyAdminPermission gates the back-office entrance", () => {
    expect(hasAnyAdminPermission(null)).toBe(false);
    expect(hasAnyAdminPermission(userWith(["user"]))).toBe(false);
    expect(hasAnyAdminPermission(userWith([]))).toBe(false);
    expect(hasAnyAdminPermission(userWith(["config.read"]))).toBe(true);
    expect(hasAnyAdminPermission(userWith(["kyc.review"]))).toBe(true);
  });

  it("does NOT admit a permission no admin screen consumes yet", () => {
    // Mirrors the documented card.reveal_pan exclusion: a would-be holder is
    // fail-closed out of the shell rather than dropped into an empty back-office
    // whose only landing page (overview) 403s for them.
    expect(hasAnyAdminPermission(userWith(["user.manage"]))).toBe(false);
    expect(hasAnyAdminPermission(userWith(["card.reveal_pan"]))).toBe(false);
  });
});
