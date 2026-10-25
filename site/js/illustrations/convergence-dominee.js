// Convergence dominée (poly, Théorème 5.1.6 ; TD3, exercice 5 ; TD2, exercice 5). Pour
// une suite (f_n), la plus petite fonction qui domine toutes les f_n est
// l'enveloppe G = sup_n |f_n| : le théorème s'applique avec une dominante
// intégrable si et seulement si G l'est. La page trace f_n, l'enveloppe
// G_N = max_{k ≤ N} |f_k| et son intégrale quand N grandit, et l'on peut
// proposer sa propre dominante g(x) = C / (1 + x)^α.

import { latexPositifFixe as nb } from '../ui/format.js';
import { Repere } from '../ui/repere.js';
import { couleurs } from '../ui/theme.js';
import { champ } from '../ui/controls.js';
import { axesLog, barreOutils, boutonInfo, carte, choisitIndice, choixEchelle, choixRadios, echelleLog, paragraphe, toile } from './commun.js';
import { aire, grilleUnites, integrale, traceFonction } from './fonctions.js';
import { GLOSSAIRE } from './glossaire.js';
import { fermeInfobulle } from '../ui/infobulle.js';

export const N_MAX = 30;

export const SUITES = {
  cos: {
    latex: '|\\cos x|^{1/n} e^{-x}',
    f: (n, x) => Math.abs(Math.cos(x)) ** (1 / n) * Math.exp(-x),
    intervalle: [0, 8],
    sauts: () => [],
    limite: (x) => Math.exp(-x),
    integraleLimite: 1,
    hauteur: 1.2,
    source: 'TD3, question 5.1',
    commentaire:
      'La suite croît vers $e^{-x}$ hors des points $\\pi/2 + k\\pi$ : l’enveloppe est $e^{-x}$, intégrable. Convergence monotone ou dominée : $\\lim \\int f_n = \\int e^{-x} = 1$.',
  },
  expcos: {
    latex: '(1 - \\tfrac xn)^n \\cos x\\, \\mathbb 1_{[0, n]}',
    f: (n, x) => (x <= n ? (1 - x / n) ** n * Math.cos(x) : 0),
    intervalle: [0, 8],
    sauts: () => [],
    limite: (x) => Math.exp(-x) * Math.cos(x),
    integraleLimite: 0.5,
    hauteur: 1.2,
    source: 'TD3, question 5.2',
    commentaire:
      'Comme $\\ln(1 - u) \\le -u$, $|f_n(x)| \\le e^{-x}$ : l’enveloppe est sous $e^{-x}$, intégrable. Par convergence dominée, $\\lim \\int f_n = \\int e^{-x} \\cos x \\,\\mathrm dx = 1/2$.',
  },
  concentre: {
    latex: 'n\\,\\mathbb 1_{\\mathopen{]}0, 1/n\\mathclose{[}}',
    f: (n, x) => (x > 0 && x < 1 / n ? n : 0),
    intervalle: [0, 1.2],
    sauts: (n) => [1 / n],
    limite: () => 0,
    integraleLimite: 0,
    hauteur: 12,
    grille: { y: 1 },
    source: 'Poly, Exemples 1.2.3 et 3.3.1',
    commentaire:
      'L’enveloppe vérifie $\\sup_n f_n(x) \\ge 1/x - 1$ : elle n’est pas intégrable près de $0$. Aucune dominante ne convient, et de fait $\\int f_n = 1 \\not\\to 0 = \\int \\lim f_n$.',
  },
  echappe: {
    latex: '\\mathbb 1_{[n, n+1]}',
    f: (n, x) => (x >= n && x <= n + 1 ? 1 : 0),
    intervalle: [0, 32],
    sauts: (n) => [n, n + 1],
    limite: () => 0,
    integraleLimite: 0,
    hauteur: 1.4,
    grille: { x: 1, y: 1 },
    source: 'Poly, Exemple 3.3.3',
    commentaire:
      'L’enveloppe est $\\mathbb 1_{[1, +\\infty\\mathclose{[}}$, d’intégrale infinie : la masse s’échappe à l’infini, aucune fonction intégrable ne la retient. $\\int f_n = 1 \\not\\to 0$.',
  },
  td2: {
    latex: '\\frac{n e^{-x}}{\\sqrt{1 + n^2 x^2}}',
    f: (n, x) => (n * Math.exp(-x)) / Math.sqrt(1 + n * n * x * x),
    intervalle: [0, 8],
    sauts: () => [],
    limite: (x) => (x > 0 ? Math.exp(-x) / x : Infinity),
    integraleLimite: Infinity,
    hauteur: 6,
    source: 'TD2, exercice 5',
    commentaire:
      'La suite croît vers $e^{-x}/x$, qui n’est pas intégrable en $0$. Beppo-Levi s’applique (suite positive croissante) et donne $\\int f_n \\to +\\infty$ ; la convergence dominée, elle, ne peut pas s’appliquer.',
  },
};

// Limite de N ↦ ∫ G_N quand l'enveloppe est intégrable.
const LIMITE_ENVELOPPE = {
  cos: '\\int G_N \\to \\int_0^{+\\infty} e^{-x}\\,\\mathrm dx = 1',
  expcos: '\\int G_N \\to \\int \\sup_n |f_n| \\le \\int_0^{+\\infty} e^{-x}\\,\\mathrm dx = 1',
};

// Grille d'abscisses pour l'enveloppe ; la première est prise juste après 0.
const grille = ([a, b], m = 1600) => Array.from({ length: m + 1 }, (_, i) => Math.max(a + 1e-5, a + ((b - a) * i) / m));

// Enveloppe G_N(x) = max_{k ≤ N} |f_k(x)| sur la grille, et son intégrale
// (méthode des trapèzes).
export function enveloppe(nom, N, xs = grille(SUITES[nom].intervalle)) {
  const S = SUITES[nom];
  const G = xs.map((x) => {
    let m = 0;
    for (let k = 1; k <= N; k++) m = Math.max(m, Math.abs(S.f(k, x)));
    return m;
  });
  let I = 0;
  for (let i = 0; i + 1 < xs.length; i++) I += ((xs[i + 1] - xs[i]) * (G[i] + G[i + 1])) / 2;
  return { xs, G, integrale: I };
}

// ∫ f_n sur l'intervalle de la suite.
export function integraleSuite(nom, n) {
  const S = SUITES[nom];
  const [a, b] = S.intervalle;
  return integrale((x) => S.f(n, x), a, b, 3000, S.sauts(n));
}

// La dominante proposée g(x) = C / (1 + x)^α, d'intégrale C/(α − 1) sur [0, +∞[ si α > 1.
// Bornes des réglages, aussi appliquées aux valeurs lues dans l'URL. Le
// verdict ne regarde que f_1, …, f_{N_MAX} : avec C ≤ C_MAX < N_MAX, la masse
// concentrée (max f_k = k) et les autres suites sans dominante intégrable
// restent toujours en défaut, comme le dit l'essai.
export const C_MAX = 10;
export const ALPHA_MAX = 4;
export const borneC = (C) => Math.min(C_MAX, Math.max(0.1, C));
export const borneAlpha = (alpha) => Math.min(ALPHA_MAX, Math.max(0, alpha));

export const dominante = (C, alpha) => (x) => C / (1 + x) ** alpha;
export const integraleDominante = (C, alpha) => (alpha > 1 ? C / (alpha - 1) : Infinity);

// Points de la grille où g ne domine pas l'une des f_k, k ≤ N.
export function violations(nom, N, C, alpha, xs = grille(SUITES[nom].intervalle, 400)) {
  const S = SUITES[nom];
  const g = dominante(C, alpha);
  return xs.filter((x) => {
    for (let k = 1; k <= N; k++) if (Math.abs(S.f(k, x)) > g(x) + 1e-12) return true;
    return false;
  });
}

export default {
  etat: { suite: 'expcos', n: 3, C: 1, alpha: 2 },

  choix: { suite: Object.keys(SUITES), echelle: ['valeurs', 'ecart'] },

  preferences: { echelle: 'valeurs' },

  termes: ['convergence monotone', 'convergence dominée', 'presque partout', 'intégrable'],

  rappel: [
    'Théorème de convergence dominée (Théorème 5.1.6) : si $f_n \\to f$ presque partout et s’il existe $g$ intégrable telle que $|f_n| \\le g$ presque partout pour tout $n$, alors $f$ est intégrable et',
    '$$\\|f_n - f\\|_1 \\to 0, \\qquad \\int f_n \\to \\int f.$$',
    'La plus petite fonction qui domine toutes les $f_n$ est l’enveloppe',
    '$$G = \\sup_n |f_n|.$$',
    'Une dominante intégrable existe donc si et seulement si $G$ est intégrable : c’est elle qu’il faut regarder avant de chercher une formule pour $g$.',
    'Quand $G$ n’est pas intégrable, le théorème ne s’applique pas, et l’interversion peut être fausse (masse concentrée, masse qui s’échappe) ou donner $+\\infty$.',
  ],

  essais: [
    { texte: 'TD3, question 5.2 : l’enveloppe reste sous $e^{-x}$. Proposez une dominante : avec $\\alpha = 2$, quel $C$ suffit ?', etat: { suite: 'expcos', n: 3, C: 0.5, alpha: 2 } },
    { texte: 'La masse concentrée : augmentez $C$ et $\\alpha$ autant que vous voulez, aucune dominante de cette forme ne passe au-dessus de toutes les $f_n$ près de $0$.', etat: { suite: 'concentre', n: 5, C: 3, alpha: 2 } },
    { texte: 'La bosse qui s’échappe : l’enveloppe vaut $1$ sur $[1, +\\infty\\mathclose{[}$. Que fait $\\int G_N$ quand $N$ grandit ?', etat: { suite: 'echappe', n: 4, C: 1, alpha: 2 } },
    { texte: 'L’exemple du TD2, exercice 5 : la suite croît vers $e^{-x}/x$. Beppo-Levi donne la limite des intégrales ; laquelle ?', etat: { suite: 'td2', n: 4, C: 2, alpha: 2 } },
  ],

  monte(zone, outils) {
    const r = outils.etat;

    const barre = barreOutils(zone);
    const choix = choixRadios(barre, {
      nom: 'suite',
      options: Object.entries(SUITES).map(([valeur, { latex }]) => ({ valeur, latex: `f_n = ${latex}` })),
      change: (valeur) => {
        outils.change({ suite: valeur });
        dessine();
      },
    });

    // La suite des intégrales : ses valeurs, ou son écart à ∫f en échelle logarithmique
    // (la vitesse de convergence se lit sur la pente).
    const choixEch = choixEchelle(barre, {
      etiquette: 'Intégrales :',
      options: [{ valeur: 'valeurs', texte: 'valeurs' }, { valeur: 'ecart', texte: 'écart à ∫f (log)' }],
      change: (valeur) => {
        outils.preferences.change({ echelle: valeur });
        dessine();
      },
    });

    // ---- Graphe ------------------------------------------------------------------------------
    const cG = carte(zone, '$f_n$, son enveloppe et une dominante');
    cG.classList.add('principale');
    boutonInfo(cG, [
      ['ligne', '--accent', '$f_n$ pour le $n$ choisi.'],
      ['zone', '--zone-stable', 'L’enveloppe $G_{30} = \\max_{k \\le 30} |f_k|$, en bleu quand l’enveloppe complète $\\sup_n |f_n|$ est intégrable.'],
      ['zone', '--alerte', 'La même enveloppe, en rouge quand $\\sup_n |f_n|$ n’est pas intégrable : aucune dominante ne convient.'],
      ['tirets', '--equilibre', 'La limite $f$.'],
      ['ligne', '--perturbation', 'La dominante proposée $g(x) = C/(1 + x)^\\alpha$ ; les traits rouges sous l’axe marquent les points où elle passe sous une $f_k$.'],
    ]);
    const reglages = document.createElement('div');
    reglages.className = 'champs-ligne';
    cG.appendChild(reglages);
    const [zN, zC, zA] = [0, 1, 2].map(() => reglages.appendChild(document.createElement('div')));
    const champN = champ(zN, { latex: 'n', min: 1, max: N_MAX, pas: 1, valeur: r.n }, (v) => {
      outils.change({ n: Math.min(N_MAX, Math.max(1, Math.round(v))) });
      dessine();
    });
    const champC = champ(zC, { latex: 'C', min: 0.1, max: C_MAX, pas: 0.1, valeur: r.C }, (v) => {
      outils.change({ C: borneC(v) });
      dessine();
    });
    const champA = champ(zA, { latex: '\\alpha', min: 0, max: ALPHA_MAX, pas: 0.1, valeur: r.alpha }, (v) => {
      outils.change({ alpha: borneAlpha(v) });
      dessine();
    });
    const canvasG = toile(cG, '16 / 5', () => dessine());
    const repG = new Repere(canvasG, { x: [0, 8], y: [0, 1.2] });
    const bloc = document.createElement('div');
    bloc.className = 'texte-fixe';
    cG.appendChild(bloc);
    const commentaire = paragraphe(bloc, '', '');
    const verdictG = paragraphe(cG, '', 'verdict');

    // ---- Intégrales --------------------------------------------------------------------------
    const grilleCartes = document.createElement('div');
    grilleCartes.className = 'grille-2';
    zone.appendChild(grilleCartes);
    const cI = carte(grilleCartes, '$n \\mapsto \\int f_n$');
    const titreI = cI.querySelector('h2');
    boutonInfo(cI, [
      ['point', '--accent', '$\\int f_n\\,\\mathrm d\\lambda$ ; le $n$ choisi est cerclé. Cliquez sur un point pour choisir $n$.'],
      ['tirets', '--equilibre', '$\\int f\\,\\mathrm d\\lambda$, l’intégrale de la limite.'],
    ]);
    const canvasI = toile(cI, '16 / 6', () => dessine());
    const repI = new Repere(canvasI, { x: [0, N_MAX + 1], y: [0, 1.2] });
    const texteI = paragraphe(cI, '', 'verdict');
    choisitIndice(canvasI, repI, {
      max: () => N_MAX,
      change: (n) => {
        outils.change({ n });
        dessine();
      },
    });
    const cE = carte(grilleCartes, '$N \\mapsto \\int G_N$, l’enveloppe');
    const canvasE = toile(cE, '16 / 6', () => dessine());
    const repE = new Repere(canvasE, { x: [0, N_MAX + 1], y: [0, 2] });
    const texteE = paragraphe(cE, '', 'verdict');

    // Calculs gardés par suite.
    const cache = {};
    const calcule = (nom) => {
      if (cache[nom]) return cache[nom];
      const ints = Array.from({ length: N_MAX }, (_, i) => integraleSuite(nom, i + 1));
      const envs = Array.from({ length: N_MAX }, (_, i) => enveloppe(nom, i + 1));
      return (cache[nom] = { ints, envs });
    };
    // L'enveloppe complète est-elle intégrable ? Oui pour les deux suites du TD3.
    const enveloppeIntegrable = (nom) => nom === 'cos' || nom === 'expcos';

    let commentaireAffiche = null;

    function dessine() {
      const col = couleurs();
      const S = SUITES[r.suite];
      const n = Math.min(N_MAX, Math.max(1, Math.round(r.n)));
      const [a, b] = S.intervalle;
      choix.fixe(r.suite);
      champN.fixe(n);
      const [C, alpha] = [borneC(r.C), borneAlpha(r.alpha)];
      champC.fixe(C);
      champA.fixe(alpha);
      const { ints, envs } = calcule(r.suite);
      const env = envs[N_MAX - 1];
      const integrable = enveloppeIntegrable(r.suite);
      // Le commentaire n'est reconstruit qu'au changement de suite : sa bulle
      // de glossaire reste utilisable pendant les réglages.
      if (commentaireAffiche !== r.suite) {
        commentaireAffiche = r.suite;
        outils.rendTexte(commentaire, S.commentaire);
        outils.glossaire(commentaire, Object.keys(GLOSSAIRE));
        fermeInfobulle();
      }
      const g = dominante(C, alpha);
      const mauvais = violations(r.suite, N_MAX, C, alpha);

      repG.fixeCadre([a, b], [-0.06 * S.hauteur, S.hauteur]);
      if (repG.prepare()) {
        grilleUnites(repG, S.grille, a, b, S.hauteur);
        // Enveloppe en aplat.
        const ctx = repG.ctx;
        ctx.save();
        repG.decoupe();
        ctx.beginPath();
        ctx.moveTo(repG.X(env.xs[0]), repG.Y(0));
        env.xs.forEach((x, i) => ctx.lineTo(repG.X(x), repG.Y(Math.min(env.G[i], 2 * S.hauteur))));
        ctx.lineTo(repG.X(env.xs[env.xs.length - 1]), repG.Y(0));
        ctx.closePath();
        ctx.fillStyle = integrable ? col.zone : col.alerte;
        ctx.globalAlpha = integrable ? 1 : 0.14;
        ctx.fill();
        ctx.restore();
        repG.axes({ noms: ['x', ''], grille: false });
        traceFonction(repG, S.limite, { a: a + 1e-3, b, couleur: col.equilibre, largeur: 1.4, tirets: [6, 4], n: 800 });
        traceFonction(repG, g, { a, b, couleur: col.perturbation, largeur: 1.8, n: 600 });
        traceFonction(repG, (x) => S.f(n, x), { a, b, sauts: S.sauts(n), couleur: col.accent, largeur: 2.4, n: 1600 });
        for (const x of mauvais) repG.trace([[x - (b - a) / 800, -0.04 * S.hauteur], [x + (b - a) / 800, -0.04 * S.hauteur]], { couleur: col.alerte, largeur: 4 });
      }
      const Ig = integraleDominante(C, alpha);
      const domine = mauvais.length === 0;
      const valide = domine && Number.isFinite(Ig);
      verdictG.className = `verdict ${valide ? 'ok' : 'alerte'}`;
      outils.rendTexte(
        verdictG,
        `$g = C/(1 + x)^{\\alpha}$, $\\int_0^{+\\infty} g = ${Number.isFinite(Ig) ? nb(Ig) : '+\\infty'}$ : ${
          valide
            ? 'dominante intégrable, le théorème s’applique.'
            : !domine
              ? `$g$ ne domine pas toutes les $f_k$ (${mauvais.length} points marqués en rouge).`
              : '$g$ domine, mais n’est pas intégrable : il faut $\\alpha > 1$.'
        }`,
      );

      // n ↦ ∫ f_n.
      const finie = Number.isFinite(S.integraleLimite);
      const hI = Math.max(1.2, ...ints, finie ? S.integraleLimite : 0) * 1.12;
      const ecartI = outils.preferences.valeurs.echelle === 'ecart' && finie;
      choixEch.fixe(outils.preferences.valeurs.echelle === 'ecart' ? 'ecart' : 'valeurs');
      const donneesI = ecartI ? ints.map((v) => (Math.abs(v - S.integraleLimite) < 1e-12 ? 0 : Math.abs(v - S.integraleLimite))) : ints;
      const EI = ecartI ? echelleLog(donneesI) : null;
      repI.fixeCadre([0, N_MAX + 1], ecartI ? EI.cadre : [Math.min(0, ...ints) - 0.05, hI]);
      if (repI.prepare()) {
        if (ecartI) axesLog(repI, EI, col, [0, N_MAX + 1]);
        else {
          repI.axes({ noms: ['n', ''], grille: false });
          if (finie) repI.trace([[0, S.integraleLimite], [N_MAX + 1, S.integraleLimite]], { couleur: col.equilibre, largeur: 1.4, tirets: [6, 4] });
        }
        const yI = ecartI ? EI.y : (v) => v;
        donneesI.forEach((v, i) => repI.point(i + 1, yI(v), { rayon: 2.8, couleur: col.accent }));
        repI.point(n, yI(donneesI[n - 1]), { rayon: 6, couleur: col.accent, plein: false });
      }
      outils.rendTexte(titreI, ecartI ? '$n \\mapsto |\\int f_n - \\int f|$, échelle logarithmique' : '$n \\mapsto \\int f_n$');
      const egal = finie && Math.abs(ints[N_MAX - 1] - S.integraleLimite) < 0.05;
      texteI.className = `verdict ${egal ? 'ok' : 'alerte'}`;
      outils.rendTexte(
        texteI,
        `$\\int f_{${n}} = ${nb(ints[n - 1])}$ ; $\\int f = ${finie ? nb(S.integraleLimite) : '+\\infty'}$ : ${egal ? 'les intégrales convergent vers $\\int f$.' : finie ? 'les intégrales ne convergent pas vers $\\int f$.' : 'les intégrales tendent vers $+\\infty$.'}`,
      );

      // N ↦ ∫ G_N.
      const IG = envs.map((e) => e.integrale);
      repE.fixeCadre([0, N_MAX + 1], [0, Math.max(...IG) * 1.12]);
      if (repE.prepare()) {
        repE.axes({ noms: ['N', ''], grille: false });
        IG.forEach((v, i) => repE.point(i + 1, v, { rayon: 2.8, couleur: integrable ? col.accent : col.alerte }));
      }
      texteE.className = `verdict ${integrable ? 'ok' : 'alerte'}`;
      outils.rendTexte(
        texteE,
        integrable
          ? `$\\int G_N$ se stabilise ($${nb(IG[N_MAX - 1])}$ pour $N = 30$) : l’enveloppe est intégrable. Limite : $${LIMITE_ENVELOPPE[r.suite]}$.`
          : `$\\int G_N$ croît sans borne ($${nb(IG[N_MAX - 1])}$ pour $N = 30$) : l’enveloppe n’est pas intégrable. Limite : $\\int G_N \\to +\\infty$.`,
      );
    }

    outils.surTheme(dessine);
    dessine();
    return { applique: dessine };
  },
};
