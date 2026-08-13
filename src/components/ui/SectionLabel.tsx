import { cn } from "@/lib/utils";

interface SectionLabelProps {
  children: string;
  className?: string;
}

/**
 * Section label. RÉÉCRIT après l'audit : le micro-label 10px w600 uppercase
 * +0.1em en --c-text-muted était le tic typographique le plus répandu du
 * produit (20 fichiers) et tombait sous le seuil AA.
 *
 * Nouvelle définition, unique et non paramétrable en taille : 13px / w500 /
 * casse de phrase / tracking 0 / --c-text-secondary. Le libellé se lit comme
 * du texte, pas comme une étiquette de gabarit. Les majuscules espacées ne
 * sont plus admises nulle part (le token `--tracking-label` a été supprimé).
 *
 * `className` reste ouvert pour le rythme vertical (mt-*, px-*) ; il n'est
 * plus destiné à redéfinir taille, graisse ou couleur.
 *
 * RÈGLE D'EMPLOI — deux rôles, deux objets typographiques. Ce composant est
 * l'EN-TÊTE DE SECTION : il coiffe un groupe de lignes ou de champs
 * (« Préférences », « Sécurité », « Votre dossier »). Il ne doit JAMAIS servir
 * de libellé d'un champ isolé : sur l'écran 16, « Langue » et « Préférences »
 * étaient rendus par le même appel, à 20px l'un de l'autre, et plus rien ne
 * disait lequel contenait l'autre.
 *
 * Le libellé de champ est un second niveau, plus petit et plus discret
 * (12px / w400 / --c-text-muted), tenu par le champ lui-même — voir
 * `SelectField`. Ce n'est PAS un retour au micro-label 10px majuscule espacé :
 * la casse de phrase et le tracking 0 valent pour les deux niveaux.
 */
export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <p
      className={cn(
        "text-text-secondary text-[13px] leading-[18px] font-medium",
        className,
      )}
    >
      {children}
    </p>
  );
}
