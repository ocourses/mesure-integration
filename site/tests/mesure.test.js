// Tests du chapitre 2 (Théorie de la mesure) : atomes d'une tribu engendrée,
// mesurabilité, mesures sur ℝ et ensembles négligeables.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import module, { atomes, atomesFautifs, elements, imagesReciproques, lisValeurs } from '../js/illustrations/tribu-finie.js';

test('tribu sur un ensemble fini : σ({A}) a deux atomes, A et Aᶜ (Exemple 2.1.2)', () => {
  const A = 0b00000111;
  assert.deepEqual(elements(A), [1, 2, 3]);
  assert.deepEqual(atomes([A, 0, 0]), [[1, 2, 3], [4, 5, 6, 7, 8]]);
  // Tribu grossière : un seul atome, E.
  assert.deepEqual(atomes([0, 0, 0]), [[1, 2, 3, 4, 5, 6, 7, 8]]);
  // Deux parties qui se chevauchent : quatre atomes.
  assert.equal(atomes([0b00001111, 0b00111100, 0]).length, 4);
});

test('tribu sur un ensemble fini : l’essai « tribu discrète » sépare les huit points', () => {
  const essai = module.essais.find((e) => e.texte.includes('tribu discrète'));
  const { c1, c2, c3 } = essai.etat;
  assert.equal(atomes([c1, c2, c3]).length, 8);
});

test('tribu sur un ensemble fini : f est mesurable si et seulement si elle est constante sur les atomes', () => {
  const classes = atomes([0b00000111, 0b00111100, 0]);
  assert.deepEqual(atomesFautifs(lisValeurs('1,1,2.5,2.5,2.5,0.5,0.5,3'), classes).map((a) => a.join()), ['4,5,6', '7,8']);
  assert.deepEqual(atomesFautifs(lisValeurs('1,1,2.5,0.5,0.5,0.5,3,3'), classes), []);
  // Les images réciproques d'une fonction mesurable sont des réunions d'atomes.
  const v = lisValeurs('1,1,2.5,0.5,0.5,0.5,1,1');
  for (const [, pre] of imagesReciproques(v)) {
    for (const a of classes) assert.ok(a.every((x) => pre.includes(x)) || a.every((x) => !pre.includes(x)));
  }
  // Les essais qui annoncent une fonction mesurable ou non disent vrai.
  const nonMesurable = module.essais.find((e) => e.texte.startsWith('$f$ n’est pas mesurable'));
  const { c1, c2, c3, f } = nonMesurable.etat;
  assert.ok(atomesFautifs(lisValeurs(f), atomes([c1, c2, c3])).length > 0);
});

import rep, { BORNES, aimanteBorne, binomiale, ecritAtomes, lisAtomes, masseTotale, mesureIntervalle, repartition } from '../js/illustrations/repartition.js';

const proche = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `${a} ≠ ${b}`);

test('mesure sur ℝ : la fonction de répartition de δ₀ est la fonction de Heaviside', () => {
  const d = lisAtomes('0:1');
  assert.equal(repartition(d, 'aucune', 0, -1e-9).F, 0);
  assert.equal(repartition(d, 'aucune', 0, 0).F, 1);
  assert.equal(repartition(d, 'aucune', 0, 0).gauche, 0);
  assert.equal(repartition(d, 'aucune', 0, 0).saut, 1);
});

test('mesure sur ℝ : μ(]u, v]) = F(v) − F(u), atomes et densités', () => {
  const as = lisAtomes('0:0.5;2:0.25');
  // La masse en u n'est pas comptée, celle en v l'est.
  proche(mesureIntervalle(as, 'aucune', 0, 0, 2), 0.25);
  proche(mesureIntervalle(as, 'aucune', 0, -1, 0), 0.5);
  // Densité uniforme m/2 sur [−1, 1] et exponentielle m e^{−x}.
  proche(mesureIntervalle([], 'uniforme', 1, -0.5, 0.5), 0.5);
  proche(mesureIntervalle([], 'exponentielle', 1, 0, 1), 1 - Math.exp(-1));
  // Les essais par défaut forment une probabilité.
  proche(masseTotale(as, 'uniforme', 0.25), 1);
  proche(masseTotale(lisAtomes(rep.essais[3].etat.atomes), 'uniforme', 0.25), 0.75);
});

test('mesure sur ℝ : loi binomiale 𝓑(4, 1/2), sauts 1, 4, 6, 4, 1 seizièmes', () => {
  const b = binomiale(4, 0.5);
  assert.deepEqual(b.map((a) => a.p * 16), [1, 4, 6, 4, 1]);
  const lus = lisAtomes(ecritAtomes(b));
  proche(masseTotale(lus, 'aucune', 0), 1);
  proche(repartition(lus, 'aucune', 0, 2).F, 11 / 16);
});

test('mesure sur ℝ : lecture des masses et aimantation des bornes', () => {
  assert.deepEqual(lisAtomes('1:0.5;1:0.2;x:1;-9:1;2:-1;3:0.1'), [{ x: 1, p: 0.5 }, { x: 3, p: 0.1 }]);
  assert.equal(aimanteBorne(1.97, lisAtomes('2:1'), 0.05), 2);
  assert.equal(aimanteBorne(0.51, [], 0.05), 0.51);
  assert.ok(BORNES[0] < 0 && BORNES[1] > 4);
});

import { aimante as aimanteNeg, chiffresBase3, dansCantor, etapeCantor, recouvrement, reunion } from '../js/illustrations/negligeables.js';

test('négligeables : le recouvrement de ℚ ∩ [0, 1] a une longueur totale ≤ ε', () => {
  for (const [eps, N] of [[0.3, 60], [0.05, 300], [1, 10]]) {
    const rec = recouvrement(eps, N);
    const somme = rec.reduce((s, { intervalle: [u, v] }) => s + v - u, 0);
    proche(somme, eps * (1 - 2 ** -N), 1e-12);
    const union = reunion(rec.map((i) => i.intervalle));
    const l = union.reduce((s, [u, v]) => s + v - u, 0);
    assert.ok(l <= somme + 1e-12);
    // Chaque rationnel est au centre de son intervalle (pour k grand, la
    // longueur ε 2^{−k} se perd dans l'arrondi : l'intervalle se réduit à q).
    for (const { q, intervalle: [u, v] } of rec) assert.ok(u <= q && q <= v);
  }
  assert.deepEqual(reunion([[0, 1], [0.5, 2], [3, 4]]), [[0, 2], [3, 4]]);
});

test('négligeables : l’ensemble de Cantor (Figure 2.2 et exercice du poly)', () => {
  for (const n of [0, 1, 3, 8]) {
    const C = etapeCantor(n);
    assert.equal(C.length, 2 ** n);
    proche(C.reduce((s, [u, v]) => s + v - u, 0), (2 / 3) ** n, 1e-12);
  }
  assert.deepEqual(etapeCantor(2).map(([u, v]) => [u * 9, v * 9].map(Math.round)), [[0, 1], [2, 3], [6, 7], [8, 9]]);
  // 1/4 = 0,0202…₃ reste dans tous les C_n ; 1/2 sort dès C₁ ; 1/3 est une extrémité.
  assert.ok(dansCantor(0.25, 12));
  assert.deepEqual(chiffresBase3(0.25, 6), [0, 2, 0, 2, 0, 2]);
  assert.ok(!dansCantor(0.5, 1));
  assert.ok(dansCantor(1 / 3, 10));
  assert.deepEqual(chiffresBase3(1 / 3, 4), [0, 2, 2, 2]);
  assert.equal(aimanteNeg(0.2502, 0.001), 0.25);
});
