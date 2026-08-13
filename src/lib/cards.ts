import type { Card, CardStatus } from "@/lib/api/types";

/**
 * Display helpers for the card screens. They derive strings from the real
 * `CardResource` only — no fabricated balance or network brand, which the API
 * does not send.
 */

/** Card face number from the last 4 digits: "•••• •••• •••• 4291". */
export function maskedPan(last4: string): string {
  return `•••• •••• •••• ${last4}`;
}

/** Expiry as MM/YY from the numeric month/year: (12, 2028) -> "12/28". */
export function cardExpiry(card: Pick<Card, "expiry_month" | "expiry_year">): string {
  const month = String(card.expiry_month).padStart(2, "0");
  const year = String(card.expiry_year).slice(-2);
  return `${month}/${year}`;
}

const STATUS_LABELS: Record<CardStatus, string> = {
  pending: "En cours de création",
  active: "Active",
  frozen: "Gelée",
  cancelled: "Annulée",
};

export function cardStatusLabel(status: CardStatus): string {
  return STATUS_LABELS[status];
}

/** Human label for a card transaction `type` (App\Domain\Card types). */
const TX_TYPE_LABELS: Record<string, string> = {
  consumption: "Paiement",
  authorization: "Autorisation",
  refund: "Remboursement",
  recharge: "Alimentation",
  cashout: "Retrait vers portefeuille",
  fee: "Frais",
  reversal: "Annulation",
};

export function cardTransactionLabel(type: string): string {
  return TX_TYPE_LABELS[type] ?? "Mouvement";
}
