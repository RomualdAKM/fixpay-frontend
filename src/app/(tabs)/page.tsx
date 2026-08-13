"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { InlineError } from "@/components/feedback/InlineError";
import { CardRow, CardRowList } from "@/components/ui/CardRow";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { WalletMovements } from "@/components/ui/WalletMovements";
import {
  WalletHeroActions,
  WalletHeroCard,
} from "@/components/ui/WalletHeroCard";
import { useWallet, useWalletTransactions } from "@/lib/api/moneyHooks";
import { walletTransactionToRow } from "@/lib/api/presenters";
import { formatAmount, formatFcfa } from "@/lib/format";
import { formatMoney } from "@/lib/money";
import { cards, depositFacts, verification, withdrawFacts } from "@/lib/mock-data";

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
 * La répartition avec l'écran 03 est désormais tranchée : l'Accueil donne la
 * vue d'ensemble et l'action rapide (solde, cartes, flux consolidé toutes
 * sources, plafonds), le Portefeuille montre le compte FCFA lui-même — comptes
 * Mobile Money liés, opérations non abouties, relevé du seul portefeuille. Les
 * deux écrans ne partagent plus ni bloc ni liste.
 *
 * LA LISTE — « dernières opérations » veut dire TOUTES SOURCES : les dépenses
 * par carte et les mouvements du portefeuille, dans un seul ordre
 * chronologique. C'est ce qu'un tableau de bord doit répondre, et c'est aussi
 * ce qui la rend structurellement différente du relevé de l'écran 03, qui
 * n'expose que le second jeu. Les deux vues sortent d'un grand livre unique
 * (voir `mock-data`) : plus aucune ligne n'est saisie deux fois.
 *
 * LA GOUTTIÈRE — tranchée dans l'autre sens que la passe précédente. Les
 * mouvements internes portaient une pastille de direction, les lignes
 * marchands réservaient sa place : 41px de vide devant le texte d'une ligne
 * sur deux, et une liste qui paraissait cassée plutôt que sobre. Donner la
 * pastille à toutes les lignes reconstituerait la colonne de glyphes
 * identiques que l'audit a fait supprimer ; elle est donc RETIRÉE. Le sens du
 * mouvement est déjà porté par le signe et la couleur du montant, à droite —
 * la pastille était un troisième signal pour la même information. Tout
 * commence au même bord, ici comme sur l'écran 03.
 *
 * RYTHME VERTICAL — inchangé, sur une échelle de 4 pas et un seul rôle par
 * pas : 8 à l'intérieur d'un groupe, 12 d'un en-tête à sa première rangée,
 * 16 de l'en-tête de page au premier bloc, 24 entre deux groupes (32 en
 * desktop). Le plafond du mobile passe en fin de page (`max-lg:order-last`)
 * sans être dupliqué : c'est le même contenu, dans la colonne où il tombe.
 *
 * DENSITÉ — la page s'arrêtait à mi-hauteur d'un 1440×900. Elle porte
 * maintenant, sans un pixel de décor ajouté : le coût réel des deux actions du
 * hero, l'état de vérification qui explique les plafonds, le flux consolidé
 * (9 lignes au lieu de 5) et les plafonds avec leur dénominateur.
 */
export default function HomePage() {
  // Un SEUL œil sur l'écran : le geste « masquer mes soldes » est un geste de
  // confidentialité, pas un réglage par bloc.
  const [hidden, setHidden] = useState(false);

  const walletQuery = useWallet();
  const txQuery = useWalletTransactions();

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
          {/* Colonne A — argent : solde, vérification, cartes, plafonds */}
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

            {/* LE COÛT DES DEUX ACTIONS, sous les deux actions. « Dépôt » et
                « Retrait » étaient exposés en primaire sans frais ni délai :
                sur un produit de recharge Mobile Money ouest-africain, une
                opération sans contrepartie chiffrée n'est pas crédible. Les
                valeurs sortent des mêmes objets que les écrans 04 et 05 (rien
                n'est réécrit ici), donc le prix annoncé sur le tableau de bord
                est exactement celui du tunnel. */}
            <p className="text-text-muted mt-2 text-[12px] leading-[17px]">
              Dépôt&nbsp;: {depositFacts.feeLabel.toLowerCase()}, crédité{" "}
              {depositFacts.delay.toLowerCase()} · Retrait&nbsp;:{" "}
              {withdrawFacts.feeLabel}, {withdrawFacts.delay.toLowerCase()}
            </p>

            {/* CE QUI EXPLIQUE LES PLAFONDS, 200px au-dessus d'eux. Un compte à
                1,8 M FCFA de solde avec un KYC inachevé n'est pas une
                incohérence — c'est un palier — mais le produit ne le disait
                nulle part, et la notification de blocage (écran 28) arrivait
                sans affordance. Ligne nue à filets, un chevron, aucune tuile,
                aucun fond teinté : c'est une ligne d'action, pas un bandeau. */}
            <Link
              href="/profile/kyc"
              className="border-border mt-6 flex items-center gap-3 border-y py-[13px] lg:mt-8 lg:transition-opacity lg:hover:opacity-80"
            >
              <span className="min-w-0 flex-1">
                <span className="text-text block text-[13.5px] leading-[18px] font-medium">
                  Vérification d&apos;identité
                </span>
                <span className="text-text-muted mt-[3px] block text-[11.5px] leading-[16px]">
                  {verification.currentTitle} à fournir pour porter votre
                  plafond mensuel à{" "}
                  {formatFcfa(verification.upgradedMonthlyLimit)}.
                </span>
              </span>
              <span className="text-warning shrink-0 text-[11.5px] leading-[15px] font-medium">
                Étape {verification.step} sur {verification.total}
              </span>
              <ChevronRight
                size={16}
                strokeWidth={2}
                absoluteStrokeWidth
                aria-hidden="true"
                className="text-icon-muted -mr-[4px] shrink-0"
              />
            </Link>

            {/* Les cartes vivent ici et nulle part ailleurs dans les onglets de
                compte : la rangée mène à l'écran de la carte, où « Alimenter »,
                « Payer » et « Bloquer » sont déjà hiérarchisés. */}
            <section className="mt-6 lg:mt-8">
              <SectionHeader title="Mes cartes" />
              <CardRowList className="mt-2">
                {cards.map((card) => (
                  <CardRow key={card.id} card={card} hidden={hidden} />
                ))}
              </CardRowList>
            </section>

            {/* SÉMANTIQUE DE LA JAUGE, tranchée pour les deux écrans : la barre
                montre le CONSOMMÉ, et le texte annonce toujours consommé ET
                total. « 190 000 restants » sous une barre remplie aux deux
                tiers laissait le lecteur arbitrer entre le dessin et le
                chiffre ; sans dénominateur, deux jauges voisines n'étaient même
                pas comparables. Le titre du groupe porte le mot qui lève
                l'ambiguïté, une fois, pour les deux rangées et leurs barres. */}
            <section className="mt-6 max-lg:order-last lg:mt-8">
              <SectionHeader title="Consommation des plafonds · avril" />
              <ul className="mt-3 space-y-4">
                {cards.map((card) => (
                  <li key={card.id}>
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-text-secondary min-w-0 truncate text-[12.5px] leading-[16px]">
                        {card.label}
                      </p>
                      <p className="text-text-secondary shrink-0 text-[12.5px] leading-[16px] font-medium">
                        {formatAmount(card.monthlyUsed)} sur{" "}
                        {formatFcfa(card.monthlyLimit)}
                      </p>
                    </div>
                    <div className="mt-2">
                      <ProgressBar
                        percent={Math.round(
                          (card.monthlyUsed / card.monthlyLimit) * 100,
                        )}
                      />
                    </div>
                  </li>
                ))}
              </ul>
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
                  câblés. La liste s'arrête à la dernière rangée sans filet
                  orphelin ; « Tout voir » mène au relevé complet. */}
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
