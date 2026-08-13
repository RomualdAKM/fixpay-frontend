import { GlassCard } from "@/components/ui/GlassCard";
import { SectionLabel } from "@/components/ui/SectionLabel";

interface BalanceCardProps {
  /** Libellé de la ressource, e.g. 'Portefeuille disponible'. */
  label: string;
  /** Pre-formatted amount, e.g. '1 866 252 FCFA'. */
  amount: string;
}

/**
 * Rappel de la ressource en tête de flux : SectionLabel + montant 20px bold
 * sur une surface unique (rayon `lg`).
 *
 * L'icône d'accent alignée à droite (Wallet sur 06, CreditCard sur 07) a été
 * supprimée : l'audit la relève comme remplissage de composition — ni
 * cliquable, ni informative, ni affordance. Si un geste est nécessaire à cet
 * endroit, ce doit être un lien réel, pas un glyphe décoratif.
 * Screens 06, 07.
 */
export function BalanceCard({ label, amount }: BalanceCardProps) {
  return (
    <GlassCard className="flex flex-col justify-center p-[15px]">
      <SectionLabel>{label}</SectionLabel>
      <p className="text-text mt-[3px] text-[20px] font-bold">{amount}</p>
    </GlassCard>
  );
}
