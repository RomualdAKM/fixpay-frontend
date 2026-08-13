"use client";

import { ArrowDownLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import type { ReceiptRow } from "@/components/ui/SuccessScreen";
import { SuccessScreen } from "@/components/ui/SuccessScreen";
import { useCardCashoutStatus } from "@/lib/api/cardHooks";
import { isCardOrderFinal } from "@/lib/api/status";
import { formatDate, formatUsdFigure } from "@/lib/format";
import { formatMoney } from "@/lib/money";

/**
 * Écran 25 · Retrait carte → portefeuille — sur le résultat réel du cashout.
 *
 * Le reçu n'est composé QUE sur l'état final `success`. Le montant retiré (USD)
 * et le crédit reçu au portefeuille (XOF) viennent de la ressource. L'état est
 * POLLÉ (borné) sur GET /cards/{uuid}/cashouts/{cuuid} jusqu'à l'état final.
 */
export default function CardWithdrawSuccessPage() {
  const uuid = useSearchParams().get("uuid");
  const cashoutQuery = useCardCashoutStatus(uuid);
  const cashout = cashoutQuery.data;

  if (cashoutQuery.isPending) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col items-center justify-center px-6 text-center">
        <Loader2 size={28} className="text-primary animate-spin" aria-hidden />
        <p className="text-text-muted mt-4 text-[13px] leading-[19px]">
          Vérification du retrait…
        </p>
      </main>
    );
  }

  // Pas de résultat en cache (rechargement, URL rouverte) : sans l'UUID de
  // carte le statut n'est pas interrogeable — état TERMINAL « reçu indisponible ».
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
