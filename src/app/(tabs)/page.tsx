"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { InlineError } from "@/components/feedback/InlineError";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatusDot } from "@/components/ui/StatusDot";
import { WalletMovements } from "@/components/ui/WalletMovements";
import {
  WalletHeroActions,
  WalletHeroCard,
} from "@/components/ui/WalletHeroCard";
import { useKyc } from "@/lib/api/accountHooks";
import { useCards } from "@/lib/api/cardHooks";
import type { CardStatus, KycStatus } from "@/lib/api/types";
import { useWallet, useWalletTransactions } from "@/lib/api/moneyHooks";
import { walletTransactionToRow } from "@/lib/api/presenters";
import { cardExpiry, cardStatusLabel, maskedPan } from "@/lib/cards";
import { formatMoney } from "@/lib/money";
import { depositFacts, withdrawFacts } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const MASKED_BALANCE = "••••••";

const STATUS_DOT: Record<CardStatus, string> = {
  active: "bg-success",
  frozen: "bg-warning",
  pending: "bg-warning",
  cancelled: "bg-danger",
};

/**
 * Ligne KYC de l'Accueil, pilotée par le VRAI statut (GET /api/kyc) : rien ne
 * s'affiche une fois vérifié, sinon l'invite est adaptée à l'état réel. Plus
 * aucune « étape X sur N » fabriquée ni plafond inventé.
 */
const HOME_KYC: Record<
  Exclude<KycStatus, "approved">,
  { hint: string; action: string; actionClass: string }
> = {
  none: {
    hint: "Ajoutez une pièce d'identité pour lever vos plafonds mensuels.",
    action: "Commencer",
    actionClass: "text-primary",
  },
  pending: {
    hint: "Vos pièces sont en cours d'examen.",
    action: "En cours",
    actionClass: "text-warning",
  },
  rejected: {
    hint: "Une pièce doit être renvoyée pour valider votre identité.",
    action: "À corriger",
    actionClass: "text-danger",
  },
};

/** 145px hero placeholder while the balance loads. */
function HeroSkeleton() {
  return (
    <div
      className="bg-surface-2 h-[145px] animate-pulse rounded-lg"
      aria-hidden="true"
    />
  );
}

/**
 * Écran 02 · Accueil — LE TABLEAU DE BORD, et le seul.
 *
 * La répartition avec l'écran 03 est tranchée : l'Accueil donne la vue
 * d'ensemble et l'action rapide (solde, cartes, flux consolidé), le
 * Portefeuille montre le compte FCFA lui-même. Les deux écrans ne partagent ni
 * bloc ni liste.
 *
 * TOUTES LES DONNÉES SONT RÉELLES : le solde (GET /api/wallet), le statut de
 * vérification (GET /api/kyc), les cartes et leur solde (GET /api/cards), et le
 * flux d'opérations (GET /api/wallet/transactions). Aucun statut KYC, aucune
 * carte ni aucun solde fabriqués. Le barème dépôt/retrait est le seul contenu
 * statique — c'est le tarif du produit, pas une donnée de compte.
 */
export default function HomePage() {
  // Un SEUL œil sur l'écran : le geste « masquer mes soldes » est un geste de
  // confidentialité, pas un réglage par bloc.
  const [hidden, setHidden] = useState(false);

  const walletQuery = useWallet();
  const txQuery = useWalletTransactions();
  const kycQuery = useKyc();
  const cardsQuery = useCards();
  const cards = cardsQuery.data ?? [];

  const kycStatus = kycQuery.data?.status;
  const kycInfo =
    kycStatus && kycStatus !== "approved" ? HOME_KYC[kycStatus] : null;

  // Le tableau de bord montre les mouvements récents : la première page du
  // relevé, déjà triée par le backend (plus récent en tête).
  const recentRows = useMemo(
    () =>
      (txQuery.data?.pages[0]?.items ?? []).map((tx, index) =>
        walletTransactionToRow(tx, index),
      ),
    [txQuery.data],
  );

  return (
    <>
      <main className="px-5 pt-[50px] pb-24 lg:mx-auto lg:w-full lg:max-w-[1080px] lg:px-10 lg:pt-9 lg:pb-12">
        <AppHeader showLogo bellDot desktopTitle="Accueil" />

        <div className="flex flex-col lg:mt-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
          {/* Colonne A — argent : solde, vérification, cartes */}
          <div className="contents lg:block">
            <div className="mt-4 lg:mt-0">
              {walletQuery.isPending ? (
                <HeroSkeleton />
              ) : walletQuery.isError ? (
                <div>
                  <InlineError error={walletQuery.error} />
                  <button
                    type="button"
                    onClick={() => void walletQuery.refetch()}
                    className="text-primary-light mt-3 text-[13px] leading-[18px] font-medium underline-offset-4 hover:underline"
                  >
                    Réessayer
                  </button>
                </div>
              ) : (
                <WalletHeroCard
                  variant="compact"
                  label="Solde disponible"
                  amount={formatMoney(walletQuery.data.balance)}
                  hidden={hidden}
                  onToggleHidden={() => setHidden((v) => !v)}
                  watermark={false}
                >
                  <WalletHeroActions />
                </WalletHeroCard>
              )}
            </div>

            {/* LE COÛT DES DEUX ACTIONS, sous les deux actions. Les valeurs
                sortent des mêmes objets de barème que les écrans 04 et 05 : le
                prix annoncé sur le tableau de bord est exactement celui du
                tunnel. C'est un tarif produit, pas une donnée de compte. */}
            <p className="text-text-muted mt-2 text-[12px] leading-[17px]">
              Dépôt&nbsp;: {depositFacts.feeLabel.toLowerCase()}, crédité{" "}
              {depositFacts.delay.toLowerCase()} · Retrait&nbsp;:{" "}
              {withdrawFacts.feeLabel}, {withdrawFacts.delay.toLowerCase()}
            </p>

            {/* CE QUI EXPLIQUE LES PLAFONDS, piloté par le vrai statut KYC :
                rien une fois vérifié, sinon l'invite adaptée à l'état réel.
                Ligne nue à filets, un chevron, aucune tuile — c'est une ligne
                d'action, pas un bandeau. */}
            {kycInfo ? (
              <Link
                href="/profile/kyc"
                className="border-border mt-6 flex items-center gap-3 border-y py-[13px] lg:mt-8 lg:transition-opacity lg:hover:opacity-80"
              >
                <span className="min-w-0 flex-1">
                  <span className="text-text block text-[13.5px] leading-[18px] font-medium">
                    Vérification d&apos;identité
                  </span>
                  <span className="text-text-muted mt-[3px] block text-[11.5px] leading-[16px]">
                    {kycInfo.hint}
                  </span>
                </span>
                <span
                  className={cn(
                    "shrink-0 text-[11.5px] leading-[15px] font-medium",
                    kycInfo.actionClass,
                  )}
                >
                  {kycInfo.action}
                </span>
                <ChevronRight
                  size={16}
                  strokeWidth={2}
                  absoluteStrokeWidth
                  aria-hidden="true"
                  className="text-icon-muted -mr-[4px] shrink-0"
                />
              </Link>
            ) : null}

            {/* Les cartes vivent ici et nulle part ailleurs dans les onglets de
                compte : la rangée mène à l'écran de la carte, où « Alimenter »,
                « Payer » et « Bloquer » sont déjà hiérarchisés. Solde réel de la
                carte (USD), masqué par l'œil unique de l'écran. */}
            <section className="mt-6 lg:mt-8">
              <SectionHeader title="Mes cartes" />
              {cardsQuery.isError ? (
                <div className="mt-2">
                  <InlineError error={cardsQuery.error} />
                </div>
              ) : cardsQuery.isPending ? (
                <div className="border-border mt-2 border-y" aria-hidden="true">
                  {[0, 1].map((row) => (
                    <div
                      key={row}
                      className="flex items-center gap-3 py-[15px]"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="bg-surface-2 h-[13px] w-[130px] animate-pulse rounded-xs" />
                        <div className="bg-surface-2 mt-[7px] h-[11px] w-[90px] animate-pulse rounded-xs" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : cards.length === 0 ? (
                <div className="border-border mt-2 border-y">
                  <Link
                    href="/cards/new"
                    className="text-primary focus-visible:ring-primary/60 flex items-center gap-3 py-[15px] text-[13.5px] font-medium focus-visible:ring-2 focus-visible:outline-none lg:hover:opacity-80"
                  >
                    <span className="min-w-0 flex-1">Ajouter une carte</span>
                    <ChevronRight
                      size={16}
                      strokeWidth={2}
                      absoluteStrokeWidth
                      aria-hidden="true"
                      className="text-icon-muted -mr-[4px] shrink-0"
                    />
                  </Link>
                </div>
              ) : (
                <div className="border-border divide-border mt-2 divide-y border-y">
                  {cards.map((card) => (
                    <Link
                      key={card.uuid}
                      href={`/cards/${card.uuid}`}
                      className="flex items-center gap-3 py-[15px] lg:transition-opacity lg:hover:opacity-80"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="text-text block truncate font-mono text-[13px] leading-[17px] font-medium tracking-[1px]">
                          {maskedPan(card.pan_last4)}
                        </span>
                        <span className="text-text-secondary mt-[3px] flex items-center gap-[5px] text-[12.5px] leading-[16px]">
                          <StatusDot
                            size={6}
                            colorClass={STATUS_DOT[card.status]}
                          />
                          {cardStatusLabel(card.status)} · Exp{" "}
                          {cardExpiry(card)}
                        </span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="text-text-muted block text-[11.5px] leading-[15px]">
                          Solde
                        </span>
                        <span className="text-text block font-mono text-[15px] leading-[20px] font-semibold">
                          {hidden ? MASKED_BALANCE : formatMoney(card.balance)}
                        </span>
                      </span>
                      <ChevronRight
                        size={16}
                        strokeWidth={2}
                        absoluteStrokeWidth
                        aria-hidden="true"
                        className="text-icon-muted -mr-[4px] shrink-0"
                      />
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Colonne B — le flux consolidé */}
          <div className="contents lg:block">
            <section className="mt-6 lg:mt-0">
              <SectionHeader
                title="Dernières opérations"
                actionLabel="Tout voir"
                actionHref="/statistics"
              />
              {/* Mouvements réels du portefeuille (première page du relevé),
                  avec leurs états de chargement / erreur / vide réellement
                  câblés. « Tout voir » mène au relevé complet. */}
              <WalletMovements
                rows={recentRows}
                loading={txQuery.isPending}
                error={txQuery.isError ? txQuery.error : undefined}
                onRetry={() => void txQuery.refetch()}
                emptyLabel="Aucune opération pour le moment."
              />
            </section>
          </div>
        </div>
      </main>

      <BottomNav />
    </>
  );
}
