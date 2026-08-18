export type TxIcon =
  "shopping" | "music" | "plane" | "deposit" | "withdraw" | "card" | "refresh";

/** A transaction / wallet movement row (screens 02, 03, 10). */
export interface Transaction {
  id: string;
  title: string;
  /**
   * Horodatage ISO 8601 local (sans décalage) : la source de vérité pour
   * trier et pour recalculer un libellé.
   */
  at: string;
  /**
   * Libellé prêt à afficher, produit par `formatDate(at, MOCK_NOW)` — donc
   * toujours conforme à la règle unique du produit. Un composant peut aussi
   * appeler `formatDate(at)` s'il veut une date relative à maintenant.
   */
  date: string;
  /** Signed amount: negative for debits, positive for credits. */
  amount: number;
  currency: "FCFA" | "EUR";
  direction: "credit" | "debit";
  icon: TxIcon;
}

export type NotificationTone = "green" | "blue" | "amber" | "neutral";

/** A notification row (screen 28). */
export interface AppNotification {
  id: string;
  icon: TxIcon | "shield" | "check";
  tone: NotificationTone;
  title: string;
  /** Horodatage ISO 8601 local, source du tri et du libellé. */
  at: string;
  /** Corps du message, sans la date. */
  body: string;
  /** `body` suivi de " · " et de la date au format unique. */
  description: string;
  unread: boolean;
}
