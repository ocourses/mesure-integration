# Conventions des pages d'illustration

Les règles des sites de cours sont celles de
[`site.md`](https://github.com/ocourses/ocots-conventions/blob/main/site.md)
(`WEB1`–`WEB20`, d'`ocots-conventions`), pour le socle épinglé dans `socle/`.
Ce fichier ne garde que ce qui est propre à ce cours : ses arbitrages et les
règles qu'il est seul à appliquer pour l'instant. Le fonctionnement d'un module
d'illustration est décrit dans le `README.md`, section « Ajouter une
illustration ».

**Page de référence** : « Riemann contre Lebesgue »
(`js/illustrations/riemann-lebesgue.js`).

## 1. Couleurs ([WEB11](https://github.com/ocourses/ocots-conventions/blob/main/site.md#web11--une-couleur-un-rôle-défini-par-le-cours))

| Rôle | Variable | Usage |
|---|---|---|
| Fonctions, texte | `--texte` | le graphe de la fonction étudiée, les suites $f_n$ en fond |
| Accent | `--accent` | l'objet courant : $f_n$ pour le $n$ choisi, l'ensemble que l'on mesure, la fonction étagée |
| Aire | `--zone-stable` | l'aire sous une courbe, c'est-à-dire l'intégrale ; un ensemble de mesure positive |
| Choix à la souris | `--perturbation` (orange) | le point, la valeur ou la bande choisis d'un clic, rappelés partout de la même couleur |
| Limite | `--equilibre` (violet) | la fonction limite, la valeur limite d'une suite d'intégrales |
| Alerte | `--alerte` (rouge) | ce qui échoue : intégrale infinie, dominante non intégrable, inégalité fausse ; jamais pour autre chose |
| Discret | `--discret` | graduations, repères, objets secondaires |

- **Séries.** Des séries comparées (plusieurs fonctions $f_n$, plusieurs
  exposants $p$) prennent `--serie-1` à `--serie-4`, qui n'ont pas d'autre rôle.
- **Ensembles disjoints** (atomes d'une tribu) : les séries, puis l'accent, le
  violet, l'orange et le gris, en transparence (0,4), avec leur numéro écrit
  dessus. Les zones sont trop pâles pour en distinguer plus de deux sans numéro.
- **Ensembles calculés et ensembles intermédiaires.** Quand une page montre un
  ensemble comme intersection ou réunion d'autres, les ensembles intermédiaires
  sont en gris (`--discret`) et le résultat en accent. Les couleurs de série ne
  servent pas à cela : `--serie-1` est l'orange de `--perturbation`, et
  `--serie-2` le bleu de `--accent`.
- **Rappels croisés.** Le point $x$ choisi en orange sur le graphe de $f_n$ est
  rappelé en orange dans la suite $n \mapsto f_n(x)$.

## 2. Notations et nombres

- **Notations du poly** ([WEB8](https://github.com/ocourses/ocots-conventions/blob/main/site.md#web8--les-notations-du-poly-les-opérateurs-en-romain)) :
  $\lambda$ pour la mesure de Lebesgue, $\mathcal B(\mathbb R)$ pour les
  boréliens, $\mathbb 1_A$ pour l'indicatrice, $f_n$ indexée par $n \ge 1$ quand
  le poly le fait ; `\operatorname{card}`, `\operatorname{ess\,sup}`,
  `\mathrm d\mu`. Pour les axes du canevas, on passe des segments
  `[['ln ', false], ['x', true]]`.
- **Renvoi au poly** : le numéro du résultat (« Théorème 5.1.6 »), tel qu'il
  apparaît dans le PDF.
- **Intervalles.** KaTeX prend un crochet `]` ouvrant pour un crochet fermant,
  et espace mal ce qui suit (« ] − ∞ »). Un crochet ouvrant à l'envers s'écrit
  `\mathopen{]}`, un crochet fermant à l'envers `\mathclose{[}` :
  `\mathopen{]}-\infty, t]`, `[y_k, y_{k+1}\mathclose{[}`
  (`tests/intervalles.test.js` le vérifie).
- **Point-virgule dans les listes.** Dès qu'un nombre décimal figure dans une
  liste, un intervalle ou un couple, le séparateur devient le point-virgule,
  pour qu'on ne lise pas $\{2{,}5\}$ comme deux éléments : $[1{,}5\,;\,2{,}5]$,
  $\{2{,}5\,;\,3\}$. Avec des entiers seulement, la virgule reste : $\{2, 5\}$.
  On passe par `separateur` et `latexIntervalle` de `format.js`, jamais par un
  `join(', ')` écrit à la main sur des nombres réels.
- **Nombres qui bougent : une place réservée seulement quand elle sert**
  (complète [WEB5](https://github.com/ocourses/ocots-conventions/blob/main/site.md#web5--une-mise-en-page-qui-ne-bouge-pas-quand-une-valeur-change)) :
  - **le signe** : une grandeur qui peut changer de signe pendant le geste
    garde la place du « − » (`latexNombreFixe`) ; une grandeur positive par
    nature (mesure, aire, intégrale d'une fonction positive, somme de Darboux,
    norme, temps) s'écrit avec `latexPositifFixe` ; une grandeur dont le signe
    ne dépend que du cas choisi, avec `latexNombreFinal` ;
  - **la partie entière** : un nombre suivi de texte, qui peut passer de 9,9 à
    10, réserve la place du plus grand nombre qu'il peut atteindre
    (`entiers = chiffresEntiers(max)`) ; un nombre en fin de phrase ne réserve
    rien. Le trou qu'on voit après un « = » est presque toujours un `entiers`
    trop grand ;
  - pas de notation scientifique : les nombres de ce cours se comparent entre
    eux, au même ordre de grandeur, et « 1,200 » se lit mieux que « 1,2·10⁰ ».
- **Formules importantes en ligne centrée.** Dans « Ce que dit le cours », une
  définition ou une formule qu'on retient s'écrit seule sur sa ligne (`$$…$$`),
  entre deux phrases qui l'introduisent et la commentent :
  `\mu_f(B) = \mu(f^{-1}(B))`. La boîte du cours fait 360 px de large : une
  formule qui déborde se coupe en deux lignes avec `gathered`. Le rendu sans
  erreur KaTeX ni débordement se vérifie à la main (`.katex-error`,
  `scrollWidth`).

## 3. Glossaire ([WEB12](https://github.com/ocourses/ocots-conventions/blob/main/site.md#web12--le-glossaire-du-poly-déclaré-par-chaque-page))

- Les théorèmes nommés (convergence monotone, lemme de Fatou, convergence
  dominée, Fubini-Tonelli, Fubini, changement de variables…) sont au
  glossaire, avec leur énoncé du poly : on écrit leur nom dans le texte plutôt
  que leur seul numéro.
- `tests/glossaire.test.js` vérifie que chaque page déclare tous les termes du
  glossaire présents dans son cours et ses essais (hors formules, en mots
  entiers), et aucun autre. Un terme écrit en LaTeX (`$\sigma$-finie`) n'est pas
  reconnu : on l'écrit en texte (« σ-finie »).

## 4. Mise en page et interactions propres au cours

- **Énoncés à choisir : une liste.** Plus de trois énoncés à choisir se
  présentent un par ligne (`.choix.enonces`), pas à la file.
- **Échelle linéaire ou logarithmique.** Une suite qui converge par ordres de
  grandeur ($x^n$, $2^{-m}$, $2^{-n}$) se lit mieux en échelle logarithmique.
  Les pages à deux suites numériques sous la figure (« Modes de convergence »,
  « Fonctions étagées », « Convergence dominée », « Des suites qui trompent »)
  proposent le choix (`choixEchelle`, préférence d'affichage `echelle`) : les
  valeurs, ou l'écart à la limite en échelle logarithmique, où ce qui ne
  converge pas reste à plat. Les graduations sont des puissances de 10
  (`echelleLog`, `axesLog` de `commun.js`), le niveau 1 est toujours visible,
  et les valeurs nulles, sans logarithme, sont sur une ligne « 0 » à part. Une
  limite infinie garde l'échelle des valeurs.
- **Dire ce que fait le geste** ([WEB14](https://github.com/ocourses/ocots-conventions/blob/main/site.md#web14--plusieurs-moyens-de-régler-une-valeur-dont-le-clavier)).
  Spécifique à ce cours : le bloc se dit par son contenu, pas par son numéro,
  qui peut être renuméroté (« Le point 4 rejoint le bloc {4, 5}. »), et
  l'étiquette écrite à côté d'un point (numéro du bloc, nom de la partie) compte
  comme le point : la cliquer revient à le cliquer (`pointVise` avec `cote`).
- **Une application est définie partout.** Dans un diagramme sagittal, chaque
  point de départ a exactement une flèche : on la redirige, jamais on ne la
  supprime. Une flèche lâchée loin de tout point revient. La légende le dit.
- **Choisir un indice sur la figure.** Une figure dont l'abscisse est un indice
  ($n \mapsto f_n(x)$, $n \mapsto \int f_n$) se clique : un clic ou un glisser
  choisit $n$, comme le curseur (`choisitIndice`, `commun.js`), qui s'arrête si
  l'animation tourne. Le curseur et les flèches ne dépassent jamais le plus
  grand indice du cas choisi (`fixeMax` de `champ`) : un curseur qui va plus
  loin que ce que la page sait dessiner laisse croire qu'elle est bloquée. La
  légende en bulle de la figure le dit.
- **Grille sur les unités.** Pour une suite qui concentre ou qui s'échappe
  (masse concentrée, bosse $\mathbb 1_{[n, n+1]}$), les graduations seules
  cachent ce qui se passe : la figure se rééchelonne avec $f_n$ et la bosse
  semble ne pas bouger. On trace une grille à chaque entier (`grilleUnites`,
  `fonctions.js`), qui reste fixe. On ne repasse en pâle les $f_k$ précédentes
  que si elles montrent quelque chose (la racine : elles montent vers la
  limite).
- **Animation en boucle.** Un indice qui parcourt une suite ($n$ dans $f_n$)
  peut s'animer en boucle, avec une courte pause, et s'active par une case
  « animer ». Toucher au curseur l'arrête.

## 5. Briques propres au cours

- **Fonctions d'une variable.** `js/illustrations/fonctions.js` regroupe le
  tracé d'une fonction (avec ses sauts, sans trait vertical), le remplissage de
  l'aire sous une courbe, les intégrales numériques, l'axe des valeurs infinies
  et la grille sur les unités. Une page qui trace une fonction le reprend.
- **Ensembles finis.** `js/illustrations/ensembles.js` code une partie d'un
  petit ensemble par un masque de bits et une application par le tableau de ses
  images. Il calcule images directes et réciproques, tribus engendrées (par
  leurs atomes), axiomes en défaut, tribus image et image réciproque. Il dessine
  aussi les diagrammes sagittaux : points nommés 1, 2, … dans $E_1$ et a, b, …
  dans $E_2$, étiquettes des parties choisies, et flèches que l'on redirige à la
  souris (`gestesDiagramme`). Une tribu sur un ensemble fini s'y donne par une
  partition, dont un clic change le bloc d'un point (`blocSuivant`). Sur ces
  pages, tout ce qui est affirmé se vérifie exhaustivement sous Node
  (`tests/ensembles.test.js`).
- **Indice et échelle** : `choisitIndice`, `echelleLog`, `axesLog` et
  `choixEchelle`, dans `js/illustrations/commun.js`, après les briques du socle.

## 6. Ordre du catalogue ([WEB16](https://github.com/ocourses/ocots-conventions/blob/main/site.md#web16--le-catalogue-suit-lordre-du-poly))

Pour le chapitre 2, par exemple : tribu engendrée (2.1), image réciproque
(2.1.4), tribus sur un ensemble fini, tribus d'une application, applications
mesurables sur ℝ (2.2), mesure image (2.3.1), suites d'ensembles (2.3.2),
fonction de répartition (2.3.2), ensembles négligeables (2.3.3). Une page qui
couvre deux sections (Riemann contre Lebesgue : 1.1 et 1.3) se place à la
première.

## 7. Avant de livrer ([WEB20](https://github.com/ocourses/ocots-conventions/blob/main/site.md#web20--vérifier-avant-de-livrer))

En plus des vérifications de `WEB20` : relire le relevé des essais
(`node outils/essais.mjs <id>`, voir le README). Chaque essai doit afficher ce
que son texte annonce, verdicts compris : une page sans erreur JavaScript peut
encore contredire son essai.
