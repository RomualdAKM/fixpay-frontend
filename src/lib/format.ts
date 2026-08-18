import type { Transaction } from "@/lib/display-types";

/**
 * Formatting helpers for amounts and dates.
 *
 * Amounts keep the French typography of the original design (no-break space as
 * thousands separator, sign followed by a space) — the audit lists it among the
 * things to preserve. What changes: XOF NEVER carries decimals, and dates
 * follow ONE rule across the whole product (see `formatDate`).
 *
 * SÉPARATEUR DE MILLIERS — U+00A0, et non U+202F.
 * L'espace fine insécable était typographiquement juste et pratiquement
 * intenable : sa chasse dépend de la couverture de la police, elle subit
 * l'interlettrage négatif des displays et elle est quasi nulle sous
 * `font-variant-numeric: tabular-nums`. Rendu mesuré par les DA :
 * « 1866 252 FCFA » à 32-40px (écrans 02 et 03), « 500000 » à 13px (écran 20).
 * L'espace insécable normale existe dans toutes les polices, ne casse jamais en
 * fin de ligne et reste lisible de 11px à 40px. Le composant de rendu la
 * protège en plus de l'interlettrage (voir `AmountFigure`).
 *
 * Le même caractère colle « FCFA » au nombre : le suffixe ne peut plus se
 * retrouver orphelin sur une seconde ligne (écrans 04, 05, 16).
 */

/** No-break space (U+00A0) — thousands separator and number/currency glue. */
export const NBSP = "\u00a0";

/** Insert NBSP thousands separators into a plain digit string. */
function groupThousands(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
}

/**
 * Bare amount without currency, for chips: 25000 -> "25 000".
 * Always an integer: le franc CFA n'a pas de subdivision, une valeur
 * fractionnaire est arrondie au franc le plus proche.
 */
export function formatAmount(n: number): string {
  return groupThousands(String(Math.round(Math.abs(n))));
}

/** Devise du produit, écrite une seule fois. */
export const CURRENCY = "FCFA";

/** FCFA amount with currency suffix: 1866252 -> "1 866 252 FCFA". */
export function formatFcfa(n: number): string {
  return `${formatAmount(n)}${NBSP}${CURRENCY}`;
}

/**
 * Sépare le nombre de son unité : "1 866 252 FCFA" -> { figure, currency }.
 * Les grands displays (hero portefeuille, écran de paiement) composent les
 * deux différemment — le suffixe ne doit plus faire masse avec le nombre —
 * alors que les données arrivent formatées en une seule chaîne. La règle est
 * ici, pas dans chaque composant : dernier segment non numérique = unité.
 */
export function splitAmountCurrency(text: string): {
  figure: string;
  currency?: string;
} {
  // `\s` couvre U+00A0 comme U+202F : une donnée encore formatée à l'ancienne
  // se sépare aussi bien.
  const match = /^(.*\d)\s+(\D+)$/.exec(text.trim());
  const figure = match?.[1];
  const currency = match?.[2];
  return figure && currency ? { figure, currency } : { figure: text };
}

/** Operation fee: "Gratuit" when free, "325 FCFA" otherwise. */
export function formatFee(fee: number): string {
  return fee === 0 ? "Gratuit" : formatFcfa(fee);
}

/*
 * USD — les cartes FixPay sont libellées en dollars (scale 2, cents). Le dollar
 * a une subdivision, donc DEUX décimales, toujours : elles ne sont ni codées en
 * dur ailleurs ni dérivées d'un float, mais reconstruites depuis l'entier de
 * cents (jamais `cents / 100` en virgule flottante, qui donnerait 0.1 + 0.2 ≠
 * 0.3). Le séparateur de milliers est la même espace insécable que le franc, et
 * l'unité « USD » colle au nombre par cette même espace pour ne pas s'orpheliner.
 */

/** Bare USD figure from an integer of cents: 123456 -> "1 234.56". */
export function formatUsdFigure(cents: number): string {
  const rounded = Math.round(cents);
  const negative = rounded < 0;
  const abs = Math.abs(rounded);
  const whole = groupThousands(String(Math.trunc(abs / 100)));
  const fraction = String(abs % 100).padStart(2, "0");
  return `${negative ? "-" : ""}${whole}.${fraction}`;
}

/** USD unit for the display currency of a card. */
export const USD_CURRENCY = "USD";

/** USD amount with its currency suffix: 123456 (cents) -> "1 234.56 USD". */
export function formatUsd(cents: number): string {
  return `${formatUsdFigure(cents)}${NBSP}${USD_CURRENCY}`;
}

/**
 * Signed transaction amount, sign followed by a space:
 * "- 39 341 FCFA" / "+ 131 192 FCFA" / "- €59.99".
 * Decimals are driven by the CURRENCY, never hard-coded: EUR has cents,
 * XOF has none. L'espace qui suit le signe est insécable elle aussi : un
 * montant ne se coupe jamais, ni entre son signe et son nombre, ni entre son
 * nombre et son unité.
 */
export function formatSigned(t: Transaction): string {
  const sign = t.direction === "debit" ? "-" : "+";
  if (t.currency === "EUR") {
    return `${sign}${NBSP}€${Math.abs(t.amount).toFixed(2)}`;
  }
  return `${sign}${NBSP}${formatFcfa(t.amount)}`;
}

/** Mask all but the last 4 digits of a card number: "•••• 4291". */
export function maskCardNumber(last4: string): string {
  return `•••• ${last4}`;
}

/*
 * Dates — une seule règle dans tout le produit (l'audit en a relevé trois
 * conventions concurrentes). Les libellés sont écrits en dur plutôt que via
 * Intl : le rendu doit être identique côté serveur et côté client, quels que
 * soient l'ICU et la locale de la machine.
 */
const MONTHS_FR = [
  "janv.",
  "févr.",
  "mars",
  "avr.",
  "mai",
  "juin",
  "juil.",
  "août",
  "sept.",
  "oct.",
  "nov.",
  "déc.",
] as const;

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Local midnight of a date, so day gaps ignore the time and the DST shifts. */
function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/**
 * The single date rule of the product:
 * - same day        -> "14:32"
 * - the day before  -> "Hier, 09:15"
 * - same year       -> "11 avr."   (lowercase, abbreviating period)
 * - other year      -> "11 avr. 2025"
 *
 * `input` accepts an ISO 8601 timestamp (preferred) or a Date. A string that
 * is not a parsable date is considered ALREADY formatted and returned
 * untouched, so a component can call `formatDate` on any date field without
 * knowing whether the source has been migrated to timestamps yet.
 *
 * `now` is injectable so mock data and tests produce a deterministic label
 * (a relative date computed at render time would differ between the server
 * and the client pass).
 */
export function formatDate(
  input: string | Date,
  now: string | Date = new Date(),
): string {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) {
    return typeof input === "string" ? input : "";
  }

  const reference = now instanceof Date ? now : new Date(now);
  const dayGap = Math.round(
    (startOfDay(reference) - startOfDay(date)) / 86_400_000,
  );
  const time = `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;

  if (dayGap === 0) return time;
  if (dayGap === 1) return `Hier, ${time}`;

  const month = MONTHS_FR[date.getMonth()] ?? "";
  const day = `${date.getDate()} ${month}`;
  return date.getFullYear() === reference.getFullYear()
    ? day
    : `${day} ${date.getFullYear()}`;
}
