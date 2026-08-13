# FixPay — Audit « ça sent le design généré »

> Audit mené par 5 directeurs artistiques indépendants sur les 28 écrans (captures réelles + code + tokens), puis synthétisé. Note moyenne : **7.6/10** (0 = indiscernable d'un produit de studio, 10 = manifestement généré).

## Origine du problème

La maquette Figma d'origine porte le nom de calque `fixpay_figma_v3.html by html.to.design` : elle a été produite par conversion automatique d'une page HTML elle-même générée. L'implémentation a reproduit cette maquette au pixel près, comme demandé. **Les marqueurs listés ici sont donc hérités du design source, pas introduits par le code.** Les corriger implique de diverger volontairement du Figma.

### Preuves mesurables sur le fichier source

| Indicateur | Mesuré | Design system conçu |
|---|---|---|
| Tailles de police distinctes | **26** (dont 9,5 / 10,5 / 11,5 / 12,5 / 13,5 px) | 6 à 8 |
| Rayons distincts | **32** | 4 à 6 |
| Couleurs distinctes | 58 | 20-30 avec rôles |

Les demi-pixels trahissent une conversion rem→px automatique. La palette est celle de Tailwind **sans retouche** : `#3b82f6` = blue-500 (101 occurrences), `#60a5fa` = blue-400, `#22c55e` = green-500, `#ef4444` = red-500, `#f59e0b` = amber-500, `#f87171` = red-400, `#fcd34d` = amber-300.

## Marqueurs systémiques

### [DÉCISIF] Les ombres colorées et les halos radiaux — le marqueur n°1, lisible avant même le contenu

Le système déclare 8 ombres, toutes colorées, par décision écrite dans le fichier (globals.css L93 : « Signature colored shadows — never plain black »). La plus utilisée est --s-card-hero: 0 20px 60px rgb(11 28 107 / 0.55) — 60px de flou sous un objet de 145 à 168px — et --s-glow-cta: 0 8px 28px rgb(36 87 197 / 0.42) sous un bouton de 50px. S'y ajoutent deux halos radiaux plein écran (glow-radial-blue 320px, glow-radial-deep 260px). Aucune de ces lueurs ne correspond à une source de lumière de la scène. Aucun produit de la catégorie (Revolut, Wise, Monzo, N26) n'en pose une seule : ils utilisent 1 à 8px, neutre, ou rien.

**Étendue :** 28/28 — shadow-glow-cta est câblé dans Button.tsx variant primary (donc tout écran portant un CTA), shadow-card-hero sur 4 fichiers (VirtualCard, WalletHeroCard et leurs pages), glow-badge/glow-success sur les 6 écrans de succès, mini-visa/mini-mc sur les vignettes de carte, glow-radial sur l'onboarding

**Correctif système :** Supprimer les 6 tokens colorés --shadow-glow-cta / --shadow-card-hero / --shadow-glow-badge / --shadow-glow-success / --shadow-mini-visa / --shadow-mini-mc (globals.css L94-99) et leurs sources --s-* (L176-181), plus les @utility glow-radial-blue et glow-radial-deep (L304-319). Les remplacer par 3 tokens neutres et un seul rôle chacun : --shadow-1: 0 1px 2px rgb(0 0 0 / 0.30) ; --shadow-2: 0 8px 16px rgb(0 0 0 / 0.24) ; --shadow-specular: inset 0 1px 0 rgb(255 255 255 / 0.10), le seul autorisé en dark sur les surfaces à dégradé. En light, --shadow-1/--shadow-2 deviennent rgb(15 23 42 / 0.06). Bilan : de 8 ombres colorées à 0.

### [DÉCISIF] Zéro chiffre tabulaire dans une app financière

Aucune déclaration font-variant-numeric nulle part dans src/. Les colonnes de montants ne s'alignent pas, les montants de droite dansent d'une ligne à l'autre dans les listes, et sur l'écran Paiement le montant saisi est centré : à chaque frappe la largeur des glyphes proportionnels change ET le bloc se recentre, donc tous les chiffres déjà saisis se déplacent latéralement. C'est le détail typographique n°1 qui sépare un produit financier d'une maquette, et il coûte une ligne de CSS.

**Étendue :** 10 écrans portant des montants (Accueil, Portefeuille, Cartes, Détail carte, 04→08, Statistiques, les 6 succès) via AmountText, AmountDisplay, BalanceCard, WalletHeroCard, StatTile, TransactionItem

**Correctif système :** Ajouter dans globals.css un utilitaire unique @utility num { font-variant-numeric: tabular-nums; font-feature-settings: 'ss01'; } et l'appliquer dans les 6 composants qui rendent un chiffre (AmountText, AmountDisplay, BalanceCard, WalletHeroCard, StatTile, TransactionItem). Option plus radicale et défendable : poser font-variant-numeric: tabular-nums directement sur body (globals.css L322) — DM Sans le supporte — et ne l'annuler nulle part. 1 déclaration, 10 écrans corrigés.

### [DÉCISIF] Quatorze rayons : un inventaire d'import, pas une échelle

globals.css L77 assume textuellement le recensement : « census: 2,4,8,10,11,12,13,14,16,18,20,22,28,44 », matérialisé par 13 tokens sémantiques (--radius-seg, -bar, -eye, -iconbtn, -tile-sm, -tile, -tile-lg, -field, -card, -panel, -pill, -hero, -badge, -device). Conséquence directe : sur l'Accueil, l'objet identitaire (hero à dégradé, 22px) et un simple panneau neutre (GlassCard, 22px) partagent le même rayon — le rayon ne code plus aucune hiérarchie — pendant qu'un CTA de 50px porte 18px et une tuile 38px porte 12px. Six rayons cohabitent sur presque chaque écran, dont des valeurs ad hoc (rounded-[9px]) en plus des tokens.

**Étendue :** 28/28 — rounded-field sur 8 fichiers, rounded-tile sur 7, rounded-hero et rounded-pill sur 6, rounded-card sur 6, rounded-panel et rounded-iconbtn sur 5

**Correctif système :** Remplacer les 13 tokens par 4, avec un rôle explicite : --radius-xs: 4px (micro : puce, badge, drapeau, segment) ; --radius-sm: 8px (contrôles : boutons, champs, tuiles, œil) ; --radius-md: 12px (lignes et conteneurs de liste) ; --radius-lg: 16px (surfaces : hero, cartes, panneaux, bandeaux) ; plus rounded-full réservé aux chips et pastilles radio. Table de remap mécanique : 2/4→4 ; 8/10/11/12/13→8 ; 14/16→12 ou 16 selon le rôle (champ→8, conteneur→12, surface→16) ; 18/20/22/28→16 ; 20 des chips→full ; 44 (device mock) hors système. Bilan : de 14 valeurs à 4.

### [DÉCISIF] Le dégradé 135° comme peinture universelle

Le fichier définit 10 utilitaires de dégradé. gradient-brand (135°, #1a3da8→#3b82f6) est appliqué au CTA primaire, à la ProgressBar, aux GradientIconBadge, aux ChatBubble, à la ChatInputBar, à la Sidebar et au logo — 7 composants, donc partout. Sur l'onboarding, cinq dégradés se superposent sur un seul écran (fond, carte, CTA, puce, logo). Un dégradé qui recouvre tout ne signifie plus rien : la carte virtuelle, seul objet qui mérite d'être identitaire, ne se distingue plus du bouton d'à côté.

**Étendue :** 28/28 via Button primary ; gradient-brand présent dans 7 composants partagés, gradient-card dans 7 fichiers, 3 gradients de badge sur les 6 écrans de succès

**Correctif système :** Supprimer @utility gradient-brand, gradient-badge-green, gradient-badge-amber, gradient-badge-bluegreen, gradient-chip-gold et gradient-onboarding (globals.css L257-260, L283-303). Ne garder que gradient-card (et gradient-card-mc) et l'autoriser sur deux composants seulement : VirtualCard et WalletHeroCard. Button variant primary passe en aplat bg-primary ; GradientIconBadge devient un disque teinté var(--c-success-tint) + glyphe var(--c-success) ; le fond d'onboarding devient #070c1a plat. Bilan : de 10 dégradés à 2, et de ~7 composants dégradés à 2.

### [DÉCISIF] La tuile d'icône devant absolument chaque ligne

IconTile est le motif structurant de toutes les listes : tuile carrée teintée 36-42px, rayon 11/12/13px, devant chaque rangée — y compris quand trois lignes sur quatre portent le même glyphe (CloudUpload/CloudDownload), quand deux moyens de paiement affichent le même CreditCard générique différencié par 2% d'opacité de fond, ou quand la tuile est carrément vide (FlagSquare : 36×36 rayon 10px, fond rgb(59 130 246 / 0.10), aucun contenu, ×6 lignes sur deux écrans). Une colonne de carrés gris identiques sur 260px de hauteur n'informe personne ; elle signe le gabarit.

**Étendue :** 15 pages sur 28, directement ou via ListItem / TransactionItem / SelectableRow

**Correctif système :** Rendre le slot leading OPTIONNEL et désactivé par défaut dans les 3 composants de liste partagés (TransactionItem, ListItem, SelectableRow) : plus de tuile sans décision explicite. Réserver IconTile aux entrées de menu (Profil, Support) où le glyphe est unique par ligne. Pour les mouvements d'argent, remplacer le tile par une pastille ronde 28px et deux glyphes opposés lisibles à 14px (ArrowDownLeft entrant / ArrowUpRight sortant) au lieu de CloudUpload/CloudDownload. Supprimer les deux définitions dupliquées de FlagSquare (deposit/page.tsx et withdraw/page.tsx) au profit d'un vrai drapeau 24×18 rayon 2px, ou de l'indicatif en DM Mono.

### [DÉCISIF] Les cercles blancs flous débordant de chaque surface à dégradé

DecorativeCircles pose des blobs blancs (blanc@0.07 et blanc@0.04) débordant des cartes : 210px sur une face de carte de 276×168 (soit 125% de sa largeur), 200px sur un hero de 350×220 (57% de la largeur, 91% de la hauteur). Dans les captures, leur arc coupe visiblement le filigrane et le bord des boutons. C'est, avec le glow, la signature visuelle la plus immédiatement reconnaissable d'un rendu généré.

**Étendue :** 5 fichiers (VirtualCard, WalletHeroCard et les heroes KYC/Parrainage/Fidélité) — soit toutes les surfaces à dégradé du produit

**Correctif système :** Supprimer le composant components/ui/DecorativeCircles.tsx et ses 5 usages. Remplacer par --shadow-specular (inset 0 1px 0 rgb(255 255 255 / 0.10)) en haut de chaque surface à dégradé : la surface reste vivante, sans blob. Supprimer aussi la pile de 3 cartes inclinées de l'onboarding (VirtualCard.tsx L156-170, rotate 4° et 8° + opacity 0.30/0.55) : une seule carte, rotation 0°, en débord de cadre à droite.

### [IMPORTANT] Tout est enfermé dans une carte, et les cartes s'imbriquent

GlassCard apparaît dans 16 fichiers. Sur l'Accueil, deux blocs de rayon 22px identiques s'empilent à 12px d'écart, sans hiérarchie d'élévation. Sur le Portefeuille, quatre niveaux s'imbriquent pour dire le mot « Dépôt » : hero 22px → bouton 16px → tuile d'icône 11px → glyphe 18px, avec une ombre NOIRE de 20px posée à l'intérieur d'une surface qui porte déjà une ombre bleue de 60px. Sur les écrans 04/05, six pays deviennent six cartes flottantes — 12 bordures dessinées pour une seule liste.

**Étendue :** 16 fichiers utilisent GlassCard ; l'imbrication surface-dans-surface est visible sur au moins 8 écrans (02, 03, 04, 05, 06, 07, 09, profil)

**Correctif système :** Poser une règle de profondeur dans le système : maximum UN niveau de surface. Faire de ListGroup le composant par défaut des listes (un seul conteneur --radius-md, bordure var(--c-border), lignes h52 séparées par des hairlines internes rgb(255 255 255 / 0.06), aucun rayon ni bordure par ligne) et interdire à GlassCard de contenir une autre surface. Interdire par convention toute ombre à l'intérieur d'un hero (supprimer le shadow-[0_4px_20px_rgb(0_0_0/0.15)] ad hoc de wallet/page.tsx L56) : sur #1a3da8, un aplat blanc se détache à plus de 8:1, l'ombre ne fait que salir le dégradé.

### [IMPORTANT] Le micro-label majuscule espacé, répété partout et sous le seuil AA

SectionLabel (10px, w600, uppercase, tracking 0.1em, couleur --c-text-muted) est présent dans 20 fichiers sur 28, jusqu'à quatre occurrences sur un même écran (« MON PORTEFEUILLE FIXPAY », « MA CARTE PRINCIPALE », « SOLDE CARTE », « SOLDE DISPONIBLE »), souvent redondantes avec l'élément qu'elles annoncent. Et rgb(148 172 255 / 0.38) sur #070c1a donne un contraste d'environ 2.4:1, sous le seuil AA : le tic esthétique est aussi un défaut d'accessibilité.

**Étendue :** 20 fichiers sur 28

**Correctif système :** Réécrire SectionLabel une fois : 13px, sentence case, w500, couleur var(--c-text-secondary), tracking 0. Supprimer le token --tracking-label (globals.css L104) pour rendre le retour en arrière impossible. Remonter --c-text-muted de rgb(148 172 255 / 0.38) à rgb(160 182 255 / 0.62) (≈4.6:1) et réserver les majuscules espacées à UN seul rôle dans tout le produit (les en-têtes de section du Profil). Supprimer au passage les labels redondants avec le logo ou avec l'étape en cours.

### [IMPORTANT] Palette Tailwind par défaut : cinq valeurs exactes, non retouchées

#3b82f6 = blue-500, #22c55e = green-500, #ef4444 = red-500, #f59e0b = amber-500, #f97316 = orange-500. Toute l'identité repose sur une seule teinte bleue déclinée en opacités (blanc@0.05/0.09/0.12/0.14/0.18, bleu@0.07/0.10/0.12/0.20). Un œil entraîné reconnaît blue-500 instantanément : c'est la couleur par défaut de tout ce qui n'a pas été choisi. Aggravant : les couleurs sémantiques servent de code couleur d'écran (InfoBanner vert « success » sur 06 pour un texte purement informatif, ambre « warning » sur 07 pour un texte tout aussi neutre) — un utilisateur qui voit du vert avant d'avoir agi n'apprend plus rien du vert.

**Étendue :** 28/28 pour la teinte primaire ; le détournement sémantique des tons est visible sur 06, 07 et les 6 écrans de succès

**Correctif système :** Décaler les 5 valeurs par défaut dans le bloc :root (globals.css L126-139) : --c-primary #3b82f6 → #2F5BE8 (bleu légèrement violacé, hors palette Tailwind), --c-success #22c55e → #30A46C, --c-danger #ef4444 → #E5484D, --c-warning #f59e0b → #E79D13, et construire les tints par dérivation de ces bases plutôt qu'en réinscrivant des rgb() en dur (les 12 tokens --c-*-surface/tint/border L153-163 suivent alors automatiquement). Côté composant : InfoBanner passe à tone="neutral" par défaut (fond blanc@0.04, bordure var(--c-border), icône var(--c-icon-muted)) et les tons success/warning ne sont plus admis que sur un fait accompli ou un avertissement réel.

### [IMPORTANT] Données fabriquées, pas observées : ce qu'aucune relecture humaine ne laisse passer

Des décimales sur un solde en FCFA (« 1 866 252.50 », alors que le franc CFA n'a aucune subdivision — et le même solde s'affiche sans décimales sur l'écran précédent). Une liste « Mouvements récents » dans le désordre (10 Avr, 11 Avr, 8 Avr, 5 Avr). Des montants rapides à 3 280 / 9 839 / 19 679 / 49 197 FCFA — soit 5, 15, 30 et 75 € convertis au taux fixe 655,957 : l'aveu d'un gabarit européen localisé mécaniquement. Une touche décimale « . » sur un pavé FCFA. Un état RadioCheck « ghost-check » qui affiche une coche sur les 6 lignes NON sélectionnées de deux écrans de transfert d'argent, figé par un commentaire (« do not fix it »). Trois conventions de date différentes dans la même app.

**Étendue :** Au moins 8 écrans : 02, 03 (dates + décimales), 04, 05 (ghost-check ×4 listes), 06, 07 (aucun frais/plafond/délai), 08 (chips convertis + touche décimale), 10

**Correctif système :** Centraliser dans lib/format.ts : formatFcfa n'accepte plus de décimales pour XOF (les décimales deviennent conditionnées à la devise, jamais codées en dur — supprimer la prop decimals de WalletHeroCard) ; une seule fonction formatDate avec une règle unique dans tout le produit (heure seule sur 24h, « Hier, 09:15 » sur 48h, puis « 11 avr. » minuscule avec point abréviatif, année si différente). Dans lib/mock-data.ts : trier tous les tableaux par timestamp décroissant, et remplacer payment: [3_280, 9_839, 19_679, 49_197] par [1_000, 2_000, 5_000, 10_000]. Supprimer l'état 'ghost-check' du type de RadioCheck.tsx et de SelectableRow.tsx : non sélectionné = cercle vide, point.

### [IMPORTANT] Densité fintech absente : des écrans à 5 blocs pour 2 informations

Aucun frais, aucun plafond, aucun délai, aucun solde après opération, aucun montant minimum sur les écrans de transfert (06, 07) ; aucun état vide, chargement ou erreur nulle part dans src/ ; aucun filtre, tri ni groupement sur les listes ; ~250px de vide sous « Togo » sur 04/05, la moitié basse vide sur 07, les deux tiers inférieurs vides en desktop sur 06. Symétriquement, le CTA de 06 passe sous la BottomNav et celui de 08 est hors du premier viewport — les deux assumés en commentaire comme « voulu par le design », alors que c'est un débordement de frame. C'est ce bloc d'information transactionnelle, plus que le style, qui sépare une app fintech d'une maquette.

**Étendue :** Les 5 écrans de flux (04→08) pour la densité et les frais ; toutes les listes pour les états vide/chargement/erreur ; 06 et 08 pour le CTA masqué

**Correctif système :** Deux composants partagés à créer, qui règlent le problème sur tous les flux d'un coup : (1) TransactionFacts — bande à plat, sans carte, séparée par des filets verticaux var(--c-border) : « Frais · Délai · Plafond restant », et une ligne « Solde après » qui apparaît dès la saisie ; (2) StickyActionBar — le CTA principal épinglé au-dessus de la BottomNav (fond var(--c-bg), hairline var(--c-border) en haut, padding 12/20px), qui remplace le CTA en flux sur les 5 écrans de flux et rend structurellement impossible un bouton d'action masqué. Ajouter les slots empty / loading / error à ListGroup, une fois, pour les 8 listes du produit.

### [FINITION] Une nav qui se contredit d'un écran frère à l'autre

L'écran 07 pose BottomNav active="home" alors que l'écran 06, opération jumelle sur la même carte, pose active="wallet" — assumé en commentaire (« fidèle au design »). Une incohérence de navigation entre deux écrans frères est la trace la plus nette d'écrans produits indépendamment les uns des autres, jamais parcourus comme un produit.

**Étendue :** Les 19 écrans de flux qui déclarent un onglet actif explicite

**Correctif système :** Dériver l'onglet actif de la route dans BottomNav.tsx (usePathname → segment racine : /wallet/* → wallet, /cards/* → cards, /profile/* → profile) et supprimer la prop active de tous les appels, sauf exception documentée. La convention « BottomNav active explicite » notée dans le design system devient alors une exception, plus la règle.

## Fréquence par catégorie

| Cat. | Marqueur | Écrans touchés | Occurrences | Dont impact fort |
|---|---|---|---|---|
| N | Détails absents (états, frais, filtres) | 28/28 | 68 | 43 |
| J | Typographie sans contraste | 23/28 | 24 | 5 |
| L | Densité irréaliste | 22/28 | 23 | 9 |
| K | Composition symétrique et molle | 17/28 | 19 | 3 |
| A | Halos et lueurs colorées | 16/28 | 18 | 14 |
| B | Arrondis excessifs et uniformes | 12/28 | 13 | 0 |
| F | Tout-en-carte | 12/28 | 12 | 3 |
| G | Tuile d'icône systématique | 12/28 | 14 | 8 |
| C | Dégradés décoratifs | 11/28 | 12 | 6 |
| I | Palette monochrome / Tailwind par défaut | 10/28 | 11 | 4 |
| D | Blobs décoratifs | 9/28 | 9 | 9 |
| H | Écran de succès « moment magique » | 6/28 | 6 | 6 |
| M | Faux réalisme 3D | 2/28 | 3 | 1 |
| E | Glassmorphisme systématique | 2/28 | 2 | 0 |

## Plan de correction

| # | Effort | Action | Effet attendu |
|---|---|---|---|
| 1 | faible | Ombres : supprimer les 6 tokens colorés (globals.css L94-99) et leurs sources --s-* (L176-181), supprimer les @utility glow-radial-blue / glow-radial-deep (L304-319), créer --shadow-1 / --shadow-2 / --shadow-specular. Nettoyer les 9 usages : Button.tsx (retirer shadow-glow-cta de variant primary), VirtualCard, WalletHeroCard, GradientIconBadge, SuccessScreen, onboarding/page.tsx (retirer les deux <span> de halo), wallet/page.tsx L56 (retirer le shadow ad hoc noir). | C'est le changement qui fait le plus de chemin par ligne modifiée. Les lueurs bleues sont ce que l'œil voit en premier sur chaque capture ; une fois parties, les mêmes écrans se lisent comme du produit. À lui seul il fait tomber le lot de ~8/10 à ~6/10. |
| 2 | faible | Chiffres : ajouter @utility num { font-variant-numeric: tabular-nums; font-feature-settings: 'ss01'; } et l'appliquer dans AmountText, AmountDisplay, BalanceCard, WalletHeroCard, StatTile, TransactionItem (ou poser tabular-nums sur body). | Six fichiers, une déclaration. Les colonnes de montants s'alignent, le montant du pavé numérique cesse de danser à la frappe. C'est le signe le plus court qu'un designer financier a regardé l'écran. |
| 3 | faible | Supprimer components/ui/DecorativeCircles.tsx et ses 5 imports ; supprimer les deux couches fantômes de la pile de cartes 3D (VirtualCard.tsx L156-170) ; poser --shadow-specular en haut des surfaces à dégradé. | Élimine les deux signatures visuelles les plus reconnaissables du rendu génératif. Les surfaces à dégradé deviennent des objets propres au lieu de fonds d'écran décorés. |
| 4 | faible | Aplatir les dégradés : supprimer gradient-brand, gradient-badge-green/amber/bluegreen, gradient-chip-gold, gradient-onboarding. Button primary → aplat bg-primary rayon 12 ; GradientIconBadge → disque teinté + glyphe plein ; ProgressBar, ChatBubble, ChatInputBar, Sidebar, FixPayLogo → aplat. gradient-card reste, et seulement sur VirtualCard et WalletHeroCard. | Le dégradé redevient un signe rare, donc un signe. La carte virtuelle reprend son statut d'objet identitaire au lieu d'être un bouton parmi d'autres. Effet immédiat sur les 28 écrans via Button. |
| 5 | faible | Corriger les mensonges de données : supprimer l'état 'ghost-check' du type de RadioCheck.tsx et de SelectableRow.tsx (4 appels à basculer sur 'empty') ; supprimer la prop decimals de WalletHeroCard et de mock-data ; trier walletMovements par timestamp décroissant ; remplacer payment: [3_280, 9_839, 19_679, 49_197] par [1_000, 2_000, 5_000, 10_000] ; retirer la touche « . » du Numpad et la logique décimale, la remplacer par « 000 ». | Ce sont les fautes qu'un relecteur humain repère en trois secondes et qui disqualifient tout le reste : six pays cochés sur un écran de retrait, un solde FCFA à virgule, une liste « récente » dans le désordre. Coût quasi nul, crédibilité restaurée. |
| 6 | moyen | Rayons : remplacer les 13 tokens de globals.css L78-91 par --radius-xs 4 / --radius-sm 8 / --radius-md 12 / --radius-lg 16, puis remapper mécaniquement les classes rounded-* dans src/ (rounded-eye, -iconbtn, -tile-sm, -tile, -tile-lg → sm ; -field → sm ou md selon le rôle ; -card, -panel, -hero, -badge → lg ; -pill → rounded-full) et éliminer les valeurs ad hoc rounded-[9px] / rounded-[5px]. | Le rayon recommence à coder quelque chose : contrôle, ligne, surface. Fin de l'effet « tout a la même douceur » où un panneau neutre et l'objet identitaire partagent 22px. C'est mécanique mais ça touche presque tous les fichiers, d'où l'effort moyen. |
| 7 | moyen | Dé-tuiler les listes : rendre le slot leading optionnel et off par défaut dans TransactionItem, ListItem, SelectableRow ; remplacer CloudUpload/CloudDownload par ArrowDownLeft/ArrowUpRight ; supprimer les deux FlagSquare vides dupliqués (drapeau réel 24×18 ou indicatif en DM Mono) ; remplacer les CreditCard génériques des sélecteurs par la marque réelle ou une vignette de carte. | Les listes cessent d'être des colonnes de carrés gris identiques. C'est le second marqueur le plus visible après le glow, et il libère de la densité pour l'étape 9. |
| 8 | moyen | Labels et surfaces : réécrire SectionLabel (13px, sentence case, w500, --c-text-secondary), supprimer --tracking-label, remonter --c-text-muted à ≈4.6:1, supprimer les labels redondants ; faire de ListGroup le conteneur de liste par défaut (un conteneur, hairlines internes, plus de carte par ligne) sur 04, 05 et les listes de profil. | Supprime le tic « micro-label majuscule espacé » présent sur 20 fichiers, corrige un défaut AA au passage, et divise par six le bruit de contour des listes de sélection. L'interface arrête de mettre des boîtes partout. |
| 9 | moyen | Créer TransactionFacts (frais · délai · plafond restant · solde après, à plat, sans carte) et StickyActionBar (CTA épinglé au-dessus de la BottomNav) et les câbler sur les 5 écrans de flux (04→08) ; ajouter les slots empty/loading/error à ListGroup ; dériver l'onglet actif de la route dans BottomNav. | Comble le vide (250px sur 04/05, la moitié basse de 07, les deux tiers du desktop de 06) avec la seule chose qui manque vraiment : de l'information transactionnelle. Rend structurellement impossible un CTA masqué. C'est ce qui fait passer les écrans de « jolis » à « conçus par quelqu'un qui connaît le métier ». |
| 10 | moyen | Retuner la palette : décaler --c-primary vers #2F5BE8, --c-success vers #30A46C, --c-danger vers #E5484D, --c-warning vers #E79D13 dans :root et [data-theme="light"], dériver les 12 tokens de tint plutôt que de les réinscrire en rgb() ; passer InfoBanner en tone neutre par défaut et n'autoriser success/warning que sur un fait réel. | Enlève la dernière empreinte reconnaissable de la génération (blue-500 / green-500 / red-500 exacts) et rend leur valeur d'alerte aux couleurs sémantiques. Effet réel mais moins immédiat que les étapes 1 à 5 : à faire une fois la structure assainie, sinon on repeint un problème de forme. |
| 11 | élevé | Reprendre la composition écran par écran : onboarding aligné à gauche avec carte en débord (au lieu du tout-centré), hero du Portefeuille de 220px à 150px avec une seule action primaire, ordre du DOM de l'écran Paiement (bénéficiaire → montant → pavé collé au montant → moyen de paiement → CTA épinglé), différenciation réelle du Retrait par rapport au Dépôt (solde retirable, plafond, frais), copies à réécrire (« Dépôt — Recharger le portefeuille », « Retrait — Vider le portefeuille »). | C'est ici qu'on gagne les deux derniers points, mais c'est du travail de composition écran par écran, pas de système. À ne lancer qu'après les 10 premières étapes : sur des écrans déjà nettoyés, la moitié de ces arbitrages se prend en cinq minutes ; sur les écrans actuels, on redessine sous une couche de glow. |

## À conserver absolument

- La liste de transactions à plat sur le fond, séparée par des hairlines blanc@0.08 sur des rangées de 65px : c'est le seul endroit du produit où l'interface arrête de mettre des boîtes partout, et c'est le modèle à généraliser au reste — pas à retoucher.
- Le formatage monétaire français : espace fine insécable U+202F comme séparateur de milliers et espace après le signe (« − 39 341 FCFA »). C'est typographiquement correct, rarement bien fait, et meilleur que dans beaucoup de produits en production. Ne pas y toucher (lib/format.ts).
- Le pavé numérique sans chrome de l'écran Paiement : aucun fond de touche, aucune bordure, chiffres 22px w500 sur des lignes de 65px, avec un hover discret réservé au desktop. C'est exactement ce que font Revolut et Wise. À garder tel quel, y compris quand on le remontera sous le montant.
- La hiérarchie inversée des deux actions du hero Portefeuille : « Dépôt » en aplat blanc avec texte en #1a3da8 contre « Retrait » en glass blanc@0.18 bordure blanc@0.30. C'est le seul geste de direction artistique visiblement délibéré du lot — un choix, pas un réglage par défaut. À conserver et à renforcer par la taille plutôt que par l'ombre.
- La BottomNav : 74px, backdrop-blur 20px, double atténuation des onglets inactifs (icon-muted + opacity 0.28), actif en primary. Sobre et juste. Seule la règle de l'onglet actif est à dériver de la route ; le style ne bouge pas.
- Le fond nuit très désaturé #070c1a : bonne base de marque, évite le bleu Tailwind saturé en aplat plein écran. C'est le seul choix de couleur du système qui n'est pas une valeur par défaut.
- Le réflexe fintech du masquage : jamais de faux numéro de carte complet (•••• 4291), et la bascule œil / œil-barré sur les soldes, bien placée et correctement labellisée.
- Le rythme typographique du bloc discours de l'onboarding : titre 25/33 tracking -0.5 borné à 274px, paragraphe 13.5/23 borné à 322px, rapport interligne/corps de 1.70. Les césures sont maîtrisées. Seul l'alignement (centré) est à revoir, pas les valeurs.
- DM Mono pour l'identité d'une carte (« VISA •••• 4291 », 13px, tracking 1px) : vrai geste typographique, adapté au rôle. À unifier sur tous les écrans en gardant CE traitement-là, pas celui du Portefeuille en DM Sans.
- La BalanceCard en tête de flux (rappeler la ressource avant de demander un montant) et le rappel du solde de la carte liée en sous-titre : bons réflexes produit, à étendre à l'écran 05 qui ne les a pas.
- L'état sélectionné de SelectableRow : fond rgb(59 130 246 / 0.07) + bordure 1px pleine + pastille pleine. Lisible sans dépendre de la couleur seule (la bordure fait le travail), au bon niveau de discrétion. C'est le patron d'état sélectionné du produit.
- Le principe du wizard « une décision par étape » avec StepProgress sobre (segments h1, radius 2px, aucun ornement) : bon squelette pour un flux Mobile Money. Il manque juste un libellé d'étape visible.
- La grille 2 colonnes en desktop sur les flux (lg:grid-cols-2) et la discipline de composant qui fait que la colonne droite réutilise la liste sans la redessiner. C'est un vrai réflexe de designer, pas une adaptation automatique.
- Le thème clair : conçu et non inversé (surfaces glass devenues cartes blanches sur fond bleuté #eef1f8, contrastes AA documentés valeur par valeur, teintes navy plutôt que slate pour éviter le gris beige). Le raisonnement inscrit dans globals.css L166-172 sur les ombres qui suivent le thème et les couleurs qui suivent le pin est juste — c'est le meilleur passage du fichier, à préserver lors de la refonte des tokens d'ombre.
- La séquence verticale de l'écran 07 (contexte → ressource → montant → source → action) : c'est la bonne séquence, et le seul écran où le CTA est entièrement visible. Elle doit servir de patron aux écrans 06 et 08, pas être modifiée.
- La qualité d'exécution générale : valeurs cohérentes entre elles, typo calée, nommage des tokens sémantique et commenté. Le problème n'est jamais la fabrication — c'est qu'aucun renoncement n'a été fait. Ne pas casser la propreté du code en corrigeant le design.

## Détail écran par écran

### 01 Onboarding — **9/10**

**Marqueurs forts**

- **[M] Pile de 3 cartes bancaires inclinées (VirtualCard size="onboarding")** — VirtualCard.tsx L156-170 : deux couches fantômes derrière la face 276×168 — `rotate-[8deg] translate-x-[24px] translate-y-[32px] opacity-30` (from-primary-darkest to-primary-deep) et `rotate-[4deg] translate-x-[12px] translate-y-4 opacity-55` (from-primary-deep to-primary-mid), toutes deux en rounded-hero 22px. Visible en haut à droite de la capture : les deux fantômes dépassent de ~36px et ~48px.
  → *Supprimer les deux <span> de la pile. Garder UNE carte, à plat, décalée à droite en débord de cadre (bleed de 40px hors du canvas 390) et rotée de 0°. Si un effet de collection est nécessaire, empiler 2 cartes en translation verticale pure (translate-y 14px, opacity 1, échelle 0.94) sans rotation — c'est le pattern Apple Wallet, pas le pattern « stock 3D ».*
- **[A] Deux halos radiaux plein écran + glow du CTA + ombre de la carte** — page.tsx L21-28 : `glow-radial-blue` 320px à -top-90/-right-68 (rgb(59 130 246 / 0.17)) et `glow-radial-deep` 260px à -bottom-12/-left-50 (rgb(26 61 168 / 0.22)). globals.css L176-178 : `--s-glow-cta: 0 8px 28px rgb(36 87 197 / 0.42)` sur un bouton de 50px de haut, `--s-card-hero: 0 20px 60px rgb(11 28 107 / 0.55)` sous une carte de 168px. Le commentaire L93 assume : « Signature colored shadows — never plain black ».
  → *Supprimer les deux <span> de halo. CTA : retirer `shadow-glow-cta`, aplat #2563eb sans ombre. Carte : remplacer par `0 8px 24px rgb(0 0 0 / 0.35)` — neutre, offset court. Une ombre de 60px sous un objet de 168px n'existe dans aucun système physique.*
- **[C] Cinq dégradés 135° empilés sur un seul écran** — globals.css : `gradient-onboarding` (180°, 3 stops #070c1a→#0b1c6b→#0d1629) sur le fond, `gradient-card` (135°, 3 stops #0b1c6b→#1a3da8→#2457c5) sur la carte, `gradient-brand` (135°, #1a3da8→#3b82f6) sur le CTA « Commencer », `gradient-chip-gold` (135°, #fcd34d→#f59e0b) sur la puce, plus 2 linearGradient SVG dans FixPayLogo (shield + inner).
  → *Réserver le dégradé à la carte (objet identitaire). Fond : #070c1a plat, ou un dégradé vertical de 4 % max. CTA : aplat #2563eb. Puce : #d4af37 plat avec 3 traits de contacts. Logo : shield en aplat #3b82f6.*
- **[D] Cercles blancs flous débordant de la carte** — DecorativeCircles.tsx : `bg-white/[0.07]` 210px à -top-[55px] -right-[55px] et `bg-white/[0.04]` 170px à -bottom-[55px] -left-[10px], appliqués sur une face de 276×168 — le cercle top-right fait 125 % de la largeur de la carte. Nettement visible dans la capture (arc clair traversant le milieu droit de la carte).
  → *Supprimer <DecorativeCircles/> de la face de carte. Si la surface a besoin de vie : un liseré blanc@0.10 en haut (1px, spéculaire), ou un motif guilloché à 2 % en SVG répété — pas un blob.*

**Autres marqueurs**

- **[B] Échelle d'arrondis non maîtrisée entre carte et boutons** — Carte `rounded-hero` = 22px ; les deux CTA h-50 en `rounded-panel` = 18px (ratio 18/50 = pilule quasi complète) ; puce `rounded-[5px]`. Le système déclare 14 valeurs de rayon (globals.css L77 : « census: 2,4,8,10,11,12,13,14,16,18,20,22,28,44 »).
  → *Ramener l'écran à 3 valeurs : 12px pour les CTA (au lieu de 18), 16px pour la carte (au lieu de 22), 4px pour la puce. Objectif global : une échelle de 4 rayons (4 / 8 / 12 / 16) au lieu de 14.*
- **[K] Composition centrée sur toute la hauteur, sans tension** — page.tsx : `FixPayLogo mx-auto`, tagline `text-center`, `h1 mx-auto text-center max-w-[274px]`, `p mx-auto text-center max-w-[322px]`, deux CTA `w-full` empilés (gap 10px). Seul point d'asymétrie : `pl-[44px]` sur la pile de cartes — un décalage non justifié plutôt qu'un parti pris. Aucun indicateur de slide, un seul écran d'onboarding.
  → *Aligner le bloc discours à gauche sur une marge de 24px, titre 32/36 tracking -0.8 sur 3 lignes, paragraphe max-w 300 aligné à gauche. Faire déborder la carte à droite du cadre (au lieu du pl-44 centré). CTA primaire pleine largeur ; « Se connecter » en lien texte 15px sous le CTA, pas en second bouton de même masse.*
- **[M] Faux artefacts bancaires sur la face de carte** — Puce = simple rectangle doré 34×26 `rounded-[5px]` en dégradé, sans contacts ni découpe. Wordmark VISA recomposé en DM Sans (`font-extrabold tracking-[-0.5px] italic`), pas le logotype réel. `face.expiry: null` sur la taille onboarding : une carte sans date d'expiration. Numéro `•••• •••• •••• 4291` en DM Mono tracking 3px — le rendu casse les groupes (voir capture : 3 groupes de 4 points puis « 4291 » détaché).
  → *Dessiner une vraie puce EMV (6 contacts, radius 3px, or mat #c9a227 sans dégradé). Utiliser l'asset Visa officiel ou n'afficher aucune marque de réseau sur l'onboarding. Ajouter EXP 12/28 sous le porteur. Passer le numéro en tracking 2px avec des espaces réels entre groupes.*
- **[N] Contenu générique et absence des obligations d'un onboarding fintech** — Tagline « Your Smart Virtual Card » en anglais sur un écran 100 % français. Porteur « JEAN DUPONT ». Le paragraphe cite « Mobile Money » mais aucun opérateur (Orange Money, Wave, MTN, Moov) n'est nommé ni logotypé alors que c'est l'argument produit en zone FCFA. Aucune mention CGU/politique de confidentialité sous les CTA, aucun sélecteur de pays/langue.
  → *Tagline en français, ou supprimée. Bandeau de 3 logos opérateurs sous le paragraphe (preuve sociale locale). Ligne légale 11px text-muted sous les CTA : « En continuant, vous acceptez les CGU et la Politique de confidentialité ». Sélecteur pays en haut à droite.*

**Ce qui tient :** Le fond nuit très désaturé (#070c1a) est une bonne base de marque et évite le bleu Tailwind saturé. Le rythme du bloc discours est juste : titre 25/33 tracking -0.5 borné à 274px, paragraphe 13.5/23 borné à 322px — les césures sont maîtrisées et le rapport interligne/corps (1.70) est correct pour du texte long. La hauteur de CTA à 50px et le gap de 10px entre les deux boutons sont des valeurs de production. Le fait de ne PAS afficher un faux numéro de carte complet (masquage •••• 4291) est un réflexe fintech correct. Le lockup logo 206px + tagline 13/17 à 8px sous le mot-symbole est propre.

### 02 Accueil — **8/10**

**Marqueurs forts**

- **[F] Tout le haut de l'écran enfermé dans deux cartes de même rayon** — WalletHeroCard `h-[145px] p-5 rounded-hero` (22px) puis `GlassCard radius={22}` px-[19px] pt/pb-[17px] — deux blocs arrondis à 22px empilés à 12px d'écart, séparés par des micro-labels. Le hero (objet identitaire, dégradé) et le panneau carte (surface neutre blanc@0.05) ont EXACTEMENT le même rayon : aucune hiérarchie d'élévation, seulement une différence de remplissage.
  → *Une seule surface sur l'écran : garder le hero (rayon 16). Sortir « Ma carte principale » de sa carte : ligne à plat sur le fond, avec hairline blanc@0.08 au-dessus et en dessous, comme les transactions. Le solde carte devient une ligne de tableau, pas un bloc.*
- **[G] Tuile d'icône devant chaque ligne de liste et devant la carte** — TransactionItem.tsx : `IconTile tone="neutral" size={40} iconSize={17}` → `bg-surface-2` (blanc@0.09) `rounded-tile-lg` (13px) sur les 5 rangées, toutes de la même couleur et sans distinction sémantique. Plus une tuile 32px `bg-primary/15 rounded-[9px]` devant « VISA •••• 4291 » qui ne contient que le mark FixPay à `opacity-70` — donc une tuile pour afficher un logo déjà présent en haut de l'écran.
  → *Supprimer les IconTile de la liste : titre marchand 15px/medium, catégorie 12px muted sur la deuxième ligne. Réserver une pastille ronde 28px (pas un carré teinté) aux seuls mouvements internes (dépôt/retrait), pour les distinguer des dépenses. Supprimer entièrement la tuile 32px devant le libellé de carte.*
- **[A] Ombre bleue de 60px sous un objet de 145px** — globals.css L177 : `--s-card-hero: 0 20px 60px rgb(11 28 107 / 0.55)` appliqué au WalletHeroCard `h-[145px]` — le flou vaut 41 % de la hauteur de l'objet et l'offset 14 %. Aucune ombre neutre n'existe dans le système : les 8 tokens (`--s-glow-cta`, `--s-glow-badge`, `--s-glow-success`, `--s-mini-visa`, `--s-mini-mc`…) sont tous colorés, par décision explicite (commentaire L93).
  → *En dark, supprimer l'ombre du hero : sur #070c1a le dégradé suffit à détacher la surface. Ajouter à la place une hairline interne `inset 0 1px 0 rgb(255 255 255 / 0.10)`. Si une ombre est nécessaire (light) : `0 1px 2px rgb(15 23 42 / 0.06)` + `0 8px 16px rgb(15 23 42 / 0.06)`, neutre.*
- **[J] Quatre micro-labels majuscules espacés sur un seul écran, et aucun chiffre travaillé** — SectionLabel = `text-[10px] leading-[13px] font-semibold uppercase tracking-label` (0.1em) — utilisé pour « MON PORTEFEUILLE FIXPAY », « MA CARTE PRINCIPALE », « SOLDE CARTE », auquel s'ajoute « SOLDE DISPONIBLE » (11px, tracking 0.5px, uppercase) dans le hero. Zéro occurrence de `tabular-nums` / `font-variant-numeric` dans tout src/ : « 1 866 252 FCFA » (26px) et « 816 202 FCFA » (20px) ne s'alignent pas, et les montants de la colonne droite dansent d'une ligne à l'autre.
  → *Supprimer « MON PORTEFEUILLE FIXPAY » (redondant avec le logo) et « SOLDE CARTE ». Passer les deux labels restants en casse normale 12px/medium, tracking 0. Ajouter `font-variant-numeric: tabular-nums; font-feature-settings: 'ss01'` sur AmountText, AmountDisplay et WalletHeroCard. Traiter le montant du hero en display : 30px, tracking -1.5, avec « FCFA » à 14px/regular en opacité 0.6 aligné sur la baseline.*

**Autres marqueurs**

- **[I] Palette Tailwind par défaut, monochrome bleu** — globals.css L126-137 : `#3b82f6` = blue-500, `#60a5fa` = blue-400, `#22c55e` = green-500, `#ef4444` = red-500, `#f59e0b` = amber-500, `#f97316` = orange-500 — six valeurs Tailwind exactes. Toutes les surfaces sont du blanc à 0.05 / 0.09 / 0.12 / 0.14 / 0.18 et du bleu à 0.07 / 0.10 / 0.12 / 0.20. Aucune couleur d'accent non-bleue dans l'interface.
  → *Décaler la teinte primaire hors du blue-500 (ex. #2F5BE8, un bleu légèrement violacé, plus proche des marques de paiement ouest-africaines) et construire une rampe 50→900 propre. Rouge et vert à re-tuner pour l'affichage sur fond nuit (#E5484D, #30A46C — Radix, pas Tailwind). Introduire un accent de service unique (ambre chaud) réservé aux limites/KYC.*
- **[B] Six rayons différents sur un même écran** — Hero 22px (`rounded-hero`) · GlassCard 22px · pilules Dépôt/Retrait 14px (`rounded-field`) · CardAction 13px (`rounded-tile-lg`) · IconTile transactions 13px · bouton œil 8px (`rounded-eye`) · tuile logo carte `rounded-[9px]` — soit une valeur ad hoc en plus des 14 tokens déclarés.
  → *Trois rayons : 4px (micro : puce, badge), 10px (contrôles : boutons, tuiles, œil), 16px (surfaces : hero, panneaux). Supprimer --radius-tile-sm/tile/tile-lg/eye/field/pill/hero/badge et remapper.*
- **[L] Trois actions de poids identique sous la carte, et une densité d'information très faible** — CardAction : trois blocs `h-[57px] flex-1`, icône 16px + label 11px empilés et centrés — dont deux strictement identiques en couleur (`bg-primary-tint-2`, `border-primary/[0.22]`, texte primary-light) pour « Alimenter » et « Retirer », et un gris pour « Détails ». Sur 780px de haut, l'écran porte 1 solde, 1 carte, 3 boutons et 4,5 transactions. En desktop (1440×900), ~45 % de la hauteur sous le contenu est vide.
  → *Un seul primaire : « Alimenter » en bouton plein 40px aligné à droite du solde carte. « Retirer » et « Détails » deviennent des liens texte 13px dans l'en-tête du bloc. L'espace récupéré (57px + marges ≈ 71px) part dans la liste : 2 transactions de plus visibles.*
- **[N] Icônes lucide génériques et sémantiquement fausses, liste sans mécanique** — `CloudUpload` pour « Dépôt » et « Alimenter », `CloudDownload` pour « Retrait » et « Retirer » — un nuage pour un mouvement d'argent ; la même icône cloud réapparaît dans la rangée « Recharge portefeuille » (txIconMap `deposit`), si bien que le bouton et la transaction sont indiscernables. À 15-17px, CloudUpload et CloudDownload ne se distinguent que par le sens d'une flèche de 4px. Côté liste : aucun filtre, aucun tri, aucun groupement par jour, aucun total, aucun statut « en attente », aucun état vide/chargement/erreur (0 occurrence dans src/), dates non homogènes (« Aujourd'hui, 14:32 », « Hier, 09:15 », « 13 Avr, 08:00 », « 10 Avr » sans heure).
  → *Remplacer par ArrowDownLeft (entrée) / ArrowUpRight (sortie) — deux formes opposées lisibles à 14px. Grouper la liste par en-têtes de jour collants (« Aujourd'hui · −45 895 FCFA »), harmoniser le format de date (heure systématique sur 48h, puis « 13 avr. »), ajouter une barre de filtres (Tout / Entrées / Sorties / Carte) et un état vide dessiné.*

**Ce qui tient :** La liste de transactions est le seul endroit de l'écran où le contenu respire à plat sur le fond, séparé par des hairlines blanc@0.08 sur 65px de hauteur de rangée : c'est la bonne décision, il faut l'étendre au reste. Le libellé de carte en DM Mono 13px uppercase tracking 1px (« VISA •••• 4291 ») est un vrai geste typographique et convient au rôle. Le formatage monétaire utilise l'espace fine insécable U+202F comme séparateur de milliers et met une espace après le signe (« − 39 341 FCFA ») — c'est typographiquement correct en français et rarement bien fait. La BottomNav 74px, backdrop-blur 20px, avec la double atténuation des onglets inactifs (icon-muted + opacity 0.28) et l'onglet actif en primary, est sobre et juste. La bascule œil/œil-barré sur les deux soldes est un pattern attendu, bien placé et correctement labellisé.

### 03 Portefeuille — **8/10**

**Marqueurs forts**

- **[G] Poupées russes d'arrondis dans le hero : carte → tuile d'action → tuile d'icône → icône** — WalletHeroCard `rounded-hero` 22px → chaque action `rounded-card` 16px sur `h-[90px]` → à l'intérieur `rounded-tile-sm` 11px sur `size-9` (36px) → à l'intérieur une icône 18px. Quatre niveaux d'imbrication et trois rayons différents pour dire le mot « Dépôt ». La tuile 36px porte `bg-primary-deep/10` (Dépôt) ou `bg-white/15` (Retrait) — un fond de tuile posé sur un fond de bouton posé sur un dégradé.
  → *Supprimer les tuiles 36px : icône 18px directement sur le fond du bouton. Réduire les actions à `h-[44px]`, icône inline à gauche du label (flex-row, gap 8) au lieu de la pile centrée — on récupère 46px de hauteur de hero, qui redevient un bloc de solde et non un panneau d'actions.*
- **[N] Décimales sur un montant en FCFA** — mock-data L134 : `wallet = { balance: 1_866_252, decimals: ".50" }`, rendu par WalletHeroCard en `text-lg opacity-70` après le montant 32px → « 1 866 252.50 ». Le franc CFA (XOF) n'a aucune subdivision en circulation : un solde ne peut pas valoir 1 866 252,50 FCFA. De plus le séparateur décimal est un point alors que la locale est fr (virgule), et le suffixe « FCFA » disparaît ici alors qu'il est présent sur l'Accueil pour le MÊME solde (« 1 866 252 FCFA », 26px, sans décimales).
  → *Supprimer la prop `decimals` et le span baseline. Afficher « 1 866 252 FCFA » avec « FCFA » à 15px/regular opacité 0.65 aligné baseline, identique sur les deux écrans. Si un jour une devise à subdivision est gérée (EUR sur la carte), la virgule et 2 décimales sont conditionnées à la devise, pas codées en dur.*
- **[N] « Mouvements récents » listés dans le désordre chronologique** — walletMovements (mock-data L221-258) dans l'ordre d'affichage : 10 Avr (+327 980), 11 Avr (−131 192), 8 Avr (−65 596), 5 Avr (+196 788). Le deuxième mouvement est postérieur au premier. Dates sans année, sans heure, sans groupement, et aucune date relative alors que l'Accueil en utilise (« Aujourd'hui », « Hier ») — deux conventions de date différentes dans la même app.
  → *Trier strictement par timestamp décroissant. Format unique dans toute l'app : heure seule sur 24h (« 14:32 »), « Hier, 09:15 » sur 48h, puis « 11 avr. » (minuscule, point abréviatif français), année si ≠ année courante. En-têtes de groupe collants par jour avec le net du jour à droite.*
- **[A] Deux systèmes d'ombre contradictoires à 20px l'un de l'autre** — Le hero porte `--s-card-hero: 0 20px 60px rgb(11 28 107 / 0.55)` (bleu, 60px de flou). À l'intérieur, le bloc « Dépôt » porte `shadow-[0_4px_20px_rgb(0_0_0/0.15)]` — une ombre NOIRE diffuse posée sur un dégradé bleu, à l'intérieur d'une surface qui a déjà sa propre ombre colorée. Le bloc « Retrait » n'a, lui, aucune ombre mais une bordure blanc@0.30.
  → *Aucune ombre à l'intérieur du hero : sur un fond bleu #1a3da8, un aplat blanc se détache par contraste (ratio > 8:1), l'ombre n'ajoute rien et salit le dégradé. Supprimer aussi l'ombre du hero lui-même en dark. Unifier le traitement des deux actions : bordure 1px pour les deux (blanc@0 sur le blanc, blanc@0.30 sur le glass), zéro shadow.*
- **[D] Cercle blanc débordant presque aussi large que le hero** — WalletHeroCard variant expanded : `DecorativeCircles topRight={{size: 200}}` (blanc@0.07, positionné -top-[55px] -right-[55px]) et `bottomLeft={{size: 140, className: "-bottom-10 -left-5"}}` (blanc@0.04) sur une carte de 350×220 — le cercle top-right fait 57 % de la largeur et 91 % de la hauteur du hero. Dans la capture, son arc coupe visiblement le filigrane FixPay et le bord du bouton Retrait.
  → *Supprimer <DecorativeCircles/>. Si la surface doit vivre : liseré spéculaire `inset 0 1px 0 rgb(255 255 255 / 0.12)` en haut du hero, et rien d'autre.*

**Autres marqueurs**

- **[B] Six valeurs de rayon sur l'écran, dont quatre dans le seul bloc « Carte bancaire virtuelle »** — Hero 22px (`rounded-hero`) · actions du hero 16px (`rounded-card`) · tuiles d'icône du hero 11px (`rounded-tile-sm`) · GlassCard 18px (`rounded-panel`) · tuile logo 42px en 13px (`rounded-tile-lg`) · bouton « Alimenter » 12px (`rounded-tile`, variant small h-8) · bouton œil 8px (`rounded-eye`).
  → *Trois rayons pour l'écran entier : 16px surfaces (hero, panneau), 10px contrôles (actions, boutons, œil), 4px micro. Le panneau à 18px et le hero à 22px doivent converger vers la même valeur, la différence de 4px n'est lisible par personne et ne code aucune hiérarchie.*
- **[K] Hero de 220px pour porter une seule information, et symétrie 50/50 des actions** — Le hero fait 220px de haut ; le slot d'actions en occupe 90px (41 %) via `grid h-[90px] grid-cols-2 gap-3`, le label 14px et le montant 42px de line-height. Les deux actions ont exactement la même largeur alors que Dépôt et Retrait n'ont pas la même fréquence d'usage — la hiérarchie n'est portée QUE par la couleur (blanc plein vs glass), jamais par la taille ni la position.
  → *Hero à 150px : label 11px, montant 34px, et une seule action primaire « Déposer » en bouton 44px pleine largeur ; « Retirer » en lien texte à droite du label de solde. Ou, si les deux doivent coexister : grid-cols-[1.6fr_1fr] pour que la masse traduise la fréquence.*
- **[L] Densité irréaliste pour un écran de portefeuille** — Quatre mouvements affichés (dont le 4e coupé par la nav), un seul moyen de paiement, aucun filtre, aucun sélecteur de période, aucun solde en attente, aucun plafond/limite mensuelle, aucun opérateur Mobile Money listé (Orange Money et Wave n'existent que dans des chaînes de libellés), et aucune gestion du multi-devises alors que la carte dépense en EUR (cardTransactions, écran 10) pendant que le portefeuille est en FCFA — ni taux, ni conversion, ni mention. Zéro état vide / chargement / erreur dans src/. En desktop, la colonne gauche s'arrête à 510px sur 900px de viewport.
  → *Ajouter sous le hero une bande dense sans carte : « Disponible / En attente / Plafond mensuel restant » en 3 colonnes séparées par des filets verticaux blanc@0.08. Ajouter une ligne de chips de filtre (Tout · Dépôts · Retraits · Cartes) et un sélecteur de mois. Afficher les comptes Mobile Money liés (logo opérateur + numéro masqué) comme rangées à plat. Dessiner l'état vide (« Aucun mouvement en avril ») et le squelette de chargement.*
- **[G] Colonne d'icônes quasi identiques dans la liste** — Les 4 mouvements portent tous un `IconTile tone="neutral" size={40}` (blanc@0.09, rayon 13px) et trois d'entre eux affichent la même famille d'icône cloud (`deposit`, `withdraw`, `deposit`) : la colonne de gauche est une répétition de carrés gris indiscernables sur 260px de hauteur.
  → *Supprimer les tuiles. Un chevron de direction coloré (vert entrant / neutre sortant) de 16px suffit, ou rien du tout : le signe et la couleur du montant à droite portent déjà l'information.*
- **[J] Le même objet est composé différemment sur deux écrans consécutifs** — « Visa •••• 4291 » est rendu ici en DM Sans `text-[13.5px] leading-[17.6px] font-semibold` capitale initiale, et sur l'Accueil (02) en DM Mono `text-[13px] tracking-[1px] uppercase` — même donnée, même composant logique, deux traitements typographiques. De même la tuile qui le précède passe de 32px/rayon 9px (Accueil) à 42px/rayon 13px (ici). Le code assume cet écart en commentaire, mais rien à l'écran ne le justifie.
  → *Un seul traitement pour l'identité d'une carte dans toute l'app : DM Mono 13px, tracking 0.5px, capitale initiale « Visa •••• 4291 » (le mono sert le numéro, pas la marque). Une seule taille de tuile — ou aucune.*

**Ce qui tient :** La hiérarchie inversée des deux actions du hero — « Dépôt » en aplat blanc avec le texte en primary-deep #1a3da8 contre « Retrait » en glass blanc@0.18 bordure blanc@0.30 — est le seul vrai geste de direction artistique du lot : c'est un choix, pas un réglage par défaut, et il faut le garder (en le renforçant par la taille plutôt que par l'ombre). Le bandeau d'information en bas du panneau carte est bien composé : Info 14px + phrase 11.5/17.8 + bouton compact h-32 à droite, sur une rangée de 49px — c'est la seule ligne dense et bien proportionnée de l'écran, et le bon modèle pour le reste. Rappeler le solde de la carte liée en sous-titre (« Solde : 816 202 FCFA ») évite un aller-retour, bonne décision produit. Le formatage des montants (espace fine insécable U+202F, espace après le signe) est typographiquement correct. La colonne de droite en desktop reprend la même liste sans la redessiner : bonne discipline de composant.

### 04 Depot Portefeuille — **6/10**

**Marqueurs forts**

- **[N] RadioCheck en état `ghost-check` sur les 6 lignes pays** — RadioCheck.tsx : state 'ghost-check' = cercle 20px, bordure 2px blanc@0.14, AVEC un <Check> lucide blanc 11px strokeWidth 3 rendu à l'intérieur. Le code le pose sur TOUTES les lignes non sélectionnées (`radioState={country === c.code ? 'selected' : 'ghost-check'}`). Résultat sur la capture : les 6 pays affichent une coche. Le commentaire du composant fige l'anomalie : « deliberate fidelity to screens 04/05 — do not 'fix' it ».
  → *État non sélectionné = cercle vide, bordure 1.5px blanc@0.20, aucun glyphe. État sélectionné = disque plein #3b82f6 + check blanc 11px. Supprimer purement et simplement la variante 'ghost-check' du composant : c'est un état hérité d'un artefact d'import, pas une intention.*
- **[G] FlagSquare — le carré bleuté en tête de chaque ligne** — `<span className="rounded-iconbtn bg-primary-tint size-9" />` = 36×36px, rayon 10px, fond rgb(59 130 246 / 0.10), contenu VIDE. Six carrés bleus identiques et vides alignés sur 6 lignes. C'est la tuile d'icône systématique poussée jusqu'à l'absurde : la tuile reste, l'icône a disparu.
  → *Deux options honnêtes : (1) vrai drapeau raster/SVG 24×18px (ratio 4:3), rayon 2px, hairline blanc@0.10 pour détacher le blanc du Sénégal du fond ; (2) supprimer le leading et afficher l'indicatif à droite du nom en DM Mono 12px muted (« Bénin  +229 »). Ne jamais garder une tuile vide.*
- **[L] Densité de l'écran entier** — 6 lignes de 64px + 9px de gap = 429px de contenu utile sur 780px de viewport, puis ~250px de vide entre « Togo » et la BottomNav. Zéro champ de recherche, zéro indicatif téléphonique, zéro opérateur listé, zéro section « récents », zéro plafond, zéro devise.
  → *Lignes à 52px groupées, deux lignes de texte : nom + « +229 · Orange Money, MTN, Moov » en 11px muted. Champ de recherche collant en haut dès que la liste dépasse 8 entrées (elle dépassera : l'UEMOA c'est 8 pays, la CEMAC 6 de plus). Section « Récemment utilisé » de 1-2 lignes en tête. On passe de 6 items à ~14 sans que l'écran soit chargé.*

**Autres marqueurs**

- **[F] Les 6 pays en 6 cartes flottantes** — Chaque pays est un `<button>` autonome : h=64px, rayon 14px (--radius-field), fond blanc@0.05, bordure 1px blanc@0.08, séparés par `space-y-[9px]`. Six conteneurs arrondis identiques empilés = 12 bordures verticales dessinées pour une seule liste.
  → *Un seul conteneur rayon 12px, bordure 1px blanc@0.08, lignes h52 séparées par une hairline interne blanc@0.06, pas de bordure ni de rayon par ligne. On divise le bruit de contour par six et la liste redevient une liste.*
- **[N] StepProgress — barre d'étapes anonyme** — 4 segments identiques h=4px, rayon 2px, gap 6px ; le 1er en #3b82f6, les 3 autres en blanc@0.14. Aucun libellé visible : `aria-label="Étape 1 sur 4"` existe pour les lecteurs d'écran mais rien n'est affiché à l'œil. L'utilisateur ne sait ni où il est ni ce qui l'attend.
  → *Ajouter « 1/4 · Pays » en 11px muted, aligné à droite au-dessus de la barre, ou passer à un stepper à 4 libellés courts (Pays · Opérateur · Numéro · Montant). Coût : une ligne de texte ; gain : la barre cesse d'être un ornement.*
- **[K] Titre sur deux lignes + back button** — Le titre est enfermé dans un wrapper `max-w-[254px]` pour FORCER le retour à la ligne (« Dépôt — Recharger le / portefeuille », 19px bold, leading 25px). Le back button 38px est en `items-center` sur ce bloc à 2 lignes : sur la capture il flotte à y≈158 entre les deux lignes de texte (y≈133 et y≈183), aligné sur rien.
  → *Titre court sur une ligne (« Dépôt Mobile Money ») + sous-titre 12px muted (« Recharger votre portefeuille ») ; supprimer le max-width magique. Si le titre doit rester sur deux lignes, passer le header en `items-start` avec un décalage de 2px pour que le bouton s'aligne optiquement sur la première ligne.*
- **[J] Micro-label « CHOISISSEZ VOTRE PAYS »** — SectionLabel : 10px, w600, uppercase, tracking 0.1em (--tracking-label), couleur --c-text-muted = rgb(148 172 255 / 0.38) sur #070c1a → ratio de contraste ~2.4:1, sous le seuil AA. C'est le micro-label majuscule espacé générique, répété à l'identique sur les 5 écrans du lot.
  → *Une seule échelle de labels : 13px, sentence case, w500, couleur rgb(196 212 255 / 0.65). Réserver les majuscules espacées à UN rôle unique dans tout le produit (par exemple les en-têtes de section du profil). Ici, le label est de toute façon redondant avec l'étape : le supprimer est la meilleure option.*
- **[N] Libellé de l'écran** — « Dépôt — Recharger le portefeuille » : cadratin suivi d'une reformulation qui ne dit rien de plus que le premier mot. Tic d'écriture génératif, et il coûte une deuxième ligne au titre.
  → *« Dépôt Mobile Money » en titre, « Depuis Orange Money, Wave, MTN ou Moov » en sous-titre. Bannir le cadratin des titres d'écran dans tout le produit.*

**Ce qui tient :** C'est l'écran le moins « généré » du lot sur le plan visuel : ZÉRO glow, ZÉRO dégradé, ZÉRO ombre portée. Le fond #070c1a est neutre et profond, les lignes sont plates (blanc@0.05 sur bordure blanc@0.08), la StepProgress est sobre (segments h1, radius 2px) et n'essaie pas d'être un objet décoratif. Le principe « une décision par étape » est le bon pattern pour un wizard Mobile Money. La grille 2 colonnes en desktop (lg:grid-cols-2) est un vrai réflexe de designer. Tout ça est à garder tel quel : le problème de cet écran n'est pas le style, c'est le contenu et la sémantique.

### 05 Retrait Portefeuille — **6/10**

**Marqueurs forts**

- **[K] Écran strictement identique à 04** — Diff entre wallet/deposit/page.tsx et wallet/withdraw/page.tsx : mêmes imports, mêmes 6 pays, mêmes 4 opérateurs, même StepProgress(4), mêmes SelectableRow height=64 radius=14 radioSize=20, même FlagSquare. Seuls le titre et la route de succès changent. Superposées, les deux captures sont pixel pour pixel identiques sous le header.
  → *Différencier le retrait sur le fond, pas sur la couleur : rappeler le solde retirable en tête (« 1 866 252 FCFA disponibles »), afficher le plafond quotidien restant, les frais de l'opérateur et le délai (« Sous 5 min · Frais 1 % (min. 100 FCFA) »). Un dépôt et un retrait n'ont ni les mêmes contraintes ni les mêmes risques ; s'ils ont le même écran, c'est que personne n'a conçu le retrait.*
- **[N] Aucun solde rappelé sur un écran de retrait** — Le montant retirable (wallet.balance = 1 866 252) n'apparaît nulle part sur l'écran 05, alors que les écrans 06 et 07 affichent bien une BalanceCard. Incohérence entre écrans frères du même produit.
  → *BalanceCard « Disponible au retrait · 1 866 252 FCFA » sous le header, plus un rappel du plafond restant. C'est l'information n°1 attendue avant de choisir un pays.*
- **[N] RadioCheck `ghost-check` — les 6 pays cochés** — Identique à 04 : les 6 lignes affichent un Check blanc 11px dans un cercle 20px bordé blanc@0.14. Sur un écran de retrait, laisser croire à une sélection multiple sur des destinations d'argent est plus grave encore que sur le dépôt.
  → *Même correctif : cercle vide non sélectionné, disque #3b82f6 + check blanc sélectionné. Supprimer l'état 'ghost-check'.*
- **[G] FlagSquare vide ×6** — 36×36px, rayon 10px, fond rgb(59 130 246 / 0.10), aucun contenu — même composant local dupliqué que sur 04 (deux définitions identiques de FlagSquare dans deux fichiers).
  → *Vrai drapeau 24×18px rayon 2px hairline blanc@0.10, ou suppression du leading au profit de l'indicatif en mono. Et factoriser le composant : deux copies identiques du même placeholder, c'est le symptôme.*

**Autres marqueurs**

- **[N] Copie du titre : « Retrait — Vider le portefeuille »** — Texte littéral passé à PageHeader. « Vider » est faux (on retire un montant, pas la totalité) et anxiogène sur un écran financier. Signature typique d'une copie générée par symétrie avec « Recharger » de l'écran 04.
  → *« Retrait Mobile Money », sous-titre « Vers Orange Money, Wave, MTN ou Moov ». Le verbe d'une action irréversible sur de l'argent doit être exact et calme.*
- **[L] ~250px de vide sous « Togo »** — 429px de contenu sur 780px, aucun contrôle sous la liste, aucune recherche, aucun état vide/chargement/erreur prévu (aucune branche conditionnelle dans le composant hors `step`).
  → *Densifier (lignes 52px, indicatif + opérateurs) et occuper le bas avec ce qui manque : dernier retrait effectué, plafond restant du jour, lien « Où trouver mon numéro Mobile Money ? ».*
- **[F] 6 cartes flottantes rayon 14px au lieu d'une liste** — h64, fond blanc@0.05, bordure blanc@0.08, gap 9px, une carte par pays.
  → *Un conteneur rayon 12px, lignes h52, hairlines internes blanc@0.06.*

**Ce qui tient :** Mêmes qualités que 04 : palette neutre, aucune ombre, aucun dégradé, aucune tuile décorative colorée, lignes plates. Le titre tient sur une ligne ici, donc le back button est correctement aligné — c'est cette version du header qu'il faut généraliser, pas celle de 04. Le fait d'avoir un wizard court et une seule décision par écran reste le bon squelette.

### 06 Alimenter Carte — **7/10**

**Marqueurs forts**

- **[N] CTA « Alimenter la carte » rogné par la BottomNav** — Sur la capture 390×780, le libellé du bouton est coupé horizontalement en deux par la barre de navigation (h≈64px, fond rgb(7 12 26 / 0.97)). Le commentaire du code assume : « Le CTA passe partiellement sous la BottomNav (voulu par le design) ». `pb-24` (96px) ne suffit pas à dégager le bouton.
  → *L'action principale d'un écran de transfert ne peut jamais être partiellement masquée. Épingler le CTA en barre basse fixe au-dessus de la nav (fond #070c1a, hairline blanc@0.08 en haut, padding 12/20px), ou densifier le contenu pour que tout tienne. Ce n'est pas une intention de maquette, c'est un débordement d'une frame de 780px.*
- **[A] Ombre du CTA primaire** — --s-glow-cta = `0 8px 28px rgb(36 87 197 / 0.42)` — une ombre bleue de 28px de flou à 42 % d'opacité sous un bouton de 50px de haut. L'ombre fait plus de la moitié de la hauteur de l'objet qu'elle est censée poser.
  → *Supprimer le glow coloré. Un CTA plein n'a besoin d'aucune ombre sur fond sombre ; si une élévation est voulue, `0 1px 2px rgb(0 0 0 / 0.30)`. Réserver toute lueur bleue à un seul objet identitaire du produit (la carte virtuelle) et nulle part ailleurs.*
- **[C] Dégradé du CTA** — `gradient-brand` = `linear-gradient(135deg, #1a3da8 0%, #3b82f6 100%)` appliqué au bouton primaire, au remplissage de la ProgressBar, aux badges et à l'avatar d'envoi. Le dégradé 135° bleu→bleu clair sur un bouton est le marqueur le plus fréquent des maquettes générées.
  → *CTA en aplat #3b82f6 (ou #2563eb pour le contraste du texte blanc), rayon 12px. Garder le dégradé UNIQUEMENT sur la carte virtuelle, où il porte l'identité et où il y a assez de surface pour qu'il se lise.*
- **[I] InfoBanner en vert « success » pour un texte purement informatif** — `tone="success"` → fond rgb(34 197 94 / 0.07), bordure rgb(34 197 94 / 0.20), icône `Info` en #22c55e. Le texte (« Le montant est débité de votre portefeuille FixPay et crédité instantanément… ») ne signale aucune réussite : rien ne s'est encore passé. Sur l'écran frère 07, le même bandeau neutre est en ambre `warning`. Les couleurs sémantiques servent ici à différencier deux écrans, pas à porter un sens.
  → *Bandeau neutre : fond blanc@0.04, bordure blanc@0.08, icône Info en rgb(220 230 255 / 0.58). Réserver strictement le vert aux confirmations réalisées et l'ambre aux avertissements réels (plafond atteint, délai inhabituel). Un utilisateur qui voit du vert avant d'avoir agi n'apprend plus rien du vert.*
- **[N] Aucune donnée transactionnelle réelle** — L'écran ne contient ni frais, ni plafond, ni délai, ni solde après opération, ni montant minimum/maximum. Aucun de ces éléments n'existe dans le composant ni dans mock-data.ts. C'est un formulaire à deux champs déguisé en transfert.
  → *Sous le champ montant, un bloc à plat (sans carte) : « Frais 0 FCFA · Arrivée immédiate · Plafond restant aujourd'hui 500 000 FCFA », et après saisie « Solde portefeuille après : 1 766 252 FCFA ». C'est ce bloc, plus que le style, qui sépare une vraie app fintech d'une maquette.*

**Autres marqueurs**

- **[B] Six rayons différents sur un seul écran** — InfoBanner 16px (--radius-card), BalanceCard 16px, AmountInput 14px (--radius-field), chips 20px (--radius-pill), SelectableRow 16px, IconTile 12px (--radius-tile), CTA 18px (--radius-panel), pastille radio 100 %. Le fichier globals.css énumère 14 valeurs de rayon (2, 4, 8, 10, 11, 12, 13, 14, 16, 18, 20, 22, 28, 44) — c'est un recensement, pas une échelle.
  → *Trois valeurs, avec un rôle chacune : 8px pour les contrôles (boutons, champs, tuiles), 12px pour les conteneurs (cartes, bandeaux, lignes), 999px pour les chips seuls. Les rayons 11/13/18/22/28 disparaissent. La différence est immédiatement visible : les objets cessent d'avoir tous la même douceur.*
- **[G] IconTile générique pour Visa et Mastercard** — Les deux lignes utilisent le même glyphe lucide `CreditCard` (17px) dans une tuile 38×38 rayon 12px, seule la teinte change : bleu rgb(59 130 246 / 0.10) pour Visa, bordeaux rgb(139 26 58 / 0.12) pour Mastercard. Sur un sélecteur de carte, le réseau est justement la seule information qu'une icône générique ne peut pas porter.
  → *Afficher les marques réelles (Visa, Mastercard) en 28×18 sur fond neutre blanc@0.06, ou mieux : une vignette de la carte elle-même (24×36 reprenant le dégradé de la carte), qui donne au passage le lien visuel avec l'écran Cartes.*
- **[K] Quatre chips qui débordent en 3 + 1** — `flex flex-wrap gap-2`, chips h35 px17 : 25 000 / 50 000 / 100 000 tiennent sur la première ligne, 200 000 tombe seul sur la seconde, laissant 60 % de la largeur vide. Aucune décision n'a été prise sur ce débordement.
  → *Soit 3 chips (25 000 / 50 000 / 100 000) sur une ligne pleine largeur en `grid-cols-3`, soit une grille 2×2 assumée, soit une rangée à défilement horizontal avec 6 valeurs. Un orphelin en fin de wrap est toujours un accident.*
- **[J] Champ montant centré, sans devise, sans chiffres tabulaires** — AmountInput variante 'amount' : h57, `text-center`, 22px w700, tracking -0.5px, placeholder « Ex : 100 000 » centré. Aucun `font-variant-numeric: tabular-nums` dans tout globals.css. Le suffixe FCFA n'est pas dans le champ, il n'est que dans le label 10px au-dessus.
  → *Champ aligné à gauche avec préfixe/suffixe fixe « FCFA » en muted, chiffres en tabular-nums (DM Sans le supporte), placeholder « 0 » et non un exemple. Ajouter à droite un bouton texte « Max » qui remplit le solde disponible — c'est le geste attendu et ça remplace utilement un chip.*
- **[L] Vide de la version desktop** — Sur la capture 1440×900, tout le contenu est terminé à y≈420 : les deux tiers inférieurs de la zone de contenu (environ 480px de haut sur 1180px de large) sont vides. La colonne de droite s'arrête au CTA à y≈350.
  → *En desktop, remplir la colonne droite avec le récapitulatif de l'opération (montant, frais, solde avant/après, délai) et une liste « Dernières alimentations de cette carte ». Ou renoncer aux deux colonnes et centrer une colonne de 520px : mieux vaut une colonne dense qu'une grille à moitié vide.*
- **[G] Icône décorative dans la BalanceCard** — `<WalletMinimal size={18} className="text-primary-light" />` posée au bord droit de la carte de solde, centrée verticalement, sans fonction : elle n'est ni cliquable, ni informative, ni un affordance.
  → *La remplacer par ce qui manque : un chevron + « Voir le portefeuille » cliquable, ou rien du tout. Une icône qui ne fait rien est un remplissage de composition.*

**Ce qui tient :** La logique de sélection est correctement dessinée : ligne sélectionnée = fond rgb(59 130 246 / 0.07) + bordure 1px #3b82f6 + pastille pleine ; ligne non sélectionnée = blanc@0.05 + bordure blanc@0.08 + cercle vide. C'est lisible sans dépendre de la couleur seule (la bordure fait le travail) et c'est le bon niveau de discrétion. La BalanceCard en tête est le bon réflexe : rappeler la ressource avant de demander le montant. Le titre tient sur une ligne, le back button est bien aligné. Et le bandeau, malgré sa couleur, dit une chose vraie et utile (« débité du portefeuille, crédité instantanément ») plutôt qu'un texte de remplissage.

### 07 Retrait Carte — **8/10**

**Marqueurs forts**

- **[A] Halo bleu sous « Confirmer le retrait »** — C'est ici que --s-glow-cta est pleinement visible : `0 8px 28px rgb(36 87 197 / 0.42)` diffuse un halo bleu sur ~40px sous un bouton de 50px, nettement lisible sur la capture entre y≈1180 et y≈1230. Sur un fond #070c1a, le halo forme une flaque lumineuse qui ne correspond à aucune source de lumière de la scène.
  → *Supprimer l'ombre colorée. Aplat #3b82f6, rayon 12px, aucune ombre. Si un état pressé est voulu, jouer sur la luminosité (-8 %) plutôt que sur une lueur.*
- **[N] Le solde 816 202 FCFA affiché deux fois à 200px d'intervalle** — BalanceCard : « SOLDE DISPONIBLE SUR LA CARTE — 816 202 FCFA » (20px bold, y≈460). SelectableRow : « Visa •••• 4291 / Solde : 816 202 FCFA » (11.5px muted, y≈990). Le code appelle deux fois `formatFcfa(sourceCard.balance)` sur le même objet. Duplication d'information qu'aucune relecture humaine ne laisse passer.
  → *Garder le solde en tête (c'est la ressource) et remplacer le sous-titre de la ligne par une information utile et distincte : « Virtuelle · Active · Expire 12/28 ». Ou, mieux, supprimer la ligne (voir marqueur suivant).*
- **[N] Un sélecteur radio avec une seule option, pré-cochée et non interactive** — `<SelectableRow ... selected />` sans `onSelect` : la ligne est un bouton `aria-pressed="true"` qui ne fait rien, avec bordure #3b82f6 et pastille bleue pleine. Un choix unique présenté comme un choix.
  → *Quand une seule carte existe : ligne à plat, sans carte, sans bordure, sans radio — « Depuis  Visa •••• 4291 » avec un lien texte « Changer » à droite. Le sélecteur ne réapparaît qu'à partir de deux cartes. Cela libère de la place et supprime une fausse interaction.*
- **[I] InfoBanner ambre « warning » pour un texte neutre** — `tone="warning"` → fond rgb(245 158 11 / 0.08), bordure rgb(245 158 11 / 0.20), icône Info #f59e0b. Le texte (« Le montant est retiré de votre carte bancaire virtuelle et recrédité sur votre portefeuille FixPay ») n'alerte de rien. Il est mécaniquement l'ambre parce que l'écran 06 était le vert : les sémantiques servent de code couleur d'écran.
  → *Bandeau neutre (blanc@0.04 / bordure blanc@0.08 / icône rgb(220 230 255 / 0.58)). Garder l'ambre pour un vrai avertissement, qui manque d'ailleurs ici : « Le retrait annule les autorisations en attente sur cette carte » aurait, lui, mérité l'ambre.*
- **[N] Aucun frais, plafond, délai ni solde résultant** — Comme sur 06 : rien dans le composant ni dans mock-data.ts. Sur un retrait depuis une carte virtuelle vers un portefeuille, c'est pourtant l'information la plus sensible.
  → *Bloc à plat sous le champ : « Frais 0 FCFA · Immédiat · Min. 1 000 FCFA », puis après saisie « Solde carte après : 766 202 FCFA ». Et un bouton « Tout retirer » qui remplit 816 202.*

**Autres marqueurs**

- **[L] Moitié basse de l'écran vide** — Le CTA se termine à y≈590 sur 780px, puis ~210px de vide jusqu'à la BottomNav. L'écran contient 5 blocs pour 2 informations réelles (un solde, un montant à saisir).
  → *Occuper ce vide avec ce qui manque au produit : frais et délai du retrait, plafond restant, et une liste « Derniers retraits de cette carte » (3 lignes à plat, date relative + montant en tabular-nums). Un utilisateur fintech préfère de la densité utile à de l'air.*
- **[N] Onglet actif incohérent dans la BottomNav** — `<BottomNav active="home" />` sur l'écran 07 alors que l'écran 06, opération jumelle sur la même carte, utilise `active="wallet"`. Sur les captures : « Accueil » en bleu sur 07, « Portefeuille » en bleu sur 06. Le commentaire l'assume : « fidèle au design ».
  → *Une règle unique : un flux « carte » surligne Cartes, un flux « portefeuille » surligne Portefeuille. Ici les deux écrans manipulent une carte depuis le portefeuille — choisir l'un des deux et l'appliquer aux deux. Une incohérence de nav entre deux écrans frères est la trace la plus nette d'écrans produits indépendamment.*
- **[B] Échelle de rayons non assumée** — Bandeau 16px, BalanceCard 16px, champ 14px, chips 20px, ligne carte 16px, tuile icône 12px, CTA 18px — 6 valeurs sur un écran qui compte 7 objets.
  → *8px contrôles / 12px conteneurs / pleine gélule pour les chips uniquement. Trois valeurs, trois rôles.*
- **[G] IconTile générique CreditCard pour la carte Visa** — Tuile 38×38 rayon 12px, fond rgb(59 130 246 / 0.10), glyphe lucide `CreditCard` 17px en #60a5fa — le même glyphe que celui de la BalanceCard juste au-dessus, à 200px d'écart.
  → *Marque Visa réelle, ou vignette de la carte au dégradé. Et ne jamais répéter le même glyphe deux fois dans une même colonne : ici, l'œil voit deux fois « carte » sans apprendre quoi que ce soit.*

**Ce qui tient :** C'est le seul écran du lot où le CTA est entièrement visible et correctement posé — la structure verticale (contexte → ressource → montant → source → action) est la bonne séquence, et elle devrait servir de patron aux écrans 06 et 08. Le bandeau explicatif dit quelque chose de concret et de vrai sur le mouvement d'argent. La BalanceCard en tête reste le bon réflexe. Et la retenue générale (pas de blob, pas de faux relief, pas de carte 3D) est réelle : le problème est le glow, pas la composition.

### 08 Paiement — **8/10**

**Marqueurs forts**

- **[N] Un écran « Paiement » sans bénéficiaire** — Le fichier ne contient aucun marchand, aucun destinataire, aucune référence, aucun libellé de motif. On saisit un montant et on choisit une carte pour payer… personne. Le titre est le mot « Paiement » nu (19px bold, `truncate`).
  → *En tête, avant le montant : avatar/logo du bénéficiaire 44px + nom + identifiant (« Boutique Adjamé · +225 07 ••• 42 »), et un champ « Motif (facultatif) » sous le montant. Le titre devient « Payer Boutique Adjamé ». Sans destinataire, l'écran n'est pas un paiement, c'est une calculatrice.*
- **[N] Montants rapides 3 280 / 9 839 / 19 679 / 49 197 FCFA** — mock-data.ts : `payment: [3_280, 9_839, 19_679, 49_197]`. Ce sont des conversions d'euros au taux fixe 655,957 (≈5 €, 15 €, 30 €, 75 €). Aucun utilisateur ivoirien ou sénégalais ne cherche un raccourci vers 9 839 FCFA. Des « montants rapides » à cinq chiffres non ronds sont l'aveu le plus net d'un contenu généré depuis un gabarit européen.
  → *Valeurs natives rondes : 1 000 / 2 000 / 5 000 / 10 000 FCFA. Et à terme, les remplacer par des montants dérivés du comportement réel (« Habituel 2 500 », « Dernier 7 000 »), ce qu'aucun gabarit ne peut inventer.*
- **[K] Le pavé numérique placé après le sélecteur de carte, et le CTA hors écran** — Ordre du DOM : montant (y≈150) → chips (y≈220) → sélecteur « PAYER AVEC » (y≈310-465) → Numpad (y≈500) → CTA. Sur 390×780, seules les rangées 1-9 sont visibles ; la rangée « . 0 ⌫ » et le bouton « Payer maintenant » sont sous la ligne de flottaison (le code l'assume : « Le CTA est hors du viewport initial (y=760, voulu par le design) »). Le pavé qui remplit le montant est donc à 350px sous le champ qu'il pilote, séparé par un bloc sans rapport.
  → *Séquence : bénéficiaire → montant → pavé collé au montant → moyen de paiement en une ligne compacte repliable → CTA épinglé en bas. Le pavé doit toucher visuellement le chiffre qu'il modifie ; le moyen de paiement est une confirmation, il passe après. Aucun écran de paiement ne peut avoir son bouton de validation hors du premier viewport.*
- **[J] Tracking -2px appliqué au suffixe « FCFA » en 16px** — AmountDisplay : le nombre est en `text-4xl leading-[47px] tracking-[-2px]`, et la devise en `text-base leading-[21px] font-bold tracking-[-2px]`. -2px sur un mot de 4 capitales en 16px, c'est -12,5 % par caractère : sur la capture, « FCFA » forme un pâté compact, presque illisible, collé au « 0 ». Le tracking a été copié du nombre à la devise sans réévaluation — un designer ne recopie jamais un tracking optique d'un corps 36 vers un corps 16.
  → *Nombre : 36px w700, `letter-spacing: -0.02em`, `font-variant-numeric: tabular-nums`. Devise : 16px w500, `letter-spacing: 0.02em`, couleur muted, décalée de 6px sur la ligne de base. La devise doit reculer, pas se compresser.*

**Autres marqueurs**

- **[N] Touche décimale « . » sur un pavé FCFA** — `const KEYS = ["1"…"9", ".", "0"]` et `handleKey` gère explicitement la virgule décimale, alors que le franc CFA ne se subdivise pas en pratique (aucune fraction n'a cours). Le pavé est un pavé décimal générique, pas un pavé FCFA.
  → *Supprimer la touche « . » et la logique décimale ; la remplacer par « 000 », qui est le vrai raccourci utile sur des montants à 4-6 chiffres en FCFA. Détail minuscule, mais c'est exactement ce genre de détail qui signe la localisation réelle d'un produit.*
- **[J] Montant saisi en direct sans chiffres tabulaires** — Aucun `tabular-nums` dans globals.css ni dans AmountDisplay. Le montant est centré (`justify-center`) : à chaque frappe, la largeur des glyphes proportionnels change ET le bloc se recentre, donc tous les chiffres déjà saisis bougent latéralement.
  → *`font-variant-numeric: tabular-nums` sur AmountDisplay, AmountText et toutes les colonnes de montants ; envisager un alignement à gauche du bloc montant+devise pour que le premier chiffre reste ancré pendant la frappe. C'est le détail typographique n°1 d'un produit financier.*
- **[K] Chips en 3 + 1 avec un orphelin** — Même `flex-wrap gap-2` que 06/07 : 3 280 / 9 839 / 19 679 sur la ligne 1, 49 197 seul sur la ligne 2 avec ~55 % de vide à sa droite. Et la largeur des chips varie (110px à 130px) car elle dépend du nombre de chiffres, ce qui déchiquette le bord droit.
  → *Grille `grid-cols-4` à largeur égale avec des montants ronds à 4-5 chiffres (1 000 / 2 000 / 5 000 / 10 000), ce qui donne un bloc rectangulaire net. La devise disparaît des chips (elle est déjà dans le montant géant) : le libellé se raccourcit et tient.*
- **[G] Tuiles d'icône génériques sur les deux moyens de paiement** — Même glyphe lucide `CreditCard` 17px dans une tuile 38×38 rayon 12px pour Visa (fond bleu @0.10) et pour Mastercard (fond bordeaux @0.12). La seule différenciation entre les deux moyens de paiement est une nuance de teinte de fond à 10-12 % d'opacité.
  → *Marques Visa et Mastercard réelles sur fond neutre blanc@0.06 rayon 6px. Sur un écran de paiement, reconnaître son réseau d'un coup d'œil est fonctionnel, pas décoratif.*
- **[A] Glow du CTA « Payer maintenant » (visible en desktop)** — Invisible sur la capture mobile car le bouton est hors écran, mais nettement présent sur la capture 1440×900 : halo bleu diffus sous le bouton, `0 8px 28px rgb(36 87 197 / 0.42)` sur `linear-gradient(135deg, #1a3da8, #3b82f6)`.
  → *Aplat, rayon 12px, aucune ombre — comme pour 06 et 07. La cohérence du CTA à travers les cinq écrans est le premier chantier.*
- **[L] Densité de la version desktop** — Sur 1440×900, le contenu s'arrête à y≈560 et la moitié droite sous le CTA est entièrement vide (environ 480×580px de fond nu). Un pavé numérique de 300px de large centré dans une colonne de 420px sur un écran de bureau, alors que le clavier physique existe.
  → *En desktop, masquer le pavé (le clavier suffit, le champ passe en input numérique) et utiliser la place pour le récapitulatif : bénéficiaire, montant, frais, carte, et l'historique des paiements à ce bénéficiaire. La version desktop ne doit pas être la version mobile étalée.*

**Ce qui tient :** Le pavé numérique sans chrome (aucun fond de touche, aucune bordure, chiffres 22px w500 sur lignes de 65px) est une vraie bonne décision, exactement ce que font Revolut et Wise — à garder absolument, y compris le hover discret réservé au desktop. La hiérarchie label 12px muted / montant 36px bold / devise 16px est le bon principe. Le sélecteur de carte à deux options est ici légitime (deux vraies alternatives) et son état sélectionné est lisible. Enfin, le fait de ne pas avoir mis de carte 3D inclinée ni d'illustration de synthèse sur un écran de paiement est méritoire.

### 09 Creer Carte — **7/10**

**Marqueurs forts**

- **[A] CTA « Continuer » (Button variant primary)** — box-shadow `--s-glow-cta: 0 8px 28px rgb(36 87 197 / 0.42)` — halo bleu de 28px de flou visible sur ~40px sous le bouton dans la capture, sur un fond #070c1a qui ne peut physiquement pas recevoir de lumière bleue.
  → *Supprimer shadow-glow-cta. En thème sombre, aucune ombre sur un CTA posé sur fond sombre ; en clair, 0 1px 2px rgb(15 23 42 / 0.10). Le CTA doit gagner sa saillance par le contraste de valeur, pas par un néon.*
- **[C] Remplissage du CTA + fill des barres d'étapes** — `gradient-brand: linear-gradient(135deg, #1a3da8 0%, #3b82f6 100%)` appliqué au CTA, au ProgressBar et aux badges. Le même dégradé 135° sert d'identité à la carte bancaire (`gradient-card`).
  → *Aplat #2563eb sur le CTA (hover #1d4ed8, active #1e40af). Réserver strictement le dégradé 135° à la carte bancaire, qui est le seul objet identitaire du produit. Un CTA en dégradé est le marqueur nº1 de maquette générée.*
- **[A] Vignettes de carte 80×50 (VirtualCard size="mini")** — `--s-mini-visa: 0 4px 14px rgb(11 28 107 / 0.45)` et `--s-mini-mc: 0 4px 14px rgb(139 26 58 / 0.45)`. Le halo bordeaux sous la vignette Mastercard est nettement visible en dessous et à gauche de la vignette dans la capture — une lueur rouge qui déborde sur la surface glass.
  → *Supprimer les deux ombres colorées. Vignette 80×50, rayon 6px, filet interne `inset 0 0 0 1px rgb(255 255 255 / 0.12)` pour la détacher de la surface. Zéro ombre portée sur une image de 50px de haut.*
- **[N] Les deux options « Visa Virtuelle » / « Mastercard Virtuelle »** — Prix strictement identique (`CARD_PRICE = formatFcfa(3_280)` pour les deux), sous-titres purement marketing (« Achats en ligne sécurisés » / « Acceptée mondialement »). Aucune donnée de décision : ni frais de transaction, ni plafond, ni devise de facturation, ni délai d'activation, ni réseaux refusés.
  → *Transformer chaque option en vraie fiche comparative : « 3 280 FCFA · 0 frais/transaction · Plafond 500 000 FCFA/mois · Activation immédiate » + un tag « Recommandé » sur une seule. Sans différenciation, le choix est décoratif — signature d'un écran écrit par un modèle qui remplit deux slots symétriques.*
- **[L] Moitié basse de l'écran** — Le bas du CTA tombe à y≈527px sur un viewport de 780px : 253px (32 %) de vide absolu entre le bouton et la BottomNav, pour 2 options + 1 champ texte.
  → *Épingler le CTA en barre basse (fond `--c-bg` + filet haut white@0.08) avec le récap à gauche : « Total 3 280 FCFA · payé via Mobile Money ». Récupérer l'espace libéré pour les frais, le délai et une ligne « ce que vous pourrez faire avec cette carte ».*

**Autres marqueurs**

- **[B] Échelle d'arrondis de l'écran** — 5 rayons distincts sur un seul écran : 20px (option rows, `--radius-pill`), 18px (CTA, `--radius-panel`), 14px (champ, `--radius-field`), 13px (bouton retour, `--radius-tile-lg`), 10px (vignette carte, `--radius-iconbtn`). globals.css l.77 documente lui-même un recensement de 14 rayons : 2,4,8,10,11,12,13,14,16,18,20,22,28,44.
  → *Réduire à 3 rôles : 8px (contrôles : champ, bouton, vignette), 12px (conteneurs : option rows), 999px (pastilles/badges). Les 11/12/13/14/16/18/20/22 sont du bruit hérité d'un import, pas un système.*
- **[J] Labels « CHOISISSEZ VOTRE CARTE » et « NOM SUR LA CARTE »** — Même composant SectionLabel : 10px, w600, `uppercase`, `tracking-label: 0.1em`, couleur `--c-text-muted rgb(148 172 255 / 0.38)` — pour deux rôles différents (titre de section vs label de champ). Le seul autre niveau typographique est le h1 à 19px. Aucune graisse ni taille intermédiaire, aucun chiffre tabulaire sur « 3 280 FCFA ».
  → *Titre de section : 15px w600 `--c-text`, casse normale, sans tracking. Label de champ : 12px w400 `--c-text-secondary`, casse normale. Supprimer le uppercase+tracking 0.1em, qui à 10px et 38 % d'opacité tombe sous le seuil de lisibilité et signe la maquette générée.*
- **[N] StepProgress 5 segments** — 5 barres anonymes de 4px (`--radius-seg: 2px`), sans libellé d'étape ni compteur. Le commentaire du code (page.tsx l.113) reconnaît que « seule l'étape 1 est maquettée » : les étapes 2-5 rejouent SelectableRow/AmountInput sans écran dessiné.
  → *Remplacer par « Étape 1 sur 5 · Type de carte » en 12px au-dessus d'une barre unique, et dessiner réellement les étapes 2-5 (pays, opérateur, numéro, confirmation) avec leur propre densité — surtout l'étape 5 qui doit porter le récapitulatif de paiement.*
- **[K] Composition de l'option row (103px de haut)** — Vignette à gauche, bloc texte, RadioCheck 22px collé au bord droit → un trou horizontal de ~120px au milieu de chaque rangée. Marges gauche/droite identiques (px-5 = 20px) partout, colonne unique, aucun rythme vertical différencié.
  → *Ramener la hauteur à 76px, remonter le prix sur la même ligne que le titre (aligné à droite, tabular-nums), et remplacer le RadioCheck par un état de sélection porté par la bordure + un check 16px en coin haut-droit. La rangée devient dense au lieu d'être un tiroir vide.*
- **[B] État sélectionné de CardOptionRow** — `selected ? "border-primary bg-surface border-2" : "border-border ... border"` — la bordure passe de 1px à 2px à hauteur figée (103px), donc le contenu se décale de 1px à chaque sélection.
  → *Garder `border: 1px` et ajouter `box-shadow: inset 0 0 0 1px var(--c-primary)` sur l'état sélectionné, ou utiliser `outline` : plus de reflow au clic.*

**Ce qui tient :** L'idée de montrer une vraie vignette de la carte (Visa bleue / Mastercard bordeaux) dans l'option plutôt qu'une icône générique — c'est juste et concret. Le prix est affiché dès le choix, en clair, et pas caché à l'étape 5 : bon réflexe produit. Le champ « Nom sur la carte » à 48px avec bordure white@0.14 et placeholder cohérent est correct. Les textes sont du vrai français spécifique, pas du lorem. Et la présence d'un StepProgress en tête de wizard est le bon principe, même mal exécuté.

### 10 Detail Carte — **8/10**

**Marqueurs forts**

- **[D] Cercles décoratifs sur la face de la carte (DecorativeCircles)** — 210px white@0.07 en haut-droite (-55/-55) + 170px white@0.04 en bas-gauche. Dans la capture, l'arc du cercle bas-gauche traverse la ligne du numéro (`top-[123px]`) et le nom « JEAN DUPONT », et le cercle haut-droit occupe le tiers droit de la face. Le contraste du texte varie donc selon qu'il est sur le cercle ou hors du cercle.
  → *Supprimer les deux cercles. C'est le marqueur le plus certain de génération automatique. Si un motif identitaire est voulu sur la carte, utiliser un guillochage/relief à ≤3 % d'opacité, jamais un blob qui coupe une donnée lisible.*
- **[A] Ombre de la VirtualCard** — `--s-card-hero: 0 20px 60px rgb(11 28 107 / 0.55)` — 60px de flou bleu marine à 55 % d'opacité sous un objet de 192px de haut, sur un fond #070c1a.
  → *En sombre : aucune ombre, ou `0 1px 3px rgb(0 0 0 / 0.5)`. En clair : `0 2px 8px rgb(15 23 42 / 0.12)`. Une carte de crédit ne flotte pas à 20cm au-dessus de l'écran.*
- **[N] Grille 2×2 « NUMÉRO / EXPIRATION / TYPE / STATUT »** — « •••• 4291 » et « 12 / 28 » sont déjà imprimés sur la face de la carte, 18px au-dessus. « TYPE : Virtuelle » est invariant (toutes les cartes du produit sont virtuelles). 3 tuiles sur 4 ne portent aucune information nouvelle.
  → *Supprimer la grille et la remplacer par ce dont un porteur de carte virtuelle a réellement besoin : « Copier le numéro », « Afficher le CVV » (3 s), « Plafond mensuel 500 000 FCFA — 62 % utilisé » avec jauge, « Paiements en ligne : autorisés / Retraits : bloqués ». C'est là que se joue l'écran.*
- **[F] Empilement de conteneurs** — 8 conteneurs arrondis avant la liste : carte (22px), panneau solde (16px), 4 StatTile (16px), 3 boutons d'action (15px) — tous en `bg-surface` white@0.05 + `border-border` white@0.08. Aucune information posée à plat sur le fond, aucune hiérarchie d'élévation réelle.
  → *Un seul objet en relief : la carte. Le solde en typo nue sur le fond (pas de panneau). Les infos en liste de définition à filets 1px white@0.08, sans fond ni bordure de conteneur. Réserver la surface glass aux éléments réellement interactifs.*
- **[N] Devises solde vs transactions** — Solde « 816 202 FCFA » ; les 4 transactions sont en EUR (`− €59.99`, `− €9.99`, `− €340.00`, `+ €12.00`, mock-data l.261-298). Aucun taux de change, aucune conversion, aucune mention de frais FX — sur un produit dont la devise de compte est le FCFA.
  → *Afficher les deux montants par ligne : « − €59.99 » en principal et « − 39 341 FCFA » en secondaire 11px, plus une ligne d'en-tête « Taux appliqué : 1 € = 655,96 FCFA ». C'est LE sujet d'une carte virtuelle africaine, et il est absent.*

**Autres marqueurs**

- **[J] Numéro de carte sur la face** — `font-mono` + `tracking-[4px]` sur « •••• •••• •••• 4291 » : les 4px de tracking annulent le groupement, la capture lit « • • • •   • • • •   • • • •   4 2 9 1 ». Le solde 26px utilise `tracking-[-1px]` sans tabular-nums (DM Sans en chiffres proportionnels).
  → *Numéro : tracking 0.5px, groupes séparés par un vrai gap de 12px (4 spans), `font-variant-numeric: tabular-nums`. Solde : tabular-nums obligatoire, tracking -0.02em. Un montant qui saute de largeur quand il change est une faute de base en fintech.*
- **[K] Rangée d'actions Alimenter / Payer / Bloquer** — `ACTION_CLASSES` identique pour les trois : 42px, rayon 15px, `border-border-strong`, `bg-surface`, 12px w600. « Bloquer » — action destructive et irréversible — a exactement le même poids visuel que « Alimenter ». De plus c'est un `<button>` sans handler.
  → *Hiérarchiser : « Alimenter » en bouton plein primaire pleine largeur, « Payer » en secondaire, et sortir « Bloquer la carte » de la rangée pour la placer en lien texte `--c-danger` en bas d'écran ou dans un menu « ⋯ » de l'en-tête, avec confirmation.*
- **[N] Liste « Transactions »** — 4 lignes en dur, aucun filtre, aucun tri, aucune recherche, aucun « Tout voir », aucun état vide/chargement/erreur. Dates sans année ni heure (« 13 Avr », « 10 Avr »). Dans la capture mobile, la première ligne (Amazon / €59.99) est coupée en deux par la BottomNav à y=705px sans aucune affordance de scroll.
  → *Ajouter un en-tête de liste avec filtre période + type, des séparateurs de date (« Aujourd'hui », « Cette semaine », « Avril »), l'heure sur les transactions du jour, et un dégradé de fade de 24px au-dessus de la BottomNav pour signaler la continuité.*
- **[M] Puce dorée de la carte** — `gradient-chip-gold` sur un rectangle 40×29 rayon 6px : un aplat orange plein, sans contacts, sans gravure. Sur une carte *virtuelle*, où une puce physique n'a aucun sens fonctionnel.
  → *Supprimer la puce. Sur une carte virtuelle, remplacer par un glyphe « sans contact » discret ou par rien du tout. En l'état c'est un rectangle orange non identifiable — un placeholder de mockup laissé en place.*
- **[K] Face de carte en desktop** — `FACE.lg.root = "h-48 w-full"` avec enfants en position absolue calés sur une largeur de 348px. À 482px de large (grille 2 colonnes), le ratio devient 2,51:1 au lieu du 1,586:1 d'une carte réelle, et tout le contenu reste massé à gauche avec un vide central.
  → *`aspect-ratio: 1.586` + `max-width: 400px`, et passer les enfants absolus en flexbox (chip en haut-gauche, logo en haut-droite, bloc numéro/nom en bas) pour qu'ils suivent la largeur.*

**Ce qui tient :** Le bouton « Masquer » avec état réel (masque le solde ET le numéro, bascule le libellé et l'icône Eye/EyeOff) est un vrai comportement produit, pas une décoration — à garder tel quel. La hiérarchie du panneau solde (label 10px muet / valeur 26px bold) est juste. La ligne de transaction (tuile 40px, titre 13,5px, date 11,5px muette, montant signé aligné à droite avec vert/rouge) est un motif dense, professionnel et correctement calibré. Le retour + titre de l'en-tête (bouton 38px, titre 19px bold) est propre et sobre. Et le fait que la liste passe *derrière* la nav plutôt que de s'arrêter net est le bon principe de scroll.

### 11 Statistiques — **9/10**

**Marqueurs forts**

- **[N] L'écran entier : « Statistiques » sans aucun graphique** — 4 chiffres + 3 barres de progression. Aucune série temporelle, aucune courbe, aucun histogramme, aucun donut, aucun sélecteur de période — la période est figée dans le libellé (« Dépenses (avr.) », `statTiles` mock-data l.465). Un écran de statistiques sans axe du temps n'a pas été conçu par quelqu'un qui a réfléchi à l'usage.
  → *Faire du graphique le héros : histogramme dépenses/recharges sur 6 à 12 mois en haut de l'écran, avec sélecteur segmenté (Semaine / Mois / Année) dans l'en-tête, et les KPI en dessous comme lecture secondaire. Les 4 tuiles ne sont pas des statistiques, ce sont des soldes.*
- **[N] Barres de « Répartition des dépenses »** — `spendingBreakdown` (mock-data l.492) : Shopping €59.99 → 35 %, Abonnements €9.99 → 14 %, Voyage €340.00 → 78 %. Or 340/59,99 = 5,7× alors que la barre n'est que 2,2× plus longue ; 59,99/9,99 = 6× pour une barre 2,5× plus longue. Les pourcentages sont décoratifs et ne dérivent d'aucun total (somme = 127 %).
  → *percent = montant / total, afficher le total (« 409,98 € ce mois ») et la valeur en % à côté du montant. Une dataviz dont les longueurs contredisent les nombres qu'elle affiche est le tell le plus factuel possible d'une maquette générée.*
- **[C] Remplissage des ProgressBar** — `gradient-brand: linear-gradient(135deg,#1a3da8,#3b82f6)` identique sur les 3 catégories, hauteur 6px (`h-1.5`), rayon `--radius-bar: 4px`, piste `bg-border` white@0.08. Un dégradé 135° sur un objet de 6px de haut est invisible ; et trois catégories de la même couleur n'encodent aucune information.
  → *Aplats, une teinte par catégorie (bleu / violet / sarcelle, désaturées pour le sombre), hauteur 4px, rayon 2px, piste white@0.06. Ajouter la légende du total. La couleur doit porter la catégorie, sinon la barre ne sert à rien.*
- **[I] Couleurs sémantiques rouge / vert / bleu** — `--c-danger: #ef4444` = Tailwind red-500, `--c-success: #22c55e` = green-500, `--c-primary: #3b82f6` = blue-500. Les trois teintes de l'écran sortent de la rampe 500 par défaut de Tailwind, alors que le fichier se présente comme « les valeurs exactes du Figma ». Et « 268 809 FCFA » est peint en rouge vif sur 20px — une dépense normale n'est pas une erreur.
  → *Désaturer pour du sombre : dépense #e2725b ou simplement `--c-text` avec un préfixe « − », succès #3fb27f. Réserver le rouge pur aux échecs et aux alertes. Ne jamais colorer une valeur entière de 20px : colorer la variation (« +12 % ») uniquement.*
- **[J] Tuile « DÉPENSES (AVR.) »** — page.tsx l.45 : `max-w-[100px]` forcé sur la valeur danger → « 268 809 FCFA » se casse en deux lignes (« 268 809 » / « FCFA ») tandis que « 459 172 FCFA », plus long, tient sur une ligne dans la tuile voisine. La rangée 1 est donc plus haute que la rangée 2 et la grille est bancale. Aucun `tabular-nums` : les chiffres ne s'alignent pas verticalement d'une tuile à l'autre.
  → *Supprimer le `max-w-[100px]`, sortir « FCFA » de la valeur et le mettre dans le label (« DÉPENSES · FCFA »), activer `font-variant-numeric: tabular-nums` sur toutes les valeurs, et fixer la hauteur des tuiles à une valeur commune.*
- **[N] Cohérence des devises et des unités** — Tuiles 1 et 2 en FCFA, tuiles 3 et 4 sans aucune devise (« 816 202 », « 1 866 252 »), panneau de répartition intégralement en EUR (€59.99 / €9.99 / €340.00). Trois conventions sur un écran de 780px.
  → *Une devise de compte affichée partout (FCFA), les montants d'origine EUR convertis avec la valeur originale en secondaire. Aucune valeur monétaire sans unité.*
- **[L] Occupation de l'écran** — Le panneau de répartition se termine à y≈548px sur 780 : 232px (30 %) de vide avant la BottomNav, pour 4 nombres et 3 barres. En desktop c'est pire : le contenu s'arrête à y≈478 sur 900, soit 47 % de page vide.
  → *Densifier : graphique mensuel, top 5 marchands avec montants, comparatif mois/mois, budget par catégorie avec seuil dépassé, moyenne journalière. Un utilisateur fintech qui ouvre « Statistiques » veut lire, pas contempler.*

**Autres marqueurs**

- **[N] Slot `note` des StatTile** — Le même emplacement 11px muet porte quatre natures de contenu : « +12% vs mars » (variation), « 2 dépôts » (comptage), « Visa •••• 4291 » (source), « Disponible » (statut). Signature typique d'un gabarit rempli par génération : le slot existe, on met ce qu'on trouve.
  → *Réserver le slot à la variation vs période précédente, avec flèche et couleur (« ▲ 12 % vs mars »). Déplacer la source de compte en label (« SOLDE — VISA •••• 4291 ») et supprimer « Disponible », qui ne dit rien.*
- **[F] 5 conteneurs identiques** — Les 4 StatTile et le panneau de répartition sont tous en `radius={18}` (`--radius-panel`), tous en `bg-surface` rgb(255 255 255 / 0.05) + `border-border` rgb(255 255 255 / 0.08). Zéro différence d'élévation, zéro contenu à plat sur le fond.
  → *KPI sans conteneur, posés sur le fond, séparés par des filets verticaux 1px (comme la bande de stats du Profil, qui elle est juste). Réserver la surface glass au seul bloc de répartition.*
- **[N] État actif de la BottomNav** — `<BottomNav active="home" />` : « Accueil » est surligné en bleu alors qu'on est sur Statistiques, écran qui n'a pas d'onglet. L'état actif ment.
  → *Soit ne surligner aucun onglet sur un écran de flux (comme les autres écrans /flows), soit faire remonter Statistiques dans un onglet. En desktop la sidebar surligne bien « Statistiques » — les deux implémentations se contredisent.*

**Ce qui tient :** Les libellés sont du vrai français avec un vrai mois (« Dépenses (avr.) », « +12% vs mars ») — l'intention de comparaison période/période est le bon réflexe et mérite d'être développée, pas jetée. La grille 2×2 de KPI en tête d'écran est un motif fintech parfaitement légitime. Les catégories choisies (Shopping / Abonnements / Voyage) sont plausibles et cohérentes avec les transactions carte de l'écran 10 — la continuité narrative existe. Et le passage à `lg:grid-cols-4` en desktop est une bonne décision responsive.

### 12 KYC — **8/10**

**Marqueurs forts**

- **[A] CTA « Continuer la vérification »** — Button variant primary : h-50px, rounded-panel = 18px, gradient-brand linear-gradient(135deg,#1a3da8,#3b82f6), shadow-glow-cta = 0 8px 28px rgb(36 87 197 / 0.42). Sur la capture le halo bleu déborde visiblement ~30px sous le bouton et vient teinter le fond #070c1a.
  → *Supprimer --s-glow-cta du CTA (shadow: none). Aplat #2563eb, pas de dégradé. Rayon 18 → 12px. Si une élévation est nécessaire : 0 1px 2px rgb(0 0 0 / 0.35), rien de plus. Le glow doit disparaître de TOUS les boutons du produit — c'est le marqueur n°1 du lot.*
- **[D] Cercle décoratif du hero « Vérification d'identité obligatoire »** — HeroGradientCard + DecorativeCircles : span rounded-full bg-white/[0.07], 150×150px, positionné -top-10 -right-5. Visible comme un disque clair qui coupe le tiers droit du bandeau et passe derrière le texte.
  → *Retirer purement et simplement DecorativeCircles de ce bandeau (et des écrans 17/18). Un bandeau d'information réglementaire ne porte pas de décor. Si on veut de l'identité : filet vertical 3px #3b82f6 à gauche sur une surface plate, texte à plat.*
- **[G] IconTile 42px dans chaque ligne du stepper** — IconTile size=42 → rounded-tile-lg = 13px, tons bg-success-tint / bg-primary-tint / bg-surface-2, icônes User/CreditCard/Camera 17px. Chaque ligne porte DEUX indicateurs d'état : la pastille 26px du stepper (check vert / « 2 » bleu / « 3 » gris) ET la tuile teintée de la même couleur.
  → *Supprimer les IconTile. Le stepper porte déjà l'état ; la redondance double le poids visuel pour zéro information. Garder la pastille 26px, mettre l'état dans la typo du libellé (titre text, sous-titre muted, et un libellé « Complété » vert en 12px).*

**Autres marqueurs**

- **[F] Les 3 étapes en 3 GlassCard séparées** — StepCard = GlassCard radius={16}, bg-surface (blanc@0.05) + border blanc@0.08, hauteurs 74/79/74px, avec le trait de liaison (bg-border, 2px, h-40/h-45) qui court À L'EXTÉRIEUR des cartes.
  → *Un stepper est un objet continu : une seule surface (ou zéro surface), lignes séparées par des hairlines blanc@0.08, et le trait de liaison À L'INTÉRIEUR de la colonne d'indicateurs. Aujourd'hui le trait flotte dans la gouttière de 14px entre pastille et carte.*
- **[N] Étape verrouillée « Selfie de vérification »** — STEP_CARD_OPACITY : locked → opacity-45 appliquée à TOUTE la carte (et done → opacity-60). Résultat : le titre passe de #eef2ff à un gris illisible et l'icône disparaît presque.
  → *Ne jamais désactiver par opacité globale. Garder l'opacité 1, passer le titre à --c-text-muted, ajouter une icône cadenas 12px, et un libellé « Disponible après l'étape 2 ». L'opacité en bloc est un raccourci d'import automatique, pas une décision d'état.*
- **[N] Chevron de la ligne active** — ChevronLeft size={14} sur l'étape « Pièce d'identité », avec un commentaire dans le code qui assume la reprise du design (« pointe vers la gauche »). La ligne navigue vers l'avant.
  → *ChevronRight 16px, text-muted. Un chevron gauche sur une ligne de navigation avant est un artefact d'import (l'icône « back » réutilisée), pas un choix.*
- **[B] Échelle d'arrondis de l'écran** — Sur un seul écran : bouton retour 13px (rounded-tile-lg), hero 18px (rounded-panel), cartes d'étape 16px, tuiles d'icône 13px, InfoBanner 16px, CTA 18px. Six valeurs dans la bande 13–18px.
  → *Réduire à deux rôles : 8px pour tout ce qui est contrôle (bouton retour, tuiles, CTA) et 14px pour les surfaces (cartes, bandeaux). L'écart doit être PERCEPTIBLE ; 16 vs 18 ne l'est pas.*
- **[N] Contenu du parcours KYC** — InfoBanner « Délai de vérification : moins de 24h après soumission des documents. » — seule information de contexte. Aucun état rejeté, aucun état « en cours d'examen », aucune date de soumission, aucune mention du régulateur ni de la base légale.
  → *Ajouter les états réels du parcours (soumis / en examen / rejeté avec motif / expiré), un horodatage relatif fin (« soumis il y a 3 h »), et le fondement réglementaire en pied de page. Un KYC est le seul écran où la densité informationnelle est attendue.*
- **[J] Échelle typographique des étapes** — Titre d'étape 13px/17px medium, sous-titre 11px/14.3px, contre un H1 à 19px. Sur un parcours bloquant, le contenu utile est en 11–13px.
  → *Titre d'étape 15/20 medium, sous-titre 13/18 muted. Le H1 peut descendre à 22px sans dommage : c'est le contenu qui doit grandir, pas le titre.*

**Ce qui tient :** Le stepper vertical avec trait de liaison et trois états réellement différenciés est une vraie structure de parcours, pas une grille de cartes générique — c'est l'écran le plus « conçu » du lot sur le plan de la composition. Les hauteurs de carte différenciées (74 / 79 / 74 selon le nombre de lignes du sous-titre) montrent une intention. L'étape complétée en vert avec check et le libellé « Complété » se lisent instantanément. Un seul CTA, pleine largeur, en bas : la hiérarchie d'action est juste. Le système de tons de l'InfoBanner (fond @0.07 + bordure @0.20) est cohérent et discret.

### 13 KYC Document — **6/10**

**Marqueurs forts**

- **[A] CTA « Soumettre le document »** — Même Button primary : gradient 135° #1a3da8→#3b82f6, shadow-glow-cta 0 8px 28px rgb(36 87 197 / 0.42), rayon 18px. Halo bleu net sous le bouton sur la capture.
  → *Aplat, sans ombre, rayon 12px. Et l'état par défaut devrait être DÉSACTIVÉ tant que recto+verso ne sont pas importés — ici le CTA est pleinement actif alors qu'aucun fichier n'existe.*
- **[N] Zones d'import : absence totale d'états** — Le <button> des zones n'a qu'un état : border-2 border-dashed border-border-strong (blanc@0.14), h-118px, icône 28px, « Recto » 12px + « Importer » 10px. Pas d'état rempli, pas de progression, pas d'erreur, pas de suppression.
  → *Composant à 4 états : vide (pointillé), en cours (barre de progression + nom de fichier), rempli (vignette du document + nom + poids + bouton supprimer), erreur (« photo floue — reprenez la photo », bordure danger). C'est le cœur fonctionnel de l'écran et il n'existe pas.*

**Autres marqueurs**

- **[N] Icône de la zone « Verso »** — UPLOAD_ZONES.cni : { label: "Verso", icon: RotateCw }. Une flèche circulaire de rechargement pour signifier « face arrière ».
  → *Réutiliser l'icône carte avec un indicateur « 2/2 », ou un glyphe de retournement dédié. Le choix de RotateCw est typique d'une attribution d'icône automatique par proximité sémantique du mot (« retourner » → refresh).*
- **[J] Checklist de conformité en checks verts** — 4 items préfixés d'un Check lucide 13px strokeWidth={3} en text-success #22c55e, alors que ce sont des EXIGENCES non encore vérifiées (« Document en cours de validité », « Photo nette… »).
  → *Puces neutres (tiret ou point 3px en text-muted) tant que rien n'est validé ; le check vert n'apparaît qu'après contrôle automatique du fichier importé. Un coche vert sur une condition non satisfaite est une faute sémantique, pas un style.*
- **[G] IconTile bleues sur les deux lignes de type de document** — IconTile tone="blue" size={38} → rounded-tile 12px, bg-primary-tint rgb(59 130 246 / 0.1), icônes CreditCard et FileText en #60a5fa.
  → *Supprimer les tuiles : le libellé « Carte nationale d'identité » et le radio suffisent. Si un visuel est utile, mettre la vignette réelle du document une fois importé — sinon rien.*
- **[F] Décision de mise en boîte incohérente** — Le paragraphe d'intro est à plat sur le fond (bon), mais la checklist est enfermée dans une GlassCard radius 16 / p-15 alors qu'elle est du même registre : du texte de service.
  → *Sortir la checklist de sa carte, la poser à plat sous les zones d'import avec un SectionLabel « Conditions ». La carte n'apporte ici aucune séparation fonctionnelle.*
- **[I] Monochromie bleue** — Icônes documents #60a5fa, icônes zones d'import #60a5fa, radio sélectionné #3b82f6, bordure de sélection #3b82f6, CTA dégradé bleu. Seule autre teinte : le vert #22c55e des checks.
  → *Neutraliser les icônes fonctionnelles (icon-muted), réserver le bleu #3b82f6 à l'unique signal de sélection. Le bleu perd tout pouvoir de désignation quand il est partout.*
- **[B] Pointillé 2px à blanc@0.14** — border-2 border-dashed border-border-strong sur une hauteur de 118px et un rayon rounded-card 16px.
  → *Filet 1px pointillé à blanc@0.22 (plus fin, plus contrasté), rayon 12px, et un fond blanc@0.03 au survol/appui pour signaler la zone cliquable — actuellement rien ne bouge à l'appui hormis une opacité globale.*

**Ce qui tient :** C'est l'écran le mieux conçu du lot. La sélection par bordure 2px SANS teinte de fond (selectedVariant="outline") est un choix sobre et juste, très supérieur au fond teinté générique. Le fait que les zones d'import s'adaptent au type choisi (CNI = 2 zones côte à côte, passeport = 1 zone pleine largeur en col-span-2) est du vrai raisonnement produit, pas du remplissage. Le contenu de la checklist est spécifique et actionnable (JPG/PNG/PDF, max 10 Mo, non recadrée) et non du lorem générique. Le paragraphe d'introduction posé à plat sur le fond échappe au tout-en-carte. La grille 2 colonnes gap-3 introduit enfin une variation de rythme dans un lot très vertical.

### 14 Notifs Settings — **6/10**

**Marqueurs forts**

- **[L] Densité de l'écran entier** — 3 lignes SettingsToggleRow de h-69px chacune = 207px de contenu utile, dans une fenêtre de 780px. Environ 540px de vide entre la dernière ligne et la BottomNav.
  → *Soit fusionner avec l'écran 15 en un seul « Notifications et confidentialité » à sections, soit densifier avec la vraie granularité attendue : alertes par type d'opération (dépôt / débit carte / retrait / échec), seuil de montant, heures silencieuses, alerte par carte. Trois booléens ne sont pas un centre de notifications.*
- **[N] « Notifications SMS » en OFF avec le sous-titre « Codes de confirmation »** — useState(false) sur sms, subtitle="Codes de confirmation". L'écran propose donc de désactiver la réception des OTP/3-D Secure via un simple interrupteur.
  → *Les codes de confirmation ne sont pas optionnels : soit la ligne devient « SMS promotionnels », soit elle est verrouillée avec une mention « requis pour la sécurité de votre compte ». C'est le type d'incohérence que génère une IA qui remplit trois canaux (push/e-mail/SMS) sans se demander ce que chacun transporte.*

**Autres marqueurs**

- **[N] Absence d'états système** — Aucun état « permission navigateur/OS refusée », aucun bouton « envoyer une notification test », aucune adresse e-mail affichée sous « Notifications e-mail », aucun numéro sous « SMS ».
  → *Afficher la cible sous chaque canal (jean.dupont@email.com, +225 07 •• •• 41) avec un lien « modifier », et un bandeau d'alerte si l'autorisation système est refusée. Un réglage de notification sans destinataire visible est un placeholder.*
- **[J] Absence de regroupement et de hiérarchie** — 3 lignes identiques : titre 14px medium #eef2ff, sous-titre 12px rgb(148 172 255 / 0.38), toggle 42×24 à droite. Aucun SectionLabel, aucun groupe, aucun séparateur de section.
  → *Regrouper sous des SectionLabel réels (« Transactions », « Compte », « Sécurité ») avec 24px entre groupes, et passer l'échelle à 15/13. Une liste plate de 3 items indifférenciés ne demande aucune décision de conception — c'est ce qui la trahit.*
- **[K] Rythme vertical parfaitement régulier** — h-69px identiques, dividers border-border blanc@0.08 sur toute la largeur (px-5 → x=20 à x=370), gouttières égales. Zéro variation.
  → *Indenter le divider au niveau du texte (aligné sur x=20 mais s'arrêtant avant le toggle, ou pleine largeur uniquement entre groupes), et respirer différemment entre groupes (24px) et à l'intérieur d'un groupe (0).*
- **[B] Toggle 42×24 entièrement pilulaire** — Toggle : h-6 w-[42px] rounded-full, pastille size-5 blanche, track bg-primary #3b82f6 ON / bg-surface-4 blanc@0.14 OFF, translation 2px → 20px.
  → *Rien de fautif fonctionnellement, mais c'est l'interrupteur iOS par défaut, choisi par personne. Un système assumé le redessine (track 44×26, pastille avec micro-ombre, couleur ON = la couleur de marque exacte et non le bleu Tailwind #3b82f6).*

**Ce qui tient :** La vraie bonne décision du lot : les lignes sont posées À PLAT sur le fond, séparées par des hairlines, au lieu d'être enfermées chacune dans une carte arrondie. C'est exactement l'inverse du réflexe « tout-en-carte » et il faut le conserver et l'étendre aux autres écrans. La politique de divider est correcte ici (pas de trait sous la dernière ligne). Aucune tuile d'icône sur les lignes — encore une fois, la retenue est bonne. Les sous-titres portent une information réelle (« Alertes transactions », « Relevés mensuels ») et pas du remplissage. Les états ON/OFF des toggles sont immédiatement lisibles en mode sombre.

### 15 Confidentialite — **6/10**

**Marqueurs forts**

- **[N] Filet horizontal sous la DERNIÈRE ligne** — Les deux SettingsToggleRow portent divider (border-b blanc@0.08), donc un trait est tracé sous « Données de navigation » avec 890px de vide en dessous. Le commentaire du code assume l'écart avec l'écran 14 (« différence voulue vs écran 14 »).
  → *Trait entre les lignes uniquement, jamais après la dernière. Deux écrans frères avec des règles de divider contradictoires, c'est la preuve qu'aucune décision de système n'a été arbitrée : la maquette a été reproduite pixel par pixel, artefact d'import compris.*
- **[L] Densité de l'écran** — 2 lignes de 69px = 138px de contenu sur 780px de hauteur. Le vide occupe plus de 80% de l'écran.
  → *Fusionner dans l'écran Notifications, ou remplir avec ce qu'un écran Confidentialité doit contenir (cf. ci-dessous). En l'état, un utilisateur qui ouvre cet écran a l'impression que l'app est cassée.*
- **[N] Contenu absent pour un écran « Confidentialité » en fintech régulée** — Deux interrupteurs. Aucun export de données, aucune suppression de compte, aucun journal de consentements RGPD, aucune liste des appareils/sessions actives, aucun partage avec des tiers, aucun lien vers la politique de confidentialité.
  → *Sections « Vos données » (exporter, supprimer le compte), « Sécurité du compte » (appareils connectés avec date et ville, déconnexion à distance), « Consentements » (analytique, marketing, avec date de recueil), et le lien légal en pied. C'est réglementairement obligatoire et cela remplit l'écran naturellement.*

**Autres marqueurs**

- **[N] « Données de navigation » activé par défaut** — useState(true) sur browsingData, sous-titre « Améliorer l'expérience utilisateur » — formule générique, aucun lien vers la politique, aucune mention du destinataire des données.
  → *Opt-in par défaut à false, sous-titre explicite (« Statistiques d'usage anonymisées transmises à FixPay »), lien « En savoir plus ». Le libellé actuel est le libellé passe-partout que produit une génération automatique.*
- **[J] Même échelle plate que l'écran 14** — Titre 14px medium, sous-titre 12px à rgb(148 172 255 / 0.38) — soit un contraste très faible sur #070c1a pour un texte qui explique une conséquence importante (« Les montants seront masqués à l'ouverture »).
  → *Sous-titre à --c-text-secondary (blanc bleuté @0.65) et non @0.38, taille 13px. Un texte qui décrit une conséquence n'est pas un texte tertiaire.*

**Ce qui tient :** Comme l'écran 14, la structure à plat sur le fond, sans cartes, est la bonne décision et doit être conservée. Le sous-titre « Les montants seront masqués à l'ouverture » est une des meilleures micro-copies du lot : il décrit la conséquence concrète du réglage plutôt que de reformuler le titre. Le fait d'exposer « Masquer les soldes par défaut » témoigne d'une compréhension réelle du contexte d'usage (paiement mobile en espace public), ce qui est très pertinent pour un marché africain — c'est une idée à garder et à développer, pas à supprimer.

### 16 Parametres — **7/10**

**Marqueurs forts**

- **[N] Devise d'affichage = « EUR — Euro »** — settingsOptions.devise = "EUR — Euro" comme valeur affichée par défaut, et DEVISE_OPTIONS = [EUR, "XOF — Franc CFA", "USD — Dollar"] dans cet ordre. Or le portefeuille est en FCFA partout ailleurs dans mock-data (« 1,8M FCFA », « 816 202 FCFA », transactions currency: "FCFA").
  → *XOF — Franc CFA en défaut et en premier ; EUR/USD ensuite. C'est la preuve la plus nette du lot que les écrans ont été générés depuis un gabarit de fintech européenne : l'app affiche des FCFA sur tous les autres écrans et propose l'euro comme devise d'affichage par défaut. À corriger en même temps que les écrans 17 et 18.*
- **[A] CTA « Sauvegarder »** — h-50px pleine largeur, rounded-panel 18px, gradient-brand 135°, shadow-glow-cta 0 8px 28px rgb(36 87 197 / 0.42). C'est le halo le plus visible du lot car le bouton est isolé sur un fond vide : la nappe bleue se lit à ~30px sous le bouton.
  → *Double correction. (1) Supprimer glow + dégradé : aplat, rayon 12px, sans ombre. (2) Revoir le rôle : des réglages s'enregistrent au changement (le toggle des écrans 14/15 s'applique instantanément — incohérence interne). Si un bouton reste nécessaire, il doit être compact, aligné à droite, secondaire — pas un CTA principal pleine largeur.*
- **[L] Trois champs et rien d'autre** — 3 SelectField (Langue, Devise, Thème) + 1 bouton. Aucun accès au compte, à la sécurité (code PIN, biométrie), aux comptes Mobile Money liés, aux plafonds, aux mentions légales, à la version de l'app, ni à la déconnexion.
  → *Structurer en sections : Compte, Sécurité, Comptes liés (Orange Money / MTN / Wave), Préférences (les 3 champs actuels), À propos (version, CGU, confidentialité), et « Se déconnecter » en bas en danger discret. Un écran Paramètres à 3 champs est un placeholder.*

**Autres marqueurs**

- **[J] Trois micro-labels en capitales espacées empilés** — SectionLabel : 10.5px, font-medium, uppercase, tracking-label 0.1em, couleur --c-text-muted = rgb(148 172 255 / 0.38). Soit « LANGUE », « DEVISE D'AFFICHAGE », « THÈME » empilés verticalement à faible contraste.
  → *C'est la signature typographique du formulaire généré. Passer en bas de casse 13px à --c-text-secondary, ou mieux : supprimer le label externe et adopter le vrai motif de réglages (libellé à gauche dans la ligne, valeur alignée à droite en muted + chevron), qui divise la hauteur par deux et supprime les capitales.*
- **[F] Champs de formulaire pour des choix de préférence** — SelectField : h-48px, rounded-field 14px, bg-surface blanc@0.05, border-border-strong blanc@0.14, chevron 12px. Trois boîtes identiques empilées.
  → *Choisir sa langue ou son thème n'est pas de la saisie de données : ligne tappable (libellé gauche / valeur droite / chevron) ouvrant une feuille de sélection. On gagne en densité et on supprime trois surfaces.*
- **[I] Chevron bleu sur les trois champs** — ChevronDown 12px en text-primary-light #60a5fa, sur un glyphe purement fonctionnel, répété trois fois.
  → *Chevron en --c-icon-muted. Le bleu de marque doit signaler ce qui est actionnable de façon exceptionnelle, pas décorer chaque affordance.*
- **[K] Grille desktop** — lg:grid-cols-2 : Langue et Devise sur la ligne 1, Thème seul sur la ligne 2 avec une colonne droite vide, puis le CTA « Sauvegarder » (lg:w-auto lg:px-8) sous la colonne gauche. Environ 500px de vide à droite dans le conteneur max-w-720px, lui-même perdu dans une fenêtre de 1440px.
  → *En desktop, l'écran de réglages doit passer en deux colonnes réelles (navigation des sections à gauche, contenu à droite) plutôt qu'en grille de champs qui laisse un orphelin. Ici la maquette mobile a simplement été étirée.*

**Ce qui tient :** Les selects sont de vrais <select> natifs (appearance-none + chevron custom), donc accessibles au clavier et compatibles avec les sélecteurs système sur mobile — c'est un choix d'implémentation sain et rare. Le tiret cadratin dans « EUR — Euro » est une attention typographique réelle (et documentée dans le code). La hauteur de champ à 48px est correcte pour la cible tactile, et la bordure blanc@0.14 délimite sans crier. Le hover (border-primary/40 + bg-surface-2) est une affordance desktop propre. L'intention de laisser l'utilisateur choisir le thème est cohérente avec le double thème réellement construit dans globals.css.

### 17 Parrainage — **8/10**

**Marqueurs forts**

- **[D] Cercle blanc débordant du hero** — HeroGradientCard radius 18 → DEFAULT_CIRCLE { size: 140, className: "-top-10 -right-10" }, bg-white/[0.07]. Sur la capture, le disque occupe visiblement le tiers droit du bandeau et se termine juste sous la fin du paragraphe.
  → *Supprimer le cercle. C'est le marqueur le plus reconnaissable de génération automatique, et il est répliqué à l'identique sur les écrans 12, 17 et 18 — trois fois le même artefact décoratif, donc trois fois le même aveu.*
- **[N] Récompense libellée en euros et formatée à l'anglo-saxonne** — « Gagnez €10 par ami », « vous recevez €10 », mock-data referral = { reward: "€10" }. Symbole AVANT le nombre, alors que la typographie française écrit « 10 € » avec espace insécable fine. Et l'app est en FCFA partout ailleurs.
  → *« Gagnez 5 000 FCFA par ami », format « 5 000 FCFA » avec espace insécable fine comme séparateur de milliers (ce que fait déjà lib/format.ts pour les transactions FCFA — l'incohérence est interne au code). Le « €10 » collé devant le chiffre est une trace directe de copie générée en anglais puis traduite.*
- **[N] Aucune action de partage sur un écran de parrainage** — L'écran contient un bouton « Copier » (h-26px) et rien d'autre. Aucun « Partager », aucun lien de parrainage, aucun QR code.
  → *CTA principal « Partager mon lien » ouvrant le partage natif, avec WhatsApp en premier raccourci — sur ce marché, WhatsApp EST le canal de distribution. Le code seul, sans lien ni partage, est un artefact de gabarit.*

**Autres marqueurs**

- **[L] État vide « Mes parrainages »** — GlassCard avec SectionLabel + une phrase : « Aucun parrainage enregistré pour le moment. » Aucun compteur de gains cumulés, aucun statut d'invitation, aucun visuel, aucune action.
  → *Un état vide utile : total gagné (0 FCFA), nombre d'invitations envoyées / inscrits / ayant rechargé, et le CTA de partage répété. Et une fois peuplé, une liste avec l'étape atteinte par chaque filleul et la date.*
- **[J] Interlettrage du code de parrainage** — font-mono (DM Mono) 18px avec tracking-[2px] appliqué EN PLUS de la chasse fixe. Rendu visible sur la capture : « F P - J D 2 0 2 4 » quasiment dissocié.
  → *La chasse fixe suffit à donner la lisibilité caractère par caractère. Ramener le tracking à 0.5px maximum et monter à 20–22px pour donner du poids au code plutôt que de l'étaler.*
- **[B] Bouton « Copier » pilulaire dans un champ** — Button variant small surchargé : h-[26px], rounded-[10px], bg-primary #3b82f6, px-14px — posé à l'intérieur d'une GlassCard radius 14px. Deux rayons distants de 4px imbriqués, et un pavé bleu plein pour une action secondaire.
  → *Bouton texte (« Copier » en #3b82f6, sans fond) ou icône seule 20px, avec le feedback « Copié ! » conservé. Un aplat de couleur de marque pour une action de confort déséquilibre l'écran.*
- **[F] Trois conteneurs de trois natures pour trois informations** — Hero dégradé r18 → champ blanc@0.05 borderStrong r14 → GlassCard blanc@0.05 border r16. Trois remplissages, trois rayons, aucune information n'est posée à plat.
  → *Le bandeau promotionnel garde une surface distincte ; le code et la liste des filleuls passent à plat sur le fond avec des SectionLabel, comme sur les écrans 14/15. La variation de densité crée à elle seule la hiérarchie.*
- **[K] Mesure du paragraphe hero en desktop** — max-w-[298px] mobile / lg:max-w-[440px] dans une carte de ~640px de large : le texte s'arrête au tiers droit, exactement là où commence le cercle décoratif, laissant un trou dans la composition.
  → *Si la mesure est volontairement courte (bien), l'espace libéré doit accueillir quelque chose d'utile (le compteur de gains, une illustration de marque) — pas un disque flou.*

**Ce qui tient :** Le traitement du code en DM Mono est un vrai réflexe de designer : distinguer un identifiant à saisir du reste du texte est exactement ce qu'il faut faire. Le feedback de copie (« Copié ! » pendant 1600 ms via un timer nettoyé) est un détail d'interaction réel, écrit par quelqu'un qui pense à l'usage. Le SectionLabel au-dessus du champ crée une hiérarchie correcte entre le bandeau et le contenu. Et surtout : un état vide EXISTE, ce qui est rare dans un jeu d'écrans générés — il est pauvre, mais il est là et il suffit de l'enrichir.

### 18 Fidelite — **9/10**

**Marqueurs forts**

- **[H] Composition entière du hero** — HeroGradientCard align="center" : micro-label « VOS POINTS » 12px uppercase tracking-1px blanc@0.70, puis « 240 » en 42px/55px bold blanc, puis « = €2.40 de réduction » 12px blanc@0.60. Le tout centré sur un dégradé 135° trois arrêts, dans un écran qui ne contient rien d'autre qu'un bandeau d'info.
  → *C'est la composition canonique de l'écran de succès généré, appliquée à un solde de fidélité. Le remède n'est pas cosmétique : donner un CONTENU à l'écran (voir ci-dessous), et rétrograder le solde en en-tête à plat aligné à gauche — chiffre 34px, libellé au-dessus en 13px, pas de dégradé, pas de centrage.*
- **[L] Densité : un nombre et une phrase** — Contenu total de l'écran : « 240 », « = €2.40 de réduction », et une InfoBanner de deux lignes. Environ 620px de vide sous le bandeau en mobile, et une page desktop 1440×900 remplie à 30%.
  → *Un programme de fidélité, c'est : l'historique des points gagnés (date, opération, points), la date d'expiration des points, les paliers avec une barre de progression vers le suivant, un catalogue de récompenses, et un CTA « Utiliser mes points ». Sans action d'échange, l'écran n'a aucune raison d'exister.*
- **[D] Cercle décoratif derrière le nombre centré** — DEFAULT_CIRCLE[18] : 140×140px, bg-white/[0.07], -top-10 -right-10. Comme le contenu est centré, le disque se retrouve visuellement à droite de « 240 » et casse la symétrie que la composition prétend établir.
  → *Supprimer le cercle. Sur cet écran il est doublement fautif : marqueur de génération ET contradiction avec le parti pris centré.*
- **[N] Devise et format numérique** — « = €2.40 de réduction » et « 1 point par euro dépensé […] 100 points = €1 de réduction ». Point décimal au lieu de la virgule française, symbole avant le nombre, et euro dans une app dont toutes les transactions sont libellées en FCFA.
  → *« = 1 600 FCFA de réduction », « 1 point par tranche de 100 FCFA dépensés ». Trois fautes cumulées (devise, position du symbole, séparateur décimal) dans deux phrases : c'est de la copie générée jamais relue par un locuteur ni par un responsable produit local.*

**Autres marqueurs**

- **[J] Traitement du grand nombre** — 42px/55px font-bold DM Sans, tracking par défaut, et AUCUN font-variant-numeric: tabular-nums dans tout le projet (grep « tabular » : zéro occurrence).
  → *tabular-nums sur toutes les valeurs monétaires et numériques du produit ; sur un chiffre d'affichage à 42px, resserrer l'interlettrage (-0.02em) et envisager une graisse 700 sur une échelle de titrage assumée. En l'état les chiffres sauteront dès qu'ils s'animeront ou changeront.*
- **[K] Deux blocs de largeur et de marge identiques** — Hero (rounded-panel 18px) et InfoBanner (rounded-card 16px) partagent px-5, la même largeur et 18px d'écart. Un delta de rayon de 2px n'est pas perceptible : les deux blocs se lisent comme une pile homogène sans hiérarchie.
  → *Soit le hero devient dominant (pleine largeur bord à bord, hauteur accrue, contenu aligné à gauche), soit les rayons s'unifient à 14px et la hiérarchie passe par le contraste de fond. Choisir — ne pas différencier de 2px.*
- **[I] Aucune couleur d'accent sur l'écran qui la justifierait le plus** — Tout est bleu (#0b1c6b → #1a3da8 → #2457c5 pour le hero, #60a5fa pour l'icône info, rgb(59 130 246 / 0.07) pour le fond du bandeau). Or la palette contient --c-gold #fcd34d et --c-warning #f59e0b, utilisés uniquement sur la puce de la carte bancaire.
  → *La fidélité est précisément le territoire d'une seconde couleur de marque. Utiliser l'or/ambre déjà présent dans les tokens pour les points et les paliers, et libérer le bleu pour la navigation et les actions.*

**Ce qui tient :** La hiérarchie d'opacités du hero (blanc@0.70 pour le label, blanc plein pour la valeur, blanc@0.60 pour l'équivalence) est une micro-décision réelle et bien exécutée : trois niveaux lisibles avec une seule couleur. La ligne d'équivalence sous les points bruts (« = x de réduction ») est une excellente idée produit — traduire une unité abstraite en valeur monétaire est exactement ce qu'un bon designer fait, et il faut la garder telle quelle en corrigeant seulement la devise. Le bandeau d'information explique le taux d'acquisition de façon concrète et chiffrée (1 point par unité, 100 points = 1 unité) au lieu de renvoyer vers un règlement.

### 19 Profil — **7/10**

**Marqueurs forts**

- **[D] Cercles décoratifs du hero (DecorativeCircles)** — 240px white@0.07 en haut-droite (-70px/-50px) + 170px white@0.04 en bas-gauche (-40px/-30px). Dans la capture, le cercle bas-gauche passe derrière l'avatar et son arc coupe l'anneau `ring-[3px]` white@0.28 ; le cercle haut-droit occupe environ un tiers de la surface du hero. Le même composant est déjà utilisé sur la carte bancaire.
  → *Supprimer les deux cercles. Le blob blanc flou débordant d'une surface à dégradé est la signature quasi certaine d'une génération. Si de la profondeur est voulue, un dégradé vertical simple #0b1c6b → #16296b suffit.*
- **[C] Fond du hero** — `gradient-card: linear-gradient(135deg, #0b1c6b 0%, #1a3da8 55%, #2457c5 100%)` — exactement le même dégradé que la face de la carte bancaire (VirtualCard) et que les héros KYC / Parrainage / Fidélité / Support. Cinq objets différents portent la même peau.
  → *Passer le hero Profil en aplat `--c-bg-raised` #0d1629 avec un filet bas white@0.08, et réserver le dégradé 135° à la carte bancaire uniquement. Aujourd'hui l'objet identitaire du produit n'a plus de statut visuel particulier.*
- **[N] Badge « Compte vérifié » vs bannière KYC** — Badge vert `bg rgb(34 197 94/0.18) / border rgb(34 197 94/0.30)` « ✓ Compte vérifié » ; 90px plus bas, bannière bleue « Vérification KYC en cours — Étape 2 sur 3 ». Un compte ne peut pas être vérifié et en cours de vérification. `user.verified: true` et la bannière KYC coexistent dans les mêmes données.
  → *Un seul état de vérité : badge ambre « Vérification en cours · 2/3 » cliquable, et supprimer la bannière — ou badge vert « Vérifié » et suppression de la bannière. Une contradiction logique à 90px d'écart est le tell de contenu le plus révélateur de l'écran.*
- **[G] Colonne des tuiles d'icône (liste « Compte »)** — 6 lignes « Compte » + 2 lignes cartes + 1 ligne « Ajouter » = 9 rangées consécutives, chacune précédée d'un carré 36px rayon 11px (`--radius-tile-sm`) ; 7 d'entre elles en `tone="blue"` → `bg-primary-tint rgb(59 130 246 / 0.1)` avec icône `--c-primary-light` #60a5fa. Une colonne de sept carrés bleus rigoureusement identiques.
  → *Supprimer les tuiles de la liste « Compte » : icône lucide 18px nue en `--c-icon-muted` rgb(220 230 255/0.58), ou rien du tout (le libellé suffit). Conserver la tuile teintée uniquement sur les lignes cartes, où la teinte encode réellement la marque (bleu Visa / bordeaux Mastercard).*

**Autres marqueurs**

- **[N] Attribution des icônes** — « Notifications » utilise `Lock` (page.tsx l.234), « Sécurité et confidentialité » utilise `Shield` (l.221), et la bannière KYC utilise aussi `Shield` (l.138). Cadenas pour des notifications est une erreur pure ; Shield est employé deux fois sur le même écran.
  → *`Bell` pour Notifications, `Lock` pour Sécurité, `BadgeCheck` ou `ScanFace` pour le KYC, `Gift` pour Parrainage, `Sparkles` pour Fidélité, `LifeBuoy` pour Support. Une icône mal assignée dans une liste de réglages est le genre de détail qu'un DA n'aurait jamais laissé passer.*
- **[I] Couleurs de la bande de 3 statistiques** — `profileStats` : « 2 » en `text-primary` #3b82f6, « 24 » en `text-text` #eef2ff, « 1,8M FCFA » en `text-success` #22c55e. Aucune règle sémantique — pourquoi un comptage de cartes serait bleu et un comptage de transactions blanc ? Le vert du portefeuille suggère à tort une variation positive.
  → *Les trois valeurs en `--c-text`, le label en dessous porte le sens. Réserver la couleur au seul cas où elle encode une information (variation, alerte, statut).*
- **[N] Format des nombres** — « 1,8M FCFA » (virgule décimale + abréviation) dans la bande de stats, et « 816 202 FCFA » / « 394 895 FCFA » (espace fine insécable, valeur complète, via `formatFcfa`) dans la liste des cartes 200px plus bas. Deux conventions numériques sur un même écran, dont une abrégée pour un solde de portefeuille.
  → *Une seule convention : « 1 866 252 FCFA » avec `tabular-nums` partout. L'abréviation en M ne se justifie que sur des graphiques contraints en largeur, jamais sur le solde principal d'un utilisateur.*
- **[N] Actions absentes de l'écran Profil** — La liste s'arrête à « Aide et support » (page.tsx l.257-270). Aucun « Se déconnecter », aucun « Modifier le profil », aucune suppression de compte, aucune mention légale ni numéro de version. Par ailleurs un chevron retour vers « / » figure dans le hero alors que Profil est un onglet racine de la BottomNav — il double l'onglet « Accueil ».
  → *Ajouter en bas : « Se déconnecter » en lien texte `--c-danger` centré, puis « CGU · Confidentialité · v1.4.2 » en 11px muet. Supprimer le chevron retour du hero (un onglet racine n'a pas de retour) et ajouter un bouton « Modifier » à côté du nom.*
- **[F] Traitement identique des sections « Mes cartes » et « Compte »** — Les deux utilisent le même `ListGroup` : GlassCard `radius={18}`, `bg-surface` white@0.05, `border-border` white@0.08, rangées `h-[65px]`, filets `divide-border`. Les actifs financiers de l'utilisateur et ses réglages système ont exactement le même poids et la même densité.
  → *Différencier : cartes en carrousel horizontal de vraies vignettes (ou rangées 72px avec la vignette carte, pas une icône), réglages en rangées 52px à plat sur le fond avec simples filets 1px, sans conteneur ni bordure. C'est cette variation de densité qui manque le plus à l'écran.*
- **[I] Tuile de la ligne Mastercard** — `tone="mastercard"` → fond `--c-mc-tint` rgb(139 26 58/0.12) et icône `--c-danger-light` #f87171. Une pastille rouge, alignée dans la même colonne que la pastille bleue de la Visa, immédiatement à gauche d'un statut « Actif » écrit en vert.
  → *Utiliser la vraie identité Mastercard (les deux disques rouge/orange déjà présents dans `BrandMark`) plutôt qu'une icône `CreditCard` teintée en rouge d'erreur, ou supprimer la tuile et afficher le logo de la marque en 24px.*
- **[J] Chevrons de fin de rangée** — Glyphe texte « › » à 17px en `--c-text-muted` rgb(148 172 255 / 0.38), alors que toutes les autres icônes de l'écran sont des tracés lucide de 15-16px. Le glyphe DM Sans a un poids de trait et un centrage optique différents des icônes voisines.
  → *`ChevronRight` lucide 16px, `strokeWidth={1.5}` + `absoluteStrokeWidth`, couleur `--c-icon-muted`, pour un poids de trait homogène avec l'icône de tête de rangée.*

**Ce qui tient :** Les rangées de cartes sont le meilleur contenu des quatre écrans du lot : « Visa •••• 4291 » avec « 816 202 FCFA · Actif » en sous-ligne, c'est dense, factuel et directement actionnable — exactement ce qu'un designer produit aurait écrit. La bande de 3 statistiques posée à plat sur `--c-bg-raised` #0d1629 avec des filets verticaux `divide-x` est le seul bloc du lot qui échappe au « tout-en-carte » : c'est le bon modèle à généraliser. La bannière KYC avec une étape précise (« Étape 2 sur 3 ») et une action (« Continuer ») est un vrai motif de divulgation progressive. Le hero à fond perdu jusqu'aux bords de l'écran, sans marge latérale, est une décision juste qui donne de l'assise à l'écran. Et le bloc avatar / nom / e-mail est correctement hiérarchisé (68px / 19px bold / 12,5px à 58 %).

### 20 Succes Carte — **8/10**

**Marqueurs forts**

- **[N] Libellé de confirmation sous le badge** — h1 = « Carte activée ! » (19px/25px bold) puis, 3.5px plus bas, un paragraphe vert #22c55e 14px semibold qui dit « Paiement confirmé », puis « Votre carte est maintenant active » en 12.5px muted. Trois messages pour un seul événement, dont un qui parle d'un paiement qui n'a pas eu lieu (la carte est créée à 0 FCFA).
  → *Supprimer le bloc trois-étages. Un seul titre : « Votre carte Visa est prête » (24px), une seule sous-ligne factuelle : « Créée le 30 juil. · •••• 4291 ». Le mot « Paiement confirmé » disparaît entièrement du flux de création de carte.*
- **[D] Cercles décoratifs de la VirtualCard lg** — DecorativeCircles topRight 210px + bottomLeft 170px, bg-white/[0.07] et bg-white/[0.04], débordant de la carte 348×192 en overflow-hidden. Ils sont parfaitement visibles dans la capture (deux disques laiteux qui coupent le numéro masqué).
  → *Supprimer les deux cercles. Si un relief est voulu sur la carte : un unique linear-gradient(160deg) 2 stops très rapprochés (#0b1c6b → #16307f) + un bruit 2 % en overlay, rien de géométrique.*
- **[A] Ombre de la VirtualCard** — --s-card-hero = 0 20px 60px rgb(11 28 107 / 0.55). 60px de flou et un décalage de 20px sous un objet de 192px de haut, en couleur bleu marine saturée.
  → *0 2px 8px rgb(0 0 0 / 0.35) + 0 0 0 1px rgb(255 255 255 / 0.06). L'objet doit être posé, pas en lévitation.*
- **[N] Contenu de la carte fraîchement créée** — number="•••• •••• •••• ••••" (16 puces, zéro chiffre), holder="NOM PRÉNOM", expiry="12/28". Le placeholder de maquette a été livré tel quel — la carte du dessous du même écran s'appelle pourtant visa-4291 (href du CTA : /cards/visa-4291).
  → *Afficher les 4 derniers chiffres réels (« •••• •••• •••• 4291 ») et le nom du porteur du compte. Sur un écran de succès de création, l'utilisateur veut vérifier que c'est bien SA carte.*
- **[F] Panneau « Informations de la carte »** — GlassCard radius 18 p-17 qui contient une grille 2×2 de 4 GlassCard radius 16 p-15, chacune avec sa propre bordure white@0.08 et son fond white@0.05. Cartes dans une carte, deux bordures concentriques à 2px d'écart.
  → *Supprimer le conteneur ET les tuiles. Une liste définition à plat sur le fond : label 11px muted à gauche, valeur 13px semibold à droite, hairline white@0.06 entre les lignes. Gain : ~90px de hauteur et une seule bordure.*

**Autres marqueurs**

- **[N] Redondance des données du panneau** — « EXPIRATION 12 / 28 » répète le « EXP: 12/28 » imprimé sur la carte 200px au-dessus ; « SOLDE INITIAL 0 FCFA » est une non-information ; « TYPE Visa Virtuelle » répète le logo VISA de la carte. 3 des 4 tuiles sont du remplissage.
  → *Ne garder que ce qui n'est pas déjà lisible sur la carte : plafond mensuel, devise de règlement, frais d'émission. Sinon supprimer le bloc.*
- **[J] Tuile « STATUT »** — value={"●\nActif"} rendu avec whitespace-pre-line : le caractère typographique ● est utilisé comme pastille d'état et se retrouve seul sur sa ligne, au-dessus du mot « Actif ». Visible tel quel dans la capture.
  → *Un vrai <StatusDot size={7} colorClass="bg-success"/> en inline-flex avec le libellé : `● Actif` sur une seule ligne, baseline alignée. Le composant existe déjà dans le design system (utilisé écrans 26/27/28).*
- **[C] Gradient du badge 72px** — gradient-badge-bluegreen = linear-gradient(135deg, #1a3da8 0%, #22c55e 100%) — un dégradé bleu-marque vers vert-succès, plus --s-glow-success = 0 10px 32px rgb(34 197 94 / 0.35). Le dégradé est visible comme un virage sale bleu→turquoise→vert.
  → *Aplat #16a34a, rayon 16px, taille 56px, icône Check 24px trait 2.5px, aucune ombre. Un dégradé bleu→vert n'a aucune justification sémantique.*
- **[B] Échelle de rayons sur ce seul écran** — 22px (carte), 18px (panneau + CTA), 16px (4 tuiles + InfoBanner), 22px (badge 72). Le système global déclare 14 rayons distincts : 2,4,8,10,11,12,13,14,16,18,20,22,28,44.
  → *Réduire à 4 rayons assumés : 4 (pastilles/barres), 8 (tuiles, champs), 12 (cartes, panneaux, CTA), 20 (objet identitaire = la carte bancaire uniquement).*
- **[A] CTA « Accéder à ma carte → »** — h-50 rounded-18 gradient-brand 135° #1a3da8→#3b82f6 + --s-glow-cta = 0 8px 28px rgb(36 87 197 / 0.42), plus une flèche → en caractère texte dans le libellé.
  → *Aplat #2563eb, rayon 12px, aucune ombre, libellé « Voir ma carte » sans flèche typographique (si une flèche est voulue : ArrowRight 16px en icône, gap 8px).*
- **[E] InfoBanner bleu de bas de page** — bg rgb(59 130 246 / 0.07) + border rgb(59 130 246 / 0.20) + rayon 16 + icône Info 15px #60a5fa. Double transparence documentée comme « intentionnelle » dans le composant.
  → *Choisir : soit le fond teinté sans bordure, soit une bordure gauche 2px pleine sans fond. Pas les deux — la double transparence donne cet aspect « carte de verre » générique.*

**Ce qui tient :** La géométrie de la face de carte est vraiment bien réglée et mérite d'être gardée telle quelle : puce or 40×29 rayon 6 à left-20/top-46, numéro en DM Mono 13px avec tracking 4px, porteur 11.5px tracking 1.5px, VISA en italique extrabold tracking -0.5px, opacités différenciées (0.88 / 0.78 / 0.46). C'est de l'observation réelle d'une carte physique, pas de la génération. Bonne décision produit aussi : ni bottom nav ni bouton retour — le flux est terminé, on ne propose qu'une sortie. Et la grille 2×2 est le bon parti de mise en page pour comparer 4 attributs, c'est son habillage (tuiles vitrées imbriquées) qui est à jeter, pas sa structure.

### 21 Succes Depot — **9/10**

**Marqueurs forts**

- **[H] Badge de succès 88px** — size 88, rounded-badge = 28px (soit 32 % du côté, squircle iOS), gradient-badge-green = linear-gradient(135deg,#059669,#22c55e), icône CloudUpload 42px trait 2px, et surtout glow = --s-glow-badge = 0 12px 40px rgb(59 130 246 / 0.35) : un halo BLEU sous un badge VERT. Le composant documente ce choix comme « deliberate design quirk » — c'est en réalité la signature d'un glow appliqué par défaut à tous les badges.
  → *Supprimer le glow entièrement. Badge 56px, rayon 16px, aplat #16a34a, icône Check 24px trait 2.5px. Si un halo est absolument voulu, il doit au minimum être de la couleur du badge, jamais bleu.*
- **[A] Halo du CTA « Retour à l'accueil »** — --s-glow-cta = 0 8px 28px rgb(36 87 197 / 0.42) sous un bouton 340×50. Sur fond #070c1a le halo forme une flaque bleue de ~380px de large parfaitement visible dans la capture.
  → *Supprimer. Un CTA plein sur fond sombre n'a besoin d'aucune ombre : le contraste de valeur suffit. Au pire 0 1px 2px rgb(0 0 0 / 0.3).*
- **[N] Montant affiché** — amount="0 FCFA". Un écran de confirmation de dépôt qui annonce zéro franc. Aucune autre donnée : pas de référence de transaction, pas de nouveau solde, pas d'opérateur (Wave / Orange Money), pas d'horodatage, pas de frais, pas de lien vers le reçu.
  → *Montant réel + bloc de reçu à plat sous le titre : « Source : Wave •••• 82 », « Frais : 0 FCFA », « Nouveau solde : 393 576 FCFA », « Réf. FP-2K7H91 », « 30 juil. 14:32 ». Plus une action secondaire « Partager le reçu ». C'est ce qui distingue un écran fintech d'un écran de démo.*
- **[L] Densité de la page** — 5 éléments (badge, titre, montant, sous-titre, bouton) sur 780px de haut ; environ 420px de vide continu réparti en haut et en bas par le `justify-center` du min-h-dvh.
  → *Ancrer le contenu en haut (pt-96px) et occuper le bas par le reçu détaillé + deux actions (« Nouveau dépôt » en secondaire, « Retour » en primaire). Le vide au centre d'un écran de confirmation bancaire est du gaspillage, pas du souffle.*

**Autres marqueurs**

- **[J] Traitement du montant** — 38px/50px font-bold, colorClass="text-success" (#22c55e), pas de font-variant-numeric: tabular-nums, pas de tracking négatif, pas de différenciation entre le nombre et la devise (« 0 FCFA » est une seule string en vert vif).
  → *Montant en 34px bold tracking -1px tabular-nums, couleur --c-text (blanc), et « FCFA » en 16px medium sur la baseline en --c-text-secondary. La couleur verte doit servir la pastille d'état, pas le chiffre — sinon on ne peut plus coder un montant par sa nature (débit/crédit).*
- **[C] Dégradé du CTA** — gradient-brand = linear-gradient(135deg, #1a3da8 0%, #3b82f6 100%) sur un bouton de 50px de haut : le dégradé parcourt 100 % de sa plage sur une diagonale de 344px, résultat un bouton visiblement plus clair à droite qu'à gauche.
  → *Aplat #2563eb. Réserver le dégradé au seul objet identitaire du produit : la carte bancaire.*
- **[K] Composition** — main flex min-h-dvh items-center justify-center text-center ; rythme vertical mt-7 / mt-2.5 / mt-3 / mt-13 (28/10/12/52px) sur un axe unique parfaitement centré, marges px-6 identiques des deux côtés.
  → *Aligner titre, montant et reçu à gauche sur la gouttière 20px, ne garder centré que le badge d'état. L'asymétrie crée la hiérarchie ; le tout-centré la supprime.*
- **[L] Rendu desktop** — En 1440×900 (shots-desktop-dark/21) le même badge 88px et le même bouton restent centrés dans un viewport vide : le contenu occupe ~240px de large sur 1440, sans sidebar (l'écran est hors du layout (flows)).
  → *Sur ≥1024px, présenter le reçu en carte de 480px avec le détail de la transaction, ou rediriger vers l'accueil avec un toast. Un écran plein vide n'est pas une réponse desktop.*

**Ce qui tient :** Le choix de ne mettre AUCUNE navigation (pas de bottom nav, pas de retour) sur un écran terminal est juste : une seule sortie, pas d'ambiguïté. La contrainte de largeur du sous-titre à 320px avec leading 23px est un vrai réglage typographique (elle évite les veuves), et le fait que la même valeur soit tenue sur les écrans 22 et 25 montre une intention. Le CTA à 340px de large plutôt que pleine largeur est aussi un bon réglage : il ne touche pas les bords, ce qui donne au bouton un statut d'objet et pas de barre.

### 22 Succes Retrait — **9/10**

**Marqueurs forts**

- **[H] Badge ambre avec halo bleu** — 88px rayon 28px, gradient-badge-amber = linear-gradient(135deg,#d97706,#f59e0b), et glow --s-glow-badge = 0 12px 40px rgb(59 130 246 / 0.35). Le halo bleu sous un badge orange produit un liseré froid visible sur tout le pourtour dans la capture — c'est chromatiquement faux, aucun DA ne signe ça.
  → *Supprimer le glow. Badge 56px aplat #b45309, rayon 16px. Si l'ambre doit rester, il ne sert pas à dire « succès » mais « sortie de fonds » — auquel cas la couleur d'accent doit être cohérente avec le codage débit du reste de l'app.*
- **[N] Écran strictement dupliqué de l'écran 25** — Même titre « Retrait effectué », même icône CloudDownload, même badgeGradient="amber", même amountClass="text-warning", même CTA. Seuls le sous-titre et le montant (« 0 FCFA » vs « — FCFA ») diffèrent. Deux écrans de la maquette pour un seul design.
  → *Un seul écran de confirmation de sortie de fonds, paramétré par destination (Mobile Money / portefeuille FixPay). La destination s'affiche dans le bloc reçu, pas dans un sous-titre en 13.5px muted.*
- **[N] Montant et absence de reçu** — « 0 FCFA » en #f59e0b 38px. Aucun opérateur nommé alors que le sous-titre dit « vers votre Mobile Money » ; pas de numéro destinataire, pas de frais de retrait (or un retrait Mobile Money en zone UEMOA a toujours des frais), pas de délai de crédit, pas de référence.
  → *Bloc reçu obligatoire : « Vers Wave · +221 77 ••• 12 34 », « Montant 65 000 FCFA », « Frais 325 FCFA », « Total débité 65 325 FCFA », « Crédité sous 2 min », « Réf. FP-… ». Sur un retrait, les frais sont l'information n°1.*

**Autres marqueurs**

- **[N] Métaphore de l'icône** — CloudDownload (nuage + flèche descendante) pour un retrait vers Mobile Money. La même icône sert à l'écran 25 pour un mouvement carte→portefeuille, et l'écran 21 utilise CloudUpload pour un dépôt. Le nuage est une métaphore de stockage de fichiers, pas d'argent.
  → *ArrowDownLeft / ArrowUpRight dans un cercle, ou mieux : le logo de l'opérateur destinataire (Wave, Orange Money) comme visuel principal. C'est plus rassurant et plus spécifique au marché.*
- **[A] Halo du CTA** — 0 8px 28px rgb(36 87 197 / 0.42) sur le bouton 340×50 — identique aux écrans 21/23/24/25, indépendamment de la couleur sémantique de l'écran.
  → *Supprimer le glow sur tous les CTA du système.*
- **[L] Densité** — ~420px de vide sur 780px ; l'écran ne contient que 4 chaînes de texte.
  → *Remplir avec le reçu détaillé et une action secondaire « Nouveau retrait ». Un écran de confirmation est le meilleur moment pour proposer l'action suivante.*
- **[J] Montant en ambre plein** — 38px bold #f59e0b sans tabular-nums. L'ambre est par ailleurs la couleur d'avertissement du système (--c-warning, utilisée pour « KYC en attente » écran 28). Un montant confirmé affiché dans la couleur d'alerte.
  → *Montant en blanc tabular-nums ; réserver l'ambre aux états d'attente/avertissement.*

**Ce qui tient :** Le sous-titre tient sur une seule ligne à 320px, réglé volontairement (le wrapper `[&_p]:max-w-[320px]` sur cet écran précis) : c'est un arbitrage de composition, pas un accident, et il faut le garder. L'écran assume aussi de ne proposer qu'une seule sortie, ce qui est correct pour un terminal de flux. Enfin la distinction chromatique dépôt-vert / retrait-ambre est une intention lisible, même si le choix de l'ambre est discutable.

### 23 Succes Alimentation — **9/10**

**Marqueurs forts**

- **[I] Incohérence badge bleu / montant vert** — badgeGradient="blue" (gradient-brand #1a3da8→#3b82f6) mais amountClass="text-success" (#22c55e). Le code la documente noir sur blanc : « badge BLEU CreditCard mais montant 0 FCFA VERT (incohérence voulue du design) ». Un écran signe donc en deux couleurs sans règle.
  → *Une règle unique : la couleur porte la NATURE du mouvement, pas l'humeur de l'écran. Alimentation de carte = transfert interne = neutre. Badge et montant en blanc/gris, aucune couleur sémantique. Le vert reste réservé aux entrées d'argent frais.*
- **[H] Badge 88px bleu à halo bleu** — 88px, rayon 28px, gradient 135° #1a3da8→#3b82f6, glow 0 12px 40px rgb(59 130 246 / 0.35). Ici le badge et son halo sont de la même couleur que le CTA 500px plus bas, qui a lui aussi son propre halo bleu : deux flaques bleues sur un écran de 780px.
  → *Supprimer les deux glows. Différencier badge (56px aplat neutre #1e293b + icône blanche) et CTA (aplat #2563eb) par le rôle, pas par la taille du halo.*
- **[N] Icône générique et montant nul** — CreditCard de lucide, la même icône que la ligne « Paiement effectué » de l'écran 28 et que le picto d'onglet « Cartes » de la BottomNav. Montant « 0 FCFA ». Aucune mention de QUELLE carte a été alimentée alors que l'app en gère plusieurs (visa-4291, mastercard…).
  → *Afficher la vignette VirtualCard mini (80×50, elle existe déjà) + « Visa •••• 4291 » à la place du badge d'icône. Montant réel + « Nouveau solde carte : X FCFA » + « Solde portefeuille : Y FCFA ». Un transfert interne se confirme par ses DEUX soldes.*

**Autres marqueurs**

- **[C] Dégradé sur le badge et sur le CTA** — Le même linear-gradient(135deg,#1a3da8,#3b82f6) est appliqué à l'objet 88×88 et au bouton 340×50. Le dégradé de marque sert donc trois rôles différents dans l'app (carte, badge, bouton) sans hiérarchie.
  → *Un seul porteur du dégradé : la carte bancaire. Badges et boutons en aplat.*
- **[K] Composition centrée molle** — min-h-dvh + items-center + justify-center + text-center ; espacements 28/10/12/52px sur un axe unique. Rigoureusement identique aux écrans 21, 22, 24, 25 — 5 écrans indiscernables au premier coup d'œil.
  → *Différencier les 5 confirmations par leur CONTENU (reçu spécifique à chaque opération) plutôt que par la couleur d'un badge. Ancrer en haut, aligner à gauche.*
- **[L] Densité** — 4 chaînes de texte + 1 bouton sur 780px.
  → *Ajouter le récapitulatif à deux soldes et une action « Alimenter à nouveau ».*

**Ce qui tient :** Le montant est le seul élément à porter une couleur sémantique dans le corps de page, ce qui en fait le point focal — l'intention hiérarchique est bonne, c'est le choix de couleur qui est faux. Le sous-titre « Les fonds ont été transférés sur votre carte » est correctement rédigé : voix active, sujet clair, pas de jargon. Et l'écran ne réaffiche pas de navigation, cohérent avec les autres terminaux.

### 24 Succes Paiement — **9/10**

**Marqueurs forts**

- **[N] Icône Send (avion en papier) pour un paiement carte** — icon={Send} de lucide, 42px trait 2px, dans un badge 88px. L'avion en papier signifie « envoyer un message / envoyer de l'argent à quelqu'un ». Or le sous-titre dit « Transaction validée avec votre carte » : c'est un achat marchand, pas un envoi. La même icône Send sert par ailleurs de bouton d'envoi dans le ChatInputBar de l'écran 27.
  → *Remplacer par le logo/initiale du marchand dans un cercle 48px (comme l'écran 28 le fait déjà : « Amazon — 39 341 FCFA débité de Visa ••••4291 »). À défaut, un ShieldCheck. L'avion en papier n'a aucun sens dans un contexte d'acceptation carte.*
- **[J] Montant en bleu de marque** — amountClass="text-primary-light" = #60a5fa, 38px bold. C'est exactement la couleur des liens et des icônes d'accent du système (--c-primary-light, utilisée pour l'icône Info des InfoBanner et le chevron des selects). Le montant ressemble donc à un lien cliquable.
  → *Montant en --c-text (#eef2ff) 34px bold tabular-nums tracking -1px, précédé du signe − puisqu'il s'agit d'un débit. Jamais la couleur d'accent interactive sur du texte non cliquable.*
- **[N] Absence totale du contexte marchand** — Aucun nom de marchand, aucun horodatage, aucun moyen de paiement identifié, aucun bouton « Contester » ou « Voir le reçu ». Le sous-titre générique « Transaction validée avec votre carte » ne dit ni quelle carte ni chez qui. Montant « 0 FCFA ».
  → *Structure : logo marchand + « Amazon » 20px + montant + « Visa •••• 4291 · 30 juil. 14:32 » + « Réf. FP-… », puis deux actions : « Ce n'est pas moi » (secondaire, tonalité danger discrète) et « Retour ». Le lien de contestation sur l'écran de confirmation est un standard fintech.*
- **[H] Badge 88px + halo bleu + CTA bleu à halo bleu** — Badge gradient-brand 135° #1a3da8→#3b82f6, rayon 28px, glow 0 12px 40px rgb(59 130 246 / 0.35) ; CTA gradient-brand identique, glow 0 8px 28px rgb(36 87 197 / 0.42). Sur cet écran, badge, montant et bouton sont TOUS bleus : la capture ne présente aucune hiérarchie chromatique.
  → *Badge neutre (aplat #1e293b), montant blanc, CTA bleu aplat. Une seule zone bleue = le point d'action.*

**Autres marqueurs**

- **[C] Dégradés décoratifs** — Deux objets à dégradé 135° sur un écran qui n'en porte aucun identitaire (pas de carte visible).
  → *Aplats partout sur cet écran.*
- **[L] Densité** — ~420px de vide, 4 chaînes de texte.
  → *Remplir avec le détail de transaction et les actions post-paiement.*

**Ce qui tient :** Le sous-titre est court et sur une ligne, la respiration entre le titre (25px/33px) et le montant (38px/50px) est correcte — le rapport de tailles 25/38 crée bien deux niveaux lisibles. Le fait que ce soit le seul écran de la série à teinter le montant en bleu marque au moins une volonté de différencier « paiement » de « dépôt » et « retrait ». L'intention de sérier les confirmations par couleur est bonne ; c'est l'application qui est fausse.

### 25 Succes Retrait Carte — **9/10**

**Marqueurs forts**

- **[N] Montant « — FCFA » (tiret cadratin) livré tel quel** — amount="— FCFA" dans le code, rendu 38px bold en #f59e0b. C'est un placeholder de maquette — le trait qui remplace un chiffre non renseigné — qui a traversé la maquette, l'import Figma et l'implémentation sans que personne ne le remarque. C'est le tell le plus incontestable de tout le lot : aucun designer humain ne livre un écran de confirmation bancaire dont le montant est un tiret.
  → *Montant réel formaté « 65 596 FCFA », espace fine insécable comme séparateur de milliers (le format est déjà correct dans les mock-data de l'écran 28), tabular-nums. Et un état de repli explicite si la valeur manque (« Montant indisponible » en 14px muted), jamais un tiret à 38px.*
- **[N] Doublon de l'écran 22** — Titre « Retrait effectué » identique à l'écran 22, icône CloudDownload identique, badge ambre identique, montant ambre identique, CTA identique. Seul le sous-titre change (« retransférés sur votre portefeuille FixPay » vs « envoyés vers votre Mobile Money »).
  → *Fusionner en un écran unique paramétré par destination. Et distinguer les libellés : « Retrait effectué » (sortie vers Mobile Money) vs « Fonds rapatriés » (carte → portefeuille, mouvement interne). Deux opérations différentes ne peuvent pas porter le même titre.*
- **[H] Badge ambre à halo bleu** — 88px rayon 28px, gradient 135° #d97706→#f59e0b, glow --s-glow-badge = 0 12px 40px rgb(59 130 246 / 0.35). Le liseré froid autour de l'orange est nettement visible dans la capture.
  → *Supprimer le glow. Badge 56px, rayon 16px, aplat neutre pour un mouvement interne.*

**Autres marqueurs**

- **[K] Sous-titre centré sur deux lignes** — « Les fonds ont été retransférés sur votre / portefeuille FixPay » : rupture après « votre », seconde ligne de 227px contre 493px pour la première dans la capture. Fer-à-centre sur deux lignes de longueurs très inégales, sans césure travaillée.
  → *Aligner à gauche, ou réduire à une seule ligne : « Vers votre portefeuille FixPay ». Un fer-à-centre exige des lignes de longueurs proches ; sinon on aligne à gauche.*
- **[A] Halo du CTA** — 0 8px 28px rgb(36 87 197 / 0.42) sous le bouton 340×50, ~380px de flaque bleue sur fond #070c1a.
  → *Supprimer.*
- **[L] Densité** — 4 chaînes + 1 bouton sur 780px, dont ~400px de vide.
  → *Bloc reçu : carte source, montant, frais éventuels, nouveau solde portefeuille, référence.*
- **[J] Typographie du montant** — 38px/50px bold, pas de tabular-nums, la devise « FCFA » a la même taille et la même couleur que le nombre.
  → *Nombre 34px bold tabular-nums en blanc, « FCFA » 16px medium en secondaire sur la baseline. Le pattern existe déjà dans AmountDisplay size="payment" — il suffit de l'utiliser.*

**Ce qui tient :** Le sous-titre de deux lignes est explicitement prévu par le composant partagé (la contrainte 320px est commentée comme faisant volontairement passer l'écran 22 sur une ligne et le 25 sur deux) : il y a bien une intention de composition derrière, elle est juste mal exécutée en fer-à-centre. Le vocabulaire « retransférés » est précis et distingue correctement le rapatriement du retrait externe — c'est de la bonne rédaction produit.

### 26 Support — **7/10**

**Marqueurs forts**

- **[D] Cercle décoratif du hero** — DecorativeCircles topRight size 180px, positionné -top-[50px] -right-[50px], bg-white/[0.07], dans un hero gradient-card rayon 22 en overflow-hidden. Il est parfaitement visible dans la capture comme un demi-disque laiteux qui traverse le mot « aider ? » et le paragraphe.
  → *Supprimer le cercle. Si le hero doit rester différencié du fond : gradient-card sans décor + une ombre courte 0 2px 8px rgb(0 0 0 / 0.3). Le blob blanc flou débordant est la signature la plus reconnaissable d'un design généré.*
- **[A] Ombre du hero** — shadow={true} → --s-card-hero = 0 20px 60px rgb(11 28 107 / 0.55), soit 60px de flou bleu marine sous un bloc de 322px de haut, tandis que les ListGroup juste en dessous n'ont aucune ombre. Aucune échelle d'élévation : un objet à 60px, tous les autres à 0.
  → *Définir 3 niveaux et s'y tenir : niveau 0 (à plat, hairline white@0.06), niveau 1 (0 1px 2px noir@0.3), niveau 2 réservé aux overlays (0 8px 24px noir@0.4). Le hero support est du niveau 0 ou 1, pas 2.*
- **[C] Hero à dégradé pour une phrase de politesse** — gradient-card = linear-gradient(135deg,#0b1c6b 0%,#1a3da8 55%,#2457c5 100%) sur 350×322px (p-22, titre 16px + paragraphe 12.5px/20.6px) pour dire « Notre équipe est disponible 7j/7 pour répondre à vos questions concernant vos cartes, votre portefeuille ou votre compte. » Un tiers de l'écran en dégradé de marque pour zéro information actionnable.
  → *Supprimer le hero. Un titre h1 « Support & Aide » suffit, avec au maximum une ligne 13px muted « Réponse en moins de 5 minutes, 7j/7 ». Le dégradé de marque doit rester réservé à la carte bancaire. L'espace récupéré (~140px) fait remonter les canaux de contact au-dessus de la ligne de flottaison.*
- **[G] Tuile d'icône sur chaque canal de contact** — IconTile size 36 rayon 11px (--radius-tile-sm) avec fond teinté à 0.12 sur les 3 lignes : bg-success-tint rgb(34 197 94/0.12), bg-primary-tint rgb(59 130 246/0.10), bg-success-tint. Trois carrés colorés de 36px pour trois lignes de texte parfaitement autonomes.
  → *Supprimer les tuiles. Icône 18px nue en --c-icon-muted à gauche, ou rien du tout : « Chat en direct » / « E-mail » / « WhatsApp » se lisent seuls. On récupère 49px de largeur utile par ligne et l'écran cesse de clignoter.*
- **[N] Chat et WhatsApp portent la même icône et le même ton** — CHANNEL_ICONS = { chat: MessageSquare, email: Mail, whatsapp: MessageSquare } et tone "green" pour les deux. Les lignes 1 et 3 sont visuellement identiques dans la capture — deux bulles vertes.
  → *Logo WhatsApp officiel (vert #25D366) pour WhatsApp, MessageCircle pour le chat interne. Et si l'on n'a pas le droit d'utiliser le logo, on supprime l'icône : deux pictos identiques valent moins que zéro picto.*
- **[N] FAQ non fonctionnelle et coordonnées factices** — 5 questions (faqItems) rendues en ListItem height 51 avec un chevron, mais aucune réponse, aucun accordéon, aucun href, aucune recherche. Et le canal WhatsApp affiche « +221 7X XXX XX XX » — un numéro masqué par des X, sans href.
  → *Accordéons dépliables avec réponses réelles + champ de recherche 44px en tête de section + lien « Voir tous les articles ». Numéro WhatsApp réel avec href wa.me. Une FAQ qui ne répond à rien est une maquette, pas un produit.*

**Autres marqueurs**

- **[J] Chevrons en glyphe typographique** — ListItem rend `›` (U+203A) en 17px --c-text-muted, avec le commentaire « never an SVG icon ». Le glyphe suit la métrique de DM Sans : il est plus fin que tous les traits d'icône lucide de l'écran (1.5-2px) et sa baseline ne s'aligne pas sur le centre optique de la ligne. Visible sur la ligne « Chat en direct » où il jouxte la pastille verte.
  → *ChevronRight lucide 16px strokeWidth 2, absoluteStrokeWidth, --c-icon-muted. Même famille de traits que le reste des icônes.*
- **[F] Tout-en-carte** — Hero rayon 22 + ListGroup rayon 18 (contacts) + ListGroup rayon 18 (FAQ) : 3 conteneurs vitrés (bg white@0.05, border white@0.08) empilés sur 1560px de page, aucun contenu posé directement sur le fond.
  → *Sortir les listes des cartes : lignes à plat sur le fond séparées par des hairlines white@0.06, exactement comme le fait l'écran 28 (qui, lui, a raison). Réserver la carte au seul bloc qui a besoin d'être isolé.*
- **[B] Rayons de l'écran** — 22 (hero), 18 (2 ListGroup), 13 (bouton retour 38px), 11 (3 IconTile 36px). Quatre rayons pour quatre familles d'objets, dont deux (11 et 13) séparés d'un seul pixel — donc indiscernables mais quand même distincts dans les tokens.
  → *Fusionner 11/12/13 en un seul token à 8px. Ramener 18/22 à 12px. On passe de 4 rayons à 2 sur cet écran.*
- **[L] Section FAQ tronquée** — 5 items dans faqItems mais la capture 390×780 en montre 3 et coupe le 4e à mi-hauteur, la BottomNav (bg rgb(7 12 26/0.97) + backdrop-blur 20px) recouvrant le reste. Aucun indice d'affordance de scroll, aucun « Voir tout ».
  → *Récupérer les ~140px du hero supprimé pour faire entrer les 5 questions, ou limiter à 3 + lien « Toutes les questions ».*

**Ce qui tient :** Deux vrais bons choix ici. D'abord les lignes de FAQ n'ont PAS de tuile d'icône (height 51, titre seul + chevron) : c'est la seule liste du lot à assumer la sobriété, et le contraste de densité avec la section contacts au-dessus fonctionne. Ensuite la ligne « Chat en direct » porte une pastille d'état verte 7px avant son chevron : c'est une information de disponibilité en temps réel, exactement le genre de micro-détail qu'un designer ajoute et qu'un générateur oublie. La séparation en deux sections libellées (Nous contacter / Questions fréquentes) est aussi la bonne structure d'information, et les hairlines white@0.08 entre les lignes, sans bordure après la dernière, sont proprement réglées.

### 27 Chat Support — **7/10**

**Marqueurs forts**

- **[L] Vide central de la conversation** — Un seul message (chatMessages ne contient que « chat-welcome »), 3 chips de suggestion, puis 780 − 620 ≈ 800px de fond #070c1a strictement vide entre les chips (bas à ~605px) et la ChatInputBar fixe (haut à ~1414px sur la capture 390×780 @2x). Soit plus de la moitié de l'écran sans un pixel.
  → *Ancrer la conversation en BAS (flex-col justify-end) comme toute messagerie réelle : le message d'accueil et les chips doivent flotter juste au-dessus du champ de saisie, pas être plaqués en haut. C'est la correction n°1 et elle règle le vide à elle seule.*
- **[N] Absence de tout l'appareillage d'une messagerie** — Pas de séparateur de date, pas d'indicateur de saisie (« l'agent écrit… »), pas d'accusé de lecture, pas de bouton pièce jointe dans la ChatInputBar (elle ne contient que l'input h-44 et le bouton Send 44px), pas d'état vide, pas d'état hors-ligne, pas de scroll-to-bottom, pas de gestion d'échec d'envoi.
  → *Minimum vital : séparateur de date centré 11px muted, bulle « typing » à 3 points, coche d'accusé sous les messages utilisateur, bouton Paperclip 20px à gauche du champ, et un état d'erreur « Non envoyé · Réessayer » en --c-danger sous la bulle concernée.*
- **[N] Horodatage figé vs horodatage réel** — Le message d'accueil affiche time: "14:30" en dur dans mock-data, tandis que les messages envoyés en séance utilisent nowTime() → l'heure système. Un utilisateur qui écrit à 09:12 voit sa réponse au-dessus d'un accueil daté 14:30 : la conversation remonte dans le temps.
  → *Horodater le message d'accueil à l'ouverture de session. Et n'afficher l'heure qu'au changement de bloc (regroupement par expéditeur + fenêtre de 5 min), pas sous chaque bulle.*

**Autres marqueurs**

- **[N] Contradiction agent humain / bot** — Le PageHeader affiche une pastille verte 7px + « Agent disponible » (11px muted), mais le message dit « Je suis votre assistant FixPay » et l'avatar est le bouclier de marque. L'écran 26 promettait par ailleurs « Réponse en moins de 5 minutes », ce qui suppose un humain.
  → *Trancher : soit « Assistant FixPay · Réponses instantanées » avec un picto bot et un lien « Parler à un conseiller », soit un vrai agent avec prénom et photo. L'ambiguïté est une faute produit, pas une faute de style.*
- **[C] Dégradés sur l'avatar et le bouton d'envoi** — Avatar agent : gradient-card 135° 3 stops (#0b1c6b→#1a3da8→#2457c5) sur un rond de 30px — un dégradé à trois arrêts sur 30 pixels, illisible par construction. Bouton d'envoi : gradient-brand 135° #1a3da8→#3b82f6 sur 44×44 rayon 14.
  → *Avatar en aplat #1a3da8 (ou photo/monogramme de l'agent). Bouton d'envoi en aplat #2563eb, rayon 10, et désactivé (opacity 0.4, pointer-events none) tant que le champ est vide — cet état manque aujourd'hui.*
- **[E] Bulle agent en surface de verre** — GlassCard bg white@0.05 + border white@0.08, rayon 18, max-w 261px. La bulle a donc EXACTEMENT le même traitement de surface que les panneaux de l'écran 20, les ListGroup de l'écran 26 et les StatTile : aucune spécificité de la messagerie.
  → *Bulle agent en aplat #141c2f sans bordure (une bulle n'a pas de bordure), rayon 12 avec le coin cassé à 4px. La bordure sur une bulle de chat est un tell : ça vient du composant carte réutilisé.*
- **[C] Chips de suggestion en pilules bleues teintées** — h 31px, rayon 20px (--radius-pill), bg rgb(59 130 246/0.10), border rgb(59 130 246/0.20), texte 11.5px #60a5fa. Double transparence (fond + bordure) et texte en bleu clair : les chips ressemblent à des liens désactivés plus qu'à des boutons.
  → *Fond --c-surface-2 (white@0.09), pas de bordure, texte --c-text 12.5px, rayon 8. Ou bordure 1px white@0.14 sans fond. Une seule couche, et un contraste de texte suffisant pour qu'on comprenne que c'est cliquable.*
- **[K] Retour à la ligne du message d'accueil** — « Bonjour ! Je suis votre assistant FixPay. Comment puis-je vous aider aujourd'hui ? » sur 3 lignes à 13px/20.8px dans 261px, avec une dernière ligne de 152px seulement. La bulle forme un escalier irrégulier.
  → *Raccourcir le message à deux lignes pleines : « Bonjour, je suis l'assistant FixPay. Que puis-je faire pour vous ? ». La longueur de la copie fait partie de la composition d'une bulle.*

**Ce qui tient :** Trois détails ici sont clairement de main humaine et doivent être préservés. Un : le coin cassé asymétrique de la bulle — rayon 18 partout sauf rounded-bl-[4px] côté avatar (et son miroir rounded-br-[4px] pour l'utilisateur) ; c'est la convention correcte et elle est bien appliquée dans les deux sens. Deux : l'avatar 30px est ancré au BAS de la bulle (flex items-end), pas en haut ni au centre — c'est le réglage juste, celui de iMessage et WhatsApp. Trois : les chips sont indentées de 40px (pl-10) pour tomber exactement sous le bord gauche de la bulle, avatar 30 + gap 10 ; cet alignement est calculé, pas deviné. J'ajoute que la ChatInputBar assume de NE PAS avoir de backdrop-blur contrairement à la BottomNav (bg solide #070c1a) : c'est le bon choix, un champ de saisie ne doit pas laisser transparaître le texte qui passe dessous.

### 28 Notifications — **5/10**

**Marqueurs forts**

- **[N] Chronologie incohérente dans les deux sections** — Section NOUVELLES : ligne 1 « Hier 09:15 », ligne 2 « Aujourd'hui 14:32 », ligne 3 « Il y a 2h ». Section PRÉCÉDENTES : « 8 Avr », puis « 9 Avr », puis « 8 Avr », puis « 5 Avr ». Aucune des deux listes n'est triée, et la plus ancienne des nouvelles est en tête.
  → *Trier strictement par timestamp décroissant, sur des dates ISO réelles et non des chaînes pré-formatées. Et grouper par jour avec un en-tête de section daté (« Aujourd'hui », « Hier », « 9 avril ») plutôt que par état lu/non-lu.*
- **[G] Tuile d'icône sur les 7 lignes** — IconTile size 40 rayon 13px (--radius-tile-lg) sur chaque ligne, tons bg-success-tint rgb(34 197 94/0.12), bg-primary-tint rgb(59 130 246/0.10), bg-warning-tint rgb(245 158 11/0.12) pour les non-lues et bg-surface-2 white@0.09 pour les lues. 7 carrés arrondis de 40px empilés sur une colonne, avec seulement 3 icônes distinctes (deposit, card, shield/check).
  → *Supprimer les tuiles au profit d'une icône 18px nue colorée directement (vert/bleu/ambre/gris). On gagne ~22px de largeur de texte par ligne — ce qui suffit à faire tenir les descriptions sur une seule ligne au lieu de deux (voir le point suivant) — et la colonne cesse d'être un damier.*
- **[K] Pastille non-lue orpheline en fin de ligne** — StatusDot 8px bg-primary #3b82f6 posé à l'extrémité droite d'une ligne de 74px de haut, tandis que la description passe à la ligne juste sous elle (« ...65 596 FCFA · / Hier 09:15 »). Dans la capture, le point flotte dans un vide de ~40×74px et la 2e ligne de texte passe dessous — collision visuelle sur les 3 lignes non lues.
  → *Déplacer l'indicateur non-lu à GAUCHE, en pastille 6px sur la gouttière, ou le remplacer par un simple traitement typographique : titre en font-semibold + --c-text pour les non-lues, font-normal + --c-text-secondary pour les lues. Un point orphelin à droite d'une ligne à hauteur variable ne peut pas s'aligner correctement.*
- **[N] Aucune action, aucun filtre, aucun état** — 7 ListItem sans href, sans onClick, sans swipe. Pas de « Tout marquer comme lu », pas de filtre par type, pas d'état vide, pas de chargement, pas de pagination, pas de réglage de préférences accessible depuis l'écran (alors que /profile/notifications existe).
  → *Action « Tout marquer comme lu » à droite du titre, chaque ligne cliquable vers la transaction concernée, swipe-to-dismiss, état vide dessiné (« Aucune notification · Vous serez prévenu à chaque mouvement »), et un lien discret « Gérer mes alertes » en pied de liste.*
- **[J] Montants noyés dans la sous-ligne** — « 65 596 FCFA », « 39 341 FCFA », « 327 980 FCFA », « 131 192 FCFA » sont rendus en 11.5px/15px --c-text-muted rgb(148 172 255 / 0.38), au milieu d'une phrase, sans tabular-nums et sans distinction de graisse. Le montant — l'information la plus importante d'une notification bancaire — est l'élément le moins lisible de la ligne.
  → *Sortir le montant de la phrase et le poser en colonne droite : « +65 596 » / « −39 341 » en 13px semibold tabular-nums, vert pour les crédits, --c-text pour les débits. La sous-ligne ne garde que le contexte (« Wave · Hier 09:15 »).*

**Autres marqueurs**

- **[N] Valeurs de montants pseudo-aléatoires** — 65 596 / 39 341 / 327 980 / 131 192 FCFA. Aucun de ces montants n'est plausible : un dépôt Mobile Money se fait en montants ronds (25 000, 50 000, 100 000), et l'écran de dépôt propose lui-même des puces de montants. Ces chiffres sont du bruit généré pour « faire vrai ».
  → *Montants ronds pour les dépôts/retraits (50 000, 100 000), montants réalistes de marchand pour les paiements (12 500, 39 900). Les données de démo sont une décision de design : elles conditionnent la largeur des colonnes et la crédibilité.*
- **[N] Libellés incohérents entre les deux sections** — « Recharge confirmée » (non lue) vs « Recharge portefeuille » (lue) pour le même type d'événement ; « Paiement effectué » vs « Alimentation carte réussie » — trois formes verbales différentes (participe passé au féminin, nom nu, participe + adjectif) sur 7 lignes.
  → *Une seule grammaire pour toute la taxonomie d'événements : nom + résultat, invariable. « Dépôt reçu », « Paiement débité », « Retrait envoyé », « Carte alimentée », « Vérification requise ».*
- **[I] Tons sémantiques issus de la palette par défaut** — --c-success #22c55e = green-500 Tailwind, --c-danger #ef4444 = red-500, --c-warning #f59e0b = amber-500, --c-primary #3b82f6 = blue-500. Les quatre valeurs sémantiques du système sont les quatre 500 de la palette Tailwind, non retouchées.
  → *Décaler chaque teinte pour lui donner une identité : vert plus profond et légèrement bleuté (#0FA968), ambre plus terreux (#D98324), rouge plus froid (#E23D3D). Trois valeurs custom suffisent à sortir du look « palette par défaut ».*
- **[L] Rendu desktop** — En 1440×900, la colonne reste à max-w-720 : les descriptions repassent sur une ligne, la pastille non-lue se retrouve à ~400px du texte, et ~500px à droite du contenu restent vides sous une liste de 7 lignes.
  → *Sur ≥1024px, passer en tableau : icône | titre + contexte | montant aligné à droite | date en colonne fixe. La densité disponible en desktop doit servir à afficher plus de colonnes, pas à étirer le vide.*

**Ce qui tient :** C'est de loin le meilleur écran du lot, et pour de bonnes raisons structurelles. Les lignes sont posées À PLAT sur le fond de page, sans GlassCard englobante, séparées par des hairlines white@0.08 en retrait de 20px et sans bordure après la dernière ligne de chaque section : c'est le seul écran qui échappe au tout-en-carte, et il faut le prendre comme modèle pour reprendre les écrans 26 et 20. La différenciation lu/non-lu est faite sur TROIS canaux simultanés — ton d'icône (coloré vs neutre white@0.09), hauteur de ligne (74 vs 65px) et pastille — ce qui est un vrai raisonnement de designer sur la redondance des signaux ; il faut garder les deux premiers et corriger le troisième. Le réglage d'alignement est également soigné : le wrapper px-[5px] compense les 15px de padding interne du ListItem pour que les tuiles retombent exactement sur la gouttière de 20px de la page. Et la densité est enfin réaliste : 7 événements datés avec montants et références de carte, c'est ce que doit contenir un écran fintech.

