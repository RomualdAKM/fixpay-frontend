import type { ReactNode } from "react";

interface StickyActionBarProps {
  /** Le CTA principal de l'écran (un `Button`, éventuellement un récap). */
  children: ReactNode;
}

/**
 * Barre d'action de fin de flux. Elle garantit UNE chose, aux deux largeurs :
 * le CTA — et tout ce qu'il faut avoir lu avant de l'actionner — est atteignable
 * sans que rien d'autre de l'écran ne devienne inatteignable pour autant.
 *
 * MOBILE (< lg) — barre `fixed` posée juste au-dessus de la BottomNav (74px),
 * fond opaque et filet haut. La hauteur qu'elle prend au viewport est réservée
 * dans le flux par un CLONE INVISIBLE du même contenu, et non par une
 * constante : l'espaceur `h-[82px]` codé en dur ne valait que pour une barre à
 * un seul bouton (50 + 2×16) et sous-réservait de 28px dès qu'un écran y
 * ajoutait une ligne — « Débité de · Visa •••• 4291 » en 08, « Total · payé
 * via Mobile Money » en 09. C'est cette dette de 28px, cumulée au rythme de la
 * page, qui rendait la quatrième rangée du pavé numérique inatteignable :
 * l'écran croyait avoir rendu la barre, la barre en prenait davantage.
 * `visibility: hidden` (et non `opacity`) sort le clone de l'ordre de
 * tabulation, du hit-testing et de l'arbre d'accessibilité : il ne reste que sa
 * boîte. Aucune valeur à tenir à jour quand un écran change le contenu de sa
 * barre.
 *
 * DESKTOP (>= lg) — la BottomNav disparaît, la barre devient `sticky bottom-0`
 * dans le flux du <main>. Tant que la page dépasse la fenêtre, le CTA reste
 * posé sur le bord bas, opaque, séparé du contenu qui défile dessous par un
 * filet ; dès qu'elle ne la dépasse plus, la barre retombe d'elle-même à sa
 * place naturelle sous le contenu. Le « Continuer » de l'écran 05 ne peut donc
 * plus être tranché par le bas de fenêtre, quel que soit le nombre de lignes de
 * l'étape en cours — et le bas de page cesse d'être une arête arbitraire.
 * (Le `sticky` est réservé au desktop : sous `lg`, l'enveloppe d'application
 * porte `overflow-x-hidden`, qui fait d'elle un conteneur de défilement sans
 * défilement propre et neutraliserait tout `position: sticky`.)
 *
 * La barre porte désormais elle-même son rythme de tête (marge, filet,
 * padding). Les marges et filets que certaines pages posaient encore sur leur
 * propre enfant sont neutralisés pour ne pas doubler les siens.
 */
export function StickyActionBar({ children }: StickyActionBarProps) {
  return (
    <>
      {/* Réservation de hauteur EXACTE : même contenu, même filet, même
          padding — mais invisible et inerte. */}
      <div
        aria-hidden="true"
        className="border-border invisible border-t px-5 py-4 lg:hidden"
      >
        {children}
      </div>

      {/* `[&>div]` et non `[&>*]` : on neutralise le conteneur de mise en page
          que la page passe à la barre, jamais un bouton — dont le filet haut
          fait partie de la boîte. */}
      <div className="border-border bg-bg fixed inset-x-0 bottom-[74px] z-40 mx-auto w-full max-w-[430px] border-t px-5 py-4 lg:sticky lg:inset-x-auto lg:bottom-0 lg:mx-0 lg:mt-10 lg:w-auto lg:max-w-none lg:px-0 lg:pt-5 lg:pb-6 lg:[&>div]:mt-0 lg:[&>div]:border-t-0 lg:[&>div]:pt-0">
        {children}
      </div>
    </>
  );
}
