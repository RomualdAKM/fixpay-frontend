# FixPay — Design System

## Préambule : le Figma n'est plus la source de vérité

Le fichier Figma `bZ0BxRzKQhc2JIf0eDyWg0` (28 écrans, 390×780, sombre) a servi
d'amorce au produit. Il **n'est plus la référence**.

L'audit de direction artistique [AUDIT_LOOK_IA.md](AUDIT_LOOK_IA.md) a établi que
cette maquette était l'import automatique d'un HTML généré, et qu'elle en portait
tous les marqueurs : ombres colorées et halos radiaux, 14 rayons sans hiérarchie,
dégradé 135° utilisé comme peinture universelle, tuile d'icône devant chaque
ligne de liste, micro-label majuscule sous le seuil AA, cercles blancs flous sur
chaque surface à dégradé, palette Tailwind par défaut non retouchée, absence de
chiffres tabulaires dans une application financière, et des données inventées
(soldes FCFA à décimales, listes « récentes » non triées, six pays cochés
simultanément).

Le plan de correction a été appliqué intégralement. La table de remap mécanique
est dans [MIGRATION_DESIGN.md](MIGRATION_DESIGN.md).

**Ce document décrit le système post-refonte, tel qu'il existe dans le code.**
Il a été rédigé en lisant `src/app/globals.css`, les 45 composants de
`src/components/` et `src/lib/` — aucune affirmation n'y est reprise de la
version précédente sans vérification.

Documents liés :

| Document | Périmètre |
|---|---|
| [AUDIT_LOOK_IA.md](AUDIT_LOOK_IA.md) | Le diagnostic et le plan de correction en 11 étapes, écran par écran |
| [MIGRATION_DESIGN.md](MIGRATION_DESIGN.md) | La table de correspondance avant/après des tokens et des props supprimées |
| [RESPONSIVE.md](RESPONSIVE.md) | La couche desktop (`lg:`), le shell, les largeurs de contenu |
| [THEMING.md](THEMING.md) | La mécanique des deux thèmes et les sous-arbres épinglés en sombre |

> Note de lecture : `RESPONSIVE.md` décrit encore la `BottomNav` comme portant une
> prop `active` explicite « fidèle au Figma ». Ce n'est plus le cas — l'onglet est
> dérivé de la route, et aucun appel du produit ne passe cette prop (voir
> [BottomNav](#bottomnav)). En cas de divergence, **le code fait foi**, et ce
> document décrit le code.

**Règle d'or** : aucune couleur, aucun rayon, aucune ombre en dur si un token
existe. Les valeurs arbitraires de dimension et de typographie
(`h-[57px]`, `text-[13.5px]`, `tracking-[-2px]`) restent autorisées : elles
portent la métrique validée écran par écran, qui n'a pas d'échelle de tokens.

---

## 1. Fondations

Tous les tokens vivent dans `src/app/globals.css` : un bloc `@theme inline` qui
mappe chaque token Tailwind sur une variable CSS `--c-*`, puis deux palettes
déclarées par attribut `[data-theme]`.

### 1.1 Rayons — 4 valeurs, un rôle chacune

L'audit relevait 14 rayons issus d'un recensement d'import, sans hiérarchie :
l'objet identitaire (la carte bancaire) et un panneau neutre partageaient 22px.

| Token | Valeur | Rôle |
|---|---|---|
| `rounded-xs` | 4px | Micro-objets : puce EMV de la carte, remplissage de barre de progression, lignes squelette |
| `rounded-sm` | 8px | Petits contrôles : boutons icône, bouton retour, tuiles d'icône, bouton œil, vignette mini-carte |
| `rounded-md` | 12px | Interactifs : CTA, champs, selects, lignes de liste sélectionnables, entrées de sidebar |
| `rounded-lg` | 16px | Surfaces : cartes, panneaux, heros, bandeaux, badges de succès |

Tout le reste est `rounded-full` (pastilles, chips, segments de stepper,
interrupteurs, avatars).

Vérification : `src/` ne contient **aucune** classe `rounded-[…]` arbitraire.
Répartition réelle des 90 occurrences : `md` 25, `full` 23, `lg` 17, `sm` 13,
`xs` 12.

### 1.2 Ombres — 3 rôles, neutres et courtes

L'audit relevait 8 tokens d'ombre, tous colorés, dont un flou de 60px sous un
objet de 145px. Il n'en reste que trois, et deux d'entre eux ne sont posés que
sur une poignée d'éléments.

| Token | Valeur (sombre → clair) | Rôle | Où |
|---|---|---|---|
| `shadow-surface` | `0 0 #0000` → `0 1px 2px rgb(15 23 42 / 0.06)` | Lift discret d'une carte : nul sur fond sombre, hairline sur fond clair | `GlassCard`, vignette `VirtualCard` mini, pastille du `Toggle` |
| `shadow-raised` | `0 8px 24px rgb(0 0 0 / 0.4)` → `0 8px 24px rgb(15 23 42 / 0.12)` | Le seul niveau d'élévation réel du produit | `VirtualCard` (`lg`/`onboarding`) et `WalletHeroCard` — rien d'autre |
| `shadow-specular` | `inset 0 1px 0 rgb(255 255 255 / 0.1)` | Liseré haut interne d'une surface à dégradé, en remplacement des cercles blancs débordants | `VirtualCard`, `WalletHeroCard`, `HeroGradientCard`, hero du Profil |

Les tokens `--s-*` sont déclarés **uniquement sur la racine**, jamais dans un
bloc épinglé : une surface épinglée sombre repose sur une page qui, elle, peut
être claire — son ombre doit suivre le thème de l'application (voir THEMING.md).

Aucun bouton ne porte d'ombre. Le halo bleu du CTA (28px de flou sous 50px de
hauteur) était le marqueur n°1 identifié par l'audit.

### 1.3 Palette — valeurs propriétaires, deux thèmes conçus

La palette d'origine reprenait cinq valeurs Tailwind exactes (`blue-500`,
`green-500`, `red-500`, `amber-500`, `blue-600`), reconnaissables au premier
coup d'œil. Les teintes de marque et sémantiques ont été décalées.

**Marque et sémantique** (sombre → clair) :

| Token | Sombre | Clair | Note |
|---|---|---|---|
| `primary` | `#2f5be8` | `#2f5be8` | Bleu propriétaire légèrement violacé (l'ancien `#3b82f6` était `blue-500`). 5.4:1 sur le fond clair |
| `primary-light` | `#7aa0ff` | `#2f5be8` | |
| `primary-deep` / `primary-mid` / `primary-darkest` | `#1a3da8` / `#2457c5` / `#0b1c6b` | identiques | Arrêts du dégradé de la carte, inchangés dans les deux thèmes |
| `success` / `success-deep` | `#30a46c` / `#26855a` | `#1a7a4e` / `#14603d` | 4.9:1 en clair |
| `danger` / `danger-light` | `#e5484d` / `#f2555a` | `#c42b30` / `#b02328` | 5.6:1 en clair |
| `warning` / `warning-deep` | `#e79d13` / `#c9840f` | `#8c5a08` / `#6f4706` | 5.5:1 en clair |
| `gold` | `#c9a227` | `#a8871f` | Or mat de la puce EMV — plus un dégradé |
| `orange` | `#e8792b` | `#c4611f` | Seconde pastille Mastercard |
| `mc` / `mc-dark` / `mc-light` | `#8b1a3a` / `#3a0a1f` / `#b91c5a` | identiques | Dégradé Mastercard |

**Structure et texte** :

| Token | Sombre | Clair |
|---|---|---|
| `bg` | `#070c1a` (fond nuit désaturé, base de marque conservée) | `#eef1f8` |
| `bg-raised` | `#0d1629` | `#ffffff` |
| `nav` | `rgb(7 12 26 / 0.97)` | `rgb(255 255 255 / 0.94)` |
| `text` | `#eef2ff` | `#0e1830` |
| `text-secondary` | `rgb(196 212 255 / 0.72)` | `rgb(20 32 66 / 0.78)` |
| `text-muted` | `rgb(160 182 255 / 0.62)` | `rgb(30 45 90 / 0.72)` |
| `icon-muted` | `rgb(220 230 255 / 0.62)` | `rgb(30 45 90 / 0.66)` |
| `tagline` | `rgb(160 182 255 / 0.62)` | `rgb(20 32 66 / 0.6)` |

`--c-text-muted` a été remonté de `0.38` à `0.62` : l'ancienne valeur donnait
2.4:1, sous le seuil AA.

**Surfaces, bordures et teintes translucides** : `surface` → `surface-5`
(blanc @5/9/12/14/18 % en sombre, blanc opaque puis navy @6→15 % en clair),
`border` / `border-strong` / `border-frame`, et onze teintes sémantiques
dérivées (`primary-surface`, `primary-tint`, `primary-tint-2`, `primary-border`,
`success-surface`, `success-tint`, `success-border`, `warning-surface`,
`warning-tint`, `warning-border`, `mc-tint`).

Deux niveaux de bordure, à ne pas uniformiser : `border` (hairline des cartes et
des filets internes) et `border-strong` (champs, chips, selects, piste d'un
interrupteur au repos).

Le thème clair est **conçu, pas inversé** : les surfaces de verre deviennent des
cartes blanches sur un fond bleuté, et chaque accent est assombri pour tenir AA.

### 1.4 Typographie

- **DM Sans** (`--font-sans`, poids 400/500/600/700/800) et **DM Mono**
  (`--font-mono`, poids 400/500), chargés par `next/font/google` dans
  `src/app/layout.tsx` et exposés en variables CSS.
- **Chiffres tabulaires sur `body`** : `font-variant-numeric: tabular-nums`.
  Sans cela les colonnes de montants ne s'alignent pas et le montant saisi au
  pavé numérique se déplace à chaque frappe. Non négociable dans un produit
  financier — et rien à redéclarer par composant.
- **DM Mono est réservé à l'identité d'une carte et aux codes** : numéro de
  carte, `•••• 4291`, code de parrainage. Jamais pour du texte courant.
- **Plus de micro-label majuscule.** `SectionLabel` a été réécrit
  (13px / w500 / casse de phrase / tracking 0 / `text-secondary`) et le token
  `--tracking-label` a été supprimé. Quatre usages de `uppercase` subsistent
  volontairement, tous hors libellé de section : le libellé du hero portefeuille
  (11px sur dégradé), les bandes de statistiques du Profil et de l'écran
  Statistiques (10px), et le nom du porteur sur la face de la carte.
- Les valeurs de `tracking` négatives extrêmes restent posées en px arbitraires
  sur les grands montants (`-2px` à 36px, `-1.5px` à 32px, `-1px` à 26px).

### 1.5 Dégradés — 2 utilitaires, 3 composants autorisés

Il ne reste que deux `@utility`, tous deux à 135° :

- `gradient-card` : `#0b1c6b → #1a3da8 (55 %) → #2457c5`
- `gradient-card-mc` : `#3a0a1f → #8b1a3a (50 %) → #b91c5a`

Ils ne sont admis que sur `VirtualCard`, `WalletHeroCard` et `HeroGradientCard`
(plus le hero de la page Profil, qui compose la surface à la main). Partout
ailleurs — bouton, barre de progression, badge de succès, avatar de chat, logo,
CTA de la sidebar — le dégradé a été remplacé par un aplat.

Une surface à dégradé porte toujours `data-theme="dark"` : elle reste bleu nuit
sous le thème clair, et son contenu doit continuer à résoudre les tokens sombres.

---

## 2. Règles de composition

Formulées à partir des constats de l'audit, elles s'appliquent à tout nouvel
écran.

1. **Aucune ombre colorée, aucun halo.** Trois ombres neutres existent ; deux
   d'entre elles ne concernent que la carte bancaire et le hero portefeuille.
   Un bouton, un badge, une tuile ne portent pas d'ombre.
2. **Le dégradé est un signe rare.** Hors `VirtualCard`, `WalletHeroCard` et
   `HeroGradientCard`, on utilise un aplat de token.
3. **Pas de tuile d'icône par défaut dans une liste.** Les slots `leading` de
   `TransactionItem`, `ListItem` et `SelectableRow` sont optionnels et vides par
   défaut. On ne les remplit que si le visuel est **unique par ligne** (menu
   Profil, canaux de Support) ou réellement distinctif (vignette de carte).
   Une colonne de carrés identiques n'informe personne.
4. **Une seule profondeur de surface.** Une liste = un conteneur (`ListGroup`),
   des filets internes, et zéro rayon ou bordure par ligne. On n'imbrique pas une
   carte dans une carte.
5. **Pas de micro-label majuscule espacé.** Un libellé de section se lit comme du
   texte : `SectionLabel`, sans surcharge de taille, de graisse ni de couleur.
6. **Densité transactionnelle obligatoire sur les flux d'argent.** Tout écran qui
   déplace de l'argent affiche `TransactionFacts` : frais, délai, plafond
   restant, et « solde après » dès qu'un montant est saisi. C'est ce bloc, pas le
   style, qui distingue un transfert d'un formulaire à deux champs.
7. **CTA épinglé plutôt que noyé.** Le CTA principal d'un flux passe par
   `StickyActionBar`, qui rend le débordement sous la `BottomNav` structurellement
   impossible au lieu de dépendre d'un `pb-*`.
8. **Les couleurs sémantiques codent un fait, pas une humeur d'écran.** Un
   `InfoBanner` purement informatif est `neutral` ; `success` et `warning` sont
   réservés à un fait accompli ou à un avertissement réel. De même pour le ton du
   badge d'un écran de confirmation, qui porte la nature du mouvement.
9. **Les données ne mentent pas.** Aucune décimale sur un montant en FCFA, listes
   triées par date décroissante, pourcentages dérivés des montants et non posés,
   un seul état sélectionné à la fois.

---

## 3. Catalogue des composants

45 composants : 5 de layout, 1 de marque, 2 de thème, 37 d'UI. Les signatures
sont recopiées des interfaces TypeScript ; les valeurs par défaut sont indiquées
en prose.

### 3.1 Layout — `src/components/layout/`

#### AppShell

- **Fichier** : `src/components/layout/AppShell.tsx`
- **Props** : `{ children: ReactNode }`

Coquille des écrans à navigation. Rend `<Sidebar />` puis un conteneur
`flex min-h-dvh flex-col lg:pl-[264px]`. Sous `lg`, rien ne change : la page
garde sa colonne mobile et sa `BottomNav` fixe. Appliqué par
`app/(tabs)/layout.tsx` et `app/(flows)/layout.tsx` ; les groupes `(auth)` et
`(success)` n'ont pas de shell.

#### AppHeader

- **Fichier** : `src/components/layout/AppHeader.tsx`
- **Props** : `{ title?: string; showLogo?: boolean; showBell?: boolean; bellDot?: boolean; desktopTitle?: string }`

En-tête des onglets racine. À gauche, le logo FixPay 78px (`showLogo`) ou un
titre 19px bold ; à droite, `ThemeToggle` puis un `IconButton` cloche vers
`/notifications` (`showBell`, `bellDot` pour la pastille). `desktopTitle` est
opt-in : quand il est fourni, le slot mobile reçoit `lg:hidden` et un `<h1>`
24px le remplace à partir de `lg`, la sidebar portant déjà la marque. Prop
absente = aucune classe `lg:` émise.

#### PageHeader

- **Fichier** : `src/components/layout/PageHeader.tsx`
- **Props** : `{ title: string; backHref: string; status?: { label: string; dotClass?: string }; multiline?: boolean }`

En-tête de sous-page : `<Link>` retour 38px (`rounded-sm`, `bg-surface-2`,
bordure hairline, `ChevronLeft` 17px, `aria-label="Retour"`) + titre 19px bold,
22px à partir de `lg`. `status` bascule sur la disposition du chat (titre 16px +
`StatusDot` et libellé 11px). `multiline` autorise le titre sur deux lignes.

#### BottomNav

- **Fichier** : `src/components/layout/BottomNav.tsx` — `"use client"`
- **Props** : `{ active?: NavTab }` avec `type NavTab = "home" | "cards" | "wallet" | "profile"`

Barre d'onglets fixe (74px, `bg-nav` + `backdrop-blur-[20px]`, filet haut,
`z-50`, `lg:hidden`). Le contenu défile derrière. Quatre onglets : Accueil `/`,
Cartes `/cards/visa-4291` (allumé aussi par `/payment`), Portefeuille `/wallet`,
Profil `/profile`. Icônes 21px `strokeWidth={1.75} absoluteStrokeWidth`, libellés
9.5px. Double atténuation des onglets inactifs conservée (icône `icon-muted`
**et** wrapper `opacity-[0.28]`, libellé `text-muted` sans opacité), actif en
`primary` avec `aria-current="page"`.

> **Refonte.** L'onglet actif est **dérivé du `pathname`** par
> `tabFromPathname()`, comme la `Sidebar`. Un écran hors onglet
> (`/statistics`, `/notifications`, `/support`) n'en allume aucun plutôt qu'un
> faux. La prop `active` subsiste comme override documenté : aucun des 20
> appels du produit ne l'utilise (`grep` sur `active=` dans `src/` : 0 résultat).

#### Sidebar

- **Fichier** : `src/components/layout/Sidebar.tsx` — `"use client"`
- **Props** : aucune

Rail de navigation desktop (`hidden … lg:flex`), colonne fixe de 264px : logo
104px + `ThemeToggle`, section « Navigation » (4 entrées primaires), section
« Raccourcis » (Statistiques, Notifications, Support), CTA `Créer une carte`
(aplat `bg-primary`, `rounded-md`), puis le bloc utilisateur en pied poussé par
`mt-auto`. L'entrée active est calculée par correspondance de **préfixe la plus
longue**, de sorte que `/profile/kyc` allume « Profil » et non « Accueil ».

### 3.2 Marque — `src/components/brand/`

#### FixPayLogo

- **Fichier** : `src/components/brand/FixPayLogo.tsx`
- **Props** : `{ variant?: LogoVariant; tone?: LogoTone; width?: number; className?: string }` avec `type LogoVariant = "full" | "mark"` et `type LogoTone = "default" | "gold" | "white"`

SVG inline (les fills du Figma étaient des bitmaps) : bouclier en aplat +
bouclier intérieur clair à 60 %, et pour `variant="full"` le wordmark bicolore
`Fix` / `Pay`. Défauts : `variant="full"`, `tone="default"`, `width=78` ; la
hauteur suit le ratio (viewBox 78×25 en `full`, 21×25 en `mark`).

> **Refonte.** Les deux `linearGradient` d'origine ont disparu. Les couleurs sont
> posées via les variables brutes `var(--c-*)` et non via des classes : le logo
> doit suivre le thème de son sous-arbre, y compris épinglé sombre.

### 3.3 Thème — `src/components/theme/`

#### ThemeProvider

- **Fichier** : `src/components/theme/ThemeProvider.tsx` — `"use client"`
- **Props** : `{ children: React.ReactNode }`
- **Export associé** : `useTheme(): { theme: Theme; setTheme: (theme: Theme) => void; toggleTheme: () => void }`

Détient le thème de l'application : le reflète sur `<html data-theme>` (qui pilote
tous les tokens), le persiste dans `localStorage["fixpay-theme"]`, et suit
`prefers-color-scheme` tant que l'utilisateur n'a pas choisi explicitement. Le
premier rendu utilise le défaut sombre, réconcilié après montage. `useTheme()`
lève une erreur hors provider.

#### ThemeToggle

- **Fichier** : `src/components/theme/ThemeToggle.tsx` — `"use client"`
- **Props** : `{ size?: 38 | 34 | 32 | 30; iconSize?: number; iconClass?: string; bordered?: boolean; bgClass?: string }`

`IconButton` qui bascule le thème. L'icône montre le thème vers lequel on va :
soleil en sombre, lune en clair. Défauts `size=34`, `iconSize=17`,
`iconClass="text-primary-light"` ; `bordered` et `bgClass` sont transmis tels
quels à `IconButton` (le hero du Profil l'utilise sans bordure).

### 3.4 Surfaces et cartes — `src/components/ui/`

#### GlassCard

- **Fichier** : `src/components/ui/GlassCard.tsx`
- **Props** : `{ radius?: GlassRadius; borderStrong?: boolean; className?: string; children: ReactNode }` avec `type GlassRadius = 14 | 16 | 18 | 20 | 22`

Surface de base : `bg-surface` + bordure 1px (`border-border`, ou
`border-border-strong` avec `borderStrong`) + `shadow-surface`. En thème clair,
le remplissage devient blanc opaque et l'ombre hairline détache la carte du fond
bleuté ; en sombre `shadow-surface` est nul.

> **Refonte.** Les cinq valeurs héritées de la maquette retombent sur deux
> rayons : `14` et `20` → `rounded-md`, `16` / `18` / `22` → `rounded-lg`. Le
> défaut est `16`. Aucun appel du produit ne passe encore `radius` : la prop
> n'existe que pour les rares surfaces de type champ.

#### HeroGradientCard

- **Fichier** : `src/components/ui/HeroGradientCard.tsx`
- **Props** : `{ align?: "left" | "center"; className?: string; children: ReactNode }`

Bandeau hero secondaire à dégradé (KYC, Parrainage, Fidélité, Support) :
`gradient-card` + `shadow-specular` + `rounded-lg` + `p-5` surchargeable,
épinglé `data-theme="dark"`, contenu libre.

> **Refonte.** Les props `radius` et `shadow` ont disparu : une seule surface, un
> seul rayon, **aucune élévation** — le niveau `raised` est réservé à la carte
> bancaire et au hero portefeuille. Le cercle blanc débordant est remplacé par le
> liseré spéculaire.

#### VirtualCard

- **Fichier** : `src/components/ui/VirtualCard.tsx`
- **Props** : `{ size?: VirtualCardSize; brand?: VirtualCardBrand; number?: string; holder?: string; expiry?: string; showChip?: boolean }` avec `type VirtualCardSize = "lg" | "onboarding" | "mini"` et `type VirtualCardBrand = "visa" | "mastercard"`

Le seul objet identitaire du produit, et le seul à porter à la fois
`gradient-card` (ou `gradient-card-mc`) et `shadow-raised`. `lg` (h-192, pleine
largeur) et `onboarding` (276×168) rendent la face complète : puce EMV, numéro en
DM Mono, porteur en majuscules, `EXP:` (absent en `onboarding`), filigrane
FixPay or et marque du réseau. `mini` est la vignette 80×50 (`rounded-sm`,
`shadow-surface`) utilisée en `leading` de liste. Épinglé `data-theme="dark"`.

> **Refonte.** Les cercles décoratifs et les deux couches inclinées de la pile 3D
> ont été supprimés ; le relief interne vient d'un `shadow-specular` posé en
> calque (une seule classe `shadow-*` par élément). La puce EMV est un aplat
> `bg-gold` en `rounded-xs`, gravé de trois filets qui découpent les six plages
> de contact, au lieu d'un rectangle en dégradé non identifiable.

#### WalletHeroCard

- **Fichier** : `src/components/ui/WalletHeroCard.tsx`
- **Props** : `{ variant: WalletHeroVariant; label: string; amount: string; hidden?: boolean; onToggleHidden?: () => void; children?: ReactNode }` avec `type WalletHeroVariant = "compact" | "expanded"`

Hero du solde sur `gradient-card` + `shadow-raised` + `shadow-specular`, épinglé
sombre, filigrane FixPay 62px hors flux. `compact` (h-145, Accueil) : solde 26px.
`expanded` (h-220, Portefeuille) : solde 32px et slot `children` ancré au bas de
la carte. Bouton œil 30px intégré, `aria-label` explicite, masquage par
`••••••`.

> **Refonte.** La prop `decimals` a été supprimée : le franc CFA n'a pas de
> subdivision, le montant vient tel quel de `formatFcfa`. Cercles décoratifs
> remplacés par le liseré spéculaire.

#### BalanceCard

- **Fichier** : `src/components/ui/BalanceCard.tsx`
- **Props** : `{ label: string; amount: string }`

Rappel de la ressource en tête de flux : `GlassCard` `p-[15px]` avec
`SectionLabel` + montant 20px bold pré-formaté.

> **Refonte.** La prop `icon` a disparu. L'icône d'accent alignée à droite
> (`Wallet` sur l'écran 06, `CreditCard` sur le 07) était du remplissage de
> composition : ni cliquable, ni informative, ni affordance.

#### StatTile

- **Fichier** : `src/components/ui/StatTile.tsx`
- **Props** : `{ label: string; value: string; valueClass?: string; note?: string; mono?: boolean; padding?: 15 | 17 }`

Tuile de grille deux colonnes : `GlassCard` + `SectionLabel` + valeur 20px bold
(colorable par `valueClass`) + note 11px muted. `mono` bascule la valeur en
DM Mono 13px `tracking-[1px]`, traitement unique de l'identité d'une carte.

> **Refonte.** Les props `radius` et `labelClass` ont été supprimées : toutes les
> valeurs de rayon convergeaient vers `lg`, et `labelClass` servait à faire varier
> le micro-label majuscule d'un écran à l'autre — la typographie du libellé
> appartient désormais à `SectionLabel`. À la date de rédaction, aucune page de
> `src/app/` n'importe ce composant : les écrans concernés composent
> `GlassCard` + `SectionLabel` directement.

#### InfoBanner

- **Fichier** : `src/components/ui/InfoBanner.tsx`
- **Props** : `{ tone?: InfoBannerTone; children: ReactNode }` avec `type InfoBannerTone = "neutral" | "blue" | "success" | "warning"`

Bandeau `rounded-lg` : icône `Info` 15px en haut à gauche + texte 12.5px/20px en
`text-secondary`.

> **Refonte.** Le défaut est `neutral` (surface + hairline). Les tons sémantiques
> ne sont plus admis que sur un fait accompli ou un avertissement réel : ils
> servaient de code couleur d'écran (vert sur 06, ambre sur 07 pour deux textes
> strictement informatifs).

#### GradientIconBadge

- **Fichier** : `src/components/ui/GradientIconBadge.tsx`
- **Props** : `{ icon: LucideIcon; tone: BadgeTone; size?: BadgeSize }` avec `type BadgeTone = "success" | "warning" | "primary"` et `type BadgeSize = 88 | 72 | 56`

Squircle `rounded-lg` en **aplat** teinté (`bg-success` / `bg-warning` /
`bg-primary`) avec glyphe blanc : 88→42px, 72→32px, 56→26px. Défaut `size=88`.

> **Refonte.** Malgré son nom, le composant ne porte plus ni dégradé ni lueur —
> un halo bleu de 40px sous un badge vert ou ambre était le marqueur le plus
> chromatiquement faux du lot. Le vocabulaire de tons est devenu sémantique
> (`success`/`warning`/`primary` au lieu de `green`/`amber`/`blue`/`bluegreen`),
> et la taille de référence des confirmations est passée à 56.

### 3.5 Contrôles et saisie — `src/components/ui/`

#### Button

- **Fichier** : `src/components/ui/Button.tsx`
- **Props** : `{ variant?: ButtonVariant; children: ReactNode; href?: string; onClick?: () => void; className?: string }` avec `type ButtonVariant = "primary" | "glass" | "white" | "small"`

Rend un `<Link>` stylé si `href`, sinon un `<button type="button">`. Tous les
variants portent l'anneau de focus clavier `focus-visible:ring-primary/60`.

| Variant | Rendu |
|---|---|
| `primary` (défaut) | h-50 pleine largeur, `rounded-md`, aplat `bg-primary`, 15px w600 blanc, **aucune ombre** |
| `glass` | h-50, `bg-surface` + `border-border-strong`, texte `text-secondary` |
| `white` | h-50, aplat blanc, texte `text-primary-deep` — hiérarchie inversée du hero portefeuille, saluée par l'audit comme le seul geste de DA délibéré du lot |
| `small` | h-32, `rounded-sm`, aplat `bg-primary`, 12px w600 |

> **Refonte.** Le `primary` a perdu son dégradé 135° et son `shadow-glow-cta`.

#### IconButton

- **Fichier** : `src/components/ui/IconButton.tsx`
- **Props** : `{ icon: LucideIcon; size?: IconButtonSize; iconClass?: string; badge?: boolean; onClick?: () => void; href?: string; label?: string; ariaLabel?: string; iconSize?: number; bordered?: boolean; bgClass?: string }` avec `type IconButtonSize = 38 | 34 | 32 | 30`

Bouton icône de verre (`<Link>` si `href`). Défauts : `size=34`,
`iconClass="text-icon-muted"`, `bordered=true`, `bgClass="bg-surface-2"`.
Tailles d'icône automatiques : 38→17, 34→16, 32→16, 30→15, surchargeables par
`iconSize`. `label` ajoute un texte visible qui devient le nom accessible ;
sinon `ariaLabel` est **obligatoire**. `badge` pose un `StatusDot` 6px bleu
ringé en haut à droite.

> **Refonte.** La prop `radius` a disparu : le rayon est `sm` quelle que soit la
> taille (les quatre valeurs d'origine 13/10/10/8 étaient un recensement d'import).

#### IconTile

- **Fichier** : `src/components/ui/IconTile.tsx`
- **Props** : `{ icon: LucideIcon; tone?: IconTileTone; size?: IconTileSize; iconSize?: number }` avec `type IconTileTone = "blue" | "green" | "amber" | "mastercard" | "neutral" | "disabled"` et `type IconTileSize = 36 | 38 | 40 | 42`

Carré arrondi `rounded-sm` quelle que soit la taille (défauts `tone="neutral"`,
`size=40`, `iconSize=17`), remplissage en teinte sémantique et glyphe assorti.

> **Refonte.** Les rayons 11/12/13 qui variaient avec la taille ont été
> supprimés. L'usage est **restreint** : réservé aux entrées de menu où le glyphe
> est unique par ligne (Profil, Support). Les listes de mouvements et les
> sélecteurs n'en portent plus.

#### Toggle

- **Fichier** : `src/components/ui/Toggle.tsx` — `"use client"`
- **Props** : `{ checked: boolean; onChange: (v: boolean) => void; label?: string }`

Interrupteur 44×26 non natif : `role="switch"` + `aria-checked` + `aria-label`,
piste `bg-primary` en ON / `bg-surface-4` en OFF, pastille blanche 22px glissant
de 2px à 20px, portant `shadow-surface` (nul en sombre, hairline en clair).

#### RadioCheck

- **Fichier** : `src/components/ui/RadioCheck.tsx`
- **Props** : `{ state: "selected" | "empty"; size?: 20 | 22 }`

Pastille circulaire décorative (`aria-hidden`) en bord droit de `SelectableRow` :
`selected` = disque `bg-primary` + `Check` blanc 11px, `empty` = anneau 2px
`border-border-strong`. La sémantique de sélection appartient à la rangée.

> **Refonte.** Le troisième état `ghost-check` a été **supprimé du type** :
> c'était la fidélité à un défaut de la maquette, qui affichait six pays cochés
> simultanément sur les écrans de dépôt et de retrait.

#### SelectField

- **Fichier** : `src/components/ui/SelectField.tsx` — `"use client"`
- **Props** : `{ label: string; value: string; options: string[]; onChange?: (v: string) => void }`

`SectionLabel` + `<select>` natif h-48 (`rounded-md`, `border-border-strong`,
`appearance-none`, `aria-label` = le libellé) surmonté d'un `ChevronDown` 12px
`text-primary-light` non cliquable.

> **Refonte.** Plus de surcharge à 10.5px sur le libellé : il suit la définition
> unique de `SectionLabel`.

#### AmountInput

- **Fichier** : `src/components/ui/AmountInput.tsx`
- **Props** : `{ value: string; onChange: (v: string) => void; placeholder: string; variant?: "amount" | "text"; ariaLabel?: string }`

Champ autonome à bordure `border-border-strong`. `amount` (défaut) : h-57,
centré, 22px bold, `inputMode="numeric"` (clavier natif, pas de pavé custom).
`text` : h-48, aligné à gauche, 15px. `ariaLabel` retombe sur le placeholder.

#### QuickAmountChips

- **Fichier** : `src/components/ui/QuickAmountChips.tsx`
- **Props** : `{ amounts: number[]; onSelect: (n: number) => void }`

Quatre pastilles `rounded-full` h-36 en `grid-cols-4`, libellées par
`formatAmount` (sans devise).

> **Refonte.** La prop `withCurrency` a été supprimée — la devise est déjà portée
> par le montant géant. Le `flex-wrap` qui laissait un orphelin en fin de ligne
> et les largeurs variables selon le nombre de chiffres sont remplacés par une
> grille à colonnes égales.

#### Numpad

- **Fichier** : `src/components/ui/Numpad.tsx`
- **Props** : `{ onKey: (k: string) => void; onDelete: () => void }`

Pavé 3×4 sans chrome : touches en texte pur 22px sur des rangées de 65px, aucun
fond ni bordure de touche, icône lucide `Delete` en dernière position,
`role="group"` + `aria-label="Pavé numérique"`. Le survol et le focus clavier
sont les seuls à peindre une boîte (`hover:rounded-md`), sans effet sur mobile.
Les touches émises incluent `"."` ; c'est la page appelante qui filtre les
non-chiffres (le franc CFA n'a pas de subdivision).

#### SuggestionChip

- **Fichier** : `src/components/ui/SuggestionChip.tsx`
- **Props** : `{ children: string; onClick?: () => void }`

Pastille de question suggérée : h-32 `rounded-full`, `bg-surface-2`, texte
`text` plein, **une seule couche** — la double transparence d'origine (fond bleu
@10 % + bordure bleu @20 % + texte bleu clair) les faisait lire comme des liens
désactivés.

#### StickyActionBar

- **Fichier** : `src/components/ui/StickyActionBar.tsx`
- **Props** : `{ children: ReactNode }`

Barre d'action épinglée juste au-dessus de la `BottomNav`
(`fixed bottom-[74px]`, `bg-bg` opaque, filet haut, `px-5 py-4`, `z-40`,
colonne 430px centrée), doublée d'un espaceur `h-[82px] lg:hidden` qui garde le
bas de page atteignable au défilement. À partir de `lg`, elle redevient un bloc
statique sans fond ni filet.

> **Refonte.** Composant créé par l'audit (étape 9). Il rend structurellement
> impossible le CTA masqué des écrans 06 et 08. Utilisé par 9 pages :
> les 5 flux d'argent, la création de carte, les deux étapes KYC et le parrainage.

### 3.6 Listes et rangées — `src/components/ui/`

#### ListGroup

- **Fichier** : `src/components/ui/ListGroup.tsx`
- **Props** : `{ children?: ReactNode; loading?: boolean; empty?: ReactNode; className?: string }`

Conteneur de liste par défaut du produit : un `GlassCard` en
`divide-border divide-y overflow-hidden`. **Une seule surface**, des filets
internes, et aucun rayon ni bordure par ligne — l'audit comptait jusqu'à 12
contours dessinés pour une liste de 6 entrées. Sans enfant et sans slot `empty`,
le composant ne rend rien plutôt qu'un rectangle vide.

> **Refonte.** `loading` rend trois lignes squelette animées (deux barres de
> texte, aucune tuile) et `empty` un message centré : aucun état de chargement ni
> de vide n'existait nulle part dans `src/`.

#### ListItem

- **Fichier** : `src/components/ui/ListItem.tsx`
- **Props** : `{ title: string; titleClass?: string; subtitle?: ReactNode; leading?: ReactNode; trailing?: "chevron" | ReactNode; href?: string; height?: 51 | 65 | 74 }`

Rangée générique de `ListGroup` : titre 13.5px w500 tronqué, sous-titre 11.5px
muted, nœud libre à droite. Rend un `<Link>` si `href`, avec survol
`hover:bg-surface-2` détouré par l'`overflow-hidden` du conteneur. Hauteurs :
51 (FAQ sans icône), 65 (défaut), 74 (notification non lue). La ligne ne porte
**ni rayon ni bordure**.

> **Refonte.** `trailing="chevron"` rend un `ChevronRight` **lucide** 16px
> (`strokeWidth={2} absoluteStrokeWidth`), plus le glyphe typographique `›` qui
> ne suivait pas la métrique des icônes de la page. Le slot `leading` est
> optionnel et absent par défaut.

#### SelectableRow

- **Fichier** : `src/components/ui/SelectableRow.tsx`
- **Props** : `{ title: string; subtitle?: string; leading?: ReactNode; selected?: boolean; radioState?: "selected" | "empty"; height?: number; onSelect?: () => void; price?: string; selectedVariant?: "tint" | "outline"; radioSize?: 20 | 22 }`

`<button>` avec `aria-pressed`, `rounded-md`, `RadioCheck` en bord droit.
Non sélectionnée : `bg-surface` + `border-border`. Sélectionnée : `tint`
(défaut) = `bg-primary-surface` + bordure 1px `primary` ; `outline` = bordure 2px
`primary` sans teinte (les rangées non sélectionnées de ces écrans portent alors
elles aussi une bordure 2px). `price` ajoute une troisième ligne 14px bold
`primary` et fait passer titre/sous-titre à l'échelle « carte d'option ».

> **Refonte.** La prop `radius` (14 / 16 / 20) a disparu : une ligne interactive
> a le même rayon `md` qu'un champ ou qu'un CTA. Le slot `leading` est optionnel
> et absent par défaut — la même tuile `CreditCard` pour Visa et Mastercard, ou
> un carré vide en guise de drapeau, coûtait une colonne entière sans rien
> apprendre. L'état sélectionné, lui, est conservé tel quel : c'est le patron du
> produit, lisible sans dépendre de la couleur seule.

#### SettingsToggleRow

- **Fichier** : `src/components/ui/SettingsToggleRow.tsx`
- **Props** : `{ title: string; subtitle: string; checked: boolean; onChange: (v: boolean) => void; divider?: boolean }`

Ligne de réglage posée directement sur le fond (pas de carte) : h-69, titre 14px
+ sous-titre 12px muted à gauche, `Toggle` à droite, filet bas optionnel. Le
titre sert de nom accessible à l'interrupteur.

#### TransactionItem

- **Fichier** : `src/components/ui/TransactionItem.tsx`
- **Props** : `{ transaction: Transaction; last?: boolean; accent?: boolean; leading?: ReactNode }`

Rangée d'historique h-65 avec filet bas (sauf `last`) : titre 13.5px, date
11.5px muted, montant signé et coloré à droite. Les transactions en EUR passent
par `formatSigned` (deux décimales), les autres par `AmountText`.

> **Refonte.** Aucun visuel de tête par défaut : la tuile 40px neutre était posée
> sur toutes les rangées, avec trois glyphes « nuage » identiques sur quatre.
> `accent` active une pastille ronde 28px de **sens de mouvement**
> (`ArrowDownLeft` entrant sur `bg-success-tint`, `ArrowUpRight` sortant sur
> `bg-surface-2`), à réserver aux mouvements internes ; elle prime sur `leading`.

#### SectionHeader

- **Fichier** : `src/components/ui/SectionHeader.tsx`
- **Props** : `{ title: string; actionLabel?: string; actionHref?: string }`

En-tête de section : `<h2>` 15px w600 à gauche, lien d'action 12px `primary`
(« Tout voir ») à droite quand les deux props d'action sont fournies.

#### SectionLabel

- **Fichier** : `src/components/ui/SectionLabel.tsx`
- **Props** : `{ children: string; className?: string }`

Libellé de section : **13px / w500 / casse de phrase / tracking 0 /
`text-secondary`**, définition unique et non paramétrable en taille.

> **Refonte.** Le micro-label 10px w600 majuscule `+0.1em` en `text-muted` était
> le tic typographique le plus répandu du produit (20 fichiers) et tombait sous
> le seuil AA. `className` reste ouvert pour le **rythme vertical** (`mt-*`,
> `px-*`) uniquement — pas pour redéfinir taille, graisse ou couleur.

### 3.7 Signalétique — `src/components/ui/`

#### Badge

- **Fichier** : `src/components/ui/Badge.tsx`
- **Props** : `{ tone?: BadgeTone; icon?: LucideIcon; children: string }` avec `type BadgeTone = "success" | "primary"`

Pastille d'état h-24 `rounded-full` : remplissage teinté + bordure plus opaque +
texte 11px w600, icône 11px optionnelle. La double transparence est conservée
mais exprimée avec les tokens sémantiques (`bg-success-tint` /
`border-success-border` / `text-success`), les `rgb()` en dur reprenant
`green-500` et `blue-500`.

#### StatusDot

- **Fichier** : `src/components/ui/StatusDot.tsx`
- **Props** : `{ size?: 6 | 7 | 8; colorClass?: string; ring?: boolean; className?: string }`

Pastille ronde décorative (`aria-hidden`) : 7px verte par défaut (agent en
ligne), 8px bleue (notification non lue), 6px bleue avec `ring` couleur fond
(badge de la cloche).

#### Avatar

- **Fichier** : `src/components/ui/Avatar.tsx`
- **Props** : `{ initial: string; size?: number }`

Rond d'initiale (défaut 68px, taille de police proportionnelle) :
remplissage `bg-surface-4`, anneau `ring-surface-5` de 3px — l'anneau était un
`rgb(255 255 255 / 0.28)` en dur. Il vit dans un sous-arbre épinglé sombre, où
ces tokens résolvent bien les valeurs sombres.

#### ProgressBar

- **Fichier** : `src/components/ui/ProgressBar.tsx`
- **Props** : `{ percent: number }`

Barre de 6px, piste `bg-border`, remplissage **aplat** `bg-primary`
(`rounded-xs`), pourcentage borné à 0–100, `role="progressbar"` avec
`aria-valuenow/min/max`. Un dégradé 135° sur un objet de 6px de haut est
invisible.

### 3.8 Montants — `src/components/ui/`

#### AmountText

- **Fichier** : `src/components/ui/AmountText.tsx`
- **Props** : `{ amount: number; signed?: boolean; className?: string }`

Montant FCFA formaté par `formatFcfa`. Avec `signed`, préfixe `+ ` / `- ` et
couleur automatique : `text-success` pour un crédit, `text-danger` pour un débit.

#### AmountDisplay

- **Fichier** : `src/components/ui/AmountDisplay.tsx`
- **Props** : `{ value: string; currency?: string; size?: AmountDisplaySize; colorClass?: string; className?: string }` avec `type AmountDisplaySize = "payment" | "success"`

Grand montant, une seule composition : le nombre porte la graisse et le tracking
négatif, la devise reste calée sur la baseline en corps réduit et en
`text-secondary`. `payment` (défaut) = 36px w700 `tracking-[-2px]` ;
`success` = 32px w700 `tracking-[-1px]`.

> **Refonte.** `success` est descendu de 38px à 32px, et le montant est en
> `text-text` par défaut : un montant confirmé n'a pas à être plus gros que celui
> que l'utilisateur vient de saisir, et le vert/l'ambre servent à coder la nature
> d'un mouvement dans les listes.

### 3.9 Flux — `src/components/ui/`

#### StepProgress

- **Fichier** : `src/components/ui/StepProgress.tsx`
- **Props** : `{ steps: number; current: number }`

N segments h-1 `rounded-full` à parts égales, gap 6px : remplis en `bg-primary`
jusqu'à `current` inclus, `bg-surface-4` ensuite. `role="progressbar"` avec
`aria-label="Étape X sur N"`. Sobriété saluée par l'audit : aucun ornement.

#### TransactionFacts

- **Fichier** : `src/components/ui/TransactionFacts.tsx`
- **Props** : `{ fee: string; delay: string; limit?: string; balanceAfter?: string }`

Bande d'information transactionnelle des écrans de flux : une `<dl>` en 2 ou 3
colonnes (« Frais · Délai · Plafond restant ») séparées par un filet vertical,
plus une ligne « Solde après » qui n'apparaît qu'une fois un montant saisi.
Posée **à plat** sur le fond : ni carte, ni rayon, ni ombre.

> **Refonte.** Composant créé par l'audit (« Densité fintech absente »). Câblé sur
> 6 pages : dépôt et retrait portefeuille, alimentation et retrait carte,
> paiement, création de carte — plus la page Portefeuille. Les valeurs viennent
> des objets `FlowFacts` de `mock-data.ts`, déjà formatées.

#### SuccessScreen

- **Fichier** : `src/components/ui/SuccessScreen.tsx`
- **Props** : `{ icon: LucideIcon; badgeTone: "success" | "warning" | "primary"; title: string; amount: string; currency?: string; subtitle: string; children?: ReactNode; ctaLabel?: string; ctaHref?: string }`

Confirmation de fin de flux, sans navigation, une seule sortie (défauts
`ctaLabel="Retour à l'accueil"`, `ctaHref="/"`). Badge 56px → titre 20px w600 →
`AmountDisplay` `success` → sous-titre borné à 320px → récapitulatif → CTA.

> **Refonte.** Dé-cérémonialisé : badge de 88px à 56px en aplat sans lueur, titre
> repassé en 20px semibold, montant en 32px et en `text-text` (jamais en couleur
> sémantique), bloc ancré en haut au lieu d'être centré sur `min-h-dvh`. Les props
> `badgeGradient` et `amountClass` ont disparu ; `badgeTone` prend le vocabulaire
> sémantique et porte la **nature** de l'opération (entrée d'argent = `success`,
> sortie vers l'extérieur = `warning`, transfert interne = `primary`). Le nouveau
> slot `children` reçoit le récapitulatif d'opération que chaque page compose en
> `<dl>` alignée à gauche (source, frais, délai, nouveau solde, référence, date) :
> c'est ce contenu, pas le vide, qui distingue une confirmation bancaire d'une
> démo.

### 3.10 Chat — `src/components/ui/`

#### ChatBubble

- **Fichier** : `src/components/ui/ChatBubble.tsx`
- **Props** : `{ message: ChatMessage }`

Bulle de conversation. Trois réglages de la maquette sont justes et conservés :
le coin cassé côté interlocuteur (`rounded-bl-sm` / `rounded-br-sm`), l'avatar
ancré **en bas** de la bulle (`items-end`, réglage d'iMessage et WhatsApp), et la
largeur maximale de 261px.

> **Refonte.** L'avatar agent passe du dégradé à 3 arrêts — illisible sur 30px —
> à l'aplat `bg-primary` portant le `FixPayLogo` en `variant="mark"`, et la bulle
> agent cesse d'emprunter la surface de verre des panneaux : `bg-surface-2` sans
> bordure. Une bulle bordée se lit comme une carte réutilisée.

#### ChatInputBar

- **Fichier** : `src/components/ui/ChatInputBar.tsx` — `"use client"`
- **Props** : `{ placeholder?: string; onSend?: (text: string) => void }`

`<form>` fixe de 71px, fond `bg-bg` plein avec filet haut, délibérément **sans**
`backdrop-blur` contrairement à la `BottomNav` : un champ de saisie ne doit pas
laisser transparaître le texte qui défile dessous. En desktop, la piste interne
reprend la largeur de la colonne de conversation (`lg:max-w-[760px] lg:px-10`)
pour que le champ s'aligne exactement dessus.

> **Refonte.** Le bouton d'envoi passe du dégradé à l'aplat `bg-primary` et porte
> enfin son état désactivé tant que le champ est vide.

---

## 4. Conventions générales

Toutes vérifiées dans le code à la rédaction de ce document.

### Imports et classes

- Imports internes via l'alias `@/`.
- Composition de classes par `cn()` (`@/lib/utils`) : `clsx` +
  `extendTailwindMerge`. Seul le groupe `shadow` doit être déclaré à
  tailwind-merge (`surface`, `raised`, `specular`) : les 13 tokens de rayon
  sémantiques ont été remplacés par `xs / sm / md / lg`, que tailwind-merge
  connaît nativement.
- Une seule classe `shadow-*` par élément. Un objet qui a besoin d'une élévation
  **et** d'un liseré spéculaire pose le second sur un `<span>` en calque absolu
  (voir `VirtualCard`, `WalletHeroCard`).
- La variante `light:` est déclarée dans `globals.css` pour les rares
  raffinements propres au thème clair ; aucun composant ne l'utilise aujourd'hui.

### Icônes

- `lucide-react` **uniquement**. Aucun glyphe typographique de navigation : les
  chevrons sont des icônes (`ChevronRight`, `ChevronLeft`, `ChevronDown`), en
  général à 16px avec `strokeWidth={2} absoluteStrokeWidth`.
- `absoluteStrokeWidth` est utilisé partout où l'icône est mise à l'échelle
  (20 occurrences) pour que l'épaisseur du trait ne varie pas avec la taille.
- Une icône décorative porte `aria-hidden`. Les mouvements d'argent utilisent
  `ArrowDownLeft` (entrant) et `ArrowUpRight` (sortant) — les `CloudUpload` /
  `CloudDownload` de la maquette étaient une métaphore de stockage de fichiers,
  indiscernables l'une de l'autre à 14px. La correspondance est centralisée dans
  `src/lib/icons.ts` (`txIconMap`, `notificationIconMap`).

### Montants et dates

- Toujours passer par `@/lib/format` :
  - `formatAmount(n)` → `« 25 000 »` (entier, séparateurs = espace fine
    insécable U+202F).
  - `formatFcfa(n)` → `« 1 866 252 FCFA »`.
  - `formatFee(n)` → `« Gratuit »` ou le montant.
  - `formatSigned(t)` → signe suivi d'un espace ; les décimales sont pilotées par
    la **devise** (EUR à deux décimales, XOF aucune), jamais codées en dur.
  - `maskCardNumber(last4)` → `« •••• 4291 »`.
- **Le franc CFA n'a pas de subdivision** : aucune décimale sur un solde, un
  montant ou un plafond. Toute valeur fractionnaire est arrondie au franc.
- **Une seule règle de date** dans tout le produit, `formatDate(input, now?)` :
  heure seule le jour même (`14:32`), `Hier, 09:15` la veille, `11 avr.` dans
  l'année, `11 avr. 2025` au-delà. Les noms de mois sont écrits en dur plutôt que
  passés par `Intl`, pour que le rendu serveur et le rendu client soient
  identiques quels que soient l'ICU et la locale. Une chaîne non parsable est
  considérée comme déjà formatée et renvoyée telle quelle.
- `now` est injectable : `mock-data.ts` fixe `MOCK_NOW = "2026-04-14T16:20:00"`,
  ce qui rend les libellés relatifs déterministes et empêche les captures de
  documentation de vieillir.
- Les listes de `mock-data.ts` sont **triées par horodatage décroissant** par
  `buildTransactions` / `buildNotifications`, et les pourcentages de répartition
  sont **dérivés** des montants (`spendingBreakdown`), jamais posés à la main.

### Server / Client components

Server par défaut. Seuls **7 fichiers** de `src/components/` sont `"use client"`,
et tous parce qu'ils ont un état, un contexte ou lisent le `pathname` :
`layout/BottomNav`, `layout/Sidebar`, `theme/ThemeProvider`, `theme/ThemeToggle`,
`ui/ChatInputBar`, `ui/SelectField`, `ui/Toggle`.

Les constantes partagées entre serveur et client vivent dans un module neutre
(`src/lib/theme.ts`) : importées depuis le serveur, des constantes déclarées dans
un module `"use client"` deviendraient des références stub.

### Accessibilité

- Un bouton icône sans texte visible porte `aria-label` (`ariaLabel` sur
  `IconButton`) ; avec un `label` visible, c'est lui qui porte le nom accessible.
- `Toggle` : `role="switch"` + `aria-checked` + `aria-label`.
- `SelectableRow` : `aria-pressed`. `BottomNav` / `Sidebar` : `aria-current="page"`.
- `StepProgress` et `ProgressBar` : `role="progressbar"` avec les valeurs ARIA
  et, pour le premier, un `aria-label` « Étape X sur N ».
- Les navigations portent un `aria-label` (`Navigation principale`), le pavé
  numérique un `role="group"`, les squelettes de `ListGroup` un `aria-hidden`.
- Les visuels purement décoratifs (`StatusDot`, `RadioCheck`, puce EMV, marque du
  réseau, cercles de fond) sont `aria-hidden`.
- Les cibles de navigation sont de vrais `<Link>`, jamais des `<div onClick>`.

### Responsive

- Un seul point de rupture : `lg` (1024px). En dessous, colonne mobile de 430px
  centrée + `BottomNav` fixe ; au-dessus, `Sidebar` de 264px et `BottomNav`
  masquée.
- On n'ajoute que des classes préfixées `lg:`, `hover:` ou `focus-visible:` — on
  ne modifie jamais une classe non préfixée (voir RESPONSIVE.md). Les variantes
  `hover:` ne s'appliquent qu'aux appareils pointeurs.
- Gabarit d'une page :
  `px-5 pt-[54px] pb-24 lg:mx-auto lg:w-full lg:max-w-[…] lg:px-10 lg:pt-9 lg:pb-12`.
- Tout élément `fixed` doit reprendre la colonne mobile
  (`fixed inset-x-0 mx-auto w-full max-w-[430px]`) puis se libérer en `lg`
  (`lg:left-[264px]` pour `ChatInputBar`, `lg:static` pour `StickyActionBar`,
  `lg:hidden` pour `BottomNav`).

### Thèmes

- Le thème est porté par `data-theme` sur `<html>`, posé par un script inline
  dans un `<head>` explicite **avant la première peinture**, puis réconcilié par
  `ThemeProvider`. Clé de stockage : `fixpay-theme`.
- Toute nouvelle variable `--c-*` doit être définie **dans les deux blocs**
  (`:root, [data-theme="dark"]` et `[data-theme="light"]`).
- Toute surface `gradient-card*` qui contient autre chose que du `text-white`
  porte `data-theme="dark"` : ses tokens de contenu doivent rester sombres.
- Dans du code maison (SVG, CSS de base), référencer les variables **brutes**
  `--c-*` : `var(--color-*)`, émise par `@theme`, est résolue une fois pour toutes
  sur `:root` et ignore l'épinglage.
- Sur un dégradé épinglé sombre, `text-white` et `white/xx` sont légitimes et
  attendus. Partout ailleurs, pas de couleur en dur.
