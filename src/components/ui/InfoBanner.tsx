import { Info } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type InfoBannerTone = "neutral" | "blue" | "success" | "warning";

interface InfoBannerProps {
  /**
   * Défaut `neutral` depuis l'audit. Les tons sémantiques ne sont plus admis
   * que sur un fait accompli (`success`) ou un avertissement réel (`warning`) —
   * ils servaient jusqu'ici de code couleur d'écran (vert sur 06, ambre sur 07
   * pour deux textes strictement informatifs).
   */
  tone?: InfoBannerTone;
  children: ReactNode;
}

const TONES: Record<InfoBannerTone, string> = {
  neutral: "border-border bg-surface",
  blue: "border-primary-border bg-primary-surface",
  success: "border-success-border bg-success-surface",
  warning: "border-warning-border bg-warning-surface",
};

const ICON_TONES: Record<InfoBannerTone, string> = {
  neutral: "text-icon-muted",
  blue: "text-primary-light",
  success: "text-success",
  warning: "text-warning",
};

/**
 * Bandeau d'information : icône Info en haut à gauche + texte 12.5px/20px.
 * Surface neutre par défaut (blanc@0.05 + hairline), rayon `lg`.
 * Screens 06, 07, 12, 18, 20.
 */
export function InfoBanner({ tone = "neutral", children }: InfoBannerProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-[11px] rounded-lg border p-[15px]",
        TONES[tone],
      )}
    >
      {/* Spec : i-info 15px, trait 1.25px (= scaling par défaut à 15) */}
      <Info
        size={15}
        aria-hidden="true"
        className={cn("mt-[2px] shrink-0", ICON_TONES[tone])}
      />
      <p className="text-text-secondary text-[12.5px] leading-[20px]">
        {children}
      </p>
    </div>
  );
}
