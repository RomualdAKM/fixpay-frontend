# Vérification finale — ce qui reste à corriger (étape 11 : composition)

Note moyenne 2,8/10. 102 corrections confirmées à l écran. Ce document liste UNIQUEMENT le reliquat, mesuré sur les captures par 4 DA.

## 01 Onboarding — 2/10

### Défauts restants

- [finition] Porteur toujours « JEAN DUPONT » — placeholder de démonstration inchangé.
- [finition] Aucun sélecteur pays/langue, aucun bandeau de logos opérateurs. Orange Money / Wave / MTN restent cités en texte courant dans le paragraphe. La preuve sociale locale n'est toujours pas dessinée.
- [notable] Régression n°3 non traitée : le rythme vertical n'a pas été redérivé. Bandes d'encre mesurées, gaps successifs = 24 / 118 / 122 / 54 / 72 px. Les deux trous de ~120 px encadrent la carte, et la bande morte de ~72 px entre la fin du paragraphe et le CTA est toujours là (l'audit la mesurait à ~65 px).
- [notable] La zone morte à gauche de la carte est intacte : la carte commence à x=180 alors que tout le texte (titre, paragraphe, CTA, mention légale) est calé à x=48. Bande vide de 132 px de large sur 335 px de haut, sans justification apparente. L'audit la reprochait à ~150×250 px.
- [finition] La face de carte reste aérée au milieu : ~85 px entre la marque et le numéro, puis ~55 px entre le numéro et EXP.

### Régressions apparues avec la passe corrective

- Deux colorways du même logotype à 250 px d'écart sur le même écran : l'en-tête porte « FixPay » écusson bleu / « Pay » bleu, la carte porte « FixPay » écusson or / « Pay » or. C'est le nouvel élément introduit par la suppression de la puce, et il crée une incohérence de marque là où il n'y en avait pas.
- Desktop : la carte n'a pas de mise à l'échelle — 276×176 px sur un viewport 1440×900, posée à x=858 dans la moitié droite. ~200 px de vide au-dessus, ~365 px en dessous, ~306 px à sa droite. Colonne gauche et carte ne partagent aucune ligne de base (colonne gauche finit à y=690, carte à y=535). Le desktop est vide à ~50 % et l'objet identitaire du produit y est plus petit que le bouton « Commencer ».
- L'écran ne répond pas au thème clair : diff pixel entre les captures mobile-dark et mobile-light = delta max de 17/765 sur la seule ombre portée de la carte. L'onboarding reste noir pour un utilisateur en mode clair. Défendable pour un écran pré-auth, mais c'est une exception non déclarée.

## 02 Accueil — 2/10

### Défauts restants

- [notable] Aucun groupement par jour, aucun net quotidien, aucune barre de filtres. Les rangées portent des horodatages hétérogènes non regroupés (« 14:32 », « Hier, 09:15 », « 12 avr. »). Prescription produit non traitée.
- [notable] Régression n°4 INTACTE sur desktop : deux boutons de bascule de thème identiques visibles simultanément — un soleil dans la sidebar à (222,45) et un soleil dans l'en-tête à (1291,54), 1069 px d'écart. Rien n'a été touché.
- [notable] Régression n°3 quasi intacte : sur 1440×900 la colonne gauche s'arrête à y=428 (47,6 % de la hauteur, contre 42 % reproché) et la colonne droite à y=446 (49,6 %). La moitié basse de la page reste noire. La sidebar elle-même laisse ~250 px de vide entre « Créer une carte » (y=580) et la carte utilisateur du bas.
- [finition] Sur mobile, « − 223 026 FCFA » de la rangée Booking.com est tranché exactement à mi-hauteur des glyphes par le bord de la BottomNav, sans dégradé ni affordance de défilement. Le titre de la rangée passe, son montant est guillotiné.

### Régressions apparues avec la passe corrective

- Traitement de « FCFA » désormais contradictoire SUR LE MÊME ÉCRAN : corrigé dans le hero (18 px, atténué, sur la baseline) mais laissé à l'identique des chiffres dans la ligne carte — « 816 202 FCFA » est intégralement en 28 px bold blanc, suffixe compris. La correction a été appliquée à un composant sur deux.
- Le bloc « Ma carte principale » porte maintenant TROIS affordances : les liens « Retirer » et « Détails » en en-tête plus le bouton « Alimenter ». C'est exactement le reproche [finition] listé sur l'écran 03 — il y a été corrigé (« Détails » retiré) et il subsiste ici. Pire : la même ligne carte est un chevron « > » + un bouton sur l'écran 03, et deux liens + un bouton sur l'écran 02. Deux modèles d'interaction pour le même objet sur deux écrans frères.
- Le bouton « Alimenter » a été renvoyé sur une quatrième ligne, aligné à droite : il laisse un vide en L de ~500×130 px sous « Carte virtuelle · Actif », mobile comme desktop (desktop : rectangle vide x352→747, y375→420). Le bloc carte est passé de 2 à 4 lignes de haut pour la même information.

## 03 Portefeuille — 3/10

### Défauts restants

- [notable] Toujours 2 mouvements complets seulement : Wave — Dépôt et Alimentation Visa passent, « Orange Money — Dépôt / + 300 000 FCFA » est tranché à mi-glyphe par la BottomNav, sans dégradé ni affordance de défilement. C'est mot pour mot l'état reproché, et la place récupérée sur la bande de statistiques a de nouveau été absorbée en amont de la liste (voir régression neuve).
- [notable] Aucune chip de filtre, aucun sélecteur de période (« avril » est un texte figé dans le label du plafond), aucun compte Mobile Money lié en rangée, aucun état vide ni squelette. Le gros de la prescription [L] reste non traité.
- [finition] Les deux morphologies de bouton cohabitent toujours : les actions du hero sont des pilules à rayon plein, « Alimenter » est un rectangle à ~10 px, sur le même écran et à 400 px d'écart.
- [notable] Doublon de bouton de thème sur desktop NON corrigé : soleil dans la sidebar à (222,45) et soleil dans l'en-tête à (1334,54), simultanément visibles.
- [notable] Occupation desktop non corrigée : colonne gauche jusqu'à y=487 sur 900 (54 %, contre 52 % reproché), colonne droite jusqu'à y=446 (49,5 %). Près de la moitié de la page reste vide.
- [notable] Le plafond ne se raccorde toujours pas à la liste : « 3 000 000 utilisés » en avril, alors que les cinq mouvements affichés totalisent 725 000 FCFA en valeur absolue. Le chiffre est devenu cohérent avec lui-même, pas avec le contenu de l'écran.

### Régressions apparues avec la passe corrective

- Bloc neuf et tautologique inséré entre la carte et la liste : une InfoBanner « Alimentez votre carte depuis le portefeuille FixPay. » sur deux lignes, avec à sa droite un bouton « Alimenter ». Le texte ne fait que paraphraser le libellé du bouton. Ce bloc coûte ~110 px du premier viewport, c'est-à-dire précisément ce que le remplacement de la bande de statistiques avait libéré — d'où le maintien du défaut « seulement 2 mouvements visibles ». On a échangé un bloc de remplissage contre un autre.
- Le filigrane FixPay a été supprimé du hero de l'écran 02 mais CONSERVÉ sur celui de l'écran 03 (vérifié par échantillonnage : coin haut-droit du hero 02 = aplat pur, hero 03 = écusson + wordmark). Le même composant WalletHeroCard rend donc deux contenus différents selon l'écran — la classe de défaut exacte que l'audit reprochait à la carte de l'écran 01 entre deux viewports, simplement déplacée entre deux écrans.
- Ce filigrane est en outre mal composé : « Fix » est en blanc translucide et « Pay » dans un bleu quasi confondu avec le dégradé de la carte, mobile comme desktop. La marque se lit « Fix » avec un fantôme derrière.
- Divergence d'en-tête entre écrans frères : l'écran 02 porte un soleil + une cloche de notification, l'écran 03 ne porte qu'un soleil. La cloche a disparu sans que rien ne prenne sa place.

## 04 Depot Portefeuille — 4/10

### Défauts restants

- Marqueur [F] STRICTEMENT INTACT : les 6 pays restent 6 cartes flottantes autonomes. Mesuré au scan de pixels — chaque carte fait 102px de haut avec 18px de gap (51 / 9 px CSS), chacune avec son propre rayon, sa propre bordure rgb(38,42,55) et son propre fond rgb(20,24,38). Douze bordures dessinées pour une seule liste. Rien n'a bougé.
- Densité inchangée : un mot par ligne. Toujours aucun indicatif, aucun opérateur, aucun drapeau, aucun champ de recherche, aucune section « Récemment utilisé ». La passe corrective n'a rien ajouté à la liste.
- Le cercle radio vide mesure rgb(53,57,69) sur un fond de ligne rgb(20,24,38), soit un contraste de 1,55:1. C'est l'affordance de sélection d'un écran de sélection, et elle est sous le seuil de 3:1 exigé pour un composant d'interface — pratiquement invisible. Non touchée.
- Desktop : le contenu s'arrête à y≈444 sur 900 (≈456px, 51% du viewport vide) et la marge morte entre la sidebar (x=262) et la colonne (x=581) fait 319px. RENOTATION annonçait « ~450px » et « ~320px » — les mesures sont identiques au pixel près. Le reproche [L] desktop n'a pas été ouvert.
- Plausibilité non traitée : « Frais Gratuit · Délai Sous 2 min · Plafond restant 2 000 000 FCFA » est toujours affirmé sous « Étape 1 sur 4 · Pays », donc avant tout choix de pays ET d'opérateur — alors que les frais Mobile Money dépendent précisément de ces deux-là. Le texte de la régression n°2 de RENOTATION s'applique mot pour mot.

### Régressions apparues avec la passe corrective

- Mobile : aucun CTA, aucun « Continuer », rien après le sixième pays — ~145px de fond nu entre le bas de « Togo » (y≈1258) et la BottomNav (y≈1400). Sur un parcours en 4 étapes dont l'étape 1 est une liste radio, rien dans le premier viewport n'indique comment avancer, et l'écran paraît fini alors qu'il attend une sélection dont l'affordance est à 1,55:1.

## 08 Paiement — 5/10

### Défauts restants

- La touche décimale « . » EST TOUJOURS SUR LE PAVÉ. Numpad.tsx:8 — `const KEYS = ["1",…,"9", ".", "0"]`. Visible sur les captures mobile ET desktop, rendue comme un point quasi invisible seul dans sa cellule en bas à gauche, sur une monnaie sans subdivision. Le raccourci « 000 » n'existe toujours pas. Non ouvert, mot pour mot.
- La tuile d'icône générique du bénéficiaire est intacte : carré arrondi gris de 38px contenant le glyphe lucide « boutique », posé tout en haut de l'écran (crop c08_ben.png). Le marqueur que l'audit condamne partout ailleurs est toujours sur ce bloc entièrement neuf.
- Toujours aucun frais, aucun plafond sur un écran de paiement, alors que 04, 05, 06 et 07 portent désormais tous une bande. Trois écrans frères, deux niveaux d'information — inchangé.
- « Minimum 500 FCFA » mesuré à 4,38:1 (texte rgb 102,118,168 sur fond rgb 7,12,26). RENOTATION annonçait ~4,4:1 : la valeur est identique, toujours sous le seuil AA pour du texte courant.
- Desktop : le pavé numérique est toujours rendu sur 1440 alors que le clavier physique existe, et la colonne fait ~440px (x=632→1072) avec ~370px de marge morte de chaque côté. Non entamé.
- Le numéro masqué du bénéficiaire, « +225 07 ••• 42 », ne correspond à aucune convention ivoirienne (07 XX XX XX XX) — un masque de maquette affiché comme une coordonnée.

### Régressions apparues avec la passe corrective

- La régression n°1 n'est pas corrigée, elle est AGGRAVÉE. Sur 390×780 « Payer avec » et les deux lignes de carte sont toujours rendus après le pavé et le champ Motif, donc absents du premier viewport. Mais maintenant que « Payer maintenant » est épinglé, il est atteignable en permanence : l'utilisateur peut valider un paiement sans avoir jamais vu quelle carte sera débitée, et sans même avoir à défiler. L'épinglage du CTA a supprimé la seule chose qui forçait encore le scroll jusqu'à l'information de débit.
- La régression n°2 n'est pas corrigée sur desktop : à 1440×900 la page se termine sur « Mastercard •••• 7834 / Solde dispo : 394 895 FCFA » à y≈858 et « Payer maintenant » n'est PAS dans le viewport. Et 08 utilise la barre épinglée en mobile mais pas à lg — l'incohérence de comportement de CTA avec 06/07 n'a pas été supprimée, elle a simplement changé de breakpoint.

## 09 Creer Carte — 3/10

### Défauts restants

- Mobile : la barre de récap OPAQUE tranche la deuxième offre. Le conteneur blanc/sombre de la Mastercard est coupé net 2px sous « Plafond mensuel 1 000 000 FCFA » (mesuré : bord de carte à y≈1193, barre à y≈1196). Les rangées « Paiement en devise » et « Acceptation » de la Mastercard sont invisibles dans le premier viewport, sans dégradé ni indice de défilement. Sur un écran de comparaison d'offres, une des deux offres est amputée de moitié — c'est le défaut de guillotine que la passe corrective était censée éradiquer (05, 06), reproduit ici. Très visible en thème clair : la carte blanche est sciée par un bandeau gris.
- Desktop : les deux cartes de comparaison ne partagent AUCUNE ligne. « Prix d'émission » est à y=311 à gauche et y=283 à droite (56px d'écart), « Acceptation » à y=404 vs y=376 ; les deux conteneurs ont des hauteurs différentes (bas à y=452 vs y=407). Comparer « Plafond mensuel » d'une offre à l'autre demande un saut de l'œil. Cause : le tag « Recommandé » n'existe que sur la carte gauche et pousse tout son tableau vers le bas.

### Régressions apparues avec la passe corrective

- Desktop : la valeur « La plus large en Afrique de l'Ouest » passe à la ligne et orpheline « l'Ouest » seul, ferré à droite, sur la seule carte sélectionnée — c'est ce qui déséquilibre les hauteurs. Même motif de casse que le « Activation immédiate » orphelin qu'on venait de corriger, déplacé du mobile vers le desktop.
- Desktop : le champ « Nom sur la carte » fait 420px et s'arrête à x=951 alors que la grille d'options au-dessus va jusqu'à x=1172 — aucun bord droit commun entre les deux blocs empilés de la même colonne.
- Les vignettes de carte introduites en desktop (75×50) portent un « FixPay » micro-gravé illisible ; à cette taille le lettrage se lit comme un artefact.

## 10 Detail Carte — 3/10

### Défauts restants

- Desktop : le vide n'a pas bougé, il a EMPIRÉ à gauche. La colonne gauche s'arrête maintenant à y≈547 sur 900 (60 %) alors qu'elle allait à 70 % avant ; la colonne droite s'arrête à y≈480 (53 %). Environ 45 % de la page reste noir. La compaction obtenue (CTA sur une rangée, jauge) a été récupérée en vide, pas en contenu.
- Mobile : la ligne Amazon est coupée par la BottomNav — « 14:32 » et « − €59.99 » sont à moitié sous la barre. Une seule des quatre transactions est atteignable dans le premier viewport, et sa deuxième ligne est illisible.
- Montants de transaction toujours colorés en entier en rouge saturé (« − 39 341 FCFA », « − 223 026 FCFA »), pas seulement le signe ou la variation.

### Régressions apparues avec la passe corrective

- Desktop : « Bloquer la carte » est apparu sous la liste comme un simple lien texte rouge, seul, hors conteneur, sans confirmation ni traitement de danger — l'action la plus destructive de l'écran a le même poids typographique qu'un lien « Tout voir ». Il flotte à y=471 dans une zone vide, rattaché à rien.
- Le libellé « Payer » du bouton secondaire est mesuré à #93A0C3 sur #141826 (~6,4:1) face au « Alimenter » blanc plein sur bleu : côte à côte, le secondaire se lit comme désactivé — exactement le reproche fait au bouton WhatsApp de l'écran 17.

## 11 Statistiques — 3/10

### Défauts restants

- Les catégories ne sont TOUJOURS pas encodées par la teinte. Couleurs échantillonnées sur les pastilles de légende : Voyage #7AA0FF, Shopping #2F5BE8, Abonnements #1A3DA8 — trois valeurs du MÊME bleu. Ce n'est pas « une teinte par catégorie », c'est une rampe monochrome ; le seul canal reste la position dans la barre.
- La barre « Abonnements 2 % » est toujours un point de ~6px, et elle est désormais MOINS visible qu'avant : #1A3DA8 sur un panneau #141826 est un bleu nuit sur fond nuit. Le correctif chromatique a aggravé ce point précis.
- Les montants de la liste restent intégralement en rouge saturé (« − 39 341 FCFA », « − 6 554 FCFA », « − 223 026 FCFA ») dans « Dépenses de la période ». La règle « colorer la variation, pas la valeur » n'a pas été appliquée à la liste.
- Desktop : le déséquilibre de colonnes reste entier. Gauche à 93 %, droite à 43 % (dernier item « Booking.com » à y≈388) : ~500px de vide sous la colonne droite. Le vide n'a pas été résorbé, il a été déplacé d'un côté à l'autre de la page.

### Régressions apparues avec la passe corrective

- La bande de KPI mobile est passée en PLEINE LARGEUR, à angles vifs, hors de la grille de la page. Mesuré : le fond de la bande (#0D1629) court de x=0 à x=780 et sa première valeur « 550 000 FCFA » démarre à x=24, alors que tout le reste de l'écran (« Dépenses sur la période », « Répartition des dépenses », la carte de répartition) démarre à x=40 et a des coins arrondis. Le bloc se lit comme un élément qui s'est échappé de son conteneur — spectaculaire en thème clair, où c'est un bandeau blanc traversant sur un fond gris-bleu.
- Même bande, deux morphologies selon le breakpoint : sur desktop elle est encartée (x 352→835), bordée et arrondie ; sur mobile elle est full-bleed sans bordure. Le même composant ne se compose pas pareil selon la largeur — reproche déjà fait à l'écran 10 et réintroduit ici.
- Le graphique ajouté est à ~85 % vide : 3 barres pour 14 emplacements, une zone de tracé de ~260px de haut occupée par une seule barre, et une dizaine de tirets d'axe gris pour les jours à zéro. La ligne pointillée de moyenne (19 209) passe à ~23px au-dessus de la ligne de base et se confond visuellement avec l'axe et ses tirets. On a remplacé l'absence de dataviz par une dataviz qui montre surtout du vide.
- Doublon de chiffre : « 268 921 FCFA » est affiché deux fois sur la même page, en display 40px dans le KPI et en pied du panneau « Total de la période ». Sur desktop les deux occurrences sont visibles simultanément à ~640px d'écart.
- Incohérence de règle chromatique intra-écran : « 223 026 FCFA » est en BLANC dans « Répartition des dépenses » (ligne Voyage) et en ROUGE dans « Dépenses de la période » (ligne Booking.com), sur le même viewport desktop. La même somme, deux traitements.
- Les pourcentages « 83 % / 15 % / 2 % » sont en bleu-gris atténué, nettement plus faibles que les montants blancs qu'ils qualifient, dans une colonne médiane sans en-tête.

## 12 KYC — 2/10

### Défauts restants

- Le bandeau hero « Vérification d'identité obligatoire » porte TOUJOURS le dégradé 135° partagé avec la carte bancaire et l'écran 17. MIGRATION_DESIGN §3 réserve gradient-card à VirtualCard/WalletHeroCard/HeroGradientCard ; le même vêtement sert toujours trois objets de nature différente. Non ouvert.
- Mobile : le premier viewport se termine toujours sur l'InfoBanner tranchée en plein milieu d'une phrase (« …En cas de rejet, le motif s'affiche » coupé net à y≈1245) par la barre d'action opaque, sans dégradé de fondu ni aucune affordance de défilement. Le reproche est intact mot pour mot.
- Mobile : la coupe crée en prime une couture visible — le fond de la barre d'action n'a pas exactement la même valeur que celui de la carte InfoBanner, et les bords arrondis de la carte s'interrompent en biseau sur la ligne de la barre. Cela lit comme un clipping accidentel.

## 13 KYC Document — 2/10

### Défauts restants

- Mobile : la liste « Conditions » est guillotinée en plein glyphe par la barre d'action — le 3e puce est tranchée à mi-hauteur, illisible, sans affordance de défilement. Même défaut de pli que sur l'écran 12, et non listé auparavant.
- Desktop : le contenu s'arrête à y≈740 sur 900 et la marge morte entre la sidebar (x=262) et la colonne de contenu (x=532) fait toujours ~270px. Le reproche [L] desktop n'est pas entamé.
- Le libellé désactivé reste à ~4,0:1 (mesuré : texte le plus clair rgb 110,126,176 sur rgb 29,34,47). Légitime pour un état disabled, mais l'objet reste très éteint.

### Régressions apparues avec la passe corrective

- Glyphe faux et redondant sur les deux zones d'import : document/page.tsx:187 fait `const DocIcon = docType === "passport" ? FileText : CreditCard` — c'est donc l'icône lucide CreditCard qui représente une « Carte nationale d'identité ». Sur la MÊME capture mobile ce glyphe est strictement identique à celui de l'onglet « Cartes » de la BottomNav, 550px plus bas. Un picto de carte bancaire pour une pièce d'identité, et le même symbole pour deux rôles à un écran d'intervalle — c'est exactement le marqueur que l'audit traquait sur l'écran 26 (bouclier = logo + avatar + KYC).

## 14 Notifs Settings — 2/10

### Défauts restants

- Le toggle reste l'interrupteur iOS par défaut : piste pilulaire, pastille blanche, ON = bleu de marque. Marqueur [B] non traité, ni sur mobile ni sur desktop.
- Les dividers restent pleine largeur (x=40→740) et uniformes à l'intérieur des groupes ; l'indentation au niveau du texte n'a pas été appliquée.
- Desktop : la différenciation en-tête de section / titre de ligne est très mince — « Alertes de transaction » ~14px semibold blanc contre « Dépôts reçus » ~13px semibold blanc (crop c14dt_hier.png). L'écart de ~1px et l'absence de contraste de couleur font que le repère de section tient uniquement au gap qui le précède. Corrigé franchement sur mobile, tout juste sur desktop.
- Le sous-titre de « Seuil d'alerte » casse prématurément (« En dessous, l'opération / n'apparaît que dans l'historique ») alors que ~200px de largeur libre restent à sa droite sous la valeur. La coupure lit comme un accident de largeur de colonne.
- Thème clair : l'état OFF de l'interrupteur est une pastille quasi blanche sur une piste gris très clair, elle-même sur un fond de page clair — l'affordance est presque muette (constaté sur 15, même composant).

## 15 Confidentialite — 2/10

### Défauts restants

- La CAUSE nommée par RENOTATION n'a pas été touchée. SettingsToggleRow.tsx conserve `flex h-[69px] items-center justify-between` : toujours aucun `gap`, aucun `min-w-0` sur le bloc texte, aucun `shrink-0` sur le Toggle. La collision a été supprimée en raccourcissant la copie, pas en réparant le composant — le premier sous-titre un peu long reproduit le défaut à l'identique. C'est une correction de contenu vendue comme une correction de composant.
- Thème clair : les trois interrupteurs OFF sont une pastille quasi blanche sur piste gris clair sur fond de page clair — ils se lisent comme des fantômes, l'état OFF n'a presque aucune définition.

## 16 Parametres — 3/10

### Défauts restants

- Desktop : la marge morte entre la sidebar (fin x=262) et la colonne de contenu (début x=461) fait toujours ~200px, et la grille 2 colonnes est déséquilibrée — colonne gauche finie à y≈560, colonne droite à y≈790 sur 900.
- Mobile : espacement de section irrégulier — ~123px entre la dernière ligne de « Préférences » et « Compte », mais ~68px entre la dernière ligne de « Compte » et « Sécurité ». Le rythme vertical n'est pas dérivé d'une échelle.

### Régressions apparues avec la passe corrective

- DEUX MORPHOLOGIES DE SÉPARATEUR SUR LE MÊME ÉCRAN. Dans « Préférences » les séparateurs sont des filets droits pleine largeur (x=40→740). Dans « Compte » ce sont les bords bas d'un conteneur arrondi : ils sont rentrés (x≈42→735) et RECOURBÉS VERS LE HAUT AUX DEUX EXTRÉMITÉS — vérifié au zoom 2x sur c16_compte.png et c16_div.png, et confirmé en thème clair. Ils se lisent comme des contours de carte inachevés, pas comme des dividers. L'écran qu'on venait d'unifier sur un seul motif de ligne sépare ses lignes avec deux objets différents à 120px d'intervalle — exactement le reproche « le même composant se compose différemment » de l'audit initial.
- Guillotine du premier viewport mobile : le bloc Sécurité à deux colonnes est tranché EN PLEIN GLYPHE par la BottomNav. « Code PIN » et « Double authentification » sont lisibles, leurs valeurs « Modifié le 12 mars » et « Par SMS » sont sciées horizontalement (seuls les ~3px supérieurs des lettres apparaissent, crop c16_bottom.png). Aucune affordance de défilement. Le contenu ajouté par la passe corrective est ce qui produit la coupe.
- Desktop : « Se déconnecter » est un bouton danger pleine largeur posé dans la SEULE colonne de droite (x=872→1241). L'action terminale de l'écran n'est donc centrée sur rien à l'échelle de la page — même défaut d'axe que le pied de page de l'écran 19.

## 19 Profil — 2/10

### Défauts restants

- Desktop : DEUX boutons de bascule de thème visibles simultanément — un dans la sidebar (x=222, y=45) et un dans l'en-tête de page (x=1334, y=54), soit deux soleils identiques à ~1100px d'écart. C'est exactement la régression relevée sur 02/03, non corrigée. Pire : sur les trois autres écrans de mon lot (09, 10, 11) l'en-tête desktop n'en porte AUCUN — Profil est le seul à dédoubler, ce qui en fait aussi une incohérence entre écrans frères.

### Régressions apparues avec la passe corrective

- Desktop : « Se déconnecter » est devenu un lien texte ROUGE nu, seul élément rouge de la page, flottant à y=668 dans une bande vide — 58px sous le bas de la colonne gauche et 138px sous la colonne droite. Centré sur la page mais ancré à rien : il se lit comme un orphelin entre deux colonnes qui s'arrêtent à des hauteurs différentes.
- La bande de statistiques « 2 Cartes / 24 Transactions / mars 2024 Membre depuis » est ici encartée, bordée et arrondie à la gouttière de 40px, alors que la bande visuellement identique de l'écran 11 est full-bleed à angles vifs. Même composant, deux traitements selon l'écran.
- Dans cette même bande, « mars 2024 » (une date) est composé au même poids que « 2 » et « 24 » (des compteurs) : trois natures d'unité alignées comme des KPI comparables, et le libellé « Membre depuis » se lit comme une légende d'un chiffre alors qu'il qualifie une date.

## 20 Succes Carte — 2/10

### Défauts restants

- [notable] Desktop : le contenu s'arrête à y=566 sur 900 (mesuré), soit 37% de page vide, et la colonne droite (la liste d'informations) s'arrête à y≈400, soit 56% de vide sous elle. Le CTA de 348px reste accroché à gauche sous un bloc de 744px, sans rien sous la colonne droite — la page a gagné une composition, pas une occupation.
- [finition] Sur la face mobile, l'écart entre le dernier groupe de points et « 4291 » (~37px) est plus petit que l'écart entre les groupes de points eux-mêmes (~45px) : le numéro se lit comme trois groupes plus un nombre accolé, pas comme quatre groupes réguliers.
- [finition] La sous-ligne « Créée le 14 avr. · •••• 4291 » redit le dernier groupe imprimé sur la face 60px plus bas.

### Régressions apparues avec la passe corrective

- Divergence de traitement desktop à l'intérieur de la même famille : l'écran 20 reçoit une vraie composition 2 colonnes centrée (contenu x 348→1091, centre 719,5 = centre du viewport), alors que ses cinq frères 21-25 gardent une colonne unique de 400px. Cinq confirmations, deux réponses desktop.
- Le glyphe de la face (bouclier FixPay doré) est le même symbole que l'avatar de l'agent de l'écran 27, que le picto du hero de l'écran 26 et que le badge de succès de l'écran 24 — la correction de la face a laissé le logo assumer un quatrième rôle.

## 21 Succes Depot — 2/10

### Défauts restants

- [notable] Desktop toujours sans réponse : une colonne de 400px dans un 1440×900, sans sidebar, sans second contenu. Mesuré : contenu x 480→879, y 184→711. Le reproche est intact, seule la position verticale a été recentrée.

### Régressions apparues avec la passe corrective

- Décentrage desktop mesurable et neuf : le contenu occupe x 480→879, centre 679,5, alors que le centre du viewport est à 720. La page entière est posée 40px à gauche de l'axe, dans un canevas par ailleurs entièrement vide — c'est le genre d'écart qu'aucun studio ne laisse passer sur un écran qui ne contient qu'un objet. Cause vérifiée dans src/components/ui/SuccessScreen.tsx : le <main> est `mx-auto max-w-[560px] lg:px-10` mais le bloc interne est `max-w-[400px]` SANS `mx-auto` — les 120px restants s'accumulent tous à droite. Le défaut touche par construction les cinq écrans 21 à 25.

## 22 Succes Retrait — 2/10

### Défauts restants

- [notable] Desktop inchangé sur le fond : colonne de 400px dans un viewport vide, sans sidebar (contenu mesuré x 480→879, y 165→729).

### Régressions apparues avec la passe corrective

- Même décentrage desktop de 40px que 21/24/25 (centre du contenu 679,5 vs 720 pour le viewport), causé par le `max-w-[400px]` sans `mx-auto` dans SuccessScreen.tsx.
- Effet de bord de l'unification chromatique : le dépôt (21) et le retrait (22) portent maintenant exactement le même badge vert, la nature de l'opération n'étant plus portée que par l'orientation de la flèche (↙ / ↗). Une entrée et une sortie de fonds signent à l'identique — c'est défendable, mais le seul signal restant est un glyphe de 22px.

## 24 Succes Paiement — 2/10

### Défauts restants

- [finition] Toujours aucun logo ni monogramme marchand : « Marchand : Amazon » reste une identification purement textuelle, alors que l'écran 28 fait déjà mieux avec ses glyphes typés.
- [notable] Desktop inchangé : colonne de 400px centrée dans un 1440×900 vide, sans sidebar (contenu mesuré x 480→879, y 165→731).

### Régressions apparues avec la passe corrective

- Ambiguïté neuve créée par la correction du plafond : « Plafond mensuel 190 000 / 500 000 FCFA » se lit, dans la convention X/Y, comme « 190 000 consommés sur 500 000 ». Or l'écran 10 affiche le même 190 000 comme le RESTANT (« Dépensable d'ici la fin du mois 190 000 FCFA · 310 000 FCFA déjà dépensés sur un plafond de 500 000 FCFA par mois · 62 % utilisé »). Le même nombre change de sens d'un écran à l'autre, et rien sur 24 ne dit lequel des deux on lit.
- Le glyphe du badge est un bouclier coché — la forme même du logo FixPay, déjà employée comme picto du hero Support (26), comme avatar de l'assistant (27) et sur la face de la carte. Un paiement accepté signe donc avec le symbole de la marque/sécurité : quatrième rôle pour un même symbole, exactement le reproche fait à l'écran 26.
- Même décentrage desktop de 40px que 21/22/25 (centre 679,5 vs 720).

## 26 Support — 5/10

### Défauts restants

- [notable] Le hero à dégradé de marque 135° est TOUJOURS là, pleine largeur, sur les deux thèmes. Il occupe ~130px de hauteur mobile pour un titre et une phrase de service.
- [notable] Les trois tuiles d'icône teintées sont intactes : chat = carré vert, e-mail = carré bleu, WhatsApp = carré vert. Chat et WhatsApp restent deux carrés verts identiques au premier coup d'œil, seul le glyphe interne diffère.
- [notable] Tout-en-carte intact : hero + ListGroup contacts + ListGroup FAQ, trois conteneurs empilés ; seuls les deux SectionLabel sont posés sur le fond.
- [notable] Le numéro WhatsApp est toujours « +221 7X XXX XX XX » — vérifié dans src/lib/mock-data.ts ligne 601 : un masque de maquette affiché comme une coordonnée réelle, à côté d'un « Disponible 24h/24 ».
- [finition] La FAQ reste tronquée en mobile : « Comment retirer de l'argent ? » est coupée à mi-hauteur par la BottomNav, sans « Voir tout » ni affordance de défilement. Les 5 items ne tiennent que sur desktop.
- [finition] Aucun champ de recherche en tête de FAQ.
- [finition] Le bouclier du hero est le logo de l'app, aussi avatar de l'agent (27), picto KYC et désormais badge de succès (24).
- [notable] Doublon littéral NON corrigé : le hero annonce « Réponse en moins de 5 minutes, 7j/7 — cartes, portefeuille et compte. » et la ligne « Chat en direct » porte « Réponse en moins de 5 minutes » 250px plus bas. La phrase a seulement reçu un suffixe.
- [notable] Desktop : bande morte de 269px entre la sidebar (qui s'arrête à x=262) et la colonne de contenu (qui commence à x=531), marge droite symétrique de 268px. Le bandeau à dégradé y prend l'air d'une bannière marketing.

### Régressions apparues avec la passe corrective

- Aucune — et pour cause : l'écran n'a pas été ouvert par la passe corrective. src/app/(flows)/support/page.tsx est daté du 2026-07-30 18:52, alors que tous les fichiers corrigés portent la date du 2026-07-31 08:38-10:42. Aucun des neuf points ci-dessus n'a été traité.

## 27 Chat Support — 4/10

### Défauts restants

- [notable] La barre de saisie ne contient toujours qu'un champ et un bouton d'envoi : aucun bouton pièce jointe, aucun accusé de lecture, aucun indicateur de saisie, aucun état d'erreur d'envoi.
- [finition] Le message d'accueil n'a pas été raccourci : toujours trois lignes, avec « aujourd'hui ? » seul sur une dernière ligne de ~150px — la bulle garde son escalier irrégulier.
- [notable] Toujours pas de « Parler à un conseiller », et la promesse de délai diverge d'un écran à l'autre : l'en-tête annonce « En ligne · réponse immédiate » quand l'écran 26 promet deux fois « Réponse en moins de 5 minutes » sur le même canal.
- [notable] En mobile, la zone comprise entre l'en-tête (y≈200) et le séparateur « Aujourd'hui » (y≈920) est un aplat vide de ~46% de la hauteur d'écran, sans état d'ouverture : ni illustration, ni rappel de contexte, ni historique.
- [notable] Desktop : une bulle unique posée en bas d'une zone de 1178×900 quasi entièrement vide ; aucune adaptation à la largeur (pas de panneau d'aide, pas d'historique de tickets).

### Régressions apparues avec la passe corrective

- Aucune. Le fichier src/app/(flows)/support/chat/page.tsx est daté du 2026-07-30 18:56 : l'écran n'a pas été touché par la passe corrective. Les trois détails « de main humaine » relevés par l'audit (coin cassé asymétrique de la bulle, avatar ancré en bas, chips alignées sur le bord de la bulle) sont toujours là, et la barre de saisie garde son fond opaque.

## 28 Notifications — 4/10

### Défauts restants

- [notable] Le marqueur principal est intact : les montants restent noyés au milieu de la sous-ligne 11,5px muted — « Amazon — 39 341 FCFA débité de Visa ••••4291 · 14:32 », « Votre portefeuille a été crédité de 100 000 FCFA · Hier, 09:16 ». Ni colonne droite, ni signe +/−, ni graisse distincte.
- [notable] Taxonomie inchangée mot pour mot : « Paiement effectué », « KYC en attente », « Recharge confirmée », « Alimentation carte réussie », « Recharge portefeuille », « Retrait effectué », « Compte créé avec succès » — et toujours deux libellés différents (« Recharge confirmée » / « Recharge portefeuille ») pour le même type d'événement.
- [notable] Aucune action « Tout marquer comme lu », aucun filtre, aucune affordance de clic sur les lignes (ni chevron, ni cible). Le seul lien de sortie, « Gérer mes alertes », existait déjà avant la passe.
- [notable] Desktop rigoureusement identique : colonne unique de 600px mesurée (x 551→1151) dans un contenu de 1178px, ~289px de vide de chaque côté, descriptions en 11px, aucun passage en tableau icône | libellé | montant à droite | date.
- [finition] Les icônes nues sont toujours centrées sur la ligne entière : sur « Recharge confirmée », dont la description passe à deux lignes, le glyphe ↙ retombe sous la ligne du titre. Cause vérifiée dans ListItem.tsx : la rangée est en `items-center`, sans alignement sur la première ligne de texte.
- [finition] « Nouvelles · 3 » porte un compteur, « Précédentes » n'en porte pas, et aucune des deux sections n'est datée.
- [finition] La section « Précédentes » (4 lignes sur 7) reste globalement grisée et lit encore comme désactivée plutôt que comme déjà consultée.

### Régressions apparues avec la passe corrective

- Décrochage neuf entre cette liste et le grand livre reconstruit sur les écrans 21-25 : la notification « Recharge confirmée — votre portefeuille a été crédité de 100 000 FCFA · Hier, 09:16 » n'a aucune trace dans les soldes. Les reçus donnent 1 746 552 FCFA au portefeuille le 11 avr. 17:20 (écran 23) et le même 1 746 552 comme solde de départ le 14 avr. 15:48 (écran 25, avant le rapatriement de 100 000) : le portefeuille n'a pas bougé entre les deux, alors que la notification affirme un crédit de 100 000 la veille.
- Toujours dans le même décrochage : les trois opérations les plus récentes du 14 avr. — rapatriement 100 000 à 15:48 (écran 25), retrait 30 000 à 16:05 (écran 22), dépôt 50 000 à 16:20 (écran 21) — sont absentes de « Nouvelles », alors que le paiement de 14:32 du même jour y figure. La passe a chaîné les reçus sans alimenter l'écran qui les annonce (src/app/(flows)/notifications/page.tsx et src/lib/mock-data.ts sont datés du 2026-07-30, avant la passe).

