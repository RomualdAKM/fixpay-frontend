import { formatAmount } from "@/lib/format";

interface QuickAmountChipsProps {
  /** Exactly four round amounts — the row is laid out in four equal columns. */
  amounts: number[];
  onSelect: (n: number) => void;
}

/**
 * Quick-amount pills, four to a row in `grid-cols-4`.
 *
 * L'audit relevait deux défauts sur ce composant : un `flex-wrap` qui laissait
 * un orphelin en fin de ligne (« un orphelin en fin de wrap est toujours un
 * accident ») et des largeurs de chip variables selon le nombre de chiffres.
 * La grille à colonnes égales règle les deux et donne un bloc rectangulaire.
 * La devise a disparu des libellés : elle est déjà portée par le montant.
 * Écrans 06, 07, 08.
 */
export function QuickAmountChips({ amounts, onSelect }: QuickAmountChipsProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {amounts.map((amount) => (
        <button
          key={amount}
          type="button"
          onClick={() => onSelect(amount)}
          className="border-border-strong bg-surface text-text-secondary hover:border-primary/40 hover:text-text focus-visible:ring-primary/60 h-9 rounded-full border px-2 text-[13px] font-normal transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          {formatAmount(amount)}
        </button>
      ))}
    </div>
  );
}
