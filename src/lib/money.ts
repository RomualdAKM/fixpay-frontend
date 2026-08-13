import type { Money } from "@/lib/api/types";
import { formatFcfa } from "@/lib/format";

/**
 * Bridge between the API's minor-unit `Money` and the FCFA formatters, which
 * take a major-unit integer. The backend only ever sends XOF (scale 0) to these
 * screens, so minor equals major; the scale division is applied defensively so
 * a future USD leg would still render correctly. Never produces a float for
 * XOF — scale 0 leaves the integer untouched.
 */
export function majorUnits(money: Money): number {
  return money.scale === 0
    ? money.amount_minor
    : money.amount_minor / 10 ** money.scale;
}

/** Format a `Money` for display. XOF renders as "1 866 252 FCFA". */
export function formatMoney(money: Money): string {
  return formatFcfa(majorUnits(money));
}

/**
 * Convert a user-entered FCFA major amount to the minor unit the API expects.
 * XOF has no subdivision, so the value is a plain integer of francs.
 */
export function xofMinor(majorAmount: number): number {
  return Math.round(majorAmount);
}
