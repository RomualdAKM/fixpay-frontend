interface ProgressBarProps {
  /** Fill percentage, clamped to 0–100. */
  percent: number;
}

/**
 * Thin 6px progress bar: white@0.08 track, flat brand fill
 * (spending breakdown, screen 11).
 *
 * Aplat et non dégradé : « un dégradé 135° sur un objet de 6px de haut est
 * invisible », et le dégradé est désormais réservé à la carte bancaire.
 */
export function ProgressBar({ percent }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className="bg-border h-1.5 w-full overflow-hidden rounded-xs"
    >
      <div
        className="bg-primary h-full rounded-xs"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
