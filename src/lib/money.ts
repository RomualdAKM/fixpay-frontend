import type { CurrencyCode, Money } from "@/lib/api/types";
import { formatFcfa, formatUsd, NBSP } from "@/lib/format";

/**
 * Bridge between the API's minor-unit `Money` and the display formatters. The
 * wallet legs send XOF (scale 0), where minor equals major; the CARD legs send
 * USD (scale 2, cents). The scale division renders a major-unit number for the
 * rare consumer that needs one — but display always goes through `formatMoney`,
 * which formats USD from the integer of cents directly, never from this float.
 */
export function majorUnits(money: Money): number {
  return money.scale === 0
    ? money.amount_minor
    : money.amount_minor / 10 ** money.scale;
}

/**
 * Format a `Money` for display, per currency: XOF renders as "1 866 252 FCFA"
 * (no decimals, scale 0), USD as "59.99 USD" (two decimals from the cents
 * integer). The currency drives the decimals — never hard-coded, never a wrong
 * ×100.
 */
export function formatMoney(money: Money): string {
  return money.currency === "USD"
    ? formatUsd(money.amount_minor)
    : formatFcfa(majorUnits(money));
}

/**
 * Convert a user-entered whole-dollar amount to the minor unit (cents) the card
 * API expects. The numeric input carries no subdivision, so a dollar becomes
 * exactly 100 cents; `Math.round` keeps the result an integer with no float
 * drift.
 */
export function usdMinor(majorDollars: number): number {
  return Math.round(majorDollars * 100);
}

/**
 * Convert a user-entered FCFA major amount to the minor unit the API expects.
 * XOF has no subdivision, so the value is a plain integer of francs.
 */
export function xofMinor(majorAmount: number): number {
  return Math.round(majorAmount);
}

/** The scale (decimal places) of a currency: XOF has none, USD has cents. */
export function scaleForCurrency(currency: CurrencyCode): number {
  return currency === "USD" ? 2 : 0;
}

/**
 * Build a `Money` from a raw minor amount and its currency, for the few backend
 * fields sent as a bare integer (e.g. the reconciliation `drift_minor`) rather
 * than a full Money object, so they format through the same `formatMoney` rule.
 */
export function moneyMinor(amountMinor: number, currency: CurrencyCode): Money {
  return { amount_minor: amountMinor, currency, scale: scaleForCurrency(currency) };
}

/**
 * Format a SIGNED minor amount, keeping its direction for every currency. Routing
 * a signed value through `formatMoney` alone drops the sign for scale-0
 * currencies (XOF → `formatAmount` → `Math.abs`), so a reconciliation drift of
 * −3000 would read identically to +3000. Here the sign is rendered explicitly
 * from the raw value and the magnitude formatted from its absolute part, so a
 * shortfall and an over-credit stay distinguishable. Zero carries no sign. The
 * sign is followed by an NBSP, as in `formatSigned`, so a montant never breaks
 * between its sign and its number.
 */
export function formatSignedMoney(
  amountMinor: number,
  currency: CurrencyCode,
): string {
  const magnitude = formatMoney(moneyMinor(Math.abs(amountMinor), currency));
  if (amountMinor === 0) return magnitude;
  return `${amountMinor < 0 ? "-" : "+"}${NBSP}${magnitude}`;
}
