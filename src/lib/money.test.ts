import { describe, expect, it } from "vitest";

import type { Money } from "@/lib/api/types";
import { NBSP } from "@/lib/format";

import { formatMoney, formatSignedMoney, majorUnits, xofMinor } from "./money";

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

  it("keeps the sign of a XOF drift (a negative never reads as positive)", () => {
    // formatMoney alone strips the sign for scale-0 currencies (Math.abs); a
    // reconciliation drift must stay directional.
    const positive = formatSignedMoney(3000, "XOF");
    const negative = formatSignedMoney(-3000, "XOF");
    expect(positive).toBe(`+${NBSP}3${NBSP}000${NBSP}FCFA`);
    expect(negative).toBe(`-${NBSP}3${NBSP}000${NBSP}FCFA`);
    expect(positive).not.toBe(negative);
  });

  it("keeps the sign of a USD drift and carries no sign for zero", () => {
    expect(formatSignedMoney(-3000, "USD")).toBe(`-${NBSP}30.00${NBSP}USD`);
    expect(formatSignedMoney(0, "XOF")).toBe(`0${NBSP}FCFA`);
  });
});
