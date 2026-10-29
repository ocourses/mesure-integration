// Quand x^{−a} est-elle dans L^p ? (poly, section 4.4 ; Exemple 4.4.1). Un
// point dans le plan (a, p), comme le plan (tr, det) du site d'automatique :
// |f|^p = x^{−ap} est intégrable près de 0 si ap < 1, à l'infini si ap > 1.
// Le point se colle exactement à l'hyperbole ap = 1, frontière des deux régimes.

import { latexNombre, latexPositifFixe as nb } from '../../socle/js/ui/format.js';
import { Repere } from '../../socle/js/ui/repere.js';
import { couleurs } from '../../socle/js/ui/theme.js';
import { barreOutils, boutonInfo, carte, choixRadios, glisse, paragraphe, toile, verdict } from './commun.js';
import { aire, traceFonction } from './fonctions.js';

export const DOMAINES = {
  zero: { vue: [0, 1.05] },
  infini: { vue: [0, 8] },
  tout: { vue: [0, 4] },
};
const LATEX_DOMAINE = { zero: '\\mathopen{]}0, 1]', infini: '[1, +\\infty\\mathclose{[}', tout: '\\mathopen{]}0, +\\infty\\mathclose{[}' };

// ∫ x^{−s} dx sur le domaine, pour s = ap ≥ 0 : finie ou +∞.
export function integralePuissance(domaine, s) {
  if (domaine === 'zero') return s < 1 ? 1 / (1 - s) : Infinity;
  if (domaine === 'infini') return s > 1 ? 1 / (s - 1) : Infinity;
  return Infinity; // ]0, 1] et [1, +∞[ ne peuvent converger ensemble
}

// Ensemble des p > 0 tels que x^{−a} ∈ L^p, sous forme { min, max, ouvert } :
// ]0, 1/a[ près de 0, ]1/a, +∞[ à l'infini (a > 0).
export function exposantsPermis(domaine, a) {
  if (domaine === 'tout') return null;
  if (a <= 0) return domaine === 'zero' ? { min: 0, max: Infinity } : null;
  return domaine === 'zero' ? { min: 0, max: 1 / a } : { min: 1 / a, max: Infinity };
}

// Le produit s = ap. Sur l'hyperbole, p = 1/a est arrondi et a · (1/a) peut
// valoir 0,9999999999999999 (a = 0,95) : on ramène ce cas à s = 1, sans quoi
// la frontière, où l'intégrale diverge, passerait du côté convergent.
export function produit(a, p) {
  const s = a * p;
  return Math.abs(s - 1) < 1e-9 ? 1 : s;
}

// Point du plan visé à la souris, avec aimantation : sur l'hyperbole ap = 1
// (p = 1/a exactement) si le point en est à moins de `tol` (distance en
// coordonnées réduites), sinon sur la grille de pas 0,05.
export function pointDuPlan(a, p, tolA, tolP) {
  a = Math.min(3, Math.max(0.05, a));
  p = Math.min(4, Math.max(0.1, p));
  const surHyperbole = Math.abs(p - 1 / a) / tolP < 1 || Math.abs(a - 1 / p) / tolA < 1;
  if (surHyperbole) {
    const ar = Math.round(a * 20) / 20;
    return { a: ar, p: 1 / ar };
  }
  return { a: Math.round(a * 20) / 20, p: Math.round(p * 20) / 20 };
}

export default {
  etat: { domaine: 'infini', a: 1, p: 1.5 },

  choix: { domaine: Object.keys(DOMAINES) },

  termes: ['application mesurable', 'mesure de Lebesgue', 'intégrable', 'mesure', 'norme'],

  rappel: [
    'Pour $0 < p < +\\infty$, $L^p$ est l’ensemble des (classes de) fonctions mesurables $f$ telles que $|f|^p$ soit intégrable, avec',
    '$$\\|f\\|_p = \\Big(\\int |f|^p \\,\\mathrm d\\mu\\Big)^{1/p},$$',
    'une norme pour $p \\ge 1$.',
    'Pour la mesure de Lebesgue et $f(x) = x^{-a}$, $|f|^p = x^{-ap}$, et tout se joue sur le produit $ap$ :',
    [
      'sur $\\mathopen{]}0, 1]$, $\\int_0^1 x^{-ap}\\,\\mathrm dx < +\\infty$ si et seulement si $ap < 1$ : une singularité en $0$ se paie avec un petit $p$ ;',
      'sur $[1, +\\infty\\mathclose{[}$, $\\int_1^{+\\infty} x^{-ap}\\,\\mathrm dx < +\\infty$ si et seulement si $ap > 1$ : une décroissance lente se rattrape avec un grand $p$.',
    ],
    'Ainsi $1/x$ est dans $L^p([1, +\\infty\\mathclose{[})$ pour tout $p > 1$, mais pas dans $L^1$ (Exemple 4.4.1). Il n’y a donc pas d’inclusion entre les $L^p(\\mathbb R)$ : sur un espace de mesure finie, comme $\\mathopen{]}0, 1]$, en revanche, $L^q \\subset L^p$ pour $p < q$.',
  ],

  essais: [
    { texte: 'L’Exemple 4.4.1 : $1/x$ sur $[1, +\\infty\\mathclose{[}$ ($a = 1$). Partez de $p = 1{,}5$ et descendez jusqu’à $p = 1$ : que devient l’aire ?', etat: { domaine: 'infini', a: 1, p: 1.5 } },
    { texte: '$x^{-1/2}$ sur $\\mathopen{]}0, 1]$ : pour quels $p$ est-elle dans $L^p$ ? Glissez le point verticalement.', etat: { domaine: 'zero', a: 0.5, p: 1 } },
    { texte: 'Sur $\\mathopen{]}0, 1]$, fixez $a$ et faites varier $p$ : les $p$ permis forment un intervalle $\\mathopen{]}0, 1/a\\mathclose{[}$. Pourquoi est-ce cohérent avec $L^q \\subset L^p$ pour $p < q$ ?', etat: { domaine: 'zero', a: 1.5, p: 0.5 } },
    { texte: 'Sur $\\mathopen{]}0, +\\infty\\mathclose{[}$, aucune puissance n’est dans aucun $L^p$ : une moitié ou l’autre diverge toujours.', etat: { domaine: 'tout', a: 1, p: 1 } },
  ],

  monte(zone, outils) {
    const r = outils.etat;

    const barre = barreOutils(zone);
    const choix = choixRadios(barre, {
      nom: 'domaine',
      options: Object.keys(DOMAINES).map((valeur) => ({ valeur, latex: `x \\in ${LATEX_DOMAINE[valeur]}` })),
      change: (valeur) => {
        outils.change({ domaine: valeur });
        dessine();
      },
    });

    const grille = document.createElement('div');
    grille.className = 'grille-2 principale';
    zone.appendChild(grille);

    // ---- Plan (a, p) ------------------------------------------------------------------------
    const cP = carte(grille, 'Plan $(a, p)$');
    boutonInfo(cP, [
      ['zone', '--zone-stable', 'Les $(a, p)$ pour lesquels $x^{-a} \\in L^p$ sur le domaine choisi.'],
      ['ligne', '--equilibre', 'L’hyperbole $ap = 1$ : la frontière, où $\\int x^{-ap}$ diverge de justesse (logarithme).'],
      ['point', '--perturbation', 'Le point $(a, p)$ : cliquez ou faites glisser. Il se colle à l’hyperbole.'],
    ]);
    const canvasP = toile(cP, '1 / 1', () => dessine());
    canvasP.classList.add('cliquable');
    const repP = new Repere(canvasP, { x: [0, 3], y: [0, 4] });
    const texteVerdict = verdict(cP, '');
    glisse(canvasP, repP, {
      deplace: (a, p) => {
        outils.change(pointDuPlan(a, p, 8 / repP.sx, 8 / repP.sy));
        dessine();
      },
    });

    // ---- Graphe de |f|^p --------------------------------------------------------------------
    const cG = carte(grille, 'Le graphe de $|f|^p = x^{-ap}$');
    boutonInfo(cG, [
      ['ligne', '--texte', '$x^{-a}$, la fonction elle-même.'],
      ['ligne', '--accent', '$|f|^p = x^{-ap}$ ; son intégrale en aplat, en rouge si elle est infinie.'],
    ]);
    const canvasG = toile(cG, '1 / 1', () => dessine());
    const repG = new Repere(canvasG, { x: [0, 8], y: [0, 3] });
    const bloc = document.createElement('div');
    bloc.className = 'bloc-maths';
    cG.appendChild(bloc);
    const valeur = paragraphe(bloc, '', '');
    const permis = paragraphe(bloc, '', '');

    function dessine() {
      const col = couleurs();
      const a = Math.min(3, Math.max(0.05, r.a));
      const p = Math.min(4, Math.max(0.1, r.p));
      const s = produit(a, p);
      choix.fixe(r.domaine);
      const I = integralePuissance(r.domaine, s);
      const dansLp = Number.isFinite(I);

      // Plan.
      if (repP.prepare()) {
        const regionOk = (x, y) => (r.domaine === 'zero' ? x * y < 1 : r.domaine === 'infini' ? x * y > 1 : false);
        repP.region(regionOk, { couleur: col.zone });
        repP.axes({ noms: ['a', 'p'], grille: true });
        const hyp = [];
        for (let x = 0.24; x <= 3; x += 0.01) hyp.push([x, 1 / x]);
        repP.trace(hyp, { couleur: col.equilibre, largeur: 2 });
        repP.point(a, p, { rayon: 6, couleur: col.perturbation });
      }
      texteVerdict.className = `verdict ${dansLp ? 'ok' : 'alerte'}`;
      outils.rendTexte(
        texteVerdict,
        `$a = ${nb(a, 2, 1)}$, $p = ${nb(p, 2, 1)}$, $ap = ${nb(s, 2, 1)}$ : $x^{-a} ${dansLp ? '\\in' : '\\notin'} L^{p}(${LATEX_DOMAINE[r.domaine]})$.`,
      );

      // Graphe.
      const [x0, x1] = DOMAINES[r.domaine].vue;
      const [d0, d1] = r.domaine === 'zero' ? [1e-4, 1] : r.domaine === 'infini' ? [1, x1] : [1e-4, x1];
      repG.fixeCadre([x0, x1], [0, 3]);
      if (repG.prepare()) {
        aire(repG, (x) => x ** -s, { a: d0, b: d1, couleur: dansLp ? col.zone : col.alerte, alpha: dansLp ? 1 : 0.15, n: 1500 });
        repG.axes({ noms: ['x', ''], grille: false });
        traceFonction(repG, (x) => x ** -a, { a: d0, b: d1, couleur: col.trait, largeur: 1.2, tirets: [5, 4], n: 1500 });
        traceFonction(repG, (x) => x ** -s, { a: d0, b: d1, couleur: col.accent, largeur: 2.2, n: 1500 });
      }
      outils.rendTexte(
        valeur,
        dansLp
          ? `$\\int x^{-ap}\\,\\mathrm dx = ${nb(I)}$, donc $\\|x^{-a}\\|_p = ${nb(I ** (1 / p))}$.`
          : `$\\int x^{-ap}\\,\\mathrm dx = +\\infty$${r.domaine === 'tout' ? ' : sur $\\mathopen{]}0, 1]$ ou sur $[1, +\\infty\\mathclose{[}$, l’intégrale diverge toujours.' : s === 1 ? ' : de justesse, $\\int x^{-1}\\,\\mathrm dx$ est un logarithme.' : '.'}`,
      );
      const e = exposantsPermis(r.domaine, a);
      // WEB5 : `a` est suivi de la phrase et varie dans une plage connue,
      // [0,05 ; 3] : virgule fixe, comme dans le verdict. La borne finit la
      // phrase, rien ne la suit : sa forme la plus courte ne fait rien bouger.
      outils.rendTexte(
        permis,
        e === null
          ? `Pour $a = ${nb(a, 2)}$, aucun $p$ ne convient.`
          : e.max === Infinity
            ? `Pour $a = ${nb(a, 2)}$ : $x^{-a} \\in L^p$ pour $p > ${latexNombre(e.min, 3)}$.`
            : `Pour $a = ${nb(a, 2)}$ : $x^{-a} \\in L^p$ pour $0 < p < ${latexNombre(e.max, 3)}$.`,
      );
    }

    outils.surTheme(dessine);
    dessine();
    return { applique: dessine };
  },
};
