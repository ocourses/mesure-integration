// Tribus sur un ensemble fini (poly, sections 2.1 et 2.2). Sur E = {1, …, 8},
// on choisit jusqu'à trois parties C₁, C₂, C₃ en cliquant dans une matrice
// d'appartenance : deux points ont la même colonne si aucune partie ne les
// sépare. Ces classes sont les atomes de σ(𝒞), qui en est l'ensemble des
// réunions (2^k éléments pour k atomes). Une application f : E → ℝ, dont on
// fait glisser les valeurs, est mesurable si et seulement si elle est
// constante sur chaque atome.

import { Repere } from '../../socle/js/ui/repere.js';
import { couleurs } from '../../socle/js/ui/theme.js';
import { fermeInfobulle } from '../../socle/js/ui/infobulle.js';
import { boutonInfo, carte, glisse, paragraphe, toile, verdict } from './commun.js';

export const TAILLE = 8;
export const F_DEFAUT = '1,1,2.5,2.5,2.5,0.5,0.5,3';
const F_MAX = 4;

// Les points de la partie codée par `masque` (le bit j pour le point j + 1).
export const elements = (masque) => Array.from({ length: TAILLE }, (_, j) => j + 1).filter((x) => (masque >> (x - 1)) & 1);

// Atomes de la tribu engendrée par les parties `masques` : les classes des
// points qui appartiennent aux mêmes parties. Renvoie une liste de listes de
// points, dans l'ordre de leur plus petit élément.
export function atomes(masques) {
  const classes = new Map();
  for (let x = 1; x <= TAILLE; x++) {
    const signature = masques.map((m) => (m >> (x - 1)) & 1).join('');
    if (!classes.has(signature)) classes.set(signature, []);
    classes.get(signature).push(x);
  }
  return [...classes.values()];
}

// Valeurs de f lues dans le réglage `f`, ramenées dans [0, F_MAX].
export function lisValeurs(texte) {
  const v = String(texte).split(',').map(Number);
  if (v.length !== TAILLE || !v.every(Number.isFinite)) return lisValeurs(F_DEFAUT);
  return v.map((y) => Math.min(F_MAX, Math.max(0, y)));
}

// Atomes sur lesquels f n'est pas constante : f n'est mesurable de
// (E, σ(𝒞)) dans (ℝ, 𝓑(ℝ)) que si cette liste est vide. En effet, si f prend
// deux valeurs a ≠ b sur un atome, f⁻¹({a}) coupe cet atome sans le contenir,
// et n'est donc pas une réunion d'atomes.
export function atomesFautifs(valeurs, classes) {
  return classes.filter((a) => a.some((x) => valeurs[x - 1] !== valeurs[a[0] - 1]));
}

// Image réciproque f⁻¹({v}) pour chacune des valeurs prises par f.
export function imagesReciproques(valeurs) {
  const res = new Map();
  valeurs.forEach((v, j) => {
    if (!res.has(v)) res.set(v, []);
    res.get(v).push(j + 1);
  });
  return [...res.entries()].sort((a, b) => a[0] - b[0]);
}

// Code binaire des points : C_i = { x : le bit i de x − 1 vaut 1 }. Avec ces
// trois parties, chaque point est seul dans son atome : σ(𝒞) = 𝒫(E).
const binaire = (i) => Array.from({ length: TAILLE }, (_, j) => ((j >> i) & 1) << j).reduce((a, b) => a | b, 0);

const ensemble = (xs) => (xs.length ? `\\{${xs.join(', ')}\\}` : '\\emptyset');
const fr = (v) => String(v).replace('.', '{,}');

export default {
  etat: { c1: 0b00000111, c2: 0b00111100, c3: 0, f: F_DEFAUT },

  termes: ['application mesurable', 'atome', 'tribu engendrée', 'tribu grossière', 'borélien', 'tribu discrète', 'tribu'],

  rappel: [
    'La tribu engendrée $\\sigma(\\mathcal C)$ est la plus petite tribu qui contient la famille $\\mathcal C$. Pour une seule partie $A$ (Exemple 2.1.2),',
    '$$\\sigma(\\{A\\}) = \\{\\emptyset, A, A^c, E\\}.$$',
    'Si $\\{A_1, \\dots, A_n\\}$ est une partition de $E$ en parties non vides, la tribu engendrée est l’ensemble des réunions de blocs,',
    '$$\\sigma(\\{A_1, \\dots, A_n\\}) = \\Big\\{\\bigcup_{i \\in J} A_i : J \\subset \\{1, \\dots, n\\}\\Big\\},$$',
    'et elle compte $2^n$ éléments. Une telle tribu représente l’information disponible quand on sait seulement dans quel bloc se trouve le résultat d’une expérience.',
    'Sur un ensemble fini, toute famille $\\mathcal C$ définit une telle partition : deux points sont dans le même bloc si aucune partie de $\\mathcal C$ ne les sépare. Ce sont les atomes de $\\sigma(\\mathcal C)$.',
    'Une application $f \\colon (E, \\mathcal A) \\to (\\mathbb R, \\mathcal B(\\mathbb R))$ est mesurable si $f^{-1}(B) \\in \\mathcal A$ pour tout borélien $B$. La mesurabilité dépend des deux tribus : pour la tribu grossière $\\{\\emptyset, E\\}$, seules les constantes sont mesurables ; pour la tribu discrète $\\mathcal P(E)$, toutes les applications le sont.',
  ],

  essais: [
    { texte: 'Une seule partie $A = \\{1, 2, 3\\}$ : on retrouve $\\sigma(\\{A\\}) = \\{\\emptyset, A, A^c, E\\}$, deux atomes et quatre éléments (Exemple 2.1.2).', etat: { c1: 0b00000111, c2: 0, c3: 0 } },
    { texte: 'Deux parties qui se chevauchent, $\\{1, 2, 3, 4\\}$ et $\\{3, 4, 5, 6\\}$ : combien d’atomes ? Combien d’éléments dans la tribu ?', etat: { c1: 0b00001111, c2: 0b00111100, c3: 0 } },
    { texte: 'Aucune partie : c’est la tribu grossière. Faites glisser les valeurs de $f$ : quelles applications sont mesurables ?', etat: { c1: 0, c2: 0, c3: 0, f: '2,2,2,2,2,2,2,2' } },
    { texte: 'Trois parties bien choisies séparent les huit points : c’est la tribu discrète $\\mathcal P(E)$, et toute application est mesurable.', etat: { c1: binaire(0), c2: binaire(1), c3: binaire(2) } },
    { texte: '$f$ n’est pas mesurable : les barres rouges montrent les atomes où elle n’est pas constante. Rendez-la mesurable en déplaçant ses valeurs, ou en ajoutant une partie qui coupe ces atomes.', etat: { c1: 0b00000111, c2: 0b00111100, c3: 0, f: '1,2,2.5,2.5,2.5,0.5,1,3' } },
  ],

  monte(zone, outils) {
    const r = outils.etat;
    const masques = () => [r.c1, r.c2, r.c3].map((m) => Math.max(0, Math.min(255, Math.round(m) || 0)));

    // Couleurs des atomes : les quatre séries, puis l'accent, le violet,
    // l'orange et le gris, en transparence ; le numéro de l'atome est écrit dans
    // sa case, pour ne pas dépendre de la seule couleur.
    const teinte = (col, k) => [...col.series, col.accent, col.equilibre, col.perturbation, col.discret][k % 8];
    const opacite = () => 0.4;

    // ---- Matrice d'appartenance -----------------------------------------------------
    const cM = carte(zone, 'Parties génératrices et atomes');
    boutonInfo(cM, [
      ['zone', '--accent', 'Case pleine : le point $x$ (colonne) appartient à la partie $C_i$ (ligne). Cliquez pour l’ajouter ou le retirer.'],
      ['zone', '--zone-stable', 'Dernière ligne : les atomes de $\\sigma(\\mathcal C)$, un aplat par atome. Deux colonnes identiques sont dans le même atome.'],
    ]);
    const canvasM = toile(cM, '16 / 5', () => dessine());
    canvasM.classList.add('cliquable');
    const repM = new Repere(canvasM, { x: [-1.4, TAILLE + 0.6], y: [-0.2, 5.4], egal: true, marges: { gauche: 4, bas: 4, haut: 4, droite: 4 } });
    const texteM = document.createElement('div');
    texteM.className = 'bloc-maths';
    cM.appendChild(texteM);
    const resume = paragraphe(texteM, '', '');
    const liste = paragraphe(texteM, '', '');

    // ---- Application f ---------------------------------------------------------------------
    const cF = carte(zone, 'Une application $f \\colon E \\to \\mathbb R$');
    boutonInfo(cF, [
      ['zone', '--zone-stable', 'La valeur $f(x)$, de la couleur de l’atome de $x$ : faites glisser le haut d’une barre (pas de $0{,}5$).'],
      ['ligne', '--alerte', 'Un atome sur lequel $f$ n’est pas constante : $f$ n’est pas mesurable.'],
    ]);
    const canvasF = toile(cF, '16 / 5', () => dessine());
    canvasF.classList.add('saisissable');
    const repF = new Repere(canvasF, { x: [-1.4, TAILLE + 0.6], y: [-0.7, F_MAX + 0.3], marges: { gauche: 4, bas: 4, haut: 4, droite: 4 } });
    const texteVerdict = verdict(cF, '');

    // Ligne et colonne des cases : la ligne i (0 en haut) est à la hauteur 4 − i.
    const caseVisee = (x, y) => {
      const colonne = Math.round(x);
      const ligne = Math.round(4 - y);
      if (colonne < 1 || colonne > TAILLE || ligne < 0 || ligne > 2 || Math.abs(x - colonne) > 0.45 || Math.abs(4 - y - ligne) > 0.45) return null;
      return { colonne, ligne };
    };
    let geste = null; // { ligne, ajoute } : un glisser applique le même changement
    glisse(canvasM, repM, {
      prend: (x, y) => {
        const c = caseVisee(x, y);
        if (!c) return false;
        const cle = `c${c.ligne + 1}`;
        geste = { cle, ajoute: !((masques()[c.ligne] >> (c.colonne - 1)) & 1) };
        return true;
      },
      deplace: (x, y) => {
        const c = caseVisee(x, y);
        if (!c || `c${c.ligne + 1}` !== geste.cle) return;
        const m = masques()[c.ligne];
        const bit = 1 << (c.colonne - 1);
        outils.change({ [geste.cle]: geste.ajoute ? m | bit : m & ~bit });
        dessine();
      },
    });

    let barre = -1;
    glisse(canvasF, repF, {
      prend: (x) => {
        barre = Math.round(x);
        return barre >= 1 && barre <= TAILLE && Math.abs(x - barre) < 0.45;
      },
      deplace: (_, y) => {
        const v = lisValeurs(r.f);
        v[barre - 1] = Math.min(F_MAX, Math.max(0, Math.round(y * 2) / 2));
        outils.change({ f: v.join(',') });
        dessine();
      },
    });

    function dessine() {
      const col = couleurs();
      const ms = masques();
      const classes = atomes(ms);
      const atomeDe = (x) => classes.findIndex((a) => a.includes(x));
      const ctx = repM.ctx;

      // Matrice.
      if (repM.prepare()) {
        const s = Math.min(repM.sx, repM.sy) * 0.8;
        const cellule = (x, y, remplie, couleur = col.accent, alpha = 1) => {
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = remplie ? couleur : 'transparent';
          ctx.fillRect(repM.X(x) - s / 2, repM.Y(y) - s / 2, s, s);
          ctx.globalAlpha = 1;
          ctx.strokeStyle = col.discret;
          ctx.lineWidth = 1;
          ctx.strokeRect(repM.X(x) - s / 2, repM.Y(y) - s / 2, s, s);
          ctx.restore();
        };
        const police = "italic 15px 'Latin Modern Roman', 'CMU Serif', Georgia, serif";
        for (let x = 1; x <= TAILLE; x++) repM.texte(x, 5, String(x), { align: 'center', dy: 5, police: '600 13px system-ui, sans-serif' });
        for (let i = 0; i < 3; i++) {
          repM.texte(-1.2, 4 - i, `C${'₁₂₃'[i]}`, { dy: 5, police });
          for (let x = 1; x <= TAILLE; x++) cellule(x, 4 - i, (ms[i] >> (x - 1)) & 1);
        }
        repM.texte(-1.2, 0.6, 'atomes', { dy: 5, police: '13px system-ui, sans-serif', couleur: col.discret });
        for (let x = 1; x <= TAILLE; x++) {
          const k = atomeDe(x);
          cellule(x, 0.6, true, teinte(col, k), opacite(k));
          repM.texte(x, 0.6, String(k + 1), { align: 'center', dy: 4, police: '600 12px system-ui, sans-serif' });
        }
        // Les points d'un même atome sont reliés sous la ligne des atomes.
        for (const a of classes) {
          if (a.length > 1) repM.trace([[a[0], 0.05], [a[a.length - 1], 0.05]], { couleur: col.discret, largeur: 1, alpha: 0.6 });
          for (const x of a) repM.point(x, 0.05, { rayon: 3, couleur: col.discret });
        }
      }
      const k = classes.length;
      outils.rendTexte(resume, `$\\sigma(\\mathcal C)$ a ${k} atome${k > 1 ? 's' : ''}, donc $2^{${k}} = ${2 ** k}$ éléments, les réunions d’atomes.`);
      outils.rendTexte(liste, `Atomes : $${classes.map(ensemble).join(',\\ ')}$.`);
      outils.glossaire(resume, ['atome']);
      fermeInfobulle();

      // Barres de f.
      const v = lisValeurs(r.f);
      const fautifs = atomesFautifs(v, classes);
      if (repF.prepare()) {
        const ctxF = repF.ctx;
        for (let y = 0; y <= F_MAX; y += 1) {
          repF.trace([[0.4, y], [TAILLE + 0.5, y]], { couleur: col.grille, largeur: 1 });
          repF.texte(0.3, y, fr(y), { align: 'right', dy: 4, couleur: col.discret, police: '11px system-ui, sans-serif' });
        }
        for (let x = 1; x <= TAILLE; x++) {
          const kx = atomeDe(x);
          ctxF.save();
          ctxF.globalAlpha = opacite(kx);
          ctxF.fillStyle = teinte(col, kx);
          const l = repF.sx * 0.6;
          ctxF.fillRect(repF.X(x) - l / 2, repF.Y(v[x - 1]), l, repF.Y(0) - repF.Y(v[x - 1]));
          ctxF.restore();
          repF.trace([[x - 0.3, v[x - 1]], [x + 0.3, v[x - 1]]], { couleur: col.accent, largeur: 2.4 });
          repF.texte(x, -0.45, String(x), { align: 'center', dy: 4, police: '600 12px system-ui, sans-serif' });
        }
        for (const a of fautifs) repF.trace([[a[0] - 0.35, -0.12], [a[a.length - 1] + 0.35, -0.12]], { couleur: col.alerte, largeur: 3 });
      }
      texteVerdict.className = `verdict ${fautifs.length ? 'alerte' : 'ok'}`;
      if (fautifs.length) {
        const a = fautifs[0];
        const valeur = v[a[0] - 1];
        const pre = imagesReciproques(v).find(([w]) => w === valeur)[1];
        outils.rendTexte(
          texteVerdict,
          `$f$ n’est pas mesurable : elle n’est pas constante sur l’atome $${ensemble(a)}$, et $f^{-1}(\\{${fr(valeur)}\\}) = ${ensemble(pre)}$ n’est pas une réunion d’atomes.`,
        );
      } else {
        outils.rendTexte(texteVerdict, `$f$ est mesurable : elle est constante sur chacun des ${k} atomes, donc chaque $f^{-1}(B)$ est une réunion d’atomes.`);
      }
    }

    outils.surTheme(dessine);
    dessine();
    return { applique: dessine };
  },
};
