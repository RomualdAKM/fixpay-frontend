import { cn } from "@/lib/utils";

interface SuggestionChipProps {
  children: string;
  onClick?: () => void;
  /**
   * `topic` (défaut) — une réponse d'information, aplat `surface-2`.
   * `action` — la réponse qui ENGAGE l'opération en cours (« Rembourser
   * maintenant »), en contour seul. Deux natures de réponse ne peuvent pas
   * porter le même vêtement : l'une continue la conversation, l'autre demande
   * un mouvement d'argent.
   */
  tone?: "topic" | "action";
}

/**
 * Réponse rapide du chat support (écran 27).
 *
 * Une seule couche par variante — jamais fond + bordure + texte teinté :
 * l'audit relevait la double transparence (fond bleu@0.10 + bordure bleu@0.20
 * + texte bleu clair) qui faisait lire ces chips comme des liens désactivés.
 * Le retrait de 40px qui aligne les chips sous la bulle appartient à la page.
 *
 * Étape 12 : ces puces ne sont plus des « sujets fréquents » posés dans un
 * fil vide, mais les réponses possibles au TOUR DE PAROLE en cours. Elles
 * vivent donc au même endroit et avec le même statut sur les deux largeurs,
 * sous la dernière bulle — les DA relevaient qu'elles se lisaient comme des
 * réponses rapides en mobile et comme une navigation en desktop.
 */
export function SuggestionChip({
  children,
  onClick,
  tone = "topic",
}: SuggestionChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-text focus-visible:ring-primary/60 h-8 rounded-full px-[13px] text-[13px] leading-[15px] transition-colors focus-visible:ring-2 focus-visible:outline-none",
        tone === "topic"
          ? "bg-surface-2 hover:bg-surface-3"
          : "border-border-strong hover:bg-surface-2 border",
      )}
    >
      {children}
    </button>
  );
}
