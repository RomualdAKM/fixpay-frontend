import { InlineError } from "@/components/feedback/InlineError";
import { TransactionItem } from "@/components/ui/TransactionItem";
import type { Transaction } from "@/lib/display-types";

interface WalletMovementsProps {
  rows: Transaction[];
  loading: boolean;
  error?: unknown;
  onRetry?: () => void;
  /** Empty-state copy, shown when the ledger has no rows. */
  emptyLabel: string;
  /** Pastille de sens sur chaque rangée (mouvements internes). */
  accent?: boolean;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
}

/** Three-row loading placeholder matching the 65px transaction row height. */
function MovementsSkeleton() {
  return (
    <div className="animate-pulse [&>*:last-child]:border-b-0" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="border-border flex h-[65px] items-center gap-[13px] border-b"
        >
          <div className="min-w-0 flex-1">
            <div className="bg-surface-3 h-[11px] w-2/5 rounded-xs" />
            <div className="bg-surface-2 mt-[7px] h-[9px] w-1/4 rounded-xs" />
          </div>
          <div className="bg-surface-2 h-[11px] w-[62px] shrink-0 rounded-xs" />
        </div>
      ))}
    </div>
  );
}

/**
 * The wallet ledger, rendered with real loading / error / empty / "load more"
 * states over the audited `TransactionItem` rows. Used by the dashboard (recent
 * slice) and the wallet statement (paginated).
 */
export function WalletMovements({
  rows,
  loading,
  error,
  onRetry,
  emptyLabel,
  accent = false,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
}: WalletMovementsProps) {
  if (loading) {
    return (
      <div className="mt-3">
        <MovementsSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-3">
        <InlineError error={error} />
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="text-primary-light mt-3 text-[13px] leading-[18px] font-medium underline-offset-4 hover:underline"
          >
            Réessayer
          </button>
        )}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <p className="text-text-muted mt-3 py-6 text-center text-[13px] leading-[19px]">
        {emptyLabel}
      </p>
    );
  }

  return (
    <>
      <div className="mt-3 [&>*:last-child]:border-b-0">
        {rows.map((row) => (
          <TransactionItem key={row.id} transaction={row} accent={accent} />
        ))}
      </div>
      {hasMore && onLoadMore && (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={loadingMore}
          className="border-border bg-surface text-text-secondary hover:bg-surface-2 hover:text-text focus-visible:ring-primary/60 mt-4 inline-flex h-9 w-full items-center justify-center rounded-md border text-[13px] font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-60"
        >
          {loadingMore ? "Chargement…" : "Charger plus"}
        </button>
      )}
    </>
  );
}
