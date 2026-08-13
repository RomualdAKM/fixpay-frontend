import { formatDate } from "@/lib/format";
import type { Transaction, TxIcon } from "@/lib/mock-data";
import { majorUnits } from "@/lib/money";

import type { WalletTransaction } from "./types";

/**
 * Adapters turning API resources into the shapes the existing display
 * components already render, so the wired screens keep the audited design
 * without reintroducing any mock VALUE — only the presentation types are
 * borrowed. Amounts stay integers throughout (XOF, scale 0).
 */

/** Human labels for the ledger transaction `type` (App\Domain transaction types). */
const TYPE_LABELS: Record<string, string> = {
  deposit: "Dépôt Mobile Money",
  withdrawal: "Retrait Mobile Money",
  card_recharge: "Alimentation carte",
  card_cashout: "Retrait vers portefeuille",
  card_issue: "Émission de carte",
  referral_payout: "Gain de parrainage",
  b2b_topup: "Rechargement",
  reversal: "Remboursement",
  fee: "Frais",
};

const TYPE_ICONS: Record<string, TxIcon> = {
  deposit: "deposit",
  withdrawal: "withdraw",
  card_recharge: "card",
  card_cashout: "card",
  card_issue: "card",
  referral_payout: "refresh",
  b2b_topup: "deposit",
  reversal: "refresh",
  fee: "refresh",
};

/** Map one wallet ledger entry onto the `Transaction` row model. */
export function walletTransactionToRow(
  tx: WalletTransaction,
  index: number,
): Transaction {
  const credit = tx.side === "credit";
  const magnitude = majorUnits(tx.amount);
  const type = tx.type ?? "";

  return {
    id: tx.transaction_uuid ?? `tx-${index}`,
    title: TYPE_LABELS[type] ?? "Mouvement",
    at: tx.posted_at ?? "",
    date: tx.posted_at ? formatDate(tx.posted_at) : "",
    amount: credit ? magnitude : -magnitude,
    currency: "FCFA",
    direction: credit ? "credit" : "debit",
    icon: TYPE_ICONS[type] ?? "refresh",
  };
}
