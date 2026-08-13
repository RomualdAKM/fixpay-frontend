# FixPay — Adaptation desktop

Le Figma d'origine ne couvre que le mobile (390×780). Ce document définit la
couche desktop ajoutée par-dessus : point de rupture, shell, largeurs de
contenu et grilles.

> **Note de lecture (post-refonte).** Ce document a d'abord été écrit sous une
> règle d'or — « n'ajouter que des classes `lg:`, ne jamais toucher une classe
> non préfixée » — qui garantissait un rendu mobile identique au pixel près à la
> maquette. Cette règle **ne s'applique plus** : l'audit
> [AUDIT_LOOK_IA.md](AUDIT_LOOK_IA.md) a disqualifié la maquette (un import
> automatique de HTML généré) et la refonte a délibérément modifié le mobile.
> Ce qui reste vrai, et qui compte : **le desktop réorganise, il ne redessine
> pas** — mêmes composants, mêmes tokens, seule la composition change.

Les variantes `hover:` et `focus-visible:` restent sans effet sur mobile : en
Tailwind v4 elles ne s'appliquent que sur les appareils pointeurs
(`@media (hover: hover)`).

## Point de rupture

| Largeur | Expérience |
|---|---|
| `< 1024px` (`base` → `md`) | Design mobile d'origine : colonne 430 px centrée, `BottomNav` fixe en bas |
| `≥ 1024px` (`lg`) | Desktop : `Sidebar` fixe de 264 px à gauche, `BottomNav` masquée, contenu en grilles |

Un seul point de rupture, volontairement : il évite les états intermédiaires
bancals et garde le mobile intact jusqu'à la bascule.

## Structure du shell

```
src/app/layout.tsx              → colonne 430px (mobile) ; contrainte levée en lg
src/components/layout/AppShell  → <Sidebar /> + <div class="lg:pl-[264px]">
src/app/(tabs)/layout.tsx       → AppShell   (écrans à navigation)
src/app/(flows)/layout.tsx      → AppShell   (écrans à navigation)
(auth) et (success)             → pas de shell : plein écran, sans navigation
```

`Sidebar` et `BottomNav` déduisent toutes deux l'onglet actif du `pathname`, par
correspondance de préfixe la plus longue. La maquette d'origine mettait parfois
en avant un onglet sans rapport avec la route (l'écran 07 surlignait
« Accueil ») ; la refonte a supprimé cette incohérence et la prop `active`
explicite qui la portait.

## Largeurs de contenu (`lg:`)

| Type d'écran | Largeur max | Écrans |
|---|---|---|
| Tableau de bord (multi-colonnes) | `lg:max-w-[1080px]` | 02, 03, 10, 11, 19 |
| Flux à deux colonnes | `lg:max-w-[880px]` | 06, 07, 08 |
| Flux / formulaires / listes | `lg:max-w-[720px]` | 04, 05, 09, 12–18, 26, 28 |
| Chat | `lg:max-w-[760px]` | 27 |
| Confirmation | `lg:max-w-[560px]` (20 : `720px`) | 20–25 |
| Accueil marketing | `lg:max-w-[1120px]` | 01 |

## Gabarit d'une page

```tsx
<main className="px-5 pt-[54px] pb-24 lg:mx-auto lg:w-full lg:max-w-[1080px] lg:px-10 lg:pt-9 lg:pb-12">
```

- `lg:mx-auto lg:w-full` : centre la colonne dans la zone à droite de la sidebar.
- `lg:px-10` : gouttières desktop (40 px) au lieu de 20 px.
- `lg:pt-9` : plus besoin de la marge « barre de statut » du mobile.
- `lg:pb-12` : plus de `BottomNav` à dégager (le `pb-24` mobile reste).

## Grilles desktop

Les composants gardent leurs dimensions d'origine (hauteurs de cartes, rayons,
typographie) : le desktop **réorganise**, il ne redessine pas. Colonnes visées
entre 420 et 520 px pour que les composants conservent leurs proportions.

- **02 Accueil** — colonne A : hero portefeuille + panneau carte ; colonne B : historique.
- **03 Portefeuille** — colonne A : hero + carte liée ; colonne B : mouvements.
- **10 Détail carte** — colonne A : visuel carte + actions ; colonne B : infos + transactions.
- **11 Statistiques** — tuiles en `lg:grid-cols-4`, répartition en pleine largeur.
- **19 Profil** — colonne A : identité + stats ; colonne B : cartes + compte.
- **06/07/08** — colonne A : saisie (montant, chips, pavé) ; colonne B : cible + info + CTA.
- **01 Onboarding** — hero deux colonnes : discours à gauche, pile de cartes à droite.
- Listes et formulaires simples : colonne unique centrée, rien à réorganiser.

Les CTA pleine largeur du mobile deviennent des boutons de largeur naturelle en
desktop quand ils terminent une colonne (`lg:w-auto lg:self-start` / `lg:px-8`).

## Interactions desktop

Le mobile n'a pas de survol ; le desktop en attend. Les composants partagés
portent `hover:` (fond, opacité ou bordure) et `focus-visible:` pour la
navigation au clavier. Aucune de ces variantes n'affecte le rendu mobile.
