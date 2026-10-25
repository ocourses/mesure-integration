// Tests du chapitre 6 (produits) : Fubini par tranches et coordonnées polaires.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { FONCTIONS } from '../js/illustrations/fubini.js';
import { integrale } from '../js/illustrations/fonctions.js';

const proche = (a, b, tol = 1e-6) => assert.ok(Math.abs(a - b) <= tol, `${a} ≠ ${b}`);

test('Fubini : les tranches φ et ψ sont les intégrales de f le long des tranches', () => {
  for (const nom of ['triangle', 'contre']) {
    const F = FONCTIONS[nom];
    for (const s of [0.2, 0.5, 0.8]) {
      const coupure = nom === 'triangle' ? [1 - s] : [];
      proche(integrale((y) => F.f(s, y), 0, 1, 4000, coupure), F.phi(s), 1e-6);
      proche(integrale((x) => F.f(x, s), 0, 1, 4000, coupure), F.psi(s), 1e-6);
    }
    proche(integrale(F.phi, 0, 1, 2000), F.totalPhi, 1e-8);
    proche(integrale(F.psi, 0, 1, 2000), F.totalPsi, 1e-8);
  }
  // L'exemple du poly : 1 − 2/e ; le contre-exemple : π/4 et −π/4.
  proche(FONCTIONS.triangle.totalPhi, 1 - 2 / Math.E, 1e-15);
  proche(FONCTIONS.contre.totalPhi, -FONCTIONS.contre.totalPsi, 1e-15);
});

test('Fubini : TD4, exercice 3, les deux ordres donnent π²/2', () => {
  const F = FONCTIONS.td4;
  // ψ(y) = ∫ dx/(1 + x²y) / (1 + y) = π/(2√y (1 + y)), par x = tan θ / √y.
  for (const y of [0.5, 1, 3]) proche(integrale((th) => F.f(Math.tan(th) / Math.sqrt(y), y) / (Math.sqrt(y) * Math.cos(th) ** 2), 0, Math.PI / 2 - 1e-9, 2000), F.psi(y), 1e-6);
  // φ(x) = 2 ln x/(x² − 1), par y = tan² θ.
  for (const x of [0.5, 2]) proche(integrale((th) => F.f(x, Math.tan(th) ** 2) * 2 * Math.tan(th) / Math.cos(th) ** 2, 0, Math.PI / 2 - 1e-7, 20000), F.phi(x), 1e-4);
  // ∫ ψ = π²/2, par y = tan² θ.
  proche(integrale((th) => F.psi(Math.tan(th) ** 2) * 2 * Math.tan(th) / Math.cos(th) ** 2, 1e-9, Math.PI / 2 - 1e-9, 2000), (Math.PI * Math.PI) / 2, 1e-5);
});

import { R_MAX, aireImage, borne } from '../js/illustrations/polaires.js';

test('coordonnées polaires : l’aire de l’image est ρ̄ dρ dθ', () => {
  for (const [rho, dr, dt] of [[1.2, 0.3, 0.3], [0, 0.3, 0.6], [2, 0.01, 0.01]]) {
    proche(aireImage(rho, dr, dt), (rho + dr / 2) * dr * dt, 1e-12);
  }
  // Par Fubini-Tonelli en (ρ, θ) : l'aire du quart de disque de rayon R est πR²/4.
  proche(aireImage(0, 2, Math.PI / 2), Math.PI, 1e-12);
  // Intégrale de Gauss : ∫₀^∞ ρ e^{−ρ²} dρ = 1/2, donc I² = π/4.
  proche(integrale((u) => u * Math.exp(-u * u), 0, 10, 4000) * (Math.PI / 2), Math.PI / 4, 1e-8);
  proche((2 * integrale((x) => Math.exp(-x * x), 0, 10, 4000)) ** 2, Math.PI, 1e-8);
  // Le rectangle reste dans ]0, R] × ]0, π/2[.
  assert.deepEqual(borne(3, 2, 0.3, 0.3), { rho: R_MAX - 0.3, theta: Math.PI / 2 - 0.3 });
});
