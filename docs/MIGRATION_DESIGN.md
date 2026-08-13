# Migration du design system — table de correspondance

Suite à [AUDIT_LOOK_IA.md](AUDIT_LOOK_IA.md), les tokens ont été réécrits dans
`src/app/globals.css`. Ce document est la **table de remap mécanique** à appliquer
dans tout `src/`. Aucune classe listée en colonne « avant » ne doit subsister.

## 1. Rayons — 13 tokens → 4

| Avant | Après | Rôle |
|---|---|---|
| `rounded-seg` (2px) | `rounded-full` | segments de stepper |
| `rounded-bar` (4px) | `rounded-xs` | remplissage de barre de progression |
| `rounded-eye` (8px) | `rounded-sm` | bouton œil 30px |
| `rounded-iconbtn` (10px) | `rounded-sm` | boutons icône 32/34, vignette mini-carte |
| `rounded-tile-sm` (11px) | `rounded-sm` | tuile 36 |
| `rounded-tile` (12px) | `rounded-sm` | tuile 38 |
| `rounded-tile-lg` (13px) | `rounded-sm` | tuile 40/42, bouton retour 38 |
| `rounded-field` (14px) | `rounded-md` | champs, selects, lignes sélectionnables |
| `rounded-card` (16px) | `rounded-lg` | cartes, bandeaux |
| `rounded-panel` (18px) | `rounded-md` sur un **bouton**, `rounded-lg` sur un **panneau** |
| `rounded-pill` (20px) | `rounded-full` sur une **chip**, `rounded-md` sur une **option de liste** |
| `rounded-hero` (22px) | `rounded-lg` | hero, carte bancaire, badge 72 |
| `rounded-badge` (28px) | `rounded-lg` | badge 88 |
| `rounded-device` (44px) | supprimé (non utilisé dans l'app) |
| `rounded-[9px]`, `rounded-[15px]`, `rounded-[10px]`… | `rounded-sm` ou `rounded-md` selon le rôle |

## 2. Ombres — 8 tokens colorés → 3 neutres

| Avant | Après |
|---|---|
| `shadow-glow-cta` | **supprimé** (aucune ombre sur les boutons) |
| `shadow-card-hero` | `shadow-raised` |
| `shadow-glow-badge` | **supprimé** |
| `shadow-glow-success` | **supprimé** |
| `shadow-mini-visa` / `shadow-mini-mc` | `shadow-surface` |
| `shadow-device` | **supprimé** |
| `shadow-card-light` | `shadow-surface` |
| `shadow-[0_4px_20px_rgb(0_0_0/0.15)]` et autres ombres arbitraires | `shadow-surface` ou rien |

Nouveau : `shadow-specular` (liseré haut interne) sur les surfaces à dégradé,
en remplacement des cercles décoratifs.

## 3. Dégradés — 10 utilitaires → 2

| Avant | Après |
|---|---|
| `gradient-brand` | aplat `bg-primary` (bouton, barre, badge, avatar chat, CTA sidebar) |
| `gradient-badge-green` | aplat `bg-success` |
| `gradient-badge-amber` | aplat `bg-warning` |
| `gradient-badge-bluegreen` | aplat `bg-success` |
| `gradient-chip-gold` | aplat `bg-gold` |
| `gradient-onboarding` | aplat `bg-bg` |
| `glow-radial-blue` / `glow-radial-deep` | **supprimés** (halos retirés) |
| `gradient-card` / `gradient-card-mc` | **conservés**, autorisés uniquement sur `VirtualCard`, `WalletHeroCard` et `HeroGradientCard` |

## 4. Suppressions de composants et de motifs

- `components/ui/DecorativeCircles.tsx` : **supprimé**, ainsi que ses 5 usages.
  Remplacer par `shadow-specular` sur la surface concernée.
- `VirtualCard` variante onboarding : supprimer les **deux couches inclinées**
  (`rotate-[8deg]`, `rotate-[4deg]`) — une seule carte, rotation nulle.
- `RadioCheck` : l'état `ghost-check` est **supprimé du type** (c'était une
  fidélité à un défaut de la maquette : six pays cochés simultanément).
  Les 4 appels passent sur `empty`.

## 5. Typographie

- `SectionLabel` : `10px / w600 / uppercase / tracking 0.1em / text-muted`
  → **`13px / w500 / sentence case / tracking 0 / text-secondary`**.
- Token `--tracking-label` : **supprimé** (retour en arrière impossible).
- `tracking-label` dans les classes : à retirer partout.
- Chiffres tabulaires : posés sur `body`, rien à faire par composant.

## 6. Données (`lib/`)

- `formatFcfa` : **jamais de décimales** — le franc CFA n'a pas de subdivision.
  Supprimer la prop `decimals` de `WalletHeroCard` et le champ de `mock-data`.
- `walletMovements` : trier par date décroissante.
- `quickAmounts.payment` : remplacer `[3280, 9839, 19679, 49197]` (des euros
  convertis) par des paliers ronds `[5000, 10000, 25000, 50000]`.
- `formatDate` : une seule règle dans tout le produit (heure seule le jour même,
  « Hier, 09:15 » sur 48 h, puis « 11 avr. »).

## 7. Navigation

`BottomNav` dérive l'onglet actif du `pathname` (comme la `Sidebar`) : la prop
`active` disparaît des 19 appels. Les incohérences de la maquette (écran 07
mettant « Accueil » en avant) ne sont pas reportées.

## Invariant

Le thème clair et le thème sombre doivent rester cohérents : toute nouvelle
variable `--c-*` est définie **dans les deux blocs**. Le bloc sombre n'est plus
figé (l'audit l'a explicitement dé-verrouillé), mais toute modification doit
rester justifiée par l'audit.
