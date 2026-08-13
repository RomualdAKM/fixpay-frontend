"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Eye, EyeOff } from "lucide-react";

import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { AmountFigure } from "@/components/ui/AmountText";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TransactionItem } from "@/components/ui/TransactionItem";
import {
  CURRENCY,
  NBSP,
  formatAmount,
  formatFcfa,
  splitAmountCurrency,
} from "@/lib/format";
import {
  linkedAccounts,
  pendingOperations,
  wallet,
  walletMovements,
  type MobileMoneyAccount,
  type OperationStatus,
  type PendingOperation,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/**
 * Écran 03 · Portefeuille — LE COMPTE FCFA, pas un second tableau de bord.
 *
 * Le reproche bloquant était juste et il portait sur le produit, pas sur le
 * dessin : cet onglet reprenait la carte de solde de l'Accueil, ses deux
 * rangées de cartes et sa liste de mouvements, au titre près. Remplir les
 * onglets de la nav avec des variantes du même tableau de bord est la
 * signature la plus reconnaissable d'une application générée.
 *
 * Le partage est désormais celui de Wave, d'Orange Money ou de Revolut :
 *   Accueil       = vue d'ensemble et action rapide (solde, cartes, flux
 *                   consolidé toutes sources) ;
 *   Portefeuille  = le compte lui-même, et ce qu'aucun autre écran ne montre.
 *
 * Ce que cet écran est SEUL à porter :
 *   1. les comptes Mobile Money liés — l'objet le plus concret du produit en
 *      zone UEMOA, et le seul endroit d'où l'argent entre ;
 *   2. les opérations non abouties (compensation en cours, retrait rejeté avec
 *      son motif et sa référence) : le quotidien du Mobile Money, dont le
 *      produit ne montrait aucun état ;
 *   3. le relevé des seuls mouvements du portefeuille — dépôts, retraits,
 *      alimentations de carte. Les dépenses par carte appartiennent à l'écran
 *      de la carte ;
 *   4. la consommation du plafond, avec son dénominateur.
 *
 * Ce qui en est PARTI, et qui vit sur l'Accueil :
 *   - le hero à dégradé et ses deux actions Dépôt / Retrait. Le solde est ici
 *     composé à plat, comme une tête de relevé, avec la décomposition que
 *     l'Accueil ne fait pas (disponible / en attente / total du compte) ;
 *   - la rangée des cartes, qui a son propre onglet et son propre écran.
 * Aucun bloc, aucune liste n'est plus commun aux deux écrans.
 */

/**
 * Statut d'une opération non aboutie. Deux états seulement, chacun avec sa
 * couleur sémantique déjà présente dans le système — pas de pastille, pas de
 * tuile : le mot suffit, il est plus précis qu'une forme.
 */
const STATUS: Record<
  OperationStatus,
  { label: string; toneClass: string; amountClass: string }
> = {
  pending: {
    label: "En attente",
    toneClass: "text-warning",
    // Un crédit en compensation n'est PAS acquis : le montant reste neutre
    // tant qu'il n'a pas touché le solde. Le vert est réservé au réglé.
    amountClass: "text-text-secondary",
  },
  failed: {
    label: "Échec",
    toneClass: "text-danger",
    // Un retrait rejeté a été recrédité : son effet net est nul, le rouge
    // dirait le contraire.
    amountClass: "text-text-muted",
  },
};

/**
 * Rangée « compte Mobile Money » — même grammaire que la rangée « carte » de
 * l'Accueil (identité en mono sur la première ligne, nature du compte en
 * secondaire sur la seconde, méta et chevron à droite), appliquée à un autre
 * objet. Les deux écrans partagent une ÉCRITURE, plus un bloc.
 */
function AccountRow({ account }: { account: MobileMoneyAccount }) {
  return (
    <Link
      href="/wallet/deposit"
      className="flex items-center gap-3 py-[15px] lg:transition-opacity lg:hover:opacity-80"
    >
      <span className="min-w-0 flex-1">
        <span className="text-text block truncate font-mono text-[13px] leading-[17px] font-medium tracking-[1px]">
          {account.maskedNumber}
        </span>
        <span className="text-text-secondary mt-[3px] block truncate text-[12.5px] leading-[16px]">
          {account.operator}
          {account.primary ? " · Compte principal" : null}
        </span>
      </span>
      <span className="text-text-muted shrink-0 text-[11.5px] leading-[15px]">
        {account.linkedLabel}
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
 * Rangée d'opération non aboutie : trois lignes au lieu de deux, parce qu'elle
 * porte trois informations qu'un mouvement réglé n'a pas — un statut, un motif
 * et une référence. C'est cette différence de composition, pas une couleur de
 * fond, qui la distingue du relevé.
 */
function PendingRow({ operation }: { operation: PendingOperation }) {
  const status = STATUS[operation.status];

  return (
    <div className="border-border border-b py-[13px]">
      <div className="flex items-baseline gap-3">
        <p className="text-text min-w-0 flex-1 truncate text-[13.5px] leading-[18px] font-medium">
          {operation.title}
        </p>
        {/* Le montant garde le signe et la métrique des rangées réglées, mais
            PAS leur couleur sémantique : elle est décidée par le statut, pas
            par le sens du flux (voir STATUS). */}
        <span
          className={cn(
            "shrink-0 text-[14px] leading-[18px] font-semibold",
            status.amountClass,
          )}
        >
          <AmountFigure
            value={`${operation.amount < 0 ? "-" : "+"}${NBSP}${formatAmount(
              operation.amount,
            )}`}
          />
          <span className="text-[0.8em] font-normal tracking-normal">
            {NBSP}
            {CURRENCY}
          </span>
        </span>
      </div>
      <p className="mt-[3px] text-[11.5px] leading-[15px]">
        <span className={cn("font-medium", status.toneClass)}>
          {status.label}
        </span>
        <span className="text-text-muted">
          {" · "}
          {operation.date}
          {" · Réf. "}
          {operation.reference}
        </span>
      </p>
      <p className="text-text-muted mt-[5px] text-[11.5px] leading-[16px]">
        {operation.reason}
      </p>
    </div>
  );
}

/**
 * SÉMANTIQUE DE LA JAUGE, tranchée une bonne fois pour les deux écrans : la
 * barre montre le CONSOMMÉ, et le texte annonce toujours consommé ET total.
 * L'écran affichait « 2 000 000 FCFA restants » sous une barre remplie à 80 % :
 * le dessin disait « presque épuisé », le texte disait l'inverse.
 */
const limitPercent = Math.round(
  (wallet.monthlyUsed / wallet.monthlyLimit) * 100,
);

/** Solde découpé une seule fois : le nombre d'un côté, l'unité de l'autre. */
const { figure, currency } = splitAmountCurrency(formatFcfa(wallet.balance));

const MASKED_BALANCE = "••••••";

export default function WalletPage() {
  const [hidden, setHidden] = useState(false);
  const EyeIcon = hidden ? EyeOff : Eye;

  return (
    <>
      <main className="flex-1 px-5 pt-[52px] pb-24 lg:mx-auto lg:w-full lg:max-w-[1080px] lg:px-10 lg:pt-9 lg:pb-12">
        <AppHeader
          title="Mon portefeuille"
          bellDot
          desktopTitle="Mon portefeuille"
        />

        {/* Colonne unique en flux flex sous lg (le plafond passe en fin de
            page, `max-lg:order-last`), deux colonnes de ~484px à partir de lg.
            Ordre de lecture mobile : solde, comptes, incidents, relevé,
            plafond. */}
        <div className="flex flex-col lg:mt-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
          {/* Colonne A — le compte : solde et comptes qui l'alimentent */}
          <div className="contents lg:block">
            {/* TÊTE DE RELEVÉ, pas carte de marque. Le hero à dégradé reste sur
                l'Accueil ; ici le solde est composé à plat et il porte ce que
                l'Accueil ne montre pas : la part en compensation et le total du
                compte. Effet de bord bienvenu, le mot-symbole illisible posé
                sur le bleu de la carte disparaît avec elle. */}
            <section className="mt-4 lg:mt-0">
              <h2 className="text-text-secondary text-[12.5px] leading-[16px]">
                Solde disponible
              </h2>
              {/* Composé EXACTEMENT comme le solde du hero (32px, tracking
                  −1.5, unité détachée à 15px en graisse normale) : c'est le
                  même objet, il ne peut pas changer de gravure parce qu'il
                  change de fond. `AmountText` n'est pas utilisé ici — sa
                  réduction d'unité (0.8em) est calibrée pour l'échelle des
                  listes, elle donnerait un « FCFA » de 26px. */}
              <div className="mt-[5px] flex items-center gap-[9px]">
                <span className="text-text flex items-baseline gap-1.5">
                  <AmountFigure
                    value={hidden ? MASKED_BALANCE : figure}
                    className="text-[32px] leading-[42px] font-bold tracking-[-1.5px]"
                  />
                  {currency && (
                    <span className="text-text-secondary text-[15px] leading-5 font-normal tracking-normal">
                      {currency}
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => setHidden((v) => !v)}
                  aria-label={hidden ? "Afficher le solde" : "Masquer le solde"}
                  className="bg-surface-2 flex size-[30px] shrink-0 items-center justify-center rounded-sm"
                >
                  <EyeIcon size={14} className="text-icon-muted" aria-hidden />
                </button>
              </div>
              <p className="text-text-muted mt-2 text-[12px] leading-[17px]">
                {formatFcfa(wallet.pending)} en cours de compensation · total du
                compte {formatFcfa(wallet.balance + wallet.pending)}
              </p>
            </section>

            <section className="mt-6 lg:mt-8">
              <SectionHeader
                title="Comptes Mobile Money"
                actionLabel="Lier un compte"
                actionHref="/wallet/deposit"
              />
              {/* Une seule paire de filets pour tout le groupe, un filet entre
                  les rangées : la liste du produit, pas six surfaces. */}
              <div className="border-border divide-border mt-2 divide-y border-y">
                {linkedAccounts.map((account) => (
                  <AccountRow key={account.id} account={account} />
                ))}
              </div>
            </section>

            <section className="mt-6 max-lg:order-last lg:mt-8">
              <SectionHeader title="Consommation du plafond · avril" />
              <div className="mt-3">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-text-secondary min-w-0 truncate text-[12.5px] leading-[16px]">
                    Dépôts et retraits
                  </p>
                  <p className="text-text-secondary shrink-0 text-[12.5px] leading-[16px] font-medium">
                    {formatAmount(wallet.monthlyUsed)} sur{" "}
                    {formatFcfa(wallet.monthlyLimit)}
                  </p>
                </div>
                <div className="mt-2">
                  <ProgressBar percent={limitPercent} />
                </div>
              </div>
            </section>
          </div>

          {/* Colonne B — ce qui bouge : incidents d'abord, relevé ensuite */}
          <div className="contents lg:block">
            <section className="mt-6 lg:mt-0">
              <SectionHeader title="En attente et échecs" />
              <div className="mt-3 [&>*:last-child]:border-b-0">
                {pendingOperations.map((operation) => (
                  <PendingRow key={operation.id} operation={operation} />
                ))}
              </div>
            </section>

            <section className="mt-6 lg:mt-8">
              <SectionHeader
                title="Mouvements du portefeuille"
                actionLabel="Tout voir"
                actionHref="/statistics"
              />
              {/* Aucun visuel de tête : la direction est déjà portée par le
                  signe et la couleur du montant, à droite. La pastille était un
                  troisième signal pour la même information, et c'est elle qui
                  creusait la gouttière vide de l'Accueil. Un seul bord gauche,
                  ici comme là-bas. */}
              <div className="mt-3 [&>*:last-child]:border-b-0">
                {walletMovements.map((movement) => (
                  <TransactionItem key={movement.id} transaction={movement} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      <BottomNav />
    </>
  );
}
