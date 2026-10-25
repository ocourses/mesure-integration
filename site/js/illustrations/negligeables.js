// Négligeable, et pourtant partout (poly, sections 1.1.3 et 2.3.3). Deux
// ensembles de mesure de Lebesgue nulle qui n'ont pas l'air petits :
//   - ℚ ∩ [0, 1], dense, que l'on recouvre en posant sur son k-ième élément un
//     intervalle de longueur ε 2^{−k} : la longueur totale reste ≤ ε ;
//   - l'ensemble de Cantor, non dénombrable, dont les étapes C_n ont pour
//     mesure (2/3)^n. Un point cliqué montre son développement en base 3.

import { latexNombre, latexPositifFixe as nb } from '../ui/format.js';
import { Repere } from '../ui/repere.js';
import { couleurs } from '../ui/theme.js';
import { champ } from '../ui/controls.js';
import { barreOutils, boutonInfo, carte, choixRadios, glisse, paragraphe, toile, zoomable } from './commun.js';
import { rationnels } from './suites-trompeuses.js';

// ---- ℚ ∩ [0, 1] ----------------------------------------------------------------------

// Intervalles ouverts centrés en q_k, de longueur ε 2^{−k}, pour k = 1, …, N.
export function recouvrement(epsilon, N) {
  return rationnels(N).map((q, i) => {
    const l = epsilon * 2 ** -(i + 1);
    return { q, k: i + 1, intervalle: [q - l / 2, q + l / 2] };
  });
}

// Réunion d'intervalles : intervalles disjoints triés.
export function reunion(intervalles) {
  const tries = intervalles.map((i) => i.slice()).sort((a, b) => a[0] - b[0]);
  const res = [];
  for (const [u, v] of tries) {
    const dernier = res[res.length - 1];
    if (dernier && u <= dernier[1]) dernier[1] = Math.max(dernier[1], v);
    else res.push([u, v]);
  }
  return res;
}

// ---- Ensemble de Cantor ----------------------------------------------------------------

// Les 2^n intervalles fermés de C_n, chacun de longueur 3^{−n}.
export function etapeCantor(n) {
  let morceaux = [[0, 1]];
  for (let k = 0; k < n; k++) {
    morceaux = morceaux.flatMap(([u, v]) => {
      const t = (v - u) / 3;
      return [
        [u, u + t],
        [v - t, v],
      ];
    });
  }
  return morceaux;
}

// x ∈ C_n ? On zoome sur le tiers où tombe x ; un point du tiers central
// ouvert est retiré. Les bords 1/3 et 2/3 restent dans C_n.
export function dansCantor(x, n) {
  if (x < 0 || x > 1) return false;
  let y = x;
  for (let k = 0; k < n; k++) {
    if (y > 1 / 3 + 1e-12 && y < 2 / 3 - 1e-12) return false;
    y = y <= 1 / 3 + 1e-12 ? 3 * y : 3 * y - 2;
    y = Math.min(1, Math.max(0, y));
  }
  return true;
}

// Les n premiers chiffres de x en base 3. Un point de C admet un développement
// sans le chiffre 1 : on le préfère quand il existe (1/3 = 0,0222…₃ plutôt que
// 0,1₃), en arrondissant vers le bas aux bords des tiers.
export function chiffresBase3(x, n) {
  const chiffres = [];
  let y = x;
  for (let k = 0; k < n; k++) {
    let a = Math.min(2, Math.floor(3 * y + 1e-12));
    if (a === 1 && Math.abs(3 * y - 1) < 1e-9) a = 0; // 1/3 → 0,0222…
    chiffres.push(a);
    y = Math.min(1, Math.max(0, 3 * y - a));
  }
  return chiffres;
}

// Aimantation sur les fractions de petit dénominateur (dont les 3^k).
export function aimante(x, tolerance) {
  for (const q of [1, 2, 3, 4, 5, 6, 8, 9, 10, 27]) {
    const p = Math.round(x * q);
    if (Math.abs(x - p / q) < tolerance) return p / q;
  }
  return x;
}

const fraction = (x) => {
  for (let q = 1; q <= 30; q++) {
    const p = Math.round(x * q);
    if (Math.abs(x - p / q) < 1e-12) return q === 1 ? `${p}` : `${p}/${q}`;
  }
  return null;
};

export default {
  etat: { ensemble: 'rationnels', epsilon: 0.3, N: 60, n: 3, x: Math.SQRT1_2 },

  choix: { ensemble: ['rationnels', 'cantor'] },

  termes: ['négligeable', 'mesure de Lebesgue', 'ensemble de Cantor', 'borélien', 'mesure'],

  rappel: [
    'Pour la mesure de Lebesgue, un point a une mesure nulle, donc aussi tout ensemble dénombrable : $\\lambda(\\mathbb Q) = 0$ (Proposition 2.3.7). Avec la définition du chapitre 1 : on recouvre le $k$-ième rationnel par un intervalle de longueur $\\varepsilon\\,2^{-k}$, et la longueur totale est au plus',
    '$$\\sum_k \\varepsilon\\,2^{-k} = \\varepsilon.$$',
    'Pourtant $\\mathbb Q$ est dense : tout intervalle en contient. Être négligeable ne veut pas dire être « rare » au sens de la topologie.',
    'La réciproque est fausse : l’ensemble de Cantor $C = \\bigcap_n C_n$ est un borélien de mesure nulle, sans être dénombrable. $C_n$ est la réunion de $2^n$ intervalles fermés de longueur $3^{-n}$, donc (Figure 2.2)',
    '$$\\lambda(C_n) = (2/3)^n \\longrightarrow 0.$$',
    '$C$ est l’ensemble des réels de $[0, 1]$ qui ont un développement en base $3$ sans le chiffre $1$ ; il est en bijection avec les suites de $0$ et de $1$, qui ne sont pas dénombrables.',
  ],

  essais: [
    { texte: 'Les 60 premiers rationnels, recouverts avec $\\varepsilon = 0{,}3$ : la longueur totale est sous $0{,}3$. Zoomez à la molette : il reste des trous partout.', etat: { ensemble: 'rationnels', epsilon: 0.3, N: 60 } },
    { texte: 'Le point $x = 0{,}51$ est couvert par l’intervalle de $q_3 = 1/2$, de longueur $\\varepsilon/8$. Diminuez $\\varepsilon$ depuis $0{,}3$ : pour quelle valeur sort-il ? Cliquez ensuite sur $1/3$ : pourquoi reste-t-il couvert, aussi petit que soit $\\varepsilon$ ?', etat: { ensemble: 'rationnels', epsilon: 0.3, N: 60, x: 0.51 } },
    { texte: 'Les quatre premières étapes de l’ensemble de Cantor (Figure 2.2). Augmentez $n$ : combien d’intervalles, et quelle longueur ?', etat: { ensemble: 'cantor', n: 3, x: 0.5 } },
    { texte: 'Le point $1/4$ : il n’est l’extrémité d’aucun intervalle, et pourtant il reste dans tous les $C_n$. Lisez son développement en base 3.', etat: { ensemble: 'cantor', n: 6, x: 0.25 } },
    { texte: 'Le point $1/3 = 0{,}0222\\ldots_3$ est une extrémité : il reste aussi. Où sort $1/2 = 0{,}111\\ldots_3$ ?', etat: { ensemble: 'cantor', n: 4, x: 1 / 3 } },
  ],

  monte(zone, outils) {
    const r = outils.etat;

    const barre = barreOutils(zone);
    const choix = choixRadios(barre, {
      nom: 'ensemble',
      options: [
        { valeur: 'rationnels', latex: '\\mathbb Q \\cap [0, 1]' },
        { valeur: 'cantor', texte: 'ensemble de Cantor' },
      ],
      change: (valeur) => {
        outils.change({ ensemble: valeur });
        montre();
        dessine();
      },
    });

    const c = carte(zone, '');
    c.classList.add('principale');
    const titre = document.createElement('h2');
    c.prepend(titre);
    boutonInfo(c, [
      ['zone', '--accent', 'ℚ : les intervalles de longueur $\\varepsilon\\,2^{-k}$ ; là où ils se superposent, l’aplat est plus sombre. Cantor : les étapes $C_0, \\dots, C_n$.'],
      ['point', '--accent', 'ℚ : les rationnels $q_1, \\dots, q_N$, au centre de leur intervalle.'],
      ['point', '--perturbation', 'Le point $x$ : cliquez ou faites glisser. Il se colle aux fractions de petit dénominateur.'],
    ]);
    const reglages = document.createElement('div');
    reglages.className = 'champs-ligne';
    c.appendChild(reglages);
    const zoneEps = document.createElement('div');
    const zoneN = document.createElement('div');
    const zoneNC = document.createElement('div');
    reglages.append(zoneEps, zoneN, zoneNC);
    const champEps = champ(zoneEps, { latex: '\\varepsilon', min: 0.01, max: 1, pas: 0.01, valeur: r.epsilon }, (v) => {
      outils.change({ epsilon: Math.min(2, Math.max(0.001, v)) });
      dessine();
    });
    const champN = champ(zoneN, { latex: 'N', min: 1, max: 300, pas: 1, valeur: r.N }, (v) => {
      outils.change({ N: Math.min(2000, Math.max(1, Math.round(v))) });
      dessine();
    });
    const champNC = champ(zoneNC, { latex: 'n', min: 0, max: 10, pas: 1, valeur: r.n }, (v) => {
      outils.change({ n: Math.min(14, Math.max(0, Math.round(v))) });
      dessine();
    });
    const canvas = toile(c, '16 / 6', () => dessine());
    canvas.classList.add('cliquable');
    const rep = new Repere(canvas, { x: [-0.02, 1.02], y: [0, 1], marges: { gauche: 12, bas: 22, haut: 8, droite: 12 } });
    const barreZoom = document.createElement('div');
    barreZoom.className = 'barre-legende';
    c.appendChild(barreZoom);
    barreZoom.appendChild(document.createElement('div'));
    const zoom = zoomable(canvas, rep, {
      barre: barreZoom,
      auto: () => ({ x: [-0.02, 1.02], y: [0, 1] }),
      redessine: () => dessine(),
      deplacer: false,
    });
    const bloc = document.createElement('div');
    bloc.className = 'bloc-maths';
    c.appendChild(bloc);
    const mesures = paragraphe(bloc, '', '');
    const point = paragraphe(bloc, '', 'verdict');

    glisse(canvas, rep, {
      deplace: (x) => {
        const largeur = rep.cadre.x[1] - rep.cadre.x[0];
        outils.change({ x: Number(Math.min(1, Math.max(0, aimante(x, (6 / rep.L) * largeur))).toPrecision(12)) });
        dessine();
      },
    });

    // Les réglages de l'autre ensemble restent en place, grisés.
    function montre() {
      const q = r.ensemble === 'rationnels';
      for (const [el, actif] of [
        [zoneEps, q],
        [zoneN, q],
        [zoneNC, !q],
      ]) {
        el.style.opacity = actif ? 1 : 0.35;
        for (const input of el.querySelectorAll('input, button')) input.disabled = !actif;
      }
    }

    // Calculs gardés : le recouvrement ne dépend que de ε et N.
    let cle = '';
    let couverture = null;

    function dessine() {
      const col = couleurs();
      choix.fixe(r.ensemble);
      champEps.fixe(r.epsilon);
      champN.fixe(r.N);
      champNC.fixe(r.n);
      const cadre = zoom.cadre();
      const x = Math.min(1, Math.max(0, r.x));

      if (r.ensemble === 'rationnels') {
        outils.rendTexte(titre, `Recouvrir $\\mathbb Q \\cap [0, 1]$ par des intervalles de longueur $\\varepsilon\\,2^{-k}$`);
        if (`${r.epsilon}|${r.N}` !== cle) {
          cle = `${r.epsilon}|${r.N}`;
          const rec = recouvrement(r.epsilon, r.N);
          const union = reunion(rec.map((i) => i.intervalle));
          couverture = { rec, union, longueur: union.reduce((s, [u, v]) => s + v - u, 0) };
        }
        rep.fixeCadre(cadre.x, [0, 1]);
        if (rep.prepare()) {
          const ctx = rep.ctx;
          ctx.save();
          rep.decoupe();
          ctx.fillStyle = col.accent;
          ctx.globalAlpha = 0.16;
          for (const { intervalle: [u, v] } of couverture.rec) ctx.fillRect(rep.X(u), rep.Y(0.88), Math.max(0.6, rep.X(v) - rep.X(u)), rep.Y(0.18) - rep.Y(0.88));
          ctx.restore();
          // La réunion, reportée en dessous.
          for (const [u, v] of couverture.union) rep.trace([[u, 0.1], [v, 0.1]], { couleur: col.accent, largeur: 5 });
          rep.axes({ noms: ['', ''], grille: false, ordonnees: false });
          for (const { q } of couverture.rec) rep.point(q, 0.53, { rayon: 1.8, couleur: col.accent });
          rep.texte(cadre.x[0], 0.1, 'réunion', { couleur: col.accent, dx: 4, dy: -8, police: '12px system-ui, sans-serif', fond: true });
        }
        const somme = r.epsilon * (1 - 2 ** -r.N);
        outils.rendTexte(
          mesures,
          `$\\sum_{k=1}^{N} \\varepsilon\\,2^{-k} = ${nb(somme)} \\le \\varepsilon$ ; la réunion, faite de ${couverture.union.length} intervalles disjoints, mesure $${nb(couverture.longueur)}$.`,
        );
        const couvrant = couverture.rec.find(({ intervalle: [u, v] }) => x > u && x < v);
        const f = fraction(x);
        const nomX = f ?? latexNombre(x, 6);
        point.className = `verdict ${couvrant ? 'ok' : ''}`;
        outils.rendTexte(
          point,
          couvrant
            ? `$x = ${nomX}$ est couvert, par l’intervalle de $q_{${couvrant.k}} = ${fraction(couvrant.q)}$.`
            : `$x = ${nomX}$ n’est couvert par aucun des $N$ intervalles${f ? ', bien qu’il soit rationnel : il vient plus loin dans l’énumération' : ''}.`,
        );
      } else {
        const n = Math.min(14, Math.max(0, Math.round(r.n)));
        outils.rendTexte(titre, `Les étapes $C_0, C_1, \\dots, C_{${n}}$ de l’ensemble de Cantor`);
        const premiere = Math.max(0, n - 6);
        const lignes = n - premiere + 1;
        rep.fixeCadre(cadre.x, [0, 1]);
        if (rep.prepare()) {
          rep.axes({ noms: ['', ''], grille: false, ordonnees: false });
          for (let k = premiere; k <= n; k++) {
            const y = 0.92 - ((k - premiere) / Math.max(1, lignes - 1)) * 0.78;
            const morceaux = etapeCantor(k);
            const ctx = rep.ctx;
            ctx.save();
            rep.decoupe();
            ctx.fillStyle = k === n ? col.accent : col.trait;
            ctx.globalAlpha = k === n ? 1 : 0.55;
            for (const [u, v] of morceaux) ctx.fillRect(rep.X(u), rep.Y(y) - 4, Math.max(0.7, rep.X(v) - rep.X(u)), 8);
            ctx.restore();
            rep.texte(cadre.x[0], y, `C${String(k).replace(/\d/g, (d) => '₀₁₂₃₄₅₆₇₈₉'[d])}`, { dx: 2, dy: -8, police: "italic 14px 'Latin Modern Roman', Georgia, serif", fond: true });
          }
        }
        outils.rendTexte(mesures, `$C_{${n}}$ : $2^{${n}} = ${2 ** n}$ intervalles de longueur $3^{-${n}}$, $\\lambda(C_{${n}}) = (2/3)^{${n}} = ${nb((2 / 3) ** n, 4, 1)}$.`);
        const chiffres = chiffresBase3(x, Math.max(n, 1));
        const dans = dansCantor(x, n);
        const f = fraction(x);
        point.className = `verdict ${dans ? 'ok' : 'alerte'}`;
        const sortie = chiffres.findIndex((a) => a === 1);
        outils.rendTexte(
          point,
          `$x = ${f ?? latexNombre(x, 6)} = 0{,}${chiffres.join('')}\\ldots_3$ : ${dans ? `$x \\in C_{${n}}$, ses ${n} premiers chiffres sont des $0$ ou des $2$.` : `$x \\notin C_{${n}}$, il tombe dans un tiers central retiré à l’étape ${sortie + 1}.`}`,
        );
      }
      // Le point x, sur toute la hauteur.
      if (rep.cadre) {
        rep.trace([[x, 0], [x, 1]], { couleur: col.perturbation, largeur: 1.2, tirets: [4, 3] });
        rep.point(x, 0, { rayon: 5, couleur: col.perturbation });
      }
    }

    outils.surTheme(dessine);
    montre();
    dessine();
    return {
      applique() {
        montre();
        dessine();
      },
    };
  },
};
