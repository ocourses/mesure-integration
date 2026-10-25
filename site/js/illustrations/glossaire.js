// Glossaire des illustrations : les définitions du poly, reprises au plus près
// de leur énoncé (chapitre et définition indiqués dans `source`). Une page
// déclare les termes qu'elle emploie (`termes` dans son module) ; le gabarit
// souligne leur première occurrence dans « Ce que dit le cours » et dans « À
// essayer », et la définition s'affiche en infobulle.
//
// Chaque entrée donne les formes du terme telles qu'elles apparaissent dans les
// textes (casse, accord, apostrophe typographique), de la plus longue à la plus
// courte.

import { souligne } from '../ui/infobulle.js';
import { rendTexte } from '../ui/katex.js';

const MOTIVATIONS = 'Poly, chapitre 1 « Motivations »';
const MESURE = 'Poly, chapitre 2 « Théorie de la mesure »';
const POSITIVES = 'Poly, chapitre 3 « Intégrale de Lebesgue des fonctions mesurables positives »';
const LP = 'Poly, chapitre 4 « Les espaces de Lebesgue »';
const LIMITES = 'Poly, chapitre 5 « Théorèmes limites et applications »';
const PRODUITS = 'Poly, chapitre 6 « Intégration sur les produits »';

export const GLOSSAIRE = {
  tribu: {
    formes: ['tribus', 'tribu'],
    definition:
      'Famille $\\mathcal A$ de parties de $E$ qui contient $E$, est stable par passage au complémentaire et par réunion dénombrable (Définition 2.1.1).',
    source: MESURE,
  },
  atome: {
    formes: ['atomes', 'atome'],
    definition:
      'Pour une tribu finie $\\mathcal A$ sur $E$ : un élément non vide de $\\mathcal A$ qui n’en contient strictement aucun autre. Les atomes forment une partition de $E$ (deux points sont dans le même atome si aucune partie de $\\mathcal A$ ne contient l’un sans l’autre), et les éléments de $\\mathcal A$ sont exactement les réunions d’atomes : avec $k$ atomes, $2^k$ éléments.',
    source: 'Vocabulaire des illustrations : le mot n’est pas employé dans le poly',
  },
  fibre: {
    formes: ['fibres', 'fibre'],
    definition:
      'La fibre de $f$ au-dessus d’un point $y$ est l’image réciproque du singleton, $f^{-1}(\\{y\\}) = \\{x : f(x) = y\\}$ : les points qui ont la même image $y$. Les fibres forment une partition de l’ensemble de départ, et $f^{-1}(B)$ est la réunion des fibres au-dessus des points de $B$.',
    source: 'Vocabulaire des illustrations : le mot n’est pas employé dans le poly',
  },
  'bons ensembles': {
    formes: ['bons ensembles', 'bon ensemble'],
    definition:
      'Principe des bons ensembles : pour $f \\colon (E_1, \\mathcal A_1) \\to E_2$, la famille $\\mathcal G = \\{B \\subset E_2 : f^{-1}(B) \\in \\mathcal A_1\\}$ des « bons » ensembles est une tribu. Si elle contient une famille $\\mathcal C$, elle contient donc $\\sigma(\\mathcal C)$ : il suffit de vérifier la propriété sur les générateurs. C’est la technique qui démontre le critère de mesurabilité sur une famille génératrice.',
    source: 'Vocabulaire des illustrations : le mot n’est pas employé dans le poly (la technique est dans la preuve du Lemme de transport)',
  },
  'tribu engendrée': {
    formes: ['tribu engendrée', 'tribus engendrées'],
    definition:
      'La tribu $\\sigma(\\mathcal C)$ engendrée par une famille $\\mathcal C$ de parties de $E$ est l’intersection de toutes les tribus contenant $\\mathcal C$ : c’est la plus petite tribu sur $E$ qui contient $\\mathcal C$.',
    source: MESURE,
  },
  borélien: {
    formes: ['boréliens', 'borélien', 'tribu de Borel'],
    definition: 'Élément de la tribu de Borel $\\mathcal B(E) = \\sigma(\\mathcal O)$, la tribu engendrée par les ouverts de $E$.',
    source: MESURE,
  },
  'application mesurable': {
    formes: ['application mesurable', 'applications mesurables', 'fonction mesurable', 'fonctions mesurables', 'mesurable'],
    definition:
      '$f \\colon (E_1, \\mathcal A_1) \\to (E_2, \\mathcal A_2)$ est mesurable si $f^{-1}(B) \\in \\mathcal A_1$ pour tout $B \\in \\mathcal A_2$, c’est-à-dire $f^{-1}(\\mathcal A_2) \\subset \\mathcal A_1$.',
    source: MESURE,
  },
  mesure: {
    formes: ['mesures', 'mesure'],
    definition:
      'Application $\\mu \\colon \\mathcal A \\to [0, +\\infty]$ telle que $\\mu(\\emptyset) = 0$ et $\\mu(\\bigcup_n A_n) = \\sum_n \\mu(A_n)$ pour des $A_n$ deux à deux disjoints ($\\sigma$-additivité, Définition 2.3.1).',
    source: MESURE,
  },
  'mesure de Dirac': {
    formes: ['mesure de Dirac', 'mesures de Dirac', 'masse de Dirac', 'masses de Dirac'],
    definition: '$\\delta_a(A) = 1$ si $a \\in A$, $0$ sinon (Exemple 2.3.1) : toute la masse est au point $a$. C’est une mesure de probabilité.',
    source: MESURE,
  },
  'mesure de comptage': {
    formes: ['mesure de comptage'],
    definition: '$\\operatorname{card}(A)$, le nombre d’éléments de $A$ ($+\\infty$ si $A$ est infini). Sur $\\mathbb N$, c’est $\\sum_n \\delta_n$, et l’intégrale par rapport à elle est la somme d’une série (Exemple 3.3.2).',
    source: MESURE,
  },
  'mesure de Lebesgue': {
    formes: ['mesure de Lebesgue'],
    definition:
      'L’unique mesure $\\lambda$ sur les boréliens de $\\mathbb R^d$ qui donne à tout pavé $\\prod_i\\, \\mathopen{]}a_i, b_i\\mathclose{[}$ la mesure $\\prod_i (b_i - a_i)$ (Théorème 2.3.6) : la longueur, l’aire, le volume.',
    source: MESURE,
  },
  'fonction de répartition': {
    formes: ['fonction de répartition', 'fonctions de répartition'],
    definition:
      'Pour une probabilité $p$ sur $\\mathcal B(\\mathbb R)$, $F(t) = p(\\mathopen{]}-\\infty, t])$. Elle est croissante, continue à droite, de limites $0$ en $-\\infty$ et $1$ en $+\\infty$, et détermine $p$.',
    source: MESURE,
  },
  'fonction étagée': {
    formes: ['fonctions étagées', 'fonction étagée', 'étagées', 'étagée'],
    definition: 'Fonction mesurable qui ne prend qu’un nombre fini de valeurs. Si elle est positive, $\\int_E f \\,\\mathrm d\\mu = \\sum_{\\alpha \\in f(E)} \\alpha\\, \\mu(f^{-1}(\\{\\alpha\\}))$, avec $0 \\times \\infty = 0$.',
    source: POSITIVES,
  },
  intégrable: {
    formes: ['intégrables', 'intégrable'],
    definition:
      'Une fonction mesurable $f$ est intégrable si $\\int_E |f| \\,\\mathrm d\\mu < +\\infty$, c’est-à-dire si $f^+$ et $f^-$ ont toutes deux une intégrale finie.',
    source: LP,
  },
  négligeable: {
    formes: ['ensembles négligeables', 'ensemble négligeable', 'négligeables', 'négligeable'],
    definition: 'Un ensemble $A \\in \\mathcal A$ est négligeable si $\\mu(A) = 0$.',
    source: LP,
  },
  'presque partout': {
    formes: ['presque partout', 'p.p.'],
    definition:
      'Une propriété $P(x)$ est vraie $\\mu$-presque partout si l’ensemble des $x$ où elle est fausse est contenu dans un ensemble négligeable.',
    source: LP,
  },
  'borne supérieure essentielle': {
    formes: ['borne supérieure essentielle'],
    definition: '$\\operatorname{ess\\,sup} f = \\inf\\{a \\in \\mathbb R : \\mu(\\{f > a\\}) = 0\\}$ : la borne supérieure de $f$ quand on ignore les ensembles négligeables.',
    source: LP,
  },
  norme: {
    formes: ['normes', 'norme'],
    definition:
      'Application $N \\colon F \\to [0, +\\infty\\mathclose{[}$ qui vérifie la séparation ($N(u) = 0 \\Leftrightarrow u = 0$), l’absolue homogénéité ($N(\\lambda u) = |\\lambda| N(u)$) et l’inégalité triangulaire ($N(u + v) \\le N(u) + N(v)$).',
    source: LP,
  },
  'convergence presque partout': {
    formes: ['converge presque partout', 'convergence presque partout'],
    definition: '$(f_n)$ converge $\\mu$-presque partout vers $f$ s’il existe un ensemble négligeable $A$ tel que $f_n(x) \\to f(x)$ pour tout $x \\notin A$.',
    source: LIMITES,
  },
  'tribu produit': {
    formes: ['tribu produit'],
    definition: 'La tribu $\\mathcal A_1 \\otimes \\mathcal A_2$ engendrée par les rectangles $A_1 \\times A_2$, avec $A_i \\in \\mathcal A_i$.',
    source: PRODUITS,
  },
  'σ-finie': {
    formes: ['σ-finies', 'σ-finie', 'σ-finis'],
    definition: 'Une mesure $\\mu$ est $\\sigma$-finie si $E$ est réunion d’une suite d’ensembles mesurables de mesures finies. La mesure de Lebesgue l’est, la mesure de comptage sur $[0, 1]$ ne l’est pas.',
    source: MESURE,
  },
  'matrice jacobienne': {
    formes: ['matrice jacobienne', 'jacobien'],
    definition:
      'La matrice $J_\\phi(u)$ des dérivées partielles $\\partial \\phi_i / \\partial u_j$. Son déterminant, en valeur absolue, mesure la dilatation des volumes par $\\phi$ au voisinage de $u$.',
    source: PRODUITS,
  },

  // ---- Chapitre 1 ----------------------------------------------------------------------
  'sommes de Darboux': {
    formes: ['sommes de Darboux', 'somme de Darboux'],
    definition:
      'Pour une subdivision $\\Delta$ de $[a, b]$, la somme inférieure $S_\\Delta(f)$ (resp. supérieure $S^\\Delta(f)$) est l’intégrale de la fonction en escalier qui vaut, sur chaque morceau, la borne inférieure (resp. supérieure) de $f$.',
    source: MOTIVATIONS,
  },
  'Riemann-intégrable': {
    formes: ['Riemann-intégrables', 'Riemann-intégrable', 'intégrale de Riemann'],
    definition:
      'Une fonction bornée $f$ sur $[a, b]$ est Riemann-intégrable si $\\sup_\\Delta S_\\Delta(f) = \\inf_\\Delta S^\\Delta(f)$ ; cette valeur commune est son intégrale de Riemann.',
    source: MOTIVATIONS,
  },
  'fonction de Dirichlet': {
    formes: ['fonction de Dirichlet'],
    definition: '$\\mathbb 1_{\\mathbb Q \\cap [0, 1]}$ : elle vaut $1$ en un rationnel, $0$ ailleurs. Ses sommes de Darboux valent $0$ et $1$ pour toute subdivision : elle n’est pas Riemann-intégrable (Exemple 1.2.1). Son intégrale de Lebesgue est $0$.',
    source: MOTIVATIONS,
  },

  // ---- Chapitre 2 ----------------------------------------------------------------------
  'espace mesurable': {
    formes: ['espaces mesurables', 'espace mesurable'],
    definition: 'Un couple $(E, \\mathcal A)$ formé d’un ensemble et d’une tribu sur cet ensemble ; les éléments de $\\mathcal A$ sont les ensembles mesurables.',
    source: MESURE,
  },
  'espace mesuré': {
    formes: ['espaces mesurés', 'espace mesuré'],
    definition: 'Un triplet $(E, \\mathcal A, \\mu)$ : un espace mesurable muni d’une mesure.',
    source: MESURE,
  },
  'tribu grossière': {
    formes: ['tribu grossière'],
    definition: 'La plus petite tribu sur $E$, $\\{\\emptyset, E\\}$. Les seules fonctions mesurables à valeurs réelles sont alors les constantes.',
    source: MESURE,
  },
  'tribu discrète': {
    formes: ['tribu discrète'],
    definition: 'La plus grande tribu sur $E$, $\\mathcal P(E)$. Toute application définie sur $E$ est alors mesurable.',
    source: MESURE,
  },
  'probabilité': {
    formes: ['mesures de probabilité', 'mesure de probabilité', 'probabilités', 'probabilité'],
    definition: 'Une mesure $\\mu$ telle que $\\mu(E) = 1$ (Définition 2.3.3).',
    source: MESURE,
  },
  'image réciproque': {
    formes: ['images réciproques', 'image réciproque'],
    definition:
      'Pour $f \\colon E_1 \\to E_2$ et $B \\subset E_2$, $f^{-1}(B) := \\{x \\in E_1 \\mid f(x) \\in B\\}$. C’est un ensemble défini par $f$, $E_1$ et $B$ : il ne fait pas intervenir l’application réciproque $f^{-1}$, qui n’est pas nécessairement définie (note 4 du chapitre 2).',
    source: MESURE,
  },
  'formules de Hausdorff': {
    formes: ['formules de Hausdorff'],
    definition:
      'Pour tout $B \\subset E_2$ et toute famille $(B_i)_{i \\in I}$ : $(f^{-1}(B))^c = f^{-1}(B^c)$, $f^{-1}(\\bigcup_i B_i) = \\bigcup_i f^{-1}(B_i)$ et $f^{-1}(\\bigcap_i B_i) = \\bigcap_i f^{-1}(B_i)$ (Exercice 2.1.3).',
    source: MESURE,
  },
  'tribu image réciproque': {
    formes: ['tribu image réciproque', 'tribus images réciproques'],
    definition:
      'Si $\\mathcal A_2$ est une tribu sur $E_2$, $f^{-1}(\\mathcal A_2) := \\{f^{-1}(B) \\mid B \\in \\mathcal A_2\\}$ est une tribu sur $E_1$ (Proposition 2.1.10) : la plus petite qui rend $f$ mesurable.',
    source: MESURE,
  },
  'tribu image': {
    formes: ['tribu image', 'tribus images'],
    definition:
      'Si $\\mathcal A_1$ est une tribu sur $E_1$, $\\{B \\subset E_2 \\mid f^{-1}(B) \\in \\mathcal A_1\\}$ est une tribu sur $E_2$ (Proposition 2.1.11) : la plus grande qui rend $f$ mesurable. Ce n’est pas $f(\\mathcal A_1) = \\{f(A) \\mid A \\in \\mathcal A_1\\}$, qui n’est en général pas une tribu (Remarque 2.1.5).',
    source: MESURE,
  },
  'lemme de transport': {
    formes: ['lemme de transport'],
    definition:
      'Pour toute application $f \\colon E_1 \\to E_2$ et toute famille $\\mathcal C \\subset \\mathcal P(E_2)$, $\\sigma(f^{-1}(\\mathcal C)) = f^{-1}(\\sigma(\\mathcal C))$ (Théorème 2.1.12) : engendrer une tribu et prendre une image réciproque commutent.',
    source: MESURE,
  },
  'mesure image': {
    formes: ['mesures images', 'mesure image'],
    definition:
      'Pour $f \\colon (E_1, \\mathcal A_1) \\to (E_2, \\mathcal A_2)$ mesurable et $\\mu$ une mesure sur $\\mathcal A_1$, $\\mu_f(B) := \\mu(f^{-1}(B))$ pour $B \\in \\mathcal A_2$ (Définition 2.3.4) ; c’est une mesure sur $(E_2, \\mathcal A_2)$ (Exercice 2.3.3). En probabilités, c’est la loi d’une variable aléatoire (Remarque 2.3.3).',
    source: MESURE,
  },
  'ensemble de Cantor': {
    formes: ['ensemble de Cantor'],
    definition:
      '$C = \\bigcap_n C_n$, où $C_0 = [0, 1]$ et $C_{n+1}$ s’obtient en retirant le tiers central ouvert de chaque intervalle de $C_n$. C’est un borélien de mesure nulle, non dénombrable.',
    source: MESURE,
  },

  // ---- Théorèmes ------------------------------------------------------------------------
  'convergence monotone': {
    formes: ['théorème de convergence monotone', 'convergence monotone', 'théorème de Beppo-Levi', 'Beppo-Levi'],
    definition:
      'Si $(f_n)$ est une suite croissante de fonctions mesurables positives qui converge (presque partout) vers $f$, alors $\\int f \\,\\mathrm d\\mu = \\lim_n \\int f_n \\,\\mathrm d\\mu$, limite finie ou non (Théorèmes 3.3.1 et 5.1.5).',
    source: LIMITES,
  },
  'lemme de Fatou': {
    formes: ['lemme de Fatou'],
    definition: 'Pour toute suite $(f_n)$ de fonctions mesurables positives, $\\int \\liminf_n f_n \\,\\mathrm d\\mu \\le \\liminf_n \\int f_n \\,\\mathrm d\\mu$ (Proposition 3.3.6).',
    source: POSITIVES,
  },
  'convergence dominée': {
    formes: ['théorème de convergence dominée', 'convergence dominée'],
    definition:
      'Si $f_n \\to f$ presque partout et $|f_n| \\le g$ presque partout pour tout $n$, avec $g$ intégrable, alors $f$ est intégrable, $\\|f_n - f\\|_1 \\to 0$ et $\\int f_n \\,\\mathrm d\\mu \\to \\int f \\,\\mathrm d\\mu$ (Théorème 5.1.6).',
    source: LIMITES,
  },
  'continuité sous l’intégrale': {
    formes: ['Continuité sous l’intégrale', 'continuité sous l’intégrale'],
    definition:
      'Si $u \\mapsto f(u, x)$ est continue pour presque tout $x$ et si $|f(u, x)| \\le g(x)$ pour tout $u$, avec $g$ intégrable, alors $F(u) = \\int f(u, x) \\,\\mathrm d\\mu(x)$ est continue (Corollaire 5.3.2).',
    source: LIMITES,
  },
  'dérivation sous l’intégrale': {
    formes: ['Dérivation sous l’intégrale', 'dérivation sous l’intégrale', 'dérive sous l’intégrale', 'dériver sous l’intégrale'],
    definition:
      'Si $u \\mapsto f(u, x)$ est dérivable et si, sur tout segment $[a, b]$, $|\\partial f/\\partial u| \\le g_{a,b}$ avec $g_{a,b}$ intégrable, alors $F$ est dérivable et $F’(u) = \\int \\partial f/\\partial u(u, x) \\,\\mathrm d\\mu(x)$ (Corollaire 5.3.5).',
    source: LIMITES,
  },
  'Fubini-Tonelli': {
    formes: ['Fubini-Tonelli', 'Tonelli'],
    definition:
      'Pour $f \\ge 0$ mesurable sur un produit d’espaces σ-finis, $\\int \\phi \\,\\mathrm d\\mu_1 = \\int f \\,\\mathrm d(\\mu_1 \\otimes \\mu_2) = \\int \\psi \\,\\mathrm d\\mu_2$, où $\\phi(x) = \\int f(x, y) \\,\\mathrm d\\mu_2(y)$ et $\\psi(y) = \\int f(x, y) \\,\\mathrm d\\mu_1(x)$, valeur commune dans $[0, +\\infty]$ (Théorème 6.2.1).',
    source: PRODUITS,
  },
  Fubini: {
    formes: ['théorème de Fubini', 'Fubini'],
    definition:
      'Fubini-Lebesgue : même conclusion que Fubini-Tonelli pour $f$ de signe quelconque, à condition que $f$ soit intégrable pour $\\mu_1 \\otimes \\mu_2$ ; on le vérifie en appliquant Fubini-Tonelli à $|f|$ (Théorème 6.2.2).',
    source: PRODUITS,
  },
  'changement de variables': {
    formes: ['Changement de variables', 'changement de variables'],
    definition:
      'Si $\\phi \\colon U \\to V$ est un $\\mathcal C^1$-difféomorphisme entre ouverts de $\\mathbb R^d$ et $f \\ge 0$ borélienne sur $V$, alors $\\int_V f \\,\\mathrm d\\lambda = \\int_U (f \\circ \\phi)\\, |\\det J_\\phi| \\,\\mathrm d\\lambda$ (Théorème 6.3.4).',
    source: PRODUITS,
  },
  difféomorphisme: {
    formes: ['difféomorphisme'],
    definition: 'Un $\\mathcal C^1$-difféomorphisme $\\phi \\colon U \\to V$ est une bijection de classe $\\mathcal C^1$ dont la réciproque est aussi de classe $\\mathcal C^1$.',
    source: PRODUITS,
  },

};

// Contenu d'une infobulle de glossaire : le terme, sa définition, sa source.
function bulle(cle) {
  const { definition, source } = GLOSSAIRE[cle];
  return () => {
    const div = document.createElement('div');
    const titre = document.createElement('p');
    titre.className = 'titre-bulle';
    titre.textContent = cle[0].toUpperCase() + cle.slice(1);
    const corps = document.createElement('p');
    corps.className = 'corps-bulle';
    rendTexte(corps, definition);
    const origine = document.createElement('p');
    origine.className = 'source-bulle';
    origine.textContent = source;
    div.append(titre, corps, origine);
    return div;
  };
}

// Souligne dans `racine` la première occurrence de chacun des termes `cles`
// du glossaire. Les termes les plus longs passent d'abord, pour que « nœud
// engendrée » ne soit pas pris pour « tribu ».
export function appliqueGlossaire(racine, cles) {
  const tries = [...cles].sort((a, b) => Math.max(...GLOSSAIRE[b].formes.map((f) => f.length)) - Math.max(...GLOSSAIRE[a].formes.map((f) => f.length)));
  for (const cle of tries) {
    if (!GLOSSAIRE[cle]) throw new Error(`Terme absent du glossaire : ${cle}`);
    souligne(racine, GLOSSAIRE[cle].formes, bulle(cle));
  }
}
