import { describe, expect, it } from "vitest";

import type { Money } from "@/lib/api/types";
import { NBSP } from "@/lib/format";

import { formatMoney, majorUnits, xofMinor } from "./money";

const xof = (amountMinor: number): Money => ({
  amount_minor: amountMinor,
  currency: "XOF",
  scale: 0,
});

describe("money helpers", () => {
  it("keeps XOF an integer (scale 0, no float)", () => {
    const value = majorUnits(xof(1_866_252));
    expect(value).toBe(1_866_252);
    expect(Number.isInteger(value)).toBe(true);
  });

  it("divides by the scale for subdivided currencies", () => {
    expect(majorUnits({ amount_minor: 5999, currency: "USD", scale: 2 })).toBe(
      59.99,
    );
  });

  it("formats FCFA without decimals", () => {
    expect(formatMoney(xof(1_866_252))).toBe(
      `1${NBSP}866${NBSP}252${NBSP}FCFA`,
    );
  });

  it("rounds a major FCFA amount to an integer minor amount", () => {
    expect(xofMinor(50_000)).toBe(50_000);
    expect(Number.isInteger(xofMinor(50_000.4))).toBe(true);
  });
});
