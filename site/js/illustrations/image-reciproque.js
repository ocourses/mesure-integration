// L'image réciproque (poly, section 2.1.4 et note 4 ; Exercice 2.1.3). Une
// application f : E₁ → E₂ entre deux petits ensembles est dessinée par ses
// flèches, que l'on redirige à la souris. On forme une partie B ⊂ E₂ (ou
// A ⊂ E₁) en cliquant, et la page calcule f⁻¹(B) (ou f(A)). Le mode
// « Formules » compare les deux membres d'une égalité ensembliste : les
// formules de Hausdorff sont toujours vraies, celles des images directes
// échouent dès que f n'est pas injective ou pas surjective, et la page cherche
// le plus petit contre-exemple pour l'application dessinée.

import { Repere } from '../ui/repere.js';
import { couleurs } from '../ui/theme.js';
import { barreOutils, boutonInfo, carte, choixRadios, paragraphe, toile } from './commun.js';
import {
  anneau,
  cardinal,
  complementaire,
  contient,
  contour,
  dessineFleches,
  etiquette,
  gestesDiagramme,
  halo,
  image,
  imageReciproque,
  indices,
  injective,
  latexPartie,
  lisApplication,
  lisMasque,
  NOMS_1,
  NOMS_2,
  plein,
  point,
  positions,
  surjective,
} from './ensembles.js';

export const N1 = 6;
export const N2 = 5;
export const F_DEFAUT = '0,0,1,3,3,1'; // 1, 2 ↦ a ; 3, 6 ↦ b ; 4, 5 ↦ d : ni injective, ni surjective

const p1 = (m) => latexPartie(m, NOMS_1, N1);
const p2 = (m) => latexPartie(m, NOMS_2, N2);
const n1 = (x) => NOMS_1[x];
const n2 = (y) => NOMS_2[y];

// Égalités ensemblistes comparées dans le mode « Formules ». Pour chacune :
// l'espace des parties choisies (`cote` : 'A' dans E₁, 'B' dans E₂), une ou
// deux parties, l'espace des deux membres (1 ou 2), les deux membres, la
// relation toujours vraie ('=', '⊂', '⊃' ou null), la propriété de f qui
// donne l'égalité, la justification écrite, et l'explication d'un point où
// les membres diffèrent.
export const ENONCES = {
  ffmoins: {
    latex: 'f(f^{-1}(B)) = B',
    cote: 'B',
    deux: false,
    espace: 2,
    gauche: (f, { P }) => image(f, imageReciproque(f, P)),
    droite: (f, { P }) => P,
    toujours: '\\subset',
    condition: 'surjective',
    justification:
      'Si $y \\in f(f^{-1}(B))$, alors $y = f(x)$ avec $f(x) \\in B$, donc $y \\in B$. L’inclusion réciproque demande que chaque point de $B$ ait un antécédent : elle vaut si $f$ est surjective.',
    explique: (f, s, y) => `$${n2(y)} \\in B$ n’a pas d’antécédent : il n’est pas dans $f(f^{-1}(B))$.`,
  },
  fmoinsf: {
    latex: 'f^{-1}(f(A)) = A',
    cote: 'A',
    deux: false,
    espace: 1,
    gauche: (f, { P }) => imageReciproque(f, image(f, P)),
    droite: (f, { P }) => P,
    toujours: '\\supset',
    condition: 'injective',
    justification:
      'Si $x \\in A$, alors $f(x) \\in f(A)$, donc $x \\in f^{-1}(f(A))$. L’inclusion réciproque demande qu’aucun point hors de $A$ n’ait la même image qu’un point de $A$ : elle vaut si $f$ est injective.',
    explique: (f, { P }, x) => {
      const x2 = indices(P, N1).find((z) => f[z] === f[x]);
      return `$${n1(x)} \\notin A$, mais $f(${n1(x)}) = f(${n1(x2)}) = ${n2(f[x])}$ avec $${n1(x2)} \\in A$ : $${n1(x)} \\in f^{-1}(f(A))$.`;
    },
  },
  compR: {
    latex: 'f^{-1}(B^c) = f^{-1}(B)^c',
    cote: 'B',
    deux: false,
    espace: 1,
    gauche: (f, { P }) => imageReciproque(f, complementaire(P, N2)),
    droite: (f, { P }) => complementaire(imageReciproque(f, P), N1),
    toujours: '=',
    condition: null,
    justification: '$x \\in f^{-1}(B^c) \\iff f(x) \\notin B \\iff x \\notin f^{-1}(B) \\iff x \\in f^{-1}(B)^c$.',
  },
  interR: {
    latex: 'f^{-1}(B_1 \\cap B_2) = f^{-1}(B_1) \\cap f^{-1}(B_2)',
    cote: 'B',
    deux: true,
    espace: 1,
    gauche: (f, { P, Q }) => imageReciproque(f, P & Q),
    droite: (f, { P, Q }) => imageReciproque(f, P) & imageReciproque(f, Q),
    toujours: '=',
    condition: null,
    justification: '$x \\in f^{-1}(B_1 \\cap B_2) \\iff f(x) \\in B_1$ et $f(x) \\in B_2 \\iff x \\in f^{-1}(B_1) \\cap f^{-1}(B_2)$.',
  },
  unionD: {
    latex: 'f(A_1 \\cup A_2) = f(A_1) \\cup f(A_2)',
    cote: 'A',
    deux: true,
    espace: 2,
    gauche: (f, { P, Q }) => image(f, P | Q),
    droite: (f, { P, Q }) => image(f, P) | image(f, Q),
    toujours: '=',
    condition: null,
    justification: '$y \\in f(A_1 \\cup A_2) \\iff$ il existe $x \\in A_1 \\cup A_2$ tel que $f(x) = y \\iff y \\in f(A_1)$ ou $y \\in f(A_2)$.',
  },
  interD: {
    latex: 'f(A_1 \\cap A_2) = f(A_1) \\cap f(A_2)',
    cote: 'A',
    deux: true,
    espace: 2,
    gauche: (f, { P, Q }) => image(f, P & Q),
    droite: (f, { P, Q }) => image(f, P) & image(f, Q),
    toujours: '\\subset',
    condition: 'injective',
    justification:
      'Si $y = f(x)$ avec $x \\in A_1 \\cap A_2$, alors $y \\in f(A_1)$ et $y \\in f(A_2)$. L’inclusion réciproque échoue quand $y$ a un antécédent dans $A_1$ et un autre dans $A_2$, mais aucun dans les deux : elle vaut si $f$ est injective.',
    explique: (f, { P, Q }, y) => {
      const x1 = indices(P, N1).find((z) => f[z] === y);
      const x2 = indices(Q, N1).find((z) => f[z] === y);
      return `$${n2(y)} = f(${n1(x1)}) = f(${n1(x2)})$ avec $${n1(x1)} \\in A_1$ et $${n1(x2)} \\in A_2$, mais aucun antécédent de $${n2(y)}$ n’est dans $A_1 \\cap A_2$.`;
    },
  },
  compD: {
    latex: 'f(A^c) = f(A)^c',
    cote: 'A',
    deux: false,
    espace: 2,
    gauche: (f, { P }) => image(f, complementaire(P, N1)),
    droite: (f, { P }) => complementaire(image(f, P), N2),
    toujours: null,
    condition: 'bijective',
    justification:
      'Aucune inclusion n’est vraie en général : $f(A)^c \\subset f(A^c)$ si $f$ est surjective, $f(A^c) \\subset f(A)^c$ si $f$ est injective. L’égalité demande les deux.',
    explique: (f, { P }, y) => {
      const ante = f.map((z, x) => [z, x]).filter(([z]) => z === y).map(([, x]) => x);
      if (!ante.length) return `$${n2(y)}$ n’a pas d’antécédent : il est dans $f(A)^c$, mais pas dans $f(A^c)$.`;
      const dans = ante.find((x) => contient(P, x));
      const hors = ante.find((x) => !contient(P, x));
      return `$${n2(y)} = f(${n1(dans)}) = f(${n1(hors)})$ avec $${n1(dans)} \\in A$ et $${n1(hors)} \\notin A$ : $${n2(y)}$ est dans $f(A^c)$ et dans $f(A)$, donc pas dans $f(A)^c$.`;
    },
  },
};

// Les deux membres pour l'application f et les parties choisies P (et Q).
export function membres(nom, f, P, Q) {
  const e = ENONCES[nom];
  return { gauche: e.gauche(f, { P, Q }), droite: e.droite(f, { P, Q }) };
}

// La propriété de f qui garantit l'égalité est-elle vraie ?
export function conditionVraie(condition, f) {
  if (condition === 'surjective') return surjective(f, N2);
  if (condition === 'injective') return injective(f);
  if (condition === 'bijective') return injective(f) && surjective(f, N2);
  return true;
}

// Plus petit contre-exemple pour l'application f : les parties P (et Q) de
// plus petit cardinal total pour lesquelles les deux membres diffèrent, ou
// null s'il n'y en a pas.
export function contreExemple(nom, f) {
  const e = ENONCES[nom];
  const n = e.cote === 'A' ? N1 : N2;
  let meilleur = null;
  for (let P = 0; P <= plein(n); P++) {
    for (let Q = 0; Q <= (e.deux ? plein(n) : 0); Q++) {
      const { gauche, droite } = membres(nom, f, P, Q);
      if (gauche === droite) continue;
      const taille = cardinal(P) + cardinal(Q);
      if (!meilleur || taille < meilleur.taille) meilleur = { P, Q, taille };
    }
  }
  return meilleur && { P: meilleur.P, Q: meilleur.Q };
}

// Clic sur une partie choisie : une seule partie, on bascule ; deux parties,
// on parcourt « aucune, 1, 2, les deux ».
export function basculeChoix(P, Q, j, deux) {
  const [dansP, dansQ] = [contient(P, j), contient(Q, j)];
  const bit = 1 << j;
  if (!deux) return [P ^ bit, Q];
  // État suivant de (aucune, 1, 2, les deux) : 1, 2, les deux, aucune.
  const suivant = [[true, false], [false, true], [true, true], [false, false]][dansP ? (dansQ ? 3 : 1) : dansQ ? 2 : 0];
  return [suivant[0] ? P | bit : P & ~bit, suivant[1] ? Q | bit : Q & ~bit];
}

const MODES = { reciproque: '$f^{-1}(B)$', directe: '$f(A)$', formules: 'Formules' };

export default {
  etat: { mode: 'reciproque', f: F_DEFAUT, b1: 0b00001, b2: 0, a1: 0b000101, a2: 0, enonce: 'ffmoins' },

  choix: { mode: Object.keys(MODES), enonce: Object.keys(ENONCES) },

  termes: ['image réciproque', 'formules de Hausdorff', 'tribu image', 'application mesurable'],

  rappel: [
    'Pour une application $f \\colon E_1 \\to E_2$ et une partie $B \\subset E_2$, l’image réciproque de $B$ est l’ensemble des points qui tombent dans $B$,',
    '$$f^{-1}(B) = \\{x \\in E_1 : f(x) \\in B\\}.$$',
    'Elle a un sens pour toute application, injective ou non, surjective ou non. Elle ne fait pas intervenir d’application réciproque $f^{-1}$, qui n’existe pas forcément (note 4 du chapitre 2).',
    'L’image directe d’une partie $A \\subset E_1$ est',
    '$$f(A) = \\{f(x) : x \\in A\\}.$$',
    'Les formules de Hausdorff (Exercice 2.1.3) : l’image réciproque commute avec le complémentaire, les réunions et les intersections, pour toute famille $(B_i)_{i \\in I}$,',
    '$$\\begin{gathered} f^{-1}(B^c) = f^{-1}(B)^c, \\\\ f^{-1}\\Big(\\bigcup_{i \\in I} B_i\\Big) = \\bigcup_{i \\in I} f^{-1}(B_i), \\\\ f^{-1}\\Big(\\bigcap_{i \\in I} B_i\\Big) = \\bigcap_{i \\in I} f^{-1}(B_i). \\end{gathered}$$',
    'L’image directe ne commute qu’avec les réunions : $f(A_1 \\cap A_2)$ peut être plus petite que $f(A_1) \\cap f(A_2)$, et $f(A^c)$ n’a pas de lien général avec $f(A)^c$. C’est pourquoi la tribu image (Proposition 2.1.11) et les applications mesurables (Remarque 2.2.2) se définissent par des images réciproques.',
  ],

  essais: [
    { texte: 'L’application de départ n’est ni injective ni surjective. Cliquez sur les points de $E_2$ pour former $B$ : qui entre dans $f^{-1}(B)$ ? Que vaut $f^{-1}(\\{c\\})$ ?', etat: { mode: 'reciproque', f: F_DEFAUT, b1: 0b00001 } },
    { texte: 'Ici $B = \\{c\\}$ et $f^{-1}(B) = \\emptyset$. Faites glisser la flèche du point $3$ de $b$ vers $c$ : que devient $f^{-1}(B)$ ?', etat: { mode: 'reciproque', f: F_DEFAUT, b1: 0b00100 } },
    { texte: 'Avec $A = \\{1, 3\\}$, $f(A) = \\{a, b\\}$. Pourquoi $f^{-1}(f(A))$ contient-il $2$ et $6$, qui ne sont pas dans $A$ ?', etat: { mode: 'directe', f: F_DEFAUT, a1: 0b000101 } },
    { texte: 'Avec $A_1 = \\{1\\}$ et $A_2 = \\{2\\}$, comparez $f(A_1 \\cap A_2)$ et $f(A_1) \\cap f(A_2)$ : les deux points ont la même image.', etat: { mode: 'formules', f: F_DEFAUT, enonce: 'interD', a1: 0b000001, a2: 0b000010 } },
    { texte: 'Pour $f(f^{-1}(B)) = B$, cliquez sur « Chercher un contre-exemple ». Rendez ensuite $f$ surjective en déplaçant des flèches : en reste-t-il un ?', etat: { mode: 'formules', f: F_DEFAUT, enonce: 'ffmoins', b1: 0b00001 } },
    { texte: 'Les formules de Hausdorff sont vraies pour toute application : pour $f^{-1}(B_1 \\cap B_2)$, la recherche ne trouve aucun contre-exemple. Lisez la justification, qui vaut pour toute famille.', etat: { mode: 'formules', f: F_DEFAUT, enonce: 'interR', b1: 0b00011, b2: 0b00110 } },
  ],

  monte(zone, outils) {
    const r = outils.etat;
    const f = () => lisApplication(r.f, N1, N2, F_DEFAUT);
    const parties = () => ({ a1: lisMasque(r.a1, N1), a2: lisMasque(r.a2, N1), b1: lisMasque(r.b1, N2), b2: lisMasque(r.b2, N2) });

    // ---- Mode -----------------------------------------------------------------------------
    const barre = barreOutils(zone);
    const choixMode = choixRadios(barre, {
      nom: 'mode',
      options: Object.entries(MODES).map(([valeur, t]) => (t.startsWith('$') ? { valeur, latex: t.slice(1, -1) } : { valeur, texte: t })),
      change: (valeur) => {
        outils.change({ mode: valeur });
        message = null;
        dessine();
      },
    });

    const grille = document.createElement('div');
    grille.className = 'grille-2 principale';
    zone.appendChild(grille);

    // ---- Diagramme ------------------------------------------------------------------------
    const cD = carte(grille, 'L’application $f \\colon E_1 \\to E_2$');
    boutonInfo(cD, [
      ['fleche', '--discret', 'Les flèches de $f$ : faites glisser une flèche depuis son point de départ jusqu’à un autre point de $E_2$.'],
      ['zone', '--perturbation', 'La partie que l’on choisit en cliquant sur ses points : $B$ dans $E_2$, ou $A$ dans $E_1$.'],
      ['zone', '--accent', 'L’ensemble calculé : $f^{-1}(B)$, $f(A)$, ou le membre de gauche d’une formule.'],
      ['cercle', '--texte', 'Formules : le membre de droite.'],
      ['cercle', '--alerte', 'Formules : un point qui est dans un seul des deux membres.'],
      ['zone', '--serie-1', 'Formules à deux parties : l’étiquette 1 ($A_1$ ou $B_1$) et l’étiquette 2 ($A_2$ ou $B_2$) ; un clic fait passer un point par 1, 2, les deux, aucune.'],
    ]);
    const canvas = toile(cD, '5 / 4', () => dessine());
    canvas.classList.add('cliquable');
    const rep = new Repere(canvas, { x: [0, 5], y: [-0.2, 6.6], marges: { gauche: 6, bas: 6, haut: 10, droite: 6 } });
    const P1 = positions(N1, 1.25, 6);
    const P2 = positions(N2, 3.75, 6);

    // ---- Calculs --------------------------------------------------------------------------
    const cT = carte(grille, 'Ce que l’on calcule');
    const choixEnonce = choixRadios(cT, {
      nom: 'enonce',
      options: Object.entries(ENONCES).map(([valeur, { latex }]) => ({ valeur, latex })),
      change: (valeur) => {
        outils.change({ enonce: valeur });
        message = null;
        dessine();
      },
    });
    choixEnonce.element.classList.add('enonces');
    const bloc = document.createElement('div');
    bloc.className = 'bloc-maths';
    cT.appendChild(bloc);
    const lignes = [0, 1, 2, 3].map(() => paragraphe(bloc, '', ''));
    const verdict = paragraphe(cT, '', 'verdict');
    const actions = document.createElement('div');
    actions.className = 'actions';
    const bouton = document.createElement('button');
    bouton.type = 'button';
    bouton.textContent = 'Chercher un contre-exemple';
    actions.appendChild(bouton);
    cT.appendChild(actions);
    // Message de la dernière recherche, effacé au prochain changement.
    let message = null;

    bouton.addEventListener('click', () => {
      const nom = r.enonce;
      const e = ENONCES[nom];
      const g = f();
      const ce = contreExemple(nom, g);
      if (ce) {
        const cles = e.cote === 'A' ? ['a1', 'a2'] : ['b1', 'b2'];
        outils.change({ [cles[0]]: ce.P, [cles[1]]: ce.Q });
        message = null;
      } else if (!e.condition) {
        message = { ok: true, texte: 'Aucun contre-exemple : l’égalité est vraie pour toute application et toutes parties.' };
      } else {
        const conseil = {
          surjective: 'elle est surjective. Retirez toutes les flèches qui arrivent à un point de $E_2$ pour en trouver un.',
          injective: 'elle est injective. Faites arriver deux flèches au même point pour en trouver un.',
        }[e.condition];
        message = { ok: true, texte: `Aucun contre-exemple avec cette application : ${conseil}` };
      }
      dessine();
    });

    // ---- Interactions ---------------------------------------------------------------------
    // Clic sur un point de l'espace des parties choisies.
    const clique = (cote, j) => {
      const e = ENONCES[r.enonce];
      const s = parties();
      if (r.mode === 'reciproque' && cote === 'B') outils.change({ b1: s.b1 ^ (1 << j) });
      else if (r.mode === 'directe' && cote === 'A') outils.change({ a1: s.a1 ^ (1 << j) });
      else if (r.mode === 'formules' && e.cote === cote) {
        const [k1, k2] = cote === 'A' ? ['a1', 'a2'] : ['b1', 'b2'];
        const [P, Q] = basculeChoix(s[k1], s[k2], j, e.deux);
        outils.change({ [k1]: P, [k2]: e.deux ? Q : s[k2] });
      } else return;
      message = null;
      dessine();
    };

    const gestes = gestesDiagramme(canvas, rep, {
      P1,
      P2,
      lisF: f,
      ecrisF: (h) => {
        outils.change({ f: h.join(',') });
        message = null;
      },
      clique,
      redessine: () => dessine(),
    });

    function dessine() {
      const col = couleurs();
      const g = f();
      const s = parties();
      const mode = MODES[r.mode] ? r.mode : 'reciproque';
      const e = ENONCES[r.enonce] ?? ENONCES.ffmoins;
      choixMode.fixe(mode);
      choixEnonce.fixe(r.enonce);
      choixEnonce.element.hidden = mode !== 'formules';
      actions.hidden = mode !== 'formules';

      // Ce qui est choisi et ce qui est calculé, selon le mode.
      let choisis = { cote: 'B', P: s.b1, Q: 0, deux: false, nom: 'B' };
      let calcule = { espace: 1, gauche: imageReciproque(g, s.b1), droite: null };
      if (mode === 'directe') {
        choisis = { cote: 'A', P: s.a1, Q: 0, deux: false, nom: 'A' };
        calcule = { espace: 2, gauche: image(g, s.a1), droite: null };
      } else if (mode === 'formules') {
        const [P, Q] = e.cote === 'A' ? [s.a1, s.a2] : [s.b1, s.b2];
        choisis = { cote: e.cote, P, Q, deux: e.deux, nom: e.cote };
        const m = membres(r.enonce, g, P, Q);
        calcule = { espace: e.espace, gauche: m.gauche, droite: m.droite };
      }

      if (rep.prepare()) {
        contour(rep, P1, 'E₁');
        contour(rep, P2, 'E₂');
        const [Pc, Pk] = calcule.espace === 1 ? [P1, N1] : [P2, N2];
        for (let j = 0; j < Pk; j++) {
          if (contient(calcule.gauche, j)) halo(rep, Pc[j], col.accent);
          if (calcule.droite !== null) {
            if (contient(calcule.droite, j)) anneau(rep, Pc[j], col.trait, { rayon: 15, largeur: 1.6 });
            if (contient(calcule.gauche, j) !== contient(calcule.droite, j)) anneau(rep, Pc[j], col.alerte, { rayon: 19, largeur: 2.4 });
          }
        }
        // Flèches : celles qui portent le calcul sont en accent.
        dessineFleches(rep, P1, P2, g, gestes.geste, (x, y) => {
          const porte = mode === 'reciproque' ? contient(s.b1, y) : mode === 'directe' ? contient(s.a1, x) : false;
          return { couleur: porte ? col.accent : col.discret, largeur: porte ? 2 : 1.3 };
        });
        P1.forEach((p, x) => point(rep, p, n1(x)));
        P2.forEach((p, y) => point(rep, p, n2(y)));
        // Étiquettes des parties choisies, à l'extérieur des patates.
        const [Ps, ns, cote] = choisis.cote === 'A' ? [P1, N1, -1] : [P2, N2, 1];
        for (let j = 0; j < ns; j++) {
          if (!choisis.deux) {
            if (contient(choisis.P, j)) etiquette(rep, Ps[j], choisis.nom, col.perturbation, { cote });
          } else {
            if (contient(choisis.P, j)) etiquette(rep, Ps[j], '1', col.series[0], { cote });
            if (contient(choisis.Q, j)) etiquette(rep, Ps[j], '2', col.series[1], { cote, rang: contient(choisis.P, j) ? 1 : 0 });
          }
        }
      }

      // Textes.
      const [inj, sur] = [injective(g), surjective(g, N2)];
      const proprietes = inj && sur ? '$f$ est bijective' : inj ? '$f$ est injective, mais pas surjective' : sur ? '$f$ est surjective, mais pas injective' : '$f$ n’est ni injective ni surjective';
      const ecris = (textes) => lignes.forEach((l, i) => outils.rendTexte(l, textes[i] ?? ''));
      if (mode === 'reciproque') {
        const B = s.b1;
        const fibres = indices(B, N2);
        ecris([
          `$B = ${p2(B)}$ et $f^{-1}(B) = \\{x \\in E_1 : f(x) \\in B\\} = ${p1(calcule.gauche)}$.`,
          fibres.length
            ? `Point par point : $f^{-1}(B) = ${fibres.map((y) => `f^{-1}(\\{${n2(y)}\\})`).join(' \\cup ')} = ${fibres.map((y) => p1(imageReciproque(g, 1 << y))).join(' \\cup ')}$.`
            : '$f^{-1}(\\emptyset) = \\emptyset$ : aucun point ne tombe dans la partie vide.',
          `${proprietes} : ${inj && sur ? 'ici $f^{-1}(B)$ est aussi l’image de $B$ par la bijection réciproque.' : 'il n’y a pas d’application réciproque $f^{-1}$, et pourtant $f^{-1}(B)$ a un sens pour toute partie $B$.'}`,
        ]);
        const sans = fibres.filter((y) => !g.includes(y));
        verdict.className = 'verdict';
        outils.rendTexte(
          verdict,
          sans.length
            ? `$${sans.map(n2).join(', ')}$ n’${sans.length > 1 ? 'ont' : 'a'} pas d’antécédent : ${sans.length > 1 ? 'ils ne contribuent' : 'il ne contribue'} à rien, et $f(f^{-1}(B)) = ${p2(image(g, calcule.gauche))} \\ne B$.`
            : `Chaque point de $B$ a un antécédent : $f(f^{-1}(B)) = B$.`,
        );
      } else if (mode === 'directe') {
        const A = s.a1;
        const retour = imageReciproque(g, calcule.gauche);
        ecris([
          `$A = ${p1(A)}$ et $f(A) = \\{f(x) : x \\in A\\} = ${p2(calcule.gauche)}$.`,
          `En revenant : $f^{-1}(f(A)) = ${p1(retour)} \\supset A$.`,
          `${proprietes}.`,
        ]);
        const intrus = indices(retour & ~A, N1);
        verdict.className = 'verdict';
        outils.rendTexte(
          verdict,
          intrus.length
            ? ENONCES.fmoinsf.explique(g, { P: A }, intrus[0]) + (intrus.length > 1 ? ` De même pour $${intrus.slice(1).map(n1).join(', ')}$.` : '')
            : `Aucun point hors de $A$ n’a la même image qu’un point de $A$ : $f^{-1}(f(A)) = A$.`,
        );
      } else {
        const espace = calcule.espace === 1 ? p1 : p2;
        const latexParties = choisis.deux
          ? `$${choisis.nom}_1 = ${(choisis.cote === 'A' ? p1 : p2)(choisis.P)}$, $${choisis.nom}_2 = ${(choisis.cote === 'A' ? p1 : p2)(choisis.Q)}$`
          : `$${choisis.nom} = ${(choisis.cote === 'A' ? p1 : p2)(choisis.P)}$`;
        const [gL, dL] = e.latex.split(' = ');
        ecris([
          `${latexParties}.`,
          `$${gL} = ${espace(calcule.gauche)}$ et $${dL} = ${espace(calcule.droite)}$.`,
          e.justification,
        ]);
        const egal = calcule.gauche === calcule.droite;
        const general = !e.condition || conditionVraie(e.condition, g);
        // Une égalité qui ne vaut que pour ces parties reste un verdict neutre.
        verdict.className = `verdict ${egal ? (general ? 'ok' : '') : 'alerte'}`;
        if (message) {
          verdict.className = 'verdict ok';
          outils.rendTexte(verdict, message.texte);
        } else if (egal) {
          outils.rendTexte(
            verdict,
            general
              ? `Égalité, et pour toutes les parties : ${e.condition ? `$f$ est ${e.condition}.` : 'c’est une formule vraie pour toute application.'}`
              : `Égalité pour ces parties, mais pas pour toutes : $f$ n’est pas ${e.condition}. Cherchez un contre-exemple.`,
          );
        } else {
          const n = calcule.espace === 1 ? N1 : N2;
          const temoin = indices(calcule.gauche ^ calcule.droite, n)[0];
          outils.rendTexte(verdict, `Les deux membres diffèrent. ${e.explique(g, { P: choisis.P, Q: choisis.Q }, temoin)}`);
        }
      }
    }

    outils.surTheme(dessine);
    dessine();
    return {
      applique: () => {
        message = null;
        dessine();
      },
    };
  },
};
