import { OperationUnavailable } from "@/components/feedback/OperationUnavailable";

export const metadata = { title: "Alimentation carte" };

/**
 * Écran 23 · Alimentation carte — non raccordé. L'alimentation d'une carte
 * passe par POST /api/cards/{uuid}/recharge (garde pin.ticket:card_recharge) et
 * une conversion FX USD, non encore câblés côté front. L'ancienne page affichait
 * un « Carte alimentée » de 125 000 FCFA codé en dur, sans appel ni débit. Tant
 * que la mutation réelle n'est pas émise, on ne confirme aucun transfert.
 */
export default function CardTopUpSuccessPage() {
  return (
    <OperationUnavailable
      title="Alimentation indisponible"
      message="L'alimentation de carte n'est pas encore raccordée. Aucun montant n'a été transféré."
      backHref="/cards/visa-4291"
      backLabel="Retour à ma carte"
    />
  );
}
