import type { ReceiptRow } from "@/components/ui/SuccessScreen";
import { SuccessScreen } from "@/components/ui/SuccessScreen";
import { VirtualCard } from "@/components/ui/VirtualCard";
import { formatAmount, formatFcfa } from "@/lib/format";
import { cardTopUpFacts, primaryCard, wallet } from "@/lib/mock-data";

export const metadata = { title: "Succès Alimentation" };

/**
 * Écran 23 · Succès Alimentation (portefeuille → carte).
 *
 * L'audit demandait de nommer la carte alimentée (l'app en gère plusieurs) et
 * d'afficher les DEUX soldes : un transfert interne ne se confirme pas
 * autrement. Le montant reprend le mouvement réel du portefeuille
 * (`wallet-alim-visa`, 125 000 FCFA le 11 avril).
 *
 * Corrections de la re-notation :
 * - le badge bleu partageait exactement la teinte du CTA — l'audit ne veut
 *   qu'UNE zone bleue, le point d'action. En tête, la VIGNETTE DE LA CARTE
 *   remplace le squircle : le glyphe `CreditCard` de lucide était par ailleurs
 *   identique au picto de l'onglet « Cartes » et à la ligne « Paiement » de
 *   l'écran 28. La vignette dit en plus QUELLE carte a été alimentée ;
 * - le sous-titre « Les fonds ont été transférés sur votre carte » redoublait
 *   les lignes Depuis / Vers : supprimé ;
 * - « Délai : instantané » supprimé — le transfert est fait, les deux soldes
 *   d'arrivée sont juste en dessous ;
 * - les deux soldes sont dérivés des soldes courants (voir plus bas) : ils ne
 *   sont plus identiques à ceux des écrans 21, 22, 24 et 25.
 *
 * Étape 11 · composition : grille desktop à deux colonnes commune aux six
 * confirmations (voir SuccessScreen). AUCUN SIGNE sur le montant, contrairement
 * aux écrans 21, 22 et 24 : un transfert interne est un débit d'un côté et un
 * crédit de l'autre, l'argent du client ne bouge pas. Le reçu porte les deux
 * soldes d'arrivée, c'est lui qui dit le sens.
 */
const AMOUNT = 125_000;

/**
 * Soldes d'arrivée DÉRIVÉS des soldes courants. Cette alimentation est le plus
 * ancien mouvement de la série (11 avr. 17:20) : on retire donc aux soldes
 * courants tout ce qui s'est produit après elle.
 *
 * Carte : + 100 000 rapatriés le 14 avr. 15:48 (écran 25), + 39 341 payés chez
 * Amazon le 14 avr. 14:32 (écran 24).
 * Portefeuille : − 50 000 déposés le 14 avr. 16:20 (écran 21), + 30 300 retirés
 * frais compris le 14 avr. 16:05 (écran 22), − 100 000 rapatriés le 14 avr.
 * 15:48 (écran 25).
 */
const CARD_AFTER = primaryCard.balance + 100_000 + 39_341;
const WALLET_AFTER = wallet.balance - 50_000 + 30_300 - 100_000;

const receipt: ReceiptRow[] = [
  ["Depuis", "Portefeuille FixPay"],
  ["Vers", primaryCard.label],
  ["Frais", cardTopUpFacts.feeLabel],
  ["Nouveau solde carte", formatFcfa(CARD_AFTER)],
  ["Solde portefeuille", formatFcfa(WALLET_AFTER)],
  ["Référence", "FP-1104-7714"],
  ["Date", "11 avr. 2026, 17:20"],
];

export default function CardTopUpSuccessPage() {
  return (
    <SuccessScreen
      visual={<VirtualCard size="mini" brand={primaryCard.brand} />}
      title="Carte alimentée"
      amount={formatAmount(AMOUNT)}
      currency="FCFA"
      receipt={receipt}
      secondaryLabel="Voir ma carte"
      secondaryHref={`/cards/${primaryCard.id}`}
    />
  );
}
