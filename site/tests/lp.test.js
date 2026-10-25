// Tests du chapitre 4 (espaces de Lebesgue) : x^{−a} dans L^p, boules unités
// et modes de convergence.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { exposantsPermis, integralePuissance, pointDuPlan, produit } from '../js/illustrations/puissances-lp.js';
import { integrale } from '../js/illustrations/fonctions.js';

const proche = (a, b, tol = 1e-6) => assert.ok(Math.abs(a - b) <= tol, `${a} ≠ ${b}`);

test('x^{−a} dans L^p : intégrales et frontière ap = 1', () => {
  // Exemple 4.4.1 : 1/x sur [1, +∞[ est dans L^p pour p > 1, pas dans L^1.
  assert.equal(integralePuissance('infini', 1), Infinity);
  proche(integralePuissance('infini', 1.5), 2);
  proche(integralePuissance('zero', 0.5), 2);
  assert.equal(integralePuissance('zero', 1), Infinity);
  assert.equal(integralePuissance('tout', 0.7), Infinity);
  // Contrôle numérique de ∫₁⁸ x^{−1,5} = 2(1 − 8^{−1/2}).
  proche(integrale((x) => x ** -1.5, 1, 8, 2000), 2 * (1 - 8 ** -0.5), 1e-8);
  assert.deepEqual(exposantsPermis('zero', 0.5), { min: 0, max: 2 });
  assert.deepEqual(exposantsPermis('infini', 2), { min: 0.5, max: Infinity });
  assert.equal(exposantsPermis('tout', 1), null);
});

test('x^{−a} dans L^p : le point collé à l’hyperbole vérifie ap = 1 exactement', () => {
  for (const a of [0.5, 1, 1.25, 2, 2.5]) {
    const q = pointDuPlan(a + 0.003, 1 / a + 0.01, 0.05, 0.05);
    assert.equal(q.a * q.p, 1);
  }
  // Loin de l'hyperbole, le point suit la grille de pas 0,05.
  assert.deepEqual(pointDuPlan(1.02, 3.01, 0.05, 0.05), { a: 1, p: 3 });
});

import { bordBoule, defaut, norme } from '../js/illustrations/boules-lp.js';

test('boules : le contre-exemple du poly, ‖f‖_p + ‖g‖_p = 2^{1−1/p} < 1 = ‖f + g‖_p pour p < 1', () => {
  for (const p of [0.3, 0.5, 0.9]) {
    proche(norme([1, 0], p), 2 ** (-1 / p), 1e-12);
    proche(norme([1, 1], p), 1, 1e-12);
    proche(-defaut([1, 0], [0, 1], p), 2 ** (1 - 1 / p) - 1, 1e-12);
    assert.ok(defaut([1, 0], [0, 1], p) > 0);
  }
  // Minkowski pour p ≥ 1, sur des vecteurs quelconques.
  for (const p of [1, 1.5, 2, 8, Infinity]) {
    for (const [f, g] of [[[1, 0.5], [0.5, 1]], [[-1, 2], [3, -0.2]], [[0.3, 0.3], [0.7, -1]]]) assert.ok(defaut(f, g, p) <= 1e-12);
  }
  // Le bord de la boule est bien { ‖h‖_p = 1 }.
  for (const p of [0.5, 2]) for (const h of bordBoule(p, 36)) proche(norme(h, p), 1, 1e-9);
});

import { SUITES as MODES_SUITES, decompose, indicesSousSuite } from '../js/illustrations/modes-convergence.js';

test('modes de convergence : la machine à écrire (Exemple A.3.1)', () => {
  assert.deepEqual(decompose(1), { m: 0, k: 0 });
  assert.deepEqual(decompose(13), { m: 3, k: 5 });
  const M = MODES_SUITES.machine;
  // Pour tout x et tout balayage m ≥ 2, f_n(x) vaut 1 pour un n et 0 pour un autre.
  for (const x of [0, 0.3, 0.5, Math.SQRT1_2, 1]) {
    for (let m = 2; m <= 6; m++) {
      const v = Array.from({ length: 2 ** m }, (_, k) => M.f(2 ** m + k, x));
      assert.ok(v.includes(1) && v.includes(0), `x = ${x}, m = ${m}`);
    }
  }
  // ‖f_n‖₁ = 2^{−m}, et la sous-suite f_{2^m} = 𝟙_{[0, 2^{−m}]} tend vers 0 pour x > 0.
  assert.equal(M.norme1(13), 1 / 8);
  assert.deepEqual(indicesSousSuite('machine'), [1, 2, 4, 8, 16, 32, 64]);
  assert.equal(M.f(64, 0.3), 0);
  assert.equal(M.f(64, 0), 1);
  // x^n : ‖x^n‖₁ = 1/(n + 1), et 1^n = 1.
  assert.equal(MODES_SUITES.puissance.norme1(4), 1 / 5);
  assert.equal(MODES_SUITES.puissance.f(50, 1), 1);
});

test('puissances : un point aimanté sur l’hyperbole est sur la frontière', () => {
  // a · (1/a) ≠ 1 en virgule flottante pour a = 0,95, 1,85, 1,9 : la page
  // affichait alors x^{−a} ∈ L^p sur ]0, 1], avec une intégrale de 10^16.
  for (let i = 1; i <= 60; i++) {
    const { a, p } = pointDuPlan(i / 20, 20 / i, 1, 1);
    const s = produit(a, p);
    assert.equal(s, 1);
    assert.equal(integralePuissance('zero', s), Infinity);
    assert.equal(integralePuissance('infini', s), Infinity);
    // Après un passage par l'URL, qui garde 10 chiffres significatifs.
    assert.equal(produit(a, Number(p.toPrecision(10))), 1);
  }
});

import { echelleLog } from '../js/illustrations/modes-convergence.js';

test('échelle logarithmique : cadre, zéros sur une ligne à part, niveau 1 toujours visible', () => {
  const E = echelleLog([1, 0.1, 0.001, 0]);
  assert.equal(E.bas, -3);
  assert.equal(E.haut, 0);
  assert.ok(E.zero < E.bas && E.cadre[0] < E.zero);
  assert.ok(Math.abs(E.y(0.001) + 3) < 1e-12);
  assert.equal(E.y(0), E.zero);
  assert.deepEqual(echelleLog([2, 0.5]).haut, 1);
  assert.equal(echelleLog([0.5, 0.2]).zero, null);
});
