"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import type { ReceiptRow } from "@/components/ui/SuccessScreen";
import { SuccessScreen } from "@/components/ui/SuccessScreen";
import { VirtualCard } from "@/components/ui/VirtualCard";
import { useCard } from "@/lib/api/cardHooks";
import { cardExpiry, cardStatusLabel, maskedPan } from "@/lib/cards";

/**
 * Écran 20 · Carte créée — sur la carte réellement émise. L'écran relit
 * GET /api/cards/{uuid} (uuid en query) et n'affiche le reçu que si la carte
 * existe : une carte introuvable (émission non aboutie, URL périmée) montre
 * l'état réel, jamais un « carte prête » factice.
 */
export default function CardCreationSuccessPage() {
  const uuid = useSearchParams().get("card");
  const cardQuery = useCard(uuid);
  const card = cardQuery.data;

  if (uuid === null) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col items-center justify-center px-6 text-center">
        <p className="text-text text-[16px] leading-[22px] font-semibold">
          Aucune carte à afficher
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

  if (cardQuery.isPending) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col items-center justify-center px-6">
        <Loader2 size={28} className="text-primary animate-spin" aria-hidden />
      </main>
    );
  }

  if (cardQuery.isError || !card) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col items-center justify-center px-6 text-center">
        <p className="text-text text-[16px] leading-[22px] font-semibold">
          Création non aboutie
        </p>
        <p className="text-text-muted mt-2 max-w-[360px] text-[13px] leading-[19px]">
          La carte n&apos;est pas encore disponible. Elle apparaîtra dans « Mes
          cartes » dès qu&apos;elle sera prête.
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

  const receipt: ReceiptRow[] = [
    ["Numéro", maskedPan(card.pan_last4)],
    ["Titulaire", card.cardholder_name],
    ["Expiration", cardExpiry(card)],
    ["Devise", card.currency],
    ["Statut", cardStatusLabel(card.status)],
  ];

  return (
    <SuccessScreen
      visual={
        <VirtualCard
          size="onboarding"
          number={maskedPan(card.pan_last4)}
          holder={card.cardholder_name}
          expiry={cardExpiry(card)}
        />
      }
      title="Carte créée"
      amount=""
      receipt={receipt}
      ctaLabel="Voir ma carte"
      ctaHref={`/cards/${card.uuid}`}
      secondaryLabel="Toutes mes cartes"
      secondaryHref="/cards"
    />
  );
}
