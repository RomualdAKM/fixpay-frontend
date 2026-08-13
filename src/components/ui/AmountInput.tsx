import { cn } from "@/lib/utils";

interface AmountInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  /**
   * 'amount' (default) = centered 22px bold numeric field (06/07);
   * 'text' = left-aligned 15px h-48 text field ('NOM SUR LA CARTE', screen 09).
   */
  variant?: "amount" | "text";
  /** Accessible name; defaults to the placeholder. */
  ariaLabel?: string;
}

/**
 * Standalone input field with the stronger white@0.14 border.
 * Amount variant uses the native numeric keyboard (no custom numpad).
 * Screens 06, 07, 09.
 */
export function AmountInput({
  value,
  onChange,
  placeholder,
  variant = "amount",
  ariaLabel,
}: AmountInputProps) {
  return (
    <input
      type="text"
      inputMode={variant === "amount" ? "numeric" : "text"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={ariaLabel ?? placeholder}
      className={cn(
        "border-border-strong bg-surface text-text placeholder:text-text-muted w-full rounded-md border outline-none",
        // Desktop-only affordances. `focus-visible` always matches on text
        // inputs, so this doubles as the requested focus:border-primary.
        "hover:border-primary/40 focus-visible:border-primary focus-visible:ring-primary/60 transition-colors focus-visible:ring-2 focus-visible:outline-none",
        variant === "amount"
          ? "h-[57px] text-center text-[22px] font-bold tracking-[-0.5px]"
          : "h-12 px-[17px] text-left text-[15px] font-normal",
      )}
    />
  );
}
