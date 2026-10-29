// Les tribus d'une application (poly, section 2.1.4 : Propositions 2.1.10 et
// 2.1.11, Remarques 2.1.5 et 2.1.6, lemme de transport ; Définition 2.2.1 et
// Proposition 2.2.3). Sur deux petits ensembles, une tribu est donnée par une
// partition : on clique sur un point pour le changer de bloc. Chaque flèche de
// f prend la couleur du bloc où elle arrive, si bien que f est mesurable
// exactement quand les flèches d'un même bloc de 𝒜₁ ont toutes la même
// couleur.
//
// Trois modes : la mesurabilité pour deux partitions ; la tribu image de 𝒜₁,
// comparée à la famille f(𝒜₁) ; et la mesurabilité vérifiée sur des
// générateurs de 𝒜₂, par les « bons ensembles » {B : f⁻¹(B) ∈ 𝒜₁}.

import { Repere } from '../../socle/js/ui/repere.js';
import { couleurs } from '../../socle/js/ui/theme.js';
import { barreOutils, boutonInfo, carte, choixRadios, paragraphe, toile, verdict } from './commun.js';
import {
  anneau,
  atomes,
  atomesDeTribu,
  blocsDe,
  blocSuivant,
  contient,
  contour,
  dessineFleches,
  engendree,
  etiquette,
  familleImage,
  gestesDiagramme,
  imageReciproque,
  indices,
  latexPartie,
  lisApplication,
  lisEtiquettes,
  lisMasque,
  NOMS_1,
  NOMS_2,
  point,
  positions,
  reunions,
  tribuImage,
  verifieTribu,
} from './ensembles.js';
import { basculeChoix } from './image-reciproque.js';

export const N1 = 6;
export const N2 = 5;
export const F_DEFAUT = '0,0,1,3,3,1'; // 1, 2 ↦ a ; 3, 6 ↦ b ; 4, 5 ↦ d
export const P1_DEFAUT = '1,1,2,2,3,2'; // {1, 2}, {3, 4, 6}, {5}
export const P2_DEFAUT = '1,1,2,2,3'; // {a, b}, {c, d}, {e}

const p1 = (m) => latexPartie(m, NOMS_1, N1);
const p2 = (m) => latexPartie(m, NOMS_2, N2);
const liste = (blocs, p) => `$${blocs.map(p).join(',\\ ')}$`;

// Blocs de 𝒜₁ que la partie P de E₁ coupe sans les contenir : P n'est pas une
// réunion de blocs si et seulement si cette liste n'est pas vide.
export const blocsCoupes = (blocs, P) => blocs.filter((A) => (A & P) !== 0 && (A & P) !== A);

// Mesurabilité de f pour deux partitions : les atomes de 𝒜₂ dont l'image
// réciproque n'est pas une réunion de blocs de 𝒜₁, avec les blocs coupés.
export function defautsMesurabilite(f, blocs1, blocs2) {
  return blocs2
    .map((B) => ({ B, pre: imageReciproque(f, B) }))
    .map((d) => ({ ...d, coupes: blocsCoupes(blocs1, d.pre) }))
    .filter((d) => d.coupes.length);
}

const MODES = { mesurable: 'Mesurabilité', image: 'Tribu image', generateurs: 'Par générateurs' };

export default {
  etat: { mode: 'mesurable', f: F_DEFAUT, p1: P1_DEFAUT, p2: P2_DEFAUT, c1: 0b01010, c2: 0 },

  choix: { mode: Object.keys(MODES) },

  termes: ['tribu image réciproque', 'tribu image', 'application mesurable', 'lemme de transport', 'bons ensembles', 'tribu'],

  rappel: [
    'Soit $f \\colon E_1 \\to E_2$ une application quelconque. Si $\\mathcal A_2$ est une tribu sur $E_2$, la tribu image réciproque est une tribu sur $E_1$ (Proposition 2.1.10),',
    '$$f^{-1}(\\mathcal A_2) = \\{f^{-1}(B) : B \\in \\mathcal A_2\\}.$$',
    'Si $\\mathcal A_1$ est une tribu sur $E_1$, la tribu image est une tribu sur $E_2$ (Proposition 2.1.11),',
    '$$\\{B \\subset E_2 : f^{-1}(B) \\in \\mathcal A_1\\}.$$',
    'La tribu image n’est pas la famille suivante, qui n’est en général pas une tribu (Remarque 2.1.5) :',
    '$$f(\\mathcal A_1) = \\{f(A) : A \\in \\mathcal A_1\\}.$$',
    '$f \\colon (E_1, \\mathcal A_1) \\to (E_2, \\mathcal A_2)$ est mesurable si $f^{-1}(B) \\in \\mathcal A_1$ pour tout $B \\in \\mathcal A_2$ (Définition 2.2.1). Ainsi $f^{-1}(\\mathcal A_2)$ est la plus petite tribu sur $E_1$ qui rend $f$ mesurable, et la tribu image la plus grande sur $E_2$ (Remarque 2.1.6).',
    'Il suffit de vérifier une famille génératrice : si $\\mathcal A_2 = \\sigma(\\mathcal C)$, $f$ est mesurable dès que $f^{-1}(C) \\in \\mathcal A_1$ pour tout $C \\in \\mathcal C$ (Proposition 2.2.3, point i). Le poly le tire du lemme de transport ; on peut aussi le voir directement : les « bons ensembles » $\\{B : f^{-1}(B) \\in \\mathcal A_1\\}$ forment la tribu image, et une tribu qui contient $\\mathcal C$ contient $\\sigma(\\mathcal C)$.',
  ],

  essais: [
    { texte: 'Les flèches qui partent du bloc $\\{3, 4, 6\\}$ de $\\mathcal A_1$ n’ont pas toutes la même couleur : $f$ n’est pas mesurable. Rendez-la mesurable en déplaçant une seule flèche.', etat: { mode: 'mesurable', f: F_DEFAUT, p1: P1_DEFAUT, p2: P2_DEFAUT } },
    { texte: 'Sans toucher aux flèches : cliquez une fois sur le point $4$, qui passe dans le bloc de $5$. Pourquoi $f$ devient-elle mesurable ?', etat: { mode: 'mesurable', f: F_DEFAUT, p1: P1_DEFAUT, p2: P2_DEFAUT } },
    { texte: 'Tribu image : $f(\\mathcal A_1)$ ne contient pas $E_2$, car $c$ et $e$ n’ont pas d’antécédent. La tribu image, elle, contient $\\{c\\}$ et $\\{e\\}$ : pourquoi ?', etat: { mode: 'image', f: F_DEFAUT, p1: P1_DEFAUT } },
    { texte: 'Un générateur $C_1 = \\{b, d\\}$ : $f^{-1}(C_1) = \\{3, 4, 5, 6\\}$ est une réunion de blocs de $\\mathcal A_1$. Les quatre parties de $\\sigma(\\{C_1\\})$ sont donc de bons ensembles, sans autre vérification.', etat: { mode: 'generateurs', f: F_DEFAUT, p1: P1_DEFAUT, c1: 0b01010, c2: 0 } },
    { texte: 'Cliquez deux fois sur $b$ pour ajouter un second générateur $C_2 = \\{b\\}$ : $f^{-1}(C_2) = \\{3, 6\\}$ coupe un bloc, et $f$ n’est plus mesurable pour $\\sigma(\\{C_1, C_2\\})$.', etat: { mode: 'generateurs', f: F_DEFAUT, p1: P1_DEFAUT, c1: 0b01010, c2: 0 } },
  ],

  monte(zone, outils) {
    const r = outils.etat;
    const f = () => lisApplication(r.f, N1, N2, F_DEFAUT);
    const e1 = () => lisEtiquettes(r.p1, N1, P1_DEFAUT);
    const e2 = () => lisEtiquettes(r.p2, N2, P2_DEFAUT);
    // Couleur d'un bloc : les séries, puis l'accent et le violet.
    const teinte = (col, k) => [...col.series, col.accent, col.equilibre][k % 6];

    const barre = barreOutils(zone);
    const choixMode = choixRadios(barre, {
      nom: 'mode',
      options: Object.entries(MODES).map(([valeur, texte]) => ({ valeur, texte })),
      change: (valeur) => {
        outils.change({ mode: valeur });
        dernier = null;
        dessine();
      },
    });

    const grille = document.createElement('div');
    grille.className = 'grille-2 principale';
    zone.appendChild(grille);

    const cD = carte(grille, 'Deux tribus et une application');
    boutonInfo(cD, [
      ['zone', '--serie-1', 'Un bloc d’une partition : ses points ont la même couleur et le même numéro. Cliquez sur un point pour le faire passer au bloc suivant.'],
      ['fleche', '--serie-2', 'Une flèche de $f$, de la couleur du bloc où elle arrive. Faites partir un glisser du point de $E_1$ et lâchez-le sur un point de $E_2$ pour la rediriger ; lâchée ailleurs, elle revient. Chaque point de $E_1$ a toujours exactement une flèche : une application est définie en tout point, on la redirige, on ne la supprime pas.'],
      ['cercle', '--alerte', 'Les points d’un bloc de $\\mathcal A_1$ coupé par une image réciproque : $f$ n’est pas mesurable.'],
      ['zone', '--perturbation', 'Par générateurs : les étiquettes des parties génératrices $C_1$ et $C_2$ ; un clic fait passer un point par $C_1$, $C_2$, les deux, aucune.'],
    ]);
    const canvas = toile(cD, '5 / 4', () => dessine());
    canvas.classList.add('cliquable');
    const rep = new Repere(canvas, { x: [0, 5], y: [-0.2, 6.6], marges: { gauche: 6, bas: 6, haut: 10, droite: 6 } });
    const P1 = positions(N1, 1.25, 6);
    const P2 = positions(N2, 3.75, 6);

    // Ce que fait le dernier geste, ou, au départ, ce que les gestes permettent.
    const note = paragraphe(cD, '', 'note');
    let dernier = null;
    const consigne = () =>
      ({
        mesurable: 'Cliquez sur un point : il passe au bloc suivant (le numéro à côté de lui est celui de son bloc). Glissez un point de $E_1$ sur un point de $E_2$ pour rediriger sa flèche.',
        image: 'Cliquez sur un point de $E_1$ : il passe au bloc suivant. Glissez-le sur un point de $E_2$ pour rediriger sa flèche. Les points de $E_2$ ne se cliquent pas ici : leurs blocs sont ceux de la tribu image.',
        generateurs: 'Cliquez sur un point de $E_2$ pour le faire passer par $C_1$, $C_2$, les deux ou aucune. Cliquez sur un point de $E_1$ pour le changer de bloc ; glissez-le pour rediriger sa flèche.',
      })[r.mode];

    const cT = carte(grille, 'Ce que l’on calcule');
    const bloc = document.createElement('div');
    bloc.className = 'bloc-maths';
    cT.appendChild(bloc);
    const lignes = [0, 1, 2, 3].map(() => paragraphe(bloc, '', ''));
    const texteVerdict = verdict(cT, '');

    // Le bloc du point j, dit par son contenu (les numéros peuvent se renuméroter).
    const dit = (et, j, nom, p) => {
      const bloc = blocsDe(et).find((B) => contient(B, j));
      return bloc === 1 << j ? `$${nom}$ forme un bloc à lui seul` : `$${nom}$ rejoint le bloc $${p(bloc)}$`;
    };
    const clique = (cote, j) => {
      if (cote === 'A') {
        const nouvelle = blocSuivant(e1(), j);
        dernier = `Le point ${dit(nouvelle, j, NOMS_1[j], p1)}.`;
        outils.change({ p1: nouvelle.join(',') });
      } else if (r.mode === 'mesurable') {
        const nouvelle = blocSuivant(e2(), j);
        dernier = `Le point ${dit(nouvelle, j, NOMS_2[j], p2)}.`;
        outils.change({ p2: nouvelle.join(',') });
      } else if (r.mode === 'generateurs') {
        const [P, Q] = basculeChoix(lisMasque(r.c1, N2), lisMasque(r.c2, N2), j, true);
        const dans = [contient(P, j) && '$C_1$', contient(Q, j) && '$C_2$'].filter(Boolean);
        dernier = `Le point $${NOMS_2[j]}$ est ${dans.length ? `dans ${dans.join(' et ')}` : 'dans aucun générateur'}.`;
        outils.change({ c1: P, c2: Q });
      } else return;
      dessine();
    };
    const gestes = gestesDiagramme(canvas, rep, {
      P1,
      P2,
      lisF: f,
      ecrisF: (h) => {
        const x = h.findIndex((y, i) => y !== f()[i]);
        dernier = x >= 0 ? `La flèche du point $${NOMS_1[x]}$ arrive maintenant en $${NOMS_2[h[x]]}$.` : null;
        outils.change({ f: h.join(',') });
      },
      clique,
      redessine: () => dessine(),
    });

    function dessine() {
      const col = couleurs();
      const mode = MODES[r.mode] ? r.mode : 'mesurable';
      choixMode.fixe(mode);
      outils.rendTexte(note, dernier ?? consigne());
      const g = f();
      const et1 = e1();
      const blocs1 = blocsDe(et1);
      const tribu1 = reunions(blocs1);
      const [C1, C2] = [lisMasque(r.c1, N2), lisMasque(r.c2, N2)];
      const C = [C1, C2].filter((m) => m);

      // Partition de E₂ affichée : 𝒜₂, les atomes de la tribu image, ou ceux de σ(𝒞).
      let blocs2;
      let et2 = null;
      if (mode === 'mesurable') {
        et2 = e2();
        blocs2 = blocsDe(et2);
      } else if (mode === 'image') blocs2 = atomesDeTribu(tribuImage(g, tribu1, N2));
      else blocs2 = C.length ? atomes(C, N2) : [(1 << N2) - 1];
      const blocDe2 = (y) => blocs2.findIndex((B) => contient(B, y));
      const defauts = mode === 'image' ? [] : defautsMesurabilite(g, blocs1, blocs2);
      const coupes = new Set(defauts.flatMap((d) => d.coupes));

      if (rep.prepare()) {
        contour(rep, P1, 'E₁');
        contour(rep, P2, 'E₂');
        dessineFleches(rep, P1, P2, g, gestes.geste, (x, y) => ({
          couleur: mode === 'image' ? col.discret : teinte(col, blocDe2(y)),
          largeur: mode === 'image' ? 1.3 : 2,
        }));
        P1.forEach((pos, x) => {
          const k = et1[x] - 1;
          if ([...coupes].some((A) => contient(A, x))) anneau(rep, pos, col.alerte, { rayon: 16, largeur: 2.4 });
          point(rep, pos, NOMS_1[x], { remplissage: teinte(col, k) });
          etiquette(rep, pos, String(k + 1), teinte(col, k), { cote: -1 });
        });
        P2.forEach((pos, y) => {
          const k = blocDe2(y);
          point(rep, pos, NOMS_2[y], { remplissage: teinte(col, k) });
          if (mode === 'mesurable') etiquette(rep, pos, String(et2[y]), teinte(col, k), { cote: 1 });
          if (mode === 'generateurs') {
            if (contient(C1, y)) etiquette(rep, pos, 'C₁', col.perturbation, { cote: 1 });
            if (contient(C2, y)) etiquette(rep, pos, 'C₂', col.perturbation, { cote: 1, rang: contient(C1, y) ? 1 : 0 });
          }
        });
      }

      // Textes.
      const ecris = (textes) => {
        lignes.forEach((l, i) => outils.rendTexte(l, textes[i] ?? ''));
        outils.glossaire(bloc, ['atome']);
      };
      const a1 = `Blocs de $\\mathcal A_1$ : ${liste(blocs1, p1)}, donc $\\mathcal A_1$ a $2^{${blocs1.length}}$ parties.`;
      if (mode === 'mesurable') {
        const pre = blocs2.map((B) => imageReciproque(g, B)).filter((m) => m);
        ecris([
          a1,
          `Blocs de $\\mathcal A_2$ : ${liste(blocs2, p2)}.`,
          `$f^{-1}(\\mathcal A_2)$ a pour atomes les images réciproques des blocs de $\\mathcal A_2$ : ${liste(pre, p1)}. C’est la plus petite tribu sur $E_1$ qui rend $f$ mesurable.`,
          '$f$ est mesurable si et seulement si $f^{-1}(\\mathcal A_2) \\subset \\mathcal A_1$ : chaque atome de $f^{-1}(\\mathcal A_2)$ doit être une réunion de blocs de $\\mathcal A_1$.',
        ]);
        texteVerdict.className = `verdict ${defauts.length ? 'alerte' : 'ok'}`;
        const d = defauts[0];
        outils.rendTexte(
          texteVerdict,
          d
            ? `$f$ n’est pas mesurable : $f^{-1}(${p2(d.B)}) = ${p1(d.pre)}$ coupe le bloc $${p1(d.coupes[0])}$ de $\\mathcal A_1$ sans le contenir.`
            : '$f$ est mesurable : les flèches d’un même bloc de $\\mathcal A_1$ arrivent toutes dans un même bloc de $\\mathcal A_2$.',
        );
      } else if (mode === 'image') {
        const T = tribuImage(g, tribu1, N2);
        const famille = familleImage(g, tribu1);
        const test = verifieTribu(famille, N2);
        const sans = indices((1 << N2) - 1, N2).filter((y) => !g.includes(y));
        ecris([
          a1,
          `Tribu image $\\{B \\subset E_2 : f^{-1}(B) \\in \\mathcal A_1\\}$ : ${T.length} parties, d’atomes ${liste(blocs2, p2)}. C’est la plus grande tribu sur $E_2$ qui rend $f$ mesurable.`,
          `$f(\\mathcal A_1) = \\{f(A) : A \\in \\mathcal A_1\\}$ : ${famille.length} parties, ${liste(famille.slice(0, 8), p2)}${famille.length > 8 ? '…' : ''}.`,
          sans.length ? `$${sans.map((y) => `f^{-1}(\\{${NOMS_2[y]}\\})`).join(' = ')} = \\emptyset \\in \\mathcal A_1$ : ${sans.length > 1 ? 'ces singletons sont' : 'ce singleton est'} dans la tribu image.` : '',
        ]);
        texteVerdict.className = `verdict ${test.tribu ? '' : 'alerte'}`;
        outils.rendTexte(
          texteVerdict,
          test.tribu
            ? 'Ici $f(\\mathcal A_1)$ est une tribu, mais ce n’est pas vrai en général (Remarque 2.1.5).'
            : test.axiome === 'plein'
              ? `$f(\\mathcal A_1)$ n’est pas une tribu : elle ne contient pas $E_2$, puisque $f(E_1) = ${p2(famille[famille.length - 1])}$.`
              : `$f(\\mathcal A_1)$ n’est pas une tribu : $${p2(test.A)}$ y est, mais pas son complémentaire $${p2(((1 << N2) - 1) & ~test.A)}$.`,
        );
      } else {
        const tests = C.map((Ci) => ({ Ci, pre: imageReciproque(g, Ci) })).map((t) => ({ ...t, bon: tribu1.includes(t.pre) }));
        const sigma = engendree(C.length ? C : [0], N2);
        ecris([
          a1,
          C.length ? `Générateurs : ${C.map((Ci, i) => `$C_${C1 && C2 ? i + 1 : C1 ? 1 : 2} = ${p2(Ci)}$`).join(', ')} ; $\\mathcal A_2 = \\sigma(\\mathcal C)$ a ${sigma.length} parties.` : 'Aucun générateur : cliquez sur des points de $E_2$.',
          tests.map((t) => `$f^{-1}(${p2(t.Ci)}) = ${p1(t.pre)}$ ${t.bon ? '$\\in$' : '$\\notin$'} $\\mathcal A_1$`).join(' ; ') + (tests.length ? '.' : ''),
          'Les bons ensembles $\\mathcal G = \\{B \\subset E_2 : f^{-1}(B) \\in \\mathcal A_1\\}$ forment une tribu, la tribu image. Si $\\mathcal C \\subset \\mathcal G$, alors $\\sigma(\\mathcal C) \\subset \\mathcal G$ : il suffit de vérifier les générateurs.',
        ]);
        const mauvais = tests.find((t) => !t.bon);
        texteVerdict.className = `verdict ${!C.length ? '' : mauvais ? 'alerte' : 'ok'}`;
        outils.rendTexte(
          texteVerdict,
          !C.length
            ? '$\\sigma(\\emptyset) = \\{\\emptyset, E_2\\}$ : toute application est mesurable pour la tribu grossière.'
            : mauvais
              ? `$f$ n’est pas mesurable : $f^{-1}(${p2(mauvais.Ci)}) = ${p1(mauvais.pre)}$ coupe un bloc de $\\mathcal A_1$, alors que $${p2(mauvais.Ci)} \\in \\sigma(\\mathcal C)$.`
              : `Les générateurs sont de bons ensembles, donc les ${sigma.length} parties de $\\sigma(\\mathcal C)$ aussi : $f$ est mesurable.`,
        );
      }
    }

    outils.surTheme(dessine);
    dessine();
    return {
      applique: () => {
        dernier = null;
        dessine();
      },
    };
  },
};
