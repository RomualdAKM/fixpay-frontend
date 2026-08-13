# FixPay — Thèmes clair et sombre

Le Figma d'origine est **sombre uniquement**. Le thème clair est une couche
ajoutée par-dessus, conçue (pas inversée mécaniquement), et le thème sombre
reste identique au pixel à ce qui a été validé écran par écran.

## Mécanique

```
src/lib/theme.ts                     → THEME_STORAGE_KEY, type Theme (module neutre)
src/app/layout.tsx                   → script inline dans <head> (avant peinture) + ThemeProvider
src/components/theme/ThemeProvider.tsx → état, persistance, suivi du réglage système
src/components/theme/ThemeToggle.tsx   → bouton (Soleil en sombre, Lune en clair)
src/app/globals.css                  → @theme inline + palettes [data-theme]
```

1. **Avant la première peinture**, un script inline dans `<head>` lit
   `localStorage["fixpay-theme"]`, retombe sur `prefers-color-scheme`, et pose
   `data-theme` sur `<html>` → aucun flash du mauvais thème.
   - Le script est déclaré dans un `<head>` explicite : sinon React le remonte
     au moment de l'hydratation, l'hydratation échoue (#418), React reconstruit
     `<html>` et l'attribut est perdu. `next/script beforeInteractive` a été
     écarté : il diffère l'exécution après la première peinture.
   - La clé de stockage vit dans `src/lib/theme.ts`, **pas** dans le module
     `"use client"` : importée depuis le serveur, une constante de module client
     devient une référence stub et corrompt le script inliné.
2. `ThemeProvider` réconcilie l'état React après montage, réécrit l'attribut par
   sécurité, et suit le réglage système tant que l'utilisateur n'a pas choisi.
3. `globals.css` mappe chaque token Tailwind sur une variable CSS via
   `@theme inline` — les utilitaires émettent `var(--c-*)`, donc tout suit le
   thème à l'exécution, sans recompilation ni classe conditionnelle.

## Zones épinglées en sombre

Les surfaces à **dégradé bleu** font partie de l'identité : une carte bancaire
FixPay est bleu nuit dans les deux thèmes. Comme les variables CSS héritent,
il suffit de poser `data-theme="dark"` sur le conteneur du dégradé : tout son
contenu résout alors la palette sombre, y compris les composants partagés qui
consomment des tokens (Badge, IconButton, SectionLabel…).

| Zone épinglée | Fichier |
|---|---|
| Carte bancaire (3 variantes) | `components/ui/VirtualCard.tsx` |
| Hero portefeuille | `components/ui/WalletHeroCard.tsx` |
| Heros secondaires (KYC, parrainage, fidélité, support) | `components/ui/HeroGradientCard.tsx` |
| Hero du profil | `app/(tabs)/profile/page.tsx` |

> Règle : tout nouveau conteneur `gradient-card*` / `gradient-onboarding` qui
> contient autre chose que du `text-white` doit porter `data-theme="dark"`.

> **Aucune VUE n'est épinglée.** L'écran 01 (Onboarding) l'a été jusqu'à
> l'étape 12 : sa capture en thème clair était rigoureusement identique à celle
> du sombre, ce qui se lisait comme un trou dans le système et non comme un
> parti pris. L'argument invoqué — « pré-auth, aucune préférence connue » — ne
> tient pas : le script d'amorçage retombe sur `prefers-color-scheme` tant
> qu'aucun choix n'est stocké, donc une préférence est toujours connue, et
> l'avant-authentification est précisément le seul moment où elle ne peut venir
> que du système. L'épinglage ne concerne que des SURFACES (une carte bancaire
> reste bleu nuit dans les deux thèmes), jamais une page entière.

### Les couleurs suivent l'épinglage, les ombres suivent l'application

Les tokens d'ombre `--s-*` sont déclarés **uniquement sur la racine** (`:root` et
`[data-theme="light"]`), jamais dans le bloc épinglé. Sans cela, un hero épinglé
sombre traînerait sur une page claire son ombre sombre de 60 px : un halo gris
sale sous la carte, débordant sur le libellé de section suivant et sur le haut
de la carte blanche d'en dessous (l'ombre d'un élément `relative` se peint
au-dessus de ses frères). Une zone épinglée est sombre *à l'intérieur*, mais elle
repose sur une page claire : son ombre doit être celle du thème de l'application.

### Attention aux couleurs posées en SVG

Dans un SVG, `fill="var(--c-text)"` fonctionne (l'attribut de présentation
résout la variable héritée du sous-arbre épinglé), mais `var(--color-text)` —
la variable émise par `@theme` — est résolue une fois pour toutes sur `:root` et
**ignore l'épinglage**. Dans tout code maison (SVG, CSS de base), référencer les
variables brutes `--c-*`.

## Palette claire — intentions

| Élément | Sombre | Clair | Pourquoi |
|---|---|---|---|
| Fond | `#070c1a` | `#eef1f8` | bleuté, pour que les cartes blanches ressortent |
| Cartes (`--c-surface`) | blanc @5 % | `#ffffff` opaque | le verre translucide n'a pas de sens sur fond clair |
| Tuiles / boutons verre | blanc @9-18 % | noir @5-13 % | même hiérarchie d'élévation, inversée |
| Texte | `#eef2ff` | `#0e1830` | ~15:1 |
| Texte atténué | bleu @38 % | bleu @72 % | l'alpha faible devient illisible sur clair (viser 4.5:1) |
| Primaire | `#3b82f6` | `#2563eb` | assombri pour les liens et petits libellés (4.7:1) |
| Succès / danger / alerte | `#22c55e` / `#ef4444` / `#f59e0b` | `#15803d` / `#dc2626` / `#b45309` | les tons vifs passent sous 3:1 sur blanc |
| Dégradés (CTA, cartes, badges) | inchangés | inchangés | ce sont eux qui portent la marque |
| Ombres colorées | longues et profondes | plus courtes, plus douces | une longue ombre sombre salit un fond clair |

`--s-card-light` est nul en sombre et vaut une ombre d'1 px en clair : il donne
un léger relief aux cartes blanches sans toucher au rendu sombre.

## Règles de contribution

- **Ne jamais modifier** le bloc `:root, [data-theme="dark"]` : le sombre est
  verrouillé (vérifié par comparaison pixel des 28 écrans).
- Un correctif propre au clair passe par le bloc `[data-theme="light"]` ou par
  la variante `light:` (déclarée dans `globals.css`).
- Toute nouvelle variable `--c-*` doit être définie **dans les deux** blocs.
- Pas de couleur en dur : sauf sur un dégradé épinglé sombre, où `text-white` et
  `white/xx` sont légitimes et attendus.

## Vérification

```bash
# outils dans le scratchpad de session : qa-tools/
MODE=mobile  THEME=dark  node shoot3.js   # capture 28 écrans
MODE=mobile  THEME=light node shoot3.js
MODE=desktop THEME=light node shoot3.js
node diff.js                              # sombre mobile vs référence : doit être à 0 px
```

Le script vérifie aussi que `data-theme` appliqué correspond au thème demandé et
qu'aucun écran ne déborde horizontalement. Un `backdrop-blur` peut produire une
dizaine de pixels de différence non déterministe (GPU) : recapturer avant de
conclure à une régression.
