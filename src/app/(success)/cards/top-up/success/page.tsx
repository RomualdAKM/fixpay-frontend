"use client";

import { CreditCard } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import type { ReceiptRow } from "@/components/ui/SuccessScreen";
import { SuccessScreen } from "@/components/ui/SuccessScreen";
import { useCardRechargeResult } from "@/lib/api/cardHooks";
import { isCardOrderFinal } from "@/lib/api/status";
import { formatDate, formatUsdFigure } from "@/lib/format";
import { formatMoney } from "@/lib/money";

/**
 * Écran 23 · Carte alimentée — sur le résultat réel de la recharge.
 *
 * Le reçu n'est composé QUE sur l'état final `success` : une recharge encore en
 * cours ou échouée montre son état réel, jamais un « carte alimentée » factice.
 * Le montant crédité (USD) et le coût débité (XOF) viennent de la ressource, pas
 * d'un barème recalculé côté client. Il n'existe pas d'endpoint de statut : le
 * résultat est lu dans le cache écrit par la mutation.
 */
export default function CardTopUpSuccessPage() {
  const uuid = useSearchParams().get("uuid");
  const rechargeQuery = useCardRechargeResult(uuid);
  const recharge = rechargeQuery.data;

  // La recharge n'a pas d'endpoint GET : le résultat n'existe qu'en cache,
  // écrit par la mutation (useCardRechargeResult ne fetche jamais). Un uuid
  // sans résultat en cache — rechargement de la page, URL rouverte, navigation
  // arrière restaurée — est un état TERMINAL « reçu indisponible », pas un
  // chargement : afficher un spinner ici bloquerait l'écran pour toujours.
  if (!recharge) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col items-center justify-center px-6 text-center">
        <p className="text-text text-[16px] leading-[22px] font-semibold">
          Reçu indisponible
        </p>
        <Link
          href="/cards"
          className="text-primary-light mt-6 text-[13.5px] leading-[18px] font-medium underline-offset-4 hover:underline"
        >
          Voir mes cartes
        </Link>
      </main>
    );
  }

  if (recharge.state !== "success") {
    const settledButNotSuccess = isCardOrderFinal(recharge.state);
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col items-center justify-center px-6 text-center">
        <p className="text-text text-[16px] leading-[22px] font-semibold">
          {settledButNotSuccess ? "Alimentation non aboutie" : "Alimentation en cours"}
        </p>
        <p className="text-text-muted mt-2 max-w-[360px] text-[13px] leading-[19px]">
          {settledButNotSuccess
            ? (recharge.failure_reason ??
              "L'opération n'a pas été finalisée. Le montant réservé a été rétabli sur votre portefeuille.")
            : "Votre carte sera créditée dès la confirmation de l'opération."}
        </p>
        <Link
          href={recharge.card_uuid ? `/cards/${recharge.card_uuid}` : "/cards"}
          className="text-primary-light mt-6 text-[13.5px] leading-[18px] font-medium underline-offset-4 hover:underline"
        >
          Retour à ma carte
        </Link>
      </main>
    );
  }

  const receipt: ReceiptRow[] = [
    ["Crédité sur la carte", formatMoney(recharge.credit_usd)],
    ["Débité du portefeuille", formatMoney(recharge.client_price)],
    ...(recharge.created_at
      ? ([["Date", formatDate(recharge.created_at)]] as ReceiptRow[])
      : []),
    ["Référence", recharge.uuid],
  ];

  return (
    <SuccessScreen
      icon={CreditCard}
      title="Carte alimentée"
      amount={formatUsdFigure(recharge.credit_usd.amount_minor)}
      sign="+"
      currency="USD"
      receipt={receipt}
      ctaLabel="Voir ma carte"
      ctaHref={recharge.card_uuid ? `/cards/${recharge.card_uuid}` : "/cards"}
      secondaryLabel="Alimenter à nouveau"
      secondaryHref={
        recharge.card_uuid
          ? `/cards/top-up?card=${recharge.card_uuid}`
          : "/cards/top-up"
      }
    />
  );
}
