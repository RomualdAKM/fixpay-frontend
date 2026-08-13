import { WalletMinimal } from "lucide-react";

import type { ReceiptRow } from "@/components/ui/SuccessScreen";
import { SuccessScreen } from "@/components/ui/SuccessScreen";
import { formatAmount, formatFcfa } from "@/lib/format";
import { cardWithdrawFacts, primaryCard, wallet } from "@/lib/mock-data";

export const metadata = { title: "Succès Retrait Carte" };

/**
 * Écran 25 · Fonds rapatriés (carte → portefeuille).
 *
 * Le titre distingue le RAPATRIEMENT (mouvement interne) du RETRAIT (sortie
 * vers Mobile Money, écran 22) : deux opérations différentes ne peuvent pas
 * porter le même titre, et l'icône est la destination — le portefeuille.
 *
 * Corrections de la re-notation :
 * - le badge ne partage plus la teinte bleue du CTA (une seule zone bleue = le
 *   point d'action) ;
 * - le sous-titre redisait la ligne « Vers : Portefeuille FixPay » : supprimé ;
 * - le montant n'est plus 50 000, valeur que portaient aussi les écrans 21 et
 *   22 ; il reprend un palier réel du flux (`quickAmounts.cardWithdraw`) ;
 * - les deux soldes sont dérivés des soldes courants au lieu d'être recopiés :
 *   le jeu de démonstration redevient une suite d'opérations ;
 * - « Délai : instantané » supprimé, les soldes d'arrivée sont juste dessous.
 *
 * Étape 11 · composition : grille desktop à deux colonnes commune aux six
 * confirmations (voir SuccessScreen). Pas de signe sur le montant — comme
 * l'écran 23, c'est un mouvement interne : le reçu donne les deux soldes.
 */
const AMOUNT = 100_000;

/**
 * Soldes d'arrivée DÉRIVÉS. Ce rapatriement (14 avr. 15:48) est le dernier
 * mouvement de la CARTE : son solde d'arrivée est le solde courant. Côté
 * portefeuille, deux mouvements le suivent : − 50 000 déposés à 16:20
 * (écran 21) et + 30 300 retirés frais compris à 16:05 (écran 22).
 */
const CARD_AFTER = primaryCard.balance;
const WALLET_AFTER = wallet.balance - 50_000 + 30_300;

const receipt: ReceiptRow[] = [
  ["Depuis", primaryCard.label],
  ["Vers", "Portefeuille FixPay"],
  ["Frais", cardWithdrawFacts.feeLabel],
  ["Nouveau solde carte", formatFcfa(CARD_AFTER)],
  ["Solde portefeuille", formatFcfa(WALLET_AFTER)],
  ["Référence", "FP-1404-5390"],
  ["Date", "14 avr. 2026, 15:48"],
];

export default function CardWithdrawSuccessPage() {
  return (
    <SuccessScreen
      icon={WalletMinimal}
      title="Fonds rapatriés"
      amount={formatAmount(AMOUNT)}
      currency="FCFA"
      receipt={receipt}
      secondaryLabel="Voir mon portefeuille"
      secondaryHref="/wallet"
    />
  );
}
