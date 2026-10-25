// La mesure image, ou loi (poly, Définition 2.3.4, Exercice 2.3.3, Remarque
// 2.3.3, Exemple 2.3.3). Deux dés : Ω = {1, …, 6}², chaque issue de
// probabilité 1/36, et une variable X : Ω → ℝ (somme, maximum, écart, ou
// indicatrice d'un événement A que l'on forme en cliquant). Sa loi
// P_X(B) = P(X⁻¹(B)) est dessinée en barres ; on clique sur des barres pour
// former B, et X⁻¹(B) s'allume dans la grille des issues, réunion des fibres
// {X = k}. Un clic sur une issue ajoute ou retire toute sa fibre.

import { latexNombre } from '../ui/format.js';
import { Repere } from '../ui/repere.js';
import { couleurs } from '../ui/theme.js';
import { barreOutils, boutonInfo, carte, choixRadios, glisse, paragraphe, toile } from './commun.js';

export const ISSUES = Array.from({ length: 36 }, (_, k) => [Math.floor(k / 6) + 1, (k % 6) + 1]);

export const VARIABLES = {
  somme: { latex: 'X = i + j', X: (i, j) => i + j, valeurs: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  max: { latex: 'X = \\max(i, j)', X: (i, j) => Math.max(i, j), valeurs: [1, 2, 3, 4, 5, 6] },
  ecart: { latex: 'X = |i - j|', X: (i, j) => Math.abs(i - j), valeurs: [0, 1, 2, 3, 4, 5] },
  indicatrice: { latex: 'X = \\mathbb 1_A', X: null, valeurs: [0, 1] },
};

// Liste d'entiers lue dans l'URL (« 7,8 »), restreinte aux valeurs permises.
export function lisListe(texte, permis) {
  if (texte === '') return [];
  return [...new Set(String(texte).split(',').map(Number))].filter((v) => permis.includes(v)).sort((a, b) => a - b);
}

// Valeur de X en l'issue k (0 à 35), pour l'événement A (indices des issues).
export function valeur(nom, k, A = []) {
  const [i, j] = ISSUES[k];
  return nom === 'indicatrice' ? (A.includes(k) ? 1 : 0) : VARIABLES[nom].X(i, j);
}

// Nombre d'issues de chaque fibre {X = v} : la loi, en trente-sixièmes.
export function loi(nom, A = []) {
  const compte = new Map(VARIABLES[nom].valeurs.map((v) => [v, 0]));
  for (let k = 0; k < 36; k++) compte.set(valeur(nom, k, A), compte.get(valeur(nom, k, A)) + 1);
  return compte;
}

// Issues de X⁻¹(B).
export const reciproque = (nom, B, A = []) => ISSUES.map((_, k) => k).filter((k) => B.includes(valeur(nom, k, A)));

const fraction = (n) => (n === 0 ? '0' : `\\tfrac{${n}}{36}`);

export default {
  etat: { X: 'somme', B: '7', A: '' },

  choix: { X: Object.keys(VARIABLES) },

  termes: ['mesure image', 'fibre', 'espace mesuré', 'application mesurable', 'formules de Hausdorff', 'image réciproque', 'probabilité', 'mesure'],

  rappel: [
    'Soient $(E_1, \\mathcal A_1, \\mu)$ un espace mesuré et $f \\colon (E_1, \\mathcal A_1) \\to (E_2, \\mathcal A_2)$ mesurable. La mesure image de $\\mu$ par $f$ est (Définition 2.3.4)',
    '$$\\mu_f(B) = \\mu\\big(f^{-1}(B)\\big), \\qquad B \\in \\mathcal A_2,$$',
    'c’est-à-dire que l’on mesure une partie de l’arrivée par ce qui y tombe. C’est une mesure (Exercice 2.3.3) : les formules de Hausdorff transportent les réunions disjointes.',
    'En probabilités, c’est la loi : si $X \\colon (\\Omega, \\mathcal A) \\to (\\mathbb R, \\mathcal B(\\mathbb R))$ est une variable aléatoire, sa loi est une probabilité sur $\\mathbb R$,',
    '$$P_X(B) = P\\big(X^{-1}(B)\\big) = P(X \\in B).$$',
    'Pour $X = \\mathbb 1_A$ avec $p = P(A)$ (Remarque 2.3.3),',
    '$$P_X = (1 - p)\\,\\delta_0 + p\\,\\delta_1.$$',
    'Ici, deux dés : $\\Omega = \\{1, \\dots, 6\\}^2$, chaque issue de probabilité $1/36$. La loi de $X$ est la mesure discrète (Exemple 2.3.3)',
    '$$P_X = \\sum_{k=0}^{+\\infty} P(X = k)\\,\\delta_k,$$',
    'la somme portant sur toutes les valeurs entières possibles de $X$ ; ici seul un nombre fini de termes ne sont pas nuls (de $k = 2$ à $12$ pour la somme des deux dés), et la somme est finie. Il suffit de connaître les fibres $X^{-1}(\\{k\\})$. Pour une partie $B$ de $\\mathbb R$, comme $\\delta_k(B) = 1$ si $k \\in B$ et $0$ sinon, on lit la mesure de $B$ comme la somme des barres de $B$ :',
    '$$P_X(B) = \\sum_k P(X = k)\\,\\delta_k(B) = \\sum_{k \\in B} P(X = k).$$',
  ],

  essais: [
    { texte: 'La somme de deux dés, avec $B = \\{7\\}$ : $X^{-1}(B)$ est une diagonale de six issues, et $P_X(\\{7\\}) = 6/36$. Cliquez sur d’autres barres : pourquoi $P_X(B)$ est-il la somme des barres choisies ?', etat: { X: 'somme', B: '7' } },
    { texte: 'Cliquez sur une issue de la grille : toute sa fibre $\\{X = X(\\omega)\\}$ entre dans $X^{-1}(B)$. Une image réciproque est une réunion de fibres.', etat: { X: 'somme', B: '' } },
    { texte: 'Le maximum des deux dés : les fibres sont des équerres, et $P(\\max(i, j) = k) = (2k - 1)/36$. Vérifiez-le pour $k = 6$.', etat: { X: 'max', B: '6' } },
    { texte: 'L’écart $|i - j|$ : $B = \\{0\\}$ donne la diagonale, $6/36$. Que vaut $P_X(\\{1, 2, 3, 4, 5\\})$, et pourquoi sans compter ?', etat: { X: 'ecart', B: '0' } },
    { texte: 'Remarque 2.3.3 : pour $X = \\mathbb 1_A$, cliquez des issues pour former $A$, « le premier dé donne 6 » par exemple. La loi devient $(1 - p)\\,\\delta_0 + p\\,\\delta_1$ avec $p = P(A)$.', etat: { X: 'indicatrice', A: '', B: '1' } },
    { texte: 'Choisissez toutes les barres : $P_X(\\mathbb R) = P(X^{-1}(\\mathbb R)) = P(\\Omega) = 1$, la loi est une probabilité.', etat: { X: 'somme', B: '2,3,4,5,6,7,8,9,10,11' } },
  ],

  monte(zone, outils) {
    const r = outils.etat;
    const nom = () => (VARIABLES[r.X] ? r.X : 'somme');
    const lisA = () => lisListe(r.A, ISSUES.map((_, k) => k));
    const lisB = () => lisListe(r.B, VARIABLES[nom()].valeurs);
    const basculeB = (v) => {
      const B = lisB();
      outils.change({ B: (B.includes(v) ? B.filter((w) => w !== v) : [...B, v]).sort((a, b) => a - b).join(',') });
    };

    const barre = barreOutils(zone);
    const choix = choixRadios(barre, {
      nom: 'X',
      options: Object.entries(VARIABLES).map(([valeur, { latex }]) => ({ valeur, latex })),
      change: (valeur) => {
        outils.change({ X: valeur, B: '' });
        dessine();
      },
    });

    const grille = document.createElement('div');
    grille.className = 'grille-2 principale';
    zone.appendChild(grille);

    // ---- Les issues -------------------------------------------------------------------------
    const cO = carte(grille, 'Les 36 issues $\\omega = (i, j)$, de probabilité $1/36$');
    boutonInfo(cO, [
      ['zone', '--texte', 'Chaque case est une issue ; le nombre écrit est $X(\\omega)$.'],
      ['zone', '--accent', 'Les issues de $X^{-1}(B)$. Un clic sur une issue ajoute ou retire sa valeur à $B$ : toute sa fibre suit.'],
      ['cercle', '--perturbation', 'Pour $X = \\mathbb 1_A$ : les issues de $A$, que l’on choisit en cliquant.'],
    ]);
    const canvasO = toile(cO, '1 / 1', () => dessine());
    canvasO.classList.add('cliquable');
    const repO = new Repere(canvasO, { x: [-0.2, 6.7], y: [-0.2, 6.7], egal: true, marges: { gauche: 6, bas: 6, haut: 6, droite: 6 } });
    const noteO = paragraphe(cO, '', 'note');

    // ---- La loi -----------------------------------------------------------------------------
    const cL = carte(grille, 'La loi $P_X$, une probabilité sur $\\mathbb R$');
    boutonInfo(cL, [
      ['zone', '--zone-stable', 'Les barres : $P(X = k)$, la masse de $\\delta_k$ dans la loi.'],
      ['zone', '--perturbation', 'Les barres de $B$ : cliquez sur une barre pour l’ajouter ou la retirer.'],
    ]);
    const canvasL = toile(cL, '4 / 3', () => dessine());
    canvasL.classList.add('cliquable');
    const repL = new Repere(canvasL, { x: [1, 13], y: [0, 0.2] });
    const bloc = document.createElement('div');
    bloc.className = 'bloc-maths';
    cL.appendChild(bloc);
    const lignes = [0, 1, 2].map(() => paragraphe(bloc, '', ''));
    const verdict = paragraphe(cL, '', 'verdict');

    // Case de l'issue (i, j), centrée en (i, j) : colonne i (dé 1), ligne j
    // (dé 2, de bas en haut).
    const centre = (k) => ISSUES[k];
    glisse(canvasO, repO, {
      prend: (x, y) => {
        const [i, j] = [Math.ceil(x - 0.5), Math.ceil(y - 0.5)];
        if (i < 1 || i > 6 || j < 1 || j > 6) return false;
        const k = (i - 1) * 6 + (j - 1);
        if (nom() === 'indicatrice') {
          const A = lisA();
          outils.change({ A: (A.includes(k) ? A.filter((m) => m !== k) : [...A, k]).sort((a, b) => a - b).join(',') });
        } else basculeB(valeur(nom(), k));
        dessine();
        return false;
      },
      deplace: () => {},
    });
    glisse(canvasL, repL, {
      prend: (x) => {
        const v = Math.round(x);
        if (!VARIABLES[nom()].valeurs.includes(v) || Math.abs(x - v) > 0.45) return false;
        basculeB(v);
        dessine();
        return false;
      },
      deplace: () => {},
    });

    function dessine() {
      const col = couleurs();
      const n = nom();
      const V = VARIABLES[n];
      const A = lisA();
      const B = lisB();
      const L = loi(n, A);
      const XB = reciproque(n, B, A);
      choix.fixe(n);

      // Issues.
      if (repO.prepare()) {
        const ctx = repO.ctx;
        const s = Math.min(repO.sx, repO.sy);
        for (let k = 0; k < 36; k++) {
          const [cx, cy] = centre(k);
          const [px, py] = [repO.X(cx) - s * 0.45, repO.Y(cy) - s * 0.45];
          ctx.save();
          if (XB.includes(k)) {
            ctx.globalAlpha = 0.35;
            ctx.fillStyle = col.accent;
            ctx.fillRect(px, py, s * 0.9, s * 0.9);
            ctx.globalAlpha = 1;
          }
          ctx.strokeStyle = col.discret;
          ctx.lineWidth = 1;
          ctx.strokeRect(px, py, s * 0.9, s * 0.9);
          if (n === 'indicatrice' && A.includes(k)) {
            ctx.strokeStyle = col.perturbation;
            ctx.lineWidth = 3;
            ctx.strokeRect(px + 2, py + 2, s * 0.9 - 4, s * 0.9 - 4);
          }
          ctx.restore();
          repO.texte(cx, cy, String(valeur(n, k, A)), { align: 'center', dy: 5, police: `600 ${Math.round(Math.min(16, s * 0.32))}px system-ui, sans-serif` });
        }
        for (let i = 1; i <= 6; i++) {
          repO.texte(i, 0.2, String(i), { align: 'center', dy: 4, couleur: col.discret, police: '12px system-ui, sans-serif' });
          repO.texte(0.2, i, String(i), { align: 'center', dy: 4, couleur: col.discret, police: '12px system-ui, sans-serif' });
        }
        repO.texte(3.5, 6.55, 'dé 1 : i →', { align: 'center', dy: 4, couleur: col.discret, police: '12px system-ui, sans-serif' });
      }
      outils.rendTexte(noteO, `$${V.latex}$ : le nombre écrit dans chaque case.${n === 'indicatrice' ? ` $A$ a ${A.length} issue${A.length > 1 ? 's' : ''}.` : ''} Le second dé $j$ se lit de bas en haut.`);

      // Loi.
      const pMax = Math.max(...L.values()) / 36;
      repL.fixeCadre([V.valeurs[0] - 0.8, V.valeurs[V.valeurs.length - 1] + 0.8], [0, Math.max(0.2, pMax * 1.18)]);
      if (repL.prepare()) {
        const ctx = repL.ctx;
        repL.axes({ noms: ['k', ''], grille: false });
        for (const v of V.valeurs) {
          const p = L.get(v) / 36;
          const choisi = B.includes(v);
          const [x0, x1] = [repL.X(v - 0.35), repL.X(v + 0.35)];
          ctx.save();
          ctx.fillStyle = choisi ? col.perturbation : col.zone;
          ctx.globalAlpha = choisi ? 0.85 : 1;
          ctx.fillRect(x0, repL.Y(p), x1 - x0, repL.Y(0) - repL.Y(p));
          ctx.globalAlpha = 1;
          ctx.strokeStyle = choisi ? col.perturbation : col.discret;
          ctx.strokeRect(x0, repL.Y(p), x1 - x0, repL.Y(0) - repL.Y(p));
          ctx.restore();
          repL.texte(v, p, `${L.get(v)}/36`, { align: 'center', dy: -5, couleur: col.discret, police: '11px system-ui, sans-serif' });
        }
      }

      const nB = XB.length;
      const somme = B.map((v) => fraction(L.get(v))).join(' + ');
      const termes = V.valeurs.filter((v) => L.get(v)).map((v) => `${fraction(L.get(v))}\\,\\delta_{${v}}`);
      lignes.forEach((l, i) =>
        outils.rendTexte(
          l,
          [
            B.length ? `$B = \\{${B.join(', ')}\\}$ : $X^{-1}(B)$ compte ${nB} issue${nB > 1 ? 's' : ''} sur 36.` : '$B = \\emptyset$ : $X^{-1}(\\emptyset) = \\emptyset$. Cliquez sur des barres ou des issues.',
            `$P_X(B) = P(X^{-1}(B)) = ${fraction(nB)} \\approx ${latexNombre(nB / 36, 3)}$${B.length > 1 ? `, la somme des barres : $${somme}$` : ''}.`,
            `Loi de $X$ : $P_X = ${termes.length > 6 ? `${termes.slice(0, 3).join(' + ')} + \\dots + ${termes[termes.length - 1]}` : termes.join(' + ')}$.`,
          ][i],
        ),
      );
      const tout = V.valeurs.every((v) => !L.get(v) || B.includes(v));
      verdict.className = `verdict ${tout && B.length ? 'ok' : ''}`;
      outils.rendTexte(
        verdict,
        tout && B.length
          ? '$B$ contient toutes les valeurs prises : $X^{-1}(B) = \\Omega$, et $P_X(B) = P(\\Omega) = 1$. La loi est une probabilité.'
          : n === 'indicatrice'
            ? `$p = P(A) = ${fraction(A.length)}$ : $P_X = ${fraction(36 - A.length)}\\,\\delta_0 + ${fraction(A.length)}\\,\\delta_1$, une loi de Bernoulli.`
            : 'Des valeurs distinctes ont des fibres disjointes : la masse de $B$ est la somme des masses de ses points.',
      );
    }

    outils.surTheme(dessine);
    dessine();
    return { applique: dessine };
  },
};
