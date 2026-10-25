// Impropre mais pas intégrable (poly, Exemple 5.2.2 ; Théorème 5.2.3). Sur
// [1, +∞[, ∫₁ᵗ sin x / x dx a une limite quand t → +∞, mais ∫₁ᵗ |sin x / x| dx
// tend vers +∞ : f n'est pas intégrable au sens de Lebesgue, et f⁺, f⁻ ont toutes
// deux une intégrale infinie. On fait glisser la borne t.

import { latexPositifFixe as nb } from '../ui/format.js';
import { Repere } from '../ui/repere.js';
import { couleurs } from '../ui/theme.js';
import { champ } from '../ui/controls.js';
import { boutonInfo, carte, glisse, legende, paragraphe, toile } from './commun.js';
import { aire, traceFonction } from './fonctions.js';

export const T_MAX = 200;
const PAS = 0.005;
const f = (x) => Math.sin(x) / x;

// Si(1) = ∫₀¹ sin x / x dx, et la limite ∫₁^{+∞} sin x / x dx = π/2 − Si(1).
export const SI1 = 0.946083070367183;
export const LIMITE = Math.PI / 2 - SI1;

// Intégrales cumulées sur [1, t] de f, f⁺ et f⁻, par Simpson sur une grille
// de pas PAS. La grille ne passe pas par les zéros kπ, où |f| n'est pas
// dérivable : l'erreur y est de l'ordre de PAS² par arche, invisible ici.
export function cumuls() {
  const n = Math.round((T_MAX - 1) / PAS);
  const t = new Float64Array(n + 1);
  const [I, P, M] = [new Float64Array(n + 1), new Float64Array(n + 1), new Float64Array(n + 1)];
  for (let i = 1; i <= n; i++) {
    const [a, b] = [1 + (i - 1) * PAS, 1 + i * PAS];
    t[i] = b;
    const m = (a + b) / 2;
    const s = ((b - a) * (f(a) + 4 * f(m) + f(b))) / 6;
    const sAbs = ((b - a) * (Math.abs(f(a)) + 4 * Math.abs(f(m)) + Math.abs(f(b)))) / 6;
    I[i] = I[i - 1] + s;
    P[i] = P[i - 1] + (sAbs + s) / 2;
    M[i] = M[i - 1] + (sAbs - s) / 2;
  }
  t[0] = 1;
  return { t, I, P, M };
}

let memo = null;
// Valeurs cumulées en t (interpolées sur la grille).
export function enT(T) {
  memo ??= cumuls();
  const x = Math.min(T_MAX, Math.max(1, T));
  const i = Math.min(memo.t.length - 2, Math.floor((x - 1) / PAS));
  const u = (x - memo.t[i]) / PAS;
  const v = (A) => A[i] + u * (A[i + 1] - A[i]);
  return { I: v(memo.I), P: v(memo.P), M: v(memo.M) };
}

export default {
  etat: { t: 30 },

  termes: ['intégrable'],

  rappel: [
    'Pour $f$ positive sur $[a, b\\mathclose{[}$, l’intégrale de Lebesgue est la limite des intégrales de Riemann sur $[a, t]$ ; si l’intégrale impropre est absolument convergente, $f$ est intégrable et les deux intégrales coïncident (Théorème 5.2.3).',
    'L’intégrale de Lebesgue prolonge donc les intégrales impropres absolument convergentes, mais pas les semi-convergentes. Sur $[1, +\\infty\\mathclose{[}$, $\\int_1^t \\frac{\\sin x}{x}\\,\\mathrm dx$ a une limite (une intégration par parties le montre),',
    'mais',
    '$$\\int_{k\\pi}^{(k+1)\\pi} \\frac{|\\sin x|}{x}\\,\\mathrm dx \\ge \\frac{2}{(k+1)\\pi}$$',
    'et la série harmonique diverge : $\\int |f| \\,\\mathrm d\\lambda = +\\infty$. Mieux, $f^+$ et $f^-$ ont toutes deux une intégrale infinie : $f$ n’admet même pas d’intégrale (Exemple 5.2.2).',
    'C’est le pendant continu de la série $\\sum (-1)^n/(n+1)$ du chapitre 4 : les arches positives et négatives se compensent dans l’ordre de lecture, pas en masse.',
  ],

  essais: [
    { texte: 'Faites glisser la borne $t$ vers la droite : l’intégrale oscille autour de sa limite $\\pi/2 - \\operatorname{Si}(1) \\approx 0{,}625$, de moins en moins.', etat: { t: 15 } },
    { texte: 'Allez jusqu’à $t = 200$ : combien valent $\\int_1^t f^+$ et $\\int_1^t f^-$ ? Elles croissent comme $\\frac1\\pi \\ln t$, sans borne.', etat: { t: 200 } },
  ],

  monte(zone, outils) {
    const r = outils.etat;

    const cG = carte(zone, 'Le graphe de $f(x) = \\sin x / x$ sur $[1, t]$');
    cG.classList.add('principale');
    boutonInfo(cG, [
      ['zone', '--zone-stable', 'Les arches où $f > 0$ : leur aire totale est $\\int_1^t f^+$.'],
      ['zone', '--zone-2', 'Les arches où $f < 0$ : leur aire totale est $\\int_1^t f^-$.'],
      ['ligne', '--perturbation', 'La borne $t$ : faites-la glisser sur la figure.'],
    ]);
    const champT = champ(cG, { latex: 't', min: 1, max: T_MAX, pas: 0.5, pasFleche: 1, valeur: r.t }, (v) => {
      outils.change({ t: Math.min(T_MAX, Math.max(1, v)) });
      dessine();
    });
    const canvasG = toile(cG, '16 / 5', () => dessine());
    canvasG.classList.add('saisissable');
    const repG = new Repere(canvasG, { x: [0, 30], y: [-0.3, 0.9] });
    glisse(canvasG, repG, {
      deplace: (x) => {
        outils.change({ t: Math.round(Math.min(T_MAX, Math.max(1, x)) * 10) / 10 });
        dessine();
      },
    });

    const grille = document.createElement('div');
    grille.className = 'grille-2';
    zone.appendChild(grille);
    const cI = carte(grille, '$t \\mapsto \\int_1^t f$ : semi-convergente');
    const canvasI = toile(cI, '16 / 7', () => dessine());
    const repI = new Repere(canvasI, { x: [1, T_MAX], y: [0, 1] });
    const texteI = paragraphe(cI, '', 'verdict');
    const cP = carte(grille, '$t \\mapsto \\int_1^t f^+$ et $\\int_1^t f^-$ : infinies');
    const canvasP = toile(cP, '16 / 7', () => dessine());
    const repP = new Repere(canvasP, { x: [1, T_MAX], y: [0, 2.5] });
    const zoneLegende = document.createElement('div');
    cP.appendChild(zoneLegende);
    const texteP = paragraphe(cP, '', 'verdict');

    const courbe = (cle, n = 600) =>
      Array.from({ length: n + 1 }, (_, i) => {
        const t = 1 + ((T_MAX - 1) * i) / n;
        return [t, enT(t)[cle]];
      });

    function dessine() {
      const col = couleurs();
      const t = Math.min(T_MAX, Math.max(1, r.t));
      champT.fixe(t);
      const v = enT(t);

      // Graphe, sur une fenêtre qui suit t.
      const fin = Math.max(12, t * 1.08);
      repG.fixeCadre([0, fin], [-0.3, 0.9]);
      if (repG.prepare()) {
        aire(repG, (x) => Math.max(0, f(x)), { a: 1, b: t, couleur: col.zone, n: 3000 });
        aire(repG, (x) => Math.min(0, f(x)), { a: 1, b: t, couleur: col.zone2, n: 3000 });
        repG.axes({ noms: ['x', ''], grille: false });
        traceFonction(repG, f, { a: 1, b: fin, couleur: col.trait, largeur: 1.6, n: 3000 });
        repG.trace([[t, -0.3], [t, 0.9]], { couleur: col.perturbation, largeur: 1.6 });
        repG.texte(t, 0.9, `t = ${String(t).replace('.', ',')}`, { dx: 5, dy: 14, couleur: col.perturbation, fond: true, police: '600 12px system-ui, sans-serif' });
      }

      // ∫₁ᵗ f.
      if (repI.prepare()) {
        repI.axes({ noms: ['t', ''], grille: false });
        repI.trace([[1, LIMITE], [T_MAX, LIMITE]], { couleur: col.equilibre, largeur: 1.4, tirets: [6, 4] });
        repI.trace(courbe('I'), { couleur: col.accent, largeur: 1.8 });
        repI.point(t, v.I, { rayon: 5, couleur: col.perturbation });
      }
      texteI.className = 'verdict ok';
      outils.rendTexte(texteI, `$\\int_1^t \\frac{\\sin x}{x}\\,\\mathrm dx = ${nb(v.I, 4)} \\to \\frac\\pi2 - \\operatorname{Si}(1) \\approx ${nb(LIMITE, 4)}$`);

      // ∫₁ᵗ f⁺ et f⁻.
      repP.fixeCadre([1, T_MAX], [0, enT(T_MAX).P * 1.1]);
      if (repP.prepare()) {
        repP.axes({ noms: ['t', ''], grille: false });
        repP.trace(courbe('P'), { couleur: col.series[1], largeur: 1.8 });
        repP.trace(courbe('M'), { couleur: col.series[0], largeur: 1.8 });
        repP.point(t, v.P, { rayon: 4, couleur: col.perturbation });
        repP.point(t, v.M, { rayon: 4, couleur: col.perturbation });
      }
      zoneLegende.replaceChildren();
      legende(zoneLegende, [
        { texte: '$\\int_1^t f^+$', couleur: col.series[1] },
        { texte: '$\\int_1^t f^-$', couleur: col.series[0] },
      ]);
      texteP.className = 'verdict alerte';
      outils.rendTexte(texteP, `$\\int_1^t f^+ = ${nb(v.P)}$, $\\int_1^t f^- = ${nb(v.M)}$ : toutes deux $\\to +\\infty$, $f$ n’a pas d’intégrale.`);
    }

    outils.surTheme(dessine);
    dessine();
    return { applique: dessine };
  },
};
