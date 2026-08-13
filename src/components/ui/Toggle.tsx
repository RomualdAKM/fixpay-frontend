"use client";

import { cn } from "@/lib/utils";

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  /** Accessible name for the switch. */
  label?: string;
}

/**
 * Custom 44x26 switch (no styled native input): brand track when ON,
 * white@0.14 when OFF, 22px white knob sliding 2px → 20px.
 *
 * L'audit relevait « l'interrupteur iOS par défaut, choisi par personne » :
 * la piste est redimensionnée (44×26) et la pastille porte une micro-ombre
 * de surface au lieu d'une ombre arbitraire réservée au thème clair.
 */
export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-[26px] w-11 shrink-0 rounded-full transition-colors",
        // Desktop-only affordances (no effect on touch devices).
        "focus-visible:ring-primary/60 focus-visible:ring-offset-bg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        checked
          ? "bg-primary hover:bg-primary-light"
          : "bg-surface-4 hover:bg-surface-5",
      )}
    >
      <span
        className={cn(
          // `shadow-surface` est nul en sombre et devient une hairline en
          // clair : exactement le rôle dont la pastille blanche a besoin.
          "shadow-surface",
          "absolute top-[2px] left-0 size-[22px] rounded-full bg-white transition-transform",
          checked ? "translate-x-[20px]" : "translate-x-[2px]",
        )}
      />
    </button>
  );
}
