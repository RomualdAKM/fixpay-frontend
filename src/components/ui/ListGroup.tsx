import { Children, type ReactNode } from "react";

import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

interface ListGroupProps {
  children?: ReactNode;
  /**
   * Affiche 3 lignes squelette à la place du contenu. L'audit relève qu'aucun
   * état de chargement n'existait nulle part dans `src/`.
   */
  loading?: boolean;
  /**
   * Contenu de l'état vide, rendu quand la liste n'a aucune ligne et qu'elle
   * ne charge pas. Sans ce slot, un groupe vide ne dessine rien plutôt qu'un
   * rectangle bordé sans contenu.
   */
  empty?: ReactNode;
  className?: string;
}

/**
 * Ligne squelette : deux barres de texte, aucune tuile — le placeholder ne
 * doit pas réintroduire la colonne de carrés que l'audit fait disparaître.
 */
function SkeletonRow() {
  return (
    <div className="flex h-[65px] items-center gap-[13px] px-[15px]">
      <div className="min-w-0 flex-1">
        <div className="bg-surface-3 h-[11px] w-2/5 rounded-xs" />
        <div className="bg-surface-2 mt-[7px] h-[9px] w-1/4 rounded-xs" />
      </div>
      <div className="bg-surface-2 h-[11px] w-[62px] shrink-0 rounded-xs" />
    </div>
  );
}

/**
 * Conteneur de liste par défaut du produit : UNE seule surface (rayon `lg`,
 * bordure hairline), des lignes séparées par des filets internes, et aucun
 * rayon ni aucune bordure par ligne — l'audit compte jusqu'à 12 contours
 * dessinés pour une seule liste de 6 entrées.
 *
 * Porte aussi les états `loading` et `empty`, absents de tout le produit.
 * Screens 04, 05, 19, 26, 28.
 */
export function ListGroup({
  children,
  loading = false,
  empty,
  className,
}: ListGroupProps) {
  const isEmpty = Children.toArray(children).length === 0;

  if (!loading && isEmpty && empty === undefined) return null;

  return (
    <GlassCard
      className={cn("divide-border divide-y overflow-hidden", className)}
    >
      {loading ? (
        <div
          className="divide-border animate-pulse divide-y"
          aria-hidden="true"
        >
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      ) : isEmpty ? (
        <div className="text-text-muted px-[15px] py-9 text-center text-[13px] leading-[19px]">
          {empty}
        </div>
      ) : (
        children
      )}
    </GlassCard>
  );
}
