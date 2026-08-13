import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type GlassRadius = 14 | 16 | 18 | 20 | 22;

interface GlassCardProps {
  radius?: GlassRadius;
  /** Stronger white@0.14 border used on fields/inputs (default hairline white@0.08). */
  borderStrong?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Les 5 rayons de la maquette retombent sur les 2 valeurs du nouveau système :
 * une surface (panneau, bandeau, tuile) est en `lg`, un conteneur de champ ou
 * une ligne de liste sélectionnable en `md`. Les 4px d'écart entre 18 et 22 que
 * l'audit jugeait illisibles n'existent plus.
 */
const RADIUS_CLASSES: Record<GlassRadius, string> = {
  14: "rounded-md",
  16: "rounded-lg",
  18: "rounded-lg",
  20: "rounded-md",
  22: "rounded-lg",
};

/**
 * Base glass surface (white@0.05 fill + 1px hairline border) used by
 * panels, tiles, checklists and chat bubbles. Under the light theme the fill
 * becomes solid white and a hairline shadow lifts the card off the tinted
 * background (`shadow-surface` is a no-op in dark).
 */
export function GlassCard({
  radius = 16,
  borderStrong = false,
  className,
  children,
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "bg-surface shadow-surface border",
        borderStrong ? "border-border-strong" : "border-border",
        RADIUS_CLASSES[radius],
        className,
      )}
    >
      {children}
    </div>
  );
}
