import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type BadgeTone = "success" | "primary";

interface BadgeProps {
  tone?: BadgeTone;
  icon?: LucideIcon;
  children: string;
}

/*
 * Double transparence conservée (remplissage teinté + bordure plus opaque),
 * mais exprimée avec les tokens sémantiques : les rgb() en dur reprenaient
 * green-500 / blue-500 de Tailwind, que l'audit a fait sortir de la palette.
 */
const TONE_CLASSES: Record<BadgeTone, string> = {
  success: "bg-success-tint border-success-border text-success",
  primary: "bg-primary-tint border-primary-border text-primary",
};

/**
 * Small status pill ('Compte vérifié'): h-24px, tinted fill + border,
 * optional 11px leading icon.
 */
export function Badge({ tone = "success", icon: Icon, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-full border px-2.5 text-[11px] font-semibold",
        TONE_CLASSES[tone],
      )}
    >
      {Icon ? (
        <Icon
          size={11}
          strokeWidth={1.5}
          absoluteStrokeWidth
          aria-hidden="true"
        />
      ) : null}
      {children}
    </span>
  );
}
