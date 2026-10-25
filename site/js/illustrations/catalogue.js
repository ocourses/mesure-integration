// Carte du cours : les thèmes, dans l'ordre des chapitres du poly, et leurs
// illustrations. `disponible` indique qu'un module js/illustrations/<id>.js
// existe ; les autres sont annoncées sur la page d'accueil.

export const themes = [
  {
    id: 'motivations',
    titre: 'Motivations',
    source: 'Poly, chapitre 1',
    illustrations: [
      {
        id: 'riemann-lebesgue',
        titre: 'Riemann contre Lebesgue',
        resume: 'Découper l’axe des abscisses ou celui des valeurs : sommes de Darboux, ensembles {y ≤ f < y′} et fonction de Dirichlet.',
        source: 'Poly, sections 1.1 et 1.3',
        disponible: true,
      },
      {
        id: 'suites-trompeuses',
        titre: 'Des suites qui trompent',
        resume: 'La suite converge en chaque point, l’intégrale ne suit pas : la masse se concentre, s’échappe ou s’aplatit.',
        source: 'Poly, section 1.2 ; Exemples 1.2.3 et 3.3.1, Proposition 3.3.6',
        disponible: true,
      },
    ],
  },
  {
    id: 'mesure',
    titre: 'Théorie de la mesure',
    source: 'Poly, chapitre 2 ; TD1',
    illustrations: [
      {
        id: 'engendrer',
        titre: 'Engendrer une tribu',
        resume: 'Les 32 parties d’un ensemble à cinq points : ajouter complémentaires et réunions jusqu’à σ(𝒞), et reconnaître une tribu à sa symétrie.',
        source: 'Poly, section 2.1 ; Exemples 2.1.2 et 2.1.3',
        disponible: true,
      },
      {
        id: 'image-reciproque',
        titre: 'L’image réciproque',
        resume: 'Rediriger les flèches d’une application et voir f⁻¹(B) et f(A) ; les formules de Hausdorff, et les égalités qui échouent pour les images directes.',
        source: 'Poly, section 2.1.4 ; Exercice 2.1.3',
        disponible: true,
      },
      {
        id: 'tribu-finie',
        titre: 'Tribus sur un ensemble fini',
        resume: 'Choisir des parties génératrices et voir les atomes de la tribu engendrée ; une application est mesurable si elle est constante sur les atomes.',
        source: 'Poly, sections 2.1 et 2.2',
        disponible: true,
      },
      {
        id: 'tribus-application',
        titre: 'Les tribus d’une application',
        resume: 'Des partitions comme tribus : f est mesurable si les flèches d’un bloc arrivent dans un même bloc ; tribu image, f(𝒜₁), et la vérification par générateurs.',
        source: 'Poly, sections 2.1.4 et 2.2 ; Proposition 2.2.3',
        disponible: true,
      },
      {
        id: 'images-reelles',
        titre: 'Lire une image réciproque sur ℝ',
        resume: 'Faire glisser des niveaux et lire f⁻¹(B) sur le graphe : un intervalle, une fonction croissante, un sup, la comparaison de deux fonctions par les rationnels.',
        source: 'Poly, section 2.2 ; Exemple 2.2.4, Proposition 2.2.6 ; TD1, exercice 1',
        disponible: true,
      },
      {
        id: 'mesure-image',
        titre: 'La mesure image : la loi d’un dé',
        resume: 'Deux dés et une variable X : choisir B sur la loi, voir X⁻¹(B) dans les 36 issues, réunion de fibres ; la loi d’une indicatrice.',
        source: 'Poly, Définition 2.3.4 ; Remarque 2.3.3',
        disponible: true,
      },
      {
        id: 'suites-ensembles',
        titre: 'Suites d’ensembles',
        resume: 'Lire 𝟙_{Aₙ}(x) point par point : limites inférieure et supérieure, convergence d’une suite d’ensembles, continuité de la mesure pour les suites monotones, et l’inégalité de Fatou pour les ensembles.',
        source: 'Poly, Proposition 2.3.5, Exemple 2.3.5 ; Remarque 3.3.3',
        disponible: true,
      },
      {
        id: 'repartition',
        titre: 'Construire une mesure sur ℝ',
        resume: 'Poser des masses de Dirac et une densité, mesurer un intervalle, lire la fonction de répartition et ses sauts.',
        source: 'Poly, section 2.3 ; TD1, exercice 3 ; TD2, exercice 2',
        disponible: true,
      },
      {
        id: 'negligeables',
        titre: 'Négligeable, et pourtant partout',
        resume: 'Recouvrir les rationnels par des intervalles de longueur totale ε ; l’ensemble de Cantor, non dénombrable et de mesure nulle.',
        source: 'Poly, section 2.3.3',
        disponible: true,
      },
    ],
  },
  {
    id: 'positives',
    titre: 'Intégrale des fonctions mesurables positives',
    source: 'Poly, chapitre 3 ; TD2',
    illustrations: [
      {
        id: 'etagees',
        titre: 'Approcher par des fonctions étagées',
        resume: 'La suite fₙ du Théorème 3.2.1 monte vers f, et son intégrale aussi : Beppo-Levi.',
        source: 'Poly, sections 3.2 et 3.3 ; Figure 3.1',
        disponible: true,
      },
      {
        id: 'series',
        titre: 'Sommer une série, c’est intégrer',
        resume: 'La mesure de comptage sur ℕ ; réordonner la série harmonique alternée pour lui faire atteindre n’importe quelle valeur.',
        source: 'Poly, Exemples 3.3.2 et 4.1.1',
        disponible: true,
      },
    ],
  },
  {
    id: 'lp',
    titre: 'Les espaces de Lebesgue',
    source: 'Poly, chapitre 4 ; annexe A',
    illustrations: [
      {
        id: 'modes-convergence',
        titre: 'Modes de convergence',
        resume: 'Simple, presque partout, dans L¹ : la machine à écrire converge dans L¹ et en aucun point ; une sous-suite converge presque partout.',
        source: 'Poly, section 4.2 ; annexe A.3',
        disponible: true,
      },
      {
        id: 'puissances-lp',
        titre: 'Quand 1/xᵃ est-elle dans Lᵖ ?',
        resume: 'Un point dans le plan (a, p) : intégrabilité de |f|ᵖ près de 0 et à l’infini, et les inclusions entre les Lᵖ.',
        source: 'Poly, section 4.4 ; Exemple 4.4.1',
        disponible: true,
      },
      {
        id: 'boules-lp',
        titre: 'Boules unités et inégalité triangulaire',
        resume: 'La boule unité de ℓᵖ dans ℝ² selon p ; pour p < 1, elle n’est plus convexe et l’inégalité triangulaire tombe.',
        source: 'Poly, section 4.4',
        disponible: true,
      },
    ],
  },
  {
    id: 'limites',
    titre: 'Théorèmes limites et applications',
    source: 'Poly, chapitre 5 ; TD3, TD4',
    illustrations: [
      {
        id: 'convergence-dominee',
        titre: 'Convergence dominée',
        resume: 'La meilleure dominante est l’enveloppe supₙ |fₙ| : le théorème s’applique si et seulement si elle est intégrable.',
        source: 'Poly, Théorème 5.1.6 ; TD3, exercice 5 ; TD2, exercice 5',
        disponible: true,
      },
      {
        id: 'sinus-cardinal',
        titre: 'Impropre mais pas intégrable',
        resume: 'sin x / x : l’intégrale impropre converge, l’intégrale de la valeur absolue diverge.',
        source: 'Poly, Exemple 5.2.2',
        disponible: true,
      },
      {
        id: 'parametre',
        titre: 'Intégrale à paramètre',
        resume: 'F(t) = ∫ e⁻ᵗˣ / (1 + x²) dx : dominer sur [a, +∞[ pour dériver, et ce qui se passe en t = 0.',
        source: 'Poly, section 5.3 ; TD4, exercices 1 et 2',
        disponible: true,
      },
    ],
  },
  {
    id: 'produits',
    titre: 'Intégration sur les produits',
    source: 'Poly, chapitre 6 ; TD4',
    illustrations: [
      {
        id: 'fubini',
        titre: 'Fubini par tranches',
        resume: 'Intégrer tranche par tranche, verticalement ou horizontalement : les bornes de chaque tranche, et les deux ordres.',
        source: 'Poly, section 6.2 ; TD4, exercice 3',
        disponible: true,
      },
      {
        id: 'polaires',
        titre: 'Coordonnées polaires',
        resume: 'Un petit rectangle (r, θ) et son image : le jacobien r mesure la dilatation des aires ; l’intégrale de Gauss.',
        source: 'Poly, section 6.3',
        disponible: true,
      },
    ],
  },
];

export function trouve(id) {
  for (const theme of themes) {
    const illustration = theme.illustrations.find((i) => i.id === id);
    if (illustration) return { theme, illustration };
  }
  return null;
}
