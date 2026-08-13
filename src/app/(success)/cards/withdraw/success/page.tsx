"use client";

import { ArrowDownLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import type { ReceiptRow } from "@/components/ui/SuccessScreen";
import { SuccessScreen } from "@/components/ui/SuccessScreen";
import { useCardCashoutResult } from "@/lib/api/cardHooks";
import { isCardOrderFinal } from "@/lib/api/status";
import { formatDate, formatUsdFigure } from "@/lib/format";
import { formatMoney } from "@/lib/money";

/**
 * Écran 25 · Retrait carte → portefeuille — sur le résultat réel du cashout.
 *
 * Le reçu n'est composé QUE sur l'état final `success`. Le montant retiré (USD)
 * et le crédit reçu au portefeuille (XOF) viennent de la ressource. Sans
 * endpoint de statut, le résultat est lu dans le cache écrit par la mutation.
 */
export default function CardWithdrawSuccessPage() {
  const uuid = useSearchParams().get("uuid");
  const cashoutQuery = useCardCashoutResult(uuid);
  const cashout = cashoutQuery.data;

  // Le cashout n'a pas d'endpoint GET : le résultat n'existe qu'en cache, écrit
  // par la mutation (useCardCashoutResult ne fetche jamais). Un uuid sans
  // résultat en cache — rechargement, URL rouverte, retour restauré — est un
  // état TERMINAL « reçu indisponible », pas un chargement.
  if (!cashout) {
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

  if (cashout.state !== "success") {
    const settledButNotSuccess = isCardOrderFinal(cashout.state);
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col items-center justify-center px-6 text-center">
        <p className="text-text text-[16px] leading-[22px] font-semibold">
          {settledButNotSuccess ? "Retrait non abouti" : "Retrait en cours"}
        </p>
        <p className="text-text-muted mt-2 max-w-[360px] text-[13px] leading-[19px]">
          {settledButNotSuccess
            ? (cashout.failure_reason ??
              "L'opération n'a pas été finalisée. Le montant a été rétabli sur la carte.")
            : "Votre portefeuille sera crédité dès la confirmation de l'opération."}
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
    ["Retiré de la carte", formatMoney(cashout.amount_usd)],
    ["Crédité au portefeuille", formatMoney(cashout.credited_xof)],
    ...(cashout.created_at
      ? ([["Date", formatDate(cashout.created_at)]] as ReceiptRow[])
      : []),
    ["Référence", cashout.uuid],
  ];

  return (
    <SuccessScreen
      icon={ArrowDownLeft}
      title="Retrait effectué"
      amount={formatUsdFigure(cashout.amount_usd.amount_minor)}
      sign="-"
      currency="USD"
      receipt={receipt}
      ctaLabel="Voir mon portefeuille"
      ctaHref="/wallet"
      secondaryLabel="Retirer à nouveau"
      secondaryHref={
        cashout.card_uuid
          ? `/cards/withdraw?card=${cashout.card_uuid}`
          : "/cards/withdraw"
      }
    />
  );
}
