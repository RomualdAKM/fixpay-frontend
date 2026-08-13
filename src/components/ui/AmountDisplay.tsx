import { AmountFigure } from "@/components/ui/AmountText";
import { splitAmountCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

type AmountDisplaySize = "payment" | "success";

interface AmountDisplayProps {
  /**
   * Montant formaté. Il peut porter son unité (« 25 000 FCFA ») ou non
   * (« 25 000 ») : le composant la détache lui-même. Aucun appelant n'a plus à
   * savoir comment se compose une devise.
   */
  value: string;
  /** Unité, quand elle ne se déduit pas de `value`. */
  currency?: string;
  size?: AmountDisplaySize;
  /** Optional semantic color of the number. Laissé vide, le montant est en --c-text. */
  colorClass?: string;
  className?: string;
}

/**
 * Grand montant. Deux tailles, une seule composition : le nombre porte la
 * graisse et le tracking négatif, la devise reste calée sur la baseline en
 * corps réduit et en couleur secondaire — c'est le nombre qu'on lit, pas
 * l'unité.
 *
 * `payment` (écran 08) : 36px w700 tracking -2px.
 * `success` (écrans 21-25) : 32px w700 tracking -1px. Descendu de 38px après
 * l'audit — un montant confirmé n'a pas à être plus gros que le montant que
 * l'utilisateur vient de saisir.
 *
 * LA DEVISE N'EST PAS UN CHIFFRE (marqueur [J], écran 08). Elle était composée
 * en 16px w700 tracking -2px, c'est-à-dire dans la matière même du nombre :
 * les quatre capitales se touchaient et faisaient masse avec lui. Elle passe
 * en corps réduit, graisse normale, interlettrage neutre et couleur secondaire,
 * sur la baseline du nombre. Un seul objet lourd par montant.
 *
 * Les chiffres tabulaires sont posés sur `body`, rien à redéclarer ici. Le
 * groupement des milliers est protégé par `AmountFigure`.
 */
export function AmountDisplay({
  value,
  currency,
  size = "payment",
  colorClass,
  className,
}: AmountDisplayProps) {
  const success = size === "success";
  // La séparation nombre / unité est faite ICI, jamais par l'appelant : c'est
  // la même règle que sur `AmountText`, appliquée au registre display.
  const split = splitAmountCurrency(value);
  const figure = currency ? value : split.figure;
  const unit = currency ?? split.currency;

  return (
    <p className={cn("flex items-baseline justify-center gap-1.5", className)}>
      <AmountFigure
        value={figure}
        className={cn(
          success
            ? "text-[32px] leading-[40px] font-bold tracking-[-1px]"
            : "text-4xl leading-[47px] font-bold tracking-[-2px]",
          colorClass ?? "text-text",
        )}
      />
      {unit && (
        <span
          className={cn(
            "text-text-secondary font-normal tracking-normal",
            success ? "text-[14px] leading-[19px]" : "text-[15px] leading-5",
          )}
        >
          {unit}
        </span>
      )}
    </p>
  );
}
