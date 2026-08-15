# Déploiement du frontend FixPay sur Vercel

Runbook de mise en production de l'app utilisateur (`app.fixpay.me`) sur Vercel,
branchée sur l'API Laravel (`api.fixpay.me`).

## 1. Architecture cible

| Composant | Domaine | Hébergeur |
|---|---|---|
| Landing page | `fixpay.me` | Autre dev |
| App utilisateur (ce dépôt) | `app.fixpay.me` | **Vercel** |
| API Laravel | `api.fixpay.me` | Hostinger |

L'authentification repose sur un **cookie de session Sanctum** partagé sur le domaine
parent `.fixpay.me` : le navigateur envoie le cookie aussi bien à `app.fixpay.me`
qu'à `api.fixpay.me`. C'est pour cela que tout doit vivre sous `*.fixpay.me`.

## 2. Variables d'environnement Vercel

À définir dans **Project → Settings → Environment Variables**, périmètre
**Production** (et **Preview** si tu utilises les déploiements de préversion).

| Variable | Valeur (Production) | Rôle |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.fixpay.me` | Base de l'API. Le code append `/api` et `/sanctum/csrf-cookie`. **Sans slash final.** |
| `NEXT_PUBLIC_SESSION_COOKIE` | `fixpay_session` | Nom du cookie de session (vérif. grossière du middleware). Dérivé de `APP_NAME=FixPay` côté backend. |
| `NEXT_PUBLIC_MIDDLEWARE_GUARD` | `strict` | Active la 1ʳᵉ barrière serveur (invité sur route protégée → `/login`). Sûr ici car le cookie `.fixpay.me` est visible par `app.fixpay.me`. |

> ⚠️ Ces variables sont **inlinées au build** (préfixe `NEXT_PUBLIC_`). Toute
> modification nécessite un **redéploiement**, pas seulement un redémarrage.

Bloc copiable (si tu utilises `vercel env` en CLI) :

```
NEXT_PUBLIC_API_URL=https://api.fixpay.me
NEXT_PUBLIC_SESSION_COOKIE=fixpay_session
NEXT_PUBLIC_MIDDLEWARE_GUARD=strict
```

## 3. Réglages du projet Vercel

| Réglage | Valeur |
|---|---|
| Framework Preset | **Next.js** (auto-détecté) |
| Root Directory | racine du dépôt (défaut) — le `package.json` est à la racine |
| Build Command | `next build` (défaut) |
| Install Command | `npm install` (défaut) |
| Output | `.next` (défaut) |
| Node.js Version | **20.x** |

Rien de spécial à configurer côté build : les **en-têtes de sécurité** (CSP,
X-Frame-Options, HSTS, etc.) sont posés par `next.config.ts` et s'appliquent
automatiquement sur Vercel.

## 4. Domaine & DNS

1. Vercel → **Project → Settings → Domains** → ajouter `app.fixpay.me`.
2. Chez le registrar du domaine (Hostinger, zone DNS de `fixpay.me`), créer
   l'enregistrement demandé par Vercel :

   ```
   Type    Nom     Valeur
   CNAME   app     cname.vercel-dns.com.
   ```

   (Vercel affiche la cible exacte ; suivre celle qu'il indique.) Ne touche pas à
   l'apex `fixpay.me` ni au `www` : ils restent sur la landing.
3. Attendre la propagation + provisioning TLS automatique par Vercel (HTTPS).

## 5. Prérequis côté backend (sinon l'auth cookie ne marche pas)

Le cookie cross-sous-domaine ne fonctionne que si l'API expose la bonne config.
À vérifier dans le `.env` de production Hostinger (déjà présents dans
`backend-fixpay/.env.production.example`) :

```
APP_URL=https://api.fixpay.me
APP_NAME=FixPay                       # → cookie = fixpay_session
SESSION_DOMAIN=.fixpay.me             # cookie partagé sur tous les sous-domaines
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=lax                 # app↔api sont same-site (même domaine parent)
SANCTUM_STATEFUL_DOMAINS=app.fixpay.me,admin.fixpay.me,fixpay.me
CORS_ALLOWED_ORIGINS="https://fixpay.me,https://app.fixpay.me,https://admin.fixpay.me"
FORCE_HTTPS=true
```

La CSP du frontend autorise déjà `connect-src` vers l'origine de
`NEXT_PUBLIC_API_URL` (donc `https://api.fixpay.me`). Si tu changes l'URL de l'API,
la CSP suit automatiquement (elle est dérivée de la variable au build).

## 6. Le piège `.env.local` (finding L2 de l'audit)

- Les `NEXT_PUBLIC_*` sont **gelées au build**. Un build lancé avec un `.env.local`
  contenant `http://localhost:8000` embarquerait cette URL dans le bundle livré →
  API injoignable + contenu mixte (http dans une page https).
- **Sur Vercel, aucun risque** tant que : `.env.local` reste **non commité**
  (il est déjà dans `.gitignore`) et que les 3 variables sont définies dans le
  dashboard. Vercel build à partir des variables du dashboard, pas d'un `.env.local`.
- Pour un **build local de test** destiné à la prod, passe les variables à la main
  et n'utilise pas ton `.env.local` de dev.

## 7. Vérifications post-déploiement (smoke)

Une fois `app.fixpay.me` en ligne :

1. **En-têtes de sécurité** :
   ```
   curl -sI https://app.fixpay.me | grep -iE "content-security-policy|x-frame-options|strict-transport|x-content-type|referrer-policy|permissions-policy|x-powered-by"
   ```
   Attendu : CSP avec `frame-ancestors 'none'` et `connect-src ... https://api.fixpay.me`,
   `X-Frame-Options: DENY`, HSTS présent, **pas** de `X-Powered-By`.

2. **Flux d'auth cookie SPA** (dans le navigateur, DevTools ouverts) :
   - Charger `app.fixpay.me` → redirection `/login` (mode strict actif).
   - Se connecter : vérifier l'appel `GET api.fixpay.me/sanctum/csrf-cookie` (204),
     puis `POST /api/login` (200) avec l'en-tête `X-XSRF-TOKEN`, puis `GET /api/me`
     (200) porté par le cookie `fixpay_session`.
   - Recharger : la session persiste, pas de retour à `/login`.

3. **Pas de fuite** : `NEXT_PUBLIC_*` ne contiennent aucun secret (uniquement URL +
   nom de cookie + drapeau) — rien de sensible n'est inliné.

## 8. Checklist finale

- [ ] 3 variables d'env définies sur Vercel (Production), `NEXT_PUBLIC_API_URL` sans slash final
- [ ] `app.fixpay.me` ajouté dans Vercel + CNAME créé côté DNS
- [ ] TLS provisionné (HTTPS vert)
- [ ] Backend : `SESSION_DOMAIN=.fixpay.me`, `SANCTUM_STATEFUL_DOMAINS` inclut `app.fixpay.me`, CORS inclut `https://app.fixpay.me`, cookie sécurisé
- [ ] `.env.local` non commité (déjà gitignoré)
- [ ] Smoke : en-têtes présents + flux `csrf → login → /me` vert de bout en bout
