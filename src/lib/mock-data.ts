import { formatDate, formatFcfa } from "@/lib/format";

/**
 * Single source of truth for all mock data shown across the 28 FixPay
 * screens. Amounts are stored as signed numbers (negative = debit) and
 * formatted via `@/lib/format`.
 *
 * Révision post-audit (docs/AUDIT_LOOK_IA.md, « Données fabriquées, pas
 * observées ») :
 * - le franc CFA n'a pas de subdivision : plus aucune décimale sur un solde ;
 * - chaque mouvement porte un horodatage `at` : les listes sont TRIÉES par
 *   date décroissante et leur libellé sort de la règle unique `formatDate` ;
 * - les montants natifs du portefeuille (Mobile Money) sont des sommes rondes
 *   en FCFA, plus des euros convertis au taux 655,957 ;
 * - les flux transportent enfin leurs frais, leur délai et leur plafond.
 */

/**
 * Instant de référence des données de démonstration. Les libellés relatifs
 * (« 14:32 », « Hier, 09:15 ») sont calculés par rapport à LUI et non à
 * l'heure courante : le rendu serveur et le rendu client restent identiques,
 * et les captures de la documentation ne vieillissent pas.
 */
const MOCK_NOW = "2026-04-14T16:20:00";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CardBrand = "visa" | "mastercard";

export type CardId = "visa-4291" | "mastercard-7834";

/** A FixPay virtual bank card (screens 02, 03, 06, 07, 08, 10, 19). */
export interface VirtualCardData {
  id: CardId;
  brand: CardBrand;
  /** e.g. "Visa •••• 4291" */
  label: string;
  last4: string;
  /** e.g. "•••• •••• •••• 4291" */
  maskedNumber: string;
  /** e.g. "JEAN DUPONT" */
  holder: string;
  /** e.g. "12/28" */
  expiry: string;
  /** Balance in FCFA (816202 | 394895). */
  balance: number;
  /** Plafond de dépense mensuel de la carte, en FCFA. */
  monthlyLimit: number;
  /** Part du plafond déjà consommée ce mois-ci, en FCFA. */
  monthlyUsed: number;
  type: "Virtuelle";
  status: "Actif";
}

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

/** Une transaction avant calcul de son libellé de date. */
type TransactionSeed = Omit<Transaction, "date">;

/**
 * Compte Mobile Money lié au portefeuille (écran 03).
 *
 * C'est l'objet que l'écran 03 est SEUL à porter : un portefeuille FCFA
 * ouest-africain n'est pas un solde, c'est un solde PLUS la liste des comptes
 * opérateur qui l'alimentent. Le produit n'en modélisait aucun, ce qui
 * réduisait l'onglet à une copie du tableau de bord.
 *
 * La règle de liaison est celle déjà écrite sur l'écran 16 : « un compte est
 * lié lors de votre premier dépôt depuis cet opérateur ». Les horodatages
 * ci-dessous s'y conforment — le compte Orange Money est lié à 10:04 le
 * 10 avril, une minute avant le dépôt de 300 000 qu'il a servi.
 */
export interface MobileMoneyAccount {
  id: string;
  /** Nom commercial de l'opérateur : « Wave », « Orange Money », « MTN MoMo ». */
  operator: string;
  /** Numéro masqué, au découpage local (« +225 07 •• •• 41 »). */
  maskedNumber: string;
  /** Horodatage de la liaison, source du tri et du libellé. */
  linkedAt: string;
  /** « Lié le 12 janv. » — libellé prêt à afficher, règle de date unique. */
  linkedLabel: string;
  /** Compte proposé par défaut aux dépôts et aux retraits. */
  primary: boolean;
}

/** Un compte lié avant calcul de son libellé de date. */
type MobileMoneyAccountSeed = Omit<MobileMoneyAccount, "linkedLabel">;

/**
 * Opération non aboutie : en attente de compensation, ou rejetée (écran 03).
 *
 * Le Mobile Money en produit en permanence — c'est même l'essentiel des
 * appels au support — et le produit n'en montrait aucune : « aucun état de
 * liste au-delà du cas nominal ». Une opération non aboutie n'entre PAS dans
 * le grand livre `walletMovements` : elle n'a pas encore (ou plus) d'effet sur
 * le solde, et elle porte deux champs qu'un mouvement réglé n'a pas — le motif
 * et la référence que le support demande.
 */
export type OperationStatus = "pending" | "failed";

export interface PendingOperation {
  id: string;
  /** Libellé de l'opération, opérateur compris. */
  title: string;
  /** Horodatage ISO 8601 local, source du tri et du libellé. */
  at: string;
  /** Libellé prêt à afficher, produit par la règle de date unique. */
  date: string;
  /** Montant signé, en FCFA — négatif pour une sortie. */
  amount: number;
  direction: "credit" | "debit";
  status: OperationStatus;
  /** Ce qui bloque, ou ce qui a échoué. Jamais un statut nu. */
  reason: string;
  /** Référence d'opération, celle que le support demande. */
  reference: string;
}

/** Une opération non aboutie avant calcul de son libellé de date. */
type PendingOperationSeed = Omit<PendingOperation, "date">;

/** A Mobile Money country (screens 04, 05). */
export interface Country {
  code: string;
  name: string;
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

/** Une notification avant calcul de sa description datée. */
type NotificationSeed = Omit<AppNotification, "description">;

/**
 * Frais, délai et plafond d'un flux d'argent (écrans 04 à 08).
 *
 * L'audit relève qu'aucun de ces chiffres n'existait : « un formulaire à deux
 * champs déguisé en transfert ». Ils alimentent le composant partagé
 * `TransactionFacts`.
 */
export interface FlowFacts {
  /** Frais fixes prélevés, en FCFA (0 = gratuit). */
  fee: number;
  /** Part proportionnelle des frais, en % du montant (absente = aucune). */
  feeRate?: number;
  /** Plancher appliqué aux frais proportionnels, en FCFA. */
  feeMin?: number;
  /** Libellé prêt à afficher : « Gratuit », « 1 % (min. 100 FCFA) ». */
  feeLabel: string;
  /** Délai de crédit annoncé : « Instantané », « Sous 5 min ». */
  delay: string;
  /** Plafond encore disponible sur la période, en FCFA. */
  remainingLimit?: number;
  /** Période du plafond : « aujourd'hui », « ce mois ». */
  limitPeriod?: string;
  /** Montant minimum accepté, en FCFA. */
  min: number;
}

/** An FAQ entry (screen 26). */
export interface FaqItem {
  id: string;
  question: string;
}

/** A support contact channel (screen 26). */
export interface ContactChannel {
  id: "chat" | "email" | "whatsapp";
  title: string;
  subtitle: string;
  tone: "green" | "blue";
  online?: boolean;
  href?: string;
}

/** A chat message (screen 27). */
export interface ChatMessage {
  id: string;
  from: "agent" | "user";
  text: string;
  time: string;
}

/** A KYC verification step (screen 12). */
export interface KycStep {
  id: number;
  title: string;
  subtitle: string;
  state: "done" | "active" | "locked";
}

/** A spending-breakdown row (screen 11). */
export interface SpendingCategory {
  label: string;
  /** Montant dépensé sur le mois, en FCFA. */
  amount: number;
  /** `amount` formaté, e.g. "223 026 FCFA". */
  amountLabel: string;
  /** Part de la dépense du mois, en % — dérivée du montant, jamais posée. */
  percent: number;
}

/** A statistics tile (screen 11). */
export interface StatTileData {
  label: string;
  value: string;
  color: "danger" | "success" | "primary" | "neutral";
  note: string;
}

/** The demo user shown on the Profile screen (19). */
export interface UserProfile {
  name: "Jean Dupont";
  email: "jean.dupont@email.com";
  initial: "J";
  verified: true;
  stats: { cards: "2"; transactions: "24"; wallet: "1,8M FCFA" };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Trie par horodatage décroissant et applique la règle de date unique. */
function buildTransactions(seeds: TransactionSeed[]): Transaction[] {
  return [...seeds]
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
    .map((seed) => ({ ...seed, date: formatDate(seed.at, MOCK_NOW) }));
}

/** Idem pour les notifications, dont la date est suffixée à la description. */
function buildNotifications(seeds: NotificationSeed[]): AppNotification[] {
  return [...seeds]
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
    .map((seed) => ({
      ...seed,
      description: `${seed.body} · ${formatDate(seed.at, MOCK_NOW)}`,
    }));
}

/** Comptes liés, triés par ancienneté de liaison (le plus ancien d'abord). */
function buildAccounts(seeds: MobileMoneyAccountSeed[]): MobileMoneyAccount[] {
  return [...seeds]
    .sort((a, b) => Date.parse(a.linkedAt) - Date.parse(b.linkedAt))
    .map((seed) => ({
      ...seed,
      linkedLabel: `Lié le ${formatDate(seed.linkedAt, MOCK_NOW)}`,
    }));
}

/** Opérations non abouties, triées par date décroissante. */
function buildPendingOperations(
  seeds: PendingOperationSeed[],
): PendingOperation[] {
  return [...seeds]
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
    .map((seed) => ({ ...seed, date: formatDate(seed.at, MOCK_NOW) }));
}

/** Mois de référence du jeu de démonstration (avril 2026). */
const MOCK_MONTH = new Date(MOCK_NOW).getMonth();
const MOCK_YEAR = new Date(MOCK_NOW).getFullYear();

/** Un horodatage tombe-t-il dans le mois de référence ? */
function inMockMonth(at: string): boolean {
  const date = new Date(at);
  return date.getMonth() === MOCK_MONTH && date.getFullYear() === MOCK_YEAR;
}

// ---------------------------------------------------------------------------
// Cartes
// ---------------------------------------------------------------------------

const visa4291: VirtualCardData = {
  id: "visa-4291",
  brand: "visa",
  label: "Visa •••• 4291",
  last4: "4291",
  maskedNumber: "•••• •••• •••• 4291",
  holder: "JEAN DUPONT",
  expiry: "12/28",
  balance: 816_202,
  monthlyLimit: 500_000,
  monthlyUsed: 310_000,
  type: "Virtuelle",
  status: "Actif",
};

const mastercard7834: VirtualCardData = {
  id: "mastercard-7834",
  brand: "mastercard",
  label: "Mastercard •••• 7834",
  last4: "7834",
  maskedNumber: "•••• •••• •••• 7834",
  holder: "JEAN DUPONT",
  expiry: "12/28",
  balance: 394_895,
  monthlyLimit: 500_000,
  monthlyUsed: 95_000,
  type: "Virtuelle",
  status: "Actif",
};

export const cards: VirtualCardData[] = [visa4291, mastercard7834];

/** Main card shown on the Accueil screen ("Ma carte principale"). */
export const primaryCard: VirtualCardData = visa4291;

// ---------------------------------------------------------------------------
// Transactions — un seul grand livre, deux lectures
// ---------------------------------------------------------------------------

/*
 * L'Accueil et le Portefeuille affichaient DEUX listes recopiées l'une sur
 * l'autre : « Wave — Dépôt » du 13 avril et « Retrait — Wave » du 8 avril y
 * étaient saisis deux fois, sous deux identifiants. C'est ce doublon de
 * données qui rendait les deux écrans interchangeables.
 *
 * Il n'y a plus qu'un jeu de graines, découpé par NATURE de mouvement, et les
 * deux listes en sont des VUES :
 *   - `cardSpendingSeeds`   : ce que la carte a payé chez un commerçant ;
 *   - `walletMovementSeeds` : ce qui entre et sort du compte FCFA (dépôts,
 *     retraits Mobile Money, alimentations de carte).
 *
 * L'Accueil consolide les deux (c'est un tableau de bord : « qu'est-ce qui
 * s'est passé sur mon argent ? »), le Portefeuille n'expose que la seconde
 * (c'est un relevé de compte : « qu'est-ce qui est entré et sorti de mon
 * portefeuille ? »). Les deux listes n'ont donc plus ni le même contenu, ni la
 * même longueur, ni le même ordre — sans qu'une seule donnée soit dupliquée.
 */

/** Dépenses par carte, dans la devise du compte (écrans 02, 10, 11). */
const cardSpendingSeeds: TransactionSeed[] = [
  {
    id: "spend-amazon",
    title: "Amazon",
    at: "2026-04-14T14:32:00",
    amount: -39_341,
    currency: "FCFA",
    direction: "debit",
    icon: "shopping",
  },
  {
    id: "spend-spotify",
    title: "Spotify",
    at: "2026-04-12T08:00:00",
    amount: -6_554,
    currency: "FCFA",
    direction: "debit",
    icon: "music",
  },
  {
    id: "spend-booking",
    title: "Booking.com",
    at: "2026-04-10T19:41:00",
    amount: -223_026,
    currency: "FCFA",
    direction: "debit",
    icon: "plane",
  },
];

/**
 * Mouvements du compte FCFA (écran 03) — les tirets cadratins font partie des
 * libellés. Les montants Mobile Money sont des sommes rondes en FCFA : les
 * anciennes valeurs (327 980 / 196 788 / 131 192 / 65 596) étaient 500, 300,
 * 200 et 100 € convertis au taux fixe 655,957.
 *
 * Les deux alimentations de carte y figurent : elles SORTENT du portefeuille,
 * c'est donc bien un mouvement du portefeuille — alors que ce que la carte
 * dépense ensuite chez un commerçant appartient à l'écran de la carte.
 */
const walletMovementSeeds: TransactionSeed[] = [
  {
    id: "wallet-wave-depot-13",
    title: "Wave — Dépôt",
    at: "2026-04-13T09:15:00",
    amount: 100_000,
    currency: "FCFA",
    direction: "credit",
    icon: "deposit",
  },
  {
    id: "wallet-alim-visa",
    title: "Alimentation Visa •••• 4291",
    at: "2026-04-11T17:20:00",
    amount: -125_000,
    currency: "FCFA",
    direction: "debit",
    icon: "card",
  },
  {
    id: "wallet-om-depot",
    title: "Orange Money — Dépôt",
    at: "2026-04-10T10:05:00",
    amount: 300_000,
    currency: "FCFA",
    direction: "credit",
    icon: "deposit",
  },
  {
    id: "wallet-retrait-wave",
    title: "Retrait — Wave",
    at: "2026-04-08T11:05:00",
    amount: -50_000,
    currency: "FCFA",
    direction: "debit",
    icon: "withdraw",
  },
  {
    id: "wallet-alim-mastercard",
    title: "Alimentation Mastercard •••• 7834",
    at: "2026-04-06T12:30:00",
    amount: -60_000,
    currency: "FCFA",
    direction: "debit",
    icon: "card",
  },
  {
    id: "wallet-wave-depot-05",
    title: "Wave — Dépôt",
    at: "2026-04-05T18:40:00",
    amount: 150_000,
    currency: "FCFA",
    direction: "credit",
    icon: "deposit",
  },
];

/** Écran 03 — le relevé du compte FCFA, et lui seul. */
export const walletMovements: Transaction[] =
  buildTransactions(walletMovementSeeds);

/** Écran 02 — le flux consolidé : dépenses carte ET mouvements portefeuille. */
export const homeTransactions: Transaction[] = buildTransactions([
  ...cardSpendingSeeds,
  ...walletMovementSeeds,
]);

/**
 * Card transactions (screen 10). La carte est facturée en EUR : ce sont les
 * mêmes achats que sur l'Accueil, dans la devise de règlement de la carte.
 */
export const cardTransactions: Transaction[] = buildTransactions([
  {
    id: "card-amazon",
    title: "Amazon",
    at: "2026-04-14T14:32:00",
    amount: -59.99,
    currency: "EUR",
    direction: "debit",
    icon: "shopping",
  },
  {
    id: "card-spotify",
    title: "Spotify",
    at: "2026-04-12T08:00:00",
    amount: -9.99,
    currency: "EUR",
    direction: "debit",
    icon: "music",
  },
  {
    id: "card-booking",
    title: "Booking.com",
    at: "2026-04-10T19:41:00",
    amount: -340,
    currency: "EUR",
    direction: "debit",
    icon: "plane",
  },
  {
    id: "card-refund",
    title: "Remboursement",
    at: "2026-04-08T15:30:00",
    amount: 12,
    currency: "EUR",
    direction: "credit",
    icon: "refresh",
  },
]);

// ---------------------------------------------------------------------------
// Portefeuille — comptes liés, opérations non abouties, solde
// ---------------------------------------------------------------------------

/**
 * Les comptes Mobile Money du porteur (écran 03).
 *
 * Trois opérateurs d'un même pays : c'est la situation ordinaire en Côte
 * d'Ivoire, où les préfixes sont attribués par réseau (07 Orange, 05 MTN,
 * 01 Moov) et où Wave se greffe sur une ligne existante. Les numéros et le
 * découpage du masque sont ceux déjà écrits sur les écrans 04 et 16
 * (« +225 07 •• •• 41 » pour Wave) : le portefeuille ne réinvente pas
 * l'identité d'un compte que le reste du produit affiche déjà.
 *
 * Les dates de liaison respectent la règle énoncée sur l'écran 16 — un compte
 * est lié à son premier dépôt : Orange Money est lié le 10 avril à 10:04, une
 * minute avant le dépôt de 300 000 du même jour.
 */
export const linkedAccounts: MobileMoneyAccount[] = buildAccounts([
  {
    id: "acc-wave",
    operator: "Wave",
    maskedNumber: "+225 07 •• •• 41",
    linkedAt: "2026-01-12T09:30:00",
    primary: true,
  },
  {
    id: "acc-mtn",
    operator: "MTN MoMo",
    maskedNumber: "+225 05 •• •• 62",
    linkedAt: "2026-03-28T11:40:00",
    primary: false,
  },
  {
    id: "acc-orange",
    operator: "Orange Money",
    maskedNumber: "+225 07 •• •• 09",
    linkedAt: "2026-04-10T10:04:00",
    primary: false,
  },
]);

/**
 * Ce que le Mobile Money produit tous les jours et que le produit ne montrait
 * nulle part : un dépôt qui attend la compensation de l'opérateur, et un
 * retrait rejeté avec son motif.
 *
 * Ni l'un ni l'autre n'est dans `walletMovements` : le dépôt n'a pas encore
 * touché le solde (il est compté dans `wallet.pending`), et le retrait rejeté
 * a été recrédité — son effet net sur le solde est nul. C'est aussi pourquoi
 * aucun des deux n'entame le plafond du mois.
 */
export const pendingOperations: PendingOperation[] = buildPendingOperations([
  {
    id: "op-mtn-depot",
    title: "Dépôt MTN MoMo",
    at: "2026-04-14T16:04:00",
    amount: 75_000,
    direction: "credit",
    status: "pending",
    reason:
      "Compensation opérateur en cours. Le montant est crédité dès la confirmation du réseau, sans action de votre part.",
    reference: "FP-1404-9104",
  },
  {
    id: "op-orange-retrait",
    title: "Retrait Orange Money",
    at: "2026-04-12T14:08:00",
    amount: -25_000,
    direction: "debit",
    status: "failed",
    reason:
      "Rejeté par l'opérateur : plafond journalier du compte destinataire atteint. Montant recrédité au portefeuille le 12 avr. à 14:09.",
    reference: "FP-1204-7745",
  },
]);

/**
 * Volume Mobile Money du mois — DÉRIVÉ des mouvements, jamais posé.
 *
 * L'ancienne paire (plafond 5 000 000, restant 2 000 000) impliquait
 * 3 000 000 consommés alors que les mouvements affichés en totalisaient
 * 725 000 : le chiffre ne se raccordait à rien. Le plafond ne compte que ce
 * qu'il plafonne — les entrées et sorties Mobile Money, à l'exclusion des
 * alimentations de carte, qui restent internes au compte.
 */
const mobileMoneyMonthlyVolume = walletMovements
  .filter(
    (movement) =>
      (movement.icon === "deposit" || movement.icon === "withdraw") &&
      inMockMonth(movement.at),
  )
  .reduce((sum, movement) => sum + Math.abs(movement.amount), 0);

/** Plafond mensuel de mouvements Mobile Money du palier de vérification 2. */
const WALLET_MONTHLY_LIMIT = 5_000_000;

/**
 * FixPay wallet (screens 02, 03, 11). Aucune décimale : le franc CFA n'a pas
 * de subdivision (l'ancien champ `decimals: ".50"` est supprimé).
 */
export const wallet = {
  /** Solde disponible, en FCFA. */
  balance: 1_866_252,
  /** Dépôts en cours de compensation : à vue, pas encore disponibles. */
  pending: pendingOperations
    .filter((op) => op.status === "pending" && op.direction === "credit")
    .reduce((sum, op) => sum + op.amount, 0),
  /** Plafond mensuel de mouvements Mobile Money, en FCFA. */
  monthlyLimit: WALLET_MONTHLY_LIMIT,
  /** Part du plafond déjà consommée ce mois-ci, en FCFA. */
  monthlyUsed: mobileMoneyMonthlyVolume,
  /** Part du plafond mensuel encore disponible, en FCFA. */
  monthlyRemaining: WALLET_MONTHLY_LIMIT - mobileMoneyMonthlyVolume,
};

// ---------------------------------------------------------------------------
// Deposit / withdraw / payment flows
// ---------------------------------------------------------------------------

/** Mobile Money countries (screens 04, 05). */
export const countries: Country[] = [
  { code: "BJ", name: "Bénin" },
  { code: "BF", name: "Burkina Faso" },
  { code: "CI", name: "Côte d'Ivoire" },
  { code: "ML", name: "Mali" },
  { code: "SN", name: "Sénégal" },
  { code: "TG", name: "Togo" },
];

/**
 * Quick-amount chips per flow (screens 06, 07, 08).
 * Des paliers ronds, tapés de mémoire par un utilisateur : `payment` valait
 * [3 280, 9 839, 19 679, 49 197], soit 5, 15, 30 et 75 € au taux 655,957.
 */
export const quickAmounts = {
  topUp: [25_000, 50_000, 100_000, 200_000],
  cardWithdraw: [10_000, 25_000, 50_000, 100_000],
  payment: [5_000, 10_000, 25_000, 50_000],
};

/** Écran 04 — Dépôt Mobile Money vers le portefeuille. */
export const depositFacts: FlowFacts = {
  fee: 0,
  feeLabel: "Gratuit",
  delay: "Sous 2 min",
  remainingLimit: wallet.monthlyRemaining,
  limitPeriod: "ce mois",
  min: 500,
};

/**
 * Écran 05 — Retrait du portefeuille vers Mobile Money. Seul flux à frais :
 * un retrait Mobile Money en zone UEMOA en a toujours.
 */
export const withdrawFacts: FlowFacts = {
  fee: 0,
  feeRate: 1,
  feeMin: 100,
  feeLabel: "1 % (min. 100 FCFA)",
  delay: "Sous 5 min",
  remainingLimit: 500_000,
  limitPeriod: "aujourd'hui",
  min: 1_000,
};

/**
 * Écrans 06 et 07 — transferts internes portefeuille ↔ carte. Le plafond
 * pertinent n'est pas ici mais sur la carte (`monthlyLimit`/`monthlyUsed`).
 */
export const cardTopUpFacts: FlowFacts = {
  fee: 0,
  feeLabel: "Gratuit",
  delay: "Instantané",
  min: 1_000,
};

export const cardWithdrawFacts: FlowFacts = {
  fee: 0,
  feeLabel: "Gratuit",
  delay: "Instantané",
  min: 1_000,
};

/** Écran 08 — Paiement par carte. */
export const paymentFacts: FlowFacts = {
  fee: 0,
  feeLabel: "Gratuit",
  delay: "Immédiat",
  remainingLimit: visa4291.monthlyLimit - visa4291.monthlyUsed,
  limitPeriod: "ce mois",
  min: 500,
};

// ---------------------------------------------------------------------------
// Notifications (screen 28)
// ---------------------------------------------------------------------------

export const notifications: AppNotification[] = buildNotifications([
  {
    id: "notif-paiement",
    icon: "card",
    tone: "blue",
    title: "Paiement effectué",
    at: "2026-04-14T14:32:00",
    body: `Amazon — ${formatFcfa(39_341)} débité de Visa ••••4291`,
    unread: true,
  },
  {
    id: "notif-kyc",
    icon: "shield",
    tone: "amber",
    title: "KYC en attente",
    at: "2026-04-14T13:20:00",
    body: "Vérification d'identité requise pour continuer",
    unread: true,
  },
  {
    id: "notif-recharge-confirmee",
    icon: "deposit",
    tone: "green",
    title: "Recharge confirmée",
    at: "2026-04-13T09:16:00",
    body: `Votre portefeuille a été crédité de ${formatFcfa(100_000)}`,
    unread: true,
  },
  {
    id: "notif-alimentation",
    icon: "card",
    tone: "neutral",
    title: "Alimentation carte réussie",
    at: "2026-04-11T17:21:00",
    body: `${formatFcfa(125_000)} transférés vers Visa ••••4291`,
    unread: false,
  },
  {
    id: "notif-recharge",
    icon: "deposit",
    tone: "neutral",
    title: "Recharge portefeuille",
    at: "2026-04-10T10:06:00",
    body: `${formatFcfa(300_000)} crédités`,
    unread: false,
  },
  {
    id: "notif-retrait",
    icon: "withdraw",
    tone: "neutral",
    title: "Retrait effectué",
    at: "2026-04-08T11:06:00",
    body: `${formatFcfa(50_000)} envoyés vers Wave`,
    unread: false,
  },
  {
    id: "notif-compte",
    icon: "check",
    tone: "neutral",
    title: "Compte créé avec succès",
    at: "2026-04-05T09:00:00",
    body: "Bienvenue sur FixPay !",
    unread: false,
  },
]);

// ---------------------------------------------------------------------------
// Support (screens 26, 27)
// ---------------------------------------------------------------------------

export const faqItems: FaqItem[] = [
  { id: "faq-recharge", question: "Comment recharger mon portefeuille ?" },
  { id: "faq-carte", question: "Comment créer une carte virtuelle ?" },
  { id: "faq-kyc", question: "Mon KYC est-il obligatoire ?" },
  { id: "faq-retrait", question: "Comment retirer de l'argent ?" },
  { id: "faq-securite", question: "Ma carte est-elle sécurisée ?" },
];

export const contactChannels: ContactChannel[] = [
  {
    id: "chat",
    title: "Chat en direct",
    subtitle: "Réponse en moins de 5 minutes",
    tone: "green",
    online: true,
    href: "/support/chat",
  },
  {
    id: "email",
    title: "E-mail",
    subtitle: "support@fixpay.com",
    tone: "blue",
    href: "mailto:support@fixpay.com",
  },
  {
    id: "whatsapp",
    title: "WhatsApp",
    subtitle: "+221 7X XXX XX XX · Disponible 24h/24",
    tone: "green",
  },
];

export const chatMessages: ChatMessage[] = [
  {
    id: "chat-welcome",
    from: "agent",
    text: "Bonjour ! Je suis votre assistant FixPay. Comment puis-je vous aider aujourd'hui ?",
    time: "14:30",
  },
];

export const chatSuggestions = [
  "Recharger le portefeuille",
  "Créer une carte",
  "Problème de retrait",
];

// ---------------------------------------------------------------------------
// KYC (screen 12)
// ---------------------------------------------------------------------------

export const kycSteps: KycStep[] = [
  {
    id: 1,
    title: "Informations personnelles",
    subtitle: "Complété",
    state: "done",
  },
  {
    id: 2,
    title: "Pièce d'identité",
    subtitle: "Carte d'identité nationale ou passeport",
    state: "active",
  },
  {
    id: 3,
    title: "Selfie de vérification",
    subtitle: "Photo en temps réel",
    state: "locked",
  },
];

/**
 * État de vérification, DÉRIVÉ du stepper (écrans 02, 12, 19, 28).
 *
 * C'est ce qui manquait pour que le reste se tienne : un compte à
 * 1,8 M FCFA de solde avec un KYC inachevé n'est pas une incohérence, c'est
 * un PALIER — mais encore faut-il que le produit le dise. Le plafond de
 * 5 000 000 du portefeuille est celui du palier courant ; la vérification
 * complète le porte à `upgradedMonthlyLimit`.
 */
export const verification = {
  /** Rang de l'étape en cours, 1-based. */
  step: kycSteps.findIndex((s) => s.state === "active") + 1,
  total: kycSteps.length,
  /** Intitulé de l'étape en cours : « Pièce d'identité ». */
  currentTitle:
    kycSteps.find((s) => s.state === "active")?.title ?? "Vérification",
  /** Plafond mensuel débloqué par la vérification complète, en FCFA. */
  upgradedMonthlyLimit: 10_000_000,
};

// ---------------------------------------------------------------------------
// Statistics (screen 11)
// ---------------------------------------------------------------------------

/**
 * Répartition des dépenses du mois. Les pourcentages sont DÉRIVÉS du montant
 * (l'audit relevait des barres dont les longueurs contredisaient les nombres,
 * pour un total de 127 %), et tout est libellé dans la devise du compte.
 */
const spending = [
  { label: "Voyage", amount: 223_026 },
  { label: "Shopping", amount: 39_341 },
  { label: "Abonnements", amount: 6_554 },
];

/** Total dépensé sur le mois, en FCFA. */
export const spendingTotal = spending.reduce((sum, c) => sum + c.amount, 0);

export const spendingBreakdown: SpendingCategory[] = spending.map(
  (category) => ({
    ...category,
    amountLabel: formatFcfa(category.amount),
    percent: Math.round((category.amount / spendingTotal) * 100),
  }),
);

/** Total des dépôts du mois, en FCFA. */
export const depositTotal = walletMovements
  .filter((m) => m.direction === "credit")
  .reduce((sum, m) => sum + m.amount, 0);

const depositCount = walletMovements.filter(
  (m) => m.direction === "credit",
).length;

export const statTiles: StatTileData[] = [
  {
    label: "Dépenses (avr.)",
    value: formatFcfa(spendingTotal),
    color: "danger",
    note: "+12 % vs mars",
  },
  {
    label: "Recharges (avr.)",
    value: formatFcfa(depositTotal),
    color: "success",
    note: `${depositCount} dépôts`,
  },
  {
    label: "Solde carte",
    value: formatFcfa(primaryCard.balance),
    color: "primary",
    note: primaryCard.label,
  },
  {
    label: "Portefeuille",
    value: formatFcfa(wallet.balance),
    color: "neutral",
    note: "Disponible",
  },
];

// ---------------------------------------------------------------------------
// Profile extras (screens 16, 17, 18, 19)
// ---------------------------------------------------------------------------

/** Parrainage (17) — la prime est libellée dans la devise du compte. */
export const referral = { code: "FP-JD2024", reward: formatFcfa(5_000) };

/** Fidélité (18) — 100 points = 1 000 FCFA de réduction. */
export const loyalty = {
  points: 240,
  equivalent: `= ${formatFcfa(2_400)} de réduction`,
};

/**
 * Settings selects (screen 16) — em dash in "XOF — Franc CFA". La devise
 * d'affichage suit celle du compte : proposer l'euro par défaut dans une app
 * qui compte en FCFA était la trace la plus nette du gabarit européen.
 */
export const settingsOptions = {
  langue: "Français",
  devise: "XOF — Franc CFA",
  theme: "Sombre",
};

export const user: UserProfile = {
  name: "Jean Dupont",
  email: "jean.dupont@email.com",
  initial: "J",
  verified: true,
  stats: { cards: "2", transactions: "24", wallet: "1,8M FCFA" },
};
