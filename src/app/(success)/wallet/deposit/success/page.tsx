import { ArrowDownLeft } from "lucide-react";

import type { ReceiptRow } from "@/components/ui/SuccessScreen";
import { SuccessScreen } from "@/components/ui/SuccessScreen";
import { formatAmount, formatFcfa } from "@/lib/format";
import { depositFacts, wallet } from "@/lib/mock-data";

export const metadata = { title: "Succès Dépôt" };

/**
 * Écran 21 · Succès Dépôt.
 *
 * L'écran porte un RÉCAPITULATIF d'opération au lieu de ~420px de vide, et
 * l'icône est la flèche entrante des mouvements créditeurs (`txIconMap.deposit`),
 * pas le nuage CloudUpload d'un stockage de fichiers.
 *
 * Corrections de la re-notation :
 * - le sous-titre « Votre portefeuille FixPay a été approvisionné » disparaît :
 *   il redisait la ligne « Destination » du reçu 80px plus bas ;
 * - « Délai de crédit : sous 2 min » disparaît aussi — le solde d'arrivée est
 *   affiché juste en dessous, annoncer un délai à côté serait se contredire ;
 * - le masquage du numéro suit enfin le découpage sénégalais 77 XXX XX XX, en
 *   masquant des groupes entiers ;
 * - l'écran propose une seconde sortie (« Nouveau dépôt »), en lien texte.
 *
 * Étape 11 · composition : le desktop passe sur la grille à deux colonnes
 * commune aux six confirmations (voir SuccessScreen), et le montant porte le
 * SIGNE de l'opération. Un dépôt et un retrait signaient jusqu'ici du même
 * badge vert, la nature du mouvement ne tenant plus qu'à l'orientation d'un
 * glyphe de 22px ; « + 50 000 » la porte à la taille du montant.
 */
const AMOUNT = 50_000;

/**
 * Solde d'arrivée DÉRIVÉ, jamais recopié. `wallet.balance` est le solde
 * COURANT du portefeuille ; ce dépôt du 14 avr. 16:20 est le dernier mouvement
 * de la série de démonstration, son solde d'arrivée EST donc le solde courant.
 * Les écrans 22, 23 et 25 lui sont antérieurs et remontent la même chaîne :
 * chacun retire de `wallet.balance` les mouvements qui l'ont suivi. Les quatre
 * confirmations n'affichent plus le même chiffre.
 */
const WALLET_AFTER = wallet.balance;

const receipt: ReceiptRow[] = [
  ["Source", "Wave · +221 77 ••• •• 34"],
  ["Destination", "Portefeuille FixPay"],
  ["Frais", depositFacts.feeLabel],
  ["Nouveau solde", formatFcfa(WALLET_AFTER)],
  ["Référence", "FP-1404-8871"],
  ["Date", "14 avr. 2026, 16:20"],
];

export default function WalletDepositSuccessPage() {
  return (
    <SuccessScreen
      icon={ArrowDownLeft}
      title="Dépôt confirmé"
      amount={formatAmount(AMOUNT)}
      sign="+"
      currency="FCFA"
      receipt={receipt}
      secondaryLabel="Nouveau dépôt"
      secondaryHref="/wallet/deposit"
    />
  );
}
