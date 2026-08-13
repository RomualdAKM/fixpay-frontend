import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type BadgeTone = "success" | "warning" | "primary";
/**
 * 56 = confirmation de fin de flux (SuccessScreen, dé-cérémonialisé par
 * l'audit) ; 72 = écran 20 « Carte activée » ; 88 = héritage de la maquette,
 * conservé le temps que les pages passent toutes en 56.
 */
type BadgeSize = 88 | 72 | 56;

interface GradientIconBadgeProps {
  icon: LucideIcon;
  tone: BadgeTone;
  size?: BadgeSize;
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  primary: "bg-primary",
};

/** Gabarit du squircle et du glyphe, par taille. */
const SIZE_SPEC: Record<BadgeSize, { box: string; icon: number }> = {
  88: { box: "size-[88px]", icon: 42 },
  72: { box: "size-[72px]", icon: 32 },
  56: { box: "size-[56px]", icon: 26 },
};

/**
 * Badge d'icône des écrans de succès : squircle en APLAT teinté, glyphe blanc,
 * aucune lueur.
 *
 * Il n'y a plus ni dégradé ni halo (audit [C]/[H] : un halo bleu de 40px sous un
 * badge vert ou ambre était le marqueur le plus chromatiquement faux du lot), et
 * le ton porte désormais la nature du fait accompli, pas l'humeur de l'écran.
 */
export function GradientIconBadge({
  icon: Icon,
  tone,
  size = 88,
}: GradientIconBadgeProps) {
  const spec = SIZE_SPEC[size];

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg",
        TONE_CLASSES[tone],
        spec.box,
      )}
    >
      <Icon
        size={spec.icon}
        strokeWidth={size === 88 ? 2 : 2.5}
        className="text-white"
        aria-hidden
      />
    </div>
  );
}
