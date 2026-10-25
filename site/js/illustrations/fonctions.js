// Fonctions d'une variable : intégrales numériques, tracé d'un graphe avec ses
// sauts, aire sous une courbe et fonctions en escalier. Les fonctions de calcul
// sont pures (testées sous Node) ; les fonctions de dessin prennent un Repere.

// Intégrale de f sur [a, b] par la méthode de Simpson composite à n pas (n pair).
// Les `coupures` (points de discontinuité de f) découpent [a, b] : Simpson est
// appliqué sur chaque morceau, où f est régulière.
export function integrale(f, a, b, n = 400, coupures = []) {
  if (!(b > a)) return 0;
  const bornes = [a, ...coupures.filter((c) => c > a && c < b).sort((u, v) => u - v), b];
  let somme = 0;
  for (let k = 0; k + 1 < bornes.length; k++) somme += simpson(f, bornes[k], bornes[k + 1], n);
  return somme;
}

function simpson(f, a, b, n) {
  const m = n % 2 ? n + 1 : n;
  const h = (b - a) / m;
  // Les extrémités sont prises juste à l'intérieur : f peut y sauter.
  const e = h * 1e-9;
  let s = f(a + e) + f(b - e);
  for (let i = 1; i < m; i++) s += (i % 2 ? 4 : 2) * f(a + i * h);
  return (s * h) / 3;
}

// Intégrale de f sur [a, +∞[ par changement de
// variable x = a + t / (1 − t), qui ramène l'intervalle à [0, 1[. Renvoie
// l'intégrale sur [a, T] pour un T donné quand `T` est fini.
export function integraleJusque(f, a, T, n = 2000) {
  if (Number.isFinite(T)) return integrale(f, a, T, n);
  return integrale((t) => (t >= 1 ? 0 : f(a + t / (1 - t)) / (1 - t) ** 2), 0, 1, n);
}

// Points d'une fonction sur [a, b], en `n` pas, interrompus aux `sauts` : le
// graphe d'une fonction discontinue n'a pas de trait vertical.
export function echantillons(f, a, b, n = 400, sauts = []) {
  const bornes = [a, ...sauts.filter((c) => c > a && c < b).sort((u, v) => u - v), b];
  const pts = [];
  for (let k = 0; k + 1 < bornes.length; k++) {
    const [u, v] = [bornes[k], bornes[k + 1]];
    const m = Math.max(2, Math.round((n * (v - u)) / (b - a)));
    const e = (v - u) * 1e-9;
    for (let i = 0; i <= m; i++) {
      const x = Math.min(v - e, Math.max(u + e, u + ((v - u) * i) / m));
      pts.push([x, f(x)]);
    }
    if (k + 2 < bornes.length) pts.push([NaN, NaN]);
  }
  return pts;
}

// Graphe de f sur [a, b] (le cadre du repère par défaut).
export function traceFonction(rep, f, { a = rep.cadre.x[0], b = rep.cadre.x[1], n = 500, sauts = [], ...options } = {}) {
  rep.trace(echantillons(f, a, b, n, sauts), options);
}

// Aire entre le graphe de f et l'axe sur [a, b], en aplat ; les valeurs sont
// ramenées dans le cadre, pour qu'une fonction non bornée ne déborde pas.
export function aire(rep, f, { a = rep.cadre.x[0], b = rep.cadre.x[1], n = 500, sauts = [], couleur = rep.col.zone, alpha = 1 } = {}) {
  const [c, d] = rep.cadre.y;
  const borne = (y) => Math.min(d + (d - c), Math.max(c - (d - c), y));
  const ctx = rep.ctx;
  ctx.save();
  rep.decoupe();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = couleur;
  for (const morceau of morceaux(echantillons(f, a, b, n, sauts))) {
    ctx.beginPath();
    ctx.moveTo(rep.X(morceau[0][0]), rep.Y(0));
    for (const [x, y] of morceau) ctx.lineTo(rep.X(x), rep.Y(borne(y)));
    ctx.lineTo(rep.X(morceau[morceau.length - 1][0]), rep.Y(0));
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

// Découpe une liste de points aux points non finis.
function morceaux(pts) {
  const res = [[]];
  for (const p of pts) {
    if (Number.isFinite(p[0]) && Number.isFinite(p[1])) res[res.length - 1].push(p);
    else if (res[res.length - 1].length) res.push([]);
  }
  return res.filter((m) => m.length > 1);
}

// Grille sur les unités : un trait à chaque entier de x et/ou de y, dans le
// cadre [a, b] × [0, H]. Elle ne bouge pas quand f_n change : on voit alors la
// figure se rééchelonner (la grille se resserre quand f_n grandit) ou la bosse
// la traverser (quand elle s'échappe), ce que de simples graduations cachent.
export function grilleUnites(rep, { x = 0, y = 0 } = {}, a, b, H) {
  if (x) for (let t = Math.ceil(a); t <= b; t += x) rep.trace([[t, 0], [t, H]], { couleur: rep.col.grille, largeur: 1 });
  if (y) for (let t = 1; t <= H; t += y) rep.trace([[a, t], [b, t]], { couleur: rep.col.grille, largeur: 1 });
}

// Rectangles [x0, x1] × [0, y] : fonction en escalier ou sommes de Darboux.
// Avec `contour`, chaque rectangle est aussi bordé.
export function rectangles(rep, paliers, { couleur = rep.col.zone, contour = null, alpha = 1, largeur = 1 } = {}) {
  const ctx = rep.ctx;
  ctx.save();
  rep.decoupe();
  for (const [x0, x1, y] of paliers) {
    if (!Number.isFinite(y)) continue;
    const [px, py] = [rep.X(x0), rep.Y(Math.max(0, y))];
    const [l, h] = [rep.X(x1) - px, Math.abs(rep.Y(y) - rep.Y(0))];
    if (couleur) {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = couleur;
      ctx.fillRect(px, py, l, h);
    }
    if (contour) {
      ctx.globalAlpha = 1;
      ctx.strokeStyle = contour;
      ctx.lineWidth = largeur;
      ctx.strokeRect(px, py, l, h);
    }
  }
  ctx.restore();
}

// Paliers d'une fonction en escalier : traits horizontaux, sans trait vertical.
export function paliers(rep, morceaux, { couleur = rep.col.accent, largeur = 2.2 } = {}) {
  for (const [x0, x1, y] of morceaux) rep.trace([[x0, y], [x1, y]], { couleur, largeur });
}

// Intervalles de [a, b] où test(f(x)) est vrai, à partir d'un échantillonnage
// régulier de n pas ; les bords sont placés par interpolation linéaire de f
// entre deux échantillons de part et d'autre d'un seuil donné par `seuils`
// (les valeurs y où le test change). Renvoie [[u, v], …], triés et disjoints.
export function intervallesOu(f, test, a, b, { n = 2000, seuils = [] } = {}) {
  const res = [];
  const xs = Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n);
  const ys = xs.map(f);
  // Bord entre deux échantillons : où f franchit le seuil le plus proche.
  const bord = (i) => {
    const [y0, y1] = [ys[i], ys[i + 1]];
    for (const s of seuils) {
      if ((y0 - s) * (y1 - s) <= 0 && y0 !== y1) return xs[i] + ((s - y0) / (y1 - y0)) * (xs[i + 1] - xs[i]);
    }
    return (xs[i] + xs[i + 1]) / 2;
  };
  let debut = test(ys[0]) ? a : null;
  for (let i = 0; i < n; i++) {
    const [dans, suivant] = [test(ys[i]), test(ys[i + 1])];
    if (dans === suivant) continue;
    const x = bord(i);
    if (suivant) debut = x;
    else {
      res.push([debut, x]);
      debut = null;
    }
  }
  if (debut !== null) res.push([debut, b]);
  return res.filter(([u, v]) => v - u > 1e-12);
}

// Longueur totale d'une réunion d'intervalles disjoints.
export const longueur = (intervalles) => intervalles.reduce((s, [u, v]) => s + (v - u), 0);
