// Construire une mesure sur ℝ (poly, section 2.3 ; TD1, exercice 3) : une
// combinaison de masses de Dirac, que l'on pose d'un clic et dont on règle le
// poids en les faisant glisser, et d'une mesure à densité. On mesure un
// intervalle ]u, v] et l'on lit la fonction t ↦ μ(]−∞, t]) : ses sauts sont
// les masses de Dirac, elle est continue à droite, pas à gauche.

import { latexNombre as tex, latexPositifFixe as nb, separateur } from '../ui/format.js';
import { Repere } from '../ui/repere.js';
import { couleurs } from '../ui/theme.js';
import { champ } from '../ui/controls.js';
import { barreOutils, boutonInfo, carte, choixRadios, glisse, paragraphe, toile } from './commun.js';
import { aire, traceFonction } from './fonctions.js';

export const BORNES = [-3, 5];
const MAX_ATOMES = 8;

// Densités : ρ(x) et sa primitive nulle en −∞, pour une masse totale m.
export const DENSITES = {
  aucune: { texte: 'sans densité', rho: () => 0, primitive: () => 0, sauts: [] },
  uniforme: {
    latex: '\\tfrac m2 \\mathbb 1_{[-1, 1]}',
    rho: (x, m) => (x >= -1 && x <= 1 ? m / 2 : 0),
    primitive: (t, m) => (m * Math.min(2, Math.max(0, t + 1))) / 2,
    sauts: [-1, 1],
  },
  exponentielle: {
    latex: 'm\\,e^{-x} \\mathbb 1_{x \\ge 0}',
    rho: (x, m) => (x >= 0 ? m * Math.exp(-x) : 0),
    primitive: (t, m) => (t <= 0 ? 0 : m * (1 - Math.exp(-t))),
    sauts: [0],
  },
};

// Masses de Dirac lues dans le réglage `atomes` : « x:p;x:p », positions dans
// les bornes, poids positifs, au plus MAX_ATOMES, une seule masse par point.
export function lisAtomes(texte) {
  const res = [];
  for (const morceau of String(texte).split(';')) {
    const [x, p] = morceau.split(':').map(Number);
    if (!Number.isFinite(x) || !Number.isFinite(p) || p <= 0) continue;
    if (x < BORNES[0] || x > BORNES[1] || res.some((a) => a.x === x)) continue;
    res.push({ x, p });
  }
  return res.slice(0, MAX_ATOMES).sort((a, b) => a.x - b.x);
}

export const ecritAtomes = (atomes) => atomes.map(({ x, p }) => `${x}:${Number(p.toPrecision(10))}`).join(';');

// μ(]−∞, t]) et μ(]−∞, t[) pour μ = Σ p_k δ_{x_k} + ρ λ.
export function repartition(atomes, densite, m, t) {
  const continue_ = DENSITES[densite].primitive(t, m);
  const avant = atomes.filter((a) => a.x < t).reduce((s, a) => s + a.p, 0);
  const en = atomes.filter((a) => a.x === t).reduce((s, a) => s + a.p, 0);
  return { F: continue_ + avant + en, gauche: continue_ + avant, saut: en };
}

// μ(]u, v]) = F(v) − F(u), pour u ≤ v.
export function mesureIntervalle(atomes, densite, m, u, v) {
  return repartition(atomes, densite, m, v).F - repartition(atomes, densite, m, u).F;
}

// Masse totale μ(ℝ) : la densité ne charge que des intervalles bornés à gauche.
export function masseTotale(atomes, densite, m) {
  return atomes.reduce((s, a) => s + a.p, 0) + (densite === 'aucune' ? 0 : m);
}

// Loi binomiale 𝓑(N, p) = Σ C(N, k) p^k (1 − p)^{N−k} δ_k (exemple des mesures discrètes).
export function binomiale(N, p) {
  const atomes = [];
  let c = 1;
  for (let k = 0; k <= N; k++) {
    atomes.push({ x: k, p: c * p ** k * (1 - p) ** (N - k) });
    c = (c * (N - k)) / (k + 1);
  }
  return atomes;
}

// Aimantation d'une borne d'intervalle sur les masses de Dirac et les entiers.
export function aimanteBorne(x, atomes, tolerance) {
  for (const a of atomes) if (Math.abs(x - a.x) < tolerance) return a.x;
  const e = Math.round(x);
  if (Math.abs(x - e) < tolerance) return e;
  return Number(x.toFixed(3));
}

const fr = (v) => String(Number(v.toPrecision(3))).replace('.', ',').replace('-', '−');

export default {
  etat: { atomes: '0:0.5;2:0.25', densite: 'uniforme', m: 0.25, u: -0.5, v: 2 },

  choix: { densite: Object.keys(DENSITES) },

  termes: ['fonction de répartition', 'probabilité', 'mesure de Lebesgue', 'mesure de Dirac', 'mesure'],

  rappel: [
    'Une somme pondérée de mesures est une mesure. Les plus simples sont les mesures discrètes $\\mu = \\sum_k p_k\\,\\delta_{x_k}$, pour lesquelles',
    '$$\\mu(A) = \\sum_{k : x_k \\in A} p_k,$$',
    'et les mesures à densité $\\rho\\lambda$, où $\\lambda$ est la mesure de Lebesgue (Corollaire 3.3.5), pour lesquelles',
    '$$\\mu(A) = \\int_A \\rho \\,\\mathrm d\\lambda.$$',
    'Pour une mesure finie $\\mu$ sur $(\\mathbb R, \\mathcal B(\\mathbb R))$, par exemple une probabilité, la fonction de répartition est',
    '$$F(t) = \\mu\\big(\\mathopen{]}-\\infty, t]\\big)$$',
    'est croissante et continue à droite, par continuité de la mesure le long des intervalles qui décroissent vers $\\mathopen{]}-\\infty, t]$ (TD1, exercice 3) :',
    '$$\\mathopen{]}-\\infty, t_n] \\downarrow \\mathopen{]}-\\infty, t] \\ \\Longrightarrow\\ F(t_n) \\to F(t).$$',
    'Elle n’est pas toujours continue à gauche : en croissant, les intervalles ont pour limite $\\mathopen{]}-\\infty, t\\mathclose{[}$, et non $\\mathopen{]}-\\infty, t]$,',
    '$$\\mathopen{]}-\\infty, t_n] \\uparrow \\mathopen{]}-\\infty, t\\mathclose{[} \\ \\Longrightarrow\\ F(t_n) \\to F(t^-),$$',
    'donc',
    '$$F(t^-) = F(t) - \\mu(\\{t\\}).$$',
    'Elle saute exactement aux masses de Dirac ; pour $\\delta_0$, c’est la fonction de Heaviside (Figure 2.1).',
    'Elle donne la mesure des intervalles,',
    '$$\\mu\\big(\\mathopen{]}u, v]\\big) = F(v) - F(u),$$',
    'et pour une probabilité elle détermine la mesure.',
  ],

  essais: [
    { texte: 'La mesure de Dirac en $0$ : $F$ est la fonction de Heaviside (Figure 2.1). Placez $v$ juste avant $0$, puis sur $0$ : que vaut $\\mu(\\mathopen{]}u, v])$ ?', etat: { atomes: '0:1', densite: 'aucune', u: -1, v: -0.3 } },
    { texte: 'La loi binomiale $\\mathcal B(4, 1/2) = \\sum_k \\binom 4k 2^{-4}\\,\\delta_k$ : cinq sauts, de hauteurs $1, 4, 6, 4, 1$ seizièmes.', etat: { atomes: ecritAtomes(binomiale(4, 0.5)), densite: 'aucune', u: 0.5, v: 2 } },
    { texte: 'Une mesure à densité, sans masse de Dirac : $F$ est continue et $\\mu(\\{t\\}) = 0$ pour tout $t$. Pourquoi la densité de Dirac n’existe-t-elle pas (TD2, exercice 2) ?', etat: { atomes: '', densite: 'exponentielle', m: 1, u: 0, v: 1 } },
    { texte: 'Cliquez sur la figure du haut pour ajouter une masse de Dirac, faites glisser sa pointe pour changer son poids (jusqu’à $0$ pour la retirer). Ajustez les poids pour obtenir une probabilité, $\\mu(\\mathbb R) = 1$.', etat: { atomes: '-1:0.25;1.5:0.25', densite: 'uniforme', m: 0.25, u: -2, v: 3 } },
  ],

  monte(zone, outils) {
    const r = outils.etat;

    // ---- Densité ---------------------------------------------------------------------------
    const barre = barreOutils(zone);
    const choix = choixRadios(barre, {
      nom: 'densite',
      options: Object.entries(DENSITES).map(([valeur, { latex, texte }]) => ({ valeur, texte, latex: latex && `\\rho = ${latex}` })),
      change: (valeur) => {
        outils.change({ densite: valeur });
        dessine();
      },
    });
    const champM = champ(barre, { latex: 'm', min: 0, max: 2, pas: 0.05, valeur: r.m }, (v) => {
      outils.change({ m: Math.max(0, v) });
      dessine();
    });

    // ---- La mesure --------------------------------------------------------------------------
    const cM = carte(zone, 'La mesure $\\mu = \\sum_k p_k\\,\\delta_{x_k} + \\rho\\,\\lambda$');
    boutonInfo(cM, [
      ['fleche', '--accent', 'Une masse de Dirac $p_k\\,\\delta_{x_k}$, de hauteur $p_k$ : cliquez pour en ajouter une, faites glisser sa pointe pour la déplacer ou changer son poids ; à $0$, elle disparaît.'],
      ['zone', '--zone-stable', 'La densité $\\rho$ : l’aire sous la courbe est la masse qu’elle donne à un intervalle.'],
      ['zone', '--perturbation', 'L’intervalle $\\mathopen{]}u, v]$ : faites glisser ses bornes. Elles se collent aux masses de Dirac et aux entiers.'],
    ]);
    const canvasM = toile(cM, '16 / 5', () => dessine());
    canvasM.classList.add('cliquable');
    const repM = new Repere(canvasM, { x: BORNES, y: [0, 1.2] });
    const mesureA = paragraphe(cM, '', 'verdict');

    // ---- Fonction de répartition -------------------------------------------------------------
    const cF = carte(zone, 'La fonction $F(t) = \\mu(\\mathopen{]}-\\infty, t])$');
    boutonInfo(cF, [
      ['ligne', '--accent', '$F$ : croissante, continue à droite. À un saut, le point plein est la valeur $F(t)$, le point creux la limite à gauche $F(t^-)$.'],
      ['zone', '--perturbation', '$F(v) - F(u) = \\mu(\\mathopen{]}u, v])$, en orange sur l’axe vertical. Faites glisser $u$ ou $v$ ici aussi.'],
      ['tirets', '--equilibre', 'La masse totale $\\mu(\\mathbb R) = \\lim_{t \\to +\\infty} F(t)$.'],
    ]);
    const canvasF = toile(cF, '16 / 5', () => dessine());
    canvasF.classList.add('saisissable');
    const repF = new Repere(canvasF, { x: BORNES, y: [0, 1.2] });
    const continuite = paragraphe(cF, '', 'verdict');

    // ---- Interactions --------------------------------------------------------------------------
    let saisie = null; // { genre: 'atome', indice } ou { genre: 'borne', cle }
    const atomes = () => lisAtomes(r.atomes);
    const bornePres = (rep, x) => {
      const du = Math.abs(x - r.u) * rep.sx;
      const dv = Math.abs(x - r.v) * rep.sx;
      return du <= dv ? { cle: 'u', d: du } : { cle: 'v', d: dv };
    };
    const deplaceBorne = (cle, x, rep) => {
      const b = aimanteBorne(Math.min(BORNES[1], Math.max(BORNES[0], x)), atomes(), 7 / rep.sx);
      const autre = cle === 'u' ? r.v : r.u;
      outils.change({ [cle]: cle === 'u' ? Math.min(b, autre) : Math.max(b, autre) });
      dessine();
    };
    glisse(canvasM, repM, {
      prend: (x, y) => {
        const as = atomes();
        const i = as.findIndex((a) => Math.hypot((a.x - x) * repM.sx, (a.p - y) * repM.sy) < 12);
        if (i >= 0) {
          saisie = { genre: 'atome', x0: as[i].x };
          return true;
        }
        const b = bornePres(repM, x);
        if (b.d < 9 && y < 0.15) {
          saisie = { genre: 'borne', cle: b.cle };
          return true;
        }
        // Nouvelle masse de Dirac, posée sur la grille de pas 0,25.
        if (as.length >= MAX_ATOMES) return false;
        const xa = Math.round(x * 4) / 4;
        if (as.some((a) => a.x === xa)) return false;
        outils.change({ atomes: ecritAtomes([...as, { x: xa, p: 0.25 }]) });
        saisie = { genre: 'atome', x0: xa };
        return true;
      },
      deplace: (x, y) => {
        if (saisie.genre === 'borne') return deplaceBorne(saisie.cle, x, repM);
        const as = atomes().filter((a) => a.x !== saisie.x0);
        const xa = Math.min(BORNES[1], Math.max(BORNES[0], Math.round(x * 4) / 4));
        const p = Math.min(1.1, Math.round(y * 20) / 20);
        if (as.some((a) => a.x === xa)) return;
        saisie.x0 = xa;
        outils.change({ atomes: ecritAtomes(p > 0 ? [...as, { x: xa, p }] : [...as, { x: xa, p: 1e-9 }]) });
        dessine();
      },
      relache: () => {
        // Une masse ramenée à 0 disparaît.
        if (saisie?.genre === 'atome') {
          outils.change({ atomes: ecritAtomes(atomes().filter((a) => a.p >= 0.01)) });
          dessine();
        }
        saisie = null;
      },
    });
    glisse(canvasF, repF, {
      prend: (x) => {
        saisie = { genre: 'borne', cle: bornePres(repF, x).cle };
        return true;
      },
      deplace: (x) => deplaceBorne(saisie.cle, x, repF),
      relache: () => (saisie = null),
    });

    function dessine() {
      const col = couleurs();
      const as = atomes();
      const D = DENSITES[r.densite];
      choix.fixe(r.densite);
      champM.fixe(r.m);
      const total = masseTotale(as, r.densite, r.m);
      const hM = Math.max(1.1, ...as.map((a) => a.p + 0.1), D.rho(0, r.m) + 0.1);

      // La mesure.
      repM.fixeCadre(BORNES, [-0.12 * hM, hM]);
      if (repM.prepare()) {
        const ctx = repM.ctx;
        ctx.save();
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = col.perturbation;
        ctx.fillRect(repM.X(r.u), repM.Y(hM), repM.X(r.v) - repM.X(r.u), repM.Y(0) - repM.Y(hM));
        ctx.restore();
        if (r.densite !== 'aucune') {
          aire(repM, (x) => D.rho(x, r.m), { sauts: D.sauts });
          traceFonction(repM, (x) => D.rho(x, r.m), { sauts: D.sauts, couleur: col.trait, largeur: 1.6 });
        }
        repM.axes({ noms: ['x', ''], grille: true });
        for (const a of as) {
          repM.trace([[a.x, 0], [a.x, a.p]], { couleur: col.accent, largeur: 2.6 });
          repM.pointe(a.x, a.p, 0, 1, { couleur: col.accent, taille: 10 });
          repM.texte(a.x, a.p, fr(a.p), { couleur: col.accent, dx: 7, dy: 6, police: '600 12px system-ui, sans-serif' });
        }
        for (const [cle, b] of [['u', r.u], ['v', r.v]]) {
          repM.trace([[b, -0.1 * hM], [b, hM]], { couleur: col.perturbation, largeur: 1.4, tirets: cle === 'u' ? [4, 3] : [] });
          repM.texte(b, -0.1 * hM, cle, { couleur: col.perturbation, dx: 5, dy: -2, police: 'italic 600 14px Georgia, serif' });
        }
      }
      const mu = mesureIntervalle(as, r.densite, r.m, r.u, r.v);
      const dansA = as.filter((a) => a.x > r.u && a.x <= r.v);
      const masses = dansA.reduce((s, a) => s + a.p, 0);
      // On ne parle de la densité que s'il y en a une.
      const partDirac = dansA.length === 0 ? 'aucune masse de Dirac' : `${dansA.length} masse${dansA.length > 1 ? 's' : ''} de Dirac ($${nb(masses, 3, 1)}$)`;
      const partDensite = r.densite === 'aucune' ? '' : `, et $${nb(Math.max(0, mu - masses), 3, 1)}$ pour la densité`;
      outils.rendTexte(
        mesureA,
        `$\\mu(\\mathopen{]}u, v]) = ${nb(mu)}$ : ${partDirac} dans $\\mathopen{]}${tex(r.u)}${separateur([r.u, r.v], 2)}${tex(r.v)}]$${partDensite}. $\\mu(\\mathbb R) = ${nb(total)}$${Math.abs(total - 1) < 1e-9 ? ' : une probabilité.' : '.'}`,
      );

      // La fonction de répartition.
      const hF = Math.max(1.1, total * 1.1);
      repF.fixeCadre(BORNES, [-0.05 * hF, hF]);
      if (repF.prepare()) {
        const Fu = repartition(as, r.densite, r.m, r.u).F;
        const Fv = repartition(as, r.densite, r.m, r.v).F;
        repF.axes({ noms: ['t', ''], grille: true });
        repF.trace([[BORNES[0], total], [BORNES[1], total]], { couleur: col.equilibre, largeur: 1.2, tirets: [6, 4] });
        // F(v) − F(u) sur l'axe vertical, et les deux lectures.
        repF.trace([[r.u, 0], [r.u, Fu], [BORNES[0], Fu]], { couleur: col.perturbation, largeur: 1, tirets: [4, 3] });
        repF.trace([[r.v, 0], [r.v, Fv], [BORNES[0], Fv]], { couleur: col.perturbation, largeur: 1, tirets: [4, 3] });
        repF.trace([[BORNES[0], Fu], [BORNES[0], Fv]], { couleur: col.perturbation, largeur: 6 });
        traceFonction(repF, (t) => repartition(as, r.densite, r.m, t).F, { sauts: as.map((a) => a.x), couleur: col.accent, largeur: 2.4, n: 800 });
        for (const a of as) {
          const { F, gauche } = repartition(as, r.densite, r.m, a.x);
          repF.point(a.x, gauche, { rayon: 4, couleur: col.accent, plein: false });
          repF.point(a.x, F, { rayon: 4, couleur: col.accent });
        }
      }
      const { F, gauche, saut } = repartition(as, r.densite, r.m, r.v);
      continuite.className = `verdict ${saut > 0 ? 'alerte' : 'ok'}`;
      outils.rendTexte(
        continuite,
        `En $v$ : $F(v) = ${nb(F)}$, $F(v^-) = ${nb(gauche)}$, $\\mu(\\{v\\}) = ${nb(saut)}$. ${saut > 0 ? '$F$ saute en $v$ : une masse de Dirac y est posée.' : '$F$ est continue en $v$.'}`,
      );
    }

    outils.surTheme(dessine);
    dessine();
    return { applique: dessine };
  },
};
