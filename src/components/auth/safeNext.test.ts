import { describe, expect, it } from "vitest";

import { safeNext } from "@/components/auth/LoginForm";

describe("safeNext", () => {
  it("accepts a plain same-origin path", () => {
    expect(safeNext("/cards/abc")).toBe("/cards/abc");
  });

  it("rejects a protocol-relative target", () => {
    expect(safeNext("//evil.com")).toBe("/");
  });

  it("rejects the backslash-authority form the URL parser folds off-origin", () => {
    // '/\evil.com' resolves to authority evil.com per the URL spec.
    expect(safeNext("/\\evil.com")).toBe("/");
  });

  it("rejects absolute and non-slash targets, and null", () => {
    expect(safeNext("https://evil.com")).toBe("/");
    expect(safeNext("evil.com")).toBe("/");
    expect(safeNext(null)).toBe("/");
  });
});
