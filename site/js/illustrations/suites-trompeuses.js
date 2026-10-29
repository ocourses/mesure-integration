// Des suites qui trompent (poly, section 1.2 et chapitre 3) : quatre suites de
// fonctions qui convergent en chaque point, et ce que devient l'intégrale.
// On règle n, on clique un point x du graphe, et l'on suit les deux suites
// numériques n ↦ f_n(x) et n ↦ ∫ f_n, face à f(x) et à ∫ f pour la limite f.

import { chiffresEntiers, latexPositifFixe as nb } from '../../socle/js/ui/format.js';
import { Repere } from '../../socle/js/ui/repere.js';
import { couleurs } from '../../socle/js/ui/theme.js';
import { champ } from '../../socle/js/ui/controls.js';
import { axesLog, barreOutils, boutonInfo, carte, choisitIndice, choixEchelle, choixRadios, echelleLog, glisse, paragraphe, toile, verdict } from './commun.js';
import { aire, grilleUnites, traceFonction } from './fonctions.js';
import { GLOSSAIRE } from './glossaire.js';
import { fermeInfobulle, souligne } from '../../socle/js/ui/infobulle.js';
import { rendTexte } from '../../socle/js/ui/katex.js';

// Énumération q_1, q_2, … de ℚ ∩ [0, 1] : 0, 1, puis les fractions
// irréductibles p/q rangées par dénominateur, puis par numérateur.
export function rationnels(nombre) {
  const res = [0, 1];
  const pgcd = (a, b) => (b ? pgcd(b, a % b) : a);
  for (let q = 2; res.length < nombre; q++) {
    for (let p = 1; p < q && res.length < nombre; p++) if (pgcd(p, q) === 1) res.push(p / q);
  }
  return res.slice(0, nombre);
}

// L'énumération vue par dénominateur : pour chaque q ≤ qMax, les fractions
// irréductibles p/q avec leur rang k (q_k = p/q) ; la ligne q = 1 porte 0 et 1.
export function ordreRationnels(qMax = 6) {
  const lignes = [{ q: 1, termes: [{ p: 0, k: 1 }, { p: 1, k: 2 }] }];
  const pgcd = (a, b) => (b ? pgcd(b, a % b) : a);
  let k = 2;
  for (let q = 2; q <= qMax; q++) {
    const termes = [];
    for (let p = 1; p < q; p++) if (pgcd(p, q) === 1) termes.push({ p, k: ++k });
    lignes.push({ q, termes });
  }
  return lignes;
}

// Rang de x dans l'énumération (1 pour q_1), ou Infinity si x n'est pas un
// rationnel de dénominateur ≤ qMax (un point cliqué « au hasard » est irrationnel).
export function rang(x, qMax = 40) {
  for (let q = 1; q <= qMax; q++) {
    const p = Math.round(x * q);
    if (Math.abs(x - p / q) < 1e-9 && p >= 0 && p <= q) {
      const liste = rationnels(1 + q * q);
      const k = liste.findIndex((r) => Math.abs(r - p / q) < 1e-12);
      return k + 1;
    }
  }
  return Infinity;
}

// Les suites. Pour chacune : f(n, x), ∫ f_n, la limite simple f, ∫ f (au
// sens de Lebesgue), l'intervalle de tracé et la valeur maximale de n.
export const SUITES = {
  concentre: {
    latex: 'n\\,\\mathbb 1_{\\mathopen{]}0, 1/n\\mathclose{[}}',
    f: (n, x) => (x > 0 && x < 1 / n ? n : 0),
    integrale: () => 1,
    limite: () => 0,
    integraleLimite: 0,
    intervalle: () => [0, 1],
    hauteur: (n) => Math.max(4, 1.12 * n),
    nMax: 40,
    sauts: (n) => [1 / n],
    // Grille sur les unités : la figure s'adapte à f_n, la grille se resserre.
    grille: { y: 1 },
    latexIntegrale: '1',
    latexLimite: '0',
    commentaire:
      'La masse se concentre près de $0$ : chaque $f_n$ a pour intégrale $1$, et pourtant $f_n(x) = 0$ dès que $n \\ge 1/x$. La limite est intégrable, mais $\\lim \\int f_n = 1 \\ne 0 = \\int \\lim f_n$, pour Riemann comme pour Lebesgue (Exemples 1.2.3 et 3.3.1).',
  },
  echappe: {
    latex: '\\mathbb 1_{[n, n+1]}',
    f: (n, x) => (x >= n && x <= n + 1 ? 1 : 0),
    integrale: () => 1,
    limite: () => 0,
    integraleLimite: 0,
    intervalle: () => [0, 24],
    hauteur: () => 1.6,
    nMax: 20,
    sauts: (n) => [n, n + 1],
    // Grille fixe : la bosse la traverse et s'en va.
    grille: { x: 1, y: 1 },
    latexIntegrale: '1',
    latexLimite: '0',
    commentaire:
      'La bosse s’en va vers $+\\infty$ : en chaque $x$, $f_n(x) = 0$ dès que $n > x$, mais l’aire $1$ part avec elle. C’est le cas d’égalité stricte du lemme de Fatou, $\\int \\liminf f_n = 0 < 1 = \\liminf \\int f_n$ (exemple qui suit la Proposition 3.3.6).',
  },
  rationnels: {
    latex: '\\mathbb 1_{\\{q_1, \\dots, q_n\\}}',
    f: (n, x) => (rang(x) <= n ? 1 : 0),
    integrale: () => 0,
    limite: (x) => (rang(x) < Infinity ? 1 : 0),
    integraleLimite: 0,
    intervalle: () => [0, 1],
    hauteur: () => 1.5,
    nMax: 40,
    sauts: () => [],
    latexIntegrale: '0',
    latexLimite: '\\mathbb 1_{\\mathbb Q \\cap [0, 1]}',
    commentaire:
      'Chaque $f_n$ est nulle sauf en $n$ points : son intégrale est $0$. On range $\\mathbb Q \\cap [0, 1]$ par dénominateur croissant : $0$, $1$, $1/2$, $1/3$, $2/3$, $1/4$, $3/4$, $1/5$, … La suite croît vers la fonction de Dirichlet, qui n’est pas Riemann-intégrable (Exemple 1.2.2). Ici, c’est Riemann qui est en défaut : la convergence monotone donne $\\int \\mathbb 1_{\\mathbb Q \\cap [0, 1]} \\,\\mathrm d\\lambda = \\lim \\int f_n = 0$.',
  },
  racine: {
    latex: '\\min(x^{-1/2}, n)',
    f: (n, x) => (x <= 0 ? n : Math.min(1 / Math.sqrt(x), n)),
    integrale: (n) => 2 - 1 / n,
    limite: (x) => (x <= 0 ? Infinity : 1 / Math.sqrt(x)),
    integraleLimite: 2,
    intervalle: () => [0, 1],
    hauteur: (n) => Math.max(4, 1.12 * n),
    nMax: 30,
    sauts: () => [],
    grille: { y: 1 },
    // Les fonctions précédentes montent vers la limite : on les garde en pâle.
    precedentes: true,
    latexIntegrale: '2 - 1/n',
    latexLimite: 'x^{-1/2}',
    commentaire:
      'Chaque $f_n$ est continue et la suite est de Cauchy pour $N_1(f) = \\int_0^1 |f|$, mais sa limite $x^{-1/2}$ n’est pas bornée : elle n’a pas d’intégrale de Riemann au sens propre. L’espace des fonctions Riemann-intégrables n’est pas complet. Pour Lebesgue, $\\int x^{-1/2} \\,\\mathrm d\\lambda = 2$ (Exemple 1.2.4).',
  },
};

// Le point x, ramené dans l'intervalle de la suite.
export function pointDans(nom, x) {
  const [a, b] = SUITES[nom].intervalle();
  return Math.min(b, Math.max(a, x));
}

// Aimantation : un clic près d'un rationnel p/q de petit dénominateur (q ≤ 8)
// le choisit exactement, pour qu'on puisse suivre f_n(p/q) ; ailleurs, le point
// est gardé tel quel (il est alors, pour la page, irrationnel).
export function aimante(x, tolerance) {
  for (let q = 1; q <= 8; q++) {
    const p = Math.round(x * q);
    if (Math.abs(x - p / q) < tolerance) return p / q;
  }
  return x;
}

export default {
  etat: { suite: 'concentre', n: 5, x: 0.37 },

  choix: { suite: Object.keys(SUITES), echelle: ['valeurs', 'ecart'] },

  preferences: { anime: false, echelle: 'valeurs' },

  termes: ['convergence monotone', 'convergence dominée', 'Riemann-intégrable', 'lemme de Fatou'],

  rappel: [
    'Pour l’intégrale de Riemann, le théorème d’interversion demande la convergence uniforme : si $f_n \\to f$ uniformément sur $[a, b]$, alors',
    '$$\\int_a^b f_n \\longrightarrow \\int_a^b f.$$',
    'C’est une condition suffisante, pas nécessaire : $\\int_0^1 x^n\\,\\mathrm dx \\to 0$ sans convergence uniforme.',
    'Une convergence simple, en chaque point, ne suffit pas. Quatre suites le montrent :',
    [
      'la masse se concentre, $n\\,\\mathbb 1_{\\mathopen{]}0, 1/n\\mathclose{[}}$ (Exemple 1.2.3) ;',
      'la bosse s’échappe, $\\mathbb 1_{[n, n+1]}$ (lemme de Fatou, Exemple 3.3.3) ;',
      'la limite n’est plus Riemann-intégrable, $\\mathbb 1_{\\{q_1, \\dots, q_n\\}}$ (Exemple 1.2.2) ;',
      'la limite n’est plus bornée, $\\min(x^{-1/2}, n)$ (Exemple 1.2.4).',
    ],
    'Les deux derniers défauts sont ceux de Riemann : l’intégrale de Lebesgue les corrige, et le théorème de convergence monotone donne la bonne limite. Les deux premiers ne dépendent pas de l’intégrale choisie : il faudra une hypothèse de plus, la domination du théorème de convergence dominée (Théorème 5.1.6).',
  ],

  essais: [
    { texte: 'Masse concentrée : cliquez sur un point $x$, puis augmentez $n$, au curseur ou en cliquant sur un point de la suite du bas. À partir de quel rang $f_n(x)$ s’annule-t-il ? Et l’intégrale ?', etat: { suite: 'concentre', n: 2, x: 0.3 } },
    { texte: 'Plus $x$ est proche de $0$, plus il faut attendre : prenez $x = 0{,}05$. La convergence est-elle uniforme ?', etat: { suite: 'concentre', n: 5, x: 0.05 } },
    { texte: 'La bosse qui s’échappe : en $x = 6{,}5$, la suite $f_n(x)$ vaut $1$ pour un seul $n$. Lequel ?', etat: { suite: 'echappe', n: 3, x: 6.5 } },
    { texte: 'Les rationnels : cliquez sur $x = 1/3$ (le point se colle aux fractions de petit dénominateur), puis sur un point quelconque. Que vaut la limite en chacun ?', etat: { suite: 'rationnels', n: 6, x: 1 / 3 } },
    { texte: 'La racine : l’intégrale $2 - 1/n$ tend vers $2$, l’intégrale de Lebesgue de la limite. Ici, l’interversion est juste, mais Riemann ne sait pas intégrer la limite.', etat: { suite: 'racine', n: 3, x: 0.2 } },
  ],

  monte(zone, outils) {
    const r = outils.etat;
    const prefs = outils.preferences;

    // ---- Choix de la suite et animation -------------------------------------------------
    const barre = barreOutils(zone);
    const choix = choixRadios(barre, {
      nom: 'suite',
      options: Object.entries(SUITES).map(([valeur, { latex }]) => ({ valeur, latex: `f_n = ${latex}` })),
      change: (valeur) => {
        outils.change({ suite: valeur, n: Math.min(r.n, SUITES[valeur].nMax), x: pointDans(valeur, r.x) });
        dessine();
      },
    });

    // Les suites du bas : leurs valeurs, ou leur écart à la limite en échelle
    // logarithmique (ce qui ne converge pas reste à plat).
    const choixEch = choixEchelle(barre, {
      options: [{ valeur: 'valeurs', texte: 'valeurs' }, { valeur: 'ecart', texte: 'écart à la limite (log)' }],
      change: (valeur) => {
        prefs.change({ echelle: valeur });
        dessine();
      },
    });

    // ---- Graphe de f_n -------------------------------------------------------------------
    const cF = carte(zone, 'Le graphe de $f_n$');
    cF.classList.add('principale');
    boutonInfo(cF, [
      ['ligne', '--accent', '$f_n$ pour le $n$ choisi, et son intégrale en aplat.'],
      ['ligne', '--discret', 'La grille des unités. Elle ne bouge pas : quand $f_n$ grandit, c’est la figure qui s’adapte, et la grille se resserre en $y$ ; quand la bosse s’éloigne, elle traverse la grille.'],
      ['ligne', '--texte', 'La racine seulement : les fonctions précédentes, en pâle, qui montent vers la limite.'],
      ['tirets', '--equilibre', 'La limite simple $f = \\lim f_n$.'],
      ['point', '--perturbation', 'Le point $x$ : cliquez ou faites glisser. Il se colle aux fractions $p/q$ de petit dénominateur.'],
    ]);
    const reglages = document.createElement('div');
    reglages.className = 'champs-ligne';
    cF.appendChild(reglages);
    const champN = champ(reglages, { latex: 'n', min: 1, max: 40, pas: 1, valeur: r.n }, (v) => {
      arrete();
      outils.change({ n: Math.min(SUITES[r.suite].nMax, Math.max(1, Math.round(v))) });
      dessine();
    });
    const caseAnime = document.createElement('label');
    caseAnime.className = 'case';
    caseAnime.innerHTML = '<input type="checkbox" name="anime"> animer';
    reglages.appendChild(caseAnime);
    const entreeAnime = caseAnime.querySelector('input');
    entreeAnime.disabled = outils.mouvementReduit;
    entreeAnime.addEventListener('change', () => {
      prefs.change({ anime: entreeAnime.checked });
      lance();
    });
    const canvasF = toile(cF, '16 / 6', () => dessine());
    canvasF.classList.add('cliquable');
    const repF = new Repere(canvasF, { x: [0, 1], y: [0, 4] });
    const texte = document.createElement('div');
    texte.className = 'texte-fixe';
    cF.appendChild(texte);
    const commentaire = paragraphe(texte, '', '');

    // ---- Les deux suites numériques -----------------------------------------------------
    const grille = document.createElement('div');
    grille.className = 'grille-2';
    zone.appendChild(grille);
    const cX = carte(grille, 'La suite $n \\mapsto f_n(x)$');
    const titreX = cX.querySelector('h2');
    boutonInfo(cX, [
      ['point', '--perturbation', '$f_k(x)$ pour $k = 1, 2, \\dots$ ; le $n$ choisi est cerclé. Cliquez sur un point pour choisir $n$.'],
      ['tirets', '--equilibre', 'La limite $f(x)$.'],
    ]);
    const canvasX = toile(cX, '16 / 7', () => dessine());
    const repX = new Repere(canvasX, { x: [0, 41], y: [0, 4] });
    const valeurX = verdict(cX, '');

    const cI = carte(grille, 'La suite $n \\mapsto \\int f_n$');
    const titreI = cI.querySelector('h2');
    boutonInfo(cI, [
      ['point', '--accent', '$\\int f_k$ pour $k = 1, 2, \\dots$ ; le $n$ choisi est cerclé. Cliquez sur un point pour choisir $n$.'],
      ['tirets', '--equilibre', 'L’intégrale (de Lebesgue) de la limite, $\\int f$.'],
    ]);
    const canvasI = toile(cI, '16 / 7', () => dessine());
    const repI = new Repere(canvasI, { x: [0, 41], y: [0, 2.5] });
    const texteVerdict = verdict(cI, '');

    // Un clic (ou un glisser) sur une figure du bas choisit n, comme le curseur.
    for (const [canvas, rep] of [[canvasX, repX], [canvasI, repI]]) {
      choisitIndice(canvas, rep, {
        max: () => SUITES[r.suite].nMax,
        change: (n) => {
          arrete();
          outils.change({ n });
          dessine();
        },
      });
    }

    glisse(canvasF, repF, {
      deplace: (x) => {
        const tolerance = 6 / repF.sx;
        outils.change({ x: Number(pointDans(r.suite, aimante(x, tolerance)).toPrecision(10)) });
        dessine();
      },
    });

    // ---- Animation de n, en boucle ------------------------------------------------------
    let minuteur = null;
    function arrete() {
      if (!prefs.valeurs.anime) return;
      prefs.change({ anime: false });
      lance();
    }
    function lance() {
      clearTimeout(minuteur);
      entreeAnime.checked = prefs.valeurs.anime && !outils.mouvementReduit;
      if (!entreeAnime.checked) return;
      const pas = () => {
        const { nMax } = SUITES[r.suite];
        const fin = Math.min(nMax, 20);
        outils.change({ n: r.n >= fin ? 1 : r.n + 1 });
        dessine();
        minuteur = setTimeout(pas, r.n >= fin ? 1400 : 550);
      };
      minuteur = setTimeout(pas, 550);
    }

    let commentaireAffiche = null;

    function dessine() {
      const col = couleurs();
      const S = SUITES[r.suite];
      const n = Math.min(S.nMax, Math.max(1, Math.round(r.n)));
      const x = pointDans(r.suite, r.x);
      choix.fixe(r.suite);
      champN.fixeMax(S.nMax);
      champN.fixe(n);
      // Le commentaire n'est reconstruit qu'au changement de suite : sa bulle
      // de glossaire reste utilisable pendant l'animation.
      if (commentaireAffiche !== r.suite) {
        commentaireAffiche = r.suite;
        outils.rendTexte(commentaire, S.commentaire);
        outils.glossaire(commentaire, Object.keys(GLOSSAIRE));
        if (r.suite === 'rationnels') souligne(commentaire, ['par dénominateur croissant'], contenuOrdre);
        fermeInfobulle();
      }
      const [a, b] = S.intervalle();
      const H = S.hauteur(n);

      // Graphe de f_n, des précédentes et de la limite.
      repF.fixeCadre([a - 0.02 * (b - a), b + 0.02 * (b - a)], [-0.04 * H, H]);
      if (repF.prepare()) {
        if (r.suite === 'rationnels') {
          const qs = rationnels(n);
          for (const q of qs) repF.trace([[q, 0], [q, 1]], { couleur: col.accent, largeur: 1.4 });
          repF.trace([[a, 1], [b, 1]], { couleur: col.equilibre, largeur: 1.4, tirets: [2, 4] });
          repF.axes({ noms: ['x', ''], grille: false });
          for (const q of qs) repF.point(q, 1, { rayon: 3, couleur: col.accent });
          // Le rang de chaque point, tant qu'il y a la place de l'écrire.
          if (n <= 14) qs.forEach((q, k) => repF.texte(q, 1, String(k + 1), { align: 'center', dy: k % 2 ? -17 : -8, couleur: col.discret, police: '11px system-ui, sans-serif' }));
        } else {
          grilleUnites(repF, S.grille, a, b, H);
          if (S.precedentes) for (let k = Math.max(1, n - 6); k < n; k++) traceFonction(repF, (t) => S.f(k, t), { a, b, sauts: S.sauts(k), couleur: col.trait, largeur: 1, alpha: 0.25 });
          aire(repF, (t) => S.f(n, t), { a, b, sauts: S.sauts(n), n: 1200 });
          traceFonction(repF, S.limite, { a: Math.max(a, 1e-4), b, couleur: col.equilibre, largeur: 1.6, tirets: [6, 4] });
          repF.axes({ noms: ['x', ''], grille: false });
          traceFonction(repF, (t) => S.f(n, t), { a, b, sauts: S.sauts(n), n: 1200, couleur: col.accent, largeur: 2.4 });
        }
        const yx = S.f(n, x);
        repF.trace([[x, 0], [x, H]], { couleur: col.perturbation, largeur: 1, tirets: [3, 3] });
        repF.point(x, Math.min(yx, H), { rayon: 5, couleur: col.perturbation });
        repF.texte(x, 0, `x = ${fr(x)}`, { couleur: col.perturbation, dx: 6, dy: -8, fond: true, police: '600 12px system-ui, sans-serif' });
      }

      // n ↦ f_n(x).
      const N = Math.min(S.nMax, 40);
      const valeurs = Array.from({ length: N }, (_, i) => S.f(i + 1, x));
      const lim = S.limite(x);
      const hX = Math.max(1.5, ...valeurs.filter(Number.isFinite)) * 1.12;
      const ecart = prefs.valeurs.echelle === 'ecart';
      choixEch.fixe(ecart ? 'ecart' : 'valeurs');
      const ecartX = ecart && Number.isFinite(lim);
      const petit = (v) => (v < 1e-12 ? 0 : v);
      const donneesX = ecartX ? valeurs.map((v) => petit(Math.abs(v - lim))) : valeurs;
      const EX = ecartX ? echelleLog(donneesX) : null;
      repX.fixeCadre([0, N + 1], ecartX ? EX.cadre : [-0.04 * hX, hX]);
      if (repX.prepare()) {
        if (ecartX) axesLog(repX, EX, col, [0, N + 1]);
        else {
          repX.axes({ noms: ['n', ''], grille: false });
          if (Number.isFinite(lim)) repX.trace([[0, lim], [N + 1, lim]], { couleur: col.equilibre, largeur: 1.4, tirets: [6, 4] });
        }
        const yX = ecartX ? EX.y : (v) => v;
        donneesX.forEach((v, i) => repX.point(i + 1, yX(v), { rayon: 2.8, couleur: col.perturbation }));
        repX.point(n, yX(donneesX[n - 1]), { rayon: 6, couleur: col.perturbation, plein: false });
      }
      outils.rendTexte(titreX, ecartX ? 'L’écart $n \\mapsto |f_n(x) - f(x)|$, échelle logarithmique' : 'La suite $n \\mapsto f_n(x)$');
      outils.rendTexte(
        valeurX,
        `$f_{${n}}(x) = ${nb(valeurs[n - 1], 2, chiffresEntiers(Math.max(...valeurs.filter(Number.isFinite))))}$, limite $f(x) = ${nb(lim, 2)}$`,
      );

      // n ↦ ∫ f_n.
      const integrales = Array.from({ length: N }, (_, i) => S.integrale(i + 1));
      const donneesI = ecart ? integrales.map((v) => petit(Math.abs(v - S.integraleLimite))) : integrales;
      const EI = ecart ? echelleLog(donneesI) : null;
      repI.fixeCadre([0, N + 1], ecart ? EI.cadre : [-0.1, 2.5]);
      if (repI.prepare()) {
        if (ecart) axesLog(repI, EI, col, [0, N + 1]);
        else {
          repI.axes({ noms: ['n', ''], grille: false });
          repI.trace([[0, S.integraleLimite], [N + 1, S.integraleLimite]], { couleur: col.equilibre, largeur: 1.6, tirets: [6, 4] });
        }
        const yI = ecart ? EI.y : (v) => v;
        donneesI.forEach((v, i) => repI.point(i + 1, yI(v), { rayon: 2.8, couleur: col.accent }));
        repI.point(n, yI(donneesI[n - 1]), { rayon: 6, couleur: col.accent, plein: false });
      }
      outils.rendTexte(titreI, ecart ? 'L’écart $n \\mapsto |\\int f_n - \\int f|$, échelle logarithmique' : 'La suite $n \\mapsto \\int f_n$');
      const limI = S.integrale(1e9);
      const egal = Math.abs(limI - S.integraleLimite) < 1e-6;
      texteVerdict.className = `verdict ${egal ? 'ok' : 'alerte'}`;
      outils.rendTexte(
        texteVerdict,
        `$\\int f_n = ${S.latexIntegrale} \\to ${nb(limI, 0, 1)}$ ${egal ? '$=$' : '$\\ne$'} $\\int f = ${nb(S.integraleLimite, 0, 1)}$`,
      );
    }

    outils.surTheme(dessine);
    dessine();
    lance();
    return {
      applique() {
        dessine();
      },
    };
  },
};

const fr = (v) => String(Number(v.toPrecision(3))).replace('.', ',');

// Contenu de la bulle qui explique l'ordre d'énumération des rationnels.
function contenuOrdre() {
  const div = document.createElement('div');
  const titre = document.createElement('p');
  titre.className = 'titre-bulle';
  titre.textContent = 'Comment les rationnels sont rangés';
  div.appendChild(titre);
  const intro = document.createElement('p');
  intro.className = 'corps-bulle';
  rendTexte(intro, '$0$ et $1$ d’abord, puis les fractions irréductibles $p/d$ de $\\mathopen{]}0, 1\\mathclose{[}$ par dénominateur $d$ croissant, et, à $d$ fixé, par numérateur croissant. Les fractions non irréductibles ($2/4$, $2/6$, …) ont déjà été rangées. Le rang $k$ de la fraction est l’indice de $q_k$.');
  div.appendChild(intro);
  for (const { q, termes } of ordreRationnels(6)) {
    const ligne = document.createElement('p');
    ligne.className = 'corps-bulle';
    ligne.style.margin = '0.15em 0';
    const fraction = ({ p }) => (q === 1 ? String(p) : `\\frac{${p}}{${q}}`);
    rendTexte(ligne, `$d = ${q}$ : ${termes.map((t) => `$q_{${t.k}} = ${fraction(t)}$`).join(', ')}`);
    div.appendChild(ligne);
  }
  const fin = document.createElement('p');
  fin.className = 'source-bulle';
  fin.textContent = 'Chaque rationnel de [0, 1] reçoit ainsi un rang fini : la liste est dénombrable.';
  div.appendChild(fin);
  return div;
}
