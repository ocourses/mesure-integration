// Boules unités et inégalité triangulaire (poly, section 4.4 ; contre-exemple
// qui suit le Théorème 4.4.9). Sur ([0, 1], 𝓑, λ), une fonction constante sur
// [0, 1/2] et sur ]1/2, 1] s'identifie au vecteur (x, y) de ses deux valeurs, et
//   ‖h‖_p = ((|x|^p + |y|^p) / 2)^{1/p}.
// On dessine la boule unité dans ce plan selon p, et l'on fait glisser deux
// fonctions f et g : pour p < 1, la boule n'est plus convexe et l'inégalité
// triangulaire tombe, comme pour f = 𝟙_{[0, 1/2]} et g = 𝟙_{]1/2, 1]} du poly.

import { latexNombreFixe, latexPositifFixe as nb } from '../ui/format.js';
import { Repere } from '../ui/repere.js';
import { couleurs } from '../ui/theme.js';
import { champ } from '../ui/controls.js';
import { boutonInfo, carte, glisse, paragraphe, toile } from './commun.js';

// ‖h‖_p de la fonction en escalier de valeurs (x, y) ; p = Infinity donne le max.
export function norme([x, y], p) {
  if (p === Infinity) return Math.max(Math.abs(x), Math.abs(y));
  return ((Math.abs(x) ** p + Math.abs(y) ** p) / 2) ** (1 / p);
}

// Bord de la boule unité { ‖h‖_p = 1 } : en coordonnées polaires, le rayon
// dans la direction θ est 1/‖(cos θ, sin θ)‖_p.
export function bordBoule(p, n = 720) {
  return Array.from({ length: n + 1 }, (_, k) => {
    const t = (2 * Math.PI * k) / n;
    const u = [Math.cos(t), Math.sin(t)];
    const r = 1 / norme(u, p);
    return [r * u[0], r * u[1]];
  });
}

// Défaut de l'inégalité triangulaire : ‖f + g‖_p − (‖f‖_p + ‖g‖_p), > 0 quand elle tombe.
export const defaut = (f, g, p) => norme([f[0] + g[0], f[1] + g[1]], p) - norme(f, p) - norme(g, p);

const aimante = (v, tol) => {
  const r = Math.round(v * 20) / 20;
  return Math.abs(v - Math.round(v)) < tol ? Math.round(v) : r;
};

export default {
  etat: { p: 0.5, fx: 1, fy: 0, gx: 0, gy: 1 },

  termes: ['norme'],

  rappel: [
    'Pour $p \\ge 1$, $\\|\\cdot\\|_p$ est une norme sur $L^p$ (Théorème 4.4.9) ; l’inégalité triangulaire est l’inégalité de Minkowski.',
    'Pour $0 < p < 1$, $L^p$ reste un espace vectoriel, mais $\\|\\cdot\\|_p$ n’est plus une norme : $x \\mapsto x^p$ est concave sur $[0, +\\infty\\mathclose{[}$, et non plus convexe.',
    'Le contre-exemple du poly : sur $[0, 1]$, $f = \\mathbb 1_{[0, 1/2]}$ et $g = \\mathbb 1_{\\mathopen{]}1/2, 1]}$ vérifient $\\|f\\|_p = \\|g\\|_p = 2^{-1/p}$ et $\\|f + g\\|_p = 1$, donc pour $p < 1$,',
    '$$\\|f\\|_p + \\|g\\|_p = 2^{1 - 1/p} < 1 = \\|f + g\\|_p.$$',
    'Géométriquement, une « norme » vérifie l’inégalité triangulaire si et seulement si sa boule unité est convexe. Ici, une fonction constante sur chaque moitié de $[0, 1]$ est un point $(x, y)$ du plan.',
  ],

  essais: [
    { texte: 'Le contre-exemple du poly avec $p = 1/2$ : $f = (1, 0)$ et $g = (0, 1)$. Le segment de $f/\\|f\\|_p$ à $g/\\|g\\|_p$ sort de la boule.', etat: { p: 0.5, fx: 1, fy: 0, gx: 0, gy: 1 } },
    { texte: 'Depuis $p = 0{,}5$, montez jusqu’à $p = 1$ : à partir de quand la boule devient-elle convexe ?', etat: { p: 0.5, fx: 1, fy: 0, gx: 0, gy: 1 } },
    { texte: 'Pour $p = 2$, faites glisser $f$ et $g$ : l’inégalité n’est une égalité que si $f$ et $g$ sont positivement colinéaires.', etat: { p: 2, fx: 1, fy: 0.5, gx: 0.5, gy: 1 } },
    { texte: 'Pour $p$ grand, la boule tend vers le carré $\\max(|x|, |y|) \\le 1$ : la boule de $L^\\infty$.', etat: { p: 8, fx: 1, fy: 0.3, gx: -0.4, gy: 1 } },
  ],

  monte(zone, outils) {
    const r = outils.etat;

    const colonnes = document.createElement('div');
    colonnes.className = 'deux-colonnes';
    zone.appendChild(colonnes);
    const gauche = document.createElement('div');
    gauche.className = 'colonne';
    colonnes.appendChild(gauche);

    // ---- Les fonctions sur [0, 1] ----------------------------------------------------------
    const cF = carte(gauche, 'Les fonctions $f$, $g$ et $f + g$ sur $[0, 1]$');
    boutonInfo(cF, [
      ['ligne', '--perturbation', '$f$ (trait plein) et $g$ (tirets), constantes sur $[0, 1/2]$ et sur $\\mathopen{]}1/2, 1]$.'],
      ['ligne', '--accent', 'La somme $f + g$.'],
    ]);
    const canvasF = toile(cF, '16 / 7', () => dessine());
    const repF = new Repere(canvasF, { x: [0, 1], y: [-2, 2] });

    // ---- L'inégalité ----------------------------------------------------------------------
    const cI = carte(gauche, 'L’inégalité triangulaire');
    const champP = champ(cI, { latex: 'p', min: 0.3, max: 8, pas: 0.05, pasFleche: 0.1, valeur: r.p }, (v) => {
      outils.change({ p: Math.min(50, Math.max(0.3, v)) });
      dessine();
    });
    const canvasI = toile(cI, '16 / 5', () => dessine());
    const repI = new Repere(canvasI, { x: [0, 3], y: [0, 2], marges: { gauche: 110, bas: 22, haut: 8, droite: 12 } });
    const verdict = paragraphe(cI, '', 'verdict');

    // ---- La boule unité ------------------------------------------------------------------
    const cB = carte(colonnes, 'La boule unité $\\{\\|h\\|_p \\le 1\\}$');
    boutonInfo(cB, [
      ['zone', '--zone-stable', 'La boule unité pour le $p$ choisi ; son bord en trait plein.'],
      ['tirets', '--discret', 'Les boules pour $p = 1$ (losange) et $p = \\infty$ (carré), pour comparer.'],
      ['point', '--perturbation', '$f$ et $g$ : faites-les glisser. Les points se collent aux entiers.'],
      ['point', '--accent', 'La somme $f + g$, sommet du parallélogramme.'],
      ['tirets', '--perturbation', 'Le segment entre $f/\\|f\\|_p$ et $g/\\|g\\|_p$ : il reste dans la boule si elle est convexe.'],
    ]);
    const canvasB = toile(cB, '1 / 1', () => dessine());
    canvasB.classList.add('saisissable');
    const repB = new Repere(canvasB, { x: [-2.2, 2.2], y: [-2.2, 2.2], egal: true });
    const texteB = paragraphe(cB, '', 'verdict');

    let saisi = null;
    glisse(canvasB, repB, {
      prend: (x, y) => {
        const df = Math.hypot((x - r.fx) * repB.sx, (y - r.fy) * repB.sy);
        const dg = Math.hypot((x - r.gx) * repB.sx, (y - r.gy) * repB.sy);
        saisi = Math.min(df, dg) < 16 ? (df <= dg ? 'f' : 'g') : null;
        return saisi !== null;
      },
      deplace: (x, y) => {
        const tol = 8 / repB.sx;
        const [ax, ay] = [aimante(Math.max(-3, Math.min(3, x)), tol), aimante(Math.max(-3, Math.min(3, y)), tol)];
        outils.change(saisi === 'f' ? { fx: ax, fy: ay } : { gx: ax, gy: ay });
        dessine();
      },
    });

    function dessine() {
      const col = couleurs();
      const p = Math.min(50, Math.max(0.3, r.p));
      champP.fixe(p);
      const f = [r.fx, r.fy];
      const g = [r.gx, r.gy];
      const s = [f[0] + g[0], f[1] + g[1]];
      const [nf, ng, ns] = [norme(f, p), norme(g, p), norme(s, p)];

      // Boule : le cadre englobe ses sommets (±2^{1/p} sur les axes), f, g et
      // f + g, sans dépasser 6.
      const R = Math.min(6, Math.max(2.2, 1.1 * 2 ** (1 / p), ...[...f, ...g, ...s].map((v) => 1.15 * Math.abs(v))));
      repB.fixeCadre([-R, R], [-R, R]);
      if (repB.prepare()) {
        const bord = bordBoule(p);
        const ctx = repB.ctx;
        ctx.save();
        repB.decoupe();
        ctx.beginPath();
        bord.forEach(([x, y], k) => (k ? ctx.lineTo(repB.X(x), repB.Y(y)) : ctx.moveTo(repB.X(x), repB.Y(y))));
        ctx.fillStyle = col.zone;
        ctx.fill();
        ctx.restore();
        repB.axes({ noms: ['x', 'y'], grille: true });
        repB.trace(bordBoule(1), { couleur: col.discret, largeur: 1, tirets: [4, 4] });
        repB.trace(bordBoule(Infinity), { couleur: col.discret, largeur: 1, tirets: [4, 4] });
        repB.trace(bord, { couleur: col.accent, largeur: 2 });
        // Parallélogramme.
        repB.trace([[0, 0], f, s, g, [0, 0]], { couleur: col.discret, largeur: 1 });
        // Segment entre les normalisés.
        if (nf > 0 && ng > 0) {
          const [fu, gu] = [f.map((v) => v / nf), g.map((v) => v / ng)];
          repB.trace([fu, gu], { couleur: col.perturbation, largeur: 1.4, tirets: [4, 3] });
          repB.point(...fu, { rayon: 3, couleur: col.perturbation, plein: false });
          repB.point(...gu, { rayon: 3, couleur: col.perturbation, plein: false });
        }
        repB.point(...f, { rayon: 6, couleur: col.perturbation });
        repB.point(...g, { rayon: 6, couleur: col.perturbation });
        repB.point(...s, { rayon: 5, couleur: col.accent });
        repB.texte(...f, 'f', { dx: 8, dy: -6, couleur: col.perturbation, police: 'italic 600 15px Georgia, serif', fond: true });
        repB.texte(...g, 'g', { dx: 8, dy: -6, couleur: col.perturbation, police: 'italic 600 15px Georgia, serif', fond: true });
        repB.texte(...s, 'f + g', { dx: 8, dy: -6, couleur: col.accent, police: 'italic 600 15px Georgia, serif', fond: true });
      }
      const convexe = p >= 1;
      texteB.className = `verdict ${convexe ? 'ok' : 'alerte'}`;
      outils.rendTexte(texteB, convexe ? `Pour $p = ${nb(p, 2, 1)} \\ge 1$, la boule est convexe : $\\|\\cdot\\|_p$ est une norme.` : `Pour $p = ${nb(p, 2, 1)} < 1$, la boule n’est pas convexe : $\\|\\cdot\\|_p$ n’est pas une norme.`);

      // Fonctions.
      const h = Math.max(1.2, ...[...f, ...g, ...s].map(Math.abs)) * 1.15;
      repF.fixeCadre([0, 1], [-h, h]);
      if (repF.prepare()) {
        repF.axes({ noms: ['t', ''], grille: false });
        const marche = ([a, b]) => [[0, a], [0.5, a], [NaN, NaN], [0.5, b], [1, b]];
        repF.trace(marche(s), { couleur: col.accent, largeur: 2.6 });
        repF.trace(marche(f), { couleur: col.perturbation, largeur: 2 });
        repF.trace(marche(g), { couleur: col.perturbation, largeur: 2, tirets: [6, 4] });
      }

      // Barres : ‖f‖ + ‖g‖ face à ‖f + g‖.
      const m = Math.max(nf + ng, ns, 0.5) * 1.1;
      repI.fixeCadre([0, m], [0, 2]);
      if (repI.prepare()) {
        const ctx = repI.ctx;
        const barre = (y, morceaux, nom) => {
          let x0 = 0;
          for (const [l, c] of morceaux) {
            ctx.fillStyle = c;
            ctx.fillRect(repI.X(x0), repI.Y(y + 0.3), repI.X(x0 + l) - repI.X(x0), repI.Y(y - 0.3) - repI.Y(y + 0.3));
            x0 += l;
          }
          repI.texte(0, y, nom, { align: 'right', dx: -8, dy: 5, police: '13px system-ui, sans-serif' });
        };
        barre(1.45, [[nf, col.perturbation], [ng, col.series[3]]], '‖f‖ + ‖g‖');
        barre(0.55, [[ns, col.accent]], '‖f + g‖');
        repI.trace([[nf + ng, 0], [nf + ng, 2]], { couleur: col.discret, largeur: 1, tirets: [3, 3] });
      }
      const d = defaut(f, g, p);
      verdict.className = `verdict ${d > 1e-12 ? 'alerte' : 'ok'}`;
      outils.rendTexte(
        verdict,
        `$\\|f\\|_p + \\|g\\|_p = ${nb(nf + ng)}$, $\\|f + g\\|_p = ${nb(ns)}$ : ${d > 1e-12 ? 'l’inégalité triangulaire est fausse' : 'l’inégalité triangulaire est vérifiée'} (écart $${latexNombreFixe(-d, 3)}$).`,
      );
    }

    outils.surTheme(dessine);
    dessine();
    return { applique: dessine };
  },
};
