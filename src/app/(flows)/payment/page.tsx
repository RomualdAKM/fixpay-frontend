"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { BottomNav } from "@/components/layout/BottomNav";
import { InlineError } from "@/components/feedback/InlineError";
import { IconButton } from "@/components/ui/IconButton";
import { InfoBanner } from "@/components/ui/InfoBanner";
import { ListGroup } from "@/components/ui/ListGroup";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { StatusDot } from "@/components/ui/StatusDot";
import { StickyActionBar } from "@/components/ui/StickyActionBar";
import { useCards } from "@/lib/api/cardHooks";
import type { Card } from "@/lib/api/types";
import { cardExpiry, cardStatusLabel, maskedPan } from "@/lib/cards";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

const FLOW_MAIN =
  "px-5 pt-[54px] pb-24 lg:mx-auto lg:w-full lg:max-w-[840px] lg:px-10 lg:pt-9 lg:pb-12";

const STATUS_DOT: Record<Card["status"], string> = {
  active: "bg-success",
  frozen: "bg-warning",
  pending: "bg-warning",
  cancelled: "bg-danger",
};

function CardRow({ card, last }: { card: Card; last: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-[15px] py-[15px]",
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
    </div>
  );
}

export default function PaymentPage() {
  const router = useRouter();
  const cardsQuery = useCards();
  const cards = cardsQuery.data ?? [];

  return (
    <>
      <main className={FLOW_MAIN}>
        <header className="flex items-center gap-3.5">
          <IconButton
            icon={ChevronLeft}
            size={38}
            iconClass="text-text"
            ariaLabel="Retour"
            onClick={() => router.back()}
          />
          <h1 className="text-text min-w-0 truncate text-[19px] leading-tight font-bold lg:text-[22px]">
            Paiement
          </h1>
        </header>

        <div className="mt-8">
          <InfoBanner>
            Le paiement par carte depuis FixPay n&apos;est pas encore
            disponible. Vos cartes sont affichées ici en lecture ; vous pourrez
            bientôt les utiliser pour payer.
          </InfoBanner>

          <section className="mt-8">
            <SectionLabel>Vos cartes</SectionLabel>
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
                <ListGroup empty="Vous n'avez aucune carte pour l'instant." />
              ) : (
                <ListGroup>
                  {cards.map((card, index) => (
                    <CardRow
                      key={card.uuid}
                      card={card}
                      last={index === cards.length - 1}
                    />
                  ))}
                </ListGroup>
              )}
            </div>
          </section>
        </div>

        <StickyActionBar>
          <div>
            <p className="text-text-muted mb-3 text-[11.5px] leading-[16px] lg:max-w-[320px]">
              Le paiement par carte sera bientôt disponible.
            </p>
            <button
              type="button"
              disabled
              className="border-border bg-surface-2 text-text-muted inline-flex h-[50px] w-full cursor-not-allowed items-center justify-center rounded-md border text-[15px] font-semibold lg:max-w-[320px]"
            >
              Payer maintenant
            </button>
          </div>
        </StickyActionBar>
      </main>

      <BottomNav />
    </>
  );
}
