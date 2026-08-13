import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { AmountDisplay } from "@/components/ui/AmountDisplay";
import { Button } from "@/components/ui/Button";
import { GradientIconBadge } from "@/components/ui/GradientIconBadge";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { NBSP } from "@/lib/format";

/** Une ligne de reçu : libellé à gauche, valeur à droite. */
export type ReceiptRow = [label: string, value: string];

interface SuccessScreenProps {
  /** Glyphe du badge. Ignoré si `visual` est fourni. */
  icon?: LucideIcon;
  /**
   * Visuel de tête à la place du badge — la vignette de la carte alimentée sur
   * l'écran 23, le monogramme du marchand sur l'écran 24. Un objet réel
   * identifie mieux l'opération qu'un pictogramme générique.
   */
  visual?: ReactNode;
  title: string;
  amount: string;
  /**
   * Sens du mouvement pour l'ARGENT DU CLIENT, pris globalement : '+' entrée,
   * '-' sortie. Renseigné uniquement quand le sens est univoque (dépôt,
   * retrait, paiement) et laissé vide sur les transferts internes (écrans 23 et
   * 25), où le même montant est un débit d'un côté et un crédit de l'autre.
   * Sans lui, un dépôt et un retrait ne se distinguaient plus que par
   * l'orientation d'un glyphe de 22px (re-notation, écran 22).
   */
  sign?: "+" | "-";
  /** Devise affichée en corps réduit sur la baseline ('FCFA'). */
  currency?: string;
  /** Récapitulatif d'opération : rendu ici, pour que les cinq confirmations
   *  partagent exactement la même colonne label/valeur. */
  receipt?: ReceiptRow[];
  ctaLabel?: string;
  ctaHref?: string;
  /** Sortie secondaire, en lien texte — jamais un second bouton. */
  secondaryLabel?: string;
  secondaryHref?: string;
}

/**
 * Confirmation de fin de flux (écrans 21-25), sans navigation — une seule
 * sortie principale, c'est le bon parti et il est conservé.
 *
 * DÉ-CÉRÉMONIALISÉ après l'audit (badge 56, titre 20px, montant 32px en
 * `--c-text`), RECOMPOSÉ après la re-notation (un seul axe, plus de
 * sous-titre, une seule signature chromatique), puis RECOMPOSÉ EN DESKTOP à
 * l'étape 11 :
 *
 * - LE DÉCENTRAGE EST SUPPRIMÉ À LA RACINE. Le `<main>` était `mx-auto
 *   max-w-[560px]` mais son bloc interne `max-w-[400px]` n'avait pas de
 *   `mx-auto` : les 160px restants s'accumulaient tous à droite et la page
 *   entière était posée 40px à gauche de l'axe du viewport, sur les CINQ
 *   écrans. Le bloc interne à largeur fixe disparaît : c'est la grille qui
 *   tient la mesure, et elle remplit exactement la boîte centrée.
 * - DEUX COLONNES, MÊME GABARIT QUE L'ÉCRAN 20. Les DA relevaient « cinq
 *   confirmations, deux réponses desktop » : l'écran 20 recevait une
 *   composition à deux colonnes et ses cinq frères gardaient une colonne de
 *   400px dans un canevas vide. Les six écrans partagent maintenant la même
 *   grille — 348 | 340 dans une boîte de 744, centrée. À gauche l'identité de
 *   l'opération et la sortie, à droite le reçu.
 * - LIGNE DE PIED PARTAGÉE. Le bloc d'action est `self-end` dans une rangée
 *   `1fr` : le bas du CTA vient se caler sur le bas du reçu, quelle que soit la
 *   longueur de celui-ci (6 ou 7 lignes selon le flux). Aucune colonne ne
 *   s'arrête 150px avant l'autre.
 * - RYTHME VERTICAL PAR RÔLE (mobile). Intervalles pris dans 6 / 16 / 32 :
 *   serrés dans le bloc de tête (badge → titre 16, titre → montant 6, en-tête
 *   de reçu → lignes 6), larges entre les trois groupes (32). Le reçu reçoit un
 *   en-tête de section, comme la liste de l'écran 20 : sur desktop une colonne
 *   ne peut pas commencer par un filet sans être nommée.
 */
export function SuccessScreen({
  icon: Icon,
  visual,
  title,
  amount,
  sign,
  currency,
  receipt,
  ctaLabel = "Retour à l'accueil",
  ctaHref = "/",
  secondaryLabel,
  secondaryHref,
}: SuccessScreenProps) {
  // Espace insécable entre le signe et le nombre : `AmountFigure` lui donne la
  // même boîte plancher qu'aux séparateurs de milliers, donc le signe ne se
  // colle pas au premier chiffre en interlettrage négatif.
  const figure = sign ? `${sign}${NBSP}${amount}` : amount;

  return (
    // Desktop : la boîte de 744px est centrée dans la largeur ET dans la
    // hauteur — c'est ce qui supprime la bande vide sous le CTA.
    <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-6 pt-12 pb-10 lg:max-w-[824px] lg:justify-center lg:px-10 lg:py-16">
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:grid-rows-[auto_1fr] lg:gap-x-14">
        {/* Colonne gauche, rangée 1 — ce qui vient de se passer. */}
        <div className="lg:col-start-1 lg:row-start-1">
          {visual ??
            (Icon ? (
              <GradientIconBadge icon={Icon} tone="success" size={56} />
            ) : null)}
          <h1 className="text-text mt-4 text-[20px] leading-[26px] font-semibold">
            {title}
          </h1>
          <AmountDisplay
            value={figure}
            currency={currency}
            size="success"
            className="mt-1.5 justify-start"
          />
        </div>

        {/* Colonne droite — le document. */}
        {receipt ? (
          <div className="mt-8 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0">
            <SectionLabel>Récapitulatif</SectionLabel>
            <dl className="border-border divide-border mt-1.5 divide-y border-t">
              {receipt.map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-baseline justify-between gap-4 py-2.5"
                >
                  <dt className="text-text-muted shrink-0 text-[11.5px] leading-[15px]">
                    {label}
                  </dt>
                  {/* `word-spacing` : le séparateur de milliers est une espace
                      insécable (U+00A0) ; à 13px elle est quasi invisible et
                      « 500 000 » se lit « 500000 ». On la rouvre au lieu de
                      grossir le corps. */}
                  <dd className="text-text text-right text-[13px] leading-[18px] font-medium [word-spacing:0.16em]">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}

        {/* Colonne gauche, rangée 2 — la sortie, calée en pied de colonne. */}
        <div className="mt-8 lg:col-start-1 lg:row-start-2 lg:mt-0 lg:self-end lg:pt-10">
          <Button href={ctaHref}>{ctaLabel}</Button>
          {secondaryLabel && secondaryHref ? (
            // Même langage de lien que partout ailleurs dans l'app : bleu,
            // soulignement au survol. Centré sous le CTA, dont il dépend.
            <p className="mt-4 text-center">
              <Link
                href={secondaryHref}
                className="text-primary-light text-[13.5px] leading-[18px] font-medium underline-offset-4 hover:underline"
              >
                {secondaryLabel}
              </Link>
            </p>
          ) : null}
        </div>
      </div>
    </main>
  );
}
