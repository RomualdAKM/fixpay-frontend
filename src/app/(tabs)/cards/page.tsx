"use client";

import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";

import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { InlineError } from "@/components/feedback/InlineError";
import { Button } from "@/components/ui/Button";
import { ListGroup } from "@/components/ui/ListGroup";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatusDot } from "@/components/ui/StatusDot";
import { useCards } from "@/lib/api/cardHooks";
import type { Card } from "@/lib/api/types";
import { cardExpiry, cardStatusLabel, maskedPan } from "@/lib/cards";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

/** Couleur de pastille par statut : verte active, ambre gelée/en cours, rouge annulée. */
const STATUS_DOT: Record<Card["status"], string> = {
  active: "bg-success",
  frozen: "bg-warning",
  pending: "bg-warning",
  cancelled: "bg-danger",
};

/**
 * Une rangée de carte, sur les données réelles de `CardResource`. Le solde réel
 * (USD, exposé désormais par l'API) est en colonne droite ; le numéro masqué
 * (mono), le statut et l'échéance identifient la carte.
 */
function CardListRow({ card, last }: { card: Card; last: boolean }) {
  return (
    <Link
      href={`/cards/${card.uuid}`}
      className={cn(
        "flex items-center gap-3 px-[15px] py-[15px] lg:transition-opacity lg:hover:opacity-80",
        !last && "border-border border-b",
      )}
    >
      <span className="min-w-0 flex-1">
        <span className="text-text block truncate font-mono text-[13px] leading-[17px] font-medium tracking-[1px]">
          {maskedPan(card.pan_last4)}
        </span>
        <span className="text-text-secondary mt-[3px] flex items-center gap-[5px] text-[12.5px] leading-[16px]">
          <StatusDot size={6} colorClass={STATUS_DOT[card.status]} />
          {cardStatusLabel(card.status)}
          <span aria-hidden className="text-text-muted">
            ·
          </span>
          Exp {cardExpiry(card)}
        </span>
      </span>
      <span className="text-text shrink-0 text-right font-mono text-[13px] leading-[17px] font-semibold">
        {formatMoney(card.balance)}
      </span>
      <ChevronRight
        size={16}
        strokeWidth={2}
        absoluteStrokeWidth
        aria-hidden="true"
        className="text-icon-muted -mr-[4px] shrink-0"
      />
    </Link>
  );
}

/**
 * Écran · Mes cartes — la liste réelle des cartes de l'utilisateur
 * (GET /api/cards). Remplace l'ancienne redirection vers une carte en dur. États
 * chargement / vide (« aucune carte, en créer une ») / erreur réels ; une
 * rangée mène au détail de sa carte.
 */
export default function CardsPage() {
  const cardsQuery = useCards();
  const cards = cardsQuery.data ?? [];

  return (
    <>
      <main className="flex-1 px-5 pt-[54px] pb-24 lg:mx-auto lg:w-full lg:max-w-[880px] lg:px-10 lg:pt-9 lg:pb-12">
        <AppHeader title="Mes cartes" desktopTitle="Mes cartes" showBell />

        <div className="mt-6">
          <SectionHeader title="Cartes virtuelles" />

          <div className="mt-3">
            {cardsQuery.isPending ? (
              <ListGroup loading />
            ) : cardsQuery.isError ? (
              <div>
                <InlineError error={cardsQuery.error} />
                <button
                  type="button"
                  onClick={() => void cardsQuery.refetch()}
                  className="text-primary-light mt-3 text-[13px] font-medium underline-offset-4 hover:underline"
                >
                  Réessayer
                </button>
              </div>
            ) : cards.length === 0 ? (
              <ListGroup
                empty={
                  <span className="flex flex-col items-center gap-3">
                    <span>Vous n&apos;avez aucune carte pour l&apos;instant.</span>
                    <Link
                      href="/cards/new"
                      className="text-primary-light text-[13px] font-medium underline-offset-4 hover:underline"
                    >
                      Créer une carte
                    </Link>
                  </span>
                }
              />
            ) : (
              <ListGroup>
                {cards.map((card, index) => (
                  <CardListRow
                    key={card.uuid}
                    card={card}
                    last={index === cards.length - 1}
                  />
                ))}
              </ListGroup>
            )}
          </div>

          {cards.length > 0 && (
            <div className="mt-6 lg:max-w-[320px]">
              <Button href="/cards/new">
                <span className="inline-flex items-center gap-2">
                  <Plus size={16} strokeWidth={2} absoluteStrokeWidth aria-hidden />
                  Créer une carte
                </span>
              </Button>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </>
  );
}
