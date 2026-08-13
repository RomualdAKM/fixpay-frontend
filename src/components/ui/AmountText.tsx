import { Fragment } from "react";

import { NBSP, formatFcfa, splitAmountCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

interface AmountFigureProps {
  /** Montant déjà formaté (`formatAmount` / `formatFcfa`). */
  value: string;
  className?: string;
}

/**
 * LE NOMBRE — primitive de rendu de tout montant du produit.
 *
 * Le groupement des milliers ne peut pas être laissé à la seule chasse d'un
 * caractère : sur un display de 32-40px composé en interlettrage négatif, la
 * séparation était rendue à largeur quasi nulle et « 1 866 252 » se lisait
 * « 1866 252 » (DA, écrans 02 et 03) ; à 13px elle disparaissait tout court
 * (écran 20). La chaîne reste correcte — c'est sa MISE EN FORME qui la
 * détruisait.
 *
 * Chaque séparateur est donc rendu dans une boîte propre :
 *  - `inline-block` + `min-w-[0.22em]` : une largeur plancher exprimée en em,
 *    donc valable de 11px à 40px sans réglage par écran ;
 *  - `tracking-normal` : l'interlettrage négatif du display s'applique aux
 *    chiffres, plus jamais à l'espace qui les groupe ;
 *  - le caractère U+00A0 reste dans le texte, donc la sélection, le
 *    copier-coller et la lecture d'écran gardent le montant intact.
 *
 * C'est la seule solution des trois envisagées qui ne dépende ni de la police
 * ni de la taille de composition.
 */
export function AmountFigure({ value, className }: AmountFigureProps) {
  const groups = value.split(NBSP);

  if (groups.length === 1) {
    return <span className={className}>{value}</span>;
  }

  return (
    <span className={className}>
      {groups.map((group, index) => (
        <Fragment key={index}>
          {index > 0 && (
            <span className="inline-block min-w-[0.22em] tracking-normal">
              {NBSP}
            </span>
          )}
          {group}
        </Fragment>
      ))}
    </span>
  );
}

/**
 * L'UNITÉ — composée une seule fois, pour tout le produit.
 *
 * Le traitement du suffixe avait été appliqué à un composant sur deux : le
 * hero de l'Accueil détachait « FCFA » du nombre, la ligne carte du MÊME écran
 * le laissait dans la matière des chiffres (même corps, même graisse, même
 * couleur). Un écran, deux règles. La règle vit donc ici, dans le primitif, et
 * plus dans l'appel.
 *
 * Trois signaux, jamais un seul : corps réduit, graisse normale, couleur
 * secondaire. La réduction est exprimée en `em` — elle vaut de 11px à 20px
 * sans réglage par écran. Elle est MODÉRÉE (0.8em) et non forte comme sur les
 * displays (0.45em sur `WalletHeroCard` / `AmountDisplay`) : à 14px de
 * composition de liste, 0.45em donnerait un suffixe de 6px illisible. Ce qui
 * est constant d'un bout à l'autre de l'échelle, c'est la hiérarchie — un seul
 * objet lourd par montant — pas le ratio.
 *
 * La devise reste sur la baseline du nombre et n'hérite JAMAIS de sa couleur
 * sémantique : sur un débit, « 39 341 » est rouge, « FCFA » ne l'est pas.
 */
function AmountCurrency({ children }: { children: string }) {
  return (
    <>
      {/* Même boîte plancher que les séparateurs de milliers : l'espace qui
          colle l'unité au nombre ne peut pas être écrasée par l'interlettrage
          négatif d'un display. */}
      <span className="inline-block min-w-[0.22em] tracking-normal">
        {NBSP}
      </span>
      <span className="text-text-secondary text-[0.8em] font-normal tracking-normal">
        {children}
      </span>
    </>
  );
}

interface AmountTextProps {
  amount: number;
  /** Prefix with '+ ' / '− ' and color green (credit) / red (debit). */
  signed?: boolean;
  className?: string;
}

/**
 * FCFA amount formatted via `@/lib/format` (no-break spaces as thousands
 * separators, sign followed by a space). When `signed`, the color is
 * automatic: success green for credits, danger red for debits.
 *
 * Le rendu passe par `AmountFigure` : un montant de liste à 13-14px est
 * groupé exactement comme le solde du hero à 40px. Et par `AmountCurrency` :
 * le suffixe est atténué ici, donc sur TOUTES les rangées de transaction, sur
 * la ligne carte de l'Accueil comme sur celle du Portefeuille.
 */
export function AmountText({
  amount,
  signed = false,
  className,
}: AmountTextProps) {
  const value = signed
    ? `${amount < 0 ? "-" : "+"}${NBSP}${formatFcfa(amount)}`
    : formatFcfa(amount);
  const { figure, currency } = splitAmountCurrency(value);

  return (
    <span
      className={cn(
        signed && (amount < 0 ? "text-danger" : "text-success"),
        className,
      )}
    >
      <AmountFigure value={figure} />
      {currency && <AmountCurrency>{currency}</AmountCurrency>}
    </span>
  );
}
