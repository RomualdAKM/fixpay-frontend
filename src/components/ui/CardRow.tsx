import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

import { AmountText } from "@/components/ui/AmountText";
import { StatusDot } from "@/components/ui/StatusDot";
import type { VirtualCardData } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const MASKED_BALANCE = "••••••";

interface CardRowProps {
  card: VirtualCardData;
  /** Masque le solde — piloté par l'œil UNIQUE de l'écran, jamais par la rangée. */
  hidden?: boolean;
  className?: string;
}

/**
 * LA RANGÉE « CARTE » — un seul modèle pour tout le produit.
 *
 * L'audit relevait deux modèles d'interaction pour le MÊME objet sur deux
 * écrans frères : sur le Portefeuille la rangée était un chevron cliquable,
 * sur l'Accueil c'était deux liens texte (« Retirer », « Détails ») posés dans
 * l'en-tête PLUS un bouton « Alimenter » renvoyé sur une quatrième ligne — un
 * bloc de 4 lignes de haut pour la même information, et un vide en L de
 * ~500×130px sous « Carte virtuelle · Actif ».
 *
 * La rangée est donc ramenée à ce qu'elle est : l'identité d'une carte, son
 * état, son solde, et UNE SEULE affordance — la rangée entière mène à l'écran
 * de la carte, où « Alimenter », « Payer » et « Bloquer » existent déjà et sont
 * hiérarchisés. On ne duplique pas une action de niveau carte sur deux écrans
 * de niveau compte.
 *
 * Composition (identique aux deux tailles, identique sur les deux écrans) :
 *  - identité en DM Mono 13px — c'est un numéro, pas un titre ;
 *  - statut sur la ligne suivante, en 12.5px secondaire, avec sa pastille ;
 *  - solde dans la colonne droite, composé comme un solde (20px sous son
 *    libellé) et non comme un sous-titre ; le suffixe « FCFA » est atténué par
 *    `AmountText`, comme partout ailleurs ;
 *  - chevron : la seule affordance, calée sur la colonne d'actions.
 * Deux lignes de texte, 66px de haut, zéro conteneur, zéro tuile d'icône.
 */
export function CardRow({ card, hidden = false, className }: CardRowProps) {
  return (
    <Link
      href={`/cards/${card.id}`}
      className={cn(
        "flex items-center gap-3 py-[15px] lg:transition-opacity lg:hover:opacity-80",
        className,
      )}
    >
      <span className="min-w-0 flex-1">
        <span className="text-text block truncate font-mono text-[13px] leading-[17px] font-medium tracking-[1px] uppercase">
          {card.label}
        </span>
        <span className="text-text-secondary mt-[3px] flex items-center gap-[5px] text-[12.5px] leading-[16px]">
          Carte {card.type.toLowerCase()}
          <span aria-hidden className="text-text-muted">
            ·
          </span>
          <StatusDot size={6} />
          {card.status}
        </span>
      </span>
      <span className="shrink-0 text-right">
        <span className="text-text-muted block text-[11.5px] leading-[15px]">
          Solde
        </span>
        {hidden ? (
          <span className="text-text block text-[20px] leading-[26px] font-semibold">
            {MASKED_BALANCE}
          </span>
        ) : (
          <AmountText
            amount={card.balance}
            className="text-text block text-[20px] leading-[26px] font-semibold"
          />
        )}
      </span>
      {/* -4px : le glyphe est inscrit au centre d'une boîte de 16px et
          s'arrêtait visiblement en retrait de la colonne de droite. */}
      <ChevronRight
        size={16}
        strokeWidth={2}
        absoluteStrokeWidth
        aria-hidden="true"
        className="text-icon-muted -mr-[4px] shrink-0"
      />
    </Link>
  );
}

/**
 * Cadre de la liste de cartes : une seule paire de hairlines pour tout le
 * groupe, un filet entre les rangées. Fourni par le composant plutôt que
 * recopié par chaque page — c'est ce qui garantit que l'Accueil et le
 * Portefeuille encadrent leurs cartes exactement de la même façon.
 */
export function CardRowList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("border-border divide-border divide-y border-y", className)}
    >
      {children}
    </div>
  );
}
