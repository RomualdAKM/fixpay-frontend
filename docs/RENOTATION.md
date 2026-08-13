# Re-notation après refonte — défauts restants et régressions

Moyenne : 7,6/10 avant → 3,5/10 après. Ce document liste ce qui RESTE à corriger.

## 01 Onboarding — 9/10 → **3/10**

### Défauts restants

- **[notable]** Le numéro de carte garde un tracking énorme : les groupes de points se lisent « • • • •  • • • •  • • • • » avec un écart intra-groupe presque égal à l'écart inter-groupe, et « 4291 » est espacé en « 4 2 9 1 » — il ne se lit plus comme un groupe. L'audit demandait tracking 2px avec espaces réels ; rien n'a bougé.
- **[notable]** Toujours aucune date d'expiration sur la carte (EXP 12/28 demandé). Avec la marque réseau retirée, la face mobile ne porte plus que puce + points + « JEAN DUPONT » : ~65px de hauteur vide entre la puce et le numéro. Une face de carte à 70% vide.
- **[finition]** Porteur toujours « JEAN DUPONT », placeholder de démonstration inchangé.
- **[finition]** Aucun sélecteur pays/langue, et les opérateurs sont cités en texte courant sans bandeau de logos — la preuve sociale locale demandée n'est pas dessinée.
- **[finition]** La puce conserve un dégradé vertical et une découpe rectangulaire à angles vifs ; le token --c-gold #c9a227 mat existe mais n'est pas appliqué à plat.

### Régressions introduites par la refonte

Trois régressions constatées. (1) Le débord de la carte a été appliqué sans recomposer la face : sur mobile la coupe ampute la marque FixPay (haut droit) ET le logotype VISA (bas droit) — les deux sont bien présents sur la capture desktop du même écran. Résultat, le même objet a deux contenus selon le viewport, et la carte mobile n'a plus aucune marque alors que l'app l'appelle « VISA •••• 4291 » sur les écrans 02 et 03. En prime, le dernier groupe « 4291 » se termine à 15px du bord d'écran : cela lit comme un clipping accidentel, pas comme un parti pris de bleed. (2) La ligne légale ajoutée est en bleu-gris très sombre sur #070c1a (contraste estimé ~3:1, sous le seuil AA pour du 11px), et ses deux liens sont composés en blanc cassé sans soulignement — alors que tous les autres liens de l'app (« Se connecter » juste au-dessus, « Tout voir », « Détails ») sont en bleu : deux langages de lien contradictoires à 40px d'écart. (3) Le fond dégradé supprimé était ce qui masquait le vide : maintenant que l'aplat est nu, on voit une zone morte de ~150px à gauche de la carte sur ~250px de haut, et une bande morte de ~65px entre la fin du paragraphe et le CTA. La suppression était juste, mais le rythme vertical n'a pas été redérivé — l'écran a des trous.

## 02 Accueil — 8/10 → **3/10**

### Défauts restants

- **[bloquant]** Le solde du hero s'affiche « 1866 252 FCFA » : la première espace fine insécable est rendue à largeur nulle, le montant se lit donc en groupes 4+3. C'est le chiffre le plus important du produit et il est mal groupé. Défaut préexistant (visible sur la capture d'avant) que le premier audit avait manqué en louant justement le traitement de l'U+202F.
- **[notable]** « SOLDE DISPONIBLE » reste en capitales avec interlettrage dans le hero, alors que tous les autres labels de l'écran sont passés en casse normale. Deux systèmes de label coexistent sur la même page.
- **[notable]** « FCFA » est composé à la même taille et au même gras que les chiffres (40px bold) : le suffixe fait masse avec le nombre et aggrave la confusion de groupement. L'audit demandait 14px regular à 0.6 d'opacité sur la baseline.
- **[notable]** Les deux actions du hero restent strictement 50/50 et « Retrait » est rendu plus clair que « Dépôt » : le secondaire lit plus fort que le primaire. Aucune hiérarchie, et divergence avec l'écran 03 où le même composant a désormais un primaire blanc pleine masse.
- **[notable]** Aucun groupement par jour avec net quotidien, aucune barre de filtres, aucun état vide/chargement/erreur — les prescriptions produit de l'audit n'ont pas été traitées.
- **[finition]** Le filigrane FixPay dans le hero duplique le logo situé 30px au-dessus dans l'en-tête. Le label redondant a été supprimé, mais le doublon graphique est resté et il est plus saillant qu'avant.
- **[finition]** Deux boutons œil sur l'écran, de tailles et de traitements différents (translucide 28px dans le hero, carré sombre 30px sur la ligne carte).

### Régressions introduites par la refonte

Quatre régressions constatées. (1) Le bord gauche de la liste est devenu irrégulier : Amazon, Spotify et Booking.com commencent à 24px, « Wave — Dépôt » à 64px. La gouttière d'icônes a été supprimée sans être réservée, donc trois rangées sur quatre sont désalignées avec la quatrième. C'est le défaut le plus visible de l'écran principal, et il n'existait pas avant (toutes les rangées portaient une tuile, le bord gauche était unifié). (2) Information perdue : le statut « Carte virtuelle · Actif » a disparu de l'écran d'accueil, et le solde de la carte est passé d'un affichage 20px sous label à un sous-titre 13px atténué — il est désormais plus petit que n'importe quel montant de transaction, alors que c'est un solde. Hiérarchie inversée. (3) Le vide desktop s'est aggravé, pas résorbé : la colonne gauche s'arrêtait à ~57% de la hauteur du viewport avant, elle s'arrête à ~42% maintenant (58% de noir sous le contenu). Les ~150px libérés par la suppression du panneau et des trois boutons n'ont été réinvestis nulle part. (4) Doublon de contrôle introduit par le travail de theming : la sidebar desktop porte désormais un bouton de bascule de thème (absent de la capture d'avant, vérifié) alors que l'en-tête en garde un — deux soleils identiques visibles simultanément à 1070px d'écart.

## 03 Portefeuille — 8/10 → **4/10**

### Défauts restants

- **[bloquant]** Le solde du hero affiche « 1866 252 FCFA » : première espace de milliers à largeur nulle. Voir régression ci-dessous — ici c'est un défaut neuf.
- **[notable]** Sur mobile, seuls 2 mouvements complets sont visibles et le 3e est coupé par la nav — exactement l'état reproché par l'audit. Les ~75px récupérés sur le hero ont été absorbés par la bande de statistiques au lieu d'aller au contenu.
- **[notable]** « SOLDE DISPONIBLE » reste en capitales interlettrées, en contradiction avec tous les titres passés en casse normale sur le même écran.
- **[notable]** Aucune chip de filtre, aucun sélecteur de période, aucun compte Mobile Money lié affiché en rangée, aucun état vide ni squelette de chargement. Le gros de la prescription [L] reste non traité.
- **[finition]** Trois affordances redondantes pour un seul bloc carte : le lien « Détails » en en-tête, le chevron « > » en bout de rangée et le bouton « Alimenter » — dont deux mènent au même endroit.
- **[finition]** Deux morphologies de bouton coexistent : les actions du hero sont des pilules à rayon plein, « Alimenter » est un rectangle à ~12px. L'échelle de rayons a été réduite mais pas unifiée sur les contrôles.
- **[finition]** Le chevron de la rangée VISA s'arrête ~5px avant la marge droite alors que « Détails », « Alimenter » et « Tout voir » s'alignent sur 24px : la colonne d'actions droite est légèrement ébréchée.

### Régressions introduites par la refonte

Trois régressions constatées. (1) Le montant du hero est passé de « 1 866 252.50 » correctement espacé (capture d'avant, 32px) à « 1866 252 » (40px) : la suppression des décimales a été faite mais l'agrandissement et l'interlettrage négatif du display ont écrasé la première espace fine insécable. Le correctif a donc importé sur cet écran un défaut qui n'y était pas. (2) La bande « Dépôt en attente 50 000 FCFA · Plafond restant ce mois 2 000 000 FCFA » a été ajoutée pour répondre au reproche de densité, mais elle affiche des chiffres qui ne se raccordent à rien : aucun dépôt en attente n'apparaît dans la liste des mouvements, aucune action n'est possible dessus, et le plafond n'a ni montant consommé ni sélecteur de période. C'est précisément la signature « données plausibles mais non reliées » que l'audit reprochait ailleurs — on l'a réintroduite ici. (3) Cette même bande écrase la hiérarchie : « Plafond restant ce mois / 2 000 000 FCFA » est composé en 17px blanc, soit plus gros et plus contrasté que « Solde : 816 202 FCFA » (13px atténué) juste dessous. Une limite théorique passe devant un solde réel. S'ajoutent, communs à l'Accueil, le doublon de bouton de thème sidebar+en-tête sur desktop et une colonne gauche qui s'arrête à 52% de la hauteur du viewport.

## 04 Depot Portefeuille — 6/10 → **4/10**

### Défauts restants

- **[notable]** Les 6 pays restent 6 cartes flottantes autonomes (rayon, bordure, fond, gap 9px chacune) — le marqueur [F] n'a pas été touché. Douze bordures dessinées pour une seule liste ; ce n'est toujours pas une liste, c'est un empilement de conteneurs identiques.
- **[notable]** Densité inchangée sur le fond : un mot par ligne de ~60px, aucun indicatif, aucun opérateur, aucun champ de recherche, aucune section « Récemment utilisé ». La bande de frais a comblé du vide, elle n'a pas densifié la liste.
- **[finition]** Troisième colonne de la bande : « 2 000 000 FCFA » passe à la ligne et orpheline « FCFA » sur une seconde ligne, cassant l'alignement des trois valeurs (col. 1 et 2 sur une ligne, col. 3 sur deux). Les filets verticaux s'étirent alors sur la hauteur de la plus haute colonne et les deux premières paraissent vides.
- **[finition]** Les trois colonnes n'ont pas la même largeur (filets posés au fil du contenu, pas sur une grille) — le bloc le plus « designé » de l'écran est le seul non aligné.
- **[finition]** Desktop : ~450px de vide sous la grille de pays, plus ~320px de marge morte entre la sidebar et la colonne de contenu. Le reproche [L] desktop est intact.
- **[finition]** Le cercle radio vide est très faible en valeur sur le fond de ligne : l'affordance de sélection est presque muette au premier coup d'œil.

### Régressions introduites par la refonte

Deux, mineures mais réelles. (1) La bande Frais/Délai/Plafond casse son propre alignement dès qu'une valeur passe à la ligne (« 2 000 000 / FCFA ») — le bloc introduit par la refonte est le seul défaut de composition neuf de l'écran. (2) Plausibilité : « Frais Gratuit · Délai Sous 2 min · Plafond restant 2 000 000 FCFA » est affirmé à l'étape 1 sur 4, avant tout choix de pays et d'opérateur — or les frais Mobile Money dépendent précisément de ces deux-là. On a remplacé « aucune donnée » par « une donnée qui ne peut pas encore exister » : c'est un progrès visuel, pas encore un progrès de vérité produit.

## 05 Retrait Portefeuille — 6/10 → **4/10**

### Défauts restants

- **[notable]** Sous le header, la structure reste celle de 04 : mêmes 6 cartes flottantes, mêmes hauteurs, même gap. La différenciation tient à deux blocs ajoutés en tête, pas à une conception propre du retrait (pas de plafond quotidien détaillé, pas de dernier retrait, pas de « Où trouver mon numéro ? »).
- **[notable]** Marqueur [F] non traité : 6 conteneurs arrondis bordés au lieu d'une liste unique à hairlines internes.
- **[notable]** Aucun champ de recherche, aucun indicatif, aucun opérateur par ligne — la densité réclamée n'est pas venue.
- **[finition]** Desktop : la grille 2 colonnes s'arrête à y≈550 sur 900, ~350px de vide, plus la marge morte à gauche de la colonne.

### Régressions introduites par la refonte

Oui, deux. (1) La bande de frais se désaligne : « 1 % (min. 100 FCFA) » passe sur deux lignes tandis que « Sous 5 min » et « 500 000 FCFA » restent sur une — les trois valeurs ne partagent plus de ligne de base, et le filet vertical de gauche descend plus bas que celui de droite. (2) Le contenu ajouté (BalanceCard + bande) a poussé la liste : dans le premier viewport mobile, la 6e ligne est tranchée à mi-hauteur par la BottomNav translucide, avec un bout de cercle radio qui dépasse. Avant la refonte la liste tenait entière. Rien n'indique le défilement : on a acheté de la densité en payant un item guillotiné.

## 06 Alimenter Carte — 7/10 → **5/10**

### Défauts restants

- **[notable]** Toujours pas de « solde portefeuille après opération », qui était la moitié de la demande [N].
- **[finition]** Le champ montant reste centré, sans affixe FCFA dans le champ, avec un « 0 » de placeholder en indigo sourd (~4,2:1) qui se lit comme une valeur saisie plutôt que comme un gabarit vide.
- **[finition]** Desktop : colonne de 480px sur 1440, ~200px de vide sous le CTA et deux marges mortes. Le reproche [L] desktop est à peine entamé.
- **[finition]** Les deux lignes de carte affichent « Solde actuel : … » alors que la BalanceCard juste au-dessus donne déjà le portefeuille — la redondance de solde reprochée sur 07 s'est déplacée ici.

### Régressions introduites par la refonte

Oui, et c'est la plus sérieuse du lot. (1) Mobile : la barre d'action épinglée tranche la ligne « Mastercard •••• 7834 » en plein milieu des lettres, dans le premier viewport. On a corrigé un CTA rogné en rognant, exactement au même y, la deuxième carte de destination — c'est-à-dire l'objet même de l'écran. Aucun indice de défilement, et un utilisateur pressé ne saura pas qu'une seconde carte existe. (2) Desktop : à partir de lg la barre perd son padding (lg:py-0) et redevient statique sans qu'aucune marge ne prenne le relais — le bord supérieur du bouton « Alimenter la carte » vient se poser à ~3px sous « Gratuit / Instantané / 190 000 FCFA » et coupe net les filets verticaux de la bande. La seule information vraiment nouvelle de l'écran est illisible sur desktop et invisible sur mobile : elle existe dans le DOM, pas à l'écran. (3) L'InfoBanner de 3 lignes est promu tout en haut, avant le solde : le bloc le moins important occupe la position la plus forte et pousse tout le reste sous la ligne de flottaison.

## 07 Retrait Carte — 8/10 → **3/10**

### Défauts restants

- **[notable]** Ni plafond restant, ni « Solde carte après : … » après saisie, ni « Derniers retraits de cette carte ». La demande de densité utile [L] n'est satisfaite qu'à moitié.
- **[finition]** La bande Frais/Délai n'a que 2 colonnes avec un filet posé pile au milieu : la seconde colonne démarre à 55 % de la largeur et laisse un large blanc à droite. Et elle est structurellement différente de la bande à 3 colonnes de 04/05 — le même composant se compose différemment selon l'écran, ce qui était précisément un reproche de l'audit initial.
- **[finition]** Champ montant toujours centré, sans affixe FCFA dans le champ, placeholder « 0 » en indigo sourd.
- **[finition]** Desktop : colonne étroite, ~280px de vide sous le CTA et large marge morte à gauche.

### Régressions introduites par la refonte

Une seule, mais partagée avec 06 et bien visible : sur desktop, la barre d'action redevient statique sans padding et le bord supérieur de « Confirmer le retrait » vient toucher la ligne de base de « Gratuit » et « Instantané », en coupant le filet vertical qui les sépare. Le bouton a l'air posé sur le texte. C'est le seul défaut de composition neuf d'un écran qui, par ailleurs, a été traité comme il fallait — c'est celui du lot où la correction a été réellement conduite jusqu'au bout.

## 08 Paiement — 8/10 → **5/10**

### Défauts restants

- **[notable]** Le tracking -2px sur « FCFA » en 16px n'a PAS été corrigé — vérifié dans AmountDisplay.tsx, la devise est toujours rendue en `font-bold tracking-[-2px]`. Sur la capture, les quatre capitales se touchent, forment un pâté compact collé au « 0 », et la devise avance au lieu de reculer. Le marqueur [J] est intact, mot pour mot.
- **[notable]** La touche décimale « . » est toujours sur le pavé — vérifié dans Numpad.tsx, KEYS contient encore ".". Sur une monnaie sans subdivision, et rendue comme un point quasi invisible seul dans sa cellule en bas à gauche. Le raccourci « 000 » réclamé n'existe pas.
- **[finition]** Le bénéficiaire est illustré par un glyphe lucide « boutique » générique dans une tuile grise de 38px — la tuile d'icône générique que l'audit condamnait partout ailleurs, réintroduite sur un bloc entièrement neuf.
- **[notable]** Aucun frais, aucun plafond sur un écran de paiement, alors que 06 et 07 en ont désormais une bande. Trois écrans frères, deux niveaux d'information.
- **[finition]** Desktop : le pavé numérique est toujours affiché sur 1440 alors que le clavier physique existe, et la colonne reste étroite avec deux marges mortes.
- **[finition]** « Minimum 500 FCFA » à ~4,4:1 sur le fond — sous le seuil AA pour du texte courant.

### Régressions introduites par la refonte

Oui, trois. (1) Le moyen de paiement a quitté le premier viewport : « Payer avec » est désormais rendu APRÈS le pavé numérique et le champ Motif, donc sur 390×780 on peut atteindre « Payer maintenant » sans jamais voir quelle carte sera débitée. Avant la refonte le sélecteur était visible à y≈310-465. L'audit demandait « une ligne compacte repliable », pas un renvoi sous la ligne de flottaison — on a réglé le CTA hors écran en mettant hors écran l'information de débit. (2) Desktop 1440×900 : le contenu se termine par la ligne Mastercard à y≈875, le CTA est donc désormais SOUS le pli — le défaut que l'audit jugeait rédhibitoire a simplement migré du mobile vers le desktop. Et 08 n'utilise pas la barre épinglée que 06 et 07 utilisent : trois écrans frères, deux comportements de CTA. (3) Le bloc bénéficiaire, ajout salutaire, réintroduit une tuile d'icône générique. Le fond a beaucoup progressé ; deux des marqueurs les plus littéraux de l'écran n'ont pas été ouverts du tout.

## 09 Creer Carte — 7/10 → **4/10**

### Défauts restants

- **[bloquant]** La différenciation des deux offres reste factice : prix identique (3 000 / 3 000) et ligne de spécifications identique mot pour mot (« Plafond 500 000 FCFA/mois · 0 frais par paiement · Activation immédiate »). Le reproche [N] de l'audit — deux slots symétriques remplis à l'identique — n'est traité qu'en surface, par un sous-titre et un tag.
- **[notable]** La ligne de specs est en bleu-gris pâle sur le fond bleuté de l'option sélectionnée : contraste manifestement sous le seuil pour un texte porteur de chiffres contractuels (plafond, frais).
- **[finition]** La ligne de specs casse en deux avec « Activation immédiate » orphelin sur la seconde ligne, sur les DEUX options — rythme vertical bancal.
- **[finition]** Le RadioCheck fait toujours ~40px et flotte seul à droite ; l'audit demandait un check 16px porté par la bordure. Le trou horizontal au milieu de la rangée est réduit mais pas comblé.
- **[finition]** Titre du produit et prix sont tous deux en 19px bold sur la même ligne : le prix pèse autant que le nom, aucune hiérarchie entre les deux.

### Régressions introduites par la refonte

Deux régressions nettes. (1) Troncature du nom de produit : « Mastercard … » sur mobile, « Visa Vir… » et « Master… » sur desktop — le libellé de l'objet qu'on achète est illisible, causé par la mise titre+prix sur une seule ligne. Les sous-titres sont tronqués de la même façon (« Le réseau le plus accepté en lig… »). Aucun studio ne livre un écran d'achat où le nom du produit est coupé. (2) Desktop : la barre récap n'est plus épinglée mais insérée dans le flux, elle vient coller à ~4px sous le helper text « Tel qu'il apparaîtra sur la face de la carte » (collision visuelle), le montant « 3 000 FCFA » est aligné à droite d'une colonne de 640px pendant que le CTA « Continuer » reste un bouton de 150px aligné à gauche — récap et CTA ne partagent plus aucun axe. Le bas de page desktop est vide à ~45%.

## 10 Detail Carte — 8/10 → **4/10**

### Défauts restants

- **[bloquant]** La puce dorée est TOUJOURS là, et elle est même plus voyante qu'avant : un rectangle or plein avec une croix gravée, en haut-gauche d'une carte virtuelle. L'audit demandait explicitement sa suppression ([M]). C'est le placeholder de mockup le plus identifiable de l'écran.
- **[bloquant]** Les transactions restent intégralement en EUR sans conversion par ligne (− €59.99, − €9.99, − €340.00). L'audit demandait le double affichage EUR principal / FCFA secondaire ; on n'a obtenu qu'une ligne d'en-tête de taux. L'utilisateur doit encore faire le calcul de tête.
- **[notable]** Le tracking du numéro n'est pas corrigé sur mobile : la capture lit « • • • •  • • • •  • • • •  4 2 9 1 » — les chiffres eux-mêmes sont espacés au point de perdre le groupement. Sur desktop les mêmes chiffres sont groupés (« 4291 ») : les deux breakpoints ne racontent pas la même chose.
- **[notable]** La face de carte desktop est toujours en 482×192, soit un ratio de 2,5:1 au lieu de 1,586:1, avec un vide central de ~250px entre la puce et le bloc numéro. Le reproche [K] est intact.
- **[notable]** Desktop : la colonne gauche s'arrête à 70% de la hauteur, la droite à 52% — près de la moitié de la page est vide.

### Régressions introduites par la refonte

Trois régressions. (1) Incohérence de données introduite par la correction elle-même : « Solde disponible 816 202 FCFA » cohabite avec « plafond 500 000 FCFA/mois · 190 000 FCFA restants ce mois ». On ne peut pas avoir 816 202 disponibles sur une carte qui ne peut plus dépenser que 190 000. C'est précisément le type de contradiction interne que l'audit traquait comme signature de génération — la refonte en a créé une neuve. (2) Redondance nouvelle : la ligne « Visa •••• 4291 » en font-mono est posée juste sous une carte qui affiche déjà « •••• 4291 » 60px plus haut ; on a supprimé la grille redondante pour réintroduire la même redondance en dessous. (3) « EXP: 12/28 » est passé de la grille (lisible, sur fond sombre) à un 10px blanc à faible opacité posé sur le dégradé bleu de la carte — l'information la plus consultée après le numéro est devenue la moins lisible de l'écran. Enfin, sur mobile les deux CTA de 88px empilés poussent toute la liste des transactions sous le fold : le premier écran ne montre plus une seule transaction, contre une auparavant.

## 11 Statistiques — 9/10 → **5/10**

### Défauts restants

- **[bloquant]** Un écran nommé « Statistiques » ne contient toujours AUCUN graphique : ni histogramme, ni courbe, ni série temporelle, ni comparatif mois/mois. Le reproche décisif [N] de l'audit — « un écran de statistiques sans axe du temps n'a pas été conçu par quelqu'un qui a réfléchi à l'usage » — est intact. Des barres de répartition ne sont pas une dataviz temporelle.
- **[bloquant]** Aucun sélecteur de période. La plage est un texte figé « Du 1er au 14 avril 2026 » ; on ne peut ni changer de mois, ni passer en semaine/année. La reco du sélecteur segmenté n'a pas été appliquée.
- **[notable]** Les trois catégories partagent la même barre bleue : la couleur n'encode toujours aucune information, l'audit demandait une teinte par catégorie. Seul le dégradé a été retiré.
- **[notable]** La barre « Abonnements 2 % » se réduit à un point de 6px qui se lit comme un artefact de rendu plutôt que comme une donnée.
- **[notable]** Les montants de la liste sont intégralement en rouge saturé (« − 39 341 FCFA », « − 223 026 FCFA ») : la reco « ne jamais colorer une valeur entière, colorer la variation » a été appliquée aux KPI mais pas à la liste — le marqueur a été déplacé, pas supprimé.
- **[finition]** Les labels de la bande de stats restent en petites majuscules espacées bleu-gris (« RECHARGES (AVR.) », « SOLDE CARTE », « PORTEFEUILLE »), alors que la migration annonçait la suppression du motif uppercase + tracking partout.
- **[notable]** Desktop : le contenu s'arrête à 68% de la hauteur, la colonne droite à 40%. Le reproche d'occupation desktop (47% de vide) n'a pas bougé.

### Régressions introduites par la refonte

Deux incohérences neuves. (1) Deux périodes contradictoires pour un même nombre : le sous-titre annonce « Du 1er au 14 avril 2026 » mais le KPI est libellé « Dépenses (avr.) » et le panneau « Total de la période » affiche la même valeur 268 921 FCFA — soit c'est le mois d'avril, soit c'est la quinzaine, ce ne peut pas être les deux. (2) Divergence inter-écrans : Amazon / Spotify / Booking.com sont affichés ici en FCFA (− 39 341 / − 6 554 / − 223 026) et sur l'écran 10 en EUR (− €59.99 / − €9.99 / − €340.00). Les conversions sont justes au taux affiché, mais deux écrans frères présentent la même transaction dans deux devises — l'unification de devise a été faite écran par écran, pas produit.

## 12 KYC — 8/10 → **3/10**

### Défauts restants

- **[notable]** Le trait de liaison du stepper ne relie plus rien : il est désormais confiné à l'intérieur de chaque ligne (`w-px flex-1` dans la colonne de 26px) et s'interrompt au padding + au divider. Sur les deux captures on voit deux moignons verticaux orphelins sous la pastille verte et sous la « 2 », qui s'arrêtent à ~80px du repère suivant. Un connecteur qui ne connecte pas est plus fautif que l'ancien mal placé.
- **[notable]** « Votre dossier » (SectionLabel 13px/w500/text-secondary) est typographiquement identique au méta-texte « 1 étape sur 3 validée » qui lui fait face, et moins présent que les titres d'étape en 15px blanc. L'en-tête de section ne hiérarchise plus rien.
- **[finition]** Le bandeau hero porte toujours le dégradé 135° partagé avec la carte bancaire et l'écran 17 — le même vêtement pour trois objets de nature différente subsiste, même si le décor a été retiré.
- **[finition]** Desktop : le paragraphe légal et le CTA sont collés (StickyActionBar repasse en statique avec `lg:py-0` et sans marge haute). ~20px séparent la mention réglementaire du bouton pleine largeur de 640px.
- **[finition]** Mobile : le premier viewport se termine sur l'InfoBanner coupée en plein milieu d'une phrase, sans dégradé ni affordance de défilement au-dessus de la barre opaque.

### Régressions introduites par la refonte

Le trait de liaison du stepper a été cassé en le rentrant dans la colonne d'indicateurs : il est maintenant interrompu par le padding de ligne et par le divider, et se lit comme deux tirets flottants. La correction a résolu le reproche de placement en détruisant la fonction. Second point : la refonte de SectionLabel prive « Votre dossier » de tout poids d'en-tête.

## 13 KYC Document — 6/10 → **3/10**

### Défauts restants

- **[notable]** L'état désactivé du CTA est obtenu par `opacity-45` sur un wrapper — exactement le raccourci que l'audit condamnait sur l'étape verrouillée de l'écran 12, corrigé là-bas et réintroduit ici. Résultat visible sur les deux captures : « Soumettre le document » en gris sur bleu sourd, sous tout seuil de contraste utilisable.
- **[finition]** L'état rempli n'affiche ni vignette du document ni progression d'envoi ; c'est du texte (nom + poids). L'audit demandait la vignette réelle, seul retour qui prouve à l'utilisateur qu'il a photographié la bonne face.
- **[notable]** Le paragraphe d'intro (13px text-secondary) et les libellés de section « Type de document » / « Photos du document » / « Conditions » sont rigoureusement du même style : sur la capture desktop rien ne distingue une phrase d'introduction d'un en-tête de section.
- **[finition]** Desktop : la phrase « Importez le recto et le verso pour pouvoir soumettre. » est plaquée à 8px du bouton, sans respiration.
- **[finition]** Les zones d'import de 118px sont très vides en desktop (~320px de large pour un glyphe de 24px et deux lignes de 11,5px).

### Régressions introduites par la refonte

L'opacité globale comme état désactivé revient sur le CTA — le motif que l'audit a fait supprimer sur l'écran 12 réapparaît sur l'écran voisin, avec un texte devenu quasi illisible. Le système n'a donc pas arbitré la question, il l'a déplacée.

## 14 Notifs Settings — 6/10 → **3/10**

### Défauts restants

- **[notable]** Hiérarchie inversée : les en-têtes de section (« Alertes de transaction », « Canaux de réception ») sont en 13px w500 text-secondary, donc MOINS présents que les titres de ligne en 14px blanc, et quasi identiques au texte d'aide en 12,5px muted juste en dessous. Sur la capture desktop, « Canaux de réception » et sa phrase d'aide forment un bloc gris indifférencié : l'écran a gagné de la structure et perdu ses repères de structure.
- **[notable]** La ligne « Seuil d'alerte » garde la hauteur fixe h-[69px] alors que son sous-titre passe à deux lignes en mobile : le texte déborde la boîte de ligne et vient buter sous la valeur « ≥ 1 000 FCFA », dont la ligne de base ne s'aligne ni sur le titre ni sur le sous-titre.
- **[finition]** Cinq interrupteurs bleus identiques empilés, tous ON : la colonne de droite est une répétition parfaite, aucun rythme, aucune variation — le reproche [K] sur la régularité vertical n'a pas bougé.
- **[finition]** Le toggle est toujours l'interrupteur iOS par défaut (piste pilulaire, pastille blanche, ON = bleu de marque) ; le marqueur [B] n'a pas été traité.
- **[finition]** Les dividers restent pleine largeur et uniformes à l'intérieur des groupes ; l'indentation au niveau du texte suggérée par l'audit n'a pas été appliquée.

### Régressions introduites par la refonte

La réécriture de SectionLabel (10px capitales espacées → 13px casse de phrase text-secondary) a supprimé le tic typographique mais n'a rien mis à la place : un en-tête de section est aujourd'hui moins visible qu'un titre de ligne. L'écran, désormais long et scrollable, n'a plus de points d'ancrage — problème inexistant quand il ne contenait que trois lignes.

## 15 Confidentialite — 6/10 → **3/10**

### Défauts restants

- **[notable]** Collision mobile : sur la ligne « Statistiques d'usage », le sous-titre allongé arrive à ~3px de l'interrupteur puis passe à la ligne, et la deuxième ligne (« 5 avr. ») déborde la hauteur fixe de 69px, ce qui écrase le divider suivant. Cause vérifiée dans le composant : SettingsToggleRow n'a ni `gap`, ni `min-w-0` sur le bloc texte, ni `shrink-0` sur le toggle — il a été écrit pour des sous-titres d'une ligne et la refonte a rallongé les copies sans l'adapter.
- **[notable]** Même effondrement de hiérarchie qu'en 14 : « Affichage », « Consentements », « Appareils connectés » sont au même niveau typographique que leurs phrases d'aide, et en dessous des titres de ligne. Sur un écran devenu long, on ne repère plus les sections en balayage.
- **[notable]** « Fermer mon compte » est une ligne de navigation neutre avec chevron vers /support, strictement identique à « Exporter mes données » : l'action la plus destructive de l'application n'a aucun traitement de danger, ni confirmation.
- **[finition]** « Déconnecter » (action irréversible sur une session) est un lien bleu de la même famille que « Demander » un export : un seul registre pour deux natures d'action.

### Régressions introduites par la refonte

Le remplissage des sous-titres a cassé la ligne de réglage en mobile : le texte vient toucher l'interrupteur et déborde la hauteur fixe. Le composant n'a pas été retouché alors que toutes les copies ont doublé de longueur — c'est la trace typique d'une refonte de contenu non répercutée dans le composant qui l'affiche.

## 16 Parametres — 7/10 → **3/10**

### Défauts restants

- **[notable]** Le chevron des trois selects est TOUJOURS en `text-primary-light` — le marqueur [I] (« chevron bleu sur un glyphe purement fonctionnel, répété trois fois ») n'a pas été corrigé, alors que tous les autres chevrons de l'écran sont passés en icon-muted. Visible sur les deux captures.
- **[bloquant]** Effondrement de hiérarchie maximal ici : SelectField appelle littéralement SectionLabel pour son libellé de champ. « Langue », « Devise d'affichage », « Thème » sont donc le MÊME objet typographique que « Préférences », « Compte », « Sécurité ». Sur la capture, rien ne dit que « Langue » est subordonné à « Préférences ».
- **[notable]** Deux motifs concurrents cohabitent pour la même nature de réglage : trois boîtes de formulaire de 48px pour les préférences, et des lignes tappables valeur-à-droite pour le reste. L'audit demandait précisément de basculer les trois selects sur le second motif.
- **[notable]** Trois lignes sont des affordances mortes : « Code PIN — Modifié le 12 mars », « Double authentification — Par SMS » et « Wave — +225 07 •• •• 41 » n'ont aucune destination (pas de href, pas de chevron, pas d'action). Un écran de sécurité qui affiche l'état du PIN sans permettre de le changer.
- **[finition]** Desktop : « 50 000 FCFA » se coupe en fin de ligne entre « 50 » et « 000 FCFA » dans la phrase d'aide de la section Sécurité — l'espace insécable fine appliquée par formatFcfa manque dans cette chaîne écrite en dur.

### Régressions introduites par la refonte

En unifiant SectionLabel, le studio a fusionné deux rôles distincts : en-tête de section et libellé de champ. L'écran Paramètres est celui qui en souffre le plus, puisqu'il empile les deux à 20px d'intervalle. Par ailleurs les nouvelles sections introduisent des lignes qui ressemblent à des lignes navigables mais ne mènent nulle part — une pauvreté déplacée, pas supprimée.

## 17 Parrainage — 8/10 → **2/10**

### Défauts restants

- **[notable]** Desktop : le paragraphe d'état vide et la barre d'action se touchent — la dernière ligne (« …La prime est créditée sous 48 h. ») est à ~10px du haut des boutons, sans aucune séparation. Cause vérifiée : StickyActionBar repasse en `lg:static` avec `lg:py-0` et aucune marge haute. Le bloc se lit comme un empilement accidentel.
- **[notable]** Le bouton WhatsApp (variante glass) a un libellé gris nettement plus éteint que le CTA voisin : côte à côte, il se lit comme désactivé alors qu'il est le canal de distribution prioritaire sur ce marché.
- **[finition]** Le hero porte toujours le dégradé 135° partagé avec la carte bancaire et l'écran 12.
- **[finition]** Desktop : la page s'arrête à ~570px de haut dans une fenêtre de 900px, soit 60% de vide sous le contenu ; la mise en page mobile a simplement été centrée.
- **[finition]** Deux liens bleus « Copier » et « Copier le lien » empilés à 50px d'intervalle, de poids identique, pour deux objets dont un seul est réellement partageable.

### Régressions introduites par la refonte

La barre d'action épinglée règle le problème mobile mais crée en desktop un télescopage : elle redevient un bloc du flux sans marge haute et vient se coller au dernier paragraphe. C'est le cas le plus visible du lot, et le défaut touche par construction tous les écrans qui utilisent ce composant.

## 18 Fidelite — 9/10 → **2/10**

### Défauts restants

- **[notable]** Contradiction produit non vue : le palier Argent — celui que l'utilisateur occupe — donne « Retraits Mobile Money sans frais », et le catalogue lui propose d'acheter 300 points « Frais de retrait offerts · Retraits Mobile Money sans commission pendant 30 jours ». On lui vend un avantage qu'il possède déjà. C'est exactement le type d'incohérence que l'audit traquait, simplement déplacé du vocabulaire vers la règle de gestion.
- **[notable]** « Réduction utilisée · −218 pts » dans l'historique ne correspond à aucun coût du catalogue (100 / 300 / 500). Le solde de démo a été calé arithmétiquement sans repasser par les règles affichées à l'écran juste au-dessus.
- **[finition]** Les deux boutons « Échanger » indisponibles sont éteints par `disabled:opacity-45` — même raccourci que sur l'écran 13, et le libellé descend sous le seuil de lisibilité.
- **[finition]** Desktop : « Expirent le / 31 déc. 2026 » est projeté seul à l'extrême droite d'un conteneur de 780px, à 600px du chiffre auquel il se rapporte ; le lien entre l'information et son objet est perdu.
- **[finition]** Sur mobile le même bloc est centré verticalement contre le groupe solde+équivalence : sa première ligne flotte au-dessus de la ligne d'équivalence sans s'aligner sur rien.

### Régressions introduites par la refonte

Rien de cassé sur le plan visuel : c'est la refonte la plus aboutie du lot. La seule dégradation est de nature produit — le catalogue de récompenses entre en contradiction avec les avantages du palier courant, et l'historique invente un débit de 218 points qu'aucune règle de l'écran ne permet.

## 19 Profil — 7/10 → **5/10**

### Défauts restants

- **[bloquant]** Le hero est TOUJOURS peint en gradient-card 135°, le même dégradé que la face de la carte bancaire et que les héros KYC/Parrainage/Fidélité/Support. Le reproche [C], marqueur central de l'écran, n'a pas bougé d'un pixel — et c'est même une entorse au plan du studio, qui réserve gradient-card à VirtualCard/WalletHeroCard/HeroGradientCard (constaté dans le code : le hero applique la classe en direct). L'objet identitaire du produit n'a toujours aucun statut visuel propre.
- **[notable]** Les six lignes de la liste « Compte » gardent chacune un carré d'icône identique : la colonne de vignettes répétées est assourdie mais pas supprimée, alors que la reco [G] demandait l'icône nue ou rien.
- **[notable]** Aucun bouton « Modifier » à côté du nom : la seule action sur l'identité reste absente.
- **[finition]** « Mes cartes » et « Compte » restent traitées avec exactement le même conteneur et la même densité ; seule la vignette différencie les deux blocs. La variation de densité réclamée en [F] n'est qu'à moitié faite.

### Régressions introduites par la refonte

Trois régressions. (1) Desktop : la grille 2 colonnes laisse la colonne gauche s'arrêter à 47% de la hauteur (rien sous la bannière KYC) pendant que la droite descend à 90% — le déséquilibre est frappant à l'œil, et « Se déconnecter » / « CGU · Confidentialité · v1.4.2 » sont centrés sur la seule colonne droite, donc visiblement décentrés par rapport à la page. Un pied de page qui n'est centré sur rien est un défaut d'alignement pur. (2) L'affordance de la bannière KYC est affaiblie : « Continuer » était une action identifiable, il est maintenant fondu dans le sous-titre gris (« Étape 2 sur 3 — Continuer ») et ne se distingue plus d'un libellé d'état. (3) L'avatar a perdu son anneau white@0.28 : c'est désormais un disque bleu translucide sur un fond bleu, avec un contraste bord-à-fond très faible — il ne se détache plus du hero. À noter aussi, sur mobile le premier écran se termine par ~70px de vide, la section « Compte » tombant pile derrière la BottomNav : l'écran paraît fini alors qu'il ne l'est pas, sans aucune affordance de scroll.

## 20 Succes Carte — 8/10 → **3/10**

### Défauts restants

- **[notable]** Sur desktop la carte bancaire est étirée à la largeur du conteneur (640×199, soit un rapport 3,2:1 au lieu de 1,586:1) : la puce et le numéro flottent dans un bandeau qui n'a plus la proportion d'une carte. C'est le seul objet identitaire du produit et il est déformé.
- **[notable]** Le CTA « Voir ma carte » passe sous la ligne de flottaison en 390×780 : sur un écran terminal, l'unique sortie n'est plus visible sans défiler.
- **[finition]** Composition interne de la carte : ~90px de vide entre la puce et le numéro, puis numéro / porteur / EXP tassés sur 45px en bas. Le rythme vertical de la face n'a pas été rejoué après la suppression des cercles.
- **[finition]** L'InfoBanner de bas de page cumule toujours un fond ET une bordure (double transparence) — la teinte bleue a disparu mais pas le principe pointé par l'audit.
- **[finition]** « Devise de règlement : EUR » sous un « Plafond mensuel : 500 000 FCFA » — deux devises dans une liste de 4 lignes, sans explication.
- **[finition]** L'espace fine insécable (U+202F) comme séparateur de milliers est quasi invisible à 13px : « 500 000 FCFA » se lit « 500000 ».

### Régressions introduites par la refonte

Deux régressions de mise en page. 1) La VirtualCard n'a plus de ratio fixe : en desktop elle s'étire à 3,2:1 et cesse d'être une carte. 2) Le passage des tuiles à la liste à plat n'a pas été borné en largeur sur desktop : label à gauche et valeur à droite se retrouvent séparés de 640px sans repère, l'appariement « Statut → ● Actif » devient un exercice de balayage. Enfin, l'enrichissement du contenu a poussé le CTA hors de l'écran en mobile.

## 21 Succes Depot — 9/10 → **3/10**

### Défauts restants

- **[finition]** Le sous-titre « Votre portefeuille FixPay a été approvisionné » redit la ligne « Destination : Portefeuille FixPay » située 80px plus bas. L'information est énoncée deux fois en deux formes.
- **[finition]** Aucune action secondaire (« Partager le reçu », « Nouveau dépôt ») : l'écran ne propose toujours qu'une sortie alors qu'il en a désormais la place.
- **[notable]** Le rendu desktop est inchangé sur le fond : une colonne de ~345px centrée dans un 1440×900 vide, sans sidebar, ~250px de vide sous le CTA. Le reçu remplit mieux, mais l'écran plein reste sans réponse desktop.
- **[finition]** Titre / montant / sous-titre restent fer-à-centre au-dessus d'un tableau aligné à gauche et à droite : l'axe de composition change au milieu de la page.
- **[finition]** Masquage du numéro « +221 77 ••• 12 34 » : le découpage des deux derniers groupes ne correspond à aucune convention sénégalaise (77 XXX XX XX).

### Régressions introduites par la refonte

Le « Nouveau solde : 1 866 252 FCFA » est lu depuis la constante globale wallet.balance (src/lib/format.ts + mock-data) : la même valeur est affichée comme solde d'arrivée sur les écrans 21, 22, 23 et 25. Un dépôt de 50 000 et un retrait de 50 500 aboutissent donc au même solde final. L'écran affirme désormais un chiffre faux là où il n'affirmait rien — la donnée fabriquée a été déplacée, pas corrigée.

## 22 Succes Retrait — 9/10 → **3/10**

### Défauts restants

- **[notable]** Le badge est en --c-warning, la couleur d'avertissement du système (celle de « KYC en attente », écran 28). Une opération réussie signe toujours dans la teinte d'alerte.
- **[notable]** Le rendu desktop reste une colonne étroite centrée dans un viewport vide, sans sidebar.
- **[finition]** Le sous-titre « Vers votre compte Mobile Money Wave » redit la ligne « Destinataire : Wave · … ».
- **[finition]** Aucune action secondaire (« Nouveau retrait »), l'écran garde une sortie unique.

### Régressions introduites par la refonte

Incohérence arithmétique inter-écrans introduite par les nouveaux reçus : après un débit total de 50 500 FCFA, le « Nouveau solde » affiché (1 866 252 FCFA) est strictement identique à celui affiché après le dépôt de 50 000 de l'écran 21 et aux soldes des écrans 23 et 25. Le montant (50 000) est lui aussi identique à celui des écrans 21 et 25. Trois confirmations différentes racontent la même transaction.

## 23 Succes Alimentation — 9/10 → **3/10**

### Défauts restants

- **[notable]** Badge bleu et CTA bleu partagent exactement la même teinte sur le même écran : l'audit demandait explicitement « une seule zone bleue = le point d'action ». La hiérarchie chromatique reste plate en haut et en bas de page.
- **[finition]** L'icône du badge est toujours le CreditCard générique de lucide, identique au picto de l'onglet « Cartes » de la BottomNav et à la ligne « Paiement » de l'écran 28. La vignette mini-carte suggérée n'a pas été utilisée.
- **[notable]** « Solde portefeuille 1 866 252 FCFA » identique aux écrans 21, 22 et 25 alors que l'opération vient d'en retirer 125 000 : la donnée est une constante, pas un résultat.
- **[finition]** Le sous-titre « Les fonds ont été transférés sur votre carte » redouble les lignes Depuis / Vers.
- **[notable]** Desktop inchangé : colonne étroite dans un viewport vide.

### Régressions introduites par la refonte

Aucune régression visuelle. En revanche la refonte a introduit une incohérence de données visible à l'œil nu : le solde carte après alimentation (816 202) est le même que le solde carte après le paiement de l'écran 24 et après le retrait carte de l'écran 25 — trois opérations de sens opposé pour un résultat identique.

## 24 Succes Paiement — 9/10 → **3/10**

### Défauts restants

- **[notable]** Le badge est ambre, c'est-à-dire --c-warning, la couleur des états d'attente et d'alerte du système. Un paiement accepté signe donc dans la teinte de « KYC en attente ».
- **[notable]** Le sous-titre « Amazon · Visa •••• 4291 » est la répétition littérale des deux premières lignes du reçu (« Marchand : Amazon », « Carte : Visa •••• 4291 »), à 80px d'écart.
- **[finition]** Toujours pas de logo ni de monogramme marchand : l'identification du commerçant reste purement textuelle alors que l'écran 28 le fait déjà mieux.
- **[finition]** « Plafond restant 190 000 FCFA » ne se raccorde à aucun des chiffres de l'écran 20 (plafond mensuel 500 000).
- **[notable]** Desktop inchangé : colonne étroite centrée dans un viewport vide.

### Régressions introduites par la refonte

Le badge est passé du bleu de marque à l'ambre. La règle nouvelle (ambre = sortie de fonds) est défendable, mais elle réutilise la couleur d'avertissement du système pour un événement réussi, et elle place le paiement carte et le retrait Mobile Money (écran 22) sous la même signature chromatique alors que ce sont deux natures d'opération distinctes.

## 25 Succes Retrait Carte — 9/10 → **3/10**

### Défauts restants

- **[finition]** Badge bleu et CTA bleu de même teinte sur le même écran (même remarque que l'écran 23).
- **[notable]** Montant 50 000 FCFA identique à celui des écrans 21 et 22, soldes 816 202 / 1 866 252 identiques aux écrans 23 et 24 : le jeu de données de démonstration est un état figé recopié, pas une suite d'opérations.
- **[finition]** Le sous-titre redit la ligne « Vers : Portefeuille FixPay ».
- **[notable]** Desktop inchangé : colonne étroite centrée dans un viewport vide.

### Régressions introduites par la refonte

Aucune régression visuelle propre à cet écran. La seule dégradation est de crédibilité : en donnant des soldes chiffrés là où il n'y avait qu'un tiret, l'écran expose désormais l'incohérence du jeu de données (mêmes soldes d'arrivée que 22, 23 et 24).

## 26 Support — 7/10 → **5/10**

### Défauts restants

- **[notable]** Le hero à dégradé de marque 135° est toujours là. L'audit demandait sa suppression pure et simple : un tiers de la largeur en dégradé bleu pour une phrase de politesse, alors que le dégradé est censé rester réservé à la carte bancaire. C'est aujourd'hui le seul objet non-carte à en porter un dans tout le lot.
- **[notable]** Les trois tuiles d'icône 40px teintées (vert / bleu / vert) sur les canaux de contact sont intactes — marqueur [G] non traité. Chat et WhatsApp restent deux carrés verts identiques au premier coup d'œil.
- **[notable]** Le tout-en-carte est intact : hero + ListGroup contacts + ListGroup FAQ, trois conteneurs vitrés empilés, aucun contenu posé sur le fond — alors que l'écran 28, pris comme modèle par l'audit, l'a fait.
- **[notable]** Le numéro WhatsApp est toujours « +221 7X XXX XX XX », c'est-à-dire un masque de maquette affiché comme une coordonnée.
- **[finition]** La FAQ reste tronquée en mobile : la 4e question est coupée à mi-hauteur par la BottomNav, sans « Voir tout » ni affordance de défilement. Les 5 items ne tiennent que sur desktop.
- **[finition]** Pas de champ de recherche en tête de FAQ.
- **[finition]** L'icône bouclier du hero est le logo de l'app, également utilisé comme avatar de l'agent (écran 27) et comme picto KYC : le même symbole pour trois rôles.

### Régressions introduites par la refonte

Le nouveau sous-titre du hero, « Réponse en moins de 5 minutes, 7j/7 », est répété mot pour mot 250px plus bas comme sous-ligne de la ligne « Chat en direct ». La réécriture a créé un doublon littéral sur le même écran. Par ailleurs, en desktop, la colonne de contenu est centrée dans l'espace restant et laisse une bande vide de ~270px entre la sidebar et le hero : le bandeau à dégradé pleine largeur y prend un air de bannière marketing.

## 27 Chat Support — 7/10 → **4/10**

### Défauts restants

- **[notable]** Toujours aucun bouton pièce jointe dans la barre de saisie, aucun accusé de lecture, aucun indicateur de saisie, aucun état d'erreur d'envoi : l'appareillage minimal d'une messagerie reste absent.
- **[finition]** Le message d'accueil n'a pas été raccourci : trois lignes dont une dernière de 150px (« aujourd'hui ? »), la bulle forme toujours un escalier irrégulier.
- **[notable]** Pas de lien « Parler à un conseiller » alors que l'en-tête assume désormais un bot, et l'écran 26 continue de promettre « Réponse en moins de 5 minutes » sur le même canal : la promesse de délai diffère d'un écran à l'autre.
- **[finition]** Environ 60 % de la hauteur au-dessus de la conversation est un aplat vide sans état d'ouverture (ni illustration, ni rappel de contexte, ni historique) : le vide a été déplacé au bon endroit, il n'a pas été traité.
- **[notable]** En desktop, la conversation à une bulle occupe le bas d'une zone de 1178×900 quasi entièrement vide ; aucune adaptation à la largeur disponible (pas de panneau d'aide, pas d'historique de tickets).

### Régressions introduites par la refonte

Pas de régression fonctionnelle : les trois détails « de main humaine » signalés par l'audit (coin cassé asymétrique, avatar ancré en bas de bulle, chips indentées sur le bord de la bulle) sont tous préservés, et la barre de saisie garde son fond opaque. Seule conséquence discutable de l'ancrage en bas : le vide de la conversation s'est déplacé sous l'en-tête, où plus rien ne le justifie ni ne l'occupe.

## 28 Notifications — 5/10 → **4/10**

### Défauts restants

- **[notable]** Le marqueur principal n'est pas traité : les montants restent noyés au milieu de la sous-ligne en 11,5px muted (« Votre portefeuille a été crédité de 100 000 FCFA · Hier, 09:16 »). L'information la plus importante d'une notification bancaire est toujours l'élément le moins lisible, et il n'y a ni colonne droite, ni signe +/−, ni graisse distincte.
- **[notable]** La taxonomie des libellés reste incohérente : « Paiement effectué », « Recharge confirmée », « Recharge portefeuille », « Alimentation carte réussie », « Retrait effectué », « Compte créé avec succès » — quatre formes grammaticales pour six événements, et deux libellés différents pour le même type d'événement.
- **[notable]** Aucune action « Tout marquer comme lu », aucun filtre, aucune affordance de clic sur les lignes (ni chevron, ni état de survol visible) alors que chaque notification pointe une transaction identifiable.
- **[finition]** Deux des quatre teintes sémantiques (#30a46c, #e5484d) sont les valeurs 9 de Radix Colors : la palette par défaut de Tailwind a été échangée contre la palette par défaut d'une autre bibliothèque, elle n'a pas été retouchée.
- **[notable]** Le rendu desktop est inchangé : colonne unique de ~600px dans un 1440, ~290px de vide de chaque côté, descriptions en 11px, aucun passage en tableau (icône | libellé | montant à droite | date).
- **[finition]** Les icônes nues sont centrées verticalement sur la ligne entière : sur les items à description de deux lignes, l'icône descend sous la ligne du titre au lieu de s'aligner dessus.
- **[finition]** « Nouvelles · 3 » porte un compteur mais « Précédentes » n'en porte pas, et aucune des deux sections n'est datée alors que l'audit demandait un groupement par jour.

### Régressions introduites par la refonte

La différenciation lu / non-lu ne repose plus que sur la couleur du texte, et elle a été appliquée au titre ET à la description : toute la section « Précédentes » (4 lignes sur 7) est en gris, ce qui la fait lire comme désactivée plutôt que comme déjà consultée. Le contraste reste conforme (8,7:1 sur les titres lus, 5,3:1 sur les descriptions), mais l'audit recommandait de conserver aussi le ton d'icône et la hauteur de ligne comme signaux redondants : la hauteur de ligne est désormais identique pour les deux états, il ne reste qu'un seul canal de différenciation là où il y en avait trois.

