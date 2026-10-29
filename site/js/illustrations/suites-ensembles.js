// Suites d'ensembles (poly, Proposition 2.3.5 et Exemple 2.3.5 ; Remarque
// 3.3.3 et Exemple 3.3.3). Les quinze premiers ensembles A_n d'une suite sont
// dessinés en lignes ; on clique un point x, et la page lit la suite des
// 𝟙_{A_n}(x) : x est-il dans tous les A_n à partir d'un rang (limite
// inférieure), dans une infinité (limite supérieure), ou finit-il par n'être
// dans aucun ? À droite, la suite des mesures λ(A_n), comparée à la mesure
// des limites : continuité pour les suites monotones, et inégalité de Fatou
// pour les ensembles.

import { chiffresEntiers, latexNombre, latexNombreFixe, latexPositifFixe } from '../../socle/js/ui/format.js';
import { Repere } from '../../socle/js/ui/repere.js';
import { couleurs } from '../../socle/js/ui/theme.js';
import { barreOutils, boutonInfo, carte, choixRadios, glisse, paragraphe, toile, verdict } from './commun.js';

export const N_LIGNES = 15;

// Machine à écrire : n = 2^m + k, A_n = [k/2^m, (k+1)/2^m].
const machine = (n) => {
  const m = Math.floor(Math.log2(n));
  const k = n - 2 ** m;
  return [k / 2 ** m, (k + 1) / 2 ** m];
};

// Chaque suite : les intervalles de A_n, sa mesure, la fenêtre, les limites
// inférieure et supérieure (intervalles et LaTeX), et l'état d'un point x :
// { genre: 'inf', rang } (dans tous les A_n dès le rang), { genre: 'sup' }
// (dans une infinité, hors d'une infinité), ou { genre: 'aucun', dernier }
// (dans aucun A_n après le rang `dernier`, 0 s'il n'y est jamais).
export const SUITES = {
  croissante: {
    texte: 'Croissante',
    latex: 'A_n = [0, 1 - 1/n]',
    A: (n) => [[0, 1 - 1 / n]],
    mesure: (n) => 1 - 1 / n,
    vue: [-0.15, 1.25],
    limInf: [[0, 1, false, true]],
    limSup: [[0, 1, false, true]],
    latexInf: '[0, 1\\mathclose{[}',
    latexSup: '[0, 1\\mathclose{[}',
    point: (x) => (x >= 0 && x < 1 ? { genre: 'inf', rang: Math.max(1, Math.ceil(1 / (1 - x) - 1e-12)) } : { genre: 'aucun', dernier: 0 }),
  },
  decroissante: {
    texte: 'Décroissante',
    latex: 'A_n = \\mathopen{]}0, 1/n\\mathclose{[}',
    A: (n) => [[0, 1 / n]],
    mesure: (n) => 1 / n,
    vue: [-0.15, 1.25],
    limInf: [],
    limSup: [],
    latexInf: '\\emptyset',
    latexSup: '\\emptyset',
    point: (x) => (x > 0 && x < 1 ? { genre: 'aucun', dernier: Math.ceil(1 / x) - 1 } : { genre: 'aucun', dernier: 0 }),
  },
  infinie: {
    texte: '[n, +∞[',
    latex: 'A_n = [n, +\\infty\\mathclose{[}',
    A: (n) => [[n, Infinity]],
    mesure: () => Infinity,
    vue: [0, 16.5],
    limInf: [],
    limSup: [],
    latexInf: '\\emptyset',
    latexSup: '\\emptyset',
    point: (x) => ({ genre: 'aucun', dernier: x >= 1 ? Math.floor(x) : 0 }),
  },
  alternee: {
    texte: 'Alternée',
    latex: 'A_{2k+1} = [0, 2],\\ A_{2k} = [1, 3]',
    A: (n) => (n % 2 ? [[0, 2]] : [[1, 3]]),
    mesure: () => 2,
    vue: [-0.3, 3.4],
    limInf: [[1, 2]],
    limSup: [[0, 3]],
    latexInf: '[1, 2]',
    latexSup: '[0, 3]',
    point: (x) => (x >= 1 && x <= 2 ? { genre: 'inf', rang: 1 } : x >= 0 && x <= 3 ? { genre: 'sup' } : { genre: 'aucun', dernier: 0 }),
  },
  bosse: {
    texte: 'Bosse qui s’échappe',
    latex: 'A_n = [n, n + 1]',
    A: (n) => [[n, n + 1]],
    mesure: () => 1,
    vue: [0, 16.5],
    limInf: [],
    limSup: [],
    latexInf: '\\emptyset',
    latexSup: '\\emptyset',
    point: (x) => ({ genre: 'aucun', dernier: x >= 1 ? Math.floor(x) : 0 }),
  },
  machine: {
    texte: 'Machine à écrire',
    latex: 'A_{2^m + k} = [k/2^m, (k + 1)/2^m]',
    A: (n) => [machine(n)],
    mesure: (n) => 2 ** -Math.floor(Math.log2(n)),
    vue: [-0.08, 1.1],
    limInf: [],
    limSup: [[0, 1]],
    latexInf: '\\emptyset',
    latexSup: '[0, 1]',
    point: (x) => (x >= 0 && x <= 1 ? { genre: 'sup' } : { genre: 'aucun', dernier: 0 }),
  },
};

export const dans = (nom, n, x) => SUITES[nom].A(n).some(([u, v]) => x >= u && x <= v && !(nom === 'decroissante' && (x <= u || x >= v)));

// Mesure des limites inférieure et supérieure.
export const mesureLimite = (ints) => ints.reduce((s, [u, v]) => s + (v - u), 0);

const fixe = (v) => (v === Infinity ? '+\\infty' : latexPositifFixe(v, 3, 1));

export default {
  etat: { suite: 'croissante', x: 0.8 },

  choix: { suite: Object.keys(SUITES) },

  termes: ['lemme de Fatou', 'mesure'],

  rappel: [
    'Une suite croissante (resp. décroissante) a pour limite la réunion (resp. l’intersection) des $A_n$, et la mesure suit (Proposition 2.3.5 ; en décroissant, il faut un $\\mu(A_n)$ fini) :',
    '$$\\begin{gathered} \\mu\\Big(\\bigcup_n A_n\\Big) = \\lim_n \\mu(A_n) \\quad (A_n \\text{ croît}), \\\\ \\mu\\Big(\\bigcap_n A_n\\Big) = \\lim_n \\mu(A_n) \\quad (A_n \\text{ décroît}). \\end{gathered}$$',
    'Pour une suite quelconque, les réunions et intersections « à partir du rang $n$ » sont monotones, donc convergent (définitions absentes du poly du cours) :',
    '$$\\begin{gathered} \\limsup_n A_n = \\bigcap_n \\bigcup_{k \\ge n} A_k, \\\\ \\liminf_n A_n = \\bigcup_n \\bigcap_{k \\ge n} A_k. \\end{gathered}$$',
    'Point par point : $x \\in \\limsup_n A_n$ si pour tout $n$ il existe $k \\ge n$ tel que $x \\in A_k$, c’est-à-dire si $x$ est dans une infinité de $A_n$ ; $x \\in \\liminf_n A_n$ s’il existe $n$ tel que $x \\in A_k$ pour tout $k \\ge n$, c’est-à-dire si $x$ est dans tous les $A_n$ à partir d’un certain rang,',
    'Donc $\\liminf_n A_n \\subset \\limsup_n A_n$. La suite converge si elles sont égales ; la limite $A$ est alors caractérisée par :',
    '$$\\begin{cases} \\forall x \\in A, & \\exists n_0\\ \\forall n \\ge n_0,\\ x \\in A_n, \\\\ \\forall x \\notin A, & \\exists n_1\\ \\forall n \\ge n_1,\\ x \\notin A_n. \\end{cases}$$',
    'Le lemme de Fatou, pour $f_n = \\mathbb 1_{A_n}$, donne $\\mu(\\liminf_n A_n) \\le \\liminf_n \\mu(A_n)$ (Remarque 3.3.3).',
  ],

  essais: [
    { texte: 'Une suite croissante : avec $x = 0{,}8$, à partir de quel rang $x$ est-il dans tous les $A_n$ ? La mesure $\\lambda(A_n) = 1 - 1/n$ tend vers $\\lambda([0, 1\\mathclose{[}) = 1$.', etat: { suite: 'croissante', x: 0.8 } },
    { texte: 'L’Exemple 2.3.5 : $A_n = [n, +\\infty\\mathclose{[}$ décroît vers $\\emptyset$, mais $\\lambda(A_n) = +\\infty$ pour tout $n$. Jusqu’à quel rang $x = 6{,}5$ est-il dans $A_n$ ?', etat: { suite: 'infinie', x: 6.5 } },
    { texte: 'Deux ensembles en alternance, $[0, 2]$ et $[1, 3]$ : cliquez dans $[1, 2]$, puis dans $[0, 1\\mathclose{[}$. Lequel des deux points est dans la limite inférieure ?', etat: { suite: 'alternee', x: 1.5 } },
    { texte: 'La bosse qui s’échappe, $A_n = [n, n + 1]$ (Exemple 3.3.3) : $\\liminf_n A_n = \\emptyset$, alors que $\\lambda(A_n) = 1$. L’inégalité de la Remarque 3.3.3 est stricte : $0 < 1$.', etat: { suite: 'bosse', x: 4.5 } },
    { texte: 'La machine à écrire : $\\lambda(A_n) \\to 0$, et pourtant chaque $x \\in [0, 1]$ revient dans une infinité de $A_n$. Combien de fois parmi les quinze premiers rangs, pour $x = 0{,}3$ ?', etat: { suite: 'machine', x: 0.3 } },
    { texte: 'Une suite converge si $\\liminf_n A_n = \\limsup_n A_n$. Parmi les six suites, lesquelles convergent ? La dernière ligne du texte le dit, avec la limite quand elle existe. Cliquez ensuite un point $x$ : sa suite $\\mathbb 1_{A_n}(x)$ est-elle constante à partir d’un rang ?' },
  ],

  monte(zone, outils) {
    const r = outils.etat;
    const nom = () => (SUITES[r.suite] ? r.suite : 'croissante');

    const barre = barreOutils(zone);
    const choix = choixRadios(barre, {
      nom: 'suite',
      options: Object.entries(SUITES).map(([valeur, { texte }]) => ({ valeur, texte })),
      change: (valeur) => {
        const [u, v] = SUITES[valeur].vue;
        outils.change({ suite: valeur, x: Math.round((u + (v - u) * 0.55) * 100) / 100 });
        dessine();
      },
    });

    const grille = document.createElement('div');
    grille.className = 'grille-2 principale';
    zone.appendChild(grille);

    // ---- Les ensembles A_n ------------------------------------------------------------------
    const cA = carte(grille, 'Les ensembles $A_1, \\dots, A_{15}$ et leurs limites');
    boutonInfo(cA, [
      ['ligne', '--texte', 'La ligne $n$ : l’ensemble $A_n$.'],
      ['ligne', '--perturbation', 'Le point $x$ : cliquez ou faites glisser sur la figure. Un disque plein sur la ligne $n$ si $x \\in A_n$, creux sinon.'],
      ['ligne', '--equilibre', 'En bas : $\\liminf_n A_n$ et $\\limsup_n A_n$, calculés sur toute la suite, pas sur les quinze lignes.'],
      ['cercle', '--equilibre', 'Un rond blanc au bord d’une limite : cette borne n’appartient pas à l’ensemble (intervalle ouvert de ce côté, comme $[0, 1\\mathclose{[}$).'],
    ]);
    const canvasA = toile(cA, '4 / 3', () => dessine());
    canvasA.classList.add('saisissable');
    const repA = new Repere(canvasA, { x: [0, 1], y: [-3.2, N_LIGNES + 0.6], marges: { gauche: 64, bas: 22, haut: 6, droite: 14 } });

    // ---- Les mesures ------------------------------------------------------------------------
    const cM = carte(grille, 'Les mesures $\\lambda(A_n)$');
    boutonInfo(cM, [
      ['point', '--accent', '$\\lambda(A_n)$ pour $n = 1, \\dots, 15$ ; les valeurs $+\\infty$ sont posées sur le niveau « $+\\infty$ » en haut du graphe.'],
      ['tirets', '--equilibre', '$\\lambda(\\liminf A_n)$ ; en pointillés, $\\lambda(\\limsup A_n)$ s’il est différent.'],
    ]);
    const canvasM = toile(cM, '16 / 7', () => dessine());
    const repM = new Repere(canvasM, { x: [0, N_LIGNES + 1], y: [0, 1.2] });
    const bloc = document.createElement('div');
    bloc.className = 'bloc-maths';
    cM.appendChild(bloc);
    const lignes = [0, 1, 2].map(() => paragraphe(bloc, '', ''));
    const texteVerdict = verdict(cM, '');

    glisse(canvasA, repA, {
      deplace: (x) => {
        const [u, v] = SUITES[nom()].vue;
        outils.change({ x: Math.round(Math.min(v, Math.max(u, x)) * 100) / 100 });
        dessine();
      },
    });

    function dessine() {
      const col = couleurs();
      const n = nom();
      const S = SUITES[n];
      const [u, v] = S.vue;
      const x = Math.min(v, Math.max(u, Number(r.x) || 0));
      choix.fixe(n);
      const yLigne = (k) => N_LIGNES + 1 - k; // la ligne n = 1 en haut
      const borneAff = (w) => Math.min(v, Math.max(u, w));

      repA.fixeCadre([u, v], [-3.2, N_LIGNES + 0.6]);
      if (repA.prepare()) {
        const ctx = repA.ctx;
        const etiquette = (y, t, couleur = col.trait) => {
          ctx.save();
          ctx.font = '12px system-ui, sans-serif';
          ctx.textAlign = 'right';
          ctx.fillStyle = couleur;
          ctx.fillText(t, repA.marges.gauche - 8, repA.Y(y) + 4);
          ctx.restore();
        };
        for (let k = 1; k <= N_LIGNES; k++) {
          const y = yLigne(k);
          etiquette(y, `A${String(k).replace(/\d/g, (c) => '₀₁₂₃₄₅₆₇₈₉'[c])}`);
          repA.trace([[u, y], [v, y]], { couleur: col.grille, largeur: 1 });
          for (const [a, b] of S.A(k)) {
            // Une borne infinie : le trait s’arrête sous la pointe, qui touche le bord.
            const fin = b === Infinity ? v - 15 / repA.sx : borneAff(b);
            repA.trace([[borneAff(a), y], [fin, y]], { couleur: col.trait, largeur: 5 });
            // Un ensemble réduit à un point, comme A₁ = [0, 0] : un disque.
            if (a === b) repA.point(a, y, { rayon: 3.5, couleur: col.trait });
            if (b === Infinity) repA.pointe(v, y, 1, 0, { couleur: col.trait, taille: 15 });
          }
          repA.point(x, y, { rayon: 3.6, couleur: col.perturbation, plein: dans(n, k, x) });
        }
        // Limites.
        const yInf = -1;
        const ySup = -2.3;
        etiquette(yInf, 'lim inf', col.equilibre);
        etiquette(ySup, 'lim sup', col.equilibre);
        for (const [y, ints] of [[yInf, S.limInf], [ySup, S.limSup]]) {
          repA.trace([[u, y], [v, y]], { couleur: col.grille, largeur: 1 });
          for (const [a, b, ouvertG, ouvertD] of ints) {
            repA.trace([[borneAff(a), y], [borneAff(b), y]], { couleur: col.equilibre, largeur: 6 });
            // Une borne exclue : un rond blanc cerclé de violet.
            if (ouvertG) repA.point(borneAff(a), y, { rayon: 5, couleur: col.equilibre, plein: false });
            if (ouvertD) repA.point(borneAff(b), y, { rayon: 5, couleur: col.equilibre, plein: false });
          }
        }
        repA.trace([[x, -2.9], [x, N_LIGNES + 0.5]], { couleur: col.perturbation, largeur: 1.4, tirets: [5, 4] });
        // Graduations de l'axe des abscisses.
        const pas = v - u > 6 ? 2 : v - u > 2 ? 1 : 0.25;
        for (let t = Math.ceil(u / pas) * pas; t <= v + 1e-9; t += pas) repA.texte(t, -3.2, latexNombre(t, 3).replace('{,}', ','), { align: 'center', dy: 15, couleur: col.discret, police: '11px system-ui, sans-serif' });
      }

      // Mesures.
      const finies = Array.from({ length: N_LIGNES }, (_, k) => S.mesure(k + 1)).filter(Number.isFinite);
      const [mInf, mSup] = [mesureLimite(S.limInf), mesureLimite(S.limSup)];
      const aInfinie = Array.from({ length: N_LIGNES }, (_, k) => S.mesure(k + 1)).some((m) => m === Infinity);
      const haut = Math.max(aInfinie ? 1.5 : 1, ...finies, mSup) * 1.2;
      const niveauInf = haut * 0.9;
      repM.fixeCadre([0, N_LIGNES + 1], [0, haut]);
      if (repM.prepare()) {
        // Avec un niveau « +∞ », les graduations numériques de l'axe vertical sont
        // retirées : 1,5 à côté de +∞ prêterait à confusion. Il reste 0 et +∞.
        repM.axes({ noms: ['n', ''], grille: false, ordonnees: !aInfinie });
        if (aInfinie) {
          repM.trace([[0, 0], [0, haut]], { couleur: col.discret, largeur: 1 });
          repM.texte(0, 0, '0', { align: 'right', dx: -6, dy: 4, couleur: col.discret, police: '11px system-ui, sans-serif' });
        }
        repM.trace([[0, mInf], [N_LIGNES + 1, mInf]], { couleur: col.equilibre, largeur: 1.6, tirets: [6, 4] });
        if (mSup !== mInf) repM.trace([[0, mSup], [N_LIGNES + 1, mSup]], { couleur: col.equilibre, largeur: 1.4, tirets: [2, 3] });
        for (let k = 1; k <= N_LIGNES; k++) {
          const m = S.mesure(k);
          if (Number.isFinite(m)) repM.point(k, m, { rayon: 4, couleur: col.accent });
          else repM.point(k, niveauInf, { rayon: 4, couleur: col.accent });
        }
        // Les mesures infinies sont posées sur un niveau « +∞ » en haut du graphe.
        if (aInfinie) {
          repM.trace([[0, niveauInf], [N_LIGNES + 1, niveauInf]], { couleur: col.discret, largeur: 1, tirets: [2, 4] });
          repM.texte(0, niveauInf, '+∞', { align: 'right', dx: -6, dy: 4, couleur: col.accent, police: '600 12px system-ui, sans-serif', fond: true });
        }
      }

      // Textes.
      const suiteX = Array.from({ length: N_LIGNES }, (_, k) => (dans(n, k + 1, x) ? 1 : 0));
      const nombre = suiteX.reduce((a, b) => a + b, 0);
      const etat = S.point(x);
      const xL = latexNombreFixe(x, 2, chiffresEntiers(Math.max(Math.abs(u), Math.abs(v))));
      outils.rendTexte(lignes[0], `$${S.latex}$. Pour $x = ${xL}$, $\\mathbb 1_{A_n}(x)$ vaut $${suiteX.join('')}$ pour $n = 1, \\dots, 15$ : ${nombre} fois $1$.`);
      outils.rendTexte(
        lignes[1],
        etat.genre === 'inf'
          ? `$x$ est dans tous les $A_n$ à partir du rang $${etat.rang}$ : $x \\in \\liminf_n A_n \\subset \\limsup_n A_n$.`
          : etat.genre === 'sup'
            ? '$x$ est dans une infinité de $A_n$, et hors d’une infinité : $x \\in \\limsup_n A_n$, mais $x \\notin \\liminf_n A_n$.'
            : etat.dernier
              ? `$x$ n’est plus dans aucun $A_n$ après le rang $${etat.dernier}$ : $x \\notin \\limsup_n A_n$.`
              : '$x$ n’est dans aucun $A_n$ : $x \\notin \\limsup_n A_n$.',
      );
      const converge = S.latexInf === S.latexSup;
      outils.rendTexte(
        lignes[2],
        `$\\liminf_n A_n = ${S.latexInf}$ et $\\limsup_n A_n = ${S.latexSup}$, de mesures $${fixe(mInf)}$ et $${fixe(mSup)}$ : ${converge ? `ils sont égaux, la suite converge et $\\lim_n A_n = ${S.latexInf}$.` : 'ils diffèrent, la suite ne converge pas.'}`,
      );
      const textes = {
        croissante: ['ok', 'La suite croît : $\\lambda(A_n) = 1 - 1/n \\to 1 = \\lambda(\\bigcup_n A_n)$, la continuité à gauche (Proposition 2.3.5).'],
        decroissante: ['ok', 'La suite décroît et $\\lambda(A_1) < +\\infty$ : $\\lambda(A_n) = 1/n \\to 0 = \\lambda(\\bigcap_n A_n)$, la continuité à droite.'],
        infinie: ['alerte', 'La suite décroît vers $\\emptyset$, mais $\\lambda(A_n) = +\\infty$ pour tout $n$ : sans un $\\lambda(A_{n_0})$ fini, la continuité à droite tombe (Exemple 2.3.5).'],
        alternee: ['ok', '$\\lambda(\\liminf_n A_n) = 1 \\le \\liminf_n \\lambda(A_n) = 2$ : l’inégalité de Fatou pour les ensembles (Remarque 3.3.3).'],
        bosse: ['', '$\\lambda(\\liminf_n A_n) = 0 < 1 = \\liminf_n \\lambda(A_n)$ : l’inégalité est stricte, la masse s’échappe à l’infini (Exemple 3.3.3).'],
        machine: ['', '$\\lambda(A_n) \\to 0$, mais $\\limsup_n A_n = [0, 1]$ : la limite supérieure peut être grosse quand les mesures tendent vers $0$. L’inégalité de Fatou ne porte que sur la limite inférieure.'],
      };
      const [classe, texte] = textes[n];
      texteVerdict.className = `verdict ${classe}`;
      outils.rendTexte(texteVerdict, texte);
    }

    outils.surTheme(dessine);
    dessine();
    return { applique: dessine };
  },
};
