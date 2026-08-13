"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { BottomNav } from "@/components/layout/BottomNav";
import { AmountDisplay } from "@/components/ui/AmountDisplay";
import { AmountInput } from "@/components/ui/AmountInput";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Numpad } from "@/components/ui/Numpad";
import { QuickAmountChips } from "@/components/ui/QuickAmountChips";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SelectableRow } from "@/components/ui/SelectableRow";
import { StickyActionBar } from "@/components/ui/StickyActionBar";
import { TransactionFacts } from "@/components/ui/TransactionFacts";
import { formatAmount, formatFcfa } from "@/lib/format";
import {
  cards,
  paymentFacts,
  primaryCard,
  quickAmounts,
  type CardId,
} from "@/lib/mock-data";

/* Même squelette et même échelle d'espacement que les écrans 04/05/06/07 —
   voir le commentaire de rythme de wallet/deposit/page.tsx. */
const FLOW_MAIN =
  "px-5 pt-[54px] pb-24 lg:mx-auto lg:w-full lg:max-w-[840px] lg:px-10 lg:pt-9 lg:pb-12";
const FLOW_GRID = "mt-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-10";
const FLOW_ASIDE = "mt-8 lg:mt-0";

/**
 * Bénéficiaire du paiement. Le numéro suit enfin le plan de numérotation
 * ivoirien (07 XX XX XX XX, masqué comme partout ailleurs dans le produit :
 * « 07 •• •• 42 ») — « +225 07 ••• 42 » était un masque de maquette affiché
 * comme une coordonnée réelle. Déclaré ici parce que ce flux n'a pas de source
 * de données amont (`mock-data.ts` ne modélise pas de marchand).
 */
const beneficiary = {
  name: "Boutique Adjamé",
  reference: "+225 07 •• •• 42",
  place: "Abidjan · Commerce de proximité",
};

/** Longueur maximale saisissable : 9 chiffres (999 999 999 FCFA). */
const MAX_DIGITS = 9;

/**
 * Écran 08 · Paiement.
 *
 * ÉTAPE 11 (composition) :
 * - la tuile d'icône générique du bénéficiaire (carré gris 42px + glyphe
 *   « boutique » lucide) disparaît : c'est le marqueur que l'audit condamne
 *   partout ailleurs, et il était posé sur le tout premier bloc de l'écran.
 *   Le bénéficiaire est désormais composé comme la source de l'écran 07 —
 *   libellé de section, nom, coordonnée ;
 * - la carte débitée est REMONTÉE dans la barre épinglée : elle était rendue
 *   après le pavé et le champ Motif, donc hors du premier viewport, alors que
 *   le CTA, lui, y était épinglé en permanence. On pouvait payer sans jamais
 *   avoir vu quelle carte serait débitée. La barre porte maintenant la ligne
 *   « Débité de … » juste au-dessus du bouton, à toutes les largeurs ;
 * - le sélecteur de carte et le champ Motif passent dans la colonne de vérité,
 *   ce qui met « Payer avec » AVANT « Motif » (obligatoire avant facultatif)
 *   et supprime les ~370px de marge morte de chaque côté du pavé en desktop ;
 * - « Minimum 500 FCFA » passe en `text-secondary` (le muted mesurait 4,4:1,
 *   sous le seuil AA pour du texte courant).
 *
 * ÉTAPE 12 (viewport) : le pavé numérique est un BUDGET, pas une préférence.
 * Sur 390×780, la barre d'action (110px, mesurée et non plus estimée) et la
 * BottomNav (74px) laissent 596px au contenu ; le haut d'écran en réclamait
 * 640 et la rangée « 00 / 0 / effacer » tombait entièrement dessous. Trois
 * gestes, aucun retrait d'information :
 *   · la contrainte « Minimum 500 FCFA » remonte sur la ligne du libellé du
 *     montant, au lieu d'occuper un troisième bloc centré (−24px) ;
 *   · la rangée du pavé passe de 65 à 56px, cible tactile toujours large
 *     (−36px, voir `components/ui/Numpad.tsx`) ;
 *   · la touche morte « . » devient « 00 », la touche des montants ronds.
 * Total : 580px. Les quatre rangées sont dans le premier viewport, et ce qui
 * dépasse (« Payer avec ») dépasse d'une ligne — ce qui est l'affordance de
 * défilement, pas une coupe.
 *
 * Conservé : le pavé numérique aux deux largeurs. Un même écran ne peut pas
 * changer de mécanique de saisie selon la fenêtre — c'est le reproche fait
 * ailleurs au « même composant qui ne se compose pas pareil ».
 */
export default function PaymentPage() {
  const router = useRouter();
  const [amount, setAmount] = useState("0");
  const [reason, setReason] = useState("");
  const [selectedCard, setSelectedCard] = useState<CardId>("visa-4291");

  const card = cards.find((c) => c.id === selectedCard) ?? primaryCard;
  const value = Number(amount);
  const cardRemaining = card.monthlyLimit - card.monthlyUsed;
  /*
   * Le « solde après » n'apparaît qu'une fois un montant saisi, et jamais
   * au-delà du solde : `formatFcfa` rend une valeur absolue, un reste négatif
   * s'y afficherait en positif.
   */
  const enough = value > 0 && value <= card.balance;
  const balanceAfter = enough ? formatFcfa(card.balance - value) : undefined;
  const ready = value >= paymentFacts.min && enough;
  /* Le coût, écrit sur la ligne qui accompagne le CTA : c'est la seule chose
     que le mobile voyait disparaître sous le pavé (« on paie sans voir les
     frais »), et elle ne coûte pas une ligne de plus. */
  const feeNote =
    paymentFacts.fee === 0
      ? "sans frais"
      : `frais ${paymentFacts.feeLabel.toLowerCase()}`;

  const handleKey = (key: string) => {
    // Aucune décimale en FCFA : toute touche non numérique est sans effet.
    if (!/^\d+$/.test(key)) return;
    setAmount((prev) => {
      const next = (prev === "0" ? key : prev + key).replace(/^0+(?=\d)/, "");
      return next.slice(0, MAX_DIGITS) || "0";
    });
  };

  const handleDelete = () => {
    setAmount((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
  };

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

        <div className={FLOW_GRID}>
          {/* ---- Colonne de saisie : à qui, puis combien ---- */}
          <div>
            <section>
              <SectionLabel>Bénéficiaire</SectionLabel>
              <p className="text-text mt-3 truncate text-[15px] leading-[20px] font-semibold">
                {beneficiary.name}
              </p>
              <p className="text-text-muted mt-[3px] truncate text-[12px] leading-[16px]">
                {beneficiary.reference} · {beneficiary.place}
              </p>
            </section>

            {/* 32px : le montant est un autre groupe. Le pavé, lui, reste
                COLLÉ au chiffre qu'il pilote (8px) — c'est le seul endroit de
                l'écran où deux blocs doivent se toucher. */}
            <section className="mt-8">
              {/* Le libellé et la contrainte tiennent sur une seule ligne, en
                  vis-à-vis : 24px repris sur le budget vertical du pavé, et le
                  contrepoint gauche/droite qui manquait à une moitié d'écran
                  entièrement posée sur l'axe central. */}
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-text-muted text-[12px] leading-[16px]">
                  Montant du paiement
                </p>
                <p className="text-text-secondary shrink-0 text-[11.5px] leading-[16px]">
                  Minimum {formatFcfa(paymentFacts.min)}
                </p>
              </div>
              <AmountDisplay
                value={formatAmount(value)}
                currency="FCFA"
                className="mt-2"
              />
              <div className="mt-4">
                <QuickAmountChips
                  amounts={quickAmounts.payment}
                  onSelect={(n) => setAmount(String(n))}
                />
              </div>
              <div className="mt-2 lg:mx-auto lg:w-full lg:max-w-[300px]">
                <Numpad onKey={handleKey} onDelete={handleDelete} />
              </div>
            </section>
          </div>

          {/* ---- Colonne de vérité : avec quoi, pourquoi, ce que ça coûte ---- */}
          <aside className={FLOW_ASIDE}>
            <section>
              <SectionLabel>Payer avec</SectionLabel>
              <div className="mt-3 space-y-2">
                {cards.map((c) => (
                  <SelectableRow
                    key={c.id}
                    title={c.label}
                    subtitle={`Solde dispo : ${formatFcfa(c.balance)}`}
                    height={64}
                    selected={selectedCard === c.id}
                    onSelect={() => setSelectedCard(c.id)}
                  />
                ))}
              </div>
            </section>

            <section className="mt-8">
              <SectionLabel>Motif (facultatif)</SectionLabel>
              <div className="mt-3">
                <AmountInput
                  value={reason}
                  onChange={setReason}
                  variant="text"
                  placeholder="Commande, table, référence…"
                  ariaLabel="Motif du paiement"
                />
              </div>
            </section>

            <section className="mt-8">
              <SectionLabel>Frais et délai</SectionLabel>
              <div className="mt-3">
                <TransactionFacts
                  fee={paymentFacts.feeLabel}
                  delay={paymentFacts.delay}
                  limit={formatFcfa(cardRemaining)}
                  balanceAfter={balanceAfter}
                />
              </div>
            </section>
          </aside>
        </div>

        {/* L'action, et avec elle les deux choses qu'on ne doit jamais valider
            sans les avoir vues : le moyen de paiement débité et le coût de
            l'opération. En mobile la barre est le seul endroit où ils tiennent
            au-dessus de la ligne de flottaison — le bloc « Frais et délai »
            complet reste dans la colonne de vérité, un cran plus bas. */}
        <StickyActionBar>
          <div>
            <div className="mb-3 flex items-baseline justify-between gap-3 lg:max-w-[320px]">
              <span className="text-text-muted text-[11.5px] leading-[15px]">
                Débité de
              </span>
              <span className="text-text truncate text-[12px] leading-[16px] font-medium">
                {card.label} · {feeNote}
              </span>
            </div>
            {ready ? (
              <Button href="/payment/success" className="lg:max-w-[320px]">
                Payer maintenant
              </Button>
            ) : (
              <button
                type="button"
                disabled
                className="border-border bg-surface-2 text-text-muted inline-flex h-[50px] w-full cursor-not-allowed items-center justify-center rounded-md border text-[15px] font-semibold lg:max-w-[320px]"
              >
                Payer maintenant
              </button>
            )}
          </div>
        </StickyActionBar>
      </main>

      <BottomNav />
    </>
  );
}
