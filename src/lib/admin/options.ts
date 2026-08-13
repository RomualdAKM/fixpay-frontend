import type { SelectOption } from "@/components/admin/fields";

/**
 * Labelled option lists for the config forms, mirroring the backend domain
 * enums. Keeping labels here (not scattered in JSX) means a table and its form
 * name each enum value the same way.
 */

export const PROVIDER_OPTIONS: SelectOption[] = [
  { value: "vcc", label: "VCC (cartes)" },
  { value: "zayono", label: "Zayono (Mobile Money)" },
];

export const CHANNEL_OPTIONS: SelectOption[] = [
  { value: "app", label: "Application" },
  { value: "b2b", label: "B2B" },
];

export const SCOPE_TYPE_OPTIONS: SelectOption[] = [
  { value: "global", label: "Global" },
  { value: "bin", label: "BIN" },
  { value: "operator", label: "Opérateur" },
  { value: "merchant", label: "Marchand" },
];

export const EVENT_TYPE_OPTIONS: SelectOption[] = [
  { value: "withdrawal", label: "Retrait" },
  { value: "card_issue", label: "Émission carte" },
  { value: "card_recharge", label: "Recharge carte" },
  { value: "card_cashout", label: "Retrait carte" },
];

export const MARGIN_TYPE_OPTIONS: SelectOption[] = [
  { value: "fixed", label: "Montant fixe" },
  { value: "percent", label: "Pourcentage" },
];

export const COST_TYPE_OPTIONS: SelectOption[] = [
  { value: "fixed", label: "Montant fixe" },
  { value: "percent", label: "Pourcentage" },
];

export const FAILURE_BEARER_OPTIONS: SelectOption[] = [
  { value: "fixpay", label: "FixPay" },
  { value: "customer", label: "Client" },
];

export const CURRENCY_OPTIONS: SelectOption[] = [
  { value: "XOF", label: "XOF (FCFA)" },
  { value: "USD", label: "USD" },
];

export const LIMIT_TYPE_OPTIONS: SelectOption[] = [
  { value: "daily_deposit", label: "Dépôt quotidien" },
  { value: "monthly_wallet", label: "Portefeuille mensuel" },
  { value: "per_transaction_withdrawal", label: "Retrait par transaction" },
  { value: "daily_withdrawal", label: "Retrait quotidien" },
  { value: "max_cards", label: "Nombre de cartes" },
  { value: "daily_card_issue", label: "Émissions de carte / jour" },
];

/** Resolve a value to its label within an option list (fallback: the value). */
export function labelOf(options: SelectOption[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? value;
}
