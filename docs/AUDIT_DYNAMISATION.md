# Audit de dynamisation — données mock / placeholders / code mort

FixPay est en production et branché sur l'API Laravel réelle (`api.fixpay.me`).
Cet audit recense **exhaustivement** les éléments encore alimentés par des données
mock/codées en dur, les placeholders non fonctionnels présentés comme finis, et le
code mort à supprimer. Chaque item est vérifié dans le code réel (`fichier:ligne`).
Les vrais états vides légitimes (« Aucun mouvement » sur liste API vide) ne sont pas listés.

Bug confirmé par l'utilisateur : la carte profil de la sidebar affiche toujours
« Jean Dupont / jean.dupont@email.com » (item A1).

## Récapitulatif

| Catégorie | High | Medium | Low | Total |
|---|---|---|---|---|
| À dynamiser | 7 | 7 | 6 | 20 |
| Placeholder à finir | 1 | 4 | 3 | 8 |
| À enlever | 0 | 3 | 3 | 6 |
| **Total** | **8** | **14** | **12** | **34** |

## Actions prioritaires (high)

1. **Sidebar profil** — `src/components/layout/Sidebar.tsx:20,167-176` : afficher l'utilisateur connecté via `useMe()` au lieu du mock `user` (Jean Dupont). *Bug confirmé.*
2. **Écran Statistiques** — `src/app/(flows)/statistics/StatisticsView.tsx:13,28,581` : tout l'écran (dépenses, histogramme, répartition, soldes, période figée 14 avr. 2026) est en mock → hooks API + date courante.
3. **Écran Paiement (données)** — `src/app/(flows)/payment/page.tsx:19` : cartes/soldes/plafonds mock → `useCards()`/`useWallet()`.
4. **Écran Paiement (CTA)** — `src/app/(flows)/payment/page.tsx:248` : écran factice, bouton désactivé « bientôt disponible » → brancher l'API ou retirer de la navigation.
5. **Appareils connectés** — `src/app/(flows)/profile/privacy/page.tsx:21` : sessions de sécurité fabriquées → endpoint réel ou masquer la section.
6. **Numéro de téléphone codes de sécurité** — `src/app/(flows)/profile/notifications/page.tsx:239` : numéro `+225 07 •• •• 41` factice présenté comme celui de l'utilisateur → vrai numéro ou libellé générique.

---

## 1. À DYNAMISER

### Shell / Navigation
- **HIGH** `src/components/layout/Sidebar.tsx:20,167-176` — carte profil du rail desktop rend le mock `user` (`user.initial` = « J », `user.name` = « Jean Dupont », `user.email` = « jean.dupont@email.com ») → lire `useMe()`/`useAuth()`, dériver l'initiale de `name` (le type `User` n'a pas de champ `initial`). *Bug confirmé.*
- **MEDIUM** `src/app/(tabs)/page.tsx:114` (+ `wallet/page.tsx:100`, `profile/page.tsx:148`, `cards/page.tsx:81` sans badge) — la pastille de la cloche `bellDot` est un littéral figé (allumé sur 3 onglets, jamais sur Cartes) → dériver de `useNotifications().data?.unread_count > 0` de façon cohérente.

### Accueil / Portefeuille
- **MEDIUM** `src/app/(tabs)/page.tsx:24,151-155` — bandeau tarifaire « Dépôt : gratuit… · Retrait : 1 % (min. 100 FCFA)… » composé depuis `depositFacts`/`withdrawFacts` (mock) → barème depuis la config API (le tunnel de retrait affiche déjà les frais réels via `useWithdrawalQuote`, d'où un risque de contradiction).
- **LOW** `src/app/(flows)/wallet/deposit/page.tsx:36,423` — `MIN_AMOUNT_FCFA = 200` en dur, affiché « Minimum 200 FCFA » et utilisé pour valider → tirer `min_amount_minor` de la config opérateur/API.
- **LOW** `src/app/(flows)/wallet/withdraw/page.tsx:38,497` — même plancher `MIN_AMOUNT_FCFA = 200` en dur → config opérateur/API.
- **LOW** `src/app/(flows)/wallet/withdraw/page.tsx:560` — `delay="Sous 5 min"` codé en dur dans `TransactionFacts` (frais/total viennent bien du devis) → délai depuis le devis/la config opérateur.

### Statistiques
- **HIGH** `src/app/(flows)/statistics/StatisticsView.tsx:13` — écran entièrement bâti sur `homeTransactions`/`statTiles`/`walletMovements` (Amazon, Spotify, Booking.com, dépôts Wave/Orange) → `useWalletTransactions` + `useCardTransactions` pour dépenses/histogramme/répartition.
- **HIGH** `src/app/(flows)/statistics/StatisticsView.tsx:28` — `PERIOD_END = new Date(2026, 3, 14)` figé sur MOCK_NOW → borne haute = date courante (ou dernier mouvement API).
- **HIGH** `src/app/(flows)/statistics/StatisticsView.tsx:581` — « Soldes actuels » = `statTiles.slice(2)` mock (solde carte 816 202, portefeuille 1 866 252) → `useCards()`/`useWallet()`.

### Paiement
- **HIGH** `src/app/(flows)/payment/page.tsx:19` — `cards`/`primaryCard`/`paymentFacts`/`quickAmounts` importés de mock ; sélecteur « Payer avec » liste Visa ••••4291 / Mastercard ••••7834 (soldes/plafonds fictifs, `monthlyLimit`/`monthlyUsed` absents du `CardResource` réel) → `useCards()`/`useWallet()`.
- **MEDIUM** `src/app/(flows)/payment/page.tsx:23` — `paymentFacts` (frais/délai/min) et `quickAmounts.payment` affichés comme barème réel → config API (frais/plafonds configurables admin).
- **MEDIUM** `src/app/(flows)/payment/page.tsx:40` — bénéficiaire codé en dur (« Boutique Adjamé » / « +225 07 •• •• 42 » / « Abidjan · Commerce de proximité ») présenté comme un vrai destinataire → contexte réel (scan QR / marchand) ; sinon ne pas afficher un marchand fictif. *(Aspect placeholder : aucun flux amont n'existe.)*

### Compte — Notifications / Confidentialité
- **HIGH** `src/app/(flows)/profile/privacy/page.tsx:21,263-280` — `INITIAL_DEVICES` (« iPhone 13 · Abidjan », « Chrome · Dakar/Abidjan ») fabriqués, bouton « Déconnecter » filtre un tableau local (aucune session fermée) → endpoint sessions réel (inexistant à ce jour) ou masquer/marquer indisponible.
- **HIGH** `src/app/(flows)/profile/notifications/page.tsx:239` — « Codes de confirmation — Toujours envoyés par SMS au +225 07 •• •• 41 » : numéro fabriqué (le type `User` n'a pas de champ `phone`) → vrai numéro API ou libellé sans numéro.
- **MEDIUM** `src/app/(flows)/profile/notifications/page.tsx:218` — « Notifications push — Cet appareil · iPhone de Jean » : référence à l'ancien utilisateur mock → device réel ou libellé neutre « Cet appareil ».
- **MEDIUM** `src/app/(flows)/profile/notifications/page.tsx:232` — « SMS promotionnels — Offres FixPay au +225 07 •• •• 41 » : même numéro fabriqué → vrai numéro API.
- **MEDIUM** `src/app/(flows)/profile/privacy/page.tsx:233` — « Consentements — Recueillis le 5 avr. » : date en dur (héritée de MOCK_NOW) → date réelle API ou supprimer la mention.

### Écrans pré-auth / secondaires
- **LOW** `src/app/(auth)/onboarding/page.tsx:9,35,37` — « Plafond mensuel » = `cards[0].monthlyLimit` (500 000) et « Émission » = `formatFcfa(3000)` en dur → config produit / `/api/card-offers` (`client_price`). Écran pré-auth, tolérable.
- **LOW** `src/app/(flows)/support/page.tsx:16` — pastille « en ligne » du chat = `channel.online` (mock figé à `true`) → vrai statut de disponibilité ou retirer l'indicateur. *(Le reste du contenu FAQ/contact statique est légitime.)*
- **LOW** `src/app/(flows)/profile/settings/page.tsx:447` vs `src/app/(tabs)/profile/page.tsx:353` — version app divergente en dur (« 1.4.0 (812) » vs « v1.4.2 ») → source unique (variable de build/env).

---

## 2. PLACEHOLDER À FINIR

- **HIGH** `src/app/(flows)/payment/page.tsx:246-257` — écran 08 « Paiement par carte » entièrement factice : CTA `disabled` sous « Le paiement par carte sera bientôt disponible », aucune mutation/API, monté sur un formulaire complet qui laisse croire à une opération aboutissable → brancher l'API (mutation + PIN) ou retirer l'écran de la nav `/cards`.
- **MEDIUM** `src/app/(flows)/profile/notifications/page.tsx:116-126,270` — toutes les préférences (dépôts, débits carte, retraits, seuil, push/email/SMS, heures silencieuses) sont des `useState` locaux non persistés, mais la page affirme « Chaque modification est appliquée immédiatement » → endpoint de préférences ou clarifier qu'elles ne sont pas enregistrées.
- **MEDIUM** `src/app/(flows)/profile/privacy/page.tsx:193-198,298-306` — réglages confidentialité + « Exporter mes données » (local, affiche « archive envoyée sous 48 h » sans demande serveur) + « Fermer mon compte » (confirmation locale) → endpoints réels ; ne pas afficher « Demande enregistrée » sans requête.
- **MEDIUM** `src/app/(flows)/profile/settings/page.tsx:280-282,327-355` — selects « Langue » et « Devise d'affichage » + toggle « Déverrouillage biométrique » inertes (pas d'i18n/conversion/biométrie), avec accusé « Enregistré » factice → implémenter réellement ou retirer les contrôles.
- **MEDIUM** `src/app/(auth)/onboarding/page.tsx:115` — sélecteur « Sénégal · Français » = `<button>` + chevron sans `onClick` ni menu (bouton mort) → brancher un vrai sélecteur ou retirer l'affordance.
- **LOW** `src/app/(auth)/onboarding/page.tsx:216` — liens « Conditions générales » et « Politique de confidentialité » pointent vers `href="/"` → vraies pages légales.
- **LOW** `src/app/(flows)/support/chat/page.tsx:15` — chat sans backend, réponse canned après 1400 ms simulés. Placeholder honnête et assumé (aucune donnée de compte fabriquée) → brancher un backend support quand disponible ; acceptable en l'état.
- **LOW** `src/app/(flows)/profile/loyalty/page.tsx:30` — « Bientôt disponible », aucun solde de points fabriqué. Placeholder honnête et assumé → future API fidélité ; acceptable en l'état.

---

## 3. À ENLEVER

- **MEDIUM** `src/lib/mock-data.ts:969` (et l'ensemble des exports de VALEURS) — `user`, `cards`, `primaryCard`, `homeTransactions`, `walletMovements`, `statTiles`, `depositFacts`, `withdrawFacts`, `paymentFacts`, `quickAmounts`, `contactChannels`, `faqItems` restent la source runtime réelle de Sidebar/Statistics/Payment/Home → une fois ces écrans rebranchés, supprimer tous les exports de valeurs (ne conserver au besoin que des types déplacés vers `src/lib/api/types`).
- **MEDIUM** `src/components/ui/CardRow.tsx:7,47` — composant `CardRow`/`CardRowList` **mort** (aucun import ailleurs dans `src/` — vérifié), typé sur `VirtualCardData` mock, lie vers `/cards/${card.id}` avec des ids de démo ; la vraie liste est rendue par `(tabs)/cards/page.tsx` → supprimer le fichier.
- **MEDIUM** `src/lib/mock-data.ts:314-347,484-521` — bloc « Cartes » mock (`visa4291`/`mastercard7834`/`cards`/`primaryCard`/`cardTransactions`, holder « JEAN DUPONT », soldes 816 202/394 895, plafonds 500 000, transactions Amazon/Spotify/Booking en EUR) → retirer après rebranchement de Payment et suppression de CardRow.
- **LOW** `src/components/ui/VirtualCard.tsx:115-118` — valeurs par défaut des props identitaires : `holder = "JEAN DUPONT"`, `number = "•••• •••• •••• 4291"`, `expiry = "12/28"` (les callers réels passent les vraies valeurs, mais le défaut est une fuite latente) → neutraliser (chaîne vide ou « VOTRE NOM » / « •••• •••• •••• •••• »).
- **LOW** Imports de **types seuls** depuis `mock-data` — `src/components/ui/TransactionItem.tsx:6` (`Transaction`), `src/components/ui/WalletMovements.tsx:3` (`Transaction`), `src/components/ui/CardRow.tsx:7` (`VirtualCardData`), `src/lib/presenters.ts:2` (`Transaction`, `TxIcon`), `src/lib/format.ts:1` (`Transaction`), `src/lib/icons.ts:14` (`AppNotification`, `TxIcon`) → déplacer ces interfaces vers `src/lib/api/types` pour permettre la suppression de `mock-data.ts`.
- **LOW** `src/app/(flows)/support/page.tsx:16` — import `contactChannels`/`faqItems`/`ContactChannel` de mock-data (contenu produit statique, fonctionnellement OK) → déplacer vers un module de contenu produit dédié pour couper la dépendance à `mock-data.ts`.
