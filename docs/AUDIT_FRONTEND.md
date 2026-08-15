# Audit sécurité & organisation — Frontend FixPay

Rapport RSSI de synthèse, avant déploiement. Next.js 15.5.22 / React 19 / TypeScript strict.
Synthèse de 5 surfaces d'audit : Authentification & Session, Données sensibles & XSS, Frontière réseau/argent/contrat, Dépendances/Build/Config prod.
Date : 2026-08-15.

---

## 1) Verdict

VERDICT : OUI, AVEC RÉSERVES.

Note globale : B.

Le frontend est architecturalement sain et ne présente aucune fuite de secret ni aucune faille bloquante côté sécurité : auth par cookie httpOnly + handshake CSRF Sanctum, aucun token/PIN/PAN en storage, aucun log de secret, montants en entiers min-unit, TypeScript strict sans échappatoire. Les réserves sont des durcissements de production (en-têtes de sécurité absents, dépendances `next` avec 3 CVE high transitives) et deux écrans de succès qui peuvent afficher une confirmation verte non vérifiée — trompeur, mais sans mouvement d'argent réel côté client. Aucun de ces points n'est une faille critique ; ils doivent être corrigés ou explicitement acceptés avant la mise en ligne d'une app fintech.

---

## 2) Ce qui est solide (constaté, pas supposé)

Sécurité de session et secrets
- Auth par cookie de session httpOnly ; seul le cookie `XSRF-TOKEN` est lu en JS (comportement Sanctum attendu). Aucun secret n'est jamais accessible au JS applicatif.
- Aucun secret en storage : grep exhaustif localStorage/sessionStorage → uniquement le thème. Tokens, PIN, PAN/CVV jamais écrits. Assertions couvertes par tests (`client.test.ts`, `PinPromptDialog.test.tsx`).
- QueryClient non persisté : cache en mémoire uniquement, effacé au logout (`queryClient.clear()`).
- `console.*` : seulement dans l'ErrorBoundary, aucun contenu sensible.

CSRF et frontière réseau
- Handshake CSRF correct : `GET /sanctum/csrf-cookie` avant toute mutation, `X-XSRF-TOKEN` = cookie décodé, header posé uniquement sur POST/PUT/PATCH/DELETE, `credentials:"include"`, retry unique sur 419 avec token re-seedé.
- Tout le réseau mutant passe par le client central (`src/lib/api/client.ts`). Seule exception : un GET Blob KYC documenté et justifié (binaire non déballable par le client central).
- Enveloppe `{message,data,errors}` déballée proprement ; 422 → `fieldErrors` mappés (`applyApiErrors`) ; corps non-JSON et 204/vide gérés sans crash.

Argent et vérité du contrat
- Montants en entiers min-unit (`usdMinor`/`xofMinor` via `Math.round`) ; reconstruction des cents depuis l'entier à l'affichage (aucun `/100` flottant). USD scale 2 / XOF scale 0 respectés.
- Devis == montant envoyé : même variable d'état, montant dans la clé react-query, `canConfirm` exige un devis défini. Tickets PIN émis sans liaison de montant (backend re-dérive).
- Écrans de succès carte gatés sur statut final réel + polling borné ; reçus composés sur les Money réels des ressources. Page paiement carte volontairement désactivée (pas de faux succès).
- Reveal PAN/CVV : hors cache react-query, auto-purge (45 s + reset au démontage). Ticket PIN à usage unique, jamais stocké/loggé.

Gardes et rendu
- Pas de flash de contenu protégé : `RouteGuard`/`AdminGuard` ne montent `{children}` qu'en état `authenticated` → un invité n'exécute aucun fetch protégé. Tous les groupes de routes protégés sont gardés.
- Open-redirect fermé : `safeNext` rejette `//evil` et `/\evil` (tests OK) ; `?next=` n'accepte que `window.location.pathname` encodé.

Build et supply chain
- Aucun secret inliné dans le bundle client (scan `.next/static` : seulement `NEXT_PUBLIC_API_URL` et le nom de cookie, non sensibles).
- Aucun source map exposé côté client ; `.env*` correctement gitignoré (seul `.env.example` tracké).
- `process.env` applicatif = uniquement des `NEXT_PUBLIC_*` non sensibles + `NODE_ENV`.
- Build de prod réussit ; typecheck (`tsc --noEmit`) et lint NON désactivés ; `tsconfig` strict. Dépendances prod minimales (10 directes), 0 script postinstall dans le lock.
- Surface Données sensibles & XSS : note A, aucun finding réel.

---

## 3) Findings par sévérité

Total : 5 medium, 4 low, 4 info. Aucun critical, aucun high applicatif.
(Les 3 CVE high de `npm audit` sont des dépendances transitives, classées medium ici selon leur exploitabilité réelle dans ce contexte.)

### Medium

M1 — Un 401 métier ne fait pas retomber l'app en invité (session morte = UI trompeuse)
Fichier : `src/lib/query/queryClient.ts:14`
Fait : aucun handler global QueryCache/MutationCache `onError`. Seul `useMe` mappe 401→guest. Quand la session Sanctum expire côté serveur sans coupure réseau, `me` reste en cache `authenticated` (staleTime 30 s, refetchOnWindowFocus off) ; le shell protégé continue de s'afficher avec les données en cache pendant que chaque requête échoue en 401, sans redirection vers `/login`.
Bloque le déploiement : NON (dégradation UX, pas de fuite). À corriger rapidement.

M2 — Écrans de succès dépôt/retrait affichent une confirmation verte factice sans uuid
Fichier : `src/app/(success)/wallet/deposit/success/page.tsx:33` (idem `wallet/withdraw/success/page.tsx`)
Fait : si le query param `uuid` est absent (URL partagée/rafraîchie), la page rend un `SuccessScreen` vert « Dépôt confirmé » / « Retrait envoyé » sans relire l'API. C'est un reçu de succès pour un mouvement d'argent jamais vérifié. Incohérent avec les écrans carte qui, eux, affichent « Reçu indisponible » dans le cas symétrique.
Bloque le déploiement : NON strictement (aucun argent n'est déplacé côté client), mais trompeur pour une fintech. À corriger avant mise en ligne.

M3 — Le drapeau `indicative` des devis carte n'est jamais exposé
Fichier : `src/app/(flows)/cards/top-up/page.tsx:220` (idem `cards/withdraw/page.tsx:188`)
Fait : les devis portent `indicative: boolean`, mais aucun écran ne le lit. Un montant estimé peut être présenté sous un libellé ferme (« Débité du portefeuille ») sans marquer qu'il peut varier au règlement FX. Atténué par le taux carte fixe prévu (indicative probablement false en prod) et le montant réel affiché a posteriori dans le reçu.
Bloque le déploiement : NON. À corriger avant d'activer des devis indicatifs.

M4 — 3 vulnérabilités high en dépendances de prod, transitives via `next`
Fichier : `package.json` (next 15.5.22 → postcss 8.4.31, sharp 0.34.5)
Fait : `npm audit --omit=dev` = 3 high (postcss path-traversal build-time, sharp CVE libvips). Fix = `next@16.3.1` (rupture majeure). Exploitabilité réelle FAIBLE ici : postcss est build-time ; `next/image` n'est utilisé nulle part (0 import `<Image>`, aucun `remotePatterns`), donc `/_next/image` ne traite aucune image distante.
Bloque le déploiement : NON techniquement, mais à décider explicitement (upgrade planifié ou risque résiduel accepté et documenté).

M5 — Aucun en-tête de sécurité configuré
Fichier : `next.config.ts:3`
Fait : `next.config.ts` = `{ reactStrictMode: true }` seulement. Pas de CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, HSTS, Permissions-Policy. Pour une app avec écrans de révélation PAN/CVV, l'absence d'anti-clickjacking (`frame-ancestors`/X-Frame-Options) et de CSP (défense en profondeur XSS) est une lacune de durcissement.
Bloque le déploiement : OUI, sauf si posés de façon garantie au niveau reverse-proxy/hébergeur. À défaut de garantie, les poser dans `next.config.ts`.

### Low

L1 — Le PAT Sanctum renvoyé par `/login` reste en mémoire JS toute la session (inutile en mode cookie)
Fichier : `src/lib/api/types.ts:73`
Fait : `POST /api/login` renvoie `{ token, user }` ; React Query conserve `mutation.data` (donc le token) tant que `AuthProvider` est monté. Jamais persisté, mais lisible en mémoire (DevTools, XSS) sans nécessité.
Bloque le déploiement : NON. Amélioration post-lancement (strip du token ou backend qui n'émet pas de PAT en mode SPA cookie).

L2 — Build inline `NEXT_PUBLIC_API_URL=http://localhost:8000` depuis `.env.local`
Fichier : `.env.local:1`
Fait : le build a lu `.env.local` et le bundle contient `localhost:8000`. Un build de prod lancé avec `.env.local` présent embarquerait une URL d'API injoignable et en http (mixed-content sous https). Non-secret, mais piège de déploiement qui casse l'app.
Bloque le déploiement : OUI (opérationnel) — le pipeline de prod DOIT fixer `NEXT_PUBLIC_API_URL` sur l'URL https réelle et ne pas builder avec `.env.local`.

L3 — `fetch()` brut hors client central pour les documents KYC (exception justifiée)
Fichier : `src/lib/admin/endpoints.ts:337`
Fait : `fetchKycDocument` fait un GET Blob hors `apiFetch` (le client central ne peut retourner du binaire). GET → pas de CSRF requis ; non-2xx bien convertis en ApiError ; aucune fuite. Duplication de l'URL de base / gestion d'erreur à maintenir en cohérence.
Bloque le déploiement : NON. Refactor optionnel (`apiFetchBlob`).

L4 — En-tête `X-Powered-By: Next.js` non désactivé (fingerprinting)
Fichier : `next.config.ts:3`
Fait : `poweredByHeader` non défini → Next révèle sa stack aux scanners. Impact mineur.
Bloque le déploiement : NON. `poweredByHeader: false`.

### Info

I1 — Protection serveur des routes désactivée par défaut (middleware STRICT off)
Fichier : `middleware.ts:22`
Fait : sans `NEXT_PUBLIC_MIDDLEWARE_GUARD=strict`, la protection réelle repose sur `RouteGuard` client (acceptable car aucune donnée n'est fetchée sans cookie). En prod same-origin, activer strict pour une première barrière serveur.
Bloque le déploiement : NON, mais à activer en config de prod same-origin.

I2 — `RouteGuard` ne contrôle que le niveau KYC, jamais `email_verified`
Fichier : `src/lib/auth/RouteGuard.tsx:85`
Fait : aucune branche `email_verified` dans le garde. L'enforcement réel est côté API (middleware `verified` Laravel) ; impact borné. À ajouter si la politique produit exige un e-mail vérifié.
Bloque le déploiement : NON.

I3 — Surface Données sensibles & XSS : note A, aucun finding réel.
Bloque le déploiement : NON.

I4 — 2 vulnérabilités high dev-only (brace-expansion, js-yaml) via la chaîne eslint
Fichier : `package.json`
Fait : non livrées en prod (`npm audit --omit=dev` ne les remonte pas). DoS build/lint-time uniquement.
Bloque le déploiement : NON. À traiter au fil des upgrades eslint.

---

## 4) Correctifs recommandés avant déploiement

À faire AVANT la mise en ligne (bloquants ou quasi-bloquants) :
1. Config de build prod (L2) — fixer `NEXT_PUBLIC_API_URL` sur l'URL https réelle de l'API et NE PAS builder avec `.env.local`. Sinon l'app est cassée en prod (API injoignable + mixed-content). Vérification obligatoire du pipeline.
2. En-têtes de sécurité (M5) — poser CSP (au moins `frame-ancestors 'none'`), X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, HSTS, via `next.config.ts` OU garantir leur présence au niveau hébergeur/reverse-proxy. Critique pour les écrans PAN/CVV.
3. Écrans de succès sans uuid (M2) — remplacer le `SuccessScreen` vert par un état neutre « Reçu indisponible » / retour `/wallet`, aligné sur les écrans carte. Ne jamais afficher un reçu vert non vérifié.
4. Décision explicite sur `next` (M4) — planifier l'upgrade `next@16.3.1` OU documenter et accepter formellement le risque résiduel (postcss build-time, `next/image` inutilisé).
5. Config middleware (I1) — activer `NEXT_PUBLIC_MIDDLEWARE_GUARD=strict` si front et API partagent l'origine.

Améliorations post-lancement (non bloquantes) :
- M1 — handler global 401 → guest dans le QueryClient (un seul point de vérité de session).
- M3 — annoter les montants quand `quote.indicative` est vrai.
- L1 — ne pas laisser le PAT entrer dans l'état React Query.
- L4 — `poweredByHeader: false`.
- L3 — factoriser un `apiFetchBlob` dans le client central.
- I2 — branche `email_verified` dans `RouteGuard` si la politique produit l'exige.

---

## 5) Limites et périmètre

- La sécurité de l'argent est garantie par le BACKEND (déjà audité séparément) : dérivation des montants, validation des devis, application des taux FX, débit/crédit réel, unicité des tickets PIN. Le rôle du frontend est double et limité : ne pas fuir de secret, et ne pas tromper l'utilisateur. Sur le premier point, le front est sain (aucune fuite constatée). Sur le second, deux écrans de succès (M2) et le drapeau `indicative` (M3) sont les seuls points à corriger.
- Les tickets PIN sont émis sans liaison de montant côté front : c'est correct puisque le backend re-dérive le montant. La confiance repose donc sur le backend, comme prévu.
- Non exécutés faute de temps/scope sur certaines surfaces : `npm run build` complet, `vitest` complet, `lint` complet (tests présents et cohérents avec le code lu ; typecheck OK). L'audit auth est fait par lecture directe du code.
- Hors périmètre de cette synthèse : la logique métier détaillée du backend, et la surface admin approfondie (permissions fines, prévisualisation blob KYC/PII, diff d'approbations) au-delà de ce qui touche la frontière réseau/argent.

Conclusion : déployable une fois les 5 correctifs de la section 4 traités ou formellement acceptés. L'ossature sécurité (auth cookie, CSRF, non-fuite de secrets, intégrité des montants) est solide et n'exige aucune réécriture.

---

## Correctifs appliqués (2026-08-15)

Suite à l'audit ci-dessus, les correctifs suivants ont été appliqués. Les sections d'audit 1 à 5 restent inchangées (constat d'origine).

### Corrigés

- M5 — En-têtes de sécurité + poweredByHeader
  Statut : Corrigé.
  Fichier : `next.config.ts`.
  Résolution : ajout des en-têtes de sécurité (CSP avec `frame-ancestors 'none'`, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, HSTS, Permissions-Policy) via `headers()` et désactivation du fingerprinting par `poweredByHeader: false`.

- M2 — Écrans de succès dépôt/retrait (faux reçu vert sans uuid)
  Statut : Corrigé.
  Fichiers : `src/app/(success)/wallet/deposit/success/page.tsx`, `src/app/(success)/wallet/withdraw/success/page.tsx`.
  Résolution : suppression du `SuccessScreen` vert non vérifié en l'absence d'`uuid` ; l'écran retombe désormais sur un état neutre aligné sur les écrans carte (« Reçu indisponible » / retour `/wallet`), plus aucun reçu de confirmation affiché pour un mouvement non relu côté API.

- M1 — Handler 401 global (session-lifecycle)
  Statut : Corrigé.
  Fichier : `src/lib/query/queryClient.ts`.
  Résolution : ajout d'un handler global `onError` (QueryCache/MutationCache) qui, sur un 401 métier, fait retomber l'app en invité et déclenche la redirection vers `/login` — point de vérité unique du cycle de session, fin de l'UI trompeuse sur session morte.

- L1 — Strip du PAT en mémoire
  Statut : Corrigé.
  Fichiers : `src/lib/api/types.ts`, chemin de login.
  Résolution : le contrat de `login` n'expose plus le PAT Sanctum dans l'état React Query (contrat sans token) ; en mode cookie httpOnly le token n'a plus aucune raison de résider en mémoire JS.

### Acceptés — risque résiduel documenté

- M4 — CVE `next` transitives (postcss build-time, sharp/`next/image` non utilisé)
  Statut : Accepté, risque résiduel documenté.
  Fichier : `package.json`.
  Résolution : exploitabilité réelle faible confirmée (postcss est build-time uniquement ; aucun `<Image>` ni `remotePatterns`, donc `/_next/image` ne traite aucune image distante). La montée vers `next@16` (rupture majeure) est planifiée en suivi post-lancement plutôt que bloquante.

### Reportés — à régler dans les variables d'environnement Vercel (runbook déploiement)

- L2 / I1 — `NEXT_PUBLIC_API_URL` et garde middleware
  Statut : Reporté — configuration de déploiement (hors code).
  Résolution : `NEXT_PUBLIC_API_URL` doit être fixé sur l'URL https réelle de l'API dans les variables d'environnement Vercel, et le build ne doit PAS lire `.env.local` ; `NEXT_PUBLIC_MIDDLEWARE_GUARD=strict` à activer côté Vercel (front et API same-origin sur `.fixpay.me`). Points consignés au runbook de déploiement.

### Reportés — décisions produit à trancher (volontairement non modifiés)

- I2 — `email_verified` dans `RouteGuard`
  Statut : Reporté — décision produit.
  Fichier : `src/lib/auth/RouteGuard.tsx`.
  Résolution : l'enforcement reste côté API (middleware `verified` Laravel) ; l'ajout d'une branche `email_verified` côté garde dépend de la politique produit à trancher, donc non modifié.

- M3 — Drapeau `indicative` des devis
  Statut : Reporté — décision produit.
  Fichiers : `src/app/(flows)/cards/top-up/page.tsx`, `src/app/(flows)/cards/withdraw/page.tsx`.
  Résolution : atténué par le taux carte fixe (indicative probablement false en prod) ; l'exposition d'un libellé « estimé » dépend de la décision d'activer ou non des devis indicatifs, donc non modifié.

### Porte de qualité finale

typecheck : pass · lint : pass · build : pass · tests : 154 passed / 154 (40 test files) · GREEN : oui.
Correctifs d'intégration : aucun nécessaire — la porte est passée du premier coup sur les quatre étapes (typecheck, lint, build, test).
Émission des en-têtes : non applicable — aucune modification apportée durant cette exécution, `next.config.ts` inchangé.
Smoke runtime : ignoré (optionnel) — `next.config.ts` n'a pas changé depuis la première vérification, donc le smoke des en-têtes n'était pas requis.
