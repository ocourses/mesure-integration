// Fubini par tranches (poly, section 6.2 ; TD4, exercice 3). On intègre une
// fonction de deux variables tranche par tranche : pour x fixé (tranche
// verticale), φ(x) = ∫ f(x, y) dy ; pour y fixé (tranche horizontale),
// ψ(y) = ∫ f(x, y) dx. On choisit la tranche d'un clic sur la carte de f, et
// l'on voit ses bornes, son intégrale et la fonction φ ou ψ qu'elle construit.
// La carte de f se lit à plat (aplats) ou en relief (surface z = f(x, y),
// coupée par le plan de la tranche).
// Le dernier exemple, hors du poly, montre que les deux ordres peuvent différer
// quand f n'est pas intégrable.

import { etiquettesAxe, latexNombreFinal, latexPositifFixe } from '../ui/format.js';

const pos = (v) => latexPositifFixe(v, 2, 1);
import { Repere } from '../ui/repere.js';
import { couleurs } from '../ui/theme.js';
import { barreOutils, boutonInfo, carte, choixRadios, glisse, paragraphe, toile } from './commun.js';
import { aire, traceFonction } from './fonctions.js';

export const FONCTIONS = {
  triangle: {
    latex: 'e^{-(x+y)} \\mathbb 1_{x + y \\le 1}',
    f: (x, y) => (x + y <= 1 ? Math.exp(-(x + y)) : 0),
    // En relief, les mailles du triangle prennent e^{−(x+y)} jusqu'à leur bord :
    // la surface s'arrête net au-dessus de x + y = 1, sans mur en dents de scie.
    prolonge: (x, y) => Math.exp(-(x + y)),
    vue: 1,
    // Tranches : φ(x) = ∫₀^{1−x} e^{−(x+y)} dy = e^{−x} − e^{−1}, et ψ de même.
    phi: (x) => (x <= 1 ? Math.exp(-x) - Math.exp(-1) : 0),
    psi: (y) => (y <= 1 ? Math.exp(-y) - Math.exp(-1) : 0),
    totalPhi: 1 - 2 / Math.E,
    totalPsi: 1 - 2 / Math.E,
    latexTotal: '1 - 2/e',
    bornes: (s) => `[0\\,;\\ ${pos(Math.max(0, 1 - s))}]`,
    // Partie de la tranche où f peut être non nulle, pour la tracer en gras.
    support: (s) => [0, Math.max(0, 1 - s)],
    echelle: 1,
    pas: 0.1,
    source: 'poly, exemple de la section 6.2',
  },
  td4: {
    latex: '\\frac{1}{(1 + y)(1 + x^2 y)}',
    f: (x, y) => 1 / ((1 + y) * (1 + x * x * y)),
    vue: 4,
    // φ(x) = ∫₀^{+∞} dy/((1 + y)(1 + x²y)) = 2 ln x/(x² − 1) ; ψ(y) = π/(2√y (1 + y)).
    phi: (x) => (x <= 0 ? Infinity : Math.abs(x - 1) < 1e-9 ? 1 : (2 * Math.log(x)) / (x * x - 1)),
    psi: (y) => (y <= 0 ? Infinity : Math.PI / (2 * Math.sqrt(y) * (1 + y))),
    totalPhi: (Math.PI * Math.PI) / 2,
    totalPsi: (Math.PI * Math.PI) / 2,
    latexTotal: '\\pi^2/2',
    bornes: () => '[0, +\\infty\\mathclose{[}',
    echelle: 1,
    pas: 0.5,
    source: 'TD4, exercice 3',
  },
  contre: {
    latex: '\\frac{x^2 - y^2}{(x^2 + y^2)^2}',
    f: (x, y) => (x * x - y * y) / (x * x + y * y) ** 2,
    vue: 1,
    // ∫₀¹ (x² − y²)/(x² + y²)² dy = [y/(x² + y²)]₀¹ = 1/(1 + x²), et ψ(y) = −1/(1 + y²).
    phi: (x) => 1 / (1 + x * x),
    psi: (y) => -1 / (1 + y * y),
    totalPhi: Math.PI / 4,
    totalPsi: -Math.PI / 4,
    latexTotal: null,
    bornes: () => '[0, 1]',
    echelle: 3,
    // f n'est pas bornée près de 0 : en relief, la hauteur est saturée (tanh).
    sature: true,
    pas: 0.1,
    source: 'hors du poly : un contre-exemple classique',
  },
};

export default {
  etat: { fonction: 'triangle', ordre: 'phi', s: 0.4 },

  choix: { fonction: Object.keys(FONCTIONS), ordre: ['phi', 'psi'], figure: ['2d', '3d'] },

  preferences: { figure: '2d' },

  termes: ['application mesurable', 'Fubini', 'Fubini-Tonelli', 'tribu produit', 'intégrable', 'σ-finie'],

  rappel: [
    'Fubini-Tonelli (Théorème 6.2.1) : pour $f$ positive et mesurable pour la tribu produit, sur un produit d’espaces σ-finis,',
    '$$\\int f \\,\\mathrm d(\\mu_1 \\otimes \\mu_2) = \\int \\phi \\,\\mathrm d\\mu_1 = \\int \\psi \\,\\mathrm d\\mu_2,$$',
    'où',
    '$$\\begin{gathered}\\phi(x) = \\int f(x, y)\\,\\mathrm d\\mu_2(y),\\\\[0.4em] \\psi(y) = \\int f(x, y)\\,\\mathrm d\\mu_1(x).\\end{gathered}$$',
    'Fubini (Théorème 6.2.2) : même conclusion pour $f$ de signe quelconque, à condition que $f$ soit intégrable, ce que l’on vérifie avec Tonelli appliqué à $|f|$.',
    'En pratique, on intègre tranche par tranche, et la difficulté est dans les bornes. Exemple du poly :',
    '$$f(x, y) = e^{-(x+y)}\\,\\mathbb 1_{x + y \\le 1}.$$',
    'La tranche à $y$ fixé est $[0, 1 - y]$, et l’intégrale double vaut',
    '$$\\int f = 1 - \\frac{2}{e}.$$',
  ],

  essais: [
    { texte: 'L’exemple du poly : déplacez la tranche verticale. Ses bornes sont $[0, 1 - x]$ ; la courbe du bas est $\\phi(x) = e^{-x} - e^{-1}$.', etat: { fonction: 'triangle', ordre: 'phi', s: 0.3 } },
    { texte: 'TD4, exercice 3 : à $y$ fixé, $\\int \\frac{\\mathrm dx}{1 + x^2 y} = \\frac{\\pi}{2\\sqrt y}$. Passez aux tranches horizontales, puis revenez : les deux ordres donnent $\\pi^2/2$.', etat: { fonction: 'td4', ordre: 'psi', s: 1 } },
    { texte: 'Hors du poly : pour $\\frac{x^2 - y^2}{(x^2 + y^2)^2}$ sur $[0, 1]^2$, les deux ordres donnent $\\pi/4$ et $-\\pi/4$. Quelle hypothèse de Fubini manque ?', etat: { fonction: 'contre', ordre: 'phi', s: 0.5 } },
  ],

  monte(zone, outils) {
    const r = outils.etat;
    const prefs = outils.preferences;

    const barre = barreOutils(zone);
    const choixF = choixRadios(barre, {
      nom: 'fonction',
      options: Object.entries(FONCTIONS).map(([valeur, { latex }]) => ({ valeur, latex: `f = ${latex}` })),
      change: (valeur) => {
        outils.change({ fonction: valeur, s: Math.min(r.s, FONCTIONS[valeur].vue) });
        dessine();
      },
    });
    const choixO = choixRadios(barre, {
      nom: 'ordre',
      options: [
        { valeur: 'phi', texte: 'tranches verticales (x fixé)' },
        { valeur: 'psi', texte: 'tranches horizontales (y fixé)' },
      ],
      change: (valeur) => {
        outils.change({ ordre: valeur });
        dessine();
      },
    });

    const grille = document.createElement('div');
    grille.className = 'grille-2 principale';
    zone.appendChild(grille);

    // ---- Carte de f, à plat ou en relief ------------------------------------------------------
    const cC = carte(grille, 'La fonction $f$ sur le produit');
    boutonInfo(cC, [
      ['zone', '--accent', 'Les valeurs positives de $f$ : plus l’aplat est foncé (en 2D) ou la surface haute (en 3D), plus $f$ est grande.'],
      ['zone', '--observateur', 'Les valeurs négatives de $f$.'],
      ['ligne', '--perturbation', 'La tranche choisie : cliquez ou faites glisser sur la figure. En 3D, le plan de la tranche coupe la surface selon la courbe de la figure de droite.'],
      ['fleche', '--discret', 'Se déplacer en 3D : le bouton gauche déplace la tranche ; le bouton droit (ou Maj enfoncée avec le bouton gauche, ou un trackpad) fait tourner la vue autour de la surface : vers la droite ou la gauche pour en faire le tour, vers le bas pour la voir de dessus.'],
    ]);
    const choixFig = choixRadios(cC, {
      nom: 'figure',
      options: [
        { valeur: '2d', texte: 'à plat (2D)' },
        { valeur: '3d', texte: 'en relief (3D)' },
      ],
      change: (valeur) => {
        prefs.change({ figure: valeur });
        dessine();
      },
    });
    const canvasC = toile(cC, '1 / 1', () => dessine());
    canvasC.classList.add('cliquable');
    // Marges égales en largeur et en hauteur : le carré [0, v]² remplit la toile
    // carrée, et les graduations de x tombent juste sous l'axe.
    const repC = new Repere(canvasC, { x: [0, 1], y: [0, 1], egal: true, marges: { gauche: 34, bas: 22, haut: 20, droite: 8 } });
    const enRelief = () => prefs.valeurs.figure === '3d';
    const changeS = (s) => {
      const v = FONCTIONS[r.fonction].vue;
      outils.change({ s: Math.round(Math.min(v, Math.max(0.001, s)) * 1000) / 1000 });
      dessine();
    };
    glisse(canvasC, repC, {
      deplace: (x, y) => {
        const v = FONCTIONS[r.fonction].vue;
        // En 3D, le pointeur est ramené sur le plan z = 0.
        const point = enRelief() ? planDeBase(x, y) : [x / v, y / v];
        if (point) changeS((r.ordre === 'phi' ? point[0] : point[1]) * v);
      },
    });

    // ---- La tranche -------------------------------------------------------------------------
    const cT = carte(grille, '');
    const titreT = document.createElement('h2');
    cT.prepend(titreT);
    boutonInfo(cT, [
      ['ligne', '--perturbation', 'En haut : la tranche, $f$ restreinte à la droite choisie ; son intégrale est l’aire orange (comptée négativement en vert).'],
      ['ligne', '--equilibre', 'En bas : la fonction $\\phi$ (ou $\\psi$) des intégrales des tranches ; son intégrale est l’intégrale double.'],
      ['point', '--perturbation', 'La tranche choisie : les tirets la relient à l’abscisse choisie et à sa valeur, l’aire orange du haut. Faites glisser le point pour changer de tranche.'],
    ]);
    const canvasT = toile(cT, '16 / 7', () => dessine());
    const repT = new Repere(canvasT, { x: [0, 1], y: [0, 1] });
    const texteT = paragraphe(cT, '', 'note');
    const canvasP = toile(cT, '16 / 7', () => dessine());
    canvasP.classList.add('cliquable');
    const repP = new Repere(canvasP, { x: [0, 1], y: [0, 1] });
    glisse(canvasP, repP, { deplace: (x) => changeS(x) });
    const verdict = paragraphe(cT, '', 'verdict');

    // Grille du produit, un trait tous les F.pas, par-dessus les aplats.
    function grilleProduit(F, col) {
      const ctx = repC.ctx;
      ctx.save();
      repC.decoupe();
      ctx.strokeStyle = col.discret;
      ctx.globalAlpha = 0.22;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let k = 1; k * F.pas < F.vue - 1e-9; k++) {
        const t = k * F.pas;
        ctx.moveTo(repC.X(t), repC.Y(0));
        ctx.lineTo(repC.X(t), repC.Y(F.vue));
        ctx.moveTo(repC.X(0), repC.Y(t));
        ctx.lineTo(repC.X(F.vue), repC.Y(t));
      }
      ctx.stroke();
      ctx.restore();
    }

    function carteDeChaleur(F, col) {
      const ctx = repC.ctx;
      const m = 140;
      const v = F.vue;
      const l = (repC.X(v) - repC.X(0)) / m;
      ctx.save();
      repC.decoupe();
      for (let i = 0; i < m; i++) {
        for (let j = 0; j < m; j++) {
          const [x, y] = [((i + 0.5) * v) / m, ((j + 0.5) * v) / m];
          const z = F.f(x, y);
          if (!Number.isFinite(z) || z === 0) continue;
          ctx.globalAlpha = Math.min(1, Math.abs(z) / F.echelle) * 0.75;
          ctx.fillStyle = z > 0 ? col.accent : col.observateur;
          ctx.fillRect(repC.X(x) - l / 2, repC.Y(y) - l / 2, l + 0.6, l + 0.6);
        }
      }
      ctx.restore();
    }

    // ---- Relief --------------------------------------------------------------------------------
    // Caméra orthographique, comme pour la surface de Lyapunov du cours
    // d'automatique : l'azimut tourne autour de l'axe vertical, l'élévation
    // incline la vue. Un point (u, w, h), avec u = x/v, w = y/v dans [0, 1] et
    // h = f/échelle dans [−1, 1], donne une abscisse X et une hauteur H à
    // l'écran, et une profondeur (plus grande = plus loin). Au départ,
    // l'origine est au fond : les valeurs hautes, près de 0, ne cachent rien.
    const KH = 0.85;
    const camera = { azimut: -1.99, elevation: 0.55 };
    const tourne = (u, w, h) => {
      const [x, y, z] = [u - 0.5, w - 0.5, KH * h];
      const [ca, sa, ce, se] = [Math.cos(camera.azimut), Math.sin(camera.azimut), Math.cos(camera.elevation), Math.sin(camera.elevation)];
      const Y = x * sa + y * ca;
      return { X: x * ca - y * sa, H: Y * se + z * ce, prof: Y * ce - z * se };
    };
    // Point du plan z = 0 sous le pointeur (null si la vue est rasante).
    const planDeBase = (X, H) => {
      const [ca, sa, se] = [Math.cos(camera.azimut), Math.sin(camera.azimut), Math.sin(camera.elevation)];
      if (Math.abs(se) < 0.08) return null;
      const Y = H / se;
      return [X * ca + Y * sa + 0.5, -X * sa + Y * ca + 0.5];
    };
    // Bouton droit (ou Maj + glisser) : on tourne autour de la surface ; le
    // bouton gauche déplace la tranche. Le geste saisit l'objet : tirer vers la
    // droite le fait tourner vers la droite, tirer vers le bas montre le dessus.
    let prise = null;
    canvasC.addEventListener(
      'pointerdown',
      (ev) => {
        if (!enRelief() || !(ev.button === 2 || ev.shiftKey)) return;
        prise = { x: ev.clientX, y: ev.clientY, azimut: camera.azimut, elevation: camera.elevation };
        canvasC.setPointerCapture(ev.pointerId);
        ev.stopImmediatePropagation();
        ev.preventDefault();
      },
      { capture: true },
    );
    canvasC.addEventListener('pointermove', (ev) => {
      if (!prise) return;
      camera.azimut = prise.azimut + (ev.clientX - prise.x) * 0.01;
      camera.elevation = Math.min(1.5, Math.max(-1.2, prise.elevation + (ev.clientY - prise.y) * 0.01));
      dessine();
    });
    const lache = () => (prise = null);
    canvasC.addEventListener('pointerup', lache);
    canvasC.addEventListener('pointercancel', lache);
    canvasC.addEventListener('contextmenu', (ev) => {
      if (enRelief()) ev.preventDefault();
    });

    function relief(F, col, s, phi) {
      const v = F.vue;
      const hauteur = (x, y) => {
        const z = F.f(x, y);
        if (!Number.isFinite(z)) return Math.sign(z) || 1;
        return F.sature ? Math.tanh(z / F.echelle) : Math.max(-1, Math.min(1, z / F.echelle));
      };
      // Cadre fixe pendant la rotation : la sphère qui contient le pavé, autour
      // de son centre projeté.
      const [hBas, hHaut] = [r.fonction === 'contre' ? -1 : 0, 1];
      const rayon = Math.hypot(0.5, 0.5, (KH * (hHaut - hBas)) / 2) + 0.06;
      const centre = tourne(0.5, 0.5, (hBas + hHaut) / 2);
      repC.fixeCadre([centre.X - rayon, centre.X + rayon], [centre.H - rayon, centre.H + rayon]);
      if (!repC.prepare()) return;
      const ctx = repC.ctx;
      const ecran = (u, w, h) => {
        const p = tourne(u, w, h);
        return [repC.X(p.X), repC.Y(p.H)];
      };
      // Grille de calcul : k mailles entre deux traits de la grille F.pas.
      const k = F.prolonge ? 6 : 4;
      const n = Math.round((v / F.pas) * k);
      const grilleH = (g) => Array.from({ length: n + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => g((i * v) / n, (j * v) / n)));
      const H = grilleH(hauteur);
      const Hp = F.prolonge ? grilleH((x, y) => Math.min(1, F.prolonge(x, y) / F.echelle)) : H;
      const P = (i, j, G) => ecran(i / n, j / n, G ? G[i][j] : 0);
      // `devant` : la maille est entre l'observateur et le plan de la tranche ;
      // elle est peinte en transparence pour laisser voir la tranche.
      const maille = ([i, j], devant) => {
        const dedans = !F.prolonge || F.f(((i + 0.5) * v) / n, ((j + 0.5) * v) / n) !== 0;
        const G = F.prolonge ? (dedans ? Hp : null) : H;
        const coins = [P(i, j, G), P(i + 1, j, G), P(i + 1, j + 1, G), P(i, j + 1, G)];
        const h = G ? (G[i][j] + G[i + 1][j] + G[i + 1][j + 1] + G[i][j + 1]) / 4 : 0;
        const opacite = devant ? 0.4 : 1;
        ctx.beginPath();
        coins.forEach(([X, Y], c) => (c ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y)));
        ctx.closePath();
        ctx.globalAlpha = opacite;
        ctx.fillStyle = col.fond;
        ctx.fill();
        if (Math.abs(h) > 1e-9) {
          ctx.globalAlpha = (0.18 + 0.6 * Math.abs(h)) * opacite;
          ctx.fillStyle = h > 0 ? col.accent : col.observateur;
          ctx.fill();
        }
        // Les traits de la grille F.pas, sur la surface.
        ctx.globalAlpha = 0.35 * opacite;
        ctx.strokeStyle = col.discret;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        if (i % k === 0) {
          ctx.moveTo(...coins[0]);
          ctx.lineTo(...coins[3]);
        }
        if (j % k === 0) {
          ctx.moveTo(...coins[0]);
          ctx.lineTo(...coins[1]);
        }
        if (i + 1 === n) {
          ctx.moveTo(...coins[1]);
          ctx.lineTo(...coins[2]);
        }
        if (j + 1 === n) {
          ctx.moveTo(...coins[3]);
          ctx.lineTo(...coins[2]);
        }
        ctx.stroke();
      };
      // Le plan de la tranche : la courbe t ↦ f et l'aire entre elle et z = 0.
      const plan = () => {
        const m = 240;
        const pts = Array.from({ length: m + 1 }, (_, q) => {
          const t = (q / m) * v;
          const [u, w] = phi ? [s / v, t / v] : [t / v, s / v];
          return [u, w, phi ? hauteur(s, Math.max(t, 1e-4)) : hauteur(Math.max(t, 1e-4), s)];
        });
        for (const [signe, couleur] of [[1, col.perturbation], [-1, col.observateur]]) {
          ctx.beginPath();
          pts.forEach(([u, w], q) => (q ? ctx.lineTo(...ecran(u, w, 0)) : ctx.moveTo(...ecran(u, w, 0))));
          for (let q = m; q >= 0; q--) {
            const [u, w, h] = pts[q];
            ctx.lineTo(...ecran(u, w, signe > 0 ? Math.max(0, h) : Math.min(0, h)));
          }
          ctx.closePath();
          ctx.globalAlpha = 0.3;
          ctx.fillStyle = couleur;
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.strokeStyle = col.perturbation;
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(...ecran(pts[0][0], pts[0][1], 0));
        ctx.lineTo(...ecran(pts[m][0], pts[m][1], 0));
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        pts.forEach(([u, w, h], q) => (q ? ctx.lineTo(...ecran(u, w, h)) : ctx.moveTo(...ecran(u, w, h))));
        ctx.stroke();
      };
      // Peintre : du plus loin au plus proche. Le plan de la tranche coupe
      // l'espace en deux : les mailles du côté opposé à l'observateur sont
      // peintes avant lui, les autres après (et en transparence).
      const profondeur = ([i, j]) => tourne((i + 0.5) / n, (j + 0.5) / n, 0).prof;
      const mailles = [];
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) mailles.push([i, j]);
      mailles.sort((a, b) => profondeur(b) - profondeur(a));
      const c = s / v;
      // Sens dans lequel la profondeur croît quand on traverse le plan.
      const pente = phi ? tourne(1, 0.5, 0).prof - tourne(0, 0.5, 0).prof : tourne(0.5, 1, 0).prof - tourne(0.5, 0, 0).prof;
      const devant = ([i, j]) => (((phi ? i : j) + 0.5) / n - c) * pente < 0;
      ctx.save();
      repC.decoupe();
      ctx.lineJoin = 'round';
      for (const m of mailles) if (!devant(m)) maille(m, false);
      plan();
      for (const m of mailles) if (devant(m)) maille(m, true);
      ctx.restore();
      // Axes x (bord y = 0) et y (bord x = v) du plan z = 0, gradués ; les
      // étiquettes sont poussées vers l'extérieur du carré.
      ctx.save();
      ctx.font = '11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      const [cx, cy] = ecran(0.5, 0.5, 0);
      const etiquette = (u, w, texte, ecart = 13) => {
        const [X, Y] = ecran(u, w, 0);
        const d = Math.hypot(X - cx, Y - cy) || 1;
        const [px, py] = [X + ((X - cx) / d) * ecart, Y + ((Y - cy) / d) * ecart];
        const l = ctx.measureText(texte).width;
        ctx.save();
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = col.fond;
        ctx.fillRect(px - l / 2 - 2, py - 7, l + 4, 14);
        ctx.restore();
        ctx.fillText(texte, px, py + 4);
      };
      const pasEtiquette = 2 * F.pas;
      const valeurs = [];
      for (let t = 0; t <= v + 1e-9; t += pasEtiquette) valeurs.push(Math.round(t * 1e6) / 1e6);
      const textes = etiquettesAxe(valeurs);
      ctx.fillStyle = col.discret;
      valeurs.forEach((t, q) => {
        etiquette(t / v, 0, textes[q]);
        if (q > 0) etiquette(1, t / v, textes[q]);
      });
      ctx.font = `italic 15px 'Latin Modern Roman', 'CMU Serif', Georgia, serif`;
      ctx.fillStyle = col.trait;
      etiquette(1.12, 0, 'x', 8);
      etiquette(1, 1.12, 'y', 8);
      ctx.restore();
    }

    function dessine() {
      const col = couleurs();
      const F = FONCTIONS[r.fonction];
      const v = F.vue;
      const s = Math.min(v, Math.max(0.001, r.s));
      const phi = r.ordre === 'phi';
      choixF.fixe(r.fonction);
      choixO.fixe(r.ordre);
      choixFig.fixe(prefs.valeurs.figure);

      // Carte de f et tranche.
      if (enRelief()) relief(F, col, s, phi);
      else {
        repC.fixeCadre([0, v], [0, v]);
        if (repC.prepare()) {
          carteDeChaleur(F, col);
          grilleProduit(F, col);
          repC.axes({ noms: ['x', 'y'], grille: false, dans: { x: [0, v], y: [0, v] } });
          const [u, w] = F.support ? F.support(s) : [0, v];
          const segment = (a, b) => (phi ? [[s, a], [s, b]] : [[a, s], [b, s]]);
          repC.trace(segment(0, v), { couleur: col.perturbation, largeur: 1, tirets: [4, 3] });
          repC.trace(segment(u, w), { couleur: col.perturbation, largeur: 3 });
        }
      }

      // La tranche t ↦ f(s, t) ou f(t, s) : son aire est la valeur du point du bas.
      const tranche = phi ? (t) => F.f(s, t) : (t) => F.f(t, s);
      const nom = phi ? `f(${pos(s)}\\,;\\ y)` : `f(x\\,;\\ ${pos(s)})`;
      outils.rendTexte(titreT, phi ? 'La tranche $y \\mapsto f(x, y)$ et $\\phi$' : 'La tranche $x \\mapsto f(x, y)$ et $\\psi$');
      let hT = 0;
      for (let i = 0; i <= 200; i++) hT = Math.max(hT, Math.abs(tranche((v * i) / 200)));
      hT = Math.min(Math.max(hT, 0.2) * 1.15, 4 * F.echelle);
      const negatif = r.fonction === 'contre';
      repT.fixeCadre([0, v], negatif ? [-hT, hT] : [0, hT]);
      if (repT.prepare()) {
        aire(repT, (t) => Math.max(0, tranche(t)), { a: 0, b: v, n: 800, couleur: col.perturbation, alpha: 0.2 });
        aire(repT, (t) => Math.min(0, tranche(t)), { a: 0, b: v, n: 800, couleur: col.observateur, alpha: 0.2 });
        repT.axes({ noms: [phi ? 'y' : 'x', ''], grille: false });
        traceFonction(repT, tranche, { a: 0.0005, b: v, couleur: col.perturbation, largeur: 2.2, n: 800 });
      }
      const valeurTranche = phi ? F.phi(s) : F.psi(s);
      const nomG = phi ? '\\phi' : '\\psi';
      outils.rendTexte(
        texteT,
        `Bornes de la tranche : $${phi ? 'y' : 'x'} \\in ${F.bornes(s)}$ ; $\\textcolor{${col.perturbation}}{${nomG}(${pos(s)}) = \\int ${nom}\\,\\mathrm d${phi ? 'y' : 'x'} = ${latexNombreFinal(valeurTranche, 4)}}$.`,
      );

      // φ ou ψ, et son intégrale ; le point de la tranche, relié aux deux axes.
      const G = phi ? F.phi : F.psi;
      let hP = 0;
      for (let i = 1; i <= 200; i++) hP = Math.max(hP, Math.abs(G((v * i) / 200)));
      hP = Math.min(hP * 1.15, 6);
      const bas = G(v / 2) < 0;
      repP.fixeCadre([0, v], bas ? [-hP, 0.1 * hP] : [0, hP]);
      if (repP.prepare()) {
        aire(repP, G, { a: 0.001, b: v, n: 600, couleur: bas ? col.zone3 : col.zone });
        repP.axes({ noms: [phi ? 'x' : 'y', ''], grille: false });
        traceFonction(repP, G, { a: 0.001, b: v, couleur: col.equilibre, largeur: 2, n: 600 });
        const yP = Math.max(-hP, Math.min(hP, valeurTranche));
        repP.trace([[s, 0], [s, yP]], { couleur: col.perturbation, largeur: 1.2, tirets: [4, 3] });
        repP.trace([[0, yP], [s, yP]], { couleur: col.perturbation, largeur: 1.2, tirets: [4, 3] });
        repP.point(s, yP, { rayon: 5, couleur: col.perturbation });
        const droite = s < 0.6 * v;
        repP.texte(s, yP, `(${pos(s).replaceAll('{,}', ',')} ; ${latexNombreFinal(valeurTranche, 3).replaceAll('{,}', ',').replace('-', '−')})`, {
          couleur: col.perturbation,
          align: droite ? 'left' : 'right',
          dx: droite ? 9 : -9,
          dy: bas ? 16 : -8,
          fond: true,
        });
      }
      const egal = Math.abs(F.totalPhi - F.totalPsi) < 1e-12;
      verdict.className = `verdict ${egal ? 'ok' : 'alerte'}`;
      outils.rendTexte(
        verdict,
        egal
          ? `$\\int \\phi = \\int \\psi = ${F.latexTotal} \\approx ${latexNombreFinal(F.totalPhi, 4)}$ : les deux ordres donnent l’intégrale double.`
          : `$\\int_0^1 \\phi = \\pi/4$ mais $\\int_0^1 \\psi = -\\pi/4$ : les deux ordres diffèrent. Ici $\\int |f| = +\\infty$, et Fubini ne s’applique pas.`,
      );
    }

    outils.surTheme(dessine);
    dessine();
    return { applique: dessine };
  },
};
