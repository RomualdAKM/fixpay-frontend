"use client";

import { useState } from "react";

import { BottomNav } from "@/components/layout/BottomNav";
import { PageHeader } from "@/components/layout/PageHeader";
import { InfoBanner } from "@/components/ui/InfoBanner";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { formatFcfa } from "@/lib/format";
import { loyalty } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/** 100 points = 1 000 FCFA de réduction, soit 10 FCFA le point. */
const POINT_VALUE = 10;

/** Les points acquis expirent à la fin de l'année civile suivante. */
const EXPIRY = "31 déc. 2026";

interface Tier {
  name: string;
  from: number;
  perk: string;
}

const BRONZE: Tier = {
  name: "Bronze",
  from: 0,
  perk: "1 point par tranche de 100 FCFA",
};
const TIERS: Tier[] = [
  BRONZE,
  { name: "Argent", from: 200, perk: "Retraits Mobile Money sans frais" },
  { name: "Or", from: 300, perk: "Création de carte virtuelle offerte" },
];

interface Reward {
  id: string;
  label: string;
  detail: string;
  cost: number;
}

const REWARDS: Reward[] = [
  {
    id: "reduction-1000",
    label: `${formatFcfa(1_000)} de réduction`,
    detail: "Déduits de votre prochain paiement par carte",
    cost: 100,
  },
  {
    id: "retraits-offerts",
    label: "Frais de retrait offerts",
    detail: "Retraits Mobile Money sans commission pendant 30 jours",
    cost: 300,
  },
  {
    id: "reduction-5000",
    label: `${formatFcfa(5_000)} de réduction`,
    detail: "Déduits de votre prochain paiement par carte",
    cost: 500,
  },
];

interface PointEntry {
  id: string;
  label: string;
  date: string;
  points: number;
}

/**
 * Historique des points — l'écran n'en portait aucun. Le solde de démo (240)
 * est la somme exacte de ces trois mouvements : deux achats crédités à raison
 * d'1 point par tranche de 100 FCFA, moins une réduction déjà utilisée.
 */
const INITIAL_HISTORY: PointEntry[] = [
  { id: "hist-amazon", label: "Paiement Amazon", date: "14 avr.", points: 393 },
  {
    id: "hist-spotify",
    label: "Paiement Spotify",
    date: "12 avr.",
    points: 65,
  },
  {
    id: "hist-reduction",
    label: "Réduction utilisée",
    date: "11 avr.",
    points: -218,
  },
];

/**
 * Écran 18 · Fidélité — solde de points à plat, progression vers le palier
 * suivant, historique des points et catalogue de récompenses échangeables.
 *
 * Recomposition post-audit : le « 240 » de 42px centré sur un dégradé était la
 * composition canonique de l'écran de succès générique appliquée à un solde de
 * fidélité, pour un écran rempli à 30 %. Le solde redescend en en-tête à plat
 * aligné à gauche, l'or de la palette (jusque-là réservé à la puce de la carte)
 * devient la couleur du programme, et le point abstrait est traduit en FCFA, en
 * progression de palier, en date d'expiration et en action d'échange.
 */
export default function LoyaltyPage() {
  const [balance, setBalance] = useState(loyalty.points);
  const [history, setHistory] = useState<PointEntry[]>(INITIAL_HISTORY);
  const [redeemed, setRedeemed] = useState<string[]>([]);

  const tier = TIERS.filter((item) => balance >= item.from).at(-1) ?? BRONZE;
  const nextTier = TIERS.find((item) => item.from > balance);
  const progress = nextTier
    ? Math.round(((balance - tier.from) / (nextTier.from - tier.from)) * 100)
    : 100;

  const redeem = (reward: Reward) => {
    setBalance((previous) => previous - reward.cost);
    setRedeemed((previous) => [...previous, reward.id]);
    setHistory((previous) => [
      {
        id: `hist-${reward.id}`,
        label: reward.label,
        date: "À l'instant",
        points: -reward.cost,
      },
      ...previous,
    ]);
  };

  return (
    <>
      <main className="px-5 pt-[54px] pb-24 lg:mx-auto lg:w-full lg:max-w-[860px] lg:px-10 lg:pt-9 lg:pb-12">
        <PageHeader title="Programme fidélité" backHref="/profile" />

        {/* Solde à plat, aligné à gauche : ni dégradé, ni centrage, ni carte. */}
        <div className="mt-6 flex items-end justify-between gap-4">
          <div>
            <SectionLabel>Vos points</SectionLabel>
            <p className="text-gold mt-1 text-[34px] leading-[42px] font-bold tracking-[-0.02em]">
              {balance}
            </p>
            <p className="text-text-secondary mt-1 text-[13px] leading-[18px]">
              = {formatFcfa(balance * POINT_VALUE)} de réduction
            </p>
          </div>
          <p className="text-text-muted text-right text-[11.5px] leading-[16px]">
            Expirent le
            <br />
            {EXPIRY}
          </p>
        </div>

        <div className="border-border mt-5 border-t pt-4">
          <div className="flex items-baseline justify-between gap-3">
            <SectionLabel>{`Palier ${tier.name}`}</SectionLabel>
            <span className="text-text-muted text-[12px] leading-[16px]">
              {nextTier
                ? `${nextTier.from - balance} points avant ${nextTier.name}`
                : "Palier maximum atteint"}
            </span>
          </div>
          {/*
            Barre en OR : la fidélité est le territoire de la seconde couleur
            de marque (audit [I] — l'or des tokens ne servait qu'à la puce de
            la carte, et le bleu était partout).
          */}
          <div
            role="progressbar"
            aria-label={
              nextTier
                ? `Progression vers le palier ${nextTier.name}`
                : "Palier maximum atteint"
            }
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            className="bg-border mt-2.5 h-1.5 w-full overflow-hidden rounded-xs"
          >
            <div
              className="bg-gold h-full rounded-xs"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
          <p className="text-text-muted mt-2 text-[12px] leading-[17px]">
            {nextTier
              ? `Au palier ${nextTier.name} : ${nextTier.perk.toLowerCase()}.`
              : `Votre palier : ${tier.perk.toLowerCase()}.`}
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-10">
          <section>
            <SectionLabel className="mt-6">Échanger mes points</SectionLabel>
            <ul className="divide-border mt-1 divide-y">
              {REWARDS.map((reward) => {
                const isRedeemed = redeemed.includes(reward.id);
                const affordable = balance >= reward.cost;
                const missing = reward.cost - balance;

                return (
                  <li
                    key={reward.id}
                    className="flex items-center justify-between gap-4 py-3.5"
                  >
                    <div className="min-w-0">
                      <p className="text-text text-[13.5px] leading-[18px] font-medium">
                        {reward.label}
                      </p>
                      <p className="text-text-muted mt-[3px] text-[12px] leading-[16px]">
                        {reward.detail}
                      </p>
                      <p
                        className={cn(
                          "mt-[3px] text-[12px] leading-[16px] font-medium",
                          isRedeemed
                            ? "text-success"
                            : affordable
                              ? "text-gold"
                              : "text-text-muted",
                        )}
                      >
                        {isRedeemed
                          ? "Échangé"
                          : affordable
                            ? `${reward.cost} points`
                            : `${reward.cost} points · il vous en manque ${missing}`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => redeem(reward)}
                      disabled={!affordable || isRedeemed}
                      className="border-border-strong bg-surface text-text enabled:hover:bg-surface-2 focus-visible:ring-primary/60 h-9 shrink-0 rounded-md border px-4 text-[12.5px] font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-default disabled:opacity-45"
                    >
                      {isRedeemed ? "Utilisé" : "Échanger"}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <section>
            <SectionLabel className="mt-6">Mouvements de points</SectionLabel>
            <ul className="divide-border mt-1 divide-y">
              {history.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-text truncate text-[13.5px] leading-[18px] font-medium">
                      {entry.label}
                    </p>
                    <p className="text-text-muted mt-[2px] text-[11.5px] leading-[15px]">
                      {entry.date}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 text-[13.5px] leading-[18px] font-medium",
                      entry.points > 0 ? "text-gold" : "text-text-secondary",
                    )}
                  >
                    {entry.points > 0 ? "+" : "−"} {Math.abs(entry.points)} pts
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="mt-6">
          <InfoBanner>
            Vous gagnez 1 point par tranche de 100 FCFA dépensée avec une carte
            FixPay. 100 points valent {formatFcfa(1_000)} de réduction, déduits
            de votre prochain paiement. Les points non utilisés expirent le{" "}
            {EXPIRY}.
          </InfoBanner>
        </div>
      </main>

      <BottomNav />
    </>
  );
}
