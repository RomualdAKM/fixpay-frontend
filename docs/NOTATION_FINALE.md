# Notation finale (2,7/10) — défauts restants

## 01 Onboarding — 3/10

*Ce qui tient :* Preuve locale réelle (Orange Money · Wave · MTN, FCFA) au lieu du bandeau de features génériques

- **[notable]** Le thème clair n'existe pas sur cet écran : la capture mobile-light est rigoureusement identique à la mobile-dark (même fond #0A0E1A, même texte blanc). Tous les autres écrans du lot basculent correctement — c'est donc un trou dans le système, pas un parti pris assumé.
- **[notable]** Composition desktop non pensée : le contenu occupe une bande centrale de ~400 px dans un viewport de 900, avec ~200 px de vide sous le logo et ~250 px sous le bloc légal. Le mobile a simplement été réparti en deux colonnes, sans échelle desktop.
- **[notable]** Typographie desktop sous-dimensionnée : le titre héros tombe à ~40 px sur 1440 de large (contre ~54 px sur un écran de 390) et le texte légal à ~11 px, à la limite du lisible. Le contraste typographique gagné en mobile est perdu au grand format.
- **[finition]** La carte est un aplat dégradé bleu→bleu sans matière, sans hologramme, sans hiérarchie de gravure ; le mot-symbole doré est la seule accroche. Reste un objet décoratif plus qu'un fac-similé de carte.
- **[finition]** Aucune friction annoncée : ni frais d'émission, ni délai, ni plafond, alors que l'écran promet « en quelques minutes ». Une promesse sans contrepartie chiffrée est un marqueur.

## 02 Accueil — 3/10

*Ce qui tient :* Montants observés et non fabriqués (816 202, 394 895, −39 341 FCFA) : plus aucun chiffre rond décoratif

- **[notable]** Gouttière d'icône vide sur les lignes marchands : Amazon, Spotify et (desktop) Booking.com laissent un creux de ~56 px à gauche alors que Wave — Dépôt et Retrait — Wave portent une pastille circulaire. Le texte est indenté sur une vignette absente : la liste paraît cassée, pas volontairement sobre.
- **[notable]** Écran quasi-redondant avec 03_Portefeuille : même carte de solde, mêmes deux lignes de cartes au mot près, même liste de mouvements. Seuls les intitulés changent (« Mes cartes »/« Cartes liées », « Historique »/« Mouvements »). C'est le réflexe génératif de remplir les onglets avec des variantes du même tableau de bord.
- **[notable]** Desktop : la colonne de droite s'arrête à 460 px et la page laisse ~440 px de vide en bas de viewport. Aucune densité propre au desktop n'a été ajoutée alors que la place existe.
- **[notable]** Dépôt et Retrait exposés en actions primaires sans aucune mention de frais, de plafond par opération ni de délai — l'absence de coût sur un produit de recharge mobile money ouest-africain n'est pas crédible.
- **[notable]** Barres « Plafond de dépenses · avril » sans dénominateur : 190 000 restants avec une barre remplie aux deux tiers, 405 000 restants avec une barre au sixième. Sans le plafond total affiché, les deux jauges sont inexploitables et se contredisent visuellement.
- **[finition]** Trois formats de date cohabitent dans la même liste (« 14:32 », « Hier, 09:15 », « 12 avr. ») sans en-têtes de groupe Aujourd'hui/Hier pour les justifier.
- **[finition]** La carte de solde reste le seul bloc à dégradé bleu de l'écran ; l'aplat diagonal bleu-nuit→bleu vif n'apporte rien qu'un aplat de marque ne ferait mieux.

## 03 Portefeuille — 4/10

*Ce qui tient :* Vocabulaire métier juste : « Alimentation Visa •••• 4291 » est une écriture de compte, pas un libellé de démo

- **[bloquant]** Clone d'Accueil. En mobile, la carte de solde, le bloc de deux cartes et la liste de mouvements sont pixel pour pixel ceux de 02_Accueil ; seul le titre et deux intitulés de section diffèrent. Un portefeuille devrait montrer ce qu'Accueil ne montre pas (comptes mobile money liés, dépôts/retraits en attente, frais, historique de recharge). En l'état l'onglet n'a pas de raison d'exister — c'est le marqueur le plus lourd de mon lot, et il porte précisément sur ce que la passe composition prétendait traiter.
- **[notable]** Desktop : ~370 px de vide sous le contenu, colonne de gauche qui s'arrête à mi-hauteur. Même défaut qu'Accueil, non corrigé.
- **[finition]** Le mot-symbole FixPay posé en haut à droite de la carte de solde est illisible : le « Pay » bleu sur fond bleu disparaît, et en desktop il touche le bord de la carte au point de paraître rogné.
- **[notable]** « Plafond de mouvements · avril — 2 000 000 FCFA restants » avec une barre remplie à ~80 % : la jauge dit « presque épuisé » pendant que le texte dit « 2 M restants ». Sémantique de la barre (consommé ou restant ?) non tranchée, et incohérente avec les jauges d'Accueil.
- **[finition]** Aucun état de liste au-delà du cas nominal : pas de mouvement « en attente », pas d'échec de dépôt, alors que le mobile money en génère en permanence.

## 04 Depot Portefeuille — 2/10

*Ce qui tient :* Le meilleur usage de données réelles du lot : indicatifs et opérateurs par pays exacts (+229 MTN MoMo/Moov/Celtiis, +221 Orange/Free/Wave). Liste groupée à filets, sans tuile d'icône devant chaque ligne. CTA désactivé tant que rien n'est choisi : l'état existe.

- **[notable]** Desktop : la colonne de droite (≈560 px de large) ne contient que deux lignes de légende (« Les frais et le délai dépendent du pays… ») puis 700 px de vide. La grille à deux colonnes est posée mais non remplie — c'est le marqueur « densité irréaliste et vides » qui subsiste, au niveau macro cette fois.
- **[notable]** Mobile : la barre d'action collante coupe la liste au rasoir, en plein milieu d'une ligne (« Mali » puis une amorce de rangée tronquée à 8 px). Aucun dégradé de masquage ni demi-ligne assumée : la coupe lit comme un bug de layout, pas comme un affordance de scroll.
- **[finition]** Les six pays reçoivent exactement la même hauteur de ligne et le même traitement typographique ; seule la carte « Récemment utilisé » se détache, et uniquement par son isolement. Aucune hiérarchie interne à la liste (pas de pays majoritaire mis en avant, pas de tri implicite lisible).
- **[finition]** Le pastille radio vide à droite de chaque ligne est le seul élément interactif visible et il est en gris très bas contraste sur fond sombre : la cible tactile réelle (toute la ligne) n'est signalée par rien.

## 05 Retrait Portefeuille — 3/10

*Ce qui tient :* Écran frère de 04, et la fraternité est bien tenue : même barre d'étapes 1/4, mêmes libellés de section, même liste. La seule divergence est justifiée (bloc « Disponible au retrait » ajouté en tête).

- **[bloquant]** Desktop : le bouton « Continuer » est coupé net par le bas du viewport — on n'en voit que la moitié supérieure. L'action principale de l'écran n'est pas atteignable sans scroll, et rien n'indique qu'il faille scroller. C'est un défaut de composition, pas un défaut de contenu.
- **[notable]** Mobile : l'ajout du bloc de solde pousse la liste de 230 px, si bien que la coupe collante tombe en plein sur le mot « Côte d'Ivoire », à demi tranché horizontalement. Le rythme vertical n'a pas été recalculé après l'insertion du bloc.
- **[notable]** Desktop : même colonne droite quasi vide qu'en 04 (deux lignes de légende, puis rien sur 700 px). Le défaut est systémique au gabarit de flux, pas propre à un écran.
- **[finition]** « Disponible au retrait / 1 866 252 FCFA » est enfermé dans une carte à fond et bordure alors qu'il ne s'agit que d'une paire label/valeur — reliquat de « tout-en-carte » ; en 08 la même information (« Débité de · Visa •••• 4291 ») est traitée en texte nu, ce qui prouve que le système sait faire mieux.

## 06 Alimenter Carte — 3/10

*Ce qui tient :* Le panneau desktop « Frais et délai » (Frais Gratuit · Délai Instantané · Plafond restant 190 000 FCFA) est de la vraie pensée fintech : le plafond restant, personne ne l'invente par hasard. Deux cartes de destination avec soldes réels et une seule sélectionnée.

- **[notable]** Desktop : sous le CTA, ≈370 px de vide plein cadre, et la colonne droite s'arrête à 480 px pour laisser 420 px de noir. L'écran occupe la moitié haute d'un 1440×900 et abandonne le reste.
- **[notable]** Mobile : « Frais et délai » et la seconde carte (Mastercard •••• 7834) passent sous la ligne de flottaison, alors qu'ils sont visibles d'emblée en desktop. L'arbitrage de priorité n'a pas été refait pour le petit écran : on paie sans voir le coût.
- **[notable]** Le champ de montant est une boîte de 110 px de haut contenant un « 0 » de 32 px centré — un vide de 100 px de large de chaque côté. Aucun suffixe FCFA en ligne, alors que 08 affiche « 0 FCFA ». Deux écrans, deux traitements du même geste.
- **[finition]** Le bandeau d'information en tête (3 lignes, icône ⓘ, carte pleine) mange 175 px avant toute action, et répète ce que le titre dit déjà. Il pousse tout le contenu utile vers le bas.
- **[finition]** Les puces de montant sont des pilules à rayon plein tandis que le champ et les cartes sont à 16 px : le vocabulaire de rayon n'est pas motivé, il alterne.

## 07 Retrait Carte — 3/10

*Ce qui tient :* Bonne dissymétrie assumée avec 06 : « Carte débitée » est ici une ligne nue avec un lien « Changer » plutôt qu'une liste de sélection — la composition suit le sens (une seule source possible) au lieu de dupliquer le gabarit.

- **[notable]** Mobile : la coupe collante tombe pile sur le titre de section « Frais et délai », dont il ne reste qu'un tiers de hauteur de glyphe illisible. C'est la troisième occurrence de la même faute dans le lot — le pied collant n'a pas été intégré au calcul du rythme vertical.
- **[notable]** Desktop : ≈700 px de vide sous le contenu, colonne droite terminée à 270 px. Densité la plus faible du lot sur grand écran.
- **[finition]** Le bloc « Frais et délai » n'a ici que deux colonnes (Frais, Délai) contre trois en 06 (+ Plafond restant), mais le séparateur vertical et la largeur de colonne sont conservés, ce qui laisse une colonne fantôme de 300 px à droite de « Instantané ». La grille n'a pas été recalée sur le nombre d'items.
- **[finition]** Les montants rapides passent de 25/50/100/200 k en 06 à 10/25/50/100 k en 07 : l'échelle change, mais rien dans la composition ne signale pourquoi (aucun rappel du solde carte comme borne). Cohérent en intention, muet en présentation.

## 08 Paiement — 3/10

*Ce qui tient :* Le seul écran du lot à changer de mécanique (pavé numérique) plutôt qu'à recycler le champ de saisie. Bénéficiaire en texte nu, sans avatar ni tuile — bon refus du réflexe « tuile d'icône devant chaque ligne ». « Boutique Adjamé · Abidjan · Commerce de proximité » sonne observé, pas généré.

- **[bloquant]** Mobile : la quatrième rangée du pavé numérique (« . », « 0 », effacement) est entièrement hors champ, coupée par la barre d'action. On voit 1-9 et rien d'autre : impossible de taper un montant rond ni de corriger une frappe. C'est le défaut le plus grave du lot, et il est visible sur les deux thèmes.
- **[notable]** L'interlignage du pavé (≈130 px entre rangées, chiffres sans surface de touche) est la cause directe du débordement : le pavé occupe 460 px pour trois rangées là où un pavé réel en tient quatre. Générosité d'espacement non budgétée.
- **[notable]** Mobile : ni le champ « Motif (facultatif) » ni le bloc « Frais et délai » — tous deux présents en desktop — n'apparaissent, et le pavé les repousse hors d'atteinte. Le paiement mobile se fait donc sans frais affichés.
- **[finition]** Toute la moitié haute est centrée sur un axe unique (label, montant, puces, minimum, pavé) : c'est la composition symétrique et molle, ici sans contrepoint — seule la ligne « Débité de · Visa •••• 4291 » revient à un alignement gauche/droite.

## 09 Creer Carte — 2/10

*Ce qui tient :* Le meilleur écran du lot. Vrai tableau comparatif (prix d'émission, plafond mensuel, % en devise, acceptation) plutôt qu'une paire de cartes marketing ; et « Acceptation : les sites qui refusent Visa » pour la Mastercard est une ligne qu'aucune génération automatique ne produit. Le total « 3 000 FCFA · payé via Mobile Money » ancre le prix avant l'engagement.

- **[notable]** L'indicateur d'étape adopte ici un troisième gabarit (« Type de carte » à gauche / « Étape 1 sur 5 » à droite, barre en 5 segments) alors que 04 et 05 utilisent « Étape 1 sur 4 · Pays » sur une ligne au-dessus d'une barre en 4 segments. Trois flux à étapes, deux conventions : c'est exactement la cohérence entre écrans frères qui manque.
- **[notable]** Desktop : le filet horizontal au-dessus de « Total · payé via Mobile Money » s'arrête à ≈973 px alors que le champ « Nom sur la carte » juste au-dessus court jusqu'à 1251 px. Décrochage d'alignement franc de 280 px sur une hairline.
- **[finition]** Desktop : le champ « Nom sur la carte » fait 800 px de large pour un nom propre (justification de ~60 caractères), et le tiers inférieur de la page (≈330 px) reste vide.
- **[finition]** Les deux vignettes de carte reposent sur des dégradés décoratifs (bleu nuit → bleu vif, bordeaux → magenta) avec logo « FixPay » doré : c'est le seul reliquat de décor du lot. Défendable pour de l'artwork de carte, mais le magenta n'existe nulle part ailleurs dans la palette.
- **[finition]** Mobile : la carte Mastercard est tranchée par la barre de total, comme en 04/05/07 — même faute de rythme vertical, quatrième occurrence.

## 10 Detail Carte — 3/10

- **[notable]** La carte Visa reste un dégradé décoratif bleu-sur-bleu en diagonale (bleu profond en haut à gauche vers bleu vif en bas à droite) — c'est le seul dégradé de l'écran et il est purement cosmétique. Une carte de studio est soit une couleur plate, soit une texture/motif propriétaire, pas un linear-gradient de framework.
- **[notable]** Desktop : la colonne de gauche s'arrête à y≈550 (boutons Alimenter/Payer) et la droite à y≈600, laissant les 300 px inférieurs entièrement vides sur 1440×900. Le contenu se tasse en haut, rien ne redistribue la hauteur.
- **[finition]** Asymétrie mobile/desktop du contenu : la note de parité (« Débitées en francs… parité fixe 1 € = 655,957 FCFA ») et le bloc « Bloquer la carte » n'existent que sur desktop. Ce sont les deux éléments les plus « observés » de l'écran et le mobile ne les montre pas dans la zone visible.
- **[finition]** Le porteur « JEAN DUPONT » / EXP 12/28 est un placeholder de démo générique, repris tel quel dans la sidebar (jean.dupont@email.com). Donnée fabriquée plutôt qu'observée.

## 11 Statistiques — 3/10

- **[notable]** Le graphe « Dépenses jour par jour » est visuellement cassé : 4 jours sur 7 sont des traits de 2 px, une barre écrase tout (223 026 FCFA) et deux barres intermédiaires sont minuscules. Le chiffre est honnête (3 dépenses), mais un studio n'afficherait pas un histogramme 7 jours dans cet état — il passerait à un autre mode de lecture ou à un état « trop peu de données ».
- **[notable]** Aucune graduation verticale, aucune valeur au survol visible, seules deux dates aux extrémités (8 avr. / 14 avr.). Le graphe flotte sans axe ni repère de lecture.
- **[notable]** Palette catégorielle arbitraire bleu / moutarde / rose : le segment rose (2 %) fait 6 px dans la barre empilée, illisible, et le rose n'apparaît nulle part ailleurs dans le produit.
- **[notable]** Desktop : sous la bande de 3 chiffres (Recharges / Solde carte / Portefeuille) qui s'arrête à y≈520, toute la moitié basse gauche est vide sur 400 px.
- **[finition]** La bande à 3 statistiques séparées par de simples filets est bien vue, mais elle mélange trois natures de chiffres (un cumul de recharges, un solde de carte, un solde de portefeuille) sans hiérarchie — juxtaposition décorative plutôt que comparaison.

## 12 KYC — 2/10

- **[notable]** La mention réglementaire (« Vérification exigée par la réglementation LBC/FT de l'UEMOA (BCEAO). Vos pièces sont chiffrées et conservées 5 ans… ») n'est présente que sur desktop ; le mobile la perd. C'est justement l'élément qui prouve que l'écran a été pensé et pas généré, et il disparaît sur le canal principal.
- **[finition]** Le filet de liaison du stepper est mal tenu : sous la pastille verte le trait vertical descend, puis il est coupé par le séparateur de ligne et ne reprend pas à l'aplomb de la pastille 2 (léger décalage horizontal visible entre étape 1→2 et 2→3).
- **[finition]** Desktop : bloc terminé à y≈720 sur 900, moitié gauche de la zone de contenu inoccupée (gouttière de 270 px entre la sidebar et le contenu). Le CTA isolé flotte dans le vide.

## 13 KYC Document — 2/10

- **[notable]** Mobile : entre « Importez le recto et le verso pour pouvoir soumettre » (y≈1128) et la barre CTA collante (y≈1250) il reste un vide mort d'environ 120 px, puis 200 px de fond nu au-dessus — le bas d'écran ne porte rien. Le rythme vertical se délite après le bloc d'upload.
- **[notable]** Desktop : les deux zones de dépôt font 385 px de large pour un contenu (icône + 2 lignes) calé à gauche sur 130 px — les cartes sont aux trois quarts vides. La grille mobile a été étirée sans être recomposée.
- **[finition]** Desktop : tout se termine à y≈625 sur 900 ; le tiers inférieur est vide, comme sur 12 et 17.

## 14 Notifs Settings — 2/10

- **[notable]** Densité mobile très faible : titres de ligne en ~24 px, hauteur de ligne ~138 px, écarts inter-sections de ~150 px — 4 réglages et demi tiennent dans un écran plein. Un écran de réglages Revolut/N26 en montre 8 à 9. La liste est aérée au point de paraître maquette plutôt que produit.
- **[finition]** La ligne « Notifications push » est coupée en deux par la barre de navigation (toggle tranché au pli). Le pas vertical ne tombe jamais juste sur la hauteur d'écran.
- **[finition]** « Seuil d'alerte » mélange dans la même liste un interrupteur binaire et un sélecteur de valeur (≥ 1 000 FCFA ⌄) sans marquer la différence de nature autrement que par le contrôle à droite.

## 15 Confidentialite — 2/10

- **[notable]** Même défaut de densité que 14, aggravé : seulement 4 interrupteurs dans l'écran complet, et le premier appareil connecté (le contenu le plus intéressant : iPhone 13 · Abidjan, Chrome · Dakar, avec bouton Déconnecter) est entièrement sous le pli sur mobile.
- **[notable]** Desktop : la liste d'appareils déborde en bas de viewport (Chrome · Abidjan tranché à y=890) alors que la colonne de droite est totalement vide — mise en page à une seule colonne dans une zone qui en autorise deux, contrairement à 16 et 18 qui, eux, passent en deux colonnes. Incohérence de grille entre écrans frères.
- **[finition]** Les deux sections d'interrupteurs sont typographiquement identiques (titre 20 px + sous-titre) alors que l'une est un réglage local et l'autre un consentement réglementaire révocable ; rien ne distingue visuellement les deux enjeux.

## 16 Parametres — 2/10

- **[notable]** Desktop : « Se déconnecter » est un bouton centré, seul, sous les deux colonnes, à 100 px du dernier contenu — c'est le seul élément centré de tout le produit, tout le reste étant aligné à gauche. Composition symétrique molle en fin de page.
- **[notable]** Mobile : vide de ~150 px entre « Thème » et « Sécurité », et l'écran s'arrête sur le déverrouillage biométrique avec 100 px de fond nu avant la barre de navigation. Le reste (Mobile Money, version, déconnexion) n'existe visuellement que sur desktop.
- **[notable]** La gouttière gauche de la zone de contenu varie d'un écran à l'autre sur desktop (contenu démarrant à x≈352 sur 10 et 11, x≈431 sur 16, x≈461 sur 18, x≈531 sur 12, 13, 15 et 17). Les écrans frères ne partagent pas une même colonne de base : la maquette est centrée sur une largeur qui dépend du contenu au lieu d'être posée sur une grille.

## 17 Parrainage — 4/10

- **[notable]** Le bandeau promo est un dégradé bleu diagonal plein cadre, coins très arrondis, sans image ni typographie propre — c'est le marqueur « bloc dégradé décoratif » le plus net du lot, et il ouvre l'écran. La promesse (« Gagnez 5 000 FCFA par ami ») y est traitée exactement comme dans un template généré.
- **[notable]** Desktop : le paragraphe « Mes parrainages » se termine à y≈513 et la rangée de boutons commence à y≈525 — 12 px de respiration. La barre d'actions collante du mobile a été recollée en ligne sous un paragraphe, elle percute le texte.
- **[notable]** Desktop : les deux boutons sont de largeurs très inégales (WhatsApp ≈ 118 px, Partager mon lien ≈ 512 px) sans raison hiérarchique lisible, alors que le mobile les équilibre correctement.
- **[notable]** La rangée de statistiques affiche 0 FCFA / 0 / 0 sur trois colonnes de 213 px : trois zéros étalés sur toute la largeur. L'honnêteté de l'état vide est juste, mais la composition ne s'y adapte pas — une seule ligne de texte aurait suffi.
- **[finition]** Desktop : contenu terminé à y≈575 sur 900, plus de 35 % de la page vide.

## 18 Fidelite — 2/10

- **[notable]** Thème clair : le « 240 » en or (#A8•• sur fond #EEF1F8) et la mention « 100 points » passent sous un contraste confortable ; l'accent doré, lisible en sombre, devient terne et sale en clair. Le token n'a pas de variante par thème.
- **[finition]** La barre de progression du palier est dorée alors que le palier courant est « Argent » et la cible « Or » — la couleur désigne la destination, pas l'état, ce qui brouille la lecture.
- **[finition]** Mobile : la section « Mouvements de points » n'apparaît que par son titre, tranché par la barre de navigation ; le journal des points (le contenu qui rend le programme crédible) est entièrement hors écran.
- **[finition]** Desktop : encadré explicatif à icône (i) en bas — dernier vestige du réflexe « tout-en-carte » sur un écran par ailleurs entièrement en listes à filets. Et le tiers inférieur de la page reste vide.

## 19 Profil — 2/10

*Ce qui tient :* Le seul écran qui expose de vrais états produit : KYC étape 2 sur 3 · pièce d'identité, v1.4.2 en pied de page, déconnexion en rouge sourd

- **[notable]** Troisième représentation du même objet carte dans le même lot : ligne monospace nue sur Accueil, ligne monospace nue sur Portefeuille, vignette dégradée dans un conteneur carte ici. Les écrans frères ne partagent pas de composant de carte.
- **[finition]** La vignette Mastercard est un dégradé rouge/bordeaux inventé, et son logo est réduit à un seul cercle orange — ça se lit comme un rendu incomplet plutôt que comme une marque.
- **[finition]** Rythme du bloc d'en-tête mobile : « Membre depuis mars 2024 · 24 transactions » flotte à ~55 px sous l'email, aligné sur la colonne de texte mais sans rattachement visuel. En desktop le même bloc est serré à 8 px — le rythme vertical n'est pas le même objet d'un breakpoint à l'autre.
- **[finition]** L'en-tête mobile perd la cloche de notifications présente sur Accueil et Portefeuille, sans raison fonctionnelle. Incohérence entre écrans frères sur un élément persistant.
- **[finition]** En mobile, tout est mis en carte (Mes cartes, Avantages, Compte) alors qu'Accueil et Portefeuille utilisent des filets pleine largeur pour des listes équivalentes. Reste du réflexe tout-en-carte, ici en contradiction avec le reste du parcours.

## 20 Succes Carte — 2/10

*Ce qui tient :* La fiche « Informations de la carte » est un vrai document produit : type, date d'émission, plafond, devise de règlement (« EUR — converti en FCFA »), frais d'émission, statut. Six lignes qu'aucun générateur ne produit spontanément.

- **[notable]** Desktop : la colonne gauche s'arrête à y≈700 et la colonne droite à y≈600 sur un viewport de 900 — plus de 40 % de la page est du vide noir sous le contenu. Le split deux colonnes a été appliqué sans repenser ce que devient le bas de page.
- **[finition]** La tuile verte 104×104 à coin arrondi ~28px avec coche blanche centrée reste le composant canonique de l'écran de succès généré. Il est sobre (pas de lueur, pas de halo, pas de confettis) mais c'est encore le réflexe par défaut.
- **[finition]** Carte à dégradé bleu-sur-bleu décoratif : en thème clair le passage marine → bleu roi est nettement plus contrasté qu'en sombre, la carte ne se comporte pas comme un objet physique à couleur fixe. Une carte Visa réelle a la même livrée dans les deux thèmes.
- **[notable]** Le lien secondaire « Alimenter ma carte », visible sur desktop, tombe hors écran sur mobile (le CTA primaire touche le bord bas à 1560px). Le parcours n'offre plus qu'une sortie sur mobile.

## 21 Succes Depot — 3/10

*Ce qui tient :* Le récapitulatif chaîne source (Wave · numéro masqué), destination, frais, nouveau solde, référence FP-1404-8871 et horodatage — et le solde 1 866 252 se déduit exactement de l'écran 22. C'est une donnée observée, pas inventée.

- **[notable]** Mobile : environ 300px de vide sous « Nouveau dépôt » (le contenu s'arrête à y≈1230 sur 1560). Le bloc entier flotte en haut sans que rien n'ancre le bas.
- **[notable]** Desktop : le contenu occupe y=300→590 sur 900px de haut, centré verticalement dans un océan noir, et la colonne droite fait 340px de large. La densité desktop est irréaliste pour un écran de confirmation bancaire.
- **[notable]** Squelette rigoureusement identique à 22, 24 et 25 (tuile / titre / montant / « Récapitulatif » / 7 lignes / bouton plein / lien texte), avec le même nombre de lignes à chaque fois. Cette régularité de gabarit sur cinq écrans frères se lit comme un remplissage de template plutôt qu'un design par cas.
- **[finition]** Bouton entièrement pilulaire (radius = hauteur/2) alors que la tuile d'icône et les cartes utilisent un radius modéré. Deux grammaires d'arrondi cohabitent sans intention lisible.

## 22 Succes Retrait — 3/10

*Ce qui tient :* « Frais 300 FCFA (1 %) » puis « Total débité 30 300 FCFA » puis « Crédit du compte : sous 5 min » — les frais sont montrés, chiffrés, pourcentés, et le délai d'exécution est annoncé. C'est le contraire du marqueur « absence de frais ».

- **[notable]** La tuile est verte pour un débit sortant. Le vert « succès » est appliqué mécaniquement aux six écrans quelle que soit la direction du flux ; ici il entre en conflit avec le montant « − 30 000 » juste en dessous.
- **[notable]** Même vide bas que 21 : contenu jusqu'à y≈1310 sur 1560 en mobile, et desktop qui s'arrête à y≈600 sur 900.
- **[notable]** Sept lignes de récapitulatif, exactement comme 24 et 25. Un retrait, un paiement carte et un rapatriement n'ont aucune raison de produire le même nombre d'informations.
- **[finition]** Aucun état d'attente : le retrait est annoncé « envoyé » avec « crédit sous 5 min », mais rien dans l'écran ne prévoit la version en cours de traitement ou échouée du même événement.

## 23 Succes Alimentation — 3/10

*Ce qui tient :* Rompt volontairement la tuile verte en affichant une vignette de la carte alimentée, et différencie les deux soldes impactés (carte 955 543 / portefeuille 1 746 552). L'intention de composition est réelle.

- **[notable]** La vignette est un clone réduit de la carte pleine taille : le logo « FixPay » y est rendu à ~5px de haut, illisible et sale, et le « VISA » à 6px. Un studio poserait un badge réseau ou une puce, pas un rendu à 25 % d'un composant conçu pour 680px.
- **[notable]** La vignette fait 160×100 alors que les tuiles de 20/21/22/25 font 104×104 : la ligne de base du titre descend de 12px par rapport aux écrans frères. Le rythme vertical annoncé comme corrigé casse précisément ici.
- **[notable]** Le montant « 125 000 FCFA » n'est ni signé ni coloré alors que 21 utilise « + » et 22/24 utilisent « − ». La convention de signe n'est pas tenue sur la famille.
- **[finition]** Aucun marqueur de succès (ni coche, ni couleur) : l'écran ne dit visuellement pas qu'il s'agit d'une confirmation, seulement le participe passé du titre.
- **[notable]** Mobile : ~250px de vide sous « Voir ma carte ». Desktop : contenu terminé à y≈600 sur 900.

## 24 Succes Paiement — 2/10

*Ce qui tient :* « Plafond restant 190 000 FCFA sur 500 000 » et surtout le lien secondaire « Ce n'est pas moi — signaler l'opération » à la place du « Nouveau paiement » attendu : c'est un comportement fintech observé, pas déduit. Le monogramme marchand remplace la coche verte.

- **[notable]** Le monogramme « A » est un avatar de remplacement. En thème clair la tuile est blanc pur sur fond gris très clair : elle flotte sans bord, presque invisible, alors qu'en sombre elle est bordée. Le composant n'a pas été traité dans les deux thèmes.
- **[notable]** L'écran 20 déclare la carte « EUR — converti en FCFA », mais ce paiement Amazon affiche « Frais Gratuit » sans ligne de taux de change ni de commission de conversion. C'est l'omission de frais la plus coûteuse du lot, et elle contredit une information posée quatre écrans plus tôt.
- **[notable]** Desktop : bloc gauche terminé à y≈600, colonne droite à y≈590, sur 900px — même vide que toute la famille.
- **[finition]** « Paiement accepté » sans aucune trace d'un état refusé, en attente d'authentification 3-D Secure, ou contesté, alors que le lien de signalement suppose l'existence d'un tel parcours.

## 25 Succes Retrait Carte — 3/10

*Ce qui tient :* L'arithmétique se referme : 916 202 (solde carte à l'écran 24, 14:32) − 100 000 = 816 202 à 15:48, et 1 746 552 + 100 000 = 1 846 552 côté portefeuille. Cinq écrans partagent un grand livre cohérent.

- **[notable]** Écran quasi identique à 22 et 23 : même tuile verte, même titre court, même montant, même « Récapitulatif » de 7 lignes, même bouton, même lien. Sur mobile, la seule différence perceptible entre 22 et 25 est le glyphe de la tuile et deux libellés.
- **[notable]** « Fonds rapatriés » avec la même tuile verte que le dépôt et le retrait — troisième réemploi du même composant de succès dans la même famille.
- **[notable]** Mobile : contenu terminé à y≈1310 sur 1560, soit ~250px de vide. Desktop : y≈600 sur 900.
- **[finition]** « Frais Gratuit » sur un rapatriement carte → portefeuille alors que le retrait de l'écran 22 facture 1 %. La grille tarifaire n'est pas motivée : gratuité affirmée trois fois sur six écrans sans règle lisible.

## 26 Support — 3/10

*Ce qui tient :* Les trois canaux portent des icônes nues, pas des tuiles colorées, et chacun expose sa promesse de service (« réponse en moins de 5 minutes », « disponible 24h/24 ») avec une pastille verte de disponibilité live sur le chat seul.

- **[notable]** Le numéro WhatsApp est « +221 7X XXX XX XX » : un masque de gabarit laissé dans une interface présentée comme finie. C'est de la donnée fabriquée visible à l'œil nu.
- **[notable]** La ligne WhatsApp est la seule des trois sans chevron droit. Elle se lit comme non cliquable alors qu'elle est dans la même carte que deux lignes qui le sont.
- **[notable]** Les cinq questions de la FAQ sont toutes repliées, tous les chevrons identiques vers le bas, aucun état ouvert, aucune recherche, aucune catégorie. L'écran ne montre jamais à quoi ressemble une réponse.
- **[notable]** Desktop : la colonne « Nous contacter » s'arrête à y≈330 et la FAQ à y≈390, sur 900px de hauteur — les deux tiers inférieurs de la page sont vides, et les deux colonnes se terminent à des hauteurs différentes sans raison.
- **[finition]** Barre de navigation basse mobile sans aucun onglet actif : les quatre libellés sont au même gris. L'utilisateur ne sait plus d'où il vient.
- **[finition]** Bloc contact tout-en-carte (une carte unique à trois lignes séparées par des filets) juxtaposé à une FAQ sans carte du tout. Deux traitements de liste opposés sur le même écran, sans hiérarchie qui le justifie.

## 27 Chat Support — 5/10

*Ce qui tient :* L'avertissement « FixPay ne vous demandera jamais votre code PIN ni le cryptogramme » et, sur desktop, les horaires « conseillers du lundi au dimanche, 8h – 22h ». Le bouton d'envoi est correctement rendu à l'état désactivé tant que le champ est vide.

- **[bloquant]** Vide vertical massif sur mobile : de y≈200 à y≈820, soit ~620px sur 1560 (40 % de l'écran) totalement noirs entre l'en-tête et le premier contenu. C'est le défaut de composition le plus voyant du lot, et cet écran était précisément l'objet de la passe.
- **[bloquant]** Desktop pire encore : la colonne de conversation fait ~1000px de large sur 900px de haut et ne contient qu'une bulle collée en bas ; tout le centre est vide, et le rail droit s'arrête à y≈390. Environ 60 % de la surface utile est inoccupée.
- **[bloquant]** La conversation contient un seul message, celui du bot, sans aucune réponse utilisateur ni échange. Un mock de studio montre un fil réel (« mon retrait du 14 avr. n'est pas arrivé » → référence FP-1404-9032 → réponse d'un conseiller nommé). Ici la donnée n'est pas observée, elle est absente.
- **[notable]** L'en-tête dit « Assistant FixPay » et une puce propose « Parler à un conseiller », mais rien ne distingue visuellement le bot de l'humain : pas d'avatar conseiller, pas de nom, pas de statut de file d'attente, pas d'accusé de lecture, pas d'indicateur de frappe.
- **[notable]** Sur mobile les quatre puces de sujets sont posées en vrac sous la bulle, sur desktop elles sont dans un rail droit intitulé « Sujets fréquents » séparé par un filet. Le même contenu n'a pas le même statut informationnel selon la largeur — sur mobile il ressemble à des réponses rapides, sur desktop à une navigation.
- **[finition]** Le bouton d'envoi désactivé en thème clair est un lavande pâle qui reste très proche du bleu primaire actif : l'état désactivé se lit mal.

## 28 Notifications — 2/10

*Ce qui tient :* La distinction lu/non-lu est portée par trois signaux cumulés (pastille bleue, icône saturée, titre plus gras) plutôt que par un fond de carte ; icônes nues sans tuile devant chaque ligne ; sections « Nouvelles / Précédentes » avec compteurs ; montants alignés à droite et signés. C'est la liste la plus proche d'un vrai produit du lot.

- **[notable]** Le flux contredit le grand livre des écrans 21-25. Ici « Dépôt reçu + 100 000 FCFA · Hier 09:16 » et « Retrait envoyé − 50 000 · 8 avr. », alors que l'écran 21 documente un dépôt de + 50 000 le 14 avr. à 16:20 et l'écran 22 un retrait de − 30 000 le 14 avr. à 16:05 — aucun des deux n'apparaît dans la liste. La cohérence de données remarquable ailleurs se rompt exactement là où le flux d'événements devrait être la même source.
- **[notable]** « Vérification requise · Pièce d'identité à fournir pour continuer » est la seule notification actionnable et la seule sans affordance : pas de bouton, pas de chevron, pas de couleur d'alerte, alignée comme une ligne d'historique passif. Un blocage KYC ne se présente pas comme un reçu.
- **[notable]** Mobile : un filet horizontal subsiste sous « Compte créé » sans rien après lui, et l'entrée « Gérer mes alertes » présente sur desktop est absente. Filet orphelin + action perdue sur la plateforme principale.
- **[finition]** Aucun filtre, aucun onglet (tout / transactions / sécurité), aucun « tout marquer comme lu » sur mobile alors que le compteur « 3 non lues » est affiché — le compteur promet une action qui n'existe pas.
- **[finition]** Navigation basse sans onglet actif, comme sur l'écran 26.
- **[finition]** Un blocage KYC coexistant avec 1,8 M FCFA de solde et des paiements carte acceptés : la situation est possible (paliers de plafond) mais rien ne l'explique, et le rapprochement des deux informations sur le même écran laisse un doute sur la véracité du scénario.

