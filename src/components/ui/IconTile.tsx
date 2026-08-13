import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type IconTileTone =
  "blue" | "green" | "amber" | "mastercard" | "neutral" | "disabled";

type IconTileSize = 36 | 38 | 40 | 42;

interface IconTileProps {
  icon: LucideIcon;
  tone?: IconTileTone;
  size?: IconTileSize;
  iconSize?: number;
}

const TONE_CLASSES: Record<IconTileTone, { tile: string; icon: string }> = {
  blue: { tile: "bg-primary-tint", icon: "text-primary-light" },
  green: { tile: "bg-success-tint", icon: "text-success" },
  amber: { tile: "bg-warning-tint", icon: "text-warning" },
  mastercard: { tile: "bg-mc-tint", icon: "text-danger-light" },
  neutral: { tile: "bg-surface-2", icon: "text-icon-muted" },
  disabled: { tile: "bg-surface-2", icon: "text-text-muted" },
};

/**
 * Rounded square icon tile (radius `sm`, whatever the side — l'audit a
 * supprimé les rayons 11/12/13 qui variaient avec la taille).
 *
 * Usage RESTREINT depuis l'audit : réservé aux entrées de menu où le glyphe
 * est unique par ligne (Profil, Support). Les listes de mouvements et les
 * sélecteurs ne portent plus de tuile par défaut — voir TransactionItem,
 * ListItem et SelectableRow, dont le slot `leading` est désormais off.
 */
export function IconTile({
  icon: Icon,
  tone = "neutral",
  size = 40,
  iconSize = 17,
}: IconTileProps) {
  const toneClasses = TONE_CLASSES[tone];

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-sm",
        toneClasses.tile,
      )}
      style={{ width: size, height: size }}
    >
      <Icon size={iconSize} className={toneClasses.icon} aria-hidden="true" />
    </div>
  );
}
