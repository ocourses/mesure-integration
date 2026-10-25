// Engendrer une tribu (poly, section 2.1 : Définitions 2.1.1 et 2.1.5,
// Proposition 2.1.6, Exemples 2.1.2 et 2.1.3, Remarques 2.1.2 et 2.1.3). Les
// 32 parties de E = {1, …, 5} sont rangées en colonnes selon leur cardinal,
// chacune en face de son complémentaire : une tribu, stable par passage au
// complémentaire, y dessine une figure symétrique.
//
// Deux modes. « Engendrer » : on choisit des parties génératrices, et l'on
// avance l'étape k ; à chaque étape on ajoute les complémentaires et les
// réunions deux à deux. La famille grossit jusqu'à σ(𝒞), dessinée en tirets.
// « Est-ce une tribu ? » : on coche des parties, et la page dit quel axiome
// manque, avec les parties en cause.

import { Repere } from '../ui/repere.js';
import { couleurs } from '../ui/theme.js';
import { barreOutils, boutonAide, boutonInfo, carte, choixRadios, glisse, paragraphe, toile } from './commun.js';
import { champ } from '../ui/controls.js';
import { fermeInfobulle } from '../ui/infobulle.js';
import { atomes, cardinal, complementaire, engendree, etape, latexFamille, latexPartie, NOMS_1, plein, verifieTribu } from './ensembles.js';

export const N = 5;
export const K_MAX = 8;
const tout = plein(N);
const p = (m) => latexPartie(m, NOMS_1, N);

// Ordre des parties dans chaque colonne : lexicographique pour les cardinaux
// 0 à 2, puis, pour les cardinaux 3 à 5, les complémentaires de la colonne
// symétrique, pour que chaque partie soit en face de son complémentaire.
export const COLONNES = (() => {
  const lexico = (k) =>
    Array.from({ length: tout + 1 }, (_, m) => m)
      .filter((m) => cardinal(m) === k)
      .sort((a, b) => {
        const [x, y] = [a, b].map((m) => NOMS_1.slice(0, N).filter((_, j) => (m >> j) & 1).join(''));
        return x < y ? -1 : 1;
      });
  const gauche = [0, 1, 2].map(lexico);
  return [...gauche, ...[2, 1, 0].map((k) => gauche[k].map((m) => complementaire(m, N)))];
})();

// Famille lue dans l'URL : masques séparés par des points, dans [0, 31].
export function lisFamille(texte) {
  if (texte === '') return [];
  const v = String(texte).split('.').map(Number);
  return [...new Set(v.filter((m) => Number.isInteger(m) && m >= 0 && m <= tout))].sort((a, b) => a - b);
}
const ecrisFamille = (famille) => famille.join('.');

// Les familles 𝓕₀ = 𝒞, 𝓕₁, …, 𝓕ₖ de la fermeture pas à pas.
export function etapes(generateurs, k) {
  const res = [generateurs];
  for (let i = 0; i < k; i++) res.push(etape(res[res.length - 1], N));
  return res;
}

// Première étape à laquelle la famille ne bouge plus (𝓕ₖ = σ(𝒞)).
export function etapeStable(generateurs) {
  if (!generateurs.length) return 0;
  const cible = engendree(generateurs, N).length;
  let F = generateurs;
  let k = 0;
  while (F.length < cible) {
    F = etape(F, N);
    k++;
  }
  return k;
}

// Au plus `max` parties d'une famille, puis « … » : la ligne reste courte quelle
// que soit la taille de la famille.
export function latexFamilleCourte(famille, max = 4) {
  if (famille.length <= max) return latexFamille(famille, NOMS_1, N);
  return `\\{${famille.slice(0, max).map(p).join(',\\ ')},\\ \\dots\\}`;
}

// Contenu de la bulle « i » de la carte Pourquoi : comment passer de 𝓕ₖ à 𝓕ₖ₊₁.
function explique(div, rendTexte) {
  const lignes = [
    'On part de $\\mathcal F_0 = \\mathcal C$, les parties génératrices.',
    'De $\\mathcal F_k$ à $\\mathcal F_{k+1}$ : on garde tout, et l’on ajoute les complémentaires $A^c$ et les réunions $A \\cup B$ de parties $A, B$ de $\\mathcal F_k$. Autrement dit $\\mathcal F_{k+1} = \\mathcal F_k \\cup \\{A^c : A \\in \\mathcal F_k\\} \\cup \\{A \\cup B : A, B \\in \\mathcal F_k\\}$.',
    'On s’arrête à la première étape où rien ne s’ajoute : $\\mathcal F_{k+1} = \\mathcal F_k$. La famille est alors stable par complémentaire et par réunion, c’est une tribu. Sur un ensemble fini, cela finit toujours par arriver, car la famille ne fait que grossir dans $\\mathcal P(E)$.',
    'Exemple : $\\mathcal C = \\{\\{1, 2\\}\\}$. Alors $\\mathcal F_1 = \\{\\{1, 2\\}, \\{3, 4, 5\\}, E\\}$ (le complémentaire, puis la réunion des deux), $\\mathcal F_2 = \\mathcal F_1 \\cup \\{\\emptyset\\}$ (le complémentaire de $E$), et $\\mathcal F_3 = \\mathcal F_2$.',
  ];
  for (const texte of lignes) {
    const ligne = document.createElement('p');
    ligne.className = 'corps-bulle';
    rendTexte(ligne, texte);
    div.appendChild(ligne);
  }
}

const MODES = { engendrer: 'Engendrer', tribu: 'Est-ce une tribu ?' };

export default {
  etat: { mode: 'engendrer', gen: '3', k: 0, famille: '0.31' },

  choix: { mode: Object.keys(MODES) },

  termes: ['tribu engendrée', 'atome', 'tribu grossière', 'tribu discrète', 'tribu'],

  rappel: [
    'Une tribu sur $E$ est une famille $\\mathcal A \\subset \\mathcal P(E)$ qui contient $E$ et qui est stable par passage au complémentaire et par réunion dénombrable (Définition 2.1.1). Elle contient alors $\\emptyset$ et elle est stable par intersection dénombrable, puisque',
    '$$A \\cap B = (A^c \\cup B^c)^c.$$',
    'La tribu engendrée par une famille $\\mathcal C$ est l’intersection de toutes les tribus qui contiennent $\\mathcal C$ : c’est la plus petite (Définition 2.1.5),',
    '$$\\sigma(\\mathcal C) = \\bigcap \\{\\mathcal A \\text{ tribu} : \\mathcal C \\subset \\mathcal A\\}.$$',
    'D’où la méthode qui suit la Proposition 2.1.6 : si $\\mathcal A$ est une tribu qui contient $\\mathcal C$, alors $\\sigma(\\mathcal C) \\subset \\mathcal A$.',
    'Sur un ensemble fini, on peut la construire pas à pas : on ajoute les complémentaires et les réunions, jusqu’à ce que rien ne change. On obtient les réunions de blocs d’une partition (Exemple 2.1.3).',
    'La réunion de deux tribus n’est pas une tribu en général (Remarque 2.1.2). Une famille stable par réunion et par intersection, comme une topologie, ne l’est pas forcément par complémentaire (Remarque 2.1.3).',
  ],

  essais: [
    { texte: 'Une seule partie $A = \\{1, 2\\}$ : avancez l’étape $k$ depuis $0$. On obtient $\\{\\emptyset, A, A^c, E\\}$ (Exemple 2.1.2), quatre parties placées en miroir.', etat: { mode: 'engendrer', gen: '3', k: 0 } },
    { texte: '$\\{2, 3\\}$ et $\\{2, 4\\}$ : leur intersection $\\{2\\}$ n’est jamais ajoutée directement. À quelle étape apparaît-elle ?', etat: { mode: 'engendrer', gen: '6.10', k: 0 } },
    { texte: 'Ajoutez $\\{1\\}$ aux deux parties précédentes : combien d’étapes avant que rien ne change ? On obtient la tribu discrète $\\mathcal P(E)$.', etat: { mode: 'engendrer', gen: '1.6.10', k: 3 } },
    { texte: 'La réunion de $\\sigma(\\{1\\})$ et de $\\sigma(\\{2\\})$ (Remarque 2.1.2) : quelle réunion de deux parties manque ?', etat: { mode: 'tribu', famille: '0.1.2.29.30.31' } },
    { texte: 'La chaîne $\\emptyset \\subset \\{1\\} \\subset \\{1, 2\\} \\subset E$ est stable par réunion et par intersection, comme une topologie (Remarque 2.1.3). Pourquoi n’est-elle pas une tribu ?', etat: { mode: 'tribu', famille: '0.1.3.31' } },
    { texte: 'Partez de la tribu grossière $\\{\\emptyset, E\\}$ et construisez à la main une tribu à trois atomes, en cochant des parties. Pourquoi sa figure est-elle symétrique ?', etat: { mode: 'tribu', famille: '0.31' } },
  ],

  monte(zone, outils) {
    const r = outils.etat;

    const barre = barreOutils(zone);
    const choixMode = choixRadios(barre, {
      nom: 'mode',
      options: Object.entries(MODES).map(([valeur, texte]) => ({ valeur, texte })),
      change: (valeur) => {
        outils.change({ mode: valeur });
        dessine();
      },
    });

    // ---- 𝒫(E) -------------------------------------------------------------------------------
    const cP = carte(zone, 'Les 32 parties de $E = \\{1, 2, 3, 4, 5\\}$, rangées par cardinal');
    cP.classList.add('principale');
    boutonInfo(cP, [
      ['zone', '--texte', 'Une partie : cinq cases, celle du point $j$ pleine si $j$ est dans la partie. Chaque partie est en face de son complémentaire, de l’autre côté de l’axe.'],
      ['zone', '--accent', 'Les parties de la famille. Cliquez sur une partie pour l’ajouter ou la retirer (aux générateurs, ou à la famille).'],
      ['cercle', '--perturbation', 'Engendrer : les parties génératrices $\\mathcal C$.'],
      ['ligne', '--accent', 'Engendrer : les parties ajoutées à la dernière étape.'],
      ['tirets', '--equilibre', 'Engendrer : les parties de $\\sigma(\\mathcal C)$ pas encore atteintes.'],
      ['cercle', '--alerte', 'Est-ce une tribu ? Les parties qui mettent un axiome en défaut ; en tirets, celle qui manque.'],
    ]);
    const reglage = document.createElement('div');
    cP.appendChild(reglage);
    const champK = champ(reglage, { latex: 'k', min: 0, max: K_MAX, pas: 1, valeur: r.k }, (v) => {
      outils.change({ k: Math.min(K_MAX, Math.max(0, Math.round(v))) });
      dessine();
    });
    const canvas = toile(cP, '16 / 10', () => dessine());
    canvas.classList.add('cliquable');
    const rep = new Repere(canvas, { x: [0, 6], y: [0, 10.8], marges: { gauche: 6, bas: 6, haut: 6, droite: 6 } });

    // ---- Textes -----------------------------------------------------------------------------
    const grille = document.createElement('div');
    grille.className = 'grille-2 hauteur-fixe';
    zone.appendChild(grille);
    const cF = carte(grille, 'La famille');
    const blocF = document.createElement('div');
    cF.appendChild(blocF);
    const lignesF = [0, 1, 2].map(() => paragraphe(blocF, '', ''));
    const verdict = paragraphe(cF, '', 'verdict');
    const cJ = carte(grille, 'Pourquoi');
    boutonAide(cJ, { titre: 'Construire les familles Fₖ', etiquette: 'Comment on construit les familles F_k' }, (div) => explique(div, outils.rendTexte));
    const lignesJ = [0, 1].map(() => paragraphe(cJ, '', ''));

    // Centre de la partie m : colonne = cardinal, rang dans la colonne centré.
    const centre = new Map();
    COLONNES.forEach((col, k) =>
      col.forEach((m, i) => {
        const decalage = (10 - col.length) / 2;
        centre.set(m, [k + 0.5, 10 - (decalage + i + 0.5)]);
      }),
    );
    // Demi-taille d'une partie en pixels : cinq cases carrées.
    const taille = () => {
      const c = Math.floor(Math.min((rep.sx * 0.78) / N, rep.sy * 0.62, 30));
      return { c, l: (c * N) / 2 + 4, h: c / 2 + 4 };
    };
    const partieVisee = (x, y) => {
      const { l, h } = taille();
      for (const [m, [cx, cy]] of centre) if (Math.abs((x - cx) * rep.sx) <= l && Math.abs((y - cy) * rep.sy) <= h) return m;
      return -1;
    };

    glisse(canvas, rep, {
      prend: (x, y) => {
        const m = partieVisee(x, y);
        if (m < 0) return false;
        const cle = r.mode === 'tribu' ? 'famille' : 'gen';
        const famille = lisFamille(r[cle]);
        const nouvelle = famille.includes(m) ? famille.filter((a) => a !== m) : [...famille, m];
        outils.change({ [cle]: ecrisFamille(nouvelle.sort((a, b) => a - b)) });
        dessine();
        return false;
      },
      deplace: () => {},
    });

    function dessine() {
      const col = couleurs();
      const mode = MODES[r.mode] ? r.mode : 'engendrer';
      const k = Math.min(K_MAX, Math.max(0, Math.round(r.k) || 0));
      choixMode.fixe(mode);
      champK.fixe(k);
      reglage.style.visibility = mode === 'engendrer' ? 'visible' : 'hidden';

      const C = lisFamille(r.gen);
      const suite = etapes(C, k);
      const Fk = mode === 'engendrer' ? suite[k] : lisFamille(r.famille);
      const avant = mode === 'engendrer' && k > 0 ? suite[k - 1] : Fk;
      const sigma = engendree(mode === 'engendrer' ? C : Fk, N);
      const test = verifieTribu(Fk, N);

      if (rep.prepare()) {
        const ctx = rep.ctx;
        const { c, l, h } = taille();
        // Axe de symétrie et cardinaux.
        rep.trace([[3, 0], [3, 10]], { couleur: col.grille, largeur: 1.5, tirets: [4, 4] });
        for (let j = 0; j <= N; j++) rep.texte(j + 0.5, 10.8, `${j} point${j > 1 ? 's' : ''}`, { align: 'center', dy: 10, couleur: col.discret, police: '12px system-ui, sans-serif' });
        const cadre = (m, couleur, { largeur = 2, tirets = [], marge = 0 } = {}) => {
          const [cx, cy] = centre.get(m);
          ctx.save();
          ctx.strokeStyle = couleur;
          ctx.lineWidth = largeur;
          ctx.setLineDash(tirets);
          ctx.beginPath();
          ctx.roundRect(rep.X(cx) - l - marge, rep.Y(cy) - h - marge, 2 * (l + marge), 2 * (h + marge), 5);
          ctx.stroke();
          ctx.restore();
        };
        for (const [m, [cx, cy]] of centre) {
          const dedans = Fk.includes(m);
          if (dedans) {
            ctx.save();
            ctx.globalAlpha = 0.28;
            ctx.fillStyle = col.accent;
            ctx.beginPath();
            ctx.roundRect(rep.X(cx) - l, rep.Y(cy) - h, 2 * l, 2 * h, 5);
            ctx.fill();
            ctx.restore();
          }
          // Les cinq cases.
          for (let j = 0; j < N; j++) {
            const x0 = Math.round(rep.X(cx) - (c * N) / 2 + j * c);
            const y0 = Math.round(rep.Y(cy) - c / 2);
            ctx.save();
            ctx.strokeStyle = col.discret;
            ctx.lineWidth = 1;
            const plein = (m >> j) & 1;
            if (plein) {
              ctx.fillStyle = col.trait;
              ctx.fillRect(x0 + 1.5, y0 + 1.5, c - 3, c - 3);
            }
            ctx.strokeRect(x0 + 0.5, y0 + 0.5, c - 1, c - 1);
            // Le numéro du point, pour lire la partie sans compter les cases.
            if (c >= 11) {
              ctx.fillStyle = plein ? col.fond : col.discret;
              ctx.font = `700 ${Math.max(11, Math.round(c * 0.62))}px system-ui, sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(String(j + 1), x0 + c / 2, y0 + c / 2 + 1);
            }
            ctx.restore();
          }
          if (mode === 'engendrer') {
            if (!dedans && sigma.includes(m)) cadre(m, col.equilibre, { largeur: 1.5, tirets: [4, 3] });
            if (dedans && !avant.includes(m)) cadre(m, col.accent, { largeur: 2 });
            if (C.includes(m)) cadre(m, col.perturbation, { largeur: 2.4, marge: 3 });
          }
        }
        if (mode === 'tribu' && !test.tribu) {
          if (test.axiome === 'plein') cadre(tout, col.alerte, { largeur: 2, tirets: [4, 3], marge: 3 });
          else if (test.axiome === 'complementaire') {
            cadre(test.A, col.alerte, { largeur: 2.4, marge: 3 });
            cadre(complementaire(test.A, N), col.alerte, { largeur: 2, tirets: [4, 3], marge: 3 });
          } else {
            cadre(test.A, col.alerte, { largeur: 2.4, marge: 3 });
            cadre(test.B, col.alerte, { largeur: 2.4, marge: 3 });
            cadre(test.A | test.B, col.alerte, { largeur: 2, tirets: [4, 3], marge: 3 });
          }
        }
      }

      // Textes.
      const ecris = (lignes, textes) => lignes.forEach((ligne, i) => outils.rendTexte(ligne, textes[i] ?? ''));
      const nAtomes = atomes(mode === 'engendrer' ? C : Fk, N).length;
      if (mode === 'engendrer') {
        const ajoutees = Fk.filter((m) => !avant.includes(m));
        const stable = C.length > 0 && Fk.length === sigma.length;
        ecris(lignesF, [
          C.length ? `$\\mathcal C = ${latexFamilleCourte(C)}$ (${C.length} partie${C.length > 1 ? 's' : ''}).` : 'Aucune partie génératrice : cliquez sur des parties.',
          `Étape $k = ${k}$ : la famille $\\mathcal F_{${k}}$ compte ${Fk.length} partie${Fk.length > 1 ? 's' : ''}, et $\\sigma(\\mathcal C)$ en compte ${sigma.length}.`,
          k === 0
            ? 'Étape 0 : les seules parties génératrices.'
            : ajoutees.length
              ? `Ajoutées à l’étape ${k} : $${ajoutees.slice(0, 4).map(p).join(',\\ ')}$${ajoutees.length > 4 ? ` et ${ajoutees.length - 4} autres` : ''}.`
              : `Rien n’est ajouté à l’étape ${k}.`,
        ]);
        verdict.className = `verdict ${stable ? 'ok' : ''}`;
        outils.rendTexte(
          verdict,
          !C.length
            ? '$\\sigma(\\emptyset) = \\{\\emptyset, E\\}$, la tribu grossière : elle ne s’obtient pas en ajoutant des parties à une famille vide.'
            : stable
              ? `Rien ne s’ajoute plus : $\\mathcal F_{${k}}$ est une tribu, c’est $\\sigma(\\mathcal C)$, avec ${nAtomes} atome${nAtomes > 1 ? 's' : ''} et $2^{${nAtomes}} = ${sigma.length}$ parties (atteinte à l’étape ${etapeStable(C)}).`
              : `Il manque encore ${sigma.length - Fk.length} partie${sigma.length - Fk.length > 1 ? 's' : ''} de $\\sigma(\\mathcal C)$, en tirets : avancez l’étape.`,
        );
        ecrisJustification([
          'Toute tribu qui contient $\\mathcal C$ contient les complémentaires et les réunions de ses membres : elle contient donc $\\mathcal F_1$, puis $\\mathcal F_2$, et ainsi de suite. Quand la famille ne bouge plus, elle est stable par complémentaire et par réunion : c’est une tribu, et c’est la plus petite qui contient $\\mathcal C$.',
          'Les intersections viennent sans qu’on les demande, en plusieurs étapes : $A \\cap B = (A^c \\cup B^c)^c$.',
        ]);
      } else {
        ecris(lignesF, [
          `La famille $\\mathcal F$ compte ${Fk.length} partie${Fk.length > 1 ? 's' : ''}.`,
          `La plus petite tribu qui la contient, $\\sigma(\\mathcal F)$, a ${nAtomes} atome${nAtomes > 1 ? 's' : ''} et ${sigma.length} parties.`,
          '',
        ]);
        verdict.className = `verdict ${test.tribu ? 'ok' : 'alerte'}`;
        const texte = test.tribu
          ? `C’est une tribu : elle contient $E$, et elle est stable par complémentaire et par réunion. Elle a ${nAtomes} atome${nAtomes > 1 ? 's' : ''}.`
          : test.axiome === 'plein'
            ? 'Ce n’est pas une tribu : $E$ n’est pas dans la famille.'
            : test.axiome === 'complementaire'
              ? `Ce n’est pas une tribu : $A = ${p(test.A)}$ est dans la famille, mais pas son complémentaire $A^c = ${p(complementaire(test.A, N))}$.`
              : `Ce n’est pas une tribu : $A = ${p(test.A)}$ et $B = ${p(test.B)}$ sont dans la famille, mais pas $A \\cup B = ${p(test.A | test.B)}$.`;
        outils.rendTexte(verdict, texte);
        ecrisJustification([
          'Sur un ensemble fini, une famille n’a qu’un nombre fini de membres : la stabilité par réunion dénombrable se réduit à la stabilité par réunion de deux parties.',
          'Chaque partie est en face de son complémentaire : la figure d’une tribu est symétrique par rapport à l’axe.',
        ]);
      }
    }

    // La justification ne change qu'avec le mode : elle n'est reconstruite (et
    // soulignée) qu'à ce moment, pour que sa bulle reste utilisable.
    let justification = null;
    function ecrisJustification(textes) {
      const cle = textes.join('|');
      if (cle === justification) return;
      justification = cle;
      lignesJ.forEach((ligne, i) => outils.rendTexte(ligne, textes[i]));
      outils.glossaire(cJ, ['tribu']);
      fermeInfobulle();
    }

    outils.surTheme(dessine);
    dessine();
    return { applique: dessine };
  },
};
