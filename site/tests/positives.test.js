// Tests du chapitre 3 (fonctions mesurables positives) : la suite du
// Théorème 3.2.1, ses intégrales (Beppo-Levi) et la mesure de comptage.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { FONCTIONS, etagee, integraleEtagee, survieEchantillonnee } from '../js/illustrations/etagees.js';
import { integrale } from '../js/illustrations/fonctions.js';

const proche = (a, b, tol = 1e-6) => assert.ok(Math.abs(a - b) <= tol, `${a} ≠ ${b}`);

test('étagées : la suite du Théorème 3.2.1 croît vers f et reste sous f', () => {
  assert.equal(etagee(2, 0), 0);
  assert.equal(etagee(2, 5), 2);
  assert.equal(etagee(2, Infinity), 2);
  // k/2^n < f ≤ (k+1)/2^n : en f = 1/2 exactement, f_1 vaut 0 (intervalle ouvert à gauche).
  assert.equal(etagee(1, 0.5), 0);
  assert.equal(etagee(1, 0.51), 0.5);
  for (const y of [0.1, 0.77, 1, 2.5, 7.3]) {
    for (let n = 0; n < 10; n++) {
      assert.ok(etagee(n, y) <= etagee(n + 1, y) && etagee(n + 1, y) <= y);
      if (y <= n) assert.ok(y - etagee(n, y) <= 2 ** -n);
    }
  }
});

test('étagées : ∫ f_n par la fonction de survie, et Beppo-Levi', () => {
  // L'intégrale calculée par niveaux est celle de la fonction tracée.
  for (const nom of ['log', 'racine', 'inverse']) {
    const { f, intervalle: [a, b] } = FONCTIONS[nom];
    for (const n of [1, 3]) {
      const coupures = Array.from({ length: n * 2 ** n }, (_, j) => j + 1).flatMap((j) => {
        const y = j / 2 ** n;
        return nom === 'log' ? [Math.exp(-y / 4), Math.exp(y / 4)] : nom === 'racine' ? [1 / (y * y)] : [1 / y];
      });
      proche(integraleEtagee(nom, n), integrale((x) => etagee(n, f(x)), a, b, 40, coupures), 1e-6);
    }
  }
  // Croissance vers ∫ f : 8 pour 4|ln x| sur [0, e], 2 pour x^{−1/2}, +∞ pour 1/x.
  for (const nom of ['log', 'racine', 'inverse', 'sinus']) {
    const I = Array.from({ length: 9 }, (_, n) => integraleEtagee(nom, n));
    for (let n = 0; n < 8; n++) assert.ok(I[n] <= I[n + 1] + 1e-9, nom);
    assert.ok(I[8] <= FONCTIONS[nom].integrale + 1e-3, nom);
  }
  // Écart en n = 8 : ∫(f − 8)⁺ = 4e^{−2} près de 0, plus au plus e·2^{−8}.
  const ecart = FONCTIONS.log.integrale - integraleEtagee('log', 8);
  assert.ok(ecart >= 4 * Math.exp(-2) - 1e-6 && ecart <= 4 * Math.exp(-2) + Math.E / 256);
  assert.ok(integraleEtagee('inverse', 8) > 1 + Math.log(8) - 0.1);
  // Survie estimée sur échantillons : λ({x² > 1/4}) sur [0, 1] = 1/2.
  proche(survieEchantillonnee((x) => x * x, 0, 1)(0.25), 0.5, 1e-3);
});

import page, { SERIES, issueProcede, reordonne, sommesParties } from '../js/illustrations/series.js';

test('séries : le procédé de Riemann atteint toute cible pour la série harmonique alternée', () => {
  for (const c of [1.5, -1, 0.2, 2]) {
    const { sommes, indices, positifs, negatifs } = reordonne('harmonique', c, 20000);
    proche(sommes[sommes.length - 1], c, 2e-3);
    // Chaque indice apparaît au plus une fois, et les deux signes progressent.
    assert.equal(new Set(indices).size, indices.length);
    assert.ok(positifs > 100 && negatifs > 100);
  }
  // L'ordre naturel donne ln 2.
  let s = 0;
  for (let n = 0; n < 200000; n++) s += SERIES.harmonique.u(n);
  proche(s, Math.LN2, 1e-5);
});

test('séries : pour une série absolument convergente, le procédé reste bloqué', () => {
  const { negatifs, sommes } = reordonne('carres', 1.5, 2000);
  assert.equal(negatifs, 0);
  // Il n'utilise que les positifs, dont la somme est π²/8 < 1,5.
  proche(sommes[sommes.length - 1], (Math.PI * Math.PI) / 8, 1e-3);
  const { plus, moins } = sommesParties('carres', 100000);
  proche(plus[100000] - moins[100000], (Math.PI * Math.PI) / 12, 1e-8);
  // Pour la série harmonique, les deux sommes divergent comme ½ ln N.
  const h = sommesParties('harmonique', 100000);
  assert.ok(h.plus[100000] > 0.5 * Math.log(100000) && h.moins[100000] > 0.5 * Math.log(100000) - 1);
});

test('séries : le verdict suit le théorème, pas les K premiers termes', () => {
  // Loin de ln 2, les termes d'un signe sont rares parmi les K premiers, mais
  // le procédé converge quand même : le verdict ne doit pas dire « bloqué ».
  for (let c = -1.8; c <= 2.5; c += 0.1) assert.equal(issueProcede('harmonique', c), 'converge');
  for (const c of [-0.3, 0.2, 1, 1.5]) {
    assert.equal(issueProcede('carres', c), 'bloque');
    // À la limite, il ne reste qu'un signe : un seul terme de l'autre au plus.
    const { positifs, negatifs } = reordonne('carres', c, 20000);
    assert.ok(Math.min(positifs, negatifs) <= 1);
  }
  // Les essais : les deux premiers convergent, le troisième reste bloqué.
  assert.deepEqual(page.essais.map(({ etat }) => issueProcede(etat.serie, etat.c)), ['converge', 'converge', 'bloque']);
});

import { CONSTANTE_MOINS, CONSTANTE_PLUS } from '../js/illustrations/series.js';

test('série harmonique alternée : ½ ln N + constante est l’équivalent de chaque somme', () => {
  const N = 200000;
  const { plus, moins } = sommesParties('harmonique', N);
  proche(plus[N] - 0.5 * Math.log(N), CONSTANTE_PLUS, 1e-4);
  proche(moins[N] - 0.5 * Math.log(N), CONSTANTE_MOINS, 1e-4);
});
