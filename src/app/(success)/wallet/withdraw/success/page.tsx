import { ArrowUpRight } from "lucide-react";

import type { ReceiptRow } from "@/components/ui/SuccessScreen";
import { SuccessScreen } from "@/components/ui/SuccessScreen";
import { formatAmount, formatFcfa } from "@/lib/format";
import { wallet, withdrawFacts } from "@/lib/mock-data";

export const metadata = { title: "Succès Retrait" };

/**
 * Écran 22 · Succès Retrait (portefeuille → Mobile Money).
 *
 * Le reçu affiche les FRAIS et le TOTAL DÉBITÉ : sur un retrait Mobile Money en
 * zone UEMOA c'est l'information n°1. Les frais ne sont pas écrits en dur, ils
 * sont calculés depuis le barème du flux (`withdrawFacts` : 1 %, min 100 FCFA).
 *
 * Corrections de la re-notation :
 * - le badge quitte `--c-warning`, la couleur d'alerte du système : une
 *   opération réussie ne signe pas dans la teinte de « KYC en attente » (règle
 *   posée dans SuccessScreen, commune aux cinq confirmations) ;
 * - le sous-titre « Vers votre compte Mobile Money Wave » disparaît : il
 *   redisait la ligne « Destinataire » ;
 * - le montant n'est plus 50 000, valeur qui servait aussi aux écrans 21 et 25 :
 *   trois confirmations racontaient la même transaction ;
 * - le solde d'arrivée est dérivé du solde courant, pas recopié ;
 * - seconde sortie « Nouveau retrait ».
 *
 * Étape 11 · composition : grille desktop à deux colonnes commune aux six
 * confirmations (voir SuccessScreen), et surtout LE SIGNE. Les DA notaient que
 * le dépôt (21) et le retrait (22) portaient désormais le même badge vert, la
 * nature de l'opération ne tenant plus qu'à l'orientation d'un glyphe de 22px.
 * Le sens est rendu à l'objet le plus lu de l'écran : « − 30 000 » ici,
 * « + 50 000 » sur l'écran 21. Le badge reste vert — c'est le statut de
 * l'opération, pas son sens.
 */
const AMOUNT = 30_000;

/** Barème réel du flux : 1 % du montant, plancher 100 FCFA. */
const FEE = Math.max(
  withdrawFacts.feeMin ?? 0,
  Math.round((AMOUNT * (withdrawFacts.feeRate ?? 0)) / 100),
);

/**
 * Ce retrait (14 avr. 16:05) précède le dépôt de 50 000 de l'écran 21
 * (16:20), qui clôt la série : on rend donc au solde courant ce dépôt
 * postérieur.
 */
const WALLET_AFTER = wallet.balance - 50_000;

const receipt: ReceiptRow[] = [
  ["Destinataire", "Wave · +221 77 ••• •• 34"],
  ["Frais", `${formatFcfa(FEE)} (${withdrawFacts.feeRate} %)`],
  ["Total débité", formatFcfa(AMOUNT + FEE)],
  ["Crédit du compte", withdrawFacts.delay],
  ["Nouveau solde", formatFcfa(WALLET_AFTER)],
  ["Référence", "FP-1404-9032"],
  ["Date", "14 avr. 2026, 16:05"],
];

export default function WalletWithdrawSuccessPage() {
  return (
    <SuccessScreen
      icon={ArrowUpRight}
      title="Retrait envoyé"
      amount={formatAmount(AMOUNT)}
      sign="-"
      currency="FCFA"
      receipt={receipt}
      secondaryLabel="Nouveau retrait"
      secondaryHref="/wallet/withdraw"
    />
  );
}
