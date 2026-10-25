// Ensembles finis : parties, applications, images directes et réciproques,
// familles de parties et tribus, et leur dessin en diagramme sagittal.
//
// Une partie d'un ensemble à n éléments est codée par un masque : le bit j
// pour le j-ième élément. Une application f : E₁ → E₂ est le tableau des
// indices des images. Sur un ensemble fini, tout se calcule : une tribu est
// l'ensemble des réunions de ses atomes, et σ(𝒞) s'obtient en séparant les
// points que 𝒞 sépare.

import { glisse } from './commun.js';

// ---- Parties --------------------------------------------------------------------------

export const plein = (n) => (1 << n) - 1;
export const contient = (masque, j) => ((masque >> j) & 1) === 1;
export const indices = (masque, n) => Array.from({ length: n }, (_, j) => j).filter((j) => contient(masque, j));
export const cardinal = (masque) => {
  let c = 0;
  for (let m = masque; m; m &= m - 1) c++;
  return c;
};
export const masqueDe = (liste) => liste.reduce((m, j) => m | (1 << j), 0);
export const complementaire = (masque, n) => plein(n) & ~masque;

// Masque lu dans l'URL : entier dans [0, 2ⁿ − 1], sinon `defaut`.
export function lisMasque(v, n, defaut = 0) {
  const m = Math.round(Number(v));
  return Number.isInteger(m) && m >= 0 && m <= plein(n) ? m : defaut;
}

// ---- Applications ---------------------------------------------------------------------

// Application lue dans un texte « 0,0,1,3,3,1 » : n₁ indices dans [0, n₂ − 1],
// sinon l'application `defaut` (même format).
export function lisApplication(texte, n1, n2, defaut) {
  const f = String(texte).split(',').map(Number);
  if (f.length !== n1 || !f.every((y) => Number.isInteger(y) && y >= 0 && y < n2)) return lisApplication(defaut, n1, n2, defaut);
  return f;
}

// f(A) = { f(x) : x ∈ A }.
export const image = (f, A) => f.reduce((m, y, x) => (contient(A, x) ? m | (1 << y) : m), 0);
// f⁻¹(B) = { x : f(x) ∈ B }.
export const imageReciproque = (f, B) => f.reduce((m, y, x) => (contient(B, y) ? m | (1 << x) : m), 0);

export const injective = (f) => new Set(f).size === f.length;
export const surjective = (f, n2) => new Set(f).size === n2;

// Deux points distincts de même image, s'il y en a : [x, x'].
export function collision(f) {
  for (let x = 0; x < f.length; x++) for (let x2 = x + 1; x2 < f.length; x2++) if (f[x] === f[x2]) return [x, x2];
  return null;
}

// ---- Familles de parties et tribus ----------------------------------------------------

// Atomes de σ(𝒞) pour une famille 𝒞 de masques sur n points : deux points sont
// dans le même atome si aucune partie de 𝒞 ne contient l'un sans l'autre.
// Renvoie les atomes (masques non vides), dans l'ordre de leur premier point.
export function atomes(famille, n) {
  const classes = new Map();
  for (let j = 0; j < n; j++) {
    const signature = famille.map((m) => (contient(m, j) ? 1 : 0)).join('');
    classes.set(signature, (classes.get(signature) ?? 0) | (1 << j));
  }
  return [...classes.values()];
}

// Toutes les réunions d'atomes : la tribu, en masques triés.
export function reunions(blocs) {
  const res = [];
  for (let s = 0; s < 1 << blocs.length; s++) res.push(blocs.reduce((m, b, i) => ((s >> i) & 1 ? m | b : m), 0));
  return res.sort((a, b) => a - b);
}

// σ(𝒞) : la plus petite tribu sur {0, …, n − 1} qui contient 𝒞.
export const engendree = (famille, n) => reunions(atomes(famille, n));

// La famille est-elle une tribu ? Sur un ensemble fini, la stabilité par
// réunion dénombrable se ramène à la réunion de deux parties. Renvoie
// { tribu: true } ou le premier axiome en défaut avec ses témoins :
// { axiome: 'plein' } (E manque), { axiome: 'complementaire', A }
// (A est là, Aᶜ non) ou { axiome: 'reunion', A, B } (A et B sont là, A ∪ B non).
export function verifieTribu(famille, n) {
  const dedans = new Set(famille);
  if (!dedans.has(plein(n))) return { tribu: false, axiome: 'plein' };
  const tries = [...dedans].sort((a, b) => cardinal(a) - cardinal(b) || a - b);
  for (const A of tries) if (!dedans.has(complementaire(A, n))) return { tribu: false, axiome: 'complementaire', A };
  for (const A of tries) for (const B of tries) if (A < B && !dedans.has(A | B)) return { tribu: false, axiome: 'reunion', A, B };
  return { tribu: true };
}

// Une étape de fermeture : on ajoute à la famille les complémentaires et les
// réunions deux à deux de ses membres. Sur un ensemble fini, répétée à partir
// d'une famille 𝒞 non vide, elle s'arrête sur σ(𝒞) après un nombre fini
// d'étapes (A ∪ Aᶜ = E y entre dès la deuxième).
export function etape(famille, n) {
  const dedans = new Set(famille);
  const nouvelle = new Set(dedans);
  for (const A of dedans) nouvelle.add(complementaire(A, n));
  for (const A of dedans) for (const B of dedans) nouvelle.add(A | B);
  return [...nouvelle].sort((a, b) => a - b);
}

// Tribu sur E₁ image réciproque d'une tribu 𝒜₂ (liste de masques) : { f⁻¹(B) : B ∈ 𝒜₂ }.
export const tribuReciproque = (f, tribu2) => [...new Set(tribu2.map((B) => imageReciproque(f, B)))].sort((a, b) => a - b);

// Tribu image sur E₂ d'une tribu 𝒜₁ : { B ⊂ E₂ : f⁻¹(B) ∈ 𝒜₁ }.
export function tribuImage(f, tribu1, n2) {
  const dedans = new Set(tribu1);
  const res = [];
  for (let B = 0; B <= plein(n2); B++) if (dedans.has(imageReciproque(f, B))) res.push(B);
  return res;
}

// Famille { f(A) : A ∈ 𝒜₁ } (en général pas une tribu, Remarque 2.1.5).
export const familleImage = (f, tribu1) => [...new Set(tribu1.map((A) => image(f, A)))].sort((a, b) => a - b);

// Atomes d'une tribu donnée par la liste de ses membres : ses membres non vides
// minimaux.
export const atomesDeTribu = (tribu) => tribu.filter((A) => A && !tribu.some((B) => B && B !== A && (B & A) === B));

// Blocs d'une partition lue dans un texte « 1,1,2,2,3,1 » (le numéro du bloc
// de chaque point, de 1 à k) : masques non vides, dans l'ordre des numéros.
export function lisPartition(texte, n, defaut) {
  const v = String(texte).split(',').map(Number);
  if (v.length !== n || !v.every((b) => Number.isInteger(b) && b >= 1 && b <= n)) return lisPartition(defaut, n, defaut);
  const blocs = new Map();
  v.forEach((b, j) => blocs.set(b, (blocs.get(b) ?? 0) | (1 << j)));
  return [...blocs.entries()].sort((a, b) => a[0] - b[0]).map(([, m]) => m);
}

// Numéros de bloc d'une partition, ramenés à 1, 2, … dans l'ordre de première
// apparition (une même partition a ainsi une seule écriture).
export function normalise(etiquettes) {
  const nouveaux = new Map();
  return etiquettes.map((b) => {
    if (!nouveaux.has(b)) nouveaux.set(b, nouveaux.size + 1);
    return nouveaux.get(b);
  });
}

// Numéros de bloc lus dans un texte « 1,1,2,2,3,1 », sinon ceux de `defaut`.
export function lisEtiquettes(texte, n, defaut) {
  const v = String(texte).split(',').map(Number);
  if (v.length !== n || !v.every((b) => Number.isInteger(b) && b >= 1 && b <= n)) return lisEtiquettes(defaut, n, defaut);
  return normalise(v);
}

// Blocs (masques) d'une partition donnée par ses numéros.
export const blocsDe = (etiquettes) => {
  const blocs = [];
  etiquettes.forEach((b, j) => (blocs[b - 1] = (blocs[b - 1] ?? 0) | (1 << j)));
  return blocs;
};

// Clic sur le point j : il passe dans le bloc suivant, puis dans un bloc à lui
// seul, puis revient au premier bloc.
export function blocSuivant(etiquettes, j) {
  const k = Math.max(...etiquettes);
  const b = etiquettes[j];
  const seul = etiquettes.filter((c) => c === b).length === 1;
  const max = seul ? k : Math.min(etiquettes.length, k + 1);
  const v = etiquettes.slice();
  v[j] = b + 1 <= max ? b + 1 : 1;
  return normalise(v);
}

// ---- Écriture -------------------------------------------------------------------------

// Noms des points : 1, 2, … pour E₁ ; a, b, … pour E₂.
export const NOMS_1 = ['1', '2', '3', '4', '5', '6', '7', '8'];
export const NOMS_2 = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

// Partie en LaTeX : \{1, 3\} ou \emptyset.
export function latexPartie(masque, noms, n = noms.length) {
  const xs = indices(masque, n).map((j) => noms[j]);
  return xs.length ? `\\{${xs.join(', ')}\\}` : '\\emptyset';
}

// Famille en LaTeX : \{\emptyset, \{1\}, …\}.
export const latexFamille = (famille, noms, n = noms.length) => `\\{${famille.map((m) => latexPartie(m, noms, n)).join(',\\ ')}\\}`;

// ---- Dessin d'un diagramme sagittal ---------------------------------------------------

// Positions des points de E₁ (à gauche, x = 1) et de E₂ (à droite, x = 4),
// répartis verticalement et centrés dans [0, hauteur].
export function positions(n, x, hauteur) {
  const pas = hauteur / Math.max(n, 1);
  return Array.from({ length: n }, (_, j) => [x, hauteur - pas * (j + 0.5)]);
}

// Indice du point de `pts` à moins de `rayon` pixels de (x, y), ou −1.
//
// Avec `cote` (−1 à gauche, +1 à droite), les étiquettes écrites de ce côté du
// point (le numéro de son bloc, son nom dans une partie) comptent comme le
// point : cliquer dessus revient à cliquer sur lui.
export function pointVise(rep, pts, x, y, rayon = 18, cote = 0) {
  let meilleur = -1;
  let dMin = rayon;
  pts.forEach(([px, py], j) => {
    const [dx, dy] = [(x - px) * rep.sx, (y - py) * rep.sy];
    let d = Math.hypot(dx, dy);
    if (cote && Math.abs(dy) <= 10 && dx * cote >= 12 && dx * cote <= 50) d = Math.min(d, rayon - 1);
    if (d < dMin) [meilleur, dMin] = [j, d];
  });
  return meilleur;
}

// Contour arrondi d'un ensemble (sa « patate ») autour de ses points, avec son nom.
export function contour(rep, pts, nom, { couleur = rep.col.discret, marge = 0.45 } = {}) {
  const ctx = rep.ctx;
  const xs = pts.map(([x]) => x);
  const ys = pts.map(([, y]) => y);
  const [x0, x1] = [Math.min(...xs) - marge, Math.max(...xs) + marge];
  const [y0, y1] = [Math.min(...ys) - marge, Math.max(...ys) + marge];
  ctx.save();
  ctx.strokeStyle = couleur;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  const l = (x1 - x0) * rep.sx;
  ctx.roundRect(rep.X(x0), rep.Y(y1), l, (y1 - y0) * rep.sy, Math.min(l / 2, 22));
  ctx.stroke();
  ctx.restore();
  rep.texte((x0 + x1) / 2, y1, nom, { align: 'center', dy: -6, couleur, police: "italic 15px 'Latin Modern Roman', 'CMU Serif', Georgia, serif" });
}

// Point d'un ensemble, avec son nom écrit dedans ; `remplissage` le teinte
// (la couleur de son bloc, par exemple).
export function point(rep, [x, y], nom, { rayon = 11, remplissage = null } = {}) {
  const ctx = rep.ctx;
  ctx.save();
  ctx.beginPath();
  ctx.arc(rep.X(x), rep.Y(y), rayon, 0, 2 * Math.PI);
  ctx.fillStyle = rep.col.fond;
  ctx.fill();
  if (remplissage) {
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = remplissage;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.strokeStyle = rep.col.trait;
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.restore();
  // Une lettre est une variable, en italique ; un chiffre reste droit.
  const style = /^[a-z]$/i.test(nom) ? 'italic ' : '';
  rep.texte(x, y, nom, { align: 'center', dy: 4.5, police: `${style}14px 'Latin Modern Roman', 'CMU Serif', Georgia, serif` });
}

// Halo plein autour d'un point (l'ensemble calculé).
export function halo(rep, [x, y], couleur, { rayon = 17, alpha = 0.35 } = {}) {
  const ctx = rep.ctx;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = couleur;
  ctx.beginPath();
  ctx.arc(rep.X(x), rep.Y(y), rayon, 0, 2 * Math.PI);
  ctx.fill();
  ctx.restore();
}

// Anneau autour d'un point (un autre ensemble, ou un point fautif).
export function anneau(rep, [x, y], couleur, { rayon = 15, largeur = 2, tirets = [] } = {}) {
  const ctx = rep.ctx;
  ctx.save();
  ctx.strokeStyle = couleur;
  ctx.lineWidth = largeur;
  ctx.setLineDash(tirets);
  ctx.beginPath();
  ctx.arc(rep.X(x), rep.Y(y), rayon, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.restore();
}

// Étiquette d'appartenance à une partie choisie : un petit carré coloré portant
// le nom de la partie, à côté du point (`cote` : −1 à gauche, +1 à droite) ;
// `rang` décale les étiquettes de plusieurs parties.
export function etiquette(rep, [x, y], texte, couleur, { cote = -1, rang = 0 } = {}) {
  const ctx = rep.ctx;
  const t = 17;
  const l = texte.length > 1 ? 22 : t;
  const px = rep.X(x) + cote * (24 + rang * (l + 3)) - l / 2 + (cote > 0 ? (l - t) / 2 : -(l - t) / 2);
  const py = rep.Y(y) - t / 2;
  ctx.save();
  ctx.fillStyle = couleur;
  ctx.beginPath();
  ctx.roundRect(px, py, l, t, 4);
  ctx.fill();
  ctx.fillStyle = rep.col.fond;
  ctx.font = '600 11px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(texte, px + l / 2, py + t / 2 + 4);
  ctx.restore();
}

// Flèche d'un point à un autre (ou vers un point quelconque), arrêtée au bord
// du disque d'arrivée.
export function fleche(rep, [x0, y0], [x1, y1], { couleur = rep.col.discret, largeur = 1.4, rayon = 12, tirets = [] } = {}) {
  const [dx, dy] = [(x1 - x0) * rep.sx, (y1 - y0) * rep.sy];
  const d = Math.hypot(dx, dy);
  if (d < 1e-9) return;
  const recul = (r) => [x1 - ((x1 - x0) * r) / d, y1 - ((y1 - y0) * r) / d];
  const depart = [x0 + ((x1 - x0) * 12) / d, y0 + ((y1 - y0) * 12) / d];
  const bout = recul(rayon);
  rep.trace([depart, bout], { couleur, largeur, tirets });
  rep.pointe(...bout, x1 - x0, y1 - y0, { couleur, taille: 8 });
}

// ---- Diagramme interactif ---------------------------------------------------------------

// Gestes sur un diagramme sagittal : un clic sur un point de E₂ appelle
// clique('B', j) ; un geste parti d'un point x de E₁ redirige sa flèche s'il
// est glissé jusqu'à un point de E₂ (ecrisF reçoit la nouvelle application),
// et vaut un clic, clique('A', x), s'il reste sur place. Renvoie l'état du
// geste en cours, { x, pointeur, bouge }, que le dessin lit pour tracer la
// flèche provisoire.
export function gestesDiagramme(canvas, rep, { P1, P2, lisF, ecrisF, clique, redessine }) {
  const etat = { geste: null };
  glisse(canvas, rep, {
    prend: (x, y) => {
      const j2 = pointVise(rep, P2, x, y, 18, 1);
      if (j2 >= 0) {
        clique('B', j2);
        return false;
      }
      const j1 = pointVise(rep, P1, x, y, 18, -1);
      if (j1 < 0) return false;
      etat.geste = { x: j1, depart: [x, y], pointeur: [x, y], bouge: false };
      return true;
    },
    deplace: (x, y) => {
      const g = etat.geste;
      if (!g) return;
      g.pointeur = [x, y];
      if (Math.hypot((x - g.depart[0]) * rep.sx, (y - g.depart[1]) * rep.sy) > 8) g.bouge = true;
      redessine();
    },
    relache: () => {
      const g = etat.geste;
      etat.geste = null;
      if (!g) return;
      const j2 = pointVise(rep, P2, ...g.pointeur, 26);
      if (g.bouge && j2 >= 0) {
        const f = lisF();
        f[g.x] = j2;
        ecrisF(f);
      } else if (!g.bouge) {
        clique('A', g.x);
        return;
      }
      redessine();
    },
  });
  canvas.addEventListener('pointermove', (ev) => {
    const [x, y] = rep.versMonde(ev);
    canvas.classList.toggle('saisissable', pointVise(rep, P1, x, y) >= 0);
  });
  return etat;
}

// Flèches de f, sauf celle que l'on déplace, et la flèche provisoire du geste.
// `style(x, y)` donne { couleur, largeur } de la flèche x → y.
export function dessineFleches(rep, P1, P2, f, geste, style) {
  f.forEach((y, x) => {
    if (geste?.bouge && geste.x === x) return;
    fleche(rep, P1[x], P2[y], style(x, y));
  });
  if (geste?.bouge) fleche(rep, P1[geste.x], geste.pointeur, { couleur: rep.col.perturbation, largeur: 2, rayon: 0, tirets: [5, 4] });
}
