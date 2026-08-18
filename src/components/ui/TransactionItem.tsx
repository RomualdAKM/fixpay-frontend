import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

import { AmountFigure, AmountText } from "@/components/ui/AmountText";
import { formatSigned } from "@/lib/format";
import type { Transaction } from "@/lib/display-types";
import { cn } from "@/lib/utils";

interface TransactionItemProps {
  transaction: Transaction;
  /** Suppresses the bottom hairline on the last row of a list. */
  last?: boolean;
  /**
   * Pastille ronde 28px de sens de mouvement : ArrowDownLeft pour une entrée,
   * ArrowUpRight pour une sortie. Deux formes opposées, lisibles à 14px, à
   * réserver aux mouvements internes (dépôt / retrait) pour les distinguer
   * des dépenses. Absente par défaut.
   */
  accent?: boolean;
  /**
   * Visuel de tête libre — OPTIONNEL ET ABSENT PAR DÉFAUT depuis l'audit :
   * la tuile 40px neutre était posée sur toutes les rangées, avec trois
   * glyphes cloud identiques sur quatre. La ligne se lit sur le titre, la
   * date et le montant coloré. Ignoré si `accent` est posé.
   */
  leading?: ReactNode;
  /**
   * Largeur du visuel de tête, quand il n'est pas la pastille de 28px : c'est
   * la mesure que réservent les rangées voisines qui n'en portent pas.
   */
  leadingWidth?: number;
  /**
   * Force la réservation de gouttière au lieu de la déduire du conteneur.
   * À n'utiliser que si les rangées ne sont pas les enfants directs de leur
   * liste (la détection `:has()` de globals.css ne les voit pas).
   */
  reserveGutter?: boolean;
}

/** Largeur de la pastille de direction, et gouttière par défaut. */
const DOT_SIZE = 28;
/** Écart rangée : visuel de tête → texte. */
const ROW_GAP = 13;

/** Pastille ronde 28px — remplace la tuile carrée teintée de la maquette. */
function DirectionDot({ credit }: { credit: boolean }) {
  const Icon = credit ? ArrowDownLeft : ArrowUpRight;

  return (
    <span
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-full",
        credit ? "bg-success-tint" : "bg-surface-2",
      )}
    >
      <Icon
        size={14}
        strokeWidth={2}
        absoluteStrokeWidth
        aria-hidden="true"
        className={credit ? "text-success" : "text-icon-muted"}
      />
    </span>
  );
}

/**
 * Rangée d'historique (h-65, hairline basse sauf `last`) : titre 13.5px,
 * date 11.5px muted, montant signé et coloré à droite.
 *
 * Aucun visuel de tête par défaut — c'est la décision de l'audit sur les
 * listes : plus de colonne de carrés gris identiques.
 *
 * GOUTTIÈRE : une liste mixte (l'Accueil, où seuls les mouvements internes
 * portent leur pastille) alignait ses rangées sur deux bords gauche
 * différents. La rangée sans visuel décale donc son bloc de texte de la
 * largeur du visuel voisin — espace VIDE, pas tuile réintroduite — dès que le
 * conteneur signale qu'au moins une de ses rangées en porte un
 * (`--list-gutter-on`, voir globals.css). Une liste où personne n'en porte
 * n'est pas décalée d'un pixel.
 * Screens 02, 03, 10.
 */
export function TransactionItem({
  transaction,
  last = false,
  accent = false,
  leading,
  leadingWidth = DOT_SIZE,
  reserveGutter,
}: TransactionItemProps) {
  const credit = transaction.direction === "credit";
  const lead = accent ? <DirectionDot credit={credit} /> : leading;
  const gutter = (accent ? DOT_SIZE : leadingWidth) + ROW_GAP;

  return (
    <div
      data-list-row=""
      data-list-leading={lead ? "" : undefined}
      style={
        reserveGutter === undefined
          ? undefined
          : ({ "--list-gutter-on": reserveGutter ? 1 : 0 } as CSSProperties)
      }
      className={cn(
        "flex h-[65px] items-center gap-[13px]",
        !last && "border-border border-b",
      )}
    >
      {lead}
      <div
        className="min-w-0 flex-1"
        style={
          lead
            ? undefined
            : {
                marginInlineStart: `calc(var(--list-gutter-on, 0) * ${gutter}px)`,
              }
        }
      >
        <p className="text-text truncate text-[13.5px] font-medium">
          {transaction.title}
        </p>
        <p className="text-text-muted mt-[2px] truncate text-[11.5px]">
          {transaction.date}
        </p>
      </div>
      {transaction.currency === "EUR" ? (
        <AmountFigure
          value={formatSigned(transaction)}
          className={cn(
            "shrink-0 text-[14px] font-semibold",
            credit ? "text-success" : "text-danger",
          )}
        />
      ) : (
        <AmountText
          amount={transaction.amount}
          signed
          className="shrink-0 text-[14px] font-semibold"
        />
      )}
    </div>
  );
}
