// Modes de convergence (poly, section 4.2, Théorème 5.1.6 ; annexe A.3). Des
// suites de fonctions sur [0, 1] qui tendent vers 0 en un sens et pas en un
// autre : simplement, presque partout, dans L¹, uniformément. La machine à
// écrire (Exemple A.3.1) tend vers 0 dans L¹ et ne converge en aucun point ;
// sa sous-suite f_{2^m} converge presque partout.

import { latexPositifFixe, latexPositifFixe as nb } from '../../socle/js/ui/format.js';
import { Repere } from '../../socle/js/ui/repere.js';
import { couleurs } from '../../socle/js/ui/theme.js';
import { champ } from '../../socle/js/ui/controls.js';
import { axesLog, barreOutils, boutonInfo, carte, choisitIndice, choixEchelle, choixRadios, echelleLog, glisse, paragraphe, tableau, toile, verdict } from './commun.js';
export { echelleLog };
import { aire, grilleUnites, traceFonction } from './fonctions.js';
import { GLOSSAIRE } from './glossaire.js';
import { fermeInfobulle } from '../../socle/js/ui/infobulle.js';

export const N_MAX = 64;

// n = 2^m + k avec 0 ≤ k < 2^m.
export function decompose(n) {
  const m = Math.floor(Math.log2(n));
  return { m, k: n - 2 ** m };
}

export const SUITES = {
  machine: {
    latex: '\\mathbb 1_{[k 2^{-m}, (k+1) 2^{-m}]}',
    axe1: true,
    f: (n, x) => {
      const { m, k } = decompose(n);
      return x >= k * 2 ** -m && x <= (k + 1) * 2 ** -m ? 1 : 0;
    },
    norme1: (n) => 2 ** -decompose(n).m,
    sauts: (n) => {
      const { m, k } = decompose(n);
      return [k * 2 ** -m, (k + 1) * 2 ** -m];
    },
    hauteur: () => 1.3,
    modes: ['non', 'non', 'oui', 'non'],
    sousSuite: (j) => 2 ** j,
    latexSousSuite: 'f_{2^m} = \\mathbb 1_{[0, 2^{-m}]}',
    commentaire:
      'La machine à écrire : pour $n = 2^m + k$, l’intervalle de longueur $2^{-m}$ balaie $[0, 1]$. $\\|f_n\\|_1 = 2^{-m} \\to 0$, mais en chaque $x$, $f_n(x)$ repasse par $1$ à chaque balayage : la suite ne converge en aucun point. La sous-suite $f_{2^m}$ tend vers $0$ presque partout (Exemple A.3.1).',
  },
  concentre: {
    latex: 'n\\,\\mathbb 1_{\\mathopen{]}0, 1/n\\mathclose{[}}',
    f: (n, x) => (x > 0 && x < 1 / n ? n : 0),
    norme1: () => 1,
    sauts: (n) => [1 / n],
    hauteur: (n) => Math.max(4, 1.12 * n),
    grille: { y: 1 },
    modes: ['oui', 'oui', 'non', 'non'],
    commentaire:
      'La masse se concentre : $f_n(x) \\to 0$ en tout point, mais $\\|f_n\\|_1 = 1$. Convergence simple sans convergence dans $L^1$ : il manque une domination (Théorème 5.1.6).',
  },
  puissance: {
    axe1: true,
    latex: 'x^n',
    f: (n, x) => x ** n,
    norme1: (n) => 1 / (n + 1),
    sauts: () => [],
    hauteur: () => 1.3,
    modes: ['non', 'oui', 'oui', 'non'],
    commentaire:
      '$x^n \\to 0$ pour $x < 1$, mais $1^n = 1$ : la limite simple est $\\mathbb 1_{\\{1\\}}$, nulle presque partout. $\\|x^n\\|_1 = 1/(n+1) \\to 0$, mais $\\sup |f_n| = 1$ : la convergence n’est pas uniforme.',
  },
  aplatie: {
    axe1: true,
    latex: 'x/n',
    f: (n, x) => x / n,
    norme1: (n) => 1 / (2 * n),
    sauts: () => [],
    hauteur: () => 1.3,
    modes: ['oui', 'oui', 'oui', 'oui'],
    commentaire: '$\\sup |x/n| = 1/n \\to 0$ : la convergence est uniforme, et elle entraîne toutes les autres sur $[0, 1]$, de mesure finie.',
  },
};

export const MODES = ['simplement (partout)', 'presque partout', 'dans L¹', 'uniformément'];

// Indices n de la sous-suite à mettre en évidence (machine à écrire) jusqu'à N_MAX.
export function indicesSousSuite(nom) {
  const S = SUITES[nom];
  if (!S.sousSuite) return [];
  const res = [];
  for (let j = 0; S.sousSuite(j) <= N_MAX; j++) res.push(S.sousSuite(j));
  return res;
}

export default {
  etat: { suite: 'machine', n: 5, x: 0.3 },

  choix: { suite: Object.keys(SUITES), echelle: ['lineaire', 'log'] },

  preferences: { anime: false, echelle: 'lineaire' },

  termes: ['convergence presque partout', 'négligeable', 'presque partout'],

  rappel: [
    'Une suite de fonctions peut tendre vers $0$ en plusieurs sens, qui ne se valent pas :',
    [
      'simplement : $f_n(x) \\to 0$ pour tout $x$ ;',
      'presque partout : sauf sur un ensemble négligeable ;',
      'dans $L^1$ : $\\|f_n\\|_1 = \\int |f_n| \\,\\mathrm d\\lambda \\to 0$ ;',
      'uniformément : $\\sup |f_n| \\to 0$.',
    ],
    'Sur $[0, 1]$, la convergence uniforme entraîne les trois autres. Entre convergence presque partout et convergence dans $L^1$, aucune implication : il faut une domination dans un sens (Théorème 5.1.6), et une extraction dans l’autre.',
    'Si $f_n \\to f$ dans $L^p$, $1 \\le p < +\\infty$, une sous-suite converge vers $f$ presque partout (annexe A.3). L’extraction est indispensable, comme le montre la machine à écrire.',
  ],

  essais: [
    { texte: 'La machine à écrire : cliquez un point $x$, puis animez $n$. Combien de fois $f_n(x)$ vaut-il $1$ entre $n = 32$ et $n = 63$ ?', etat: { suite: 'machine', n: 32, x: 0.3 } },
    { texte: 'Les points cerclés de la suite $f_n(x)$ sont ceux de la sous-suite $f_{2^m}$ : elle tend vers $0$ pour tout $x > 0$.', etat: { suite: 'machine', n: 8, x: 0.6 } },
    { texte: 'Échelle logarithmique pour $x^n$ avec $x = 0{,}3$ : les points de $n \\mapsto f_n(x)$ s’alignent, une décroissance géométrique devient une droite, alors que $\\|f_n\\|_1 = 1/(n+1)$ décroît moins vite. Les valeurs nulles sont sur la ligne « 0 ».', etat: { suite: 'puissance', n: 20, x: 0.3 }, preferences: { echelle: 'log' } },
    { texte: 'La masse concentrée : convergence en tout point, pas dans $L^1$. Comparez avec la machine à écrire.', etat: { suite: 'concentre', n: 5, x: 0.15 } },
    { texte: '$x^n$ : cliquez sur $x = 1$. La limite simple n’est pas nulle, mais elle l’est presque partout.', etat: { suite: 'puissance', n: 6, x: 1 } },
  ],

  monte(zone, outils) {
    const r = outils.etat;
    const prefs = outils.preferences;

    const barre = barreOutils(zone);
    const choix = choixRadios(barre, {
      nom: 'suite',
      options: Object.entries(SUITES).map(([valeur, { latex }]) => ({ valeur, latex: `f_n = ${latex}` })),
      change: (valeur) => {
        outils.change({ suite: valeur });
        dessine();
      },
    });

    // Échelle des deux suites du bas : linéaire, ou logarithmique (pour voir une
    // décroissance géométrique ou un ordre de grandeur).
    const choixEch = choixEchelle(barre, {
      options: [{ valeur: 'lineaire', texte: 'échelle linéaire' }, { valeur: 'log', texte: 'échelle logarithmique' }],
      change: (valeur) => {
        prefs.change({ echelle: valeur });
        dessine();
      },
    });

    // ---- Graphe de f_n et tableau des modes --------------------------------------------------
    const cF = carte(zone, 'Le graphe de $f_n$');
    cF.classList.add('principale');
    boutonInfo(cF, [
      ['ligne', '--accent', '$f_n$ pour le $n$ choisi.'],
      ['zone', '--accent', 'L’aire sous le graphe : c’est $\\|f_n\\|_1 = \\int |f_n|\\,\\mathrm d\\lambda$, la valeur du point de la figure en bas à droite.'],
      ['point', '--perturbation', 'Le point $x$ : cliquez ou faites glisser ; il se colle à $0$, $1/2$ et $1$.'],
    ]);
    const reglages = document.createElement('div');
    reglages.className = 'champs-ligne';
    cF.appendChild(reglages);
    const champN = champ(reglages, { latex: 'n', min: 1, max: N_MAX, pas: 1, valeur: r.n }, (v) => {
      arrete();
      outils.change({ n: Math.min(N_MAX, Math.max(1, Math.round(v))) });
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
    const canvasF = toile(cF, '16 / 5', () => dessine());
    canvasF.classList.add('cliquable');
    const repF = new Repere(canvasF, { x: [0, 1], y: [0, 1.3] });
    const texte = document.createElement('div');
    texte.className = 'texte-fixe';
    cF.appendChild(texte);
    const commentaire = paragraphe(texte, '', '');
    const zoneTableau = document.createElement('div');
    cF.appendChild(zoneTableau);

    // ---- Les deux suites numériques -------------------------------------------------------
    const grille = document.createElement('div');
    grille.className = 'grille-2';
    zone.appendChild(grille);
    const cX = carte(grille, 'La suite $n \\mapsto f_n(x)$');
    boutonInfo(cX, [
      ['point', '--perturbation', '$f_n(x)$ pour $n = 1, \\dots, 64$ ; cliquez sur un point, ici ou sur la figure voisine, pour choisir $n$.'],
      ['cercle', '--equilibre', 'La sous-suite $f_{2^m}(x)$ de la machine à écrire.'],
    ]);
    const canvasX = toile(cX, '16 / 6', () => dessine());
    const repX = new Repere(canvasX, { x: [0, N_MAX + 1], y: [0, 1.2] });
    const texteX = verdict(cX, '');
    const cN = carte(grille, 'La suite $n \\mapsto \\|f_n\\|_1$');
    const canvasN = toile(cN, '16 / 6', () => dessine());
    const repN = new Repere(canvasN, { x: [0, N_MAX + 1], y: [0, 1.2] });
    const texteN = verdict(cN, '');
    for (const [canvas, rep] of [[canvasX, repX], [canvasN, repN]]) {
      choisitIndice(canvas, rep, {
        max: () => N_MAX,
        change: (n) => {
          arrete();
          outils.change({ n });
          dessine();
        },
      });
    }

    glisse(canvasF, repF, {
      deplace: (x) => {
        const tol = 6 / repF.sx;
        let v = Math.min(1, Math.max(0, x));
        for (const a of [0, 0.5, 1]) if (Math.abs(v - a) < tol) v = a;
        outils.change({ x: Number(v.toFixed(4)) });
        dessine();
      },
    });

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
        outils.change({ n: r.n >= N_MAX ? 1 : r.n + 1 });
        dessine();
        minuteur = setTimeout(pas, r.n >= N_MAX ? 1200 : 220);
      };
      minuteur = setTimeout(pas, 220);
    }

    let suiteAffichee = null;

    function dessine() {
      const col = couleurs();
      const S = SUITES[r.suite];
      const n = Math.min(N_MAX, Math.max(1, Math.round(r.n)));
      const x = Math.min(1, Math.max(0, r.x));
      choix.fixe(r.suite);
      champN.fixe(n);
      if (suiteAffichee !== r.suite) {
        suiteAffichee = r.suite;
        outils.rendTexte(commentaire, S.commentaire);
        outils.glossaire(commentaire, Object.keys(GLOSSAIRE));
        fermeInfobulle();
        const t = document.createElement('div');
        tableau(t, MODES.map((m) => `fₙ → 0 ${m}`), [S.modes]);
        zoneTableau.replaceChildren(t);
      }

      const H = S.hauteur(n);
      repF.fixeCadre([-0.01, 1.01], [-0.04 * H, H]);
      if (repF.prepare()) {
        grilleUnites(repF, S.grille, 0, 1, H);
        // L'aire sous le graphe est ‖f_n‖₁ : la valeur du point de la figure en bas à droite.
        aire(repF, (t) => S.f(n, t), { a: 0, b: 1, sauts: S.sauts(n), n: 1200, couleur: col.accent, alpha: 0.22 });
        repF.axes({ noms: ['x', ''], grille: false });
        // Un axe en tirets à la hauteur 1 (machine à écrire, x^n, x/n), pour lire les valeurs.
        if (S.axe1) repF.trace([[0, 1], [1, 1]], { couleur: col.discret, largeur: 1.3, tirets: [6, 4] });
        traceFonction(repF, (t) => S.f(n, t), { a: 0, b: 1, sauts: S.sauts(n), couleur: col.accent, largeur: 2.4, n: 1200 });
        repF.trace([[x, 0], [x, H]], { couleur: col.perturbation, largeur: 1, tirets: [3, 3] });
        repF.point(x, Math.min(H, S.f(n, x)), { rayon: 5, couleur: col.perturbation });
      }

      // n ↦ f_n(x), avec la sous-suite cerclée.
      const valeurs = Array.from({ length: N_MAX }, (_, i) => S.f(i + 1, x));
      const log = prefs.valeurs.echelle === 'log';
      choixEch.fixe(log ? 'log' : 'lineaire');
      const hX = Math.max(1.2, ...valeurs) * 1.1;
      const EX = log ? echelleLog(valeurs) : null;
      const yX = log ? EX.y : (v) => v;
      if (log) repX.fixeCadre([0, N_MAX + 1], EX.cadre);
      else repX.fixeCadre([0, N_MAX + 1], [-0.04 * hX, hX]);
      const sous = indicesSousSuite(r.suite);
      if (repX.prepare()) {
        if (log) axesLog(repX, EX, col, [0, N_MAX + 1]);
        else repX.axes({ noms: ['n', ''], grille: false });
        valeurs.forEach((v, i) => repX.point(i + 1, yX(v), { rayon: 2.6, couleur: col.perturbation }));
        for (const k of sous) repX.point(k, yX(valeurs[k - 1]), { rayon: 6, couleur: col.equilibre, plein: false });
        repX.point(n, yX(valeurs[n - 1]), { rayon: 7, couleur: col.perturbation, plein: false });
      }
      // Nombre de rangs où f_n(x) ≠ 0 sur le dernier balayage (n de 32 à 63).
      const derniers = valeurs.slice(31, 63).filter((v) => v !== 0).length;
      outils.rendTexte(
        texteX,
        `$x = ${latexPositifFixe(x, 2, 1)}$ : $f_{${n}}(x) = ${nb(valeurs[n - 1], 2, 1)}$ ; de $n = 32$ à $n = 63$, $f_n(x)$ ${derniers === 0 ? 'est nul à tous les rangs' : `est non nul pour ${derniers} rang${derniers > 1 ? 's' : ''}`}.`,
      );

      // n ↦ ‖f_n‖₁.
      const normes = Array.from({ length: N_MAX }, (_, i) => S.norme1(i + 1));
      const EN = log ? echelleLog(normes) : null;
      const yN = log ? EN.y : (v) => v;
      if (log) repN.fixeCadre([0, N_MAX + 1], EN.cadre);
      else repN.fixeCadre([0, N_MAX + 1], [0, 1.2]);
      if (repN.prepare()) {
        if (log) axesLog(repN, EN, col, [0, N_MAX + 1]);
        else repN.axes({ noms: ['n', ''], grille: false });
        normes.forEach((v, i) => repN.point(i + 1, yN(v), { rayon: 2.6, couleur: col.accent }));
        repN.point(n, yN(normes[n - 1]), { rayon: 7, couleur: col.accent, plein: false });
      }
      const L1 = S.modes[2] === 'oui';
      texteN.className = `verdict ${L1 ? 'ok' : 'alerte'}`;
      outils.rendTexte(texteN, `$\\|f_{${n}}\\|_1 = ${nb(normes[n - 1], 4, 1)}$ : ${L1 ? '$f_n \\to 0$ dans $L^1$.' : '$f_n$ ne tend pas vers $0$ dans $L^1$.'}`);
    }

    outils.surTheme(dessine);
    dessine();
    lance();
    return { applique: dessine };
  },
};
