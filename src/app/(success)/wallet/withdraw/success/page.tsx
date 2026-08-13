"use client";

import { ArrowUpRight, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

import Link from "next/link";

import { InlineError } from "@/components/feedback/InlineError";
import type { ReceiptRow } from "@/components/ui/SuccessScreen";
import { SuccessScreen } from "@/components/ui/SuccessScreen";
import { useWithdrawal } from "@/lib/api/moneyHooks";
import { isWithdrawalFinal } from "@/lib/api/status";
import { formatAmount, formatDate } from "@/lib/format";
import { formatMoney, majorUnits } from "@/lib/money";

/**
 * Écran 22 · Succès Retrait — sur les données réelles du retrait.
 *
 * L'écran relit GET /api/withdrawals/{uuid} et compose le reçu avec les VRAIS
 * frais (fixpay_fee), le total réellement débité (client_debit) et le numéro
 * masqué du bénéficiaire renvoyé par l'API. Aucune valeur en dur, aucun barème
 * recalculé côté client.
 */
function operatorLabel(code: string): string {
  const cleaned = code.replace(/_/g, " ");
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export default function WalletWithdrawSuccessPage() {
  const uuid = useSearchParams().get("uuid");
  const withdrawalQuery = useWithdrawal(uuid);
  const withdrawal = withdrawalQuery.data;

  if (uuid === null) {
    return (
      <SuccessScreen
        icon={ArrowUpRight}
        title="Retrait envoyé"
        amount=""
        currency="FCFA"
        secondaryLabel="Nouveau retrait"
        secondaryHref="/wallet/withdraw"
      />
    );
  }

  if (withdrawalQuery.isPending) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col items-center justify-center px-6">
        <Loader2 size={28} className="text-primary animate-spin" aria-hidden />
      </main>
    );
  }

  if (withdrawalQuery.isError || !withdrawal) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col justify-center px-6">
        <InlineError error={withdrawalQuery.error} />
      </main>
    );
  }

  // Ne JAMAIS afficher « Retrait envoyé » pour un retrait non abouti : une URL
  // partagée/rafraîchie sur un uuid rejeté, échoué ou en attente d'approbation
  // doit montrer l'état réel, pas un reçu de succès pour de l'argent rétabli.
  if (withdrawal.status !== "success") {
    const settledButNotSuccess = isWithdrawalFinal(withdrawal.status);
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col items-center justify-center px-6 text-center">
        <p className="text-text text-[16px] leading-[22px] font-semibold">
          {settledButNotSuccess ? "Retrait non abouti" : "Retrait en cours"}
        </p>
        <p className="text-text-muted mt-2 max-w-[360px] text-[13px] leading-[19px]">
          {settledButNotSuccess
            ? (withdrawal.failure_reason ??
              "L'opération n'a pas été finalisée. Votre solde a été rétabli.")
            : "Ce retrait n'est pas encore confirmé. Il sera traité après validation, puis crédité au bénéficiaire."}
        </p>
        <Link
          href="/wallet"
          className="text-primary-light mt-6 text-[13.5px] leading-[18px] font-medium underline-offset-4 hover:underline"
        >
          Retour au portefeuille
        </Link>
      </main>
    );
  }

  const receipt: ReceiptRow[] = [
    [
      "Destinataire",
      `${operatorLabel(withdrawal.operator)} · ${withdrawal.recipient_masked_phone}`,
    ],
    ["Frais", formatMoney(withdrawal.fixpay_fee)],
    ["Total débité", formatMoney(withdrawal.client_debit)],
    ...(withdrawal.processed_at
      ? ([["Date", formatDate(withdrawal.processed_at)]] as ReceiptRow[])
      : []),
    ["Référence", withdrawal.uuid],
  ];

  return (
    <SuccessScreen
      icon={ArrowUpRight}
      title="Retrait envoyé"
      amount={formatAmount(majorUnits(withdrawal.amount))}
      sign="-"
      currency="FCFA"
      receipt={receipt}
      secondaryLabel="Nouveau retrait"
      secondaryHref="/wallet/withdraw"
    />
  );
}
