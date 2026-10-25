// Tests du chapitre 5 (théorèmes limites) : convergence dominée, intégrale à
// paramètre, sinus cardinal.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { C_MAX, N_MAX, SUITES, borneC, enveloppe, integraleDominante, integraleSuite, violations } from '../js/illustrations/convergence-dominee.js';

const proche = (a, b, tol = 1e-6) => assert.ok(Math.abs(a - b) <= tol, `${a} ≠ ${b}`);

test('convergence dominée : les limites du TD3, exercice 5', () => {
  // ∫ |cos x|^{1/n} e^{−x} → 1 et ∫ (1 − x/n)^n cos x 𝟙_{[0,n]} → 1/2 (intervalle tronqué à 8).
  proche(integraleSuite('cos', 30), 1, 0.03);
  proche(integraleSuite('expcos', 30), 0.5, 0.02);
  // Masse concentrée et bosse qui s'échappe : ∫ f_n = 1.
  proche(integraleSuite('concentre', 7), 1, 1e-6);
  proche(integraleSuite('echappe', 7), 1, 1e-6);
  // Domination du TD3 : |f_n| ≤ e^{−x}.
  for (const n of [1, 3, 10, 30]) for (const x of [0, 0.5, 2, 5]) assert.ok(Math.abs(SUITES.expcos.f(n, x)) <= Math.exp(-x) + 1e-12);
});

test('convergence dominée : l’enveloppe se stabilise ou non', () => {
  const stable = enveloppe('cos', 30).integrale - enveloppe('cos', 15).integrale;
  assert.ok(stable < 0.03);
  // Masse concentrée : ∫ G_N croît comme ln N.
  const croit = enveloppe('concentre', 30).integrale - enveloppe('concentre', 15).integrale;
  assert.ok(croit > 0.5);
  // Bosse qui s'échappe : ∫ G_N = N.
  proche(enveloppe('echappe', 10).integrale, 10, 0.05);
});

test('convergence dominée : dominantes proposées', () => {
  assert.equal(integraleDominante(1, 1), Infinity);
  proche(integraleDominante(1.5, 2), 1.5);
  // e^{−x}(1 + x)² ≤ 4/e : C = 1,5 et α = 2 dominent la suite du TD3, C = 1 non.
  assert.equal(violations('expcos', 30, 1.5, 2).length, 0);
  assert.ok(violations('expcos', 30, 1, 2).length > 0);
  // Aucune dominante bornée près de 0 pour la masse concentrée.
  assert.ok(violations('concentre', 30, 10, 0).length > 0);
});

test('convergence dominée : aucune dominante intégrable permise ne passe pour les suites sans dominante', () => {
  // Le verdict ne teste que f_1, …, f_{N_MAX} : il faut que, sur toute la plage
  // des réglages, il ne puisse pas dire « le théorème s'applique » à tort. Une
  // dominante plus grande domine mieux : C = C_MAX est le pire cas.
  assert.equal(borneC(1000), C_MAX);
  for (const nom of ['concentre', 'echappe', 'td2'])
    for (let alpha = 1.05; alpha <= 4; alpha += 0.05) assert.ok(violations(nom, N_MAX, C_MAX, alpha).length > 0, `${nom}, α = ${alpha}`);
});

import { LIMITE, enT } from '../js/illustrations/sinus-cardinal.js';

test('sinus cardinal : semi-convergente, f⁺ et f⁻ d’intégrales infinies (Exemple 5.2.2)', () => {
  // ∫₁ᵗ sin x/x = cos 1 − cos t / t − ∫₁ᵗ cos x / x² : à t = 200, à O(1/t) de la limite.
  assert.ok(Math.abs(enT(200).I - LIMITE) < 1 / 200 + 1e-4);
  // Si(1) ≈ 0,946083 : ∫₁^{π} sin x / x = Si(π) − Si(1) ≈ 1,851937 − 0,946083.
  proche(enT(Math.PI).I, 1.851937052 - 0.946083070, 1e-6);
  // Minoration du poly : ∫_{kπ}^{(k+1)π} |sin x|/x ≥ 2/((k+1)π), d'où une croissance au moins logarithmique.
  for (const k of [1, 5, 20]) {
    const a = enT((k + 1) * Math.PI);
    const b = enT(k * Math.PI);
    assert.ok(a.P + a.M - (b.P + b.M) >= 2 / ((k + 1) * Math.PI) - 1e-6);
  }
  assert.ok(enT(200).P > 1.4 && enT(200).M > 0.8);
});

import { F, Fprime, seuilViolation } from '../js/illustrations/parametre.js';

test('intégrale à paramètre : F(t) = ∫ e^{−tx}/(1 + x²) (TD4, exercices 1 et 2)', () => {
  proche(F(0), Math.PI / 2, 1e-6);
  // F décroît vers 0, F' < 0 et F'(t) → −∞ en 0⁺ (comme ln t).
  assert.ok(F(1) < F(0.5) && F(4) < 0.3);
  assert.ok(Fprime(1) < 0 && Fprime(0.01) < -4 && Fprime(0.001) < Fprime(0.01));
  // Différence finie : F' est bien la dérivée de F.
  proche((F(1.001) - F(0.999)) / 0.002, Fprime(1), 1e-4);
  // Pour t < a, x e^{−tx}/(1 + x²) dépasse x e^{−ax} au-delà du seuil, pas avant.
  const x = seuilViolation(0.3, 0.5);
  const d = (u, t) => (u * Math.exp(-t * u)) / (1 + u * u);
  assert.ok(d(x * 1.01, 0.3) > x * 1.01 * Math.exp(-0.5 * x * 1.01));
  assert.ok(d(x * 0.99, 0.3) < x * 0.99 * Math.exp(-0.5 * x * 0.99));
  assert.equal(seuilViolation(1, 0.5), Infinity);
});
