"use client";

import { useState } from "react";
import Link from "next/link";
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
import { StickyActionBar } from "@/components/ui/StickyActionBar";
import { TransactionFacts } from "@/components/ui/TransactionFacts";
import { formatAmount, formatFcfa } from "@/lib/format";
import { cardWithdrawFacts, primaryCard, quickAmounts } from "@/lib/mock-data";

/* Même squelette et même échelle d'espacement que les écrans 04/05/06/08 —
   voir le commentaire de rythme de wallet/deposit/page.tsx. */
const FLOW_MAIN =
  "px-5 pt-[54px] pb-24 lg:mx-auto lg:w-full lg:max-w-[840px] lg:px-10 lg:pt-9 lg:pb-12";
const FLOW_GRID = "mt-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-10";
const FLOW_ASIDE = "mt-8 lg:mt-0";

/** Carte source du retrait (Visa •••• 4291, seule carte du flux). */
const sourceCard = primaryCard;

/** Montant saisi au clavier natif → entier de francs (« 50 000 » → 50000). */
function parseAmount(raw: string): number {
  return Number(raw.replace(/\D/g, "")) || 0;
}

/**
 * Écran 07 · Retirer de la carte.
 *
 * ÉTAPE 11 (composition) : la séquence de l'écran (contexte → ressource →
 * montant → source → action) est celle que l'audit tient pour le bon patron du
 * lot ; elle est conservée, mais ses six marges hétérogènes sont ramenées à
 * l'échelle du lot, et la source rejoint la colonne de vérité où elle fait
 * exactement le même office que « Carte de destination » sur l'écran 06. Les
 * deux écrans jumeaux ont enfin la même carcasse.
 *
 * Conservé : une seule écriture du solde, la ligne « Depuis » à plat (pas de
 * faux sélecteur radio à une option), le CTA épinglé.
 */
export default function CardWithdrawPage() {
  const router = useRouter();
  const [amount, setAmount] = useState("");

  const withdrawn = parseAmount(amount);
  /*
   * Le « solde après » n'apparaît qu'une fois un montant saisi, et jamais
   * au-delà du solde : `formatFcfa` rend une valeur absolue, un reste négatif
   * s'y afficherait en positif.
   */
  const enough = withdrawn > 0 && withdrawn <= sourceCard.balance;
  const balanceAfter = enough
    ? formatFcfa(sourceCard.balance - withdrawn)
    : undefined;
  const ready = withdrawn >= cardWithdrawFacts.min && enough;

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
            Retirer de la carte
          </h1>
        </header>

        <div className={FLOW_GRID}>
          {/* ---- Colonne de saisie : contexte, ressource, montant ---- */}
          <div>
            <InfoBanner>
              Le montant est retiré de votre carte bancaire virtuelle et
              recrédité sur votre portefeuille FixPay.
            </InfoBanner>

            <div className="mt-4">
              <BalanceCard
                label="Solde disponible sur la carte"
                amount={formatFcfa(sourceCard.balance)}
              />
            </div>

            <section className="mt-8">
              <div className="flex items-baseline justify-between gap-3">
                <SectionLabel>Montant à retirer (FCFA)</SectionLabel>
                <button
                  type="button"
                  onClick={() => setAmount(formatAmount(sourceCard.balance))}
                  className="text-primary focus-visible:ring-primary/60 rounded-xs text-[12.5px] leading-[18px] font-medium transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:outline-none"
                >
                  Tout retirer
                </button>
              </div>
              <div className="mt-3">
                <AmountInput
                  value={amount}
                  onChange={setAmount}
                  placeholder="0"
                  ariaLabel="Montant à retirer en francs CFA"
                />
              </div>
              <div className="mt-3">
                <QuickAmountChips
                  amounts={quickAmounts.cardWithdraw}
                  onSelect={(n) => setAmount(formatAmount(n))}
                />
              </div>
              <p className="text-text-secondary mt-2 text-[11.5px] leading-[16px]">
                Minimum {formatFcfa(cardWithdrawFacts.min)}
              </p>
            </section>
          </div>

          {/* ---- Colonne de vérité : source, puis ce que ça produit ---- */}
          <aside className={FLOW_ASIDE}>
            <section>
              <SectionLabel>Carte débitée</SectionLabel>
              <div className="mt-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-text truncate text-[13.5px] leading-[18px] font-medium">
                    {sourceCard.label}
                  </p>
                  <p className="text-text-muted mt-[3px] text-[12px] leading-[16px]">
                    {sourceCard.type} · Expire {sourceCard.expiry}
                  </p>
                </div>
                <Link
                  href={`/cards/${sourceCard.id}`}
                  className="text-primary focus-visible:ring-primary/60 shrink-0 rounded-xs text-[12.5px] leading-[18px] font-medium transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:outline-none"
                >
                  Changer
                </Link>
              </div>
            </section>

            <section className="mt-8">
              <SectionLabel>Frais et délai</SectionLabel>
              <div className="mt-3">
                {/* Aucun plafond ici : un retrait vers le portefeuille ne
                    consomme pas le plafond de dépense de la carte. */}
                <TransactionFacts
                  fee={cardWithdrawFacts.feeLabel}
                  delay={cardWithdrawFacts.delay}
                  balanceAfter={balanceAfter}
                />
              </div>
            </section>
          </aside>
        </div>

        <StickyActionBar>
          {/* Le rythme de tête (marge, filet, padding) appartient désormais à
              la barre elle-même — voir `StickyActionBar`. */}
          <div>
            {ready ? (
              <Button
                href="/cards/withdraw/success"
                className="lg:max-w-[320px]"
              >
                Confirmer le retrait
              </Button>
            ) : (
              <button
                type="button"
                disabled
                className="border-border bg-surface-2 text-text-muted inline-flex h-[50px] w-full cursor-not-allowed items-center justify-center rounded-md border text-[15px] font-semibold lg:max-w-[320px]"
              >
                Confirmer le retrait
              </button>
            )}
          </div>
        </StickyActionBar>
      </main>

      <BottomNav />
    </>
  );
}
