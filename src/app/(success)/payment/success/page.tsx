import { OperationUnavailable } from "@/components/feedback/OperationUnavailable";

export const metadata = { title: "Paiement" };

/**
 * Écran 24 · Paiement — le flux de paiement marchand par carte n'est pas encore
 * raccordé (aucun endpoint de paiement côté backend). L'ancienne version
 * affichait un « Paiement accepté » avec un montant codé en dur (39 341 FCFA),
 * une référence et une date figées, sans aucun appel ni débit : un succès qui
 * n'a jamais eu lieu. Tant que le flux n'émet pas de vraie mutation, on ne
 * confirme rien.
 */
export default function PaymentSuccessPage() {
  return (
    <OperationUnavailable
      title="Paiement indisponible"
      message="Le paiement par carte n'est pas encore raccordé. Aucun montant n'a été débité."
      backHref="/cards"
      backLabel="Retour à mes cartes"
    />
  );
}
