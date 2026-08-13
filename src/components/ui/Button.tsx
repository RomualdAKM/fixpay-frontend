import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "glass" | "white" | "small";

interface ButtonProps {
  variant?: ButtonVariant;
  children: ReactNode;
  /** When provided, renders a styled Next.js `<Link>` instead of a `<button>`. */
  href?: string;
  onClick?: () => void;
  /** Native button type; defaults to `"button"`. Use `"submit"` inside forms. */
  type?: "button" | "submit";
  /** Disables the button (ignored for the `<Link>` variant). */
  disabled?: boolean;
  className?: string;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  /*
   * h-50 CTA : aplat de marque, rayon md, AUCUNE ombre. L'audit désigne le
   * halo bleu porté par ce bouton (28px de flou sous 50px de hauteur) comme
   * le marqueur n°1 du lot, et le dégradé 135° comme sa peinture
   * universelle : le dégradé est désormais réservé à la carte bancaire.
   */
  primary:
    "h-[50px] w-full rounded-md bg-primary text-[15px] font-semibold text-white hover:opacity-90",
  /* glass secondary CTA ('Se connecter') */
  glass:
    "h-[50px] w-full rounded-md border border-border-strong bg-surface text-[15px] font-semibold text-text-secondary hover:bg-surface-2 hover:text-text",
  /*
   * Aplat blanc sur hero à dégradé ('Dépôt'). Hiérarchie inversée saluée par
   * l'audit comme le seul geste de DA délibéré du lot : à conserver.
   */
  white:
    "h-[50px] w-full rounded-md bg-white text-[15px] font-semibold text-primary-deep hover:opacity-90",
  /* compact flat action ('Alimenter', 'Copier') */
  small:
    "h-8 rounded-sm bg-primary px-4 text-[12px] font-semibold text-white hover:opacity-90",
};

/**
 * FixPay action button. Renders a `<Link>` when `href` is provided,
 * otherwise a `<button type="button">`.
 */
export function Button({
  variant = "primary",
  children,
  href,
  onClick,
  type = "button",
  disabled = false,
  className,
}: ButtonProps) {
  const classes = cn(
    "inline-flex select-none items-center justify-center whitespace-nowrap transition-opacity active:opacity-90",
    // Desktop-only affordances: keyboard focus ring (no effect on mobile).
    "focus-visible:ring-primary/60 focus-visible:ring-2 focus-visible:outline-none",
    disabled && "pointer-events-none opacity-60",
    VARIANT_CLASSES[variant],
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {children}
    </button>
  );
}
