import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { StatusDot } from "@/components/ui/StatusDot";

type IconButtonSize = 38 | 34 | 32 | 30;

interface IconButtonProps {
  icon: LucideIcon;
  size?: IconButtonSize;
  /** Class driving the icon (and optional label) color. */
  iconClass?: string;
  /** Blue 6px notification dot, top-right (bell). */
  badge?: boolean;
  onClick?: () => void;
  /** When provided, renders a styled Next.js `<Link>`. */
  href?: string;
  /** Visible text next to the icon ('Masquer'); also the accessible name. */
  label?: string;
  /**
   * Accessible name for icon-only usage (required whenever `label` is
   * absent — icon buttons must expose an aria-label).
   */
  ariaLabel?: string;
  /** Icon size override in px (the 34px Sun button uses a 17px icon). */
  iconSize?: number;
  /** Hairline border (default). The 30px hero eye button has none. */
  bordered?: boolean;
  /** Background class override (hero eye button uses `bg-surface-3`). */
  bgClass?: string;
}

const ICON_SIZE: Record<IconButtonSize, number> = {
  38: 17,
  34: 16,
  32: 16,
  30: 15,
};

/**
 * Glass icon button (header actions, back button, hide/show eye).
 * Renders a `<Link>` when `href` is provided, otherwise a `<button>`.
 */
export function IconButton({
  icon: Icon,
  size = 34,
  iconClass = "text-icon-muted",
  badge = false,
  onClick,
  href,
  label,
  ariaLabel,
  iconSize,
  bordered = true,
  bgClass = "bg-surface-2",
}: IconButtonProps) {
  // Visible label carries the accessible name; aria-label covers icon-only.
  const accessibleName = label ? undefined : ariaLabel;
  const classes = cn(
    // Rayon `sm` quelle que soit la taille : les quatre valeurs d'origine
    // (13/10/10/8) étaient un recensement d'import, pas une échelle.
    "relative inline-flex shrink-0 items-center justify-center rounded-sm",
    // Desktop-only affordances (hover/focus-visible never fire on touch).
    "transition-colors hover:bg-surface-3 focus-visible:ring-primary/60 focus-visible:ring-2 focus-visible:outline-none",
    bgClass,
    bordered && "border border-border",
    label && "gap-1.5 px-[9px]",
  );
  const style = {
    height: size,
    ...(label ? {} : { width: size }),
  };

  const content = (
    <>
      <Icon
        size={iconSize ?? ICON_SIZE[size]}
        className={iconClass}
        aria-hidden="true"
      />
      {label ? (
        <span className={cn("text-[11.5px] font-medium", iconClass)}>
          {label}
        </span>
      ) : null}
      {badge ? (
        <StatusDot
          size={6}
          colorClass="bg-primary"
          ring
          className="absolute top-[7px] right-[7px]"
        />
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        aria-label={accessibleName}
        className={classes}
        style={style}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={accessibleName}
      className={classes}
      style={style}
    >
      {content}
    </button>
  );
}
