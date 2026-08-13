# FixPay — Frontend

Reproduction fidèle en **Next.js 15** du design FixPay (28 écrans) : portefeuille mobile et
cartes bancaires virtuelles — dépôts, retraits et paiements en FCFA. Mobile-first
(maquettes 390 px) avec une **couche desktop** ajoutée par-dessus (sidebar + grilles) et un
**thème clair** en plus du sombre d'origine. Données mockées.

> Source de design : fichier Figma `bZ0BxRzKQhc2JIf0eDyWg0` (import html.to.design, 28 écrans).

## Stack

| Outil | Rôle |
|---|---|
| Next.js 15 (App Router, `src/`) | Framework, routage par groupes `(auth)` `(tabs)` `(flows)` `(success)` |
| TypeScript (strict) | Typage de bout en bout |
| Tailwind CSS v4 | Styling via tokens `@theme` (voir `src/app/globals.css`) |
| lucide-react | Icônes |
| DM Sans / DM Mono (`next/font`) | Typographies du design |

## Démarrage

```bash
npm install
npm run dev        # http://localhost:3000
```

| Script | Effet |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` / `npm start` | Build + serveur de production |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (config Next core-web-vitals + TS) |
| `npm run format` / `format:check` | Prettier (+ tri des classes Tailwind) |

## Structure

```
src/
  app/                  # 28 écrans (voir docs/ARCHITECTURE.md pour la carte des routes)
    (auth)/onboarding   # 01 — accueil marketing
    (tabs)/             # 02, 03, 19 — écrans à bottom nav (Accueil, Portefeuille, Profil)
    (flows)/            # flux : dépôt/retrait, cartes, paiement, KYC, réglages, support…
    (success)/          # 6 écrans de confirmation
  components/
    brand/              # logo FixPay (SVG recréé)
    layout/             # AppHeader, PageHeader, BottomNav
    ui/                 # 36 composants du design system (contrats dans docs/DESIGN_SYSTEM.md)
  lib/
    mock-data.ts        # source unique des données (typée strict)
    format.ts           # formatage FCFA (espaces fines insécables, signes)
    icons.ts            # mapping icônes de transaction
    utils.ts            # cn()
```

## Documentation

- [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) — tokens, contrats de props des 40 composants,
  pièges de fidélité visuelle (ombres colorées, doubles transparences, DM Mono localisé…).
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — carte des 28 routes, navigation inter-écrans,
  plan des données mock.
- [docs/RESPONSIVE.md](docs/RESPONSIVE.md) — couche desktop : point de rupture unique (`lg`),
  sidebar 264 px, largeurs de contenu et grilles par écran, règle de non-régression mobile.
- [docs/THEMING.md](docs/THEMING.md) — thèmes clair/sombre : tokens commutables, script
  anti-flash, zones à dégradé épinglées en sombre, intentions de la palette claire.

## Principes

- **Fidélité au pixel** : toutes les couleurs/rayons/ombres passent par les tokens extraits du
  Figma ; aucun arrondi approximatif, aucune ombre noire.
- **Mobile intouchable** : la couche desktop n'ajoute que des classes `lg:` (et `hover:` /
  `focus-visible:`). En dessous de 1024 px, le rendu reste identique au pixel au design validé.
- **Sombre verrouillé** : le thème clair ne touche jamais aux valeurs du bloc sombre de
  `globals.css` ; les 28 écrans en sombre restent identiques au pixel.
- **Composants Server par défaut** ; `"use client"` uniquement où il y a de l'état local
  (wizards, toggles, numpad, chat, masquage des soldes).
- **Zéro donnée en dur dans les pages** : tout vient de `lib/mock-data.ts` (ou de constantes
  typées locales pour le contenu propre à un écran).
- **Accessibilité** : vrais liens, `aria-label` sur les contrôles icône, `role="switch"` sur les
  toggles, `aria-current` sur l'onglet actif.
