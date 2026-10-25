// Sommer une série, c'est intégrer (poly, Exemples 3.3.2 et 4.1.1). Pour la
// mesure de comptage sur ℕ, ∫ u dm est la somme de la série, et u est intégrable
// si et seulement si la série converge absolument. Pour u_n = (−1)^n/(n+1),
// ∫ u⁺ = ∫ u⁻ = +∞ : u n'a pas d'intégrale. On choisit une cible c à la souris,
// et le procédé de Riemann réordonne les termes pour que la série converge vers
// c ; pour une série absolument convergente, il échoue.

import { latexNombre, latexNombreFixe } from '../ui/format.js';
import { Repere } from '../ui/repere.js';
import { couleurs } from '../ui/theme.js';
import { champ } from '../ui/controls.js';
import { barreOutils, boutonInfo, carte, choixRadios, glisse, legende, paragraphe, toile } from './commun.js';

// Équivalents en +∞ des sommes partielles de u⁺ et de u⁻ (série harmonique
// alternée) : ½ ln N + ½ ln 2 + γ/2 et ½ ln N − ½ ln 2 + γ/2.
const EULER = 0.5772156649015329;
export const CONSTANTE_PLUS = 0.5 * Math.LN2 + EULER / 2;
export const CONSTANTE_MOINS = -0.5 * Math.LN2 + EULER / 2;

export const SERIES = {
  harmonique: {
    latex: 'u_n = \\frac{(-1)^n}{n+1}',
    radio: 'u_n = (-1)^n/(n+1)',
    u: (n) => (n % 2 ? -1 : 1) / (n + 1),
    somme: Math.LN2,
    latexSomme: '\\ln 2',
    absolue: false,
  },
  carres: {
    latex: 'u_n = \\frac{(-1)^n}{(n+1)^2}',
    radio: 'u_n = (-1)^n/(n+1)^2',
    u: (n) => (n % 2 ? -1 : 1) / (n + 1) ** 2,
    somme: (Math.PI * Math.PI) / 12,
    latexSomme: '\\pi^2/12',
    limitePlus: (Math.PI * Math.PI) / 8,
    limiteMoins: (Math.PI * Math.PI) / 24,
    nomPlus: 'π²/8',
    nomMoins: 'π²/24',
    absolue: true,
  },
};

// Procédé de Riemann : on prend les termes positifs, dans l'ordre, tant que la
// somme est ≤ c, puis les négatifs tant qu'elle est > c, et ainsi de suite.
// Renvoie les K premières sommes partielles, les indices pris et le nombre de
// termes positifs et négatifs utilisés.
export function reordonne(nom, c, K) {
  const { u } = SERIES[nom];
  let [p, q] = [0, 1]; // prochains indices pair (positif) et impair (négatif)
  let s = 0;
  const sommes = [];
  const indices = [];
  for (let k = 0; k < K; k++) {
    let n;
    if (s <= c) {
      n = p;
      p += 2;
    } else {
      n = q;
      q += 2;
    }
    s += u(n);
    indices.push(n);
    sommes.push(s);
  }
  return { sommes, indices, positifs: p / 2, negatifs: (q - 1) / 2 };
}

// Ce que fait le procédé à la limite, d'après le théorème de Riemann, et non
// d'après les K premiers termes. Si Σu⁺ = Σu⁻ = +∞, chaque signe revient sans
// cesse et la série réordonnée converge vers c. Si la série converge
// absolument, toute réorganisation a la même somme : pour c ≠ Σu, le procédé
// finit bloqué d'un côté de c, faute de termes restants du signe en cours.
export function issueProcede(nom, c) {
  const S = SERIES[nom];
  return !S.absolue || Math.abs(c - S.somme) < 1e-12 ? 'converge' : 'bloque';
}

// Sommes partielles de u⁺ et de u⁻ jusqu'au rang N (inclus).
export function sommesParties(nom, N) {
  const { u } = SERIES[nom];
  const plus = [];
  const moins = [];
  let [a, b] = [0, 0];
  for (let n = 0; n <= N; n++) {
    const v = u(n);
    a += Math.max(0, v);
    b += Math.max(0, -v);
    plus.push(a);
    moins.push(b);
  }
  return { plus, moins };
}

export default {
  etat: { serie: 'harmonique', c: 1.5, K: 200 },

  choix: { serie: Object.keys(SERIES) },

  termes: ['convergence monotone', 'application mesurable', 'mesure de comptage', 'intégrable'],

  rappel: [
    'Sur $(\\mathbb N, \\mathcal P(\\mathbb N))$ muni de la mesure de comptage $m$, toute suite est mesurable, et pour $u \\ge 0$, Beppo-Levi donne (Exemple 3.3.2)',
    '$$\\int_{\\mathbb N} u \\,\\mathrm dm = \\sum_n u_n :$$',
    'intégrer, c’est sommer.',
    'Une suite de signe quelconque est intégrable si $\\int u^+ \\,\\mathrm dm$ et $\\int u^- \\,\\mathrm dm$ sont finies, c’est-à-dire si la série converge absolument ; son intégrale est alors la somme de la série.',
    'Pour $u_n = (-1)^n/(n+1)$, la série converge (vers $\\ln 2$), mais $\\int u^+ \\,\\mathrm dm = \\int u^- \\,\\mathrm dm = +\\infty$ : $u$ n’a pas d’intégrale (Exemple 4.1.1).',
    'Ce n’est pas une précaution de forme : une intégrale ne dépend pas de l’ordre des points, et ici l’ordre décide de tout. En réordonnant les termes (procédé de Riemann), on fait converger la série vers n’importe quelle valeur.',
  ],

  essais: [
    { texte: 'Faites glisser la cible $c$ sur la figure : les termes réordonnés convergent vers $c$, et chaque terme est utilisé une fois.', etat: { serie: 'harmonique', c: 1.5, K: 200 } },
    { texte: 'Visez $c = -1$ : il faut d’abord descendre, en prenant des termes négatifs. La somme dans l’ordre naturel, $\\ln 2$, n’a rien de privilégié.', etat: { serie: 'harmonique', c: -1, K: 300 } },
    { texte: 'La série des $(-1)^n/(n+1)^2$ converge absolument. Visez $c = 1{,}5$ : le procédé reste bloqué, et des termes négatifs ne sont jamais utilisés. Toute vraie réorganisation donne $\\pi^2/12$.', etat: { serie: 'carres', c: 1.5, K: 200 } },
  ],

  monte(zone, outils) {
    const r = outils.etat;

    const barre = barreOutils(zone);
    const choix = choixRadios(barre, {
      nom: 'serie',
      options: Object.entries(SERIES).map(([valeur, { radio }]) => ({ valeur, latex: radio })),
      change: (valeur) => {
        outils.change({ serie: valeur });
        dessine();
      },
    });

    // ---- Sommes partielles réordonnées --------------------------------------------------
    const cS = carte(zone, 'Réordonner les termes : sommes partielles');
    cS.classList.add('principale');
    boutonInfo(cS, [
      ['ligne', '--accent', 'Les sommes partielles de la série réordonnée par le procédé de Riemann.'],
      ['tirets', '--perturbation', 'La cible $c$ : faites-la glisser sur la figure.'],
      ['tirets', '--equilibre', 'La somme dans l’ordre naturel.'],
    ]);
    const champK = champ(cS, { latex: 'K', min: 20, max: 1000, pas: 10, valeur: r.K }, (v) => {
      outils.change({ K: Math.min(5000, Math.max(5, Math.round(v))) });
      dessine();
    });
    const canvasS = toile(cS, '16 / 6', () => dessine());
    canvasS.classList.add('saisissable');
    const repS = new Repere(canvasS, { x: [0, 200], y: [-2, 3] });
    const verdict = paragraphe(cS, '', 'verdict');
    glisse(canvasS, repS, {
      deplace: (_, y) => {
        outils.change({ c: Math.round(Math.min(2.5, Math.max(-1.8, y)) * 100) / 100 });
        dessine();
      },
    });

    // ---- u⁺ et u⁻ -----------------------------------------------------------------------
    const grille = document.createElement('div');
    grille.className = 'grille-2';
    zone.appendChild(grille);
    const cU = carte(grille, 'La suite $u$, une fonction sur $\\mathbb N$');
    boutonInfo(cU, [
      ['ligne', '--serie-2', '$u^+ = \\max(u, 0)$.'],
      ['ligne', '--serie-1', '$-u^- = \\min(u, 0)$.'],
    ]);
    const canvasU = toile(cU, '16 / 7', () => dessine());
    const repU = new Repere(canvasU, { x: [-0.5, 30.5], y: [-0.6, 1.1] });
    const noteU = paragraphe(cU, '', 'note');
    const cP = carte(grille, '$\\int u^+ \\,\\mathrm dm$ et $\\int u^- \\,\\mathrm dm$ : sommes partielles');
    const canvasP = toile(cP, '16 / 7', () => dessine());
    const repP = new Repere(canvasP, { x: [0, 100], y: [0, 4] });
    const zoneLegende = document.createElement('div');
    cP.appendChild(zoneLegende);
    const noteP = paragraphe(cP, '', 'verdict');

    function dessine() {
      const col = couleurs();
      const S = SERIES[r.serie];
      const K = Math.min(5000, Math.max(5, Math.round(r.K)));
      choix.fixe(r.serie);
      champK.fixe(K);
      const { sommes, positifs, negatifs } = reordonne(r.serie, r.c, K);

      repS.fixeCadre([0, K], [-2, 3]);
      if (repS.prepare()) {
        repS.axes({ noms: ['k', ''], grille: false });
        repS.trace([[0, S.somme], [K, S.somme]], { couleur: col.equilibre, largeur: 1.4, tirets: [6, 4] });
        repS.trace([[0, r.c], [K, r.c]], { couleur: col.perturbation, largeur: 1.6, tirets: [5, 3] });
        repS.trace(sommes.map((s, k) => [k + 1, s]), { couleur: col.accent, largeur: 1.6 });
        repS.texte(K, r.c, `c = ${String(r.c).replace('.', ',').replace('-', '−')}`, { align: 'right', dx: -4, dy: -6, couleur: col.perturbation, fond: true, police: '600 12px system-ui, sans-serif' });
      }
      const bloque = issueProcede(r.serie, r.c) === 'bloque';
      verdict.className = `verdict ${bloque ? 'alerte' : 'ok'}`;
      outils.rendTexte(
        verdict,
        `Après $K = ${K}$ termes : ${positifs} positif${positifs > 1 ? 's' : ''} et ${negatifs} négatif${negatifs > 1 ? 's' : ''} utilisés, somme $${latexNombreFixe(sommes[K - 1], 3)}$. ` +
          (bloque
            ? `La série converge absolument : $\\sum u_n^+$ et $\\sum u_n^-$ sont finies. Les termes restants d’un signe finissent par ne plus suffire à franchir $c$, et le procédé reste bloqué de ce côté : ce n’est pas un réordonnement. Toute réorganisation a pour somme $${S.latexSomme}$.`
            : '$\\sum u_n^+ = \\sum u_n^- = +\\infty$ : il reste toujours assez de termes de chaque signe pour repasser $c$. Les deux signes reviennent sans cesse, chaque terme finit par être pris, et la série réordonnée converge vers $c$.'),
      );

      // u⁺ et u⁻ en bâtons.
      const N = 30;
      if (repU.prepare()) {
        repU.axes({ noms: ['n', ''], grille: false });
        for (let n = 0; n <= N; n++) {
          const v = S.u(n);
          repU.trace([[n, 0], [n, v]], { couleur: v >= 0 ? col.series[1] : col.series[0], largeur: 3 });
        }
      }
      outils.rendTexte(noteU, `$${S.latex}$ : la fonction $n \\mapsto u_n$, mesurable pour la tribu $\\mathcal P(\\mathbb N)$.`);

      // Sommes partielles de u⁺ et u⁻.
      const M = 100;
      const { plus, moins } = sommesParties(r.serie, M);
      const h = Math.max(1, plus[M], moins[M]) * 1.15;
      repP.fixeCadre([0, M], [0, h]);
      if (repP.prepare()) {
        repP.axes({ noms: ['N', ''], grille: false });
        repP.trace(plus.map((v, n) => [n, v]), { couleur: col.series[1], largeur: 2 });
        repP.trace(moins.map((v, n) => [n, v]), { couleur: col.series[0], largeur: 2 });
        // Les deux sommes divergent comme ½ ln N : on trace leurs équivalents en +∞.
        if (r.serie === 'harmonique') {
          for (const c of [CONSTANTE_PLUS, CONSTANTE_MOINS]) repP.trace(Array.from({ length: M }, (_, k) => [k + 1, 0.5 * Math.log(k + 1) + c]), { couleur: col.equilibre, largeur: 1.6, tirets: [6, 4] });
        }
        // Les deux sommes convergent : leurs valeurs limites, en tirets.
        else {
          for (const [v, nom] of [[S.limitePlus, S.nomPlus], [S.limiteMoins, S.nomMoins]]) {
            repP.trace([[0, v], [M, v]], { couleur: col.equilibre, largeur: 1.4, tirets: [6, 4] });
            repP.texte(M, v, nom, { align: 'right', dx: -4, dy: -6, couleur: col.equilibre, fond: true, police: '600 12px system-ui, sans-serif' });
          }
        }
      }
      zoneLegende.replaceChildren();
      legende(zoneLegende, [
        { texte: '$\\sum_{n \\le N} u_n^+$', couleur: col.series[1] },
        { texte: '$\\sum_{n \\le N} u_n^-$', couleur: col.series[0] },
        { texte: r.serie === 'harmonique' ? 'équivalents en $+\\infty$ + constante (tirets)' : 'valeurs limites (tirets)', couleur: col.equilibre },
      ]);
      const diverge = r.serie === 'harmonique';
      noteP.className = `verdict ${diverge ? 'alerte' : 'ok'}`;
      outils.rendTexte(
        noteP,
        diverge
          ? 'Les deux sommes sont équivalentes en $+\\infty$ à $\\tfrac12 \\ln N$ (tirets : $\\tfrac12 \\ln N + 0{,}64$ pour $u^+$, $\\tfrac12 \\ln N - 0{,}06$ pour $u^-$, qui les suivent de près) : $\\int u^+ \\,\\mathrm dm = \\int u^- \\,\\mathrm dm = +\\infty$, $u$ n’a pas d’intégrale.'
          : `Les deux sommes convergent, vers $\\pi^2/8$ et $\\pi^2/24$ : $u$ est intégrable et $\\int u \\,\\mathrm dm = \\sum u_n = ${S.latexSomme} \\approx ${latexNombre(S.somme, 4)}$.`,
      );
    }

    outils.surTheme(dessine);
    dessine();
    return { applique: dessine };
  },
};
