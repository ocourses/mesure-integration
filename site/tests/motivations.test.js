// Tests du chapitre 1 (Motivations) : les valeurs affichées par « Riemann
// contre Lebesgue », vérifiées contre la Figure 1.2 du poly.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { integrale, intervallesOu, longueur } from '../js/illustrations/fonctions.js';
import { ABSCISSES_LIBRES, darboux, integraleExacte, interpolation, lisPoints, niveaux, sommeLebesgue } from '../js/illustrations/riemann-lebesgue.js';

const proche = (a, b, tol = 1e-6) => assert.ok(Math.abs(a - b) <= tol, `${a} ≠ ${b}`);

test('fonctions : intégrales et ensembles de niveau', () => {
  proche(integrale(Math.sin, 0, Math.PI), 2, 1e-8);
  // Une fonction en escalier : Simpson par morceaux, coupé au saut.
  proche(integrale((x) => (x < 0.3 ? 1 : 2), 0, 1, 10, [0.3]), 0.3 + 1.4, 1e-12);
  const I = intervallesOu((x) => x * x, (y) => y >= 0.25 && y < 1, -2, 2, { seuils: [0.25, 1] });
  assert.equal(I.length, 2);
  proche(longueur(I), 1, 1e-9);
});

test('Riemann contre Lebesgue : la bande [2,5 ; 3[ de la Figure 1.2', () => {
  const bandes = niveaux('sinus', '', 0.5);
  const A5 = bandes[5];
  proche(A5.y, 2.5);
  assert.equal(A5.intervalles.length, 2);
  // [asin(1/3), asin(2/3)[ ∪ ]π − asin(2/3), π − asin(1/3)]
  const [u, v] = [Math.asin(1 / 3), Math.asin(2 / 3)];
  proche(A5.intervalles[0][0], u, 1e-6);
  proche(A5.intervalles[0][1], v, 1e-6);
  proche(A5.intervalles[1][0], Math.PI - v, 1e-6);
  proche(A5.mesure, 2 * (v - u), 1e-6);
});

test('Riemann contre Lebesgue : 0 ≤ ∫f − ∫φ ≤ h(b − a)', () => {
  for (const nom of ['sinus', 'discontinue', 'libre']) {
    for (const h of [0.5, 0.2, 0.05]) {
      const exacte = integraleExacte(nom, '1,2,3,2,1,0.5,2');
      const L = sommeLebesgue(niveaux(nom, '1,2,3,2,1,0.5,2', h));
      const [a, b] = nom === 'discontinue' ? [1, 9] : [0, 6];
      assert.ok(L <= exacte + 1e-6 && exacte - L <= h * (b - a), `${nom}, h = ${h}`);
    }
  }
  // Exacte : ∫₀⁶ 2 + 1,5 sin x dx = 12 + 1,5 (1 − cos 6).
  proche(integraleExacte('sinus', ''), 12 + 1.5 * (1 - Math.cos(6)), 1e-8);
});

test('Riemann contre Lebesgue : sommes de Darboux', () => {
  // Dirichlet : 0 et 1 pour toute subdivision.
  for (const n of [1, 7, 60]) {
    const d = darboux('dirichlet', '', n);
    assert.equal(d.inf, 0);
    proche(d.sup, 1, 1e-12);
  }
  // Fonction continue : l'écart tend vers 0 comme 1/n.
  const e = (n) => {
    const d = darboux('sinus', '', n);
    return d.sup - d.inf;
  };
  assert.ok(e(40) < e(10) / 3);
  // Encadrement de l'intégrale.
  const d = darboux('discontinue', '', 30);
  const I = integraleExacte('discontinue', '');
  assert.ok(d.inf <= I && I <= d.sup);
  // Dirichlet par Lebesgue : 0 ; la bande de la valeur 1 a pour A_k ℚ ∩ [0, 1].
  const bandes = niveaux('dirichlet', '', 0.25);
  assert.equal(sommeLebesgue(bandes), 0);
  assert.ok(bandes[4].rationnels && bandes[4].mesure === 0);
});

test('Riemann contre Lebesgue : la fonction à main levée passe par ses points et reste positive', () => {
  const ys = lisPoints('1.2,3.4,1,3,0.6,2.6,1.6');
  const f = interpolation(ABSCISSES_LIBRES, ys);
  ABSCISSES_LIBRES.forEach((x, i) => proche(f(x), ys[i], 1e-12));
  for (let x = 0; x <= 6; x += 0.01) assert.ok(f(x) >= -1e-12);
  // Une lecture impossible redonne les points par défaut ; les valeurs sont bornées.
  assert.deepEqual(lisPoints('abc'), lisPoints('1.2,3.4,1,3,0.6,2.6,1.6'));
  assert.equal(lisPoints('-1,9,1,1,1,1,1')[0], 0);
});

import { SUITES, aimante, ordreRationnels, rang, rationnels } from '../js/illustrations/suites-trompeuses.js';

test('Des suites qui trompent : les intégrales affichées sont celles des fonctions tracées', () => {
  for (const nom of ['concentre', 'echappe', 'racine']) {
    const S = SUITES[nom];
    const [a, b] = S.intervalle();
    for (const n of [1, 3, 10]) {
      // x^{-1/2} est intégrable mais non bornée : on intègre f_n en coupant à 1/n².
      const coupures = nom === 'racine' ? [1 / (n * n)] : S.sauts(n);
      proche(integrale((x) => S.f(n, x), a, b, 4000, coupures), S.integrale(n), 1e-6);
    }
    // Convergence simple vers la limite, en quelques points.
    for (const x of [0.05, 0.4, 0.9, 7.5]) {
      if (x > b) continue;
      proche(S.f(10000, x), S.limite(x), 1e-12);
    }
  }
  proche(2 - 1 / 4, SUITES.racine.integrale(4));
});

test('Des suites qui trompent : énumération de ℚ ∩ [0, 1]', () => {
  assert.deepEqual(rationnels(7), [0, 1, 1 / 2, 1 / 3, 2 / 3, 1 / 4, 3 / 4]);
  assert.equal(new Set(rationnels(200)).size, 200);
  assert.equal(rang(1 / 3), 4);
  assert.equal(rang(0), 1);
  assert.equal(rang(Math.SQRT1_2), Infinity);
  // f_n(1/3) vaut 1 à partir de n = 4, et la limite est 1 ; en √2/2, tout est nul.
  assert.equal(SUITES.rationnels.f(3, 1 / 3), 0);
  assert.equal(SUITES.rationnels.f(4, 1 / 3), 1);
  assert.equal(SUITES.rationnels.limite(Math.SQRT1_2), 0);
  // Aimantation exacte sur 1/3, rien loin des petites fractions.
  assert.equal(aimante(0.3335, 0.01), 1 / 3);
  assert.equal(aimante(0.4141, 0.001), 0.4141);
});

test('suites trompeuses : l’ordre expliqué dans la bulle est celui de l’énumération', () => {
  // La bulle range par dénominateur : 0 ; 1 ; 1/2 ; 1/3 2/3 ; 1/4 3/4 ; 1/5 2/5 3/5 4/5 ; 1/6 5/6.
  const lignes = ordreRationnels(6);
  assert.deepEqual(lignes.map((l) => l.termes.length), [2, 1, 2, 2, 4, 2]);
  const aPlat = lignes.flatMap(({ q, termes }) => termes.map(({ p, k }) => ({ valeur: p / q, k })));
  // Chaque rang k affiché est bien celui de la fraction dans rationnels(), et ils se suivent sans trou.
  const liste = rationnels(aPlat.length);
  aPlat.forEach(({ valeur, k }, i) => {
    assert.equal(k, i + 1);
    assert.equal(liste[k - 1], valeur);
  });
  // Les rangs écrits dans la bulle sont ceux que rang() renvoie pour la fraction.
  assert.equal(rang(3 / 4), 7);
  assert.equal(lignes[3].termes[1].k, 7);
});

test('suites trompeuses : la dernière valeur de n est celle de la suite', () => {
  // Le curseur suit nMax de la suite choisie : la bosse s'arrête à 20, pas à 40.
  assert.deepEqual(Object.fromEntries(Object.entries(SUITES).map(([nom, S]) => [nom, S.nMax])), { concentre: 40, echappe: 20, rationnels: 40, racine: 30 });
  // À n = nMax, la bosse [n, n + 1] reste dans la fenêtre de la figure.
  const [, b] = SUITES.echappe.intervalle();
  assert.ok(SUITES.echappe.nMax + 1 <= b);
});
