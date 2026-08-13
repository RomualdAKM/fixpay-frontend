import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface ListItemProps {
  title: string;
  /** Overrides the default title color (e.g. primary 'Ajouter une carte'). */
  titleClass?: string;
  /** Muted sub-line; may wrap to 2 lines (notifications). */
  subtitle?: ReactNode;
  /**
   * Visuel de tête — OPTIONNEL ET ABSENT PAR DÉFAUT depuis l'audit : plus
   * aucune tuile sans décision explicite de la page. Ne le remplir que
   * lorsque le glyphe est unique par ligne (menus Profil / Support) ; une
   * colonne de carrés identiques n'informe personne.
   */
  leading?: ReactNode;
  /**
   * Largeur du visuel de tête, en px : c'est la mesure que réservent les
   * rangées voisines qui n'en portent pas. 36 = la tuile / le glyphe courants
   * des listes ; une vignette de carte (80) ou un glyphe nu (18) se déclarent.
   */
  leadingWidth?: number;
  /**
   * Force la réservation de gouttière au lieu de la déduire du conteneur.
   * À n'utiliser que si les rangées ne sont pas les enfants directs de leur
   * liste (la détection `:has()` de globals.css ne les voit pas).
   */
  reserveGutter?: boolean;
  /** 'chevron' rend un ChevronRight lucide 16px, même famille de traits que le reste. */
  trailing?: "chevron" | ReactNode;
  href?: string;
  /** Row height: 51 FAQ (no icon), 65 standard (default), 74 unread notification. */
  height?: 51 | 65 | 74;
}

const HEIGHTS = {
  51: "h-[51px]",
  65: "h-[65px]",
  74: "h-[74px]",
} as const;

/** Écart rangée : visuel de tête → texte. */
const ROW_GAP = 13;

/**
 * Ligne générique de ListGroup : visuel de tête facultatif, titre 13.5px,
 * sous-titre muted, chevron ou nœud libre à droite. Rend un Link si `href`.
 *
 * La ligne ne porte NI rayon NI bordure : le conteneur (ListGroup) dessine
 * la surface et les filets internes.
 *
 * GOUTTIÈRE : le visuel de tête étant devenu facultatif, une liste peut mêler
 * des rangées qui en portent un et d'autres non — le bord gauche se mettait
 * alors à alterner. La rangée sans visuel décale son bloc de texte de la
 * largeur du visuel voisin (espace VIDE : on réserve la place, on ne
 * réintroduit pas la tuile) dès que le conteneur signale qu'une de ses
 * rangées en porte un (`--list-gutter-on`, voir globals.css). Une liste
 * homogène — avec ou sans visuel — n'est pas décalée d'un pixel.
 * Screens 19, 26, 28.
 */
export function ListItem({
  title,
  titleClass,
  subtitle,
  leading,
  leadingWidth = 36,
  reserveGutter,
  trailing,
  href,
  height = 65,
}: ListItemProps) {
  const gutter = leadingWidth + ROW_GAP;

  const content = (
    <>
      {leading}
      <span
        className="min-w-0 flex-1"
        style={
          leading
            ? undefined
            : {
                marginInlineStart: `calc(var(--list-gutter-on, 0) * ${gutter}px)`,
              }
        }
      >
        <span
          className={cn(
            "text-text block truncate text-[13.5px] font-medium",
            titleClass,
          )}
        >
          {title}
        </span>
        {subtitle !== undefined && (
          <span className="text-text-muted mt-[2px] block text-[11.5px] leading-[15px]">
            {subtitle}
          </span>
        )}
      </span>
      {trailing === "chevron" ? (
        <ChevronRight
          size={16}
          strokeWidth={2}
          absoluteStrokeWidth
          aria-hidden="true"
          className="text-icon-muted shrink-0"
        />
      ) : (
        trailing
      )}
    </>
  );

  const rowClass = cn(
    "flex w-full items-center gap-[13px] px-[15px]",
    HEIGHTS[height],
  );

  const rowStyle =
    reserveGutter === undefined
      ? undefined
      : ({ "--list-gutter-on": reserveGutter ? 1 : 0 } as CSSProperties);

  if (href) {
    return (
      <Link
        href={href}
        data-list-row=""
        data-list-leading={leading ? "" : undefined}
        style={rowStyle}
        className={cn(
          rowClass,
          // Affordance desktop uniquement. Le fond de survol est détouré par
          // l'`overflow-hidden` du ListGroup : la ligne n'a plus de rayon.
          "hover:bg-surface-2 transition-colors",
          "focus-visible:ring-primary/60 focus-visible:ring-2 focus-visible:outline-none",
        )}
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      data-list-row=""
      data-list-leading={leading ? "" : undefined}
      style={rowStyle}
      className={rowClass}
    >
      {content}
    </div>
  );
}
