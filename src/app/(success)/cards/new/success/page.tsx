import { OperationUnavailable } from "@/components/feedback/OperationUnavailable";

export const metadata = { title: "Création de carte" };

/**
 * Écran 20 · Création de carte — non raccordé. L'émission passe par
 * POST /api/cards (garde pin.ticket:card_issue) à partir d'un BIN, et renvoie un
 * ordre d'émission asynchrone (CardIssuanceOrder), non encore câblé côté front.
 * L'ancienne page affichait une carte « prête » avec les données figées de
 * mock-data, sans qu'aucune carte n'ait été émise. Tant que l'ordre réel n'est
 * pas créé, on n'annonce aucune carte.
 */
export default function CardCreationSuccessPage() {
  return (
    <OperationUnavailable
      title="Création de carte indisponible"
      message="L'émission de carte n'est pas encore raccordée. Aucune carte n'a été créée ni débitée."
      backHref="/profile"
      backLabel="Retour au profil"
    />
  );
}
