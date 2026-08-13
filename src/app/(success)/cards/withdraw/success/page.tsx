import { OperationUnavailable } from "@/components/feedback/OperationUnavailable";

export const metadata = { title: "Retrait carte" };

/**
 * Écran 25 · Rapatriement carte → portefeuille — non raccordé. Le retrait
 * d'une carte passe par POST /api/cards/{uuid}/cashout (garde
 * pin.ticket:card_cashout) et une conversion FX USD, non encore câblés côté
 * front. L'ancienne page affichait « Fonds rapatriés » de 100 000 FCFA codé en
 * dur, sans appel ni crédit. Tant que la mutation réelle n'est pas émise, on ne
 * confirme aucun mouvement.
 */
export default function CardWithdrawSuccessPage() {
  return (
    <OperationUnavailable
      title="Retrait indisponible"
      message="Le retrait de carte n'est pas encore raccordé. Aucun montant n'a été rapatrié."
      backHref="/wallet"
      backLabel="Retour au portefeuille"
    />
  );
}
