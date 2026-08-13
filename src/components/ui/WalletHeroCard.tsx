import { ArrowDownLeft, ArrowUpRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { FixPayLogo } from "@/components/brand/FixPayLogo";
import { AmountFigure } from "@/components/ui/AmountText";
import { splitAmountCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

type WalletHeroVariant = "compact" | "expanded";

interface WalletHeroCardProps {
  variant: WalletHeroVariant;
  label: string;
  amount: string;
  hidden?: boolean;
  onToggleHidden?: () => void;
  /**
   * Filigrane FixPay. À COUPER sur tout écran dont l'en-tête porte déjà le
   * logo : sur l'Accueil le mark apparaissait deux fois à 30px d'intervalle,
   * et la version filigranée était la plus saillante des deux.
   */
  watermark?: boolean;
  /** Action slot: 2 pills (compact, Accueil) or 2 big actions (expanded, Portefeuille). */
  children?: ReactNode;
}

const MASKED_AMOUNT = "••••••";

/**
 * Les DEUX actions du portefeuille, rendues par un seul composant pour que
 * l'Accueil et le Portefeuille ne puissent plus diverger.
 *
 * Hiérarchie portée par la masse ET par la valeur : « Dépôt » est le geste
 * fréquent, il prend 1.6 part de largeur et l'aplat blanc ; « Retrait » reste
 * une surface vitrée sur 1 part. Deux pilules strictement 50/50 dont la
 * secondaire lisait plus fort que la primaire — le cas de l'Accueil — ne
 * hiérarchisent rien.
 */
export function WalletHeroActions() {
  return (
    <div className="grid grid-cols-[1.6fr_1fr] gap-2.5">
      <Link
        href="/wallet/deposit"
        className="text-primary-deep flex h-9 items-center justify-center gap-2 rounded-md bg-white text-[13px] leading-[17px] font-semibold transition-opacity active:opacity-90 lg:hover:opacity-90"
      >
        <ArrowDownLeft
          size={15}
          strokeWidth={2}
          absoluteStrokeWidth
          aria-hidden="true"
        />
        Dépôt
      </Link>
      <Link
        href="/wallet/withdraw"
        className="bg-surface-5 flex h-9 items-center justify-center gap-2 rounded-md border border-white/30 text-[13px] leading-[17px] font-semibold text-white transition-opacity active:opacity-90 lg:hover:opacity-90"
      >
        <ArrowUpRight
          size={15}
          strokeWidth={2}
          absoluteStrokeWidth
          aria-hidden="true"
        />
        Retrait
      </Link>
    </div>
  );
}

/**
 * Hero du solde portefeuille, sur `gradient-card` avec filigrane FixPay
 * optionnel (`watermark`, coupé quand l'en-tête porte déjà le logo).
 * `compact` (h-145, Accueil) affiche un solde 26px ; `expanded` (h-220,
 * Portefeuille) un solde 32px.
 *
 * Le franc CFA n'ayant pas de subdivision, le montant n'a JAMAIS de décimales
 * (audit [N]) : la chaîne vient telle quelle de `formatFcfa`. Les cercles
 * blancs débordants sont remplacés par un liseré spéculaire.
 *
 * COMPOSITION DU SOLDE — c'est le chiffre le plus important du produit :
 *  - le nombre passe par `AmountFigure`, qui protège le groupement des
 *    milliers de l'interlettrage négatif du display (les DA lisaient
 *    « 1866 252 » sur les écrans 02 et 03) ;
 *  - « FCFA » est détaché du nombre par `splitAmountCurrency` et composé en
 *    corps réduit, graisse normale et blanc atténué, sur la baseline : à
 *    32-40px w700 le suffixe faisait masse avec les chiffres et aggravait
 *    l'erreur de groupement.
 * La page continue de passer une chaîne unique : elle n'a rien à découper.
 */
export function WalletHeroCard({
  variant,
  label,
  amount,
  hidden = false,
  onToggleHidden,
  watermark = true,
  children,
}: WalletHeroCardProps) {
  const compact = variant === "compact";
  const EyeIcon = hidden ? EyeOff : Eye;
  const { figure, currency } = splitAmountCurrency(amount);

  return (
    <section
      // Pinned dark: the blue gradient stays dark under the light theme, so its
      // content must keep resolving the dark tokens (see docs/THEMING.md).
      data-theme="dark"
      className={cn(
        "gradient-card shadow-raised relative overflow-hidden rounded-lg",
        compact ? "h-[145px] p-5" : "flex h-[220px] flex-col p-[22px]",
      )}
    >
      {/* Liseré spéculaire haut : posé en calque pour cohabiter avec
          l'élévation (une seule classe `shadow-*` par élément). */}
      <span
        aria-hidden
        className="shadow-specular pointer-events-none absolute inset-0 rounded-lg"
      />

      {/* Logo watermark out of flow: the label row keeps its 14px spec height,
          so the amount lands at y=39 (compact) / y=46 (expanded). */}
      {watermark && (
        <FixPayLogo
          width={62}
          className={cn(
            "absolute",
            compact
              ? "top-5 right-5 opacity-80"
              : "top-[22px] right-[22px] opacity-[0.78]",
          )}
        />
      )}
      {/* Casse de phrase, tracking 0 : c'était le DERNIER micro-label majuscule
          espacé des écrans 02 et 03, et il cohabitait avec des libellés de
          section en casse normale à 40px de là. La hauteur de ligne reste à
          14px — le rythme interne du hero (145 / 220) en dépend. */}
      <span className="relative block text-[12px] leading-[14px] font-medium text-white/70">
        {label}
      </span>

      <div
        className={cn(
          "relative flex items-center",
          compact ? "mt-[5px] gap-[9px]" : "mt-2.5 gap-[7px]",
        )}
      >
        <span
          className={cn(
            "flex items-baseline text-white",
            compact ? "gap-[5px]" : "gap-1.5",
          )}
        >
          <AmountFigure
            value={hidden ? MASKED_AMOUNT : figure}
            className={cn(
              "font-bold",
              compact
                ? "text-[26px] leading-[34px] tracking-[-1px]"
                : "text-[32px] leading-[42px] tracking-[-1.5px]",
            )}
          />
          {currency && (
            <span
              className={cn(
                "font-normal tracking-normal text-white/65",
                compact
                  ? "text-[13px] leading-[17px]"
                  : "text-[15px] leading-5",
              )}
            >
              {currency}
            </span>
          )}
        </span>
        <button
          type="button"
          onClick={onToggleHidden}
          aria-label={hidden ? "Afficher le solde" : "Masquer le solde"}
          className="bg-surface-3 flex size-[30px] shrink-0 items-center justify-center rounded-sm"
        >
          <EyeIcon
            size={compact ? 13 : 14}
            className="text-white/70"
            aria-hidden
          />
        </button>
      </div>

      {children && (
        // Expanded: the slot is anchored to the card's bottom edge (22px inner
        // margin from the spec), not stacked at a fixed offset.
        <div className={cn("relative", compact ? "mt-4" : "mt-auto")}>
          {children}
        </div>
      )}
    </section>
  );
}
