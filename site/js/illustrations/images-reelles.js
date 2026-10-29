// Lire une image réciproque sur ℝ (poly, section 2.2 : Proposition 2.2.3 et
// Exemple 2.2.4, Proposition 2.2.6 ; TD1, exercice 1). On fait glisser des
// niveaux sur l'axe des ordonnées, et la page dessine sur l'axe des abscisses
// les ensembles {f ≥ c}, {f ≤ d}, leur intersection, et ce qu'ils deviennent
// pour une fonction croissante, pour un sup de fonctions, et pour la
// comparaison de deux fonctions.
//
// Quatre modes :
//   - intervalle : f⁻¹([c, d]) = {f ≥ c} ∩ {f ≤ d} ;
//   - monotone : {f ≤ a} est une demi-droite, ouverte ou fermée (Exemple 2.2.4) ;
//   - sup : {sup_n f_n ≤ a} = ⋂_n {f_n ≤ a} (Proposition 2.2.6) ;
//   - comparaison : {f₁ < f₂} = ⋃_q {f₁ < q} ∩ {q < f₂}, sur les q de pas 1/N.

import { latexIntervalle, latexNombre, latexPositifFixe } from '../../socle/js/ui/format.js';
import { fermeInfobulle } from '../../socle/js/ui/infobulle.js';
import { Repere } from '../../socle/js/ui/repere.js';
import { couleurs } from '../../socle/js/ui/theme.js';
import { champ } from '../../socle/js/ui/controls.js';
import { barreOutils, boutonInfo, carte, choixRadios, glisse, paragraphe, toile, verdict } from './commun.js';
import { intervallesOu, longueur, traceFonction } from './fonctions.js';

export const X_MAX = 6;
const Y_MAX = 4;
const nb = (v) => latexPositifFixe(v, 2, 1);

// ---- Les fonctions ----------------------------------------------------------------------

export const oscillante = (x) => 2 + Math.sin(1.3 * x) + 0.5 * Math.sin(3.1 * x);

// Croissante, avec un saut en 2 (de 1 à 2, f(2) = 2) et un palier à 2,5 sur [3, 4].
export function croissante(x) {
  if (x < 2) return x / 2;
  if (x < 3) return 1 + x / 2;
  if (x <= 4) return 2.5;
  return 2.5 + (x - 4) / 2;
}

// {croissante ≤ a} = ]−∞, c] ou ]−∞, c[ : { c, ferme }. On calcule
// c = sup { x : f(x) ≤ a } cas par cas, et la demi-droite est fermée si f(c) ≤ a.
export function demiDroite(a) {
  let c;
  if (a < 1) c = 2 * a;
  else if (a < 2) c = 2;
  else if (a < 2.5) c = 2 * a - 2;
  else if (a === 2.5) c = 4;
  else c = 4 + 2 * (a - 2.5);
  return { c, ferme: croissante(c) <= a };
}

// Niveaux remarquables de la fonction croissante : bas et haut du saut, palier.
export const NIVEAUX_CROISSANTE = [1, 2, 2.5];

export const BOSSES = [
  { m: 1, h: 2.2 },
  { m: 2.6, h: 3.1 },
  { m: 4, h: 1.6 },
  { m: 5.2, h: 2.7 },
];
export const bosse = ({ m, h }) => (x) => 0.3 + h * Math.exp(-(((x - m) / 0.55) ** 2));
export const sup = (x) => Math.max(...BOSSES.map((b) => bosse(b)(x)));

export const f1 = (x) => 1.6 + 0.9 * Math.sin(1.1 * x);
export const f2 = (x) => 2.1 - 0.15 * x + 0.7 * Math.cos(1.6 * x);

// Réunion des {f₁ < q} ∩ {q < f₂} pour les q de pas 1/N entre 0 et Y_MAX : un
// point x y est si un q de la grille sépare f₁(x) et f₂(x).
export function reunionGrille(N, x) {
  const [u, v] = [f1(x), f2(x)];
  if (!(u < v)) return false;
  const q = Math.floor(u * N + 1) / N; // le premier q > u de la grille
  return q < v;
}

// Intervalles de [0, X_MAX] où un test sur x est vrai.
const ou = (test, seuils = []) => intervallesOu((x) => x, test, 0, X_MAX, { n: 3000, seuils });
const surY = (f, test, seuils) => intervallesOu(f, test, 0, X_MAX, { n: 3000, seuils });

// Écriture d'une réunion d'intervalles [u, v] de [0, X_MAX].
export function latexIntervalles(ints) {
  if (!ints.length) return '\\emptyset';
  return ints
    .slice(0, 4)
    .map(([u, v]) => latexIntervalle(u, v))
    .join(' \\cup ')
    .concat(ints.length > 4 ? ' \\cup \\dots' : '');
}

// Niveau visé à la souris : arrondi à 0,05, et aimanté sur les niveaux donnés.
export function niveau(y, aimants = [], tolerance = 0.06) {
  const v = Math.min(Y_MAX - 0.05, Math.max(0.05, y));
  const proche = aimants.find((a) => Math.abs(v - a) < tolerance);
  return proche ?? Math.round(v * 20) / 20;
}

const MODES = { intervalle: 'Un intervalle', monotone: 'Une fonction croissante', sup: 'Un sup', comparaison: 'Comparer deux fonctions' };

export default {
  etat: { mode: 'intervalle', c: 1.5, d: 2.5, a: 1.5, q: 2, N: 4 },

  choix: { mode: Object.keys(MODES) },

  termes: ['image réciproque', 'borélien', 'application mesurable'],

  rappel: [
    'Pour $f \\colon \\mathbb R \\to \\mathbb R$ et $B \\subset \\mathbb R$, l’image réciproque $f^{-1}(B)$ se lit sur le graphe : on trace $B$ sur l’axe des ordonnées, et l’on garde les abscisses des points du graphe qui tombent en face.',
    'Pour montrer qu’une fonction est borélienne, il suffit de contrôler les images réciproques d’une famille qui engendre $\\mathcal B(\\mathbb R)$, par exemple les demi-droites $\\mathopen{]}-\\infty, a]$ : il suffit que les ensembles $\\{f \\le a\\}$ soient des boréliens (Proposition 2.2.3). Pour une fonction croissante, $\\{f \\le a\\}$ est $\\emptyset$, $\\mathbb R$, ou une demi-droite, ouverte ou fermée (Exemple 2.2.4).',
    'Les opérations sur les fonctions se traduisent en opérations sur les ensembles : « pour tout $n$ » devient une intersection, « il existe » une réunion. Ainsi',
    '$$\\{\\sup_n f_n \\le a\\} = \\bigcap_n \\{f_n \\le a\\},$$',
    'ce qui rend $\\sup_n f_n$ mesurable (Proposition 2.2.6) ; et',
    '$$\\{f_1 < f_2\\} = \\bigcup_{q \\in \\mathbb Q} \\{f_1 < q\\} \\cap \\{q < f_2\\},$$',
    'car entre $f_1(x) < f_2(x)$ se glisse un rationnel, et la réunion est dénombrable (TD1, exercice 1).',
  ],

  essais: [
    { texte: 'Faites glisser $c$ et $d$ : $f^{-1}([c, d])$ se découpe en un intervalle par passage du graphe dans la bande. Combien d’intervalles pour $c = 1{,}5$ et $d = 2{,}5$ ?', etat: { mode: 'intervalle', c: 1.5, d: 2.5 } },
    { texte: 'Les deux premières lignes du bas sont $\\{f \\ge c\\}$ et $\\{f \\le d\\}$, la troisième leur intersection. Pourquoi $f^{-1}([c, d]) = f^{-1}([c, +\\infty\\mathclose{[}) \\cap f^{-1}(\\mathopen{]}-\\infty, d])$ ?', etat: { mode: 'intervalle', c: 1, d: 3 } },
    { texte: 'Fonction croissante (Exemple 2.2.4) : $\\{f \\le a\\}$ est une demi-droite. Avec $a = 1{,}5$, dans le saut, est-elle ouverte ou fermée en $2$ ?', etat: { mode: 'monotone', a: 1.5 } },
    { texte: 'Depuis $a = 2{,}3$, montez jusqu’au palier $a = 2{,}5$ : jusqu’où va la demi-droite ?', etat: { mode: 'monotone', a: 2.3 } },
    { texte: 'Un sup de quatre bosses (Proposition 2.2.6) : $x$ est dans $\\{\\sup_n f_n \\le a\\}$ si et seulement si $x$ est dans chaque $\\{f_n \\le a\\}$. Faites glisser $a$ et comparez les lignes du bas.', etat: { mode: 'sup', a: 1.8 } },
    { texte: 'TD1, exercice 1 : faites glisser $q$, chaque $q$ donne le morceau $\\{f_1 < q\\} \\cap \\{q < f_2\\}$. Avec $N = 2$, la réunion sur les $q$ de pas $1/2$ manque des points de $\\{f_1 < f_2\\}$ : lesquels ?', etat: { mode: 'comparaison', q: 2, N: 2 } },
    { texte: 'Depuis $N = 2$, augmentez $N$ : la longueur manquante diminue. Pourquoi faut-il tous les rationnels, et pourquoi leur dénombrabilité compte-t-elle ?', etat: { mode: 'comparaison', q: 2, N: 2 } },
  ],

  monte(zone, outils) {
    const r = outils.etat;

    const barre = barreOutils(zone);
    const choixMode = choixRadios(barre, {
      nom: 'mode',
      options: Object.entries(MODES).map(([valeur, texte]) => ({ valeur, texte })),
      change: (valeur) => {
        outils.change({ mode: valeur });
        dessine();
      },
    });

    const grille = document.createElement('div');
    grille.className = 'grille-2 principale';
    zone.appendChild(grille);

    // ---- Le graphe et les ensembles --------------------------------------------------------
    const cG = carte(grille, 'Le graphe et les ensembles lus en abscisse');
    boutonInfo(cG, [
      ['ligne', '--texte', 'Le graphe de $f$ (ou des $f_n$, de $f_1$ et $f_2$).'],
      ['tirets', '--perturbation', 'Les niveaux $c$, $d$, $a$ ou $q$ : faites-les glisser verticalement sur la figure.'],
      ['zone', '--accent', 'L’ensemble cherché, sur l’axe des abscisses et dans la dernière ligne du bas.'],
      ['ligne', '--discret', 'Les lignes grises du bas : les ensembles dont il est l’intersection ou la réunion.'],
      ['ligne', '--serie-3', 'Comparer : la fonction $f_2$, la fonction $f_1$ étant en noir.'],
      ['ligne', '--equilibre', 'Comparer : l’ensemble $\\{f_1 < f_2\\}$, que la réunion doit remplir.'],
    ]);
    const reglage = document.createElement('div');
    cG.appendChild(reglage);
    const champN = champ(reglage, { latex: 'N', min: 1, max: 12, pas: 1, valeur: r.N }, (v) => {
      outils.change({ N: Math.min(12, Math.max(1, Math.round(v))) });
      dessine();
    });
    const canvas = toile(cG, '4 / 3', () => dessine());
    canvas.classList.add('saisissable');
    const rep = new Repere(canvas, { x: [-1.25, X_MAX + 0.2], y: [-2.3, Y_MAX + 0.1], marges: { gauche: 6, bas: 6, haut: 6, droite: 8 } });

    const cL = carte(grille, 'Ce que l’on lit');
    const bloc = document.createElement('div');
    bloc.className = 'bloc-maths';
    cL.appendChild(bloc);
    const lignes = [0, 1].map(() => paragraphe(bloc, '', ''));
    const texteVerdict = verdict(cL, '');
    const cJ = document.createElement('div');
    cL.appendChild(cJ);
    const justification = [0, 1].map(() => paragraphe(cJ, '', 'note'));

    // Les niveaux réglables de chaque mode.
    const niveaux = () => ({ intervalle: ['c', 'd'], monotone: ['a'], sup: ['a'], comparaison: ['q'] })[r.mode] ?? ['c', 'd'];
    let saisi = null;
    glisse(canvas, rep, {
      prend: (_, y) => {
        if (y < 0) return false;
        const cles = niveaux();
        saisi = cles.reduce((m, k) => (Math.abs(r[k] - y) < Math.abs(r[m] - y) ? k : m), cles[0]);
        return true;
      },
      deplace: (_, y) => {
        const aimants = r.mode === 'monotone' ? NIVEAUX_CROISSANTE : [];
        let v = niveau(y, aimants);
        // c reste sous d.
        if (saisi === 'c') v = Math.min(v, r.d);
        if (saisi === 'd') v = Math.max(v, r.c);
        outils.change({ [saisi]: v });
        dessine();
      },
    });

    // Ligne du bas numéro i (0 en haut) : un ensemble de [0, X_MAX], avec son nom.
    const yLigne = (i) => -0.5 - 0.42 * i;
    function ligne(i, nom, ints, couleur, { largeur = 6 } = {}) {
      rep.texte(-0.12, yLigne(i), nom, { align: 'right', dy: 4, police: '13px system-ui, sans-serif', couleur: rep.col.trait });
      rep.trace([[0, yLigne(i)], [X_MAX, yLigne(i)]], { couleur: rep.col.grille, largeur: 1 });
      for (const [u, v] of ints) rep.trace([[u, yLigne(i)], [v, yLigne(i)]], { couleur, largeur });
    }
    function niveauTrace(y, nom) {
      rep.trace([[0, y], [X_MAX, y]], { couleur: rep.col.perturbation, largeur: 1.6, tirets: [6, 4] });
      rep.texte(-0.08, y, nom, { align: 'right', dy: 4, couleur: rep.col.perturbation, police: "italic 600 14px 'Latin Modern Roman', Georgia, serif", fond: true });
    }
    // Axes du graphe seul (pas sous les lignes du bas).
    function axes() {
      const col = rep.col;
      rep.trace([[0, 0], [X_MAX, 0]], { couleur: col.discret, largeur: 1 });
      rep.trace([[0, 0], [0, Y_MAX]], { couleur: col.discret, largeur: 1 });
      for (let x = 0; x <= X_MAX; x++) rep.texte(x, 0, String(x), { align: 'center', dy: 14, couleur: col.discret, police: '11px system-ui, sans-serif' });
      for (let y = 1; y <= Y_MAX - 1; y++) rep.texte(-0.08, y, String(y), { align: 'right', dy: 4, couleur: col.discret, police: '11px system-ui, sans-serif' });
    }
    // Bandes verticales légères au-dessus d'un ensemble, pour le relier au graphe.
    function bandes(ints, couleur) {
      const ctx = rep.ctx;
      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = couleur;
      for (const [u, v] of ints) ctx.fillRect(rep.X(u), rep.Y(Y_MAX), rep.X(v) - rep.X(u), rep.Y(0) - rep.Y(Y_MAX));
      ctx.restore();
    }

    // La justification ne change qu'avec le mode : elle n'est reconstruite (et
    // soulignée) qu'à ce moment, pour que ses bulles restent utilisables.
    let justifiee = null;
    function ecrisJustification(textes) {
      if (justifiee === r.mode) return;
      justifiee = r.mode;
      justification.forEach((el, i) => outils.rendTexte(el, textes[i] ?? ''));
      outils.glossaire(cJ, ['formules de Hausdorff', 'borélien', 'application mesurable']);
      fermeInfobulle();
    }

    function dessine() {
      const col = couleurs();
      const mode = MODES[r.mode] ? r.mode : 'intervalle';
      const N = Math.min(12, Math.max(1, Math.round(r.N) || 1));
      choixMode.fixe(mode);
      champN.fixe(N);
      reglage.style.visibility = mode === 'comparaison' ? 'visible' : 'hidden';
      const borne = (v) => Math.min(Y_MAX, Math.max(0, Number(v) || 0));
      const [c, d, a, q] = [borne(r.c), Math.max(borne(r.c), borne(r.d)), borne(r.a), borne(r.q)];
      const ecris = (els, textes) => els.forEach((el, i) => outils.rendTexte(el, textes[i] ?? ''));
      if (!rep.prepare()) return;
      axes();

      if (mode === 'intervalle') {
        const sup_c = surY(oscillante, (y) => y >= c, [c]);
        const inf_d = surY(oscillante, (y) => y <= d, [d]);
        const B = surY(oscillante, (y) => y >= c && y <= d, [c, d]);
        bandes(B, col.accent);
        // B sur l'axe des ordonnées.
        rep.trace([[0, c], [0, d]], { couleur: col.perturbation, largeur: 6 });
        traceFonction(rep, oscillante, { a: 0, b: X_MAX, couleur: col.trait, largeur: 2 });
        niveauTrace(c, 'c');
        niveauTrace(d, 'd');
        for (const [u, v] of B) rep.trace([[u, 0], [v, 0]], { couleur: col.accent, largeur: 5 });
        ligne(0, '{f ≥ c}', sup_c, col.discret, { largeur: 4 });
        ligne(1, '{f ≤ d}', inf_d, col.discret, { largeur: 4 });
        ligne(2, 'f⁻¹([c, d])', B, col.accent);
        ecris(lignes, [
          `$f^{-1}(${latexIntervalle(c, d, { chiffres: 2 })}) = ${latexIntervalles(B)}$ : ${B.length} intervalle${B.length > 1 ? 's' : ''}.`,
          `$\\{f \\ge c\\} = ${latexIntervalles(sup_c)}$ et $\\{f \\le d\\} = ${latexIntervalles(inf_d)}$.`,
          '',
        ]);
        texteVerdict.className = 'verdict ok';
        outils.rendTexte(texteVerdict, 'Les bords des intervalles sont les points où le graphe traverse $y = c$ ou $y = d$ : comme $f$ est continue, $f^{-1}([c, d])$ est un fermé, donc un borélien.');
        ecrisJustification([
          '$[c, d] = [c, +\\infty\\mathclose{[} \\cap \\mathopen{]}-\\infty, d]$, et l’image réciproque commute avec l’intersection (formules de Hausdorff) : $x \\in f^{-1}([c, d]) \\iff f(x) \\ge c$ et $f(x) \\le d$.',
          'Chaque passage du graphe dans la bande donne un intervalle : il y en a autant que de traversées de la bande.',
        ]);
      } else if (mode === 'monotone') {
        const { c: bord, ferme } = demiDroite(a);
        const visible = Math.min(bord, X_MAX);
        bandes([[0, visible]], col.accent);
        traceFonction(rep, croissante, { a: 0, b: X_MAX, sauts: [2], couleur: col.trait, largeur: 2 });
        rep.point(2, 1, { rayon: 4, couleur: col.trait, plein: false });
        rep.point(2, 2, { rayon: 4, couleur: col.trait });
        niveauTrace(a, 'a');
        // La demi-droite ]−∞, c] ou ]−∞, c[, prolongée vers la gauche par une flèche.
        rep.trace([[-0.3, 0], [visible, 0]], { couleur: col.accent, largeur: 5 });
        rep.pointe(-0.45, 0, -1, 0, { couleur: col.accent, taille: 10 });
        if (bord <= X_MAX) rep.point(bord, 0, { rayon: 5, couleur: col.accent, plein: ferme });
        ligne(0, '{f ≤ a}', [[0, visible]], col.accent);
        const intervalle = `\\mathopen{]}-\\infty, ${latexNombre(bord, 3)}${ferme ? ']' : '\\mathclose{[}'}`;
        ecris(lignes, [
          `$a = ${nb(a)}$ : $\\{f \\le a\\} = ${intervalle}$.`,
          ferme ? `La demi-droite est fermée : $f(${latexNombre(bord, 3)}) = ${latexNombre(croissante(bord), 3)} \\le a$.` : `La demi-droite est ouverte : $a$ est dans le saut, $f(x) \\le a$ pour $x < 2$, mais $f(2) = 2 > a$.`,
          '',
        ]);
        texteVerdict.className = 'verdict ok';
        outils.rendTexte(texteVerdict, 'Dans tous les cas, $\\{f \\le a\\}$ est un borélien : $f$ est borélienne, sans être continue.');
        ecrisJustification([
          'Si $y \\in \\{f \\le a\\}$ et $x \\le y$, alors $f(x) \\le f(y) \\le a$ : l’ensemble contient tout ce qui est à gauche de ses points. C’est donc $\\emptyset$, $\\mathbb R$, ou une demi-droite $\\mathopen{]}-\\infty, c\\mathclose{[}$ ou $\\mathopen{]}-\\infty, c]$ (Exemple 2.2.4).',
          'Les demi-droites $\\mathopen{]}-\\infty, a]$ engendrent $\\mathcal B(\\mathbb R)$ : contrôler les $\\{f \\le a\\}$ suffit (Proposition 2.2.3).',
        ]);
      } else if (mode === 'sup') {
        const fs = BOSSES.map(bosse);
        const parties = fs.map((g) => surY(g, (y) => y <= a, [a]));
        const inter = surY(sup, (y) => y <= a, [a]);
        bandes(inter, col.accent);
        fs.forEach((g) => traceFonction(rep, g, { a: 0, b: X_MAX, couleur: col.discret, largeur: 1.3 }));
        traceFonction(rep, sup, { a: 0, b: X_MAX, couleur: col.trait, largeur: 2.2, tirets: [5, 3] });
        niveauTrace(a, 'a');
        for (const [u, v] of inter) rep.trace([[u, 0], [v, 0]], { couleur: col.accent, largeur: 5 });
        parties.forEach((ints, i) => ligne(i, `{f${'₁₂₃₄'[i]} ≤ a}`, ints, col.discret, { largeur: 4 }));
        ligne(4, '{sup fₙ ≤ a}', inter, col.accent);
        ecris(lignes, [
          `$a = ${nb(a)}$ : $\\{\\sup_n f_n \\le a\\} = ${latexIntervalles(inter)}$.`,
          `C’est l’intersection des quatre lignes du dessus ; son complémentaire est la réunion des $\\{f_n > a\\}$.`,
          '',
        ]);
        texteVerdict.className = 'verdict ok';
        outils.rendTexte(texteVerdict, 'Chaque $\\{f_n \\le a\\}$ est un borélien, et une intersection dénombrable de boréliens en est un : $\\sup_n f_n$ est mesurable.');
        ecrisJustification([
          '$\\sup_n f_n(x) \\le a \\iff$ pour tout $n$, $f_n(x) \\le a \\iff x \\in \\bigcap_n \\{f_n \\le a\\}$ : c’est la preuve du point i) de la Proposition 2.2.6.',
          'Le graphe en tirets est $\\sup_n f_n$ : il passe sous $a$ exactement là où toutes les bosses y passent.',
        ]);
      } else {
        const morceau = ou((x) => f1(x) < q && q < f2(x));
        const grilleQ = ou((x) => reunionGrille(N, x));
        const vrai = surY((x) => f2(x) - f1(x), (y) => y > 0, [0]);
        const manque = longueur(vrai) - longueur(grilleQ);
        bandes(vrai, col.equilibre);
        // Les niveaux q de la grille, en tirets de la couleur de la ligne « ⋃ q » :
        // ce sont eux qui forment la réunion.
        for (let k = 1; k < Y_MAX * N; k++) rep.trace([[0, k / N], [X_MAX, k / N]], { couleur: col.accent, largeur: 1.3, tirets: [5, 4], alpha: 0.6 });
        traceFonction(rep, f1, { a: 0, b: X_MAX, couleur: col.trait, largeur: 2 });
        traceFonction(rep, f2, { a: 0, b: X_MAX, couleur: col.series[2], largeur: 2 });
        rep.texte(0.1, f1(0.1), 'f₁', { dy: -8, couleur: col.trait, police: 'italic 14px Georgia, serif', fond: true });
        rep.texte(0.1, f2(0.1), 'f₂', { dy: -8, couleur: col.series[2], police: 'italic 14px Georgia, serif', fond: true });
        niveauTrace(q, 'q');
        for (const [u, v] of morceau) rep.trace([[u, 0], [v, 0]], { couleur: col.perturbation, largeur: 5 });
        ligne(0, '{f₁ < q < f₂}', morceau, col.perturbation);
        ligne(1, `⋃ q (pas 1/${N})`, grilleQ, col.accent);
        ligne(2, '{f₁ < f₂}', vrai, col.equilibre);
        ecris(lignes, [
          `$q = ${nb(q)}$ : $\\{f_1 < q\\} \\cap \\{q < f_2\\} = ${latexIntervalles(morceau)}$.`,
          `Réunion sur les $q$ de pas $1/${N}$ : longueur $${nb(longueur(grilleQ))}$, contre $${nb(longueur(vrai))}$ pour $\\{f_1 < f_2\\}$.`,
          '',
        ]);
        texteVerdict.className = `verdict ${manque > 1e-3 ? '' : 'ok'}`;
        outils.rendTexte(
          texteVerdict,
          manque > 1e-3
            ? `Il manque une longueur $${nb(manque)}$ : les points où aucun $q$ de la grille ne se glisse entre $f_1(x)$ et $f_2(x)$, près des croisements.`
            : 'À cette précision, la réunion remplit $\\{f_1 < f_2\\}$.',
        );
        ecrisJustification([
          'Si $f_1(x) < f_2(x)$, il existe un rationnel $q$ entre les deux, donc $x \\in \\{f_1 < q\\} \\cap \\{q < f_2\\}$ ; la réciproque est immédiate. Une grille de pas fixe ne suffit pas : il faut tous les rationnels.',
          'Chaque morceau est mesurable, et $\\mathbb Q$ est dénombrable : la réunion l’est aussi. Une réunion sur tous les réels $q$ ne serait pas permise.',
        ]);
      }
    }

    outils.surTheme(dessine);
    dessine();
    return { applique: dessine };
  },
};
