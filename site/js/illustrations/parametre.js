// Intégrale à paramètre (poly, section 5.3, Corollaires 5.3.2 et 5.3.5 ;
// TD4, exercices 1 et 2). F(t) = ∫_{ℝ₊} e^{−tx} / (1 + x²) dx. On choisit t d'un
// clic sur le graphe de F, et l'on voit l'intégrande et sa domination :
//   - continuité : f(t, x) ≤ 1/(1 + x²), intégrable, pour tout t ≥ 0 ;
//   - dérivation locale (Corollaire 5.3.5) : sur le segment [a, b] ⊂ ]0, +∞[,
//     |∂f/∂t| = x e^{−tx}/(1 + x²) ≤ x e^{−ax}, intégrable. La domination
//     dépend du segment, car sup_{t > 0} vaut x/(1 + x²), non intégrable : la
//     dérivation globale (Corollaire 5.3.4) ne s'applique pas, mais F est
//     dérivable en tout t > 0 (a < t < b). Que F' tende vers −∞ en 0⁺ vient
//     d'un autre argument (convergence monotone), pas de la domination.

import { latexNombreFinal, latexPositifFixe as nb } from '../ui/format.js';
import { Repere } from '../ui/repere.js';
import { couleurs } from '../ui/theme.js';
import { champ } from '../ui/controls.js';
import { barreOutils, boutonInfo, carte, choixRadios, glisse, paragraphe, toile } from './commun.js';
import { aire, integrale, traceFonction } from './fonctions.js';

export const T_MAX = 4;

// Par x = tan θ : F(t) = ∫₀^{π/2} e^{−t tan θ} dθ et F'(t) = −∫₀^{π/2} tan θ e^{−t tan θ} dθ.
export const F = (t) => integrale((th) => Math.exp(-t * Math.tan(th)), 0, Math.PI / 2, 3000);
export const Fprime = (t) => (t <= 0 ? -Infinity : -integrale((th) => Math.tan(th) * Math.exp(-t * Math.tan(th)), 0, Math.PI / 2, 4000));

// La domination x e^{−ax} vaut pour |∂f/∂t(t, ·)| dès que t ≥ a.
export const domineDerivee = (t, a) => t >= a;

// Pour t < a, x e^{−tx}/(1 + x²) > x e^{−ax} dès que e^{(a − t)x} > 1 + x² :
// le premier x > 0 au-delà duquel c'est vrai pour toujours (le plus grand zéro).
export function seuilViolation(t, a) {
  if (t >= a) return Infinity;
  const c = a - t;
  const g = (x) => c * x - Math.log(1 + x * x);
  // Sur [1, +∞[, g est convexe ; son minimum est en x_m, où 2x/(1 + x²) = c.
  const xm = c < 1 ? (1 + Math.sqrt(1 - c * c)) / c : 1;
  if (g(xm) >= 0) return 0;
  let hi = 2 * xm;
  while (g(hi) <= 0) hi *= 2;
  let lo = xm;
  for (let k = 0; k < 80; k++) {
    const m = (lo + hi) / 2;
    if (g(m) > 0) hi = m;
    else lo = m;
  }
  return hi;
}

export default {
  etat: { etape: 'continuite', t: 1, a: 0.5 },

  choix: { etape: ['continuite', 'derivation'] },

  termes: ['continuité sous l’intégrale', 'dérivation sous l’intégrale', 'intégrable', 'application mesurable', 'convergence monotone'],

  rappel: [
    'Continuité sous l’intégrale (Corollaire 5.3.2). Soit $\\mathcal I$ un intervalle. Si $x \\mapsto f(u, x)$ est mesurable pour tout $u$, si $u \\mapsto f(u, x)$ est continue sur $\\mathcal I$ pour presque tout $x$, et s’il existe $g$ intégrable avec $|f(u, x)| \\le g(x)$ pour tout $u \\in \\mathcal I$, alors $F$ est définie et continue sur $\\mathcal I$ :',
    '$$F(u) = \\int f(u, x)\\,\\mathrm d\\mu(x).$$',
    'Dérivation sous l’intégrale, version locale (Corollaire 5.3.5). Soit $\\mathcal I$ un intervalle ouvert. On suppose $x \\mapsto f(u, x)$ mesurable pour tout $u$, intégrable pour un $u_0$, et $u \\mapsto f(u, x)$ dérivable sur $\\mathcal I$ pour presque tout $x$. Si, pour tout segment $[a, b] \\subset \\mathcal I$, il existe $g_{a,b}$ intégrable avec $\\left|\\frac{\\partial f}{\\partial u}(u, x)\\right| \\le g_{a,b}(x)$ pour tout $u \\in [a, b]$, alors $F$ est dérivable sur $\\mathcal I$ et',
    '$$F’(u) = \\int \\frac{\\partial f}{\\partial u}(u, x)\\,\\mathrm d\\mu(x).$$',
    'La domination peut donc changer avec le segment (la dérivation globale, Corollaire 5.3.4, exige une seule fonction $g$ pour tout $\\mathcal I$). La dérivabilité étant locale, cela suffit.',
    'Ici, $F(t) = \\int_{\\mathbb R_+} \\frac{e^{-tx}}{1 + x^2}\\,\\mathrm dx$ (TD4, exercices 1 et 2). Continuité : $0 \\le f(t, x) \\le \\frac{1}{1 + x^2}$ pour tout $t \\ge 0$, donc $F$ est continue sur $[0, +\\infty\\mathclose{[}$, avec $F(0) = \\pi/2$. Dérivation sur $\\mathopen{]}0, +\\infty\\mathclose{[}$ : sur un segment $[a, b]$ avec $a > 0$, $\\left|\\frac{\\partial f}{\\partial t}\\right| \\le x e^{-ax}$, intégrable. Le choix de $a$ dépend du $t$ visé : il faut $a < t < b$. Aucune domination ne vaut pour tous les $t > 0$ à la fois, puisque $\\sup_{t > 0} \\frac{x e^{-tx}}{1 + x^2} = \\frac{x}{1 + x^2}$ n’est pas intégrable. Cela n’empêche pas $F$ d’être dérivable en chaque $t > 0$.',
    'Que $F’(t) \\to -\\infty$ quand $t \\to 0^+$ vient d’un autre argument (convergence monotone, TD4 exercice 2) : la domination ne le dit pas.',
  ],

  essais: [
    { texte: 'Continuité : quel que soit le $t \\ge 0$ choisi sur le graphe de $F$, l’intégrande reste sous $1/(1 + x^2)$, d’intégrale $\\pi/2$.', etat: { etape: 'continuite', t: 1 } },
    { texte: 'Dérivation, avec $a = 0{,}5$ : choisissez $t = 0{,}3$. Ce $t$ est hors du segment $[a, b]$, donc la domination ne dit rien en $t$ (la dérivée dépasse bien $x e^{-ax}$). Diminuez $a$ jusqu’à $a < t$ : $F’(t)$ existe, et se calcule sous l’intégrale.', etat: { etape: 'derivation', t: 0.3, a: 0.5 } },
    { texte: 'Prenez $t = 0{,}5$ et faites tendre $a$ vers $0$ : la dominante $x e^{-ax}$, d’intégrale $1/a^2$, explose, mais ce n’est pas un défaut de $F$ : on peut toujours reprendre $a < t$. Comparez avec l’enveloppe $\\frac{x}{1 + x^2}$ : c’est elle qui interdit une domination unique pour tous les $t > 0$.', etat: { etape: 'derivation', t: 0.5, a: 0.4 } },
  ],

  monte(zone, outils) {
    const r = outils.etat;

    const barre = barreOutils(zone);
    const choix = choixRadios(barre, {
      nom: 'etape',
      options: [
        { valeur: 'continuite', texte: 'continuité' },
        { valeur: 'derivation', texte: 'dérivation' },
      ],
      change: (valeur) => {
        outils.change({ etape: valeur });
        dessine();
      },
    });
    const zoneA = document.createElement('div');
    barre.appendChild(zoneA);
    const champA = champ(zoneA, { latex: 'a', min: 0.05, max: 2, pas: 0.05, valeur: r.a }, (v) => {
      outils.change({ a: Math.min(5, Math.max(0.01, v)) });
      dessine();
    });

    const grille = document.createElement('div');
    grille.className = 'grille-2 principale';
    zone.appendChild(grille);

    // ---- F et F' ------------------------------------------------------------------------------
    const cF = carte(grille, 'La fonction $F$');
    boutonInfo(cF, [
      ['ligne', '--accent', '$F(t)$, continue sur $[0, +\\infty\\mathclose{[}$, $F(0) = \\pi/2$.'],
      ['ligne', '--texte', 'En dérivation : $F’(t)$, qui tend vers $-\\infty$ en $0^+$.'],
      ['zone', '--zone-stable', 'En dérivation : le segment $[a, b]$, avec $b = 4$, sur lequel $x e^{-ax}$ domine la dérivée.'],
      ['point', '--perturbation', 'Le paramètre $t$ : cliquez ou faites glisser.'],
    ]);
    const canvasF = toile(cF, '1 / 1', () => dessine());
    canvasF.classList.add('cliquable');
    const repF = new Repere(canvasF, { x: [0, T_MAX], y: [-3, 2] });
    const texteF = paragraphe(cF, '', 'verdict');
    glisse(canvasF, repF, {
      deplace: (t) => {
        outils.change({ t: Math.round(Math.min(T_MAX, Math.max(0, t)) * 100) / 100 });
        dessine();
      },
    });

    // ---- L'intégrande et sa domination ----------------------------------------------------
    const cI = carte(grille, '');
    const titreI = document.createElement('h2');
    cI.prepend(titreI);
    boutonInfo(cI, [
      ['ligne', '--accent', 'L’intégrande pour le $t$ choisi ; son intégrale en aplat.'],
      ['ligne', '--perturbation', 'La dominante : $1/(1 + x^2)$, ou $x e^{-ax}$ sur le segment $[a, b]$ en dérivation.'],
      ['tirets', '--alerte', 'En dérivation : l’enveloppe $\\sup_{t > 0} \\frac{x e^{-tx}}{1 + x^2} = \\frac{x}{1 + x^2}$, non intégrable : pas de domination unique pour tous les $t > 0$.'],
    ]);
    const canvasI = toile(cI, '1 / 1', () => dessine());
    const repI = new Repere(canvasI, { x: [0, 8], y: [0, 1.1] });
    const texteI = paragraphe(cI, '', 'verdict');

    // F et F' sont gardées sur une grille de t.
    const ts = Array.from({ length: 161 }, (_, i) => (T_MAX * i) / 160);
    const valeursF = ts.map(F);
    const valeursFp = ts.map((t) => (t === 0 ? NaN : Fprime(t)));

    function dessine() {
      const col = couleurs();
      const derivation = r.etape === 'derivation';
      const t = Math.min(T_MAX, Math.max(0, r.t));
      const a = Math.max(0.01, r.a);
      choix.fixe(r.etape);
      champA.fixe(a);
      zoneA.style.opacity = derivation ? 1 : 0.35;
      for (const el of zoneA.querySelectorAll('input, button')) el.disabled = !derivation;

      // F (et F').
      repF.fixeCadre([0, T_MAX], derivation ? [-3, 1.8] : [0, 1.8]);
      if (repF.prepare()) {
        if (derivation) {
          const ctx = repF.ctx;
          ctx.save();
          repF.decoupe();
          ctx.fillStyle = col.zone;
          ctx.fillRect(repF.X(a), repF.Y(1.8), repF.X(T_MAX) - repF.X(a), repF.Y(-3) - repF.Y(1.8));
          ctx.restore();
        }
        repF.axes({ noms: ['t', ''], grille: false });
        repF.trace(ts.map((u, i) => [u, valeursF[i]]), { couleur: col.accent, largeur: 2.2 });
        if (derivation) repF.trace(ts.map((u, i) => [u, valeursFp[i]]), { couleur: col.trait, largeur: 1.8 });
        repF.trace([[t, -3], [t, 1.8]], { couleur: col.perturbation, largeur: 1, tirets: [3, 3] });
        repF.point(t, F(t), { rayon: 5, couleur: col.perturbation });
        if (derivation && t > 0) repF.point(t, Math.max(-3, Fprime(t)), { rayon: 5, couleur: col.perturbation, plein: false });
      }
      outils.rendTexte(
        texteF,
        derivation
          ? `$t = ${nb(t, 2)}$ : $F(t) = ${nb(F(t))}$, $F’(t) = ${t > 0 ? latexNombreFinal(Fprime(t), 3) : '-\\infty'}$.`
          : `$t = ${nb(t, 2)}$ : $F(t) = ${nb(F(t))}$ ; $F(0) = \\pi/2 \\approx ${nb(Math.PI / 2)}$.`,
      );

      // Intégrande.
      if (derivation) {
        outils.rendTexte(titreI, 'La dérivée $\\frac{\\partial f}{\\partial t}$ et sa domination');
        const d = (x) => (x * Math.exp(-t * x)) / (1 + x * x);
        const h = (x) => x * Math.exp(-a * x);
        const H = Math.max(0.6, Math.min(3, 1.2 / (a * Math.E)));
        repI.fixeCadre([0, 8], [0, H]);
        if (repI.prepare()) {
          aire(repI, d, { a: 0, b: 8, n: 800 });
          repI.axes({ noms: ['x', ''], grille: false });
          traceFonction(repI, (x) => x / (1 + x * x), { a: 0, b: 8, couleur: col.alerte, largeur: 1.4, tirets: [6, 4] });
          traceFonction(repI, h, { a: 0, b: 8, couleur: col.perturbation, largeur: 2 });
          traceFonction(repI, d, { a: 0, b: 8, couleur: col.accent, largeur: 2.2 });
        }
        const ok = domineDerivee(t, a);
        texteI.className = `verdict ${ok ? 'ok' : 'alerte'}`;
        outils.rendTexte(
          texteI,
          ok
            ? `$t \\in [a, b]$ : $\\left|\\frac{\\partial f}{\\partial t}\\right| \\le x e^{-ax}$, d’intégrale $1/a^2 = ${nb(1 / (a * a))}$. Avec $a < t < b$, le Corollaire 5.3.5 donne $F$ dérivable en $t$.`
            : `$t < a$ : $t$ est hors du segment $[a, b]$, la domination $x e^{-ax}$ ne dit rien en $t$ (la dérivée la dépasse pour $x > ${nb(seuilViolation(t, a), 1, 1)}$). $F$ reste dérivable en $t$ : il suffit de prendre $a < t$.`,
        );
      } else {
        outils.rendTexte(titreI, 'L’intégrande $f(t, x) = \\frac{e^{-tx}}{1 + x^2}$ et sa domination');
        const fx = (x) => Math.exp(-t * x) / (1 + x * x);
        repI.fixeCadre([0, 8], [0, 1.1]);
        if (repI.prepare()) {
          aire(repI, fx, { a: 0, b: 8, n: 800 });
          repI.axes({ noms: ['x', ''], grille: false });
          traceFonction(repI, (x) => 1 / (1 + x * x), { a: 0, b: 8, couleur: col.perturbation, largeur: 2 });
          traceFonction(repI, fx, { a: 0, b: 8, couleur: col.accent, largeur: 2.2 });
        }
        texteI.className = 'verdict ok';
        outils.rendTexte(texteI, `Pour tout $t \\ge 0$, $0 \\le f(t, x) \\le \\frac{1}{1 + x^2}$, d’intégrale $\\pi/2$ : $F$ est continue sur $[0, +\\infty\\mathclose{[}$.`);
      }
    }

    outils.surTheme(dessine);
    dessine();
    return { applique: dessine };
  },
};
