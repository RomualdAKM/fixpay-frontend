import { cn } from "@/lib/utils";

interface PinFieldProps {
  /** Current digits entered. */
  value: string;
  /** Number of cells to render (PIN is 4–6 digits; default 6). */
  length?: number;
  /** Marks every cell as errored (e.g. after a rejected PIN). */
  invalid?: boolean;
  className?: string;
}

/**
 * Presentational PIN display: a row of cells, each filled once its position has
 * a digit. Entry is driven externally (the `Numpad`), so this component holds
 * no state and simply reflects `value`. The dots are decorative; the labelled
 * status is announced by the surrounding screen.
 */
export function PinField({
  value,
  length = 6,
  invalid = false,
  className,
}: PinFieldProps) {
  const cells = Array.from({ length }, (_, index) => index < value.length);
  // French agreement: 0 and 1 take the singular, 2+ the plural.
  const plural = value.length >= 2 ? "s" : "";
  const progressLabel = `${value.length} chiffre${plural} sur ${length} saisi${plural}`;

  return (
    <div className={cn("flex items-center justify-center gap-3", className)}>
      {cells.map((filled, index) => (
        <span
          key={index}
          aria-hidden="true"
          className={cn(
            "size-3.5 rounded-full border transition-colors",
            filled
              ? invalid
                ? "border-danger bg-danger"
                : "border-primary bg-primary"
              : "border-border-strong bg-transparent",
          )}
        />
      ))}
      {/* Announce entry progress on each keystroke to screen readers. A static
          role="img" label is read once and never re-announced; a polite live
          region gives non-visual users continuous feedback on the PIN. */}
      <span role="status" aria-live="polite" className="sr-only">
        {progressLabel}
      </span>
    </div>
  );
}
