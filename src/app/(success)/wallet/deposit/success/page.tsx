"use client";

import { ArrowDownLeft, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

import Link from "next/link";

import { InlineError } from "@/components/feedback/InlineError";
import type { ReceiptRow } from "@/components/ui/SuccessScreen";
import { SuccessScreen } from "@/components/ui/SuccessScreen";
import { useDeposit } from "@/lib/api/moneyHooks";
import { isDepositFinal } from "@/lib/api/status";
import { formatAmount, formatDate, formatFcfa } from "@/lib/format";
import { formatMoney, majorUnits } from "@/lib/money";

/**
 * Écran 21 · Succès Dépôt — sur les données réelles du dépôt.
 *
 * L'écran relit GET /api/deposits/{uuid} (uuid passé par le flux) et compose le
 * reçu à partir du VRAI montant crédité, du montant réellement débité du compte
 * Mobile Money et de la référence de l'opération. Plus aucune valeur en dur.
 */
function operatorLabel(code: string): string {
  const cleaned = code.replace(/_/g, " ");
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export default function WalletDepositSuccessPage() {
  const uuid = useSearchParams().get("uuid");
  const depositQuery = useDeposit(uuid);
  const deposit = depositQuery.data;

  if (uuid === null) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col items-center justify-center px-6 text-center">
        <p className="text-text text-[16px] leading-[22px] font-semibold">
          Reçu indisponible
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

  if (depositQuery.isPending) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col items-center justify-center px-6">
        <Loader2 size={28} className="text-primary animate-spin" aria-hidden />
      </main>
    );
  }

  if (depositQuery.isError || !deposit) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col justify-center px-6">
        <InlineError error={depositQuery.error} />
      </main>
    );
  }

  // Ne JAMAIS afficher un reçu « Dépôt confirmé » pour un dépôt non abouti :
  // une URL partagée/rafraîchie sur un uuid en attente ou en échec doit montrer
  // l'état réel, pas un reçu vert. Le flux normal ne redirige que sur 'success'.
  if (deposit.status !== "success") {
    const settledButNotSuccess = isDepositFinal(deposit.status);
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col items-center justify-center px-6 text-center">
        <p className="text-text text-[16px] leading-[22px] font-semibold">
          {settledButNotSuccess ? "Dépôt non abouti" : "Dépôt en cours"}
        </p>
        <p className="text-text-muted mt-2 max-w-[360px] text-[13px] leading-[19px]">
          {settledButNotSuccess
            ? (deposit.failure_reason ??
              "L'opération n'a pas été finalisée. Aucun montant n'a été crédité.")
            : "Ce dépôt n'est pas encore confirmé. Validez la demande sur votre téléphone, puis revenez."}
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
    ["Montant crédité", formatMoney(deposit.amount)],
    ...(deposit.amount_charged_minor !== null
      ? ([["Débité du compte", formatFcfa(deposit.amount_charged_minor)]] as ReceiptRow[])
      : []),
    ["Source", operatorLabel(deposit.operator)],
    ["Destination", "Portefeuille FixPay"],
    ...(deposit.processed_at
      ? ([["Date", formatDate(deposit.processed_at)]] as ReceiptRow[])
      : []),
    ["Référence", deposit.uuid],
  ];

  return (
    <SuccessScreen
      icon={ArrowDownLeft}
      title="Dépôt confirmé"
      amount={formatAmount(majorUnits(deposit.amount))}
      sign="+"
      currency="FCFA"
      receipt={receipt}
      secondaryLabel="Nouveau dépôt"
      secondaryHref="/wallet/deposit"
    />
  );
}
