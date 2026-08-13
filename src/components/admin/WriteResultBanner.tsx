import { CheckCircle2, Clock } from "lucide-react";

import type { WriteOutcome } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

/**
 * Renders the HONEST result of an admin write. A `pending` outcome (202) is a
 * maker-checker approval request — the change is NOT applied yet, so the banner
 * says "en attente d'approbation" and never implies success. An `applied`
 * outcome (200/201) confirms the change took effect.
 *
 * "Les données ne mentent pas" : the wording is driven by the HTTP status the
 * backend returned, not by an assumption about which entity was written.
 */
export function WriteResultBanner<T>({
  outcome,
  className,
}: {
  outcome: WriteOutcome<T> | null;
  className?: string;
}) {
  if (outcome === null) return null;

  if (outcome.kind === "pending") {
    return (
      <div
        role="status"
        className={cn(
          "border-warning-border bg-warning-tint flex items-start gap-2.5 rounded-md border px-3.5 py-3",
          className,
        )}
      >
        <Clock
          size={16}
          strokeWidth={2}
          absoluteStrokeWidth
          aria-hidden="true"
          className="text-warning-deep mt-[1px] shrink-0"
        />
        <div className="text-[13px] leading-[18px]">
          <p className="text-warning-deep font-semibold">
            Modification soumise, en attente d&apos;approbation
          </p>
          <p className="text-text-secondary mt-0.5">
            Cette modification sensible n&apos;est PAS encore appliquée. Une
            demande d&apos;approbation (maker-checker) a été créée
            {outcome.approval.uuid ? (
              <>
                {" "}
                — réf.{" "}
                <span className="font-mono">{outcome.approval.uuid}</span>
              </>
            ) : null}
            . Elle prendra effet une fois approuvée par une autre personne.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      role="status"
      className={cn(
        "border-success-border bg-success-tint flex items-start gap-2.5 rounded-md border px-3.5 py-3",
        className,
      )}
    >
      <CheckCircle2
        size={16}
        strokeWidth={2}
        absoluteStrokeWidth
        aria-hidden="true"
        className="text-success mt-[1px] shrink-0"
      />
      <div className="text-[13px] leading-[18px]">
        <p className="text-success-deep font-semibold">Modification appliquée</p>
        <p className="text-text-secondary mt-0.5">
          Le changement a pris effet immédiatement.
        </p>
      </div>
    </div>
  );
}
