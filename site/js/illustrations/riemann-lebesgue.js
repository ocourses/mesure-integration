// Riemann contre Lebesgue (poly, sections 1.1 et 1.3) : la même fonction,
// approchée de deux façons. À gauche, Riemann découpe l'ensemble de départ en
// n morceaux et encadre f par les sommes de Darboux. À droite, Lebesgue découpe
// l'ensemble des valeurs en bandes [y_k, y_{k+1}[ de pas h ; un clic sur une
// bande montre l'ensemble A_k = f⁻¹([y_k, y_{k+1}[), qui peut être une réunion
// de plusieurs intervalles, et sa contribution y_k λ(A_k) à l'intégrale.

import { chiffresEntiers, latexPositifFixe as nb } from '../ui/format.js';
import { Repere } from '../ui/repere.js';
import { couleurs } from '../ui/theme.js';
import { barreOutils, boutonInfo, carte, choixRadios, glisse, paragraphe, toile } from './commun.js';
import { champ } from '../ui/controls.js';
import { aire, integrale, intervallesOu, longueur, paliers, rectangles, traceFonction } from './fonctions.js';

// ---- Fonctions ------------------------------------------------------------------------

// Abscisses des points de contrôle de la fonction « libre », sur [0, 6].
export const ABSCISSES_LIBRES = [0, 1, 2, 3, 4, 5, 6];
export const POINTS_DEFAUT = '1.2,3.4,1,3,0.6,2.6,1.6';
const Y_MAX_LIBRE = 3.8;

// Valeurs de la fonction libre lues dans le réglage `points` (textes séparés par
// des virgules) ; une lecture impossible redonne les valeurs par défaut.
export function lisPoints(texte) {
  const v = String(texte).split(',').map(Number);
  if (v.length !== ABSCISSES_LIBRES.length || !v.every(Number.isFinite)) return lisPoints(POINTS_DEFAUT);
  return v.map((y) => Math.min(Y_MAX_LIBRE, Math.max(0, y)));
}

// Interpolation cubique monotone (Fritsch-Carlson) des points (xs, ys) : la
// courbe reste entre deux valeurs voisines, donc positive si les points le sont.
export function interpolation(xs, ys) {
  const n = xs.length;
  const d = xs.slice(1).map((x, i) => (ys[i + 1] - ys[i]) / (x - xs[i]));
  const m = ys.map((_, i) => {
    if (i === 0) return d[0];
    if (i === n - 1) return d[n - 2];
    return d[i - 1] * d[i] <= 0 ? 0 : (2 * d[i - 1] * d[i]) / (d[i - 1] + d[i]);
  });
  return (x) => {
    let i = Math.min(n - 2, Math.max(0, xs.findIndex((u, k) => k < n - 1 && x <= xs[k + 1])));
    if (i < 0) i = n - 2;
    const h = xs[i + 1] - xs[i];
    const t = Math.min(1, Math.max(0, (x - xs[i]) / h));
    const [h00, h10, h01, h11] = [2 * t ** 3 - 3 * t ** 2 + 1, t ** 3 - 2 * t ** 2 + t, -2 * t ** 3 + 3 * t ** 2, t ** 3 - t ** 2];
    return h00 * ys[i] + h10 * h * m[i] + h01 * ys[i + 1] + h11 * h * m[i + 1];
  };
}

// La fonction discontinue de la Figure 1.1 du poly, sur [1, 9].
const f1 = (x) => 2.3 + Math.sin(1.4 * (x - 1.2)) + 0.12 * (x - 1);
const f2 = (x) => 1 + 0.13 * (x - 5.2) ** 2 + 0.35 * Math.sin(1.6 * (x - 5.2));

export const FONCTIONS = {
  sinus: { latex: '2 + 1{,}5 \\sin x', intervalle: [0, 6], f: () => (x) => 2 + 1.5 * Math.sin(x), sauts: [], yMax: 4 },
  discontinue: { texte: 'discontinue', intervalle: [1, 9], f: () => (x) => (x < 5.2 ? f1(x) : f2(x)), sauts: [5.2], yMax: 4 },
  libre: { texte: 'à main levée', intervalle: [0, 6], f: (points) => interpolation(ABSCISSES_LIBRES, lisPoints(points)), sauts: [], yMax: 4 },
  dirichlet: { texte: 'Dirichlet', intervalle: [0, 1], f: null, sauts: [], yMax: 1.3 },
};

// ---- Riemann : sommes de Darboux ----------------------------------------------------

// Bornes inférieure et supérieure de f sur [u, v], par échantillonnage (les
// extrémités comprises, de part et d'autre d'un saut).
function bornes(f, u, v, sauts, m = 120) {
  let [inf, sup] = [Infinity, -Infinity];
  const xs = [u, v, ...sauts.filter((s) => s > u && s < v).flatMap((s) => [s - 1e-9, s])];
  for (let i = 0; i <= m; i++) xs.push(u + ((v - u) * i) / m);
  for (const x of xs) {
    const y = f(x);
    inf = Math.min(inf, y);
    sup = Math.max(sup, y);
  }
  return [inf, sup];
}

// Sommes de Darboux de f pour la subdivision régulière de [a, b] en n morceaux :
// { inf, sup, morceaux: [[x_k, x_{k+1}, inf, sup], …] }. Pour la fonction de
// Dirichlet, inf = 0 et sup = 1 sur tout morceau : S_Δ = 0 et S^Δ = b − a.
export function darboux(nom, points, n) {
  const { intervalle: [a, b], sauts } = FONCTIONS[nom];
  const morceaux = [];
  for (let k = 0; k < n; k++) {
    const [u, v] = [a + ((b - a) * k) / n, a + ((b - a) * (k + 1)) / n];
    morceaux.push([u, v, ...(nom === 'dirichlet' ? [0, 1] : bornes(FONCTIONS[nom].f(points), u, v, sauts))]);
  }
  const somme = (j) => morceaux.reduce((s, m) => s + (m[1] - m[0]) * m[j], 0);
  return { inf: somme(2), sup: somme(3), morceaux };
}

// ---- Lebesgue : découper les valeurs ------------------------------------------------

// Niveaux y_k = k h et ensembles A_k = { y_k ≤ f < y_{k+1} } : pour chaque k,
// { y, intervalles, mesure }. Pour la fonction de Dirichlet, f ne prend que les
// valeurs 0 et 1 : A_k est [0, 1] \ ℚ (mesure 1) pour la bande qui contient 0,
// ℚ ∩ [0, 1] (mesure 0) pour celle qui contient 1, vide pour les autres.
export function niveaux(nom, points, h) {
  const { intervalle: [a, b], yMax } = FONCTIONS[nom];
  const nb = Math.ceil((yMax + 1e-9) / h);
  if (nom === 'dirichlet') {
    const k1 = Math.floor(1 / h + 1e-9);
    return Array.from({ length: nb }, (_, k) => ({
      y: k * h,
      intervalles: k === 0 ? [[a, b]] : [],
      mesure: k === 0 ? b - a : 0,
      rationnels: k === k1 && k1 > 0,
      irrationnels: k === 0 && k1 > 0,
    }));
  }
  const f = FONCTIONS[nom].f(points);
  return Array.from({ length: nb }, (_, k) => {
    const [y0, y1] = [k * h, (k + 1) * h];
    const intervalles = intervallesOu(f, (y) => y >= y0 && y < y1, a, b, { n: 3000, seuils: [y0, y1] });
    return { y: y0, intervalles, mesure: longueur(intervalles) };
  });
}

// Intégrale de φ = Σ y_k 𝟙_{A_k}.
export const sommeLebesgue = (bandes) => bandes.reduce((s, { y, mesure }) => s + y * mesure, 0);

// Intégrale de f : celle de la fonction elle-même (0 pour Dirichlet).
export function integraleExacte(nom, points) {
  if (nom === 'dirichlet') return 0;
  const { intervalle: [a, b], sauts } = FONCTIONS[nom];
  return integrale(FONCTIONS[nom].f(points), a, b, 2000, sauts);
}

// Rationnels p/q de [0, 1], q ≤ qMax, pour figurer ℚ ∩ [0, 1].
const rationnels = (qMax) => {
  const r = new Set();
  for (let q = 1; q <= qMax; q++) for (let p = 0; p <= q; p++) r.add(p / q);
  return [...r];
};

export default {
  etat: { fonction: 'sinus', n: 12, h: 0.5, bande: 5, points: POINTS_DEFAUT },

  choix: { fonction: Object.keys(FONCTIONS) },

  termes: ['négligeable', 'fonction de Dirichlet', 'Riemann-intégrable', 'mesure de Lebesgue', 'fonction étagée', 'sommes de Darboux'],

  rappel: [
    'Riemann découpe l’ensemble de départ : pour une subdivision $\\Delta = (x_0 < \\dots < x_n)$ de $[a, b]$, les sommes de Darboux inférieure et supérieure prennent sur chaque morceau la borne inférieure, resp. supérieure, de $f$,',
    '$$\\begin{gathered} S_\\Delta(f) = \\sum_k (x_{k+1} - x_k) \\inf_{[x_k, x_{k+1}]} f, \\\\ S^\\Delta(f) = \\sum_k (x_{k+1} - x_k) \\sup_{[x_k, x_{k+1}]} f. \\end{gathered}$$',
    'La fonction est Riemann-intégrable si l’écart $S^\\Delta(f) - S_\\Delta(f)$ peut être rendu aussi petit que l’on veut.',
    'Lebesgue découpe l’ensemble des valeurs : avec des niveaux $y_k = kh$, on regroupe les points selon la valeur de $f$,',
    '$$A_k = f^{-1}([y_k, y_{k+1}\\mathclose{[}) = \\{x : y_k \\le f(x) < y_{k+1}\\},$$',
    'et l’on approche $f$ par la fonction étagée $\\varphi$, dont l’intégrale est une somme de longueurs,',
    '$$\\begin{gathered} \\varphi = \\sum_k y_k \\mathbb 1_{A_k}, \\\\ \\int \\varphi = \\sum_k y_k \\times \\operatorname{longueur}(A_k). \\end{gathered}$$',
    'Comme $0 \\le f - \\varphi < h$ partout, l’erreur est au plus $h(b - a)$.',
    'Il faut alors savoir mesurer les ensembles $A_k$, qui ne sont pas toujours des intervalles : c’est le rôle de la mesure de Lebesgue (chapitre 2). Pour la fonction de Dirichlet $\\mathbb 1_{\\mathbb Q \\cap [0, 1]}$, $S_\\Delta = 0$ et $S^\\Delta = 1$ pour toute subdivision, alors que Lebesgue donne $0$ : $\\mathbb Q \\cap [0, 1]$ est négligeable.',
  ],

  essais: [
    { texte: 'La Figure 1.2 du poly : $f = 2 + 1{,}5 \\sin x$ et des niveaux de pas $0{,}5$. L’ensemble $A_5$, où $2{,}5 \\le f < 3$, est réunion de deux intervalles. Cliquez sur d’autres bandes.', etat: { fonction: 'sinus', n: 12, h: 0.5, bande: 5 } },
    { texte: 'Depuis $h = 0{,}5$, diminuez le pas $h$ : l’écart entre $\\int\\varphi$ et $\\int f$ reste sous $h(b - a)$.', etat: { fonction: 'sinus', h: 0.5, bande: 5 } },
    { texte: 'La fonction discontinue de la Figure 1.1 : augmentez $n$. L’écart $S^\\Delta - S_\\Delta$ diminue-t-il, malgré le saut ?', etat: { fonction: 'discontinue', n: 4, h: 0.5, bande: 4 } },
    { texte: 'Dessinez une fonction qui oscille : faites glisser les points orange. En combien d’intervalles se découpe $A_k$ ?', etat: { fonction: 'libre', points: '1.2,3.4,1,3,0.6,2.6,1.6', h: 0.4, bande: 5 } },
    { texte: 'La fonction de Dirichlet : quel que soit $n$, $S_\\Delta = 0$ et $S^\\Delta = 1$. Cliquez sur la bande qui contient la valeur 1 : de quelle longueur est $A_k$ ?', etat: { fonction: 'dirichlet', n: 8, h: 0.25, bande: 4 } },
  ],

  monte(zone, outils) {
    const r = outils.etat;

    // ---- Choix de la fonction ------------------------------------------------------------
    const barre = barreOutils(zone);
    const choix = choixRadios(barre, {
      nom: 'fonction',
      options: Object.entries(FONCTIONS).map(([valeur, { latex, texte }]) => ({ valeur, latex, texte })),
      change: (valeur) => {
        outils.change({ fonction: valeur });
        dessine();
      },
    });

    const grille = document.createElement('div');
    grille.className = 'grille-2 principale';
    zone.appendChild(grille);

    // ---- Riemann ----------------------------------------------------------------------------
    const cR = carte(grille, 'Riemann : découper les abscisses');
    boutonInfo(cR, [
      ['ligne', '--texte', 'Le graphe de $f$.'],
      ['zone', '--zone-stable', 'Somme de Darboux inférieure $S_\\Delta(f)$ : sur chaque morceau, la borne inférieure de $f$.'],
      ['zone', '--accent', 'Somme de Darboux supérieure $S^\\Delta(f)$ : son bord haut, sur chaque morceau, est la borne supérieure de $f$. La bande bleue qu’elle ajoute à la somme inférieure est l’écart $S^\\Delta(f) - S_\\Delta(f)$.'],
      ['cercle', '--perturbation', 'Fonction à main levée : faites glisser les points pour la dessiner.'],
    ]);
    const champN = champ(cR, { latex: 'n', min: 1, max: 60, pas: 1, valeur: r.n }, (v) => {
      outils.change({ n: Math.max(1, Math.round(v)) });
      dessine();
    });
    const canvasR = toile(cR, '4 / 3', () => dessine());
    const repR = new Repere(canvasR, { x: [0, 6], y: [0, 4] });
    const blocR = document.createElement('div');
    blocR.className = 'bloc-maths';
    cR.appendChild(blocR);
    const sommesR = paragraphe(blocR, '', '');
    const ecartR = paragraphe(blocR, '', '');

    // ---- Lebesgue --------------------------------------------------------------------------
    const cL = carte(grille, 'Lebesgue : découper les valeurs');
    boutonInfo(cL, [
      ['ligne', '--texte', 'Le graphe de $f$, et en tirets les niveaux $y_k = kh$.'],
      ['ligne', '--accent', 'La fonction étagée $\\varphi = \\sum_k y_k \\mathbb 1_{A_k}$, sous $f$ ; son intégrale en aplat.'],
      ['zone', '--perturbation', 'La bande $[y_k, y_{k+1}\\mathclose{[}$ choisie (cliquez sur une autre bande), l’ensemble $A_k$ sur l’axe des abscisses et sa contribution $y_k\\,\\lambda(A_k)$.'],
      ['point', '--perturbation', 'Pour la fonction de Dirichlet : quelques rationnels $p/q$ de $\\mathbb Q \\cap [0, 1]$, un ensemble négligeable.'],
    ]);
    const champH = champ(cL, { latex: 'h', min: 0.05, max: 1, pas: 0.05, valeur: r.h }, (v) => {
      outils.change({ h: Math.min(2, Math.max(0.02, v)) });
      dessine();
    });
    const canvasL = toile(cL, '4 / 3', () => dessine());
    canvasL.classList.add('cliquable');
    const repL = new Repere(canvasL, { x: [0, 6], y: [0, 4] });
    const blocL = document.createElement('div');
    blocL.className = 'bloc-maths';
    cL.appendChild(blocL);
    const sommeL = paragraphe(blocL, '', '');
    const bandeL = paragraphe(blocL, '', '');

    // ---- Interactions ----------------------------------------------------------------------
    // Fonction libre : un point de contrôle se saisit sur l'une ou l'autre figure.
    let saisi = -1;
    const pointProche = (rep, x, y) => {
      if (r.fonction !== 'libre') return -1;
      const ys = lisPoints(r.points);
      let meilleur = -1;
      let dMin = 14;
      ABSCISSES_LIBRES.forEach((xi, i) => {
        const d = Math.hypot((x - xi) * rep.sx, (y - ys[i]) * rep.sy);
        if (d < dMin) [meilleur, dMin] = [i, d];
      });
      return meilleur;
    };
    const deplacePoint = (y) => {
      const ys = lisPoints(r.points);
      ys[saisi] = Math.round(Math.min(Y_MAX_LIBRE, Math.max(0, y)) * 100) / 100;
      outils.change({ points: ys.join(',') });
      dessine();
    };
    for (const [canvas, rep, bandeAuClic] of [
      [canvasR, repR, false],
      [canvasL, repL, true],
    ]) {
      glisse(canvas, rep, {
        prend: (x, y) => {
          saisi = pointProche(rep, x, y);
          return saisi >= 0 || bandeAuClic;
        },
        deplace: (x, y) => {
          if (saisi >= 0) deplacePoint(y);
          else {
            const nb = Math.ceil((FONCTIONS[r.fonction].yMax + 1e-9) / r.h);
            outils.change({ bande: Math.min(nb - 1, Math.max(0, Math.floor(y / r.h))) });
            dessine();
          }
        },
        relache: () => (saisi = -1),
      });
    }
    canvasR.addEventListener('pointermove', (ev) => {
      const [x, y] = repR.versMonde(ev);
      canvasR.classList.toggle('saisissable', pointProche(repR, x, y) >= 0);
    });

    // Calculs gardés : ils ne dépendent que de la fonction et du pas.
    let cle = '';
    let bandes = [];
    let exacte = 0;

    function cadre(rep) {
      const { intervalle: [a, b], yMax } = FONCTIONS[r.fonction];
      const m = 0.03 * (b - a);
      rep.fixeCadre([a - m, b + m], [-0.06 * yMax, yMax]);
      return rep.prepare();
    }

    function dessineFonction(rep, col) {
      const { f, intervalle: [a, b], sauts } = FONCTIONS[r.fonction];
      if (r.fonction === 'dirichlet') {
        // Deux nuages de points : les rationnels à la hauteur 1, les irrationnels à 0.
        rep.trace([[a, 1], [b, 1]], { couleur: col.trait, largeur: 1.6, tirets: [2, 3] });
        rep.trace([[a, 0], [b, 0]], { couleur: col.trait, largeur: 1.6, tirets: [2, 3] });
        return;
      }
      traceFonction(rep, f(r.points), { a, b, sauts, couleur: col.trait, largeur: 2 });
      if (r.fonction === 'libre') {
        lisPoints(r.points).forEach((y, i) => rep.point(ABSCISSES_LIBRES[i], y, { rayon: 5, couleur: col.perturbation, plein: false }));
      }
    }

    function dessine() {
      const col = couleurs();
      choix.fixe(r.fonction);
      champN.fixe(r.n);
      champH.fixe(r.h);
      const { intervalle: [a, b], yMax } = FONCTIONS[r.fonction];
      // Place réservée aux sommes qui sont suivies de texte : celle du plus
      // grand nombre qu'elles peuvent atteindre, (b − a) × yMax. Les nombres en
      // fin de ligne n'en réservent pas : rien ne bouge derrière eux.
      const chiffres = chiffresEntiers((b - a) * yMax);

      // Riemann.
      const d = darboux(r.fonction, r.points, r.n);
      if (cadre(repR)) {
        repR.axes({ noms: ['x', 'y'], grille: false });
        rectangles(repR, d.morceaux.map(([u, v, inf]) => [u, v, inf]), { couleur: col.zone, contour: col.discret });
        // La somme supérieure : sur chaque morceau, la bande entre la borne
        // inférieure et la borne supérieure, en accent. Son aire est l'écart
        // S^Δ − S_Δ ; son bord haut, plein, est la somme supérieure.
        const ctx = repR.ctx;
        ctx.save();
        repR.decoupe();
        ctx.fillStyle = col.accent;
        ctx.globalAlpha = 0.34;
        for (const [u, v, inf, sup] of d.morceaux) ctx.fillRect(repR.X(u), repR.Y(sup), repR.X(v) - repR.X(u), repR.Y(inf) - repR.Y(sup));
        ctx.restore();
        for (const [u, v, , sup] of d.morceaux) repR.trace([[u, sup], [v, sup]], { couleur: col.accent, largeur: 2.6 });
        // Les traits de la subdivision se poursuivent, en tirets, jusqu'à la
        // somme supérieure : on voit la subdivision au-dessus des rectangles.
        d.morceaux.forEach(([u, , inf], k) => {
          const haut = Math.max(d.morceaux[k][3], d.morceaux[k - 1]?.[3] ?? 0);
          const bas = Math.max(inf, d.morceaux[k - 1]?.[2] ?? 0);
          if (haut > bas) repR.trace([[u, bas], [u, haut]], { couleur: col.accent, largeur: 1, tirets: [4, 3] });
        });
        const dernier = d.morceaux[d.morceaux.length - 1];
        if (dernier[3] > dernier[2]) repR.trace([[dernier[1], dernier[2]], [dernier[1], dernier[3]]], { couleur: col.accent, largeur: 1, tirets: [4, 3] });
        dessineFonction(repR, col);
      }
      outils.rendTexte(sommesR, `$S_\\Delta(f) = ${nb(d.inf, 3, chiffres)}$, $S^\\Delta(f) = ${nb(d.sup)}$`);
      outils.rendTexte(ecartR, `Écart : $S^\\Delta(f) - S_\\Delta(f) = ${nb(d.sup - d.inf)}$`);

      // Lebesgue.
      const nouvelleCle = `${r.fonction}|${r.points}|${r.h}`;
      if (nouvelleCle !== cle) {
        cle = nouvelleCle;
        bandes = niveaux(r.fonction, r.points, r.h);
        exacte = integraleExacte(r.fonction, r.points);
      }
      const k = Math.min(bandes.length - 1, Math.max(0, Math.round(r.bande)));
      const choisie = bandes[k];
      if (cadre(repL)) {
        const dd = repL.cadre.y[1];
        // Bande choisie, en aplat orange léger.
        const ctx = repL.ctx;
        ctx.save();
        repL.decoupe();
        ctx.globalAlpha = 0.16;
        ctx.fillStyle = col.perturbation;
        ctx.fillRect(repL.X(repL.cadre.x[0]), repL.Y(Math.min(dd, choisie.y + r.h)), repL.L, repL.Y(choisie.y) - repL.Y(Math.min(dd, choisie.y + r.h)));
        ctx.restore();
        // φ : sur chaque A_k, la hauteur y_k ; son intégrale en aplat.
        const morceaux = bandes.flatMap(({ y, intervalles }) => intervalles.map(([u, v]) => [u, v, y]));
        rectangles(repL, morceaux, { couleur: col.zone });
        rectangles(repL, choisie.intervalles.map(([u, v]) => [u, v, choisie.y]), { couleur: col.perturbation, alpha: 0.35 });
        for (const { y } of bandes) repL.trace([[a, y], [b, y]], { couleur: col.discret, largeur: 0.8, tirets: [3, 4], alpha: 0.7 });
        repL.axes({ noms: ['x', 'y'], grille: false });
        paliers(repL, morceaux, { couleur: col.accent, largeur: 2 });
        dessineFonction(repL, col);
        // A_k sur l'axe des abscisses.
        for (const [u, v] of choisie.intervalles) repL.trace([[u, 0], [v, 0]], { couleur: col.perturbation, largeur: 5 });
        if (choisie.rationnels) {
          for (const q of rationnels(9)) repL.point(q, 1, { rayon: 2.6, couleur: col.perturbation });
          for (const q of rationnels(9)) repL.point(q, 0, { rayon: 2, couleur: col.perturbation });
        }
        repL.texte(repL.cadre.x[0], choisie.y + r.h / 2, `bande ${k}`, { couleur: col.perturbation, dx: 4, dy: 4, fond: true, police: '600 12px system-ui, sans-serif' });
      }
      const L = sommeLebesgue(bandes);
      outils.rendTexte(sommeL, `$\\int \\varphi = \\sum_k y_k\\,\\lambda(A_k) = ${nb(L, 3, chiffres)}$, $\\int f = ${nb(exacte)}$`);
      const morceauxA = choisie.intervalles.length;
      const description = choisie.rationnels
        ? `$A_{${k}} = \\mathbb Q \\cap [0, 1]$, négligeable`
        : choisie.irrationnels
          ? `$A_{${k}} = [0, 1] \\setminus \\mathbb Q$`
          : morceauxA === 0
          ? `$A_{${k}} = \\emptyset$`
          : `$A_{${k}}$ : ${morceauxA} intervalle${morceauxA > 1 ? 's' : ''}`;
      outils.rendTexte(
        bandeL,
        `${description}, $\\lambda(A_{${k}}) = ${nb(choisie.mesure, 3, chiffresEntiers(b - a))}$, contribution $${nb(choisie.y * choisie.mesure)}$`,
      );
    }

    outils.surTheme(dessine);
    dessine();
    return { applique: dessine };
  },
};
