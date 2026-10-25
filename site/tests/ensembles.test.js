// Tests de la brique des ensembles finis (js/illustrations/ensembles.js) :
// images, tribus engendrées, axiomes, tribus image et image réciproque, et le
// lemme de transport, vérifiés exhaustivement sur de petits ensembles.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  atomes,
  atomesDeTribu,
  cardinal,
  complementaire,
  engendree,
  etape,
  familleImage,
  image,
  imageReciproque,
  injective,
  latexPartie,
  lisApplication,
  lisPartition,
  masqueDe,
  NOMS_1,
  plein,
  reunions,
  surjective,
  tribuImage,
  tribuReciproque,
  verifieTribu,
} from '../js/illustrations/ensembles.js';

// Toutes les applications de {0, …, n1 − 1} dans {0, …, n2 − 1}.
function* applications(n1, n2) {
  for (let k = 0; k < n2 ** n1; k++) yield Array.from({ length: n1 }, (_, i) => Math.floor(k / n2 ** i) % n2);
}

test('ensembles : images directes et réciproques', () => {
  const f = [0, 0, 1, 3, 3, 1];
  assert.equal(imageReciproque(f, masqueDe([0, 2])), masqueDe([0, 1]));
  assert.equal(image(f, masqueDe([0, 3])), masqueDe([0, 3]));
  assert.equal(injective(f), false);
  assert.equal(surjective(f, 5), false);
  assert.equal(latexPartie(masqueDe([0, 2]), NOMS_1), '\\{1, 3\\}');
  assert.equal(latexPartie(0, NOMS_1), '\\emptyset');
  assert.deepEqual(lisApplication('9,9', 6, 5, '0,0,1,3,3,1'), f);
});

test('ensembles : formules de Hausdorff, et leurs échecs pour les images directes', () => {
  const n1 = 3;
  const n2 = 3;
  let echecIntersection = false;
  for (const f of applications(n1, n2)) {
    for (let B1 = 0; B1 <= plein(n2); B1++) {
      assert.equal(imageReciproque(f, complementaire(B1, n2)), complementaire(imageReciproque(f, B1), n1));
      for (let B2 = 0; B2 <= plein(n2); B2++) {
        assert.equal(imageReciproque(f, B1 | B2), imageReciproque(f, B1) | imageReciproque(f, B2));
        assert.equal(imageReciproque(f, B1 & B2), imageReciproque(f, B1) & imageReciproque(f, B2));
      }
    }
    for (let A1 = 0; A1 <= plein(n1); A1++)
      for (let A2 = 0; A2 <= plein(n1); A2++) {
        assert.equal(image(f, A1 | A2), image(f, A1) | image(f, A2));
        // f(A₁ ∩ A₂) ⊂ f(A₁) ∩ f(A₂), égalité si f est injective.
        const g = image(f, A1 & A2);
        const d = image(f, A1) & image(f, A2);
        assert.equal(g & ~d, 0);
        if (injective(f)) assert.equal(g, d);
        if (g !== d) echecIntersection = true;
      }
  }
  assert.ok(echecIntersection);
});

test('ensembles : tribu engendrée, atomes et fermeture pas à pas', () => {
  // σ({A}) = {∅, A, Aᶜ, E} (Exemple 2.1.2).
  const A = masqueDe([0, 1, 2]);
  assert.deepEqual(engendree([A], 6), [0, A, complementaire(A, 6), plein(6)].sort((a, b) => a - b));
  // {1, 2, 3, 4} et {3, 4, 5, 6} : trois atomes, {1, 2}, {3, 4} et {5, 6}, et huit éléments.
  const C = [masqueDe([0, 1, 2, 3]), masqueDe([2, 3, 4, 5])];
  assert.equal(atomes(C, 6).length, 3);
  assert.equal(engendree(C, 6).length, 8);
  // La fermeture par complémentaires et réunions atteint σ(𝒞), puis ne bouge plus.
  let famille = C;
  for (let k = 0; k < 6; k++) famille = etape(famille, 6);
  assert.deepEqual(famille, engendree(C, 6));
  assert.deepEqual(etape(famille, 6), famille);
  assert.deepEqual(atomesDeTribu(engendree(C, 6)).sort((a, b) => a - b), atomes(C, 6).sort((a, b) => a - b));
});

test('ensembles : axiomes d’une tribu, et la réunion de deux tribus', () => {
  const n = 5;
  assert.equal(verifieTribu(engendree([masqueDe([0, 1])], n), n).tribu, true);
  assert.deepEqual(verifieTribu([0, masqueDe([0])], n), { tribu: false, axiome: 'plein' });
  const sansComplementaire = verifieTribu([0, masqueDe([0]), plein(n)], n);
  assert.equal(sansComplementaire.axiome, 'complementaire');
  assert.equal(sansComplementaire.A, masqueDe([0]));
  // σ({1}) ∪ σ({2}) n'est pas une tribu (Remarque 2.1.2) : {1} ∪ {2} manque.
  const reunion = [...new Set([...engendree([masqueDe([0])], n), ...engendree([masqueDe([1])], n)])];
  const v = verifieTribu(reunion, n);
  assert.equal(v.axiome, 'reunion');
  assert.equal(v.A | v.B, masqueDe([0, 1]));
  // Sur 3 points, les familles qui passent le test sont exactement les tribus
  // engendrées : il y en a 5 (le nombre de partitions de 3 points).
  const tribus = [];
  for (let s = 0; s < 1 << 8; s++) {
    const famille = Array.from({ length: 8 }, (_, m) => m).filter((m) => (s >> m) & 1);
    if (verifieTribu(famille, 3).tribu) tribus.push(famille);
  }
  assert.equal(tribus.length, 5);
  for (const t of tribus) assert.deepEqual(t, engendree(t, 3));
});

test('ensembles : tribus image et image réciproque, lemme de transport', () => {
  const [n1, n2] = [3, 3];
  for (const f of applications(n1, n2)) {
    for (let G = 0; G <= plein(n2); G++) {
      // Le lemme de transport (Théorème 2.1.12) : σ(f⁻¹(𝒞)) = f⁻¹(σ(𝒞)).
      const C = [G];
      assert.deepEqual(engendree(C.map((B) => imageReciproque(f, B)), n1), tribuReciproque(f, engendree(C, n2)));
    }
    for (let A = 0; A <= plein(n1); A++) {
      const A1 = engendree([A], n1);
      // La tribu image est une tribu (Proposition 2.1.11), qui contient tout B
      // dont l'image réciproque est dans 𝒜₁.
      const T = tribuImage(f, A1, n2);
      assert.equal(verifieTribu(T, n2).tribu, true);
      assert.ok(T.every((B) => A1.includes(imageReciproque(f, B))));
      // La tribu image réciproque en est une aussi (Proposition 2.1.10).
      assert.equal(verifieTribu(tribuReciproque(f, engendree([A], n2)), n1).tribu, true);
    }
  }
  // f(𝒜₁) n'est pas toujours une tribu (Remarque 2.1.5) : f non surjective.
  const f = [0, 0, 1];
  assert.equal(verifieTribu(familleImage(f, engendree([masqueDe([0])], 3)), 3).tribu, false);
  assert.equal(cardinal(plein(3)), 3);
});

test('ensembles : partitions et réunions de blocs', () => {
  assert.deepEqual(lisPartition('1,1,2,2,3,1', 6, '1,1,1,1,1,1'), [masqueDe([0, 1, 5]), masqueDe([2, 3]), masqueDe([4])]);
  assert.deepEqual(lisPartition('x', 3, '1,2,2'), [masqueDe([0]), masqueDe([1, 2])]);
  assert.equal(reunions([masqueDe([0]), masqueDe([1, 2])]).length, 4);
});
