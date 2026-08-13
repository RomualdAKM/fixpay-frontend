import type { ReactNode } from "react";

import { RadioCheck } from "@/components/ui/RadioCheck";
import { cn } from "@/lib/utils";

interface SelectableRowProps {
  title: string;
  subtitle?: string;
  /**
   * Visuel de tête — OPTIONNEL ET ABSENT PAR DÉFAUT depuis l'audit. Une tuile
   * générique (le même CreditCard pour Visa et Mastercard, un carré vide en
   * guise de drapeau) coûte une colonne entière et n'apprend rien : ne le
   * remplir qu'avec un visuel réellement distinctif (marque du réseau,
   * vignette de carte, drapeau dessiné).
   */
  leading?: ReactNode;
  selected?: boolean;
  /** Force l'état de la pastille indépendamment de `selected`. */
  radioState?: "selected" | "empty";
  /** Fixed row height in px (64 country, 68 card, 70 document, 103 option card). */
  height?: number;
  onSelect?: () => void;
  /** Optional third line for the card-option rows of screen 09 (14px w700 primary). */
  price?: string;
  /**
   * Selected style: 'tint' = primary tint fill + 1px primary border (06/07/08);
   * 'outline' = 2px primary border WITHOUT fill tint (09/13) — unselected rows
   * of those screens also carry a 2px border.
   */
  selectedVariant?: "tint" | "outline";
  /** RadioCheck diameter: 22 (default, 06/07/08) or 20 (04/05/13). */
  radioSize?: 20 | 22;
}

/**
 * Ligne sélectionnable (pays, cartes de destination, types de document,
 * options d'achat de carte) avec une RadioCheck à droite.
 *
 * Rayon unique `md` : c'est une ligne interactive, au même titre qu'un champ
 * ou qu'un CTA. Le réglage `radius` (14 / 16 / 20) a disparu — il rejouait le
 * recensement de rayons de la maquette, où trois valeurs séparées de 2 à 4px
 * ne codaient aucune hiérarchie.
 *
 * L'état sélectionné (teinte + bordure pleine + pastille pleine) est conservé
 * tel quel : c'est le patron d'état sélectionné du produit, lisible sans
 * dépendre de la couleur seule.
 * Screens 04, 05, 06, 07, 08, 09, 13.
 */
export function SelectableRow({
  title,
  subtitle,
  leading,
  selected = false,
  radioState,
  height,
  onSelect,
  price,
  selectedVariant = "tint",
  radioSize = 22,
}: SelectableRowProps) {
  const state = radioState ?? (selected ? "selected" : "empty");
  // Screen 09 option cards (the only rows with a price line) use a larger
  // title/subtitle scale than country/card/document rows.
  const optionCard = price !== undefined;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      style={height !== undefined ? { height } : undefined}
      className={cn(
        "flex w-full items-center gap-[13px] rounded-md px-[15px] text-left",
        // Desktop-only affordances; never applied on touch devices.
        "focus-visible:ring-primary/60 transition-colors focus-visible:ring-2 focus-visible:outline-none",
        !selected && "hover:border-border-strong hover:bg-surface-2",
        !selected &&
          cn(
            "border-border bg-surface",
            selectedVariant === "outline" ? "border-2" : "border",
          ),
        selected &&
          (selectedVariant === "tint"
            ? "border-primary bg-primary-surface border"
            : "border-primary bg-surface border-2"),
      )}
    >
      {leading}
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "text-text block truncate",
            optionCard
              ? "text-[15px] leading-[19.5px] font-bold"
              : "text-[13.5px] font-medium",
          )}
        >
          {title}
        </span>
        {subtitle && (
          <span
            className={cn(
              "block truncate",
              optionCard
                ? "text-text-secondary mt-[3px] text-[12.5px] leading-[16.3px]"
                : "text-text-muted mt-[2px] text-[11.5px]",
            )}
          >
            {subtitle}
          </span>
        )}
        {price && (
          <span className="text-primary mt-[3px] block text-[14px] font-bold">
            {price}
          </span>
        )}
      </span>
      <RadioCheck state={state} size={radioSize} />
    </button>
  );
}
