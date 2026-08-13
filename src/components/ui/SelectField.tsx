"use client";

import { ChevronDown } from "lucide-react";
import { useId } from "react";

interface SelectFieldProps {
  label: string;
  value: string;
  options: string[];
  onChange?: (v: string) => void;
}

/**
 * Champ select libellé : libellé de champ + champ vitré de 48px, chevron
 * dessiné (la flèche native est masquée).
 *
 * LIBELLÉ DE CHAMP, PAS EN-TÊTE DE SECTION (écran 16). Le composant appelait
 * `SectionLabel` : « Langue » était donc exactement le même objet
 * typographique que « Préférences » qui le coiffait, et l'écran empilait les
 * deux à 20px d'intervalle sans qu'aucun ne subordonne l'autre. Le libellé
 * descend d'un cran — 12px / w400 / --c-text-muted contre 13px / w500 /
 * --c-text-secondary pour la section. La distinction se fait par la taille, la
 * graisse et la valeur, jamais par le retour du micro-label majuscule espacé
 * supprimé par la migration : casse de phrase et tracking 0 des deux côtés.
 *
 * Le libellé est un vrai `<label for>` : il nomme le select pour les
 * technologies d'assistance et l'étend comme cible de clic — un `aria-label`
 * laissait le texte visible sans rôle.
 *
 * Le chevron est un glyphe purement fonctionnel : il suit `--c-icon-muted`
 * comme tous les autres chevrons du produit (marqueur [I] : trois chevrons
 * bleus alignés faisaient croire à trois liens).
 */
export function SelectField({
  label,
  value,
  options,
  onChange,
}: SelectFieldProps) {
  const id = useId();

  return (
    <div>
      <label
        htmlFor={id}
        className="text-text-muted block text-[12px] leading-[16px] font-normal"
      >
        {label}
      </label>
      <div className="relative mt-[6px]">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="border-border-strong bg-surface text-text hover:border-primary/40 hover:bg-surface-2 focus-visible:border-primary focus-visible:ring-primary/60 h-12 w-full appearance-none rounded-md border pr-11 pl-[17px] text-[15px] font-normal transition-colors hover:cursor-pointer focus-visible:ring-2 focus-visible:outline-none"
        >
          {options.map((option) => (
            <option key={option} value={option} className="bg-bg text-text">
              {option}
            </option>
          ))}
        </select>
        <ChevronDown
          size={12}
          aria-hidden="true"
          className="text-icon-muted pointer-events-none absolute top-1/2 right-[15px] -translate-y-1/2"
        />
      </div>
    </div>
  );
}
