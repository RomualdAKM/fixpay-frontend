# FixPay — Architecture Frontend

Next.js 15 (App Router) · TypeScript strict · Tailwind CSS v4 · lucide-react · DM Sans/DM Mono (next/font).

## Arborescence

```
src/
  app/            # routes (App Router, groupes: (auth), (tabs), (flows), (success))
  components/
    brand/        # logo FixPay (SVG recréé)
    layout/       # AppHeader, PageHeader, BottomNav
    ui/           # design system (voir docs/DESIGN_SYSTEM.md)
  lib/
    mock-data.ts  # source unique des données (typée strict)
    format.ts     # formatage FCFA / montants signés
    icons.ts      # map TxIcon -> LucideIcon
    utils.ts      # cn()
```

## Carte des routes (28 écrans)

| Écran | Route | Fichier | Navigation sortante |
|---|---|---|---|
| 01 · Onboarding | `/onboarding` | `src/app/(auth)/onboarding/page.tsx` | 'Commencer' → / ; 'Se connecter' → / (pas d'écran login dans le set). Pas de bottom nav. |
| 02 · Accueil | `/` | `src/app/(tabs)/page.tsx` | Cloche → /notifications ; 'Dépôt' → /wallet/deposit ; 'Retrait' → /wallet/withdraw ; 'Alimenter' → /cards/top-up ; 'Retirer' → /cards/withdraw ; 'Détails' → /cards/visa-4291 ; 'Tout voir' → /statistics ; BottomNav active='home'. NB: l'onglet Cartes de la nav pointe vers /cards/visa-4291 (aucun écran liste-cartes dans le design ; ajouter src/app/(tabs)/cards/page.tsx qui fait redirect('/cards/visa-4291')). |
| 03 · Portefeuille | `/wallet` | `src/app/(tabs)/wallet/page.tsx` | 'Dépôt' → /wallet/deposit ; 'Retrait' → /wallet/withdraw ; row 'Visa •••• 4291' (chevron) → /cards/visa-4291 ; CTA 'Alimenter' → /cards/top-up ; 'Tout voir' → /statistics ; BottomNav active='wallet'. |
| 04 · Dépôt Portefeuille | `/wallet/deposit` | `src/app/(flows)/wallet/deposit/page.tsx` | Back → /wallet ; sélection d'un pays avance le wizard local (étapes 2-4 Opérateur/Numéro/Montant non maquettées : réutiliser SelectableRow + AmountInput en état local) ; fin d'étape 4 → /wallet/deposit/success ; BottomNav active='wallet'. |
| 05 · Retrait Portefeuille | `/wallet/withdraw` | `src/app/(flows)/wallet/withdraw/page.tsx` | Back → /wallet ; wizard identique au 04 ; fin → /wallet/withdraw/success ; BottomNav active='wallet'. |
| 06 · Alimenter Carte | `/cards/top-up` | `src/app/(flows)/cards/top-up/page.tsx` | Back → router.back() (accès depuis /, /wallet, /cards/[id]) ; CTA 'Alimenter la carte' → /cards/top-up/success ; BottomNav active='wallet'. |
| 07 · Retrait Carte | `/cards/withdraw` | `src/app/(flows)/cards/withdraw/page.tsx` | Back → router.back() ; CTA 'Confirmer le retrait' → /cards/withdraw/success ; BottomNav active='home' (fidèle au design). |
| 08 · Paiement | `/payment` | `src/app/(flows)/payment/page.tsx` | Back → router.back() (accès depuis /cards/[id] 'Payer') ; CTA 'Payer maintenant' → /payment/success ; BottomNav active='home'. |
| 09 · Créer Carte | `/cards/new` | `src/app/(flows)/cards/new/page.tsx` | Back → /profile (accès via 'Ajouter une carte') ; 'Continuer' avance le stepper 5 étapes en état local ; fin → /cards/new/success ; BottomNav active='cards'. |
| 10 · Détail Carte | `/cards/[id]` | `src/app/(flows)/cards/[id]/page.tsx` | ids mock: 'visa-4291' et 'mastercard-7834' (lib/mock-data). Back → router.back() ; 'Alimenter' → /cards/top-up ; 'Payer' → /payment ; 'Bloquer' → no-op ; BottomNav active='cards'. Cible du redirect de l'onglet Cartes. |
| 11 · Statistiques | `/statistics` | `src/app/(flows)/statistics/page.tsx` | Back → / ; cible des liens 'Tout voir' (02, 03) ; BottomNav active='home'. |
| 12 · KYC | `/profile/kyc` | `src/app/(flows)/profile/kyc/page.tsx` | Back → /profile ; row étape 2 'Pièce d'identité' + CTA 'Continuer la vérification' → /profile/kyc/document ; BottomNav active='profile'. |
| 13 · KYC Document | `/profile/kyc/document` | `src/app/(flows)/profile/kyc/document/page.tsx` | Back → /profile/kyc ; CTA 'Soumettre le document' → /profile/kyc ; BottomNav active='profile'. |
| 14 · Notifs Settings | `/profile/notifications` | `src/app/(flows)/profile/notifications/page.tsx` | Back → /profile ; toggles en état local ; BottomNav active='profile'. |
| 15 · Confidentialité | `/profile/privacy` | `src/app/(flows)/profile/privacy/page.tsx` | Back → /profile ; BottomNav active='profile'. |
| 16 · Paramètres | `/profile/settings` | `src/app/(flows)/profile/settings/page.tsx` | Back → /profile ; 'Sauvegarder' → no-op (reste sur place) ; BottomNav active='profile'. |
| 17 · Parrainage | `/profile/referral` | `src/app/(flows)/profile/referral/page.tsx` | Back → /profile ; 'Copier' → navigator.clipboard ; BottomNav active='profile'. |
| 18 · Fidélité | `/profile/loyalty` | `src/app/(flows)/profile/loyalty/page.tsx` | Back → /profile ; BottomNav active='profile'. |
| 19 · Profil | `/profile` | `src/app/(tabs)/profile/page.tsx` | Bannière KYC → /profile/kyc ; 'Visa •••• 4291' → /cards/visa-4291 ; 'Mastercard •••• 7834' → /cards/mastercard-7834 ; 'Ajouter une carte' → /cards/new ; section COMPTE : 'Informations personnelles' → /profile/settings, row sécurité → /profile/privacy, row cadenas → /profile/notifications ; liens additionnels plausibles vers /profile/referral, /profile/loyalty, /support ; BottomNav active='profile'. |
| 20 · Succès Carte | `/cards/new/success` | `src/app/(success)/cards/new/success/page.tsx` | 'Accéder à ma carte →' → /cards/visa-4291. Pas de bottom nav, pas de back (flux terminé). Page custom (pas le template SuccessScreen) : badge 72px bluegreen + VirtualCard + grille StatTile + InfoBanner. |
| 21 · Succès Dépôt | `/wallet/deposit/success` | `src/app/(success)/wallet/deposit/success/page.tsx` | 'Retour à l'accueil' → /. Template SuccessScreen (badge green, CloudUpload, montant #22c55e). |
| 22 · Succès Retrait | `/wallet/withdraw/success` | `src/app/(success)/wallet/withdraw/success/page.tsx` | 'Retour à l'accueil' → /. SuccessScreen (badge amber, CloudDownload, montant #f59e0b). |
| 23 · Succès Alimentation | `/cards/top-up/success` | `src/app/(success)/cards/top-up/success/page.tsx` | 'Retour à l'accueil' → /. SuccessScreen (badge blue, CreditCard, montant VERT #22c55e — pas bleu). |
| 24 · Succès Paiement | `/payment/success` | `src/app/(success)/payment/success/page.tsx` | 'Retour à l'accueil' → /. SuccessScreen (badge blue, Send, montant #60a5fa). |
| 25 · Succès Retrait Carte | `/cards/withdraw/success` | `src/app/(success)/cards/withdraw/success/page.tsx` | 'Retour à l'accueil' → /. SuccessScreen (badge amber, CloudDownload, montant '— FCFA' #f59e0b, sous-titre 2 lignes). |
| 26 · Support | `/support` | `src/app/(flows)/support/page.tsx` | Back → /profile ; 'Chat en direct' → /support/chat ; 'E-mail' → mailto:support@fixpay.com ; 'WhatsApp' → no-op ; rows FAQ → no-op ; BottomNav active='profile'. |
| 27 · Chat Support | `/support/chat` | `src/app/(flows)/support/chat/page.tsx` | Back → /support ; chips de suggestion et bouton send → état local (ajout de messages) ; PAS de bottom nav (remplacée par ChatInputBar fixe). |
| 28 · Notifications | `/notifications` | `src/app/(flows)/notifications/page.tsx` | Back → / (accès via la cloche du header Accueil) ; rows → no-op ; BottomNav active='home'. |

## Plan des données mock

```
src/lib/mock-data.ts — source unique de toutes les données, typée strict, aucune donnée en dur dans les pages.

// ---- Types ----
export type CardBrand = 'visa' | 'mastercard';
export type CardId = 'visa-4291' | 'mastercard-7834';
export interface VirtualCardData { id: CardId; brand: CardBrand; label: string /* 'Visa •••• 4291' */; last4: string; maskedNumber: string /* '•••• •••• •••• 4291' */; holder: string /* 'JEAN DUPONT' */; expiry: string /* '12/28' */; balance: number /* 816202 | 394895 */; type: 'Virtuelle'; status: 'Actif'; }
export type TxIcon = 'shopping' | 'music' | 'plane' | 'deposit' | 'withdraw' | 'card' | 'refresh';
export interface Transaction { id: string; title: string; date: string /* 'Aujourd’hui, 14:32' | '10 Avr' */; amount: number; currency: 'FCFA' | 'EUR'; direction: 'credit' | 'debit'; icon: TxIcon; }
export interface Country { code: string; name: string; } // Bénin, Burkina Faso, Côte d'Ivoire, Mali, Sénégal, Togo
export type NotificationTone = 'green' | 'blue' | 'amber' | 'neutral';
export interface AppNotification { id: string; icon: TxIcon | 'shield' | 'check'; tone: NotificationTone; title: string; description: string /* inclut ' · date' */; unread: boolean; }
export interface FaqItem { id: string; question: string; }
export interface ContactChannel { id: 'chat' | 'email' | 'whatsapp'; title: string; subtitle: string; tone: 'green' | 'blue'; online?: boolean; href?: string; }
export interface ChatMessage { id: string; from: 'agent' | 'user'; text: string; time: string; }
export interface KycStep { id: number; title: string; subtitle: string; state: 'done' | 'active' | 'locked'; }
export interface SpendingCategory { label: string; amountLabel: string /* '€59.99' */; percent: number /* 35 | 14 | 78 */; }
export interface StatTileData { label: string; value: string; color: 'danger' | 'success' | 'primary' | 'neutral'; note: string; }
export interface UserProfile { name: 'Jean Dupont'; email: 'jean.dupont@email.com'; initial: 'J'; verified: true; stats: { cards: '2'; transactions: '24'; wallet: '1,8M FCFA' }; }

// ---- Exports (valeurs EXACTES des maquettes) ----
export const wallet = { balance: 1_866_252, decimals: '.50' };
export const cards: VirtualCardData[] = [visa4291, mastercard7834];
export const homeTransactions: Transaction[] = // Amazon -39341, Recharge portefeuille +131192, Spotify -6554, Booking.com -223026, 5e partielle (withdraw)
export const walletMovements: Transaction[] = // 'Orange Money — Dépôt' +327980, 'Alimentation Visa •••• 4291' -131192, 'Retrait — Wave' -65596, 'Wave — Dépôt' +196788 (tirets cadratins)
export const cardTransactions: Transaction[] = // Amazon -€59.99, Spotify -€9.99, voyage… (currency EUR)
export const countries: Country[] = [...6 pays];
export const quickAmounts = { topUp: [25000, 50000, 100000, 200000], cardWithdraw: [10000, 25000, 50000, 100000], payment: [3280, 9839, 19679, 49197] };
export const notifications: AppNotification[] = // 3 non lues (green/blue/amber) + 4 lues (neutral), textes/dates exacts
export const faqItems: FaqItem[] = // 5 questions
export const contactChannels: ContactChannel[] = // Chat en direct / E-mail support@fixpay.com / WhatsApp +221 7X XXX XX XX
export const chatMessages: ChatMessage[] = [{ from: 'agent', text: 'Bonjour ! Je suis votre assistant FixPay...', time: '14:30' }];
export const chatSuggestions = ['Recharger le portefeuille', 'Créer une carte', 'Problème de retrait'];
export const kycSteps: KycStep[] = // 3 étapes done/active/locked
export const statTiles: StatTileData[] = // DÉPENSES 268809 / RECHARGES 459172 / SOLDE CARTE 816202 / PORTEFEUILLE 1866252
export const spendingBreakdown: SpendingCategory[] = // Shopping 35, Abonnements 14, Voyage 78
export const referral = { code: 'FP-JD2024', reward: '€10' };
export const loyalty = { points: 240, equivalent: '= €2.40 de réduction' };
export const settingsOptions = { langue: 'Français', devise: 'EUR — Euro', theme: 'Sombre' }; // tiret cadratin
export const user: UserProfile;

// ---- src/lib/format.ts (séparé) ----
export const NBSP = ' '; // espace fine insécable, séparateur de milliers
export function formatFcfa(n: number): string        // 1866252 → '1 866 252 FCFA'
export function formatAmount(n: number): string      // sans devise, pour les chips
export function formatSigned(t: Transaction): string // '- 39 341 FCFA' / '+ 131 192 FCFA' (espace après le signe)

// ---- src/lib/icons.ts ----
export const txIconMap: Record<TxIcon, LucideIcon> // shopping→ShoppingCart, music→Music, plane→Plane, deposit→CloudUpload, withdraw→CloudDownload, card→CreditCard, refresh→RefreshCw
```
