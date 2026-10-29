// Approcher par des fonctions étagées (poly, Théorème 3.2.1, Figure 3.1 et
// Théorème 3.3.1 de Beppo-Levi). La suite de la preuve,
//   f_n = Σ_{k < n 2^n} k/2^n 𝟙_{k/2^n < f ≤ (k+1)/2^n} + n 𝟙_{n < f},
// croît vers f ; son intégrale croît vers celle de f, finie ou non. On règle n,
// on clique un point x, et l'on suit n ↦ f_n(x) et n ↦ ∫ f_n.

import { chiffresEntiers, latexNombreFixe, latexPositifFixe as nb } from '../../socle/js/ui/format.js';
import { Repere } from '../../socle/js/ui/repere.js';
import { couleurs } from '../../socle/js/ui/theme.js';
import { champ } from '../../socle/js/ui/controls.js';
import { axesLog, barreOutils, boutonInfo, carte, choisitIndice, choixEchelle, choixRadios, echelleLog, glisse, toile, verdict } from './commun.js';
import { traceFonction } from './fonctions.js';

const N_MAX = 8;

// La fonction f_n du Théorème 3.2.1 : 0 si f = 0, n si f > n, et sinon k/2^n
// où k/2^n < f ≤ (k+1)/2^n.
export function etagee(n, y) {
  if (!(y > 0)) return 0;
  if (y > n) return n;
  return (Math.ceil(y * 2 ** n) - 1) / 2 ** n;
}

// λ({f > a}) sur [a0, b0], estimée sur m échantillons triés (point milieu de
// chaque pas) : une recherche dichotomique par niveau.
export function survieEchantillonnee(f, a0, b0, m = 20000) {
  const v = Float64Array.from({ length: m }, (_, i) => f(a0 + ((b0 - a0) * (i + 0.5)) / m)).sort();
  return (a) => {
    let [lo, hi] = [0, m];
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (v[mid] > a) hi = mid;
      else lo = mid + 1;
    }
    return ((m - lo) * (b0 - a0)) / m;
  };
}

// Les fonctions : f, son intervalle, λ({f > a}) (fonction de survie, exacte
// quand on la connaît) et ∫ f.
const sinus = (x) => 2 + 1.5 * Math.sin(x);
export const FONCTIONS = {
  log: {
    latex: '4|\\ln x|',
    f: (x) => (x <= 0 ? Infinity : 4 * Math.abs(Math.log(x))),
    intervalle: [0, Math.E],
    survie: (a) => Math.exp(-a / 4) + Math.max(0, Math.E - Math.exp(a / 4)),
    integrale: 8,
    hauteur: 9.5,
  },
  racine: {
    latex: 'x^{-1/2}',
    f: (x) => (x <= 0 ? Infinity : 1 / Math.sqrt(x)),
    intervalle: [0, 1],
    survie: (a) => (a <= 1 ? 1 : 1 / (a * a)),
    integrale: 2,
    hauteur: 9.5,
  },
  inverse: {
    latex: 'x^{-1}',
    f: (x) => (x <= 0 ? Infinity : 1 / x),
    intervalle: [0, 1],
    survie: (a) => (a <= 1 ? 1 : 1 / a),
    integrale: Infinity,
    hauteur: 9.5,
  },
  sinus: {
    latex: '2 + 1{,}5 \\sin x',
    f: sinus,
    intervalle: [0, 6],
    survie: survieEchantillonnee(sinus, 0, 6),
    integrale: 12 + 1.5 * (1 - Math.cos(6)),
    hauteur: 4,
  },
};

// ∫ f_n = Σ_{j=1}^{n 2^n} 2^{−n} λ({f > j/2^n}) : f_n compte, par pas de 2^{−n},
// les niveaux que f dépasse.
export function integraleEtagee(nom, n) {
  const { survie } = FONCTIONS[nom];
  let s = 0;
  for (let j = 1; j <= n * 2 ** n; j++) s += survie(j / 2 ** n) / 2 ** n;
  return s;
}

// Morceaux [x0, x1, valeur] de f_n sur l'intervalle, à partir d'un échantillonnage
// fin : un nouveau morceau commence là où f_n change de valeur.
export function morceaux(nom, n, pas = 2000) {
  const { f, intervalle: [a, b] } = FONCTIONS[nom];
  const res = [];
  for (let i = 0; i <= pas; i++) {
    const x = a + ((b - a) * i) / pas;
    const v = etagee(n, f(x));
    const dernier = res[res.length - 1];
    if (dernier && dernier[2] === v) dernier[1] = x;
    else {
      if (dernier) dernier[1] = x;
      res.push([x, x, v]);
    }
  }
  return res;
}

const fr = (v) => String(Number(v.toPrecision(3))).replace('.', ',');

export default {
  etat: { fonction: 'log', n: 2, x: 0.6 },

  choix: { fonction: Object.keys(FONCTIONS), echelle: ['valeurs', 'ecart'] },

  preferences: { echelle: 'valeurs' },

  termes: ['convergence monotone', 'application mesurable', 'fonction étagée', 'intégrable'],

  rappel: [
    'Toute fonction mesurable positive $f$ est limite simple d’une suite croissante de fonctions étagées positives (Théorème 3.2.1). La preuve découpe l’ensemble des valeurs, comme Lebesgue au chapitre 1 :',
    '$$f_n = \\sum_{k=0}^{n 2^n - 1} \\frac{k}{2^n}\\,\\mathbb 1_{\\{\\frac{k}{2^n} < f \\le \\frac{k+1}{2^n}\\}} + n\\,\\mathbb 1_{\\{n < f\\}}.$$',
    'Le pas $2^{-n}$ se raffine et le plafond $n$ monte : là où $f$ est finie, $f_n(x)$ finit par être à moins de $2^{-n}$ de $f(x)$ ; là où $f = +\\infty$, $f_n(x) = n \\to +\\infty$. Si $f$ est bornée, la convergence est uniforme.',
    'Le théorème de Beppo-Levi (Théorème 3.3.1) passe à l’intégrale : pour une suite croissante de fonctions mesurables positives, $\\int f = \\lim_n \\int f_n$, que cette limite soit finie ou égale à $+\\infty$.',
  ],

  essais: [
    { texte: 'La Figure 3.1 du poly : $f = 4|\\ln x|$ sur $[0, e]$, avec $f(0) = +\\infty$. Faites passer $n$ de $1$ à $4$ : où $f_n$ est-elle plafonnée à $n$ ?', etat: { fonction: 'log', n: 1, x: 0.6 } },
    { texte: 'Cliquez près de $x = 1$, là où $f$ s’annule, puis près de $0$ : comment la suite $f_n(x)$ approche-t-elle $f(x)$ dans chaque cas ?', etat: { fonction: 'log', n: 3, x: 0.05 } },
    { texte: '$f = x^{-1}$ : chaque $f_n$ est intégrable, mais $\\int f_n$ croît sans borne. Beppo-Levi donne $\\int_{\\mathopen{]}0, 1]} x^{-1}\\,\\mathrm d\\lambda = +\\infty$.', etat: { fonction: 'inverse', n: 2, x: 0.3 } },
    { texte: 'Une fonction bornée : dès que $n \\ge \\sup f$, l’écart $f - f_n$ est partout sous $2^{-n}$. La convergence est uniforme.', etat: { fonction: 'sinus', n: 4, x: 1.5 } },
  ],

  monte(zone, outils) {
    const r = outils.etat;

    const barre = barreOutils(zone);
    const choix = choixRadios(barre, {
      nom: 'fonction',
      options: Object.entries(FONCTIONS).map(([valeur, { latex }]) => ({ valeur, latex: `f = ${latex}` })),
      change: (valeur) => {
        const [a, b] = FONCTIONS[valeur].intervalle;
        outils.change({ fonction: valeur, x: Math.min(b, Math.max(a, r.x)) });
        dessine();
      },
    });

    // Les deux suites du bas : les valeurs, ou leur écart à la limite en échelle
    // logarithmique (l'écart de f_n à f décroît comme 2^{-n}, une droite).
    const choixEch = choixEchelle(barre, {
      etiquette: 'Suites du bas :',
      options: [{ valeur: 'valeurs', texte: 'valeurs' }, { valeur: 'ecart', texte: 'écart à la limite (log)' }],
      change: (valeur) => {
        outils.preferences.change({ echelle: valeur });
        dessine();
      },
    });

    // ---- Graphe ---------------------------------------------------------------------------
    const cG = carte(zone, 'La fonction $f$ et la fonction étagée $f_n$');
    cG.classList.add('principale');
    boutonInfo(cG, [
      ['ligne', '--texte', 'La fonction $f$.'],
      ['ligne', '--accent', 'La fonction étagée $f_n$, sous $f$ ; son intégrale en aplat.'],
      ['tirets', '--discret', 'Les niveaux $k/2^n$, et le plafond $n$ en trait plein.'],
      ['point', '--perturbation', 'Le point $x$ : cliquez ou faites glisser ; $f(x)$ et $f_n(x)$ y sont marqués.'],
    ]);
    const champN = champ(cG, { latex: 'n', min: 0, max: N_MAX, pas: 1, valeur: r.n }, (v) => {
      outils.change({ n: Math.min(N_MAX, Math.max(0, Math.round(v))) });
      dessine();
    });
    const canvasG = toile(cG, '16 / 6', () => dessine());
    canvasG.classList.add('cliquable');
    const repG = new Repere(canvasG, { x: [0, 1], y: [0, 9] });
    const ecart = verdict(cG, '');

    // ---- Suites numériques ----------------------------------------------------------------
    const grille = document.createElement('div');
    grille.className = 'grille-2';
    zone.appendChild(grille);
    const cX = carte(grille, 'La suite $n \\mapsto f_n(x)$');
    const titreX = cX.querySelector('h2');
    boutonInfo(cX, [
      ['point', '--perturbation', '$f_k(x)$ pour $k = 0, \\dots, 8$ ; le $n$ choisi est cerclé. Cliquez sur un point pour choisir $n$.'],
      ['tirets', '--equilibre', 'La limite $f(x)$.'],
    ]);
    const canvasX = toile(cX, '16 / 7', () => dessine());
    const repX = new Repere(canvasX, { x: [-0.5, N_MAX + 0.5], y: [0, 9] });
    const texteX = verdict(cX, '');
    const cI = carte(grille, 'Beppo-Levi : $n \\mapsto \\int f_n$');
    const titreI = cI.querySelector('h2');
    boutonInfo(cI, [
      ['point', '--accent', '$\\int f_k\\,\\mathrm d\\lambda$ pour $k = 0, \\dots, 8$ ; le $n$ choisi est cerclé. Cliquez sur un point pour choisir $n$.'],
      ['tirets', '--equilibre', '$\\int f\\,\\mathrm d\\lambda$, la limite ; en rouge quand elle vaut $+\\infty$.'],
    ]);
    const canvasI = toile(cI, '16 / 7', () => dessine());
    const repI = new Repere(canvasI, { x: [-0.5, N_MAX + 0.5], y: [0, 9] });
    const texteI = verdict(cI, '');

    for (const [canvas, rep] of [[canvasX, repX], [canvasI, repI]]) {
      choisitIndice(canvas, rep, {
        min: 0,
        max: () => N_MAX,
        change: (n) => {
          outils.change({ n });
          dessine();
        },
      });
    }

    glisse(canvasG, repG, {
      deplace: (x) => {
        const [a, b] = FONCTIONS[r.fonction].intervalle;
        outils.change({ x: Number(Math.min(b, Math.max(a, x)).toFixed(4)) });
        dessine();
      },
    });

    // Intégrales gardées par fonction.
    const integrales = {};

    function dessine() {
      const col = couleurs();
      const F = FONCTIONS[r.fonction];
      const n = Math.min(N_MAX, Math.max(0, Math.round(r.n)));
      const [a, b] = F.intervalle;
      const x = Math.min(b, Math.max(a, r.x));
      choix.fixe(r.fonction);
      champN.fixe(n);
      integrales[r.fonction] ??= Array.from({ length: N_MAX + 1 }, (_, k) => integraleEtagee(r.fonction, k));
      const ints = integrales[r.fonction];

      // Graphe.
      const H = F.hauteur;
      repG.fixeCadre([a - 0.02 * (b - a), b + 0.02 * (b - a)], [-0.03 * H, H]);
      if (repG.prepare()) {
        const ms = morceaux(r.fonction, n);
        const ctx = repG.ctx;
        ctx.save();
        repG.decoupe();
        ctx.fillStyle = col.zone;
        for (const [u, v, y] of ms) ctx.fillRect(repG.X(u), repG.Y(y), repG.X(v) - repG.X(u), repG.Y(0) - repG.Y(y));
        ctx.restore();
        // Niveaux k/2^n (s'ils ne sont pas trop serrés) et plafond n.
        const pasPx = repG.sy / 2 ** n;
        if (pasPx > 5) for (let k = 1; k / 2 ** n < Math.min(n, H); k++) repG.trace([[a, k / 2 ** n], [b, k / 2 ** n]], { couleur: col.discret, largeur: 0.6, tirets: [2, 4], alpha: 0.6 });
        if (n <= H) repG.trace([[a, n], [b, n]], { couleur: col.discret, largeur: 1 });
        repG.axes({ noms: ['x', ''], grille: false });
        traceFonction(repG, F.f, { a: a + 1e-6, b, couleur: col.trait, largeur: 1.8, n: 800 });
        for (const [u, v, y] of ms) repG.trace([[u, y], [v, y]], { couleur: col.accent, largeur: 2.4 });
        const fx = F.f(x);
        repG.trace([[x, 0], [x, H]], { couleur: col.perturbation, largeur: 1, tirets: [3, 3] });
        repG.point(x, etagee(n, fx), { rayon: 5, couleur: col.perturbation });
        if (Number.isFinite(fx) && fx <= H) repG.point(x, fx, { rayon: 5, couleur: col.perturbation, plein: false });
      }
      // Écart maximal f − f_n (sur la partie bornée du graphe).
      let sup = 0;
      for (let i = 0; i <= 2000; i++) {
        const t = a + ((b - a) * i) / 2000;
        const y = F.f(t);
        if (Number.isFinite(y)) sup = Math.max(sup, y - etagee(n, y));
      }
      const borne = Math.max(...Array.from({ length: 2001 }, (_, i) => F.f(a + ((b - a) * i) / 2000)));
      const uniforme = Number.isFinite(borne) && n >= borne;
      ecart.className = `verdict ${uniforme ? 'ok' : ''}`;
      outils.rendTexte(
        ecart,
        uniforme
          ? `$\\sup (f - f_n) = ${nb(sup)} \\le 2^{-${n}} = ${nb(2 ** -n)}$ : $f$ est bornée par $${fr(borne).replace(',', '{,}')} \\le n$, l’écart est uniforme.`
          : `$\\sup (f - f_n) = ${Number.isFinite(borne) ? nb(sup) : '+\\infty'}$ : là où $f > n$, $f_n$ est plafonnée à $n$.`,
      );

      // n ↦ f_n(x).
      const fx = F.f(x);
      const valeurs = Array.from({ length: N_MAX + 1 }, (_, k) => etagee(k, fx));
      const hX = Math.max(1.2, ...(Number.isFinite(fx) ? [fx] : valeurs)) * 1.1;
      const ecartX = outils.preferences.valeurs.echelle === 'ecart' && Number.isFinite(fx);
      choixEch.fixe(outils.preferences.valeurs.echelle === 'ecart' ? 'ecart' : 'valeurs');
      const donneesX = ecartX ? valeurs.map((v) => (fx - v < 1e-12 ? 0 : fx - v)) : valeurs;
      const EX = ecartX ? echelleLog(donneesX) : null;
      repX.fixeCadre([-0.5, N_MAX + 0.5], ecartX ? EX.cadre : [-0.04 * hX, hX]);
      if (repX.prepare()) {
        if (ecartX) axesLog(repX, EX, col, [-0.5, N_MAX + 0.5]);
        else {
          repX.axes({ noms: ['n', ''], grille: false });
          if (Number.isFinite(fx)) repX.trace([[-0.5, fx], [N_MAX + 0.5, fx]], { couleur: col.equilibre, largeur: 1.4, tirets: [6, 4] });
        }
        const yX = ecartX ? EX.y : (v) => v;
        donneesX.forEach((v, k) => repX.point(k, yX(v), { rayon: 3, couleur: col.perturbation }));
        repX.point(n, yX(donneesX[n]), { rayon: 6, couleur: col.perturbation, plein: false });
      }
      outils.rendTexte(titreX, ecartX ? 'L’écart $n \\mapsto f(x) - f_n(x)$, échelle logarithmique' : 'La suite $n \\mapsto f_n(x)$');
      outils.rendTexte(texteX, `$x = ${latexNombreFixe(x, 2, chiffresEntiers(Math.max(Math.abs(a), Math.abs(b))))}$ : $f_{${n}}(x) = ${nb(valeurs[n])}$, $f(x) = ${Number.isFinite(fx) ? nb(fx) : '+\\infty'}$`);

      // n ↦ ∫ f_n.
      const hI = Number.isFinite(F.integrale) ? Math.max(F.integrale, ...ints) * 1.15 : Math.max(...ints) * 1.15;
      const ecartI = outils.preferences.valeurs.echelle === 'ecart' && Number.isFinite(F.integrale);
      const donneesI = ecartI ? ints.map((v) => (F.integrale - v < 1e-12 ? 0 : F.integrale - v)) : ints;
      const EI = ecartI ? echelleLog(donneesI) : null;
      repI.fixeCadre([-0.5, N_MAX + 0.5], ecartI ? EI.cadre : [-0.04 * hI, hI]);
      if (repI.prepare()) {
        if (ecartI) axesLog(repI, EI, col, [-0.5, N_MAX + 0.5]);
        else {
          repI.axes({ noms: ['n', ''], grille: false });
          if (Number.isFinite(F.integrale)) repI.trace([[-0.5, F.integrale], [N_MAX + 0.5, F.integrale]], { couleur: col.equilibre, largeur: 1.4, tirets: [6, 4] });
        }
        const yI = ecartI ? EI.y : (v) => v;
        donneesI.forEach((v, k) => repI.point(k, yI(v), { rayon: 3, couleur: col.accent }));
        repI.point(n, yI(donneesI[n]), { rayon: 6, couleur: col.accent, plein: false });
      }
      outils.rendTexte(titreI, ecartI ? 'L’écart $n \\mapsto \\int f - \\int f_n$, échelle logarithmique' : 'Beppo-Levi : $n \\mapsto \\int f_n$');
      texteI.className = `verdict ${Number.isFinite(F.integrale) ? 'ok' : 'alerte'}`;
      outils.rendTexte(
        texteI,
        `$\\int f_{${n}}\\,\\mathrm d\\lambda = ${nb(ints[n], 3, chiffresEntiers(Math.max(...ints)))}$, croît vers $\\int f\\,\\mathrm d\\lambda = ${Number.isFinite(F.integrale) ? nb(F.integrale) : '+\\infty'}$`,
      );
    }

    outils.surTheme(dessine);
    dessine();
    return { applique: dessine };
  },
};
