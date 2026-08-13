import { cn } from "@/lib/utils";

interface StepProgressProps {
  /** Total number of wizard segments (4 for wallet flows, 5 for card creation). */
  steps: number;
  /** Current step, 1-based. Segments up to and including it are filled. */
  current: number;
}

/**
 * Wizard progress bar: N full-width segments (h-1, fully rounded, gap 6px).
 * Completed/current segments are primary, the rest white@0.14.
 * Sobriété saluée par l'audit : aucun ornement, aucun dégradé.
 * Screens 04, 05, 09.
 */
export function StepProgress({ steps, current }: StepProgressProps) {
  return (
    <div
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={steps}
      aria-valuenow={current}
      aria-label={`Étape ${current} sur ${steps}`}
      className="flex w-full gap-1.5"
    >
      {Array.from({ length: steps }, (_, i) => (
        <span
          key={i}
          className={cn(
            "h-1 flex-1 rounded-full",
            i + 1 <= current ? "bg-primary" : "bg-surface-4",
          )}
        />
      ))}
    </div>
  );
}
