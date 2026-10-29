// Coordonnées polaires (poly, section 6.3, Théorème 6.3.4 et exemple
// « Coordonnées polaires »). φ(ρ, θ) = (ρ cos θ, ρ sin θ), |det J_φ| = ρ. Un
// petit rectangle [ρ₀, ρ₀ + dρ] × [θ₀, θ₀ + dθ], que l'on place d'un clic dans
// l'un ou l'autre plan, a pour image un secteur d'anneau, d'aire
// ρ̄ dρ dθ (ρ̄ = ρ₀ + dρ/2) : le jacobien mesure la dilatation des aires. On en
// tire l'intégrale de Gauss.

import { latexPositifFixe as nb, separateur } from '../../socle/js/ui/format.js';
import { Repere } from '../../socle/js/ui/repere.js';
import { couleurs } from '../../socle/js/ui/theme.js';
import { champ } from '../../socle/js/ui/controls.js';
import { boutonInfo, carte, glisse, paragraphe, toile, verdict } from './commun.js';
import { aire, traceFonction } from './fonctions.js';

export const R_MAX = 2.5;
const DEMI_PI = Math.PI / 2;

// Aire exacte de l'image du rectangle : ∫∫ ρ dρ dθ = (ρ₁² − ρ₀²)/2 · dθ.
export const aireImage = (rho, drho, dtheta) => (((rho + drho) ** 2 - rho ** 2) / 2) * dtheta;

// Le rectangle ramené dans ]0, R_MAX] × ]0, π/2[.
export function borne(rho, theta, drho, dtheta) {
  return {
    rho: Math.min(R_MAX - drho, Math.max(0, rho)),
    theta: Math.min(DEMI_PI - dtheta, Math.max(0, theta)),
  };
}

const arrondi = (v) => Math.round(v * 1000) / 1000;

export default {
  etat: { rho: 1.2, theta: 0.5, drho: 0.3, dtheta: 0.3 },

  termes: ['application mesurable', 'changement de variables', 'mesure de Lebesgue', 'matrice jacobienne', 'difféomorphisme'],

  rappel: [
    'Changement de variables (Théorème 6.3.4) : si $\\phi \\colon U \\to V$ est un $\\mathcal C^1$-difféomorphisme et $f \\ge 0$ mesurable sur $V$, alors, où $\\lambda_d$ est la mesure de Lebesgue,',
    '$$\\int_V f \\,\\mathrm d\\lambda_d = \\int_U (f \\circ \\phi)\\, |\\det J_\\phi| \\,\\mathrm d\\lambda_d.$$',
    'Pour une application affine $u \\mapsto Au + b$, on lit',
    '$$\\lambda_d(\\phi(B)) = |\\det A|\\,\\lambda_d(B) :$$',
    '$|\\det J_\\phi|$ est le facteur de dilatation des volumes. En général, il l’est localement.',
    'En coordonnées polaires,',
    '$$\\begin{gathered}\\phi(\\rho, \\theta) = (\\rho \\cos\\theta, \\rho \\sin\\theta),\\\\[0.3em] |\\det J_\\phi(\\rho, \\theta)| = \\rho.\\end{gathered}$$',
    'L’exemple du poly en tire l’intégrale de Gauss :',
    '$$\\begin{aligned}I^2 &= \\int_{\\mathbb R_+^2} e^{-(x^2 + y^2)}\\,\\mathrm d\\lambda_2 \\\\ &= \\frac\\pi2 \\int_0^{+\\infty} \\rho e^{-\\rho^2}\\,\\mathrm d\\rho = \\frac\\pi4,\\end{aligned}$$',
    'd’où',
    '$$\\int_{\\mathbb R} e^{-x^2}\\,\\mathrm dx = \\sqrt\\pi.$$',
  ],

  essais: [
    { texte: 'Faites glisser le petit rectangle vers la droite (ρ croissant) sans changer $\\mathrm d\\rho$ et $\\mathrm d\\theta$ : l’aire de son image grandit comme $\\rho$.', etat: { rho: 0.3, theta: 0.6, drho: 0.3, dtheta: 0.3 } },
    { texte: 'Près de $\\rho = 0$, le secteur s’écrase : $|\\det J_\\phi| = \\rho$ s’annule, et $\\phi$ n’est un difféomorphisme que sur $\\rho > 0$.', etat: { rho: 0, theta: 0.6, drho: 0.3, dtheta: 0.6 } },
    { texte: 'Réduisez $\\mathrm d\\rho$ et $\\mathrm d\\theta$ : le rapport des aires tend vers $\\rho_0$, la valeur du jacobien au coin du rectangle.', etat: { rho: 1.5, theta: 0.4, drho: 0.5, dtheta: 0.5 } },
  ],

  monte(zone, outils) {
    const r = outils.etat;

    const reglages = document.createElement('div');
    reglages.className = 'barre-outils champs-ligne';
    zone.appendChild(reglages);
    const [z1, z2] = [0, 1].map(() => reglages.appendChild(document.createElement('div')));
    const champR = champ(z1, { latex: '\\mathrm d\\rho', min: 0.02, max: 1, pas: 0.02, valeur: r.drho }, (v) => {
      outils.change({ drho: Math.min(1, Math.max(0.01, v)) });
      dessine();
    });
    const champT = champ(z2, { latex: '\\mathrm d\\theta', min: 0.02, max: 1, pas: 0.02, valeur: r.dtheta }, (v) => {
      outils.change({ dtheta: Math.min(1, Math.max(0.01, v)) });
      dessine();
    });

    const grille = document.createElement('div');
    grille.className = 'grille-2 principale';
    zone.appendChild(grille);

    const cU = carte(grille, 'Le plan $(\\rho, \\theta)$');
    boutonInfo(cU, [
      ['zone', '--perturbation', 'Le rectangle $[\\rho_0, \\rho_0 + \\mathrm d\\rho] \\times [\\theta_0, \\theta_0 + \\mathrm d\\theta]$ : cliquez ou faites glisser, ici ou dans l’autre plan.'],
      ['ligne', '--discret', 'Le quadrillage des $\\rho$ et des $\\theta$ constants, et son image à droite.'],
    ]);
    const canvasU = toile(cU, '1 / 1', () => dessine());
    canvasU.classList.add('cliquable');
    const repU = new Repere(canvasU, { x: [0, R_MAX + 0.1], y: [0, DEMI_PI + 0.1], egal: true });
    const texteU = verdict(cU, '');

    const cV = carte(grille, 'Son image par $\\phi$, dans le plan $(x, y)$');
    boutonInfo(cV, [
      ['zone', '--perturbation', 'L’image du rectangle : un secteur d’anneau.'],
      ['ligne', '--discret', 'Les cercles $\\rho$ constant et les rayons $\\theta$ constant.'],
      ['zone', '--zone-stable', 'En fond, $e^{-(x^2 + y^2)}$, la fonction de l’intégrale de Gauss.'],
    ]);
    const canvasV = toile(cV, '1 / 1', () => dessine());
    canvasV.classList.add('cliquable');
    const repV = new Repere(canvasV, { x: [0, R_MAX + 0.1], y: [0, R_MAX + 0.1], egal: true });
    const texteV = verdict(cV, '');

    const cG = carte(zone, 'L’intégrale de Gauss : $\\rho \\mapsto \\rho\\,e^{-\\rho^2}$');
    const canvasG = toile(cG, '16 / 3', () => dessine());
    const repG = new Repere(canvasG, { x: [0, R_MAX + 0.1], y: [0, 0.5] });
    const texteG = paragraphe(cG, '', 'note');

    const place = (rho, theta) => {
      const b = borne(rho, theta, r.drho, r.dtheta);
      outils.change({ rho: arrondi(b.rho), theta: arrondi(b.theta) });
      dessine();
    };
    glisse(canvasU, repU, { deplace: (rho, theta) => place(rho - r.drho / 2, theta - r.dtheta / 2) });
    glisse(canvasV, repV, {
      deplace: (x, y) => place(Math.hypot(x, y) - r.drho / 2, Math.atan2(Math.max(0, y), Math.max(0, x)) - r.dtheta / 2),
    });

    function dessine() {
      const col = couleurs();
      // Une taille lue dans l'URL hors de [0,01 ; 1] est ramenée dans l'intervalle.
      const ramene = (v) => Math.min(1, Math.max(0.01, v));
      if (r.drho !== ramene(r.drho) || r.dtheta !== ramene(r.dtheta)) outils.change({ drho: ramene(r.drho), dtheta: ramene(r.dtheta) });
      champR.fixe(r.drho);
      champT.fixe(r.dtheta);
      const { rho, theta } = borne(r.rho, r.theta, r.drho, r.dtheta);
      const [r1, t1] = [rho + r.drho, theta + r.dtheta];

      // Plan (ρ, θ).
      if (repU.prepare()) {
        repU.axes({ noms: ['ρ', 'θ'], grille: false, dans: { x: [0, R_MAX + 0.1], y: [0, DEMI_PI + 0.1] } });
        for (let k = 0.5; k <= R_MAX; k += 0.5) repU.trace([[k, 0], [k, DEMI_PI]], { couleur: col.discret, largeur: 0.8, alpha: 0.6 });
        for (let k = 1; k <= 6; k++) repU.trace([[0, (k * DEMI_PI) / 6], [R_MAX, (k * DEMI_PI) / 6]], { couleur: col.discret, largeur: 0.8, alpha: 0.6 });
        const ctx = repU.ctx;
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = col.perturbation;
        ctx.fillRect(repU.X(rho), repU.Y(t1), repU.X(r1) - repU.X(rho), repU.Y(theta) - repU.Y(t1));
        ctx.restore();
        repU.trace([[rho, theta], [r1, theta], [r1, t1], [rho, t1], [rho, theta]], { couleur: col.perturbation, largeur: 2 });
      }
      const aireU = r.drho * r.dtheta;
      outils.rendTexte(texteU, `Aire du rectangle : $\\mathrm d\\rho\\,\\mathrm d\\theta = ${nb(aireU, 4, 1)}$, coin $(\\rho_0, \\theta_0) = (${nb(rho, 2, 1)}${separateur([rho, theta], 2)}${nb(theta, 2, 1)})$.`);

      // Plan (x, y) : fond de Gauss, quadrillage image et secteur.
      if (repV.prepare()) {
        // Fond : e^{−ρ²} en dégradé radial de l'accent (couleur hexadécimale du thème).
        const ctxF = repV.ctx;
        const [rr, gg, bb] = [1, 3, 5].map((i) => parseInt(col.accent.slice(i, i + 2), 16));
        const degrade = ctxF.createRadialGradient(repV.X(0), repV.Y(0), 0, repV.X(0), repV.Y(0), repV.X(R_MAX) - repV.X(0));
        for (let k = 0; k <= 10; k++) {
          const u = (k / 10) * R_MAX;
          degrade.addColorStop(k / 10, `rgba(${rr}, ${gg}, ${bb}, ${0.3 * Math.exp(-u * u)})`);
        }
        ctxF.save();
        repV.decoupe();
        ctxF.fillStyle = degrade;
        ctxF.fillRect(repV.X(0), repV.Y(R_MAX + 0.1), repV.X(R_MAX + 0.1) - repV.X(0), repV.Y(0) - repV.Y(R_MAX + 0.1));
        ctxF.restore();
        repV.axes({ noms: ['x', 'y'], grille: false, dans: { x: [0, R_MAX + 0.1], y: [0, R_MAX + 0.1] } });
        for (let k = 0.5; k <= R_MAX; k += 0.5) {
          const arc = Array.from({ length: 61 }, (_, i) => [k * Math.cos((i * DEMI_PI) / 60), k * Math.sin((i * DEMI_PI) / 60)]);
          repV.trace(arc, { couleur: col.discret, largeur: 0.8, alpha: 0.6 });
        }
        for (let k = 1; k <= 6; k++) {
          const t = (k * DEMI_PI) / 6;
          repV.trace([[0, 0], [R_MAX * Math.cos(t), R_MAX * Math.sin(t)]], { couleur: col.discret, largeur: 0.8, alpha: 0.6 });
        }
        const bord = [];
        for (let i = 0; i <= 40; i++) bord.push([r1 * Math.cos(theta + (i * r.dtheta) / 40), r1 * Math.sin(theta + (i * r.dtheta) / 40)]);
        for (let i = 40; i >= 0; i--) bord.push([rho * Math.cos(theta + (i * r.dtheta) / 40), rho * Math.sin(theta + (i * r.dtheta) / 40)]);
        bord.push(bord[0]);
        const ctx = repV.ctx;
        ctx.save();
        ctx.beginPath();
        bord.forEach(([x, y], k) => (k ? ctx.lineTo(repV.X(x), repV.Y(y)) : ctx.moveTo(repV.X(x), repV.Y(y))));
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = col.perturbation;
        ctx.fill();
        ctx.restore();
        repV.trace(bord, { couleur: col.perturbation, largeur: 2 });
      }
      const aireV = aireImage(rho, r.drho, r.dtheta);
      outils.rendTexte(
        texteV,
        `Aire de l’image : $${nb(aireV, 4, 1)}$, soit $${nb(aireV / aireU, 3, 1)}$ fois celle du rectangle : $\\bar\\rho = \\rho_0 + \\mathrm d\\rho/2 = ${nb(rho + r.drho / 2, 3, 1)}$, et $|\\det J_\\phi| = \\rho_0 = ${nb(rho, 3, 1)}$ au coin.`,
      );

      // Gauss.
      if (repG.prepare()) {
        aire(repG, (u) => u * Math.exp(-u * u), { a: 0, b: R_MAX + 0.1 });
        repG.axes({ noms: ['ρ', ''], grille: false });
        traceFonction(repG, (u) => u * Math.exp(-u * u), { a: 0, b: R_MAX + 0.1, couleur: col.accent, largeur: 2 });
      }
      outils.rendTexte(
        texteG,
        '$\\int_{\\mathbb R_+^2} e^{-(x^2 + y^2)}\\,\\mathrm d\\lambda_2 = \\int_0^{\\pi/2}\\!\\int_0^{+\\infty} e^{-\\rho^2} \\rho \\,\\mathrm d\\rho\\,\\mathrm d\\theta = \\frac\\pi2 \\cdot \\frac12 = \\frac\\pi4 = I^2$, donc $\\int_{\\mathbb R} e^{-x^2}\\,\\mathrm dx = 2I = \\sqrt\\pi$.',
      );
    }

    outils.surTheme(dessine);
    dessine();
    return { applique: dessine };
  },
};
