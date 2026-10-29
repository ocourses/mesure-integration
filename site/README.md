# Mesure et intégration : explorer le cours

Site web statique d'illustrations interactives du cours de mesure et
intégration : chaque page reprend un résultat ou un exemple du poly ou d'un TD,
et le fait manipuler. On choisit une fonction, un paramètre, une mesure, un
point, en cliquant ou en faisant glisser sur la figure, et l'on regarde ce que
deviennent les ensembles et les intégrales.

Le site est construit sur le socle commun des sites de cours,
[`ocots-site`](https://github.com/ocourses/ocots-site), en sous-module dans
`socle/` et épinglé sur un tag : gabarits, feuille de style, briques, moteur du
glossaire et CI viennent de lui. Le cours n'écrit que ce qui le distingue :
`site.config.js`, ses illustrations, son catalogue, son glossaire et
`css/cours.css`. Les conventions sont celles de
[`site.md`](https://github.com/ocourses/ocots-conventions/blob/main/site.md),
plus les arbitrages du cours ([`CONVENTIONS.md`](CONVENTIONS.md)).

## Un site pour explorer le cours

L'accueil (`index.html`) est une **carte du cours**, organisée par chapitre dans
l'ordre du poly. Les pages se suivent dans cet ordre (« Page suivante → »).

| Chapitre | Illustrations |
|---|---|
| 1. Motivations | Riemann contre Lebesgue ; des suites qui trompent |
| 2. Théorie de la mesure (TD1) | tribus sur un ensemble fini ; construire une mesure sur $\mathbb R$ ; négligeable, et pourtant partout |
| 3. Fonctions mesurables positives (TD2) | approcher par des fonctions étagées ; sommer une série, c'est intégrer |
| 4. Espaces de Lebesgue (annexe A) | quand $x^{-a}$ est-elle dans $L^p$ ? ; boules unités ; modes de convergence |
| 5. Théorèmes limites (TD3) | convergence dominée ; impropre mais pas intégrable ; intégrale à paramètre |
| 6. Produits (TD4) | Fubini par tranches ; coordonnées polaires |

Toutes les illustrations suivent le même **gabarit** (`illustration.html?id=…`) :
« Ce que dit le cours » (le résultat, avec le renvoi au poly ou au TD),
l'illustration, et « À essayer », des questions guidées dont certaines règlent
l'illustration d'un clic. Les réglages sont dans l'URL, pour partager une
expérience. Les animations respectent `prefers-reduced-motion`.

## Lancer le site

Aucune étape de construction : le site est fait de modules JavaScript servis
tels quels. KaTeX est chargé depuis un CDN.

```bash
git submodule update --init   # une fois après le clone : le socle (site/socle/)
cd site
npm run serve        # http://localhost:8000/ (sans cache)
npm test             # tests du cours et du socle, sous Node
```

Le relevé des essais clique chaque « Essayer » et écrit, sous le texte de
l'essai, les verdicts que la page affiche. Il demande Chrome et
`playwright-core`, installé sans l'ajouter aux dépendances :

```bash
npm install --no-save playwright-core
node outils/essais.mjs                  # toutes les pages, serveur sur le port 8000
node outils/essais.mjs series --captures /tmp/essais
```

## Ajouter une illustration

Avant d'écrire ou de reprendre une illustration, lire
[`CONVENTIONS.md`](CONVENTIONS.md) : mise en page, typographie, rôle des
couleurs, ce qui va dans l'URL ou dans le navigateur, interactions et
vérifications. La page de référence est « Riemann contre Lebesgue ».

Un module `js/illustrations/<id>.js` exporte par défaut
`{ etat, rappel, essais, monte(zone, outils) }`, et au besoin `preferences`,
`choix` et `termes` :

- `etat` : les réglages par défaut (nombres, textes ou booléens), gardés dans l'URL ;
- `rappel` : les paragraphes du cours, avec des formules `$…$` (ou `$$…$$`
  pour une formule centrée) ; un élément qui est un tableau de textes devient
  une liste à puces ;
- `essais` : `{ texte, etat?, preferences? }` ; avec `etat`, un bouton
  « Essayer » applique ce réglage ;
- `preferences` : les préférences d'affichage par défaut, gardées dans le
  navigateur (clé `mesure-integration.illustration.<id>`) ;
- `termes` : les termes du glossaire employés par la page ; leur première
  occurrence est soulignée, avec la définition du poly en infobulle ;
- `choix` : les valeurs permises des réglages textuels ;
- `monte(zone, outils)` construit l'illustration dans `zone` et renvoie
  `{ applique() }`, appelé après un « Essayer ».

Les briques communes viennent du socle par `js/illustrations/commun.js`
(cartes, canevas, légendes en bulle, choix par boutons radio, glisser à la
souris, zoom), qui garde aussi ce qui n'appartient qu'au cours (indice choisi
sur une figure, échelle logarithmique) ;
`js/illustrations/fonctions.js` (intégrales numériques, graphe avec sauts,
aire, fonctions en escalier, ensembles de niveau),
`js/illustrations/ensembles.js` (ensembles finis : parties, images directes
et réciproques, tribus, et diagrammes sagittaux dont on glisse les
flèches), `socle/js/ui/controls.js`
(champs : curseur, boîte de nombre à flèches ▲ ▼, saisie), `socle/js/ui/repere.js`
(repère 2D) et `js/illustrations/glossaire.js` (définitions du poly). On
déclare enfin l'illustration dans `js/illustrations/catalogue.js`. Les
fonctions mathématiques de chaque module sont exportées et testées sous Node
contre le poly ou le TD (`tests/`).

## Publication

Le site est copié dans le dépôt étudiant
[`ocourses/mesure-integration`](https://github.com/ocourses/mesure-integration)
(dossier `site/`) et servi par GitHub Pages à l'adresse
<https://ocourses.github.io/mesure-integration/>. La copie se fait **par PR**,
avec `scripts/publier-etudiant` : `site/` y est déclaré en **miroir** dans
`publication.toml`, donc un fichier supprimé ou renommé ici disparaît aussi
là-bas. Les fichiers du socle y sont copiés (`ocots-publication` ≥ v1.2.0),
sans ses outils ni sa documentation. Ne jamais modifier le dossier côté
étudiant à la main. Le workflow `etudiant/.github/workflows/site.yml`, publié
avec le site, appelle celui du socle (épinglé sur le même tag) : `npm test`,
puis déploiement à chaque fusion sur `main` qui touche `site/`.
