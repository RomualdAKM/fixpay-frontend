"use client";

import { use, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";

import { BottomNav } from "@/components/layout/BottomNav";
import { AmountFigure } from "@/components/ui/AmountText";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SettingsToggleRow } from "@/components/ui/SettingsToggleRow";
import { VirtualCard } from "@/components/ui/VirtualCard";
import { NBSP, formatFcfa } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  cardTopUpFacts,
  cardWithdrawFacts,
  cards,
  cardTransactions,
  homeTransactions,
  type Transaction,
} from "@/lib/mock-data";

/** Fully masked values shown while the balance/number are hidden. */
const MASKED_BALANCE = "••••••";
const MASKED_CARD_NUMBER = "•••• •••• •••• ••••";

/**
 * Le titre de l'écran nomme l'objet SANS reprendre ses quatre derniers
 * chiffres : la face de la carte, 60px plus bas, les porte déjà. C'est ce
 * doublon — « Détail de la carte » puis une ligne « Visa •••• 4291 » collée
 * sous une carte affichant « •••• 4291 » — que les DA relevaient.
 */
const BRAND_NAME: Record<string, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
};

/**
 * Parité fixe de l'euro face au franc CFA (le franc CFA est arrimé à l'euro).
 * La carte est facturée en euros et le compte tenu en francs : l'audit relève
 * que le taux, sujet central d'une carte virtuelle africaine, n'était écrit
 * nulle part, PUIS que le poser en en-tête ne suffisait pas — l'utilisateur
 * faisait toujours la conversion de tête, ligne par ligne.
 */
const EUR_TO_FCFA = 655.957;
const EUR_RATE = "1 € = 655,957 FCFA";

/**
 * Frais d'émission d'une carte virtuelle — le total que l'écran 09 facture
 * avant création (« 3 000 FCFA · payé via Mobile Money »). Il est écrit ici en
 * clair et non lu dans `mock-data`, qui ne le porte pas encore : la carte
 * devrait exposer son propre tarif d'émission au même titre que son plafond
 * (voir la note de livraison). La valeur est reprise telle quelle pour qu'un
 * utilisateur qui revient sur sa carte retrouve le prix qu'il a payé.
 */
const ISSUANCE_FEE = 3_000;

/** Montant de règlement en euros, signe suivi d'une espace : « - €59.99 ». */
function eurLabel(transaction: Transaction): string {
  const sign = transaction.direction === "debit" ? "-" : "+";
  return `${sign} €${Math.abs(transaction.amount).toFixed(2)}`;
}

/**
 * Montant en francs D'ENREGISTREMENT d'une dépense carte.
 *
 * Les écrans 02 et 11 affichent déjà ces mêmes achats en francs (Amazon
 * − 39 341, Spotify − 6 554, Booking.com − 223 026). Reconvertir l'euro au
 * taux donnerait ici − 39 351, − 6 553 et − 223 025 : la même dépense
 * porterait deux montants selon l'écran, c'est-à-dire exactement la
 * divergence inter-écrans relevée par les DA sur l'écran 11, simplement
 * inversée. On réutilise donc le montant déjà affiché ailleurs — identifié
 * par son libellé et son horodatage, tous deux communs aux deux jeux — et on
 * ne convertit au taux que les mouvements qui n'apparaissent nulle part
 * ailleurs (le remboursement).
 *
 * Cette jointure est le symptôme d'un manque de `mock-data`, non modifiable
 * dans ce lot : une transaction devrait porter sa devise de règlement à côté
 * de son montant de compte (voir la note de livraison).
 */
const FCFA_OF_RECORD = new Map<string, number>(
  homeTransactions.map(
    (movement) =>
      [`${movement.title}|${movement.at}`, movement.amount] as const,
  ),
);

function fcfaAmount(transaction: Transaction): number {
  return (
    FCFA_OF_RECORD.get(`${transaction.title}|${transaction.at}`) ??
    Math.round(transaction.amount * EUR_TO_FCFA)
  );
}

/**
 * Rangée de transaction carte à DOUBLE DEVISE (reproche bloquant de l'écran
 * 10). Le franc CFA est la devise du compte, donc du produit : il passe en
 * principal, à la graisse et à la couleur de toutes les autres listes de
 * l'app, et l'euro — la devise de règlement du réseau — se lit en second, à
 * la place où les rangées de l'Accueil portent leur date. Deux effets : plus
 * aucun calcul mental, et la même dépense n'est plus libellée en euros ici et
 * en francs sur l'écran 11.
 *
 * La métrique reprend celle de `TransactionItem` (65px, hairline basse, titre
 * 13,5px, méta 11,5px) pour que 02, 03, 10 et 11 restent la même liste.
 *
 * COULEUR DU MONTANT — « colorer la variation, pas la valeur ». Les quatre
 * lignes étaient peintes en entier, chiffres et unité compris, en rouge
 * saturé. Sur une liste où tout est un débit, le rouge n'encode rien : il ne
 * distingue pas, il crie. Le signe « − » porte le sens du mouvement, le
 * montant reprend l'encre du produit, et la couleur est rendue au SEUL
 * mouvement qui sort de l'attendu de cet écran — le remboursement, qui
 * remonte en vert. Le rouge disparaît donc de la liste sans que l'écran perde
 * une information : il en gagne une, la ligne qui n'est pas une dépense.
 */
function CardTransactionRow({
  transaction,
  last,
}: {
  transaction: Transaction;
  last: boolean;
}) {
  const fcfa = fcfaAmount(transaction);
  const credit = transaction.direction === "credit";

  return (
    <div
      className={cn(
        "flex min-h-[65px] items-center gap-[13px] py-2.5",
        !last && "border-border border-b",
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-text truncate text-[13.5px] font-medium">
          {transaction.title}
        </p>
        <p className="text-text-muted mt-[2px] truncate text-[11.5px]">
          {transaction.date}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <AmountFigure
          value={`${credit ? "+" : "-"}${NBSP}${formatFcfa(fcfa)}`}
          className={cn(
            "block text-[14px] font-semibold",
            credit ? "text-success" : "text-text",
          )}
        />
        <span className="text-text-muted mt-[2px] block text-[11.5px]">
          {eurLabel(transaction)}
        </span>
      </div>
    </div>
  );
}

/**
 * Ligne de spécification : l'intitulé à gauche, la valeur à droite, et — quand
 * la valeur seule ne suffit pas — une précision en seconde ligne sous
 * l'intitulé. Même métrique que les rangées de liste du produit (filet bas,
 * 13px / 11,5px), aucune carte, aucune tuile : c'est un relevé, pas un
 * panneau.
 */
function SpecRow({
  term,
  value,
  note,
  last = false,
}: {
  term: string;
  value: string;
  note?: string;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-4 py-[11px]",
        !last && "border-border border-b",
      )}
    >
      <div className="min-w-0">
        <p className="text-text text-[13px] leading-[17px]">{term}</p>
        {note ? (
          <p className="text-text-muted mt-[2px] text-[11.5px] leading-[15px]">
            {note}
          </p>
        ) : null}
      </div>
      <p className="text-text shrink-0 text-[13px] leading-[17px] font-semibold">
        {value}
      </p>
    </div>
  );
}

/**
 * Écran 10 · Détail Carte — un seul objet en relief (la carte), tout le reste
 * posé à plat : solde en typo nue avec bascule Masquer/Afficher, plafond
 * mensuel exprimé par ce qu'il RESTE à dépenser, actions hiérarchisées
 * (Alimenter primaire, Payer secondaire, Bloquer en zone de danger) et
 * transactions de la carte en double devise.
 *
 * ÉTAPE 12 · DENSITÉ ET SYMÉTRIE DES BREAKPOINTS. Deux reproches liés :
 * « la colonne de gauche s'arrête à y≈550 et la droite à y≈600, laissant les
 * 300 px inférieurs entièrement vides » et « la note de parité et le bloc
 * Bloquer la carte n'existent que sur desktop ». Le second explique le
 * premier : l'écran n'avait pas assez à dire pour deux colonnes de 900px, et
 * ce qu'il avait à dire de plus « observé » était relégué en fin de flux.
 *
 * Deux blocs sont ajoutés, tous deux composés de faits que le produit tient
 * déjà ailleurs — aucun remplissage :
 *
 * - FRAIS ET CONDITIONS (colonne A, sous les actions) : la devise de règlement
 *   et sa parité, le tarif de l'alimentation et du rapatriement lus dans
 *   `cardTopUpFacts` / `cardWithdrawFacts` (donc strictement ceux des écrans 06
 *   et 07), le prix d'émission de l'écran 09 et la gratuité du blocage. La
 *   PARITÉ EST LA PREMIÈRE LIGNE : c'est ce qui la fait entrer dans le premier
 *   viewport mobile, où elle manquait. Elle disparaît en conséquence du pied de
 *   la liste de transactions, qui ne garde que la règle de lecture — un taux
 *   écrit deux fois sur un même écran est un taux qu'on finit par contredire.
 *   Ce bloc répond aussi, à l'échelle du produit, au reproche « gratuité
 *   affirmée sans règle lisible » : la règle est écrite, une fois, à l'endroit
 *   où l'on vient chercher les conditions de sa carte.
 *
 * - PARAMÈTRES DE PAIEMENT (colonne B) : trois interrupteurs réels — en ligne,
 *   récurrent, hors zone UEMOA. C'est ce qu'une carte virtuelle permet et que
 *   l'écran ne proposait pas ; ils tombent naturellement au-dessus de la zone
 *   de danger, du réglage réversible vers l'action irréversible.
 *
 * CE QUI RESTE (assumé) : la face reste un dégradé bleu-sur-bleu, et le porteur
 * « JEAN DUPONT » un nom de démonstration. `VirtualCard` et `mock-data` sont
 * partagés par sept écrans et sont hors de ce lot ; les corriger ici en
 * produirait une variante de plus, ce qui est exactement le défaut d'origine.
 */
export default function CardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [hidden, setHidden] = useState(false);
  // Blocage : deux temps (demande puis confirmation), comme toute action
  // destructive. L'audit relevait un « Bloquer » de même poids visuel que
  // « Alimenter », et sans le moindre comportement.
  const [confirmBlock, setConfirmBlock] = useState(false);
  const [blocked, setBlocked] = useState(false);
  // Réglages de la carte : réversibles, donc à un seul temps — c'est ce qui
  // les distingue du blocage juste en dessous, qui en demande deux.
  const [onlinePayments, setOnlinePayments] = useState(true);
  const [recurringPayments, setRecurringPayments] = useState(true);
  const [foreignPayments, setForeignPayments] = useState(true);
  const { id } = use(params);

  const card = cards.find((c) => c.id === id);
  if (!card) notFound();

  const EyeIcon = hidden ? EyeOff : Eye;
  const usedPercent = Math.round((card.monthlyUsed / card.monthlyLimit) * 100);
  const remaining = card.monthlyLimit - card.monthlyUsed;

  return (
    <>
      <main className="flex-1 px-5 pt-[54px] pb-24 lg:mx-auto lg:w-full lg:max-w-[1080px] lg:px-10 lg:pt-9 lg:pb-12">
        <header className="flex items-center gap-3.5">
          <IconButton
            icon={ChevronLeft}
            size={38}
            iconClass="text-text"
            ariaLabel="Retour"
            onClick={() => router.back()}
          />
          <h1 className="text-text min-w-0 truncate text-[19px] leading-tight font-bold lg:text-[22px]">
            Carte {BRAND_NAME[card.brand] ?? card.brand} virtuelle
          </h1>
        </header>

        {/* Desktop : colonne A = carte + solde + plafond + actions,
            colonne B = activité. `contents` préserve le flux mobile.

            RYTHME VERTICAL — l'écran n'était qu'une pile d'intervalles de 14 à
            24px, tous voisins, qui ne disait pas où un groupe finissait. Il se
            lit maintenant en trois groupes, et l'échelle porte le rôle :
              12  à l'intérieur d'un groupe (le solde et le plafond qui le
                  borne sont UNE information, pas deux) ;
              16 / 20 entre le titre et l'objet, entre l'objet et ses chiffres ;
              24 / 32 entre deux groupes, et rien d'autre à ces valeurs.
            Groupes : (1) l'objet — titre et carte, (2) son état — solde et
            plafond, (3) ce qu'on en fait — actions, puis (4) son activité. */}
        <div className="contents lg:mt-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
          <div className="contents lg:block">
            <div className="mt-4 lg:mt-0">
              <VirtualCard
                size="lg"
                brand={card.brand}
                number={hidden ? MASKED_CARD_NUMBER : card.maskedNumber}
                holder={card.holder}
                expiry={card.expiry}
              />
            </div>

            {/* ---- Solde : typographie nue, aucun panneau ----
                La ligne « Visa •••• 4291 » en DM Mono a été retirée : elle
                répétait 60px plus bas ce que la face affiche déjà. L'identité
                de la carte est remontée dans le titre de l'écran, où elle
                remplace un « Détail de la carte » qui n'apprenait rien. */}
            <div className="mt-5 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {/* « Solde disponible » créait la contradiction relevée par
                      les DA (816 202 disponibles sur une carte qui ne peut
                      plus dépenser que 190 000). Le solde est le montant
                      CHARGÉ ; ce qui est dépensable est dit juste dessous. */}
                  <SectionLabel>Solde de la carte</SectionLabel>
                  {blocked ? (
                    <span className="text-danger shrink-0 text-[12px] font-semibold">
                      Carte bloquée
                    </span>
                  ) : (
                    <Badge tone="success">{card.status}</Badge>
                  )}
                </div>
                <p className="text-text mt-1 truncate text-[26px] leading-[34px] font-bold tracking-[-0.02em]">
                  {hidden ? MASKED_BALANCE : formatFcfa(card.balance)}
                </p>
              </div>
              <IconButton
                icon={EyeIcon}
                size={30}
                iconClass="text-text-secondary"
                label={hidden ? "Afficher" : "Masquer"}
                onClick={() => setHidden((v) => !v)}
              />
            </div>

            {/* ---- Plafond mensuel, exprimé par le montant réellement
                    dépensable : c'est lui qui borne le solde ci-dessus, donc
                    il lui est COLLÉ (12px) — les deux ne font qu'une
                    information. La note passe de deux lignes à une : « déjà
                    dépensés sur un plafond de … par mois · … % utilisé »
                    reformulait en 90 caractères ce que la jauge montre. ---- */}
            <section className="mt-3">
              <div className="flex items-baseline justify-between gap-3">
                <SectionLabel>
                  Dépensable d&apos;ici la fin du mois
                </SectionLabel>
                <span className="text-text shrink-0 text-[15px] leading-[20px] font-semibold">
                  {formatFcfa(remaining)}
                </span>
              </div>
              <div className="mt-2">
                <ProgressBar percent={usedPercent} />
              </div>
              <p className="text-text-muted mt-2 text-[11.5px] leading-[15px]">
                {usedPercent} % du plafond de {formatFcfa(card.monthlyLimit)}{" "}
                utilisés ce mois-ci
              </p>
            </section>

            {/* ---- Actions hiérarchisées ----
                Sur une seule rangée, et non deux blocs de 88px empilés : les
                deux CTA repoussaient à eux seuls toute la liste des
                transactions sous la ligne de flottaison mobile. Le rapport
                1,4 / 1 garde la hiérarchie que ne donnait pas un 50/50. */}
            <div className="mt-6">
              {blocked ? (
                <Button onClick={() => setBlocked(false)}>
                  Débloquer la carte
                </Button>
              ) : (
                <div className="flex gap-2.5">
                  <Button href="/cards/top-up" className="flex-[1.4]">
                    Alimenter
                  </Button>
                  {/* Le libellé du secondaire était rendu en
                      `--c-text-secondary` (#93A0C3 sur #141826) : posé à côté
                      d'un blanc plein sur bleu, il se lisait comme un bouton
                      désactivé. La hiérarchie d'un secondaire se joue sur la
                      SURFACE (aplat de marque contre verre bordé), pas en
                      éteignant son texte — c'est le reproche fait au bouton
                      WhatsApp de l'écran 17. L'encre repasse en `text-text`,
                      la largeur (1 / 1,4) et le fond continuent de dire
                      lequel des deux est l'action principale. */}
                  <Button
                    variant="glass"
                    href="/payment"
                    className="text-text flex-1"
                  >
                    Payer
                  </Button>
                </div>
              )}
            </div>

            {/* ---- Frais et conditions ----
                    La devise de règlement EN TÊTE : c'est l'information la
                    plus spécifique de l'écran et la seule que le mobile ne
                    voyait jamais. Les deux lignes de transfert lisent
                    `cardTopUpFacts` / `cardWithdrawFacts` : impossible qu'elles
                    divergent des écrans 06 et 07. ---- */}
            <section className="mt-8">
              <SectionHeader title="Frais et conditions" />
              <div className="mt-2">
                <SpecRow
                  term="Devise de règlement"
                  note={`Convertie en francs au taux fixe · ${EUR_RATE}`}
                  value="EUR"
                />
                <SpecRow
                  term="Alimenter depuis le portefeuille"
                  note={cardTopUpFacts.delay}
                  value={cardTopUpFacts.feeLabel}
                />
                <SpecRow
                  term="Rapatrier vers le portefeuille"
                  note={cardWithdrawFacts.delay}
                  value={cardWithdrawFacts.feeLabel}
                />
                <SpecRow
                  term="Émission de la carte"
                  note="prélevés une seule fois, à la création"
                  value={formatFcfa(ISSUANCE_FEE)}
                />
                <SpecRow
                  term="Blocage et déblocage"
                  note="autant de fois que nécessaire"
                  value="Gratuit"
                  last
                />
              </div>
            </section>
          </div>

          {/* ---- Colonne B : activité ---- */}
          <div className="contents lg:block">
            <div className="mt-8 lg:mt-0">
              <SectionHeader title="Transactions" />
              <div className="mt-2">
                {cardTransactions.map((transaction, index) => (
                  <CardTransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    last={index === cardTransactions.length - 1}
                  />
                ))}
              </div>
              {/* NOTE DE BAS DE LISTE, et non d'en-tête. La phrase dit ce que
                  chaque rangée montre — un débit en francs, un règlement en
                  euros — sans promettre que la paire est un produit exact : le
                  franc débité est arrondi, comme sur un relevé réel. Elle
                  occupait deux lignes AVANT la liste, soit ~30px pris sur le
                  premier viewport mobile, là où la première transaction était
                  déjà tranchée par la BottomNav. Une note de lecture se lit
                  après ce qu'elle explique. */}
              <p className="text-text-muted mt-2.5 text-[11.5px] leading-[15px]">
                Débitées en francs sur votre compte, réglées en euros au
                commerçant. Le franc débité est arrondi, comme sur un relevé.
              </p>
            </div>

            {/* ---- Paramètres de paiement ----
                    Réversibles, donc à un temps, et posés à même la page comme
                    les réglages des écrans 14 et 15 : même composant, même
                    hauteur de rangée. Ils précèdent la zone de danger parce que
                    couper les paiements récurrents est souvent ce qu'on venait
                    faire quand on croyait devoir bloquer la carte. ---- */}
            {!blocked && (
              <section className="mt-8">
                <SectionHeader title="Paramètres de paiement" />
                <div className="mt-1">
                  <SettingsToggleRow
                    title="Paiements en ligne"
                    subtitle="Achats sur les sites marchands"
                    checked={onlinePayments}
                    onChange={setOnlinePayments}
                    divider
                  />
                  <SettingsToggleRow
                    title="Paiements récurrents"
                    subtitle="Abonnements prélevés chaque mois"
                    checked={recurringPayments}
                    onChange={setRecurringPayments}
                    divider
                  />
                  <SettingsToggleRow
                    title="Paiements hors zone UEMOA"
                    subtitle="Commerçants facturant en devise étrangère"
                    checked={foreignPayments}
                    onChange={setForeignPayments}
                  />
                </div>
              </section>
            )}

            {/* ---- Zone de danger ----
                L'action la plus destructive de l'écran était un lien texte
                rouge nu, seul, hors conteneur, flottant sous la liste dans une
                zone vide : le même poids typographique qu'un « Tout voir ».
                Elle est maintenant DANS un objet — un bloc bordé, titré, qui
                dit ce que le blocage fait avant qu'on le demande — et la
                confirmation se déplie à l'intérieur de ce même bloc, sans
                déplacer quoi que ce soit autour. ---- */}
            {!blocked && (
              <div className="border-border mt-8 rounded-lg border p-4">
                <p className="text-text text-[13px] leading-[17px] font-semibold">
                  Bloquer la carte
                </p>
                <p className="text-text-secondary mt-1 text-[12px] leading-[17px]">
                  Les paiements seront refusés immédiatement. Vous pourrez la
                  débloquer à tout moment.
                </p>
                {confirmBlock ? (
                  <div className="mt-3 flex items-center gap-5">
                    <button
                      type="button"
                      onClick={() => setBlocked(true)}
                      className="border-danger text-danger inline-flex h-9 items-center rounded-md border px-4 text-[13px] font-semibold"
                    >
                      Confirmer le blocage
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmBlock(false)}
                      className="text-text-secondary text-[13px]"
                    >
                      Annuler
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmBlock(true)}
                    className="border-border text-danger hover:border-danger mt-3 inline-flex h-9 items-center rounded-md border px-4 text-[13px] font-semibold transition-colors"
                  >
                    Bloquer
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <BottomNav />
    </>
  );
}
