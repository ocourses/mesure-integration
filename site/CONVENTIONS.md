# Conventions des pages d'illustration

Ces règles sont celles du site du cours d'automatique
(`ocourses/automatique-enseignants`, dossier `site/`), dont ce site reprend le
gabarit, la feuille de style et les briques communes. Seuls les rôles des
couleurs (section 3) et les briques propres au cours (section 6) changent. La
page de référence est « Riemann contre Lebesgue »
(`js/illustrations/riemann-lebesgue.js`). Le fonctionnement du gabarit est
décrit dans le `README.md`, section « Ajouter une illustration ».

## 1. Mise en page

- **Gabarit commun.** Le gabarit (`illustration.html`) place une boîte à
  onglets à gauche (« Ce que dit le cours », « À essayer ») et l'illustration à
  droite. L'onglet « À essayer » est masqué s'il n'y a pas d'essai.
- **En-tête sur deux lignes.** La première ligne porte le fil d'Ariane
  « ← Accueil · thème ». La seconde porte le titre, suivi de la source. Le
  titre, le thème et la source viennent du catalogue
  (`js/illustrations/catalogue.js`). Le lien de retour s'écrit « ← Accueil »
  sur toutes les pages.
- **Tout tient dans la fenêtre sur grand écran.** Au-delà de 900 px de large et
  620 px de haut, la page prend la hauteur de la fenêtre, avec un maximum de
  1000 px. La boîte de gauche a la hauteur de la colonne de droite, et les
  cartes ne défilent pas. Si le contenu ne tient pas, on réduit les figures,
  pas la lisibilité du texte. La référence de contrôle est une fenêtre de
  1504 × 856.
- **Les canevas remplissent leur carte.** Un canevas carré (repère orthonormé)
  garde ses proportions et se centre. Les autres s'étirent. On ne fixe jamais
  de hauteur en pixels à un canevas.
- **Une seule colonne sur écran étroit.** En dessous de 900 px, la page passe
  sur une colonne et défile normalement, sans `100vh` rigide. L'illustration
  passe avant le texte du cours.
- **Dispositions disponibles.** On utilise `.grille-2` (deux cartes côte à
  côte, de même hauteur), `.grille-3` ou `.deux-colonnes` (deux cartes
  empilées à gauche, une carte sur toute la hauteur à droite). Dans ce dernier
  cas, la carte du haut prend 55 % de la hauteur. Un choix qui porte sur toute
  l'illustration (forme, système) va dans une ligne d'outils sans carte
  (`.barre-outils`), avec le bouton « i » à droite. La rangée des figures
  principales porte la classe `principale` : elle prend deux fois plus de
  hauteur que les rangées de réglages ou de courbes.
- **Compléments repliables.** Un contenu annexe (un contre-exemple, par
  exemple) va dans un bloc repliable (`repliable()` de `commun.js`), fermé par
  défaut. Son état est gardé dans les préférences. Ouvert, il prend environ un
  tiers de la hauteur.
- **Seuls les canevas rétrécissent.** Dans une carte, un bloc de texte ou de
  formules garde sa hauteur, et c'est le canevas voisin qui cède. Une carte
  de colonne ne descend pas sous la hauteur de son texte.
- **Repli sur petite fenêtre.** Entre 900 px et 1200 px de large, si le
  contenu ne tient plus, seule la zone de l'illustration défile, jamais la
  page entière. Les formules KaTeX y sont retenues par `position: relative`.
- **Texte de hauteur fixe.** Un texte qui change avec les réglages (verdict,
  formules sous une figure) a une hauteur réservée (`.verdict`, `.bloc-maths`).
  Sans cela, la figure change de taille quand le texte passe à la ligne.
- **Rangée de texte de hauteur fixe.** Quand le texte du bas peut devenir long
  (une famille de 17 parties, un verdict à deux lignes), la rangée porte la
  classe `hauteur-fixe` : elle garde sa hauteur, le texte défile dans sa carte
  si besoin, et la figure du dessus ne change jamais de taille. On raccourcit
  aussi les listes (quatre parties, puis « et n autres »). La figure grandit
  avec la place dont elle dispose (la taille des cases n'est pas plafonnée à
  quelques pixels).
- **Énoncés à choisir : une liste.** Plus de trois énoncés à choisir se
  présentent un par ligne (`.choix.enonces`), pas à la file.
- **Échelle linéaire ou logarithmique.** Une suite qui converge par ordres de
  grandeur (xⁿ, 2⁻ᵐ, 2⁻ⁿ) se lit mieux en échelle logarithmique. Les pages à deux
  suites numériques sous la figure (« Modes de convergence », « Fonctions
  étagées », « Convergence dominée », « Des suites qui trompent ») proposent le
  choix (`choixEchelle`, préférence d'affichage `echelle`) : les valeurs, ou
  l'écart à la limite en échelle logarithmique, où ce qui ne converge pas reste
  à plat. Les graduations sont des puissances de 10 (`echelleLog`, `axesLog` de
  `commun.js`), le niveau 1 est toujours visible, et les valeurs nulles, sans
  logarithme, sont sur une ligne « 0 » à part. Une limite infinie garde
  l'échelle des valeurs.
- **Le texte ne colle pas à la figure.** Un bloc de texte sous un canevas (ou sous
  sa légende) en est séparé d'au moins 0,5 em : les graduations de l'axe sont
  dans le canevas, et le texte ne doit pas les toucher. La règle est dans la
  CSS (`canvas.toile + …`, `.legende-courbes`), pas dans chaque page.
- **Verdict : le liseret suit le texte.** `paragraphe(…, 'verdict')` entoure le
  verdict d'une zone de deux lignes (`.zone-verdict`) qui réserve la place, et
  c'est le texte seul qui porte le liseret : un verdict d'une ligne a un
  liseret d'une ligne.
- **Choix qui modifient toute la page : des radios, hors des boîtes.** Le
  système, l'étape, la forme se choisissent par des boutons radio dans une barre
  d'outils au-dessus des cartes (`barreOutils`, `choixRadios` de `commun.js`),
  jamais par de gros boutons, ni dans une carte de texte qu'ils modifient.
- **Rangées inégales.** La rangée des figures principales prend plus de place :
  `principale` (deux fois) ou, pour deux rangées, `plus-haut` et
  `rangee-basse` (60 % et 40 %).

## 2. Texte et typographie

- **Une seule taille de texte.** Le cours, les essais, les notes et les
  verdicts sont en 0,9 rem (`--taille-texte`), dans la police du texte. Les
  formules KaTeX ont le même corps partout (1,1 em).
- **Notations.** Tout opérateur mathématique s'écrit en romain, jamais en
  italique : `\operatorname{card}`, `\sup`, `\operatorname{ess\,sup}`, `\ln`,
  `\mathrm d\mu`, `\mathbb 1_A`… dans le texte comme sur les axes. Pour les axes
  du canevas, on passe des segments `[['ln ', false], ['x', true]]`. Les
  notations sont celles du poly ou du TD cité : $\lambda$ pour la mesure de
  Lebesgue, $\mathcal B(\mathbb R)$ pour les boréliens, $\mathbb 1_A$ pour
  l'indicatrice, $f_n$ indexée par $n \ge 1$ quand le poly le fait. Les
  renvois au poly donnent le numéro du résultat (« Théorème 5.1.6 »), tel
  qu'il apparaît dans le PDF.
- **Intervalles.** KaTeX prend un crochet `]` ouvrant pour un crochet fermant,
  et espace mal ce qui suit (« ] − ∞ »). Un crochet ouvrant à l'envers
  s'écrit `\mathopen{]}`, un crochet fermant à l'envers `\mathclose{[}` :
  `\mathopen{]}-\infty, t]`, `[y_k, y_{k+1}\mathclose{[}`
  (`tests/intervalles.test.js` le vérifie). Un nombre décimal
  dans une formule s'écrit avec `{,}` (`latexNombre`), jamais avec une virgule
  nue.
- **Formules centrées.** Une matrice ou une formule importante va sur sa propre
  ligne, centrée (`.formule`, rendue en mode display).
- **Virgule décimale, point-virgule dans les listes.** Les nombres s'écrivent
  à la française, `0{,}5`. Dès qu'un nombre décimal figure dans une liste, un
  intervalle ou un couple, le séparateur devient le point-virgule, pour qu'on ne
  lise pas $\{2{,}5\}$ comme deux éléments : $[1{,}5\,;\,2{,}5]$,
  $(1{,}50\,;\,0{,}40)$, $\{2{,}5\,;\,3\}$. Avec des entiers seulement, la
  virgule reste : $\{2, 5\}$, $[0, 1]$. On passe par `separateur` et
  `latexIntervalle` de `format.js` (le choix se fait sur les chiffres
  affichés), jamais par un `join(', ')` écrit à la main sur des nombres
  réels.
- **Nombres qui bougent : une place réservée seulement quand elle sert.** Un
  nombre qui change au glisser ou pendant une animation s'écrit avec un nombre
  fixe de décimales : sinon la formule « vibre » quand une décimale apparaît
  puis disparaît. Deux choses peuvent encore faire bouger ce qui le suit, et
  chacune ne se réserve que si elle peut se produire :
  - **Le signe.** Une grandeur qui peut changer de signe pendant le geste
    (`latexNombreFixe`, `latexMatriceFixe`) garde la place du signe moins, pour
    que l'apparition du « − » ne décale rien. Une grandeur positive par nature
    (une mesure, une longueur, une aire, une intégrale d'une fonction positive,
    une somme de Darboux, un écart entre deux sommes, une norme, un temps)
    s'écrit avec `latexPositifFixe` : aucune place pour un signe qui ne viendra
    pas. Une grandeur dont le signe ne dépend que du cas choisi, pas du
    geste, s'écrit avec `latexNombreFinal` (le « − » seulement s'il est là).
  - **Les chiffres de la partie entière.** `latexPositifFixe` ne complète
    rien par défaut. Un nombre **suivi de texte** et qui peut passer de 9,9
    à 10 réserve la place du plus grand nombre qu'il peut atteindre :
    `entiers = chiffresEntiers(max)`. Un nombre **en fin de phrase** ne réserve
    rien, puisque rien ne le suit. Le trou qu'on voit après un « = » est
    presque toujours un `entiers` trop grand.
  - On n'emploie pas la notation scientifique : « 1,2·10⁰ » se lit moins bien
    que « 1,200 » pour des nombres qu'on compare, et elle n'évite pas le
    décalage du « − ».
- **Valeurs qui changent : une mise en page qui ne bouge pas.** Un texte qui
  affiche une valeur modifiée au glisser ou à l'animation ne doit ni changer de
  largeur ni sauter de ligne.
  - Tout nombre d'un texte ou d'une légende qui varie s'écrit à virgule fixe
    (`latexPositifFixe`, `latexNombreFixe`, `latexComplexeFixe`,
    `latexMatriceFixe`). On n'emploie `latexNombre` que pour une valeur qui ne
    change pas pendant le geste.
  - Quand la phrase elle-même change (nom du cas, verdict), les nombres vont
    dans une formule ou un tableau à part, de largeur fixe, et le texte variable
    reste à côté : la mise en page ne dépend que du texte constant.
  - Les tableaux de valeurs ont des colonnes de largeur fixe.
- **« Ce que dit le cours ».** On énonce le résultat, sans démonstration. Une
  énumération de cas se met en liste à puces (un élément de `rappel` qui est
  lui-même un tableau).
- **Légendes en bulle.** Toute figure qui a plus de deux éléments à expliquer
  a un bouton « i » en haut à droite de sa carte, créé par
  `boutonInfo(carte, elements)` de `commun.js`. Il ouvre une légende avec des
  pastilles de couleur (ligne, tirets, point, cercle, flèche, aplat) : ce que
  représente chaque tracé, et ce qu'on peut faire à la souris. On ne met pas
  de longue phrase de légende sous la figure.
- **Glossaire du poly.** Les termes définis dans le poly sont dans
  `js/illustrations/glossaire.js`, avec la définition reprise au plus près du
  poly et sa source (chapitre).
  - Une page déclare ceux qu'elle emploie dans `termes`. Le gabarit souligne
    leur première occurrence dans le cours et dans les essais, et la
    définition s'affiche en infobulle.
  - Pour un texte construit par l'illustration, on appelle
    `outils.glossaire(element, termes)`.
  - Un terme absent du poly (par exemple « matrice compagnon ») s'explique avec
    `infobulle(racine, terme, explication)`, sans entrer au glossaire.
  - On ajoute au glossaire tout terme du poly employé par une page, plutôt
    que de le redéfinir dans le texte.
  - Les théorèmes nommés (convergence monotone, lemme de Fatou, convergence
    dominée, Fubini-Tonelli, Fubini, changement de variables…) sont au
    glossaire, avec leur énoncé du poly : on écrit leur nom dans le texte
    plutôt que leur seul numéro.
  - `tests/glossaire.test.js` vérifie que chaque page déclare tous les termes
    du glossaire présents dans son cours et ses essais (hors formules, en
    mots entiers), et aucun autre. Un terme écrit en LaTeX (`$\sigma$-finie`)
    n'est pas reconnu : on l'écrit en texte (« σ-finie »).
- **Typographie française.** Le texte est en français, avec des espaces
  insécables avant « : », « ; », « ! », « ? ». On écrit les guillemets
  « … » et l'apostrophe ’.

- **Les formules importantes en ligne centrée.** Dans « Ce que dit le cours »,
  une définition ou une formule qu'on retient s'écrit seule sur sa ligne
  (`$$…$$`, centrée), entre deux phrases qui l'introduisent et la commentent :
  `\mu_f(B) = \mu(f^{-1}(B))`, pas noyée dans un paragraphe. Les petites
  formules de commentaire restent dans le texte. La boîte du cours fait 360 px
  de large : une formule qui déborde se coupe en deux lignes avec `gathered`.
  Le test d'un rendu sans erreur KaTeX ni débordement se fait à la main
  (`.katex-error`, `scrollWidth`).

## 3. Couleurs

Aucune couleur n'est écrite en dur dans `style.css` : tout passe par les
variables de `css/theme.css`, qui ont une valeur claire et une valeur sombre.
Les canevas lisent les mêmes variables par `couleurs()` (`js/ui/theme.js`) et
se redessinent au changement de thème (`outils.surTheme`).

Chaque couleur a un seul rôle, le même sur toutes les pages. Les noms des
variables viennent du site d'automatique ; on ne les renomme pas, pour garder
`theme.css` commun aux deux sites.

| Rôle | Variable | Usage |
|---|---|---|
| Fonctions, texte | `--texte` | le graphe de la fonction étudiée, les suites $f_n$ en fond |
| Accent | `--accent` | l'objet courant : $f_n$ pour le $n$ choisi, l'ensemble que l'on mesure, la fonction étagée |
| Aire | `--zone-stable` | l'aire sous une courbe, c'est-à-dire l'intégrale ; un ensemble de mesure positive |
| Choix à la souris | `--perturbation` (orange) | le point, la valeur ou la bande choisis d'un clic, rappelés partout de la même couleur |
| Limite | `--equilibre` (violet) | la fonction limite, la valeur limite d'une suite d'intégrales |
| Alerte | `--alerte` (rouge) | ce qui échoue : intégrale infinie, dominante non intégrable, inégalité fausse ; jamais pour autre chose |
| Discret | `--discret` | graduations, repères, objets secondaires |

Les boîtes n'ont ni liseré coloré ni fond teinté. Un onglet sélectionné est
marqué par le seul trait bleu dessous, sans fond. Les bulles (infobulles,
légendes « i ») ont un fond gris léger et un bord marqué (`--fond-bulle`,
`--bord-bulle`), pour se distinguer du texte.

Des séries comparées (plusieurs fonctions $f_n$, plusieurs exposants $p$)
prennent `--serie-1` à `--serie-4`, qui n'ont pas d'autre rôle. Des ensembles
disjoints (atomes d'une tribu) prennent les séries, puis l'accent, le violet,
l'orange et le gris, en transparence (0,4), avec leur numéro écrit dessus :
les zones sont trop pâles pour en distinguer plus de deux.

## 4. État et sauvegarde

Il y a deux mémoires, et chaque réglage va dans l'une des deux.

- **L'URL : ce qui définit l'expérience.** On y met ce qu'on partage en
  copiant l’adresse de la page : les paramètres mathématiques, la fonction choisie,
  l’indice n, le point choisi. C’est `etat` dans le module.
  - L'URL est écrite tout de suite, puis au plus toutes les 200 ms pendant un
    glisser.
  - Les nombres gardent 10 chiffres significatifs. Un aller-retour par l'URL
    ne doit pas changer le résultat, par exemple $ap = 1$ sur la droite critique.
- **Le navigateur (localStorage) : le confort de chaque lecteur.** On y met le
  mode d’animation, les blocs repliés et l’onglet ouvert. C'est `preferences`
  dans le module, sous la clé `mesure.illustration.<id>`.
  - La page doit marcher sans stockage, par exemple en navigation privée. Les
    accès sont protégés.
  - Le zoom d'une courbe n'est sauvé nulle part : il revient au cadre
    automatique à chaque visite.
- **Réinitialiser.** Le gabarit ajoute à toute page qui a des réglages un
  bouton « ↺ Réinitialiser » dans l'en-tête : il remet `etat` à ses valeurs par
  défaut, comme un essai (`applique(etat)`). Les préférences d'affichage
  restent. Une page garde donc tout son état dans `outils.etat` : un état local
  que `applique` ne relit pas ne serait pas remis à zéro.
- **Valeurs vérifiées.** Une valeur lue (URL ou navigateur) d'un mauvais type,
  non finie ou hors des valeurs permises (`choix` dans le module) est remplacée
  par la valeur par défaut. L'interface est alors toujours cohérente : un
  bouton radio est toujours coché.
- **Préférences des essais.** Un bouton « Essayer » peut fixer des préférences
  (`preferences` de l'essai). Les essais du diagramme remettent ainsi les
  courbes en « tracées ».

## 5. Interactions

- **Dire ce que fait le geste.** Un clic dont l'effet n'est pas évident (un
  point qui change de bloc, une flèche redirigée) s'accompagne d'une phrase sous
  la figure : « Le point 4 rejoint le bloc {4, 5}. » ; sans geste, la même place
  donne la consigne. Le bloc se dit par son contenu, pas par son numéro, qui
  peut être renuméroté. L'étiquette écrite à côté d'un point (numéro du bloc,
  nom de la partie) compte comme le point : la cliquer revient à le cliquer
  (`pointVise` avec `cote`).
- **Une application est définie partout.** Dans un diagramme sagittal, chaque
  point de départ a exactement une flèche : on la redirige, jamais on ne la
  supprime. Une flèche lâchée loin de tout point revient. La légende le dit.
- **Glisser et cliquer.** On utilise `glisse()` (`commun.js`), qui gère la
  souris et le tactile. Le curseur indique ce qui se saisit (`.saisissable`)
  ou se clique (`.cliquable`).
- **Aimantation exacte.** Un point se colle aux lieux remarquables : axes,
  droite $ap = 1$, entiers. La valeur obtenue doit être exacte, sans arrondis
  séparés : $ap$ vaut 1, et non $1{,}001$. Une fonction pure et testée calcule
  le point.
- **Plusieurs moyens de régler une valeur.** Un curseur seul est difficile à
  placer. `champ()` en donne trois, toujours ensemble : le curseur (gros
  réglage, et ← → quand il a le focus), les boutons ▲ ▼ dans la boîte de
  nombre (un pas rond, `pasFleche`, par exemple 0,1 ; maintenus, ils répètent),
  et la saisie au clavier. Quand la boîte a le focus, ↑ et ↓ changent la valeur
  d'un pas (PageHaut, PageBas ou Maj : dix pas). Toute grandeur réglable d'une
  illustration passe par `champ()` ; une boîte de nombre seule, même écrite en
  HTML, reçoit les mêmes boutons par `ajoutePas()` (`controls.js`) ; le curseur n'est pas étiré sur toute la
  carte.
- **Calculs coûteux pendant le glisser.** Ce qui se recalcule lentement quand
  un paramètre change ne s'efface jamais : l'ancien
  résultat reste affiché pendant que le nouveau se calcule en arrière-plan,
  puis le nouveau apparaît en fondu (350 ms, sans fondu si le mouvement est
  réduit). Un calcul relancé avant la fin abandonne le précédent.
- **Zoom des courbes temporelles.** La molette zoome autour du curseur, et le
  glisser déplace la vue. Les boutons +, − et ↺ font la même chose, et le
  temps reste ≥ 0. La courbe est recalculée sur la plage visible.
- **Choisir un indice sur la figure.** Une figure dont l'abscisse est un indice
  ($n \mapsto f_n(x)$, $n \mapsto \int f_n$) se clique : un clic ou un glisser
  choisit $n$, comme le curseur (`choisitIndice`, `commun.js`), qui s'arrête
  si l'animation tourne. Le curseur et les flèches ne dépassent jamais le plus
  grand indice du cas choisi (`fixeMax` de `champ`) : un curseur qui va plus
  loin que ce que la page sait dessiner laisse croire qu'elle est bloquée. La
  légende en bulle de la figure le dit.
- **Grille sur les unités.** Pour une suite qui concentre ou qui s'échappe
  (masse concentrée, bosse $\mathbb 1_{[n, n+1]}$), les graduations seules
  cachent ce qui se passe : la figure se rééchelonne avec $f_n$ et la bosse
  semble ne pas bouger. On trace une grille à chaque entier
  (`grilleUnites`, `fonctions.js`), qui reste fixe : on voit la grille se
  resserrer en $y$ quand $f_n$ grandit, ou la bosse la traverser. On ne
  repasse en pâle les $f_k$ précédentes que si elles montrent quelque chose
  (la racine : elles montent vers la limite).
- **Rappels croisés.** Un même objet a la même couleur partout. Par exemple, le
  point $x$ choisi en orange sur le graphe de $f_n$ est rappelé en orange dans
  la suite $n \mapsto f_n(x)$.
- **Animation sobre.** On n'anime que ce qui bouge. Une figure immobile n'est
  pas redessinée à chaque image. L'animation respecte
  `prefers-reduced-motion` : rien ne bouge.
- **Clavier.** Les onglets se parcourent avec les flèches. Les bulles s'ouvrent
  au focus et se ferment avec Échap. Tout bouton a un `aria-label` s'il ne
  porte qu'un symbole.

## 6. Briques partagées

- **Navigation.** Chaque page a, dans son en-tête, « ← Accueil », « ← Page
  précédente » et « Page suivante → » (`js/parcours.js`, ordre de lecture :
  les illustrations par chapitre, dans l'ordre du poly). Le retour revient à
  la carte de la page sur l'accueil, pas en haut : chaque carte a un
  identifiant (`illustration-<id>`).

- **Fonctions d'une variable.** `js/illustrations/fonctions.js` regroupe le
  tracé d'une fonction (avec ses sauts, sans trait vertical), le remplissage
  de l'aire sous une courbe, les intégrales numériques et l'axe des valeurs
  infinies. Une page qui trace une fonction le reprend.
- **Ensembles finis.** `js/illustrations/ensembles.js` code une partie d'un
  petit ensemble par un masque de bits et une application par le tableau de
  ses images. Il calcule images directes et réciproques, tribus engendrées
  (par leurs atomes), axiomes en défaut, tribus image et image réciproque. Il
  dessine aussi les diagrammes sagittaux : points nommés 1, 2, … dans $E_1$ et
  a, b, … dans $E_2$, étiquettes des parties choisies, et flèches que l'on
  redirige à la souris (`gestesDiagramme`). Une tribu sur un ensemble fini
  s'y donne par une partition, dont un clic change le bloc d'un point
  (`blocSuivant`). Sur ces pages, tout ce qui est affirmé se vérifie
  exhaustivement sous Node (`tests/ensembles.test.js`).
- **Ensembles calculés et ensembles intermédiaires.** Quand une page montre
  un ensemble comme intersection ou réunion d'autres, les ensembles
  intermédiaires sont en gris (`--discret`) et le résultat en accent. Les
  couleurs de série ne servent pas à cela : `--serie-1` est l'orange de
  `--perturbation`, et `--serie-2` le bleu de `--accent`.
- **Éléments d'une carte qui apparaissent ou disparaissent.** Un curseur ou une
  note qui n'a de sens que dans un mode (ε de la preuve) reste en place, grisé
  ou vide, avec sa hauteur réservée : sinon les figures voisines changent de
  taille quand on coche l'option.

## 7. Ordre du catalogue

Les pages d'un thème suivent l'ordre du poly, puis l'ordre de difficulté : on
ne présente pas un objet avant la section qui le définit, ni un exercice qui
suppose une page encore à venir. Pour le chapitre 2, par exemple : tribu
engendrée (2.1), image réciproque (2.1.4), tribus sur un ensemble fini, tribus
d'une application, applications mesurables sur ℝ (2.2), mesure image (2.3.1),
suites d'ensembles (2.3.2), fonction de répartition (2.3.2), ensembles
négligeables (2.3.3). Une page qui couvre deux sections (Riemann contre
Lebesgue : 1.1 et 1.3) se place à la première.

## 8. Essais (« À essayer »)

- **Valeurs fixées.** Un essai fixe tous les paramètres dont dépend son texte
  (par exemple a et ω² du pendule), pour que le texte décrive exactement ce
  qu'on voit, même si le lecteur avait déplacé un curseur. Le point de départ
  reste visible dans le cadre de la figure, et le résultat annoncé est vérifié
  par calcul (test sous Node).
- **Partir d'un cas voisin.** Un essai qui demande de se déplacer part d'un cas
  voisin et laisse faire le déplacement : « Depuis n = 5, augmentez n ». Il ne
  place pas d'emblée sur le cas visé.
- **Affirmations vérifiées.** Une affirmation d'un essai (nature, valeur de
  det A au point d'arrivée, etc.) est vérifiée par calcul avant d'être écrite.
- **Animation en boucle.** Un indice qui parcourt une suite ($n$ dans $f_n$)
  peut s'animer en boucle, avec une courte pause, et s'active par une case
  « animer ». Toucher au curseur l'arrête.

## 9. Code et tests

- **Tests des fonctions mathématiques.** Elles sont exportées par le module et
  testées sous Node contre le poly ou le TD (`tests/*.test.js`) : valeurs
  d'intégrales, ensembles, aimantation, lecture de l'URL.
- **Ne pas vider une zone avant de dessiner.** Un texte ou un tableau qui change
  se construit à part, puis remplace l'ancien d'un coup (`replaceChildren`).
  Le vider d'abord change la taille des canevas voisins le temps du dessin, et
  le canevas reste étiré. Les canevas des illustrations ont `contain: size` et
  se redessinent à l'image suivante après un redimensionnement.
- **Calculs coûteux gardés.** Ce qui ne dépend que des paramètres est gardé en
  mémoire (les intégrales d'une suite, un ensemble de Cantor), car le dessin
  peut être refait à chaque image.
- **Code commenté en français, au niveau du fichier voisin.** Les noms sont en
  français (`dessine`, `trace`, `integrale`).

## 10. Vérifications avant un commit

1. `npm test` et `git diff --check`.
2. Ouvrir la page à 1504 × 856 : rien ne défile dans les boîtes, la page ne
   dépasse pas la fenêtre, et il n'y a aucune erreur JavaScript.
3. Ouvrir la page à 1200 × 800 (pas de double barre de défilement) et à 800
   de large (une colonne, et la page défile).
4. Recharger après un réglage : le réglage revient. Mettre une valeur absurde
   dans l'URL : la page reste cohérente.
5. Vérifier le thème sombre si l'on a touché aux couleurs.
6. Relire le relevé des essais (`node outils/essais.mjs <id>`, voir le
   README) : chaque essai doit afficher ce que son texte annonce, verdicts
   compris. Une page sans erreur JavaScript peut encore contredire son essai.
