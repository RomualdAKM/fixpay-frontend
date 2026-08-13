import { Delete } from "lucide-react";

interface NumpadProps {
  onKey: (k: string) => void;
  onDelete: () => void;
}

/**
 * Touches du pavé, rangée par rangée. La touche décimale a disparu : le franc
 * CFA n'a pas de subdivision, `.` était une touche morte (l'écran 08 rejetait
 * déjà toute frappe non numérique) qui occupait le tiers d'une rangée. À sa
 * place, la touche « 00 » des terminaux de paiement de la zone : les montants
 * y sont à quatre ou cinq chiffres, elle sert à chaque saisie.
 */
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0"] as const;

/** Nom accessible des touches dont le glyphe ne se lit pas tel quel. */
const KEY_LABELS: Partial<Record<(typeof KEYS)[number], string>> = {
  "00": "Deux zéros",
};

/**
 * Pavé numérique 3×4 sans surface de touche (écran 08).
 *
 * HAUTEUR DE RANGÉE : 56px en mobile (224px pour les quatre rangées) au lieu
 * de 65px. Le pavé est le seul bloc de l'écran dont la hauteur est un budget et
 * non une préférence : à 65px il réclamait 260px là où le viewport n'en laissait
 * que 216 sous le montant, et la rangée « 00 / 0 / effacer » passait sous la
 * barre d'action — on ne pouvait plus ni taper un montant rond ni corriger une
 * frappe. 56px reste très au-dessus de la cible tactile de 44px recommandée, et
 * chaque touche mesure en réalité 110×56 sur un écran de 390.
 * À partir de `lg` la contrainte tombe et la rangée reprend 60px.
 */
export function Numpad({ onKey, onDelete }: NumpadProps) {
  return (
    <div role="group" aria-label="Pavé numérique" className="grid grid-cols-3">
      {KEYS.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onKey(key)}
          aria-label={KEY_LABELS[key]}
          /* The radius is itself hover/focus-scoped: the borderless mobile
             key keeps zero painted box, so nothing changes on touch. */
          className="text-text hover:bg-surface focus-visible:ring-primary/60 h-14 text-[22px] font-medium transition-colors hover:rounded-md focus-visible:rounded-md focus-visible:ring-2 focus-visible:outline-none lg:h-[60px]"
        >
          {key}
        </button>
      ))}
      <button
        type="button"
        onClick={onDelete}
        aria-label="Effacer"
        className="hover:bg-surface focus-visible:ring-primary/60 flex h-14 items-center justify-center transition-colors hover:rounded-md focus-visible:rounded-md focus-visible:ring-2 focus-visible:outline-none lg:h-[60px]"
      >
        <Delete size={18} aria-hidden="true" className="text-text" />
      </button>
    </div>
  );
}
