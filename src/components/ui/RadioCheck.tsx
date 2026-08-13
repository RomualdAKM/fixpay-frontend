import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

interface RadioCheckProps {
  /**
   * `selected` = filled primary circle + white check;
   * `empty` = 2px white@0.14 outline, nothing inside.
   *
   * Le troisième état de la maquette (cercle vide AVEC une coche visible)
   * a été supprimé : il reproduisait un défaut qui affichait six pays cochés
   * simultanément sur les écrans de dépôt et de retrait.
   */
  state: "selected" | "empty";
  size?: 20 | 22;
}

/**
 * Circular selection indicator used at the right edge of SelectableRow.
 * Purely decorative — the owning row carries the selection semantics.
 * Screens 04, 05, 06, 07, 08, 09, 13.
 */
export function RadioCheck({ state, size = 22 }: RadioCheckProps) {
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size }}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full",
        state === "selected" ? "bg-primary" : "border-border-strong border-2",
      )}
    >
      {state === "selected" && (
        <Check size={11} strokeWidth={3} className="text-white" />
      )}
    </span>
  );
}
