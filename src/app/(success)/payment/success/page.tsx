import type { ReceiptRow } from "@/components/ui/SuccessScreen";
import { SuccessScreen } from "@/components/ui/SuccessScreen";
import { formatAmount, formatFcfa } from "@/lib/format";
import { paymentFacts, primaryCard } from "@/lib/mock-data";

export const metadata = { title: "Succès Paiement" };

/**
 * Écran 24 · Succès Paiement (achat marchand par carte).
 *
 * Le contexte marchand existe (marchand, carte, plafond, référence,
 * horodatage) et le lien de contestation, standard fintech, reste proposé en
 * action secondaire.
 *
 * Corrections de la re-notation :
 * - le badge revient du ton `warning` au ton de confirmation : l'ambre est la
 *   couleur des états d'attente et d'alerte du système (« KYC en attente ») ;
 * - le sous-titre « Amazon · Visa •••• 4291 » répétait littéralement les deux
 *   premières lignes du reçu : supprimé ;
 * - le solde carte est dérivé du solde courant, il n'est plus identique à ceux
 *   des écrans 23 et 25 ;
 * - le lien de contestation passe dans la sortie secondaire commune aux cinq
 *   confirmations : un seul langage de lien dans le produit.
 *
 * Étape 11 · composition :
 *
 * - LE BOUCLIER S'EN VA. `ShieldCheck` est la forme même du logo FixPay, déjà
 *   picto du hero Support (26), avatar de l'assistant (27) et lockup gravé sur
 *   la face de carte : un paiement accepté signait avec le symbole de la
 *   marque, quatrième rôle pour un même signe. À sa place, LE MONOGRAMME DU
 *   MARCHAND — qui règle en même temps l'autre reproche de l'écran :
 *   « Marchand : Amazon » restait une identification purement textuelle alors
 *   que l'écran 28 typait déjà ses lignes. Ce n'est pas une tuile d'icône
 *   générique : l'objet porte une identité, il ne se répète sur aucun autre
 *   écran, et il reprend exactement le gabarit du badge (56, `rounded-lg`).
 * - LE PLAFOND CESSE D'ÊTRE AMBIGU. « Plafond mensuel 190 000 / 500 000 » se
 *   lisait, dans la convention X/Y, comme « 190 000 consommés sur 500 000 »,
 *   alors que l'écran 10 donne ce même 190 000 comme le RESTANT. La ligne dit
 *   maintenant ce qu'elle mesure — « Plafond restant » — et donne les deux
 *   chiffres dans cet ordre, avec la devise sur le premier.
 * - SIGNE. Un paiement sort de l'argent : « − 39 341 ». Même règle que les
 *   écrans 21 et 22, et rien d'autre que le montant ne l'exprimait.
 *
 * Montant et horodatage sont ceux de l'achat Amazon des écrans 02, 10 et 28.
 */
const AMOUNT = 39_341;

const MERCHANT = "Amazon";

/**
 * Solde carte d'arrivée DÉRIVÉ du solde courant : ce paiement (14 avr. 14:32)
 * précède le rapatriement de 100 000 du 14 avr. 15:48 (écran 25), seul autre
 * mouvement de la carte après lui.
 */
const CARD_AFTER = primaryCard.balance + 100_000;

const receipt: ReceiptRow[] = [
  ["Marchand", MERCHANT],
  ["Carte", primaryCard.label],
  ["Frais", paymentFacts.feeLabel],
  ["Solde carte", formatFcfa(CARD_AFTER)],
  [
    "Plafond restant",
    `${formatFcfa(primaryCard.monthlyLimit - primaryCard.monthlyUsed)} sur ${formatAmount(primaryCard.monthlyLimit)}`,
  ],
  ["Référence", "FP-1404-6205"],
  ["Date", "14 avr. 2026, 14:32"],
];

/**
 * Monogramme du marchand : l'initiale, dans une surface neutre du système. Pas
 * de couleur inventée, pas de logo tiers reconstitué — l'identité du marchand
 * est portée par sa lettre et par la ligne « Marchand » du reçu.
 */
function MerchantMonogram({ name }: { name: string }) {
  return (
    <span
      aria-hidden
      className="border-border bg-surface text-text flex size-[56px] items-center justify-center rounded-lg border text-[22px] leading-none font-semibold"
    >
      {name.charAt(0)}
    </span>
  );
}

export default function PaymentSuccessPage() {
  return (
    <SuccessScreen
      visual={<MerchantMonogram name={MERCHANT} />}
      title="Paiement accepté"
      amount={formatAmount(AMOUNT)}
      sign="-"
      currency="FCFA"
      receipt={receipt}
      secondaryLabel="Ce n'est pas moi — signaler l'opération"
      secondaryHref="/support/chat"
    />
  );
}
