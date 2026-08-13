"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { BottomNav } from "@/components/layout/BottomNav";
import { AmountInput } from "@/components/ui/AmountInput";
import { BalanceCard } from "@/components/ui/BalanceCard";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { InfoBanner } from "@/components/ui/InfoBanner";
import { QuickAmountChips } from "@/components/ui/QuickAmountChips";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SelectableRow } from "@/components/ui/SelectableRow";
import { StickyActionBar } from "@/components/ui/StickyActionBar";
import { TransactionFacts } from "@/components/ui/TransactionFacts";
import { formatAmount, formatFcfa } from "@/lib/format";
import {
  cardTopUpFacts,
  cards,
  primaryCard,
  quickAmounts,
  wallet,
  type CardId,
} from "@/lib/mock-data";

/* Même squelette et même échelle d'espacement que les écrans 04/05/07/08 —
   voir le commentaire de rythme de wallet/deposit/page.tsx. */
const FLOW_MAIN =
  "px-5 pt-[54px] pb-24 lg:mx-auto lg:w-full lg:max-w-[840px] lg:px-10 lg:pt-9 lg:pb-12";
const FLOW_GRID = "mt-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-10";
const FLOW_ASIDE = "mt-8 lg:mt-0";

/** Montant saisi au clavier natif → entier de francs (« 50 000 » → 50000). */
function parseAmount(raw: string): number {
  return Number(raw.replace(/\D/g, "")) || 0;
}

/**
 * Écran 06 · Alimenter ma carte.
 *
 * ÉTAPE 11 (composition) : l'écran gardait la bonne SÉQUENCE mais avait six
 * marges différentes pour cinq blocs (16 / 16 / 20 / 10 / 12 / 24), ce qui
 * l'aplatissait en liste d'éléments équidistants. Il se lit désormais en deux
 * groupes — ce que je dépense (contexte, ressource, montant) et où cela va
 * (destination, faits, action) —, séparés par 32px en mobile et par une
 * colonne en desktop, où la page n'a plus une moitié vide sous une colonne de
 * 560px.
 *
 * Conservé de la passe précédente : le CTA épinglé, le bandeau neutre, et
 * l'absence de tuile `CreditCard` générique sur les deux réseaux.
 */
export default function CardTopUpPage() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [selectedCard, setSelectedCard] = useState<CardId>("visa-4291");

  const transferred = parseAmount(amount);
  const destination = cards.find((c) => c.id === selectedCard) ?? primaryCard;
  /*
   * Le plafond pertinent d'une alimentation n'est pas celui du portefeuille
   * mais celui de la carte DESTINATAIRE (cf. `cardTopUpFacts` dans mock-data).
   */
  const cardRemaining = destination.monthlyLimit - destination.monthlyUsed;
  /*
   * Le « solde après » n'apparaît qu'une fois un montant saisi, et jamais
   * au-delà du solde : `formatFcfa` rend une valeur absolue, un reste négatif
   * s'y afficherait en positif.
   */
  const enough = transferred > 0 && transferred <= wallet.balance;
  const balanceAfter = enough
    ? formatFcfa(wallet.balance - transferred)
    : undefined;
  const ready = transferred >= cardTopUpFacts.min && enough;

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
            Alimenter ma carte
          </h1>
        </header>

        <div className={FLOW_GRID}>
          {/* ---- Colonne de saisie : contexte, ressource, montant ---- */}
          <div>
            <InfoBanner>
              Le montant est débité de votre portefeuille FixPay et crédité
              instantanément sur la carte sélectionnée.
            </InfoBanner>

            {/* 16px : le bandeau et la ressource sont le MÊME groupe (« d'où
                vient l'argent »), ils restent serrés. */}
            <div className="mt-4">
              <BalanceCard
                label="Portefeuille disponible"
                amount={formatFcfa(wallet.balance)}
              />
            </div>

            {/* 32px : nouveau groupe — la saisie. */}
            <section className="mt-8">
              <div className="flex items-baseline justify-between gap-3">
                <SectionLabel>Montant à transférer (FCFA)</SectionLabel>
                <button
                  type="button"
                  onClick={() => setAmount(formatAmount(wallet.balance))}
                  className="text-primary focus-visible:ring-primary/60 rounded-xs text-[12.5px] leading-[18px] font-medium transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:outline-none"
                >
                  Tout transférer
                </button>
              </div>
              <div className="mt-3">
                <AmountInput
                  value={amount}
                  onChange={setAmount}
                  placeholder="0"
                  ariaLabel="Montant à transférer en francs CFA"
                />
              </div>
              <div className="mt-3">
                <QuickAmountChips
                  amounts={quickAmounts.topUp}
                  onSelect={(n) => setAmount(formatAmount(n))}
                />
              </div>
              {/* `text-secondary` et non `muted` : la contrainte d'un champ se
                  lit, elle ne se devine pas (le muted mesurait 4,4:1). */}
              <p className="text-text-secondary mt-2 text-[11.5px] leading-[16px]">
                Minimum {formatFcfa(cardTopUpFacts.min)}
              </p>
            </section>
          </div>

          {/* ---- Colonne de vérité : destination, puis ce que ça produit ---- */}
          <aside className={FLOW_ASIDE}>
            <section>
              <SectionLabel>Carte de destination</SectionLabel>
              <div className="mt-3 space-y-2">
                {cards.map((card) => (
                  <SelectableRow
                    key={card.id}
                    title={card.label}
                    subtitle={`Solde actuel : ${formatFcfa(card.balance)}`}
                    height={64}
                    selected={selectedCard === card.id}
                    onSelect={() => setSelectedCard(card.id)}
                  />
                ))}
              </div>
            </section>

            <section className="mt-8">
              <SectionLabel>Frais et délai</SectionLabel>
              <div className="mt-3">
                <TransactionFacts
                  fee={cardTopUpFacts.feeLabel}
                  delay={cardTopUpFacts.delay}
                  limit={formatFcfa(cardRemaining)}
                  balanceAfter={balanceAfter}
                />
              </div>
            </section>
          </aside>
        </div>

        {/* L'action, épinglée : elle ne peut plus être masquée, et son état
            inactif est le même objet que sur 04, 05 et 13. Le rythme de tête
            (marge, filet, padding) appartient à la barre — voir
            `StickyActionBar`. */}
        <StickyActionBar>
          <div>
            {ready ? (
              <Button href="/cards/top-up/success" className="lg:max-w-[320px]">
                Alimenter la carte
              </Button>
            ) : (
              <button
                type="button"
                disabled
                className="border-border bg-surface-2 text-text-muted inline-flex h-[50px] w-full cursor-not-allowed items-center justify-center rounded-md border text-[15px] font-semibold lg:max-w-[320px]"
              >
                Alimenter la carte
              </button>
            )}
          </div>
        </StickyActionBar>
      </main>

      <BottomNav />
    </>
  );
}
