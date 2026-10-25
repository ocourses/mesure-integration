// Tests des pages de manipulation d'ensembles (chapitre 2) : ce que disent
// leurs essais, vérifié par calcul.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { image, imageReciproque, lisApplication, masqueDe } from '../js/illustrations/ensembles.js';
import pageIR, { basculeChoix, contreExemple, ENONCES, F_DEFAUT, membres, N1, N2 } from '../js/illustrations/image-reciproque.js';

const f0 = lisApplication(F_DEFAUT, N1, N2, F_DEFAUT);

test('image réciproque : les affirmations des essais', () => {
  // f⁻¹({a}) = {1, 2} et f⁻¹({c}) = ∅.
  assert.equal(imageReciproque(f0, masqueDe([0])), masqueDe([0, 1]));
  assert.equal(imageReciproque(f0, masqueDe([2])), 0);
  // Après la flèche 3 → c, f⁻¹({c}) = {3}.
  const f1 = f0.slice();
  f1[2] = 2;
  assert.equal(imageReciproque(f1, masqueDe([2])), masqueDe([2]));
  // A = {1, 3} : f(A) = {a, b}, f⁻¹(f(A)) = {1, 2, 3, 6}.
  const A = masqueDe([0, 2]);
  assert.equal(image(f0, A), masqueDe([0, 1]));
  assert.equal(imageReciproque(f0, image(f0, A)), masqueDe([0, 1, 2, 5]));
  // A₁ = {1}, A₂ = {2} : f(A₁ ∩ A₂) = ∅ ≠ f(A₁) ∩ f(A₂) = {a}.
  const m = membres('interD', f0, masqueDe([0]), masqueDe([1]));
  assert.deepEqual(m, { gauche: 0, droite: masqueDe([0]) });
  // Les états des essais sont lisibles.
  for (const { etat } of pageIR.essais) assert.ok(!etat.enonce || etat.enonce in ENONCES);
});

test('image réciproque : contre-exemples cherchés pour l’application dessinée', () => {
  // f(f⁻¹(B)) = B : le plus petit contre-exemple est un point sans antécédent.
  assert.deepEqual(contreExemple('ffmoins', f0), { P: masqueDe([2]), Q: 0 });
  // Une application surjective n'en a aucun.
  const surj = [0, 1, 2, 3, 4, 4];
  assert.equal(contreExemple('ffmoins', surj), null);
  // f⁻¹(f(A)) = A : il faut deux points de même image ; f(A₁ ∩ A₂) aussi.
  assert.ok(contreExemple('fmoinsf', f0));
  assert.ok(contreExemple('interD', f0));
  // f(Aᶜ) = f(A)ᶜ échoue toujours ici : |E₁| ≠ |E₂|, f n'est jamais bijective.
  assert.ok(contreExemple('compD', surj));
  // Les formules de Hausdorff n'ont jamais de contre-exemple.
  for (const f of [f0, surj, [4, 3, 2, 1, 0, 0], [0, 0, 0, 0, 0, 0]]) {
    for (const nom of ['compR', 'interR', 'unionD']) assert.equal(contreExemple(nom, f), null, `${nom}, ${f}`);
  }
});

test('image réciproque : un clic fait passer un point par 1, 2, les deux, aucune', () => {
  let [P, Q] = [0, 0];
  const suite = [];
  for (let k = 0; k < 4; k++) {
    [P, Q] = basculeChoix(P, Q, 3, true);
    suite.push([P, Q]);
  }
  assert.deepEqual(suite, [
    [8, 0],
    [0, 8],
    [8, 8],
    [0, 0],
  ]);
  assert.deepEqual(basculeChoix(8, 0, 3, false), [0, 0]);
});

import { COLONNES, etapeStable, etapes, lisFamille, N as N_ENG } from '../js/illustrations/engendrer.js';
import { complementaire, engendree, verifieTribu } from '../js/illustrations/ensembles.js';

test('engendrer : chaque partie est en face de son complémentaire', () => {
  assert.deepEqual(COLONNES.map((c) => c.length), [1, 5, 10, 10, 5, 1]);
  COLONNES.forEach((col, k) => col.forEach((m, i) => assert.equal(COLONNES[N_ENG - k][i], complementaire(m, N_ENG))));
});

test('engendrer : les affirmations des essais', () => {
  // {1, 2} : σ = {∅, A, Aᶜ, E}, atteinte à l'étape 3.
  assert.equal(engendree([3], N_ENG).length, 4);
  assert.equal(etapeStable([3]), 3);
  // {2, 3} et {2, 4} : seize parties ; leur intersection {2} apparaît à
  // l'étape 3, par complémentaires puis réunion puis complémentaire.
  const C = lisFamille('6.10');
  assert.equal(engendree(C, N_ENG).length, 16);
  assert.equal(etapes(C, 5).findIndex((F) => F.includes(2)), 3);
  // Avec {1} : la tribu discrète, en cinq étapes.
  assert.equal(engendree(lisFamille('1.6.10'), N_ENG).length, 32);
  assert.equal(etapeStable(lisFamille('1.6.10')), 5);
  // σ({1}) ∪ σ({2}) : {1} ∪ {2} manque.
  const v = verifieTribu(lisFamille('0.1.2.29.30.31'), N_ENG);
  assert.equal(v.axiome, 'reunion');
  assert.deepEqual([v.A, v.B], [1, 2]);
  // La chaîne ∅ ⊂ {1} ⊂ {1, 2} ⊂ E : {1} sans son complémentaire.
  const w = verifieTribu(lisFamille('0.1.3.31'), N_ENG);
  assert.deepEqual([w.axiome, w.A], ['complementaire', 1]);
  // La tribu grossière en est une.
  assert.equal(verifieTribu(lisFamille('0.31'), N_ENG).tribu, true);
  assert.deepEqual(lisFamille('x.40.3'), [3]);
});

import { defautsMesurabilite, F_DEFAUT as F_TA, P1_DEFAUT, P2_DEFAUT } from '../js/illustrations/tribus-application.js';
import { blocsDe, blocSuivant, familleImage, lisEtiquettes, reunions, tribuImage } from '../js/illustrations/ensembles.js';

test('tribus d’une application : les essais, gestes compris', () => {
  const f = lisApplication(F_TA, 6, 5, F_TA);
  const e1 = lisEtiquettes(P1_DEFAUT, 6, P1_DEFAUT);
  const b1 = blocsDe(e1);
  const b2 = blocsDe(lisEtiquettes(P2_DEFAUT, 5, P2_DEFAUT));
  // Au départ, f⁻¹({a, b}) = {1, 2, 3, 6} et f⁻¹({c, d}) = {4, 5} coupent
  // tous deux le seul bloc {3, 4, 6}.
  const d = defautsMesurabilite(f, b1, b2);
  assert.deepEqual(
    d.map(({ pre, coupes }) => [pre, coupes]),
    [
      [masqueDe([0, 1, 2, 5]), [masqueDe([2, 3, 5])]],
      [masqueDe([3, 4]), [masqueDe([2, 3, 5])]],
    ],
  );
  // Essai 1 : la flèche de 4 vers b suffit.
  const g = f.slice();
  g[3] = 1;
  assert.equal(defautsMesurabilite(g, b1, b2).length, 0);
  // Essai 2 : un clic sur 4 le fait passer dans le bloc de 5, et f devient mesurable.
  const e1b = blocSuivant(e1, 3);
  assert.deepEqual(e1b, [1, 1, 2, 3, 3, 2]);
  assert.equal(defautsMesurabilite(f, blocsDe(e1b), b2).length, 0);
  // Essai 3 : la tribu image contient {c} et {e} ; f(𝒜₁) ne contient pas E₂.
  const T = tribuImage(f, reunions(b1), 5);
  assert.ok(T.includes(masqueDe([2])) && T.includes(masqueDe([4])));
  assert.ok(!familleImage(f, reunions(b1)).includes(0b11111));
  // Essai 4 : f⁻¹({b, d}) = {3, 4, 5, 6}, réunion de blocs.
  assert.equal(imageReciproque(f, masqueDe([1, 3])), masqueDe([2, 3, 4, 5]));
  assert.ok(reunions(b1).includes(masqueDe([2, 3, 4, 5])));
  // Essai 5 : deux clics sur b donnent C₁ = {b, d}, C₂ = {b} ; f⁻¹({b}) = {3, 6} n'est pas une réunion de blocs.
  let [C1, C2] = [masqueDe([1, 3]), 0];
  for (let k = 0; k < 2; k++) [C1, C2] = basculeChoix(C1, C2, 1, true);
  assert.deepEqual([C1, C2], [masqueDe([1, 3]), masqueDe([1])]);
  assert.ok(!reunions(b1).includes(imageReciproque(f, C2)));
});

test('tribus d’une application : un clic parcourt les blocs, et revient', () => {
  // Un point seul dans le dernier bloc revient au premier.
  assert.deepEqual(blocSuivant([1, 1, 2], 2), [1, 1, 1]);
  // Un point d'un bloc partagé peut ouvrir un nouveau bloc.
  assert.deepEqual(blocSuivant([1, 1, 1], 0), [1, 2, 2]);
  assert.deepEqual(lisEtiquettes('3,3,1', 3, '1,1,1'), [1, 1, 2]);
});

import { croissante, demiDroite, f1, f2, oscillante, reunionGrille, X_MAX } from '../js/illustrations/images-reelles.js';
import { intervallesOu, longueur } from '../js/illustrations/fonctions.js';

test('images sur ℝ : demi-droites d’une fonction croissante (Exemple 2.2.4)', () => {
  // Pour chaque a, {f ≤ a} coïncide avec la demi-droite annoncée, sur une grille fine.
  for (const a of [0.4, 1, 1.5, 1.99, 2, 2.3, 2.5, 3.2]) {
    const { c, ferme } = demiDroite(a);
    for (let k = -200; k <= 800; k++) {
      const x = k / 100;
      // À c près (arrondi de 2a − 2), la borne est comprise si et seulement si la demi-droite est fermée.
      const attendu = Math.abs(x - c) < 1e-9 ? ferme : x < c;
      assert.equal(croissante(x) <= a + 1e-12, attendu, `a = ${a}, x = ${x}`);
    }
    assert.equal(croissante(c) <= a, ferme);
  }
  // Dans le saut : ouverte en 2 ; sur le palier : fermée en 4.
  assert.deepEqual(demiDroite(1.5), { c: 2, ferme: false });
  assert.deepEqual(demiDroite(2.5), { c: 4, ferme: true });
});

test('images sur ℝ : les affirmations des essais', () => {
  // f⁻¹([1,5 ; 2,5]) a quatre intervalles.
  const B = intervallesOu(oscillante, (y) => y >= 1.5 && y <= 2.5, 0, X_MAX, { n: 3000, seuils: [1.5, 2.5] });
  assert.equal(B.length, 4);
  // La réunion sur les q de pas 1/N manque une longueur qui diminue avec N, et
  // ne contient jamais de point hors de {f₁ < f₂}.
  const vrai = longueur(intervallesOu((x) => f2(x) - f1(x), (y) => y > 0, 0, X_MAX, { n: 3000, seuils: [0] }));
  const manque = (N) => vrai - longueur(intervallesOu((x) => x, (x) => reunionGrille(N, x), 0, X_MAX, { n: 3000 }));
  assert.ok(manque(2) > 0.3);
  assert.ok(manque(12) < manque(4) && manque(4) < manque(2));
  for (let x = 0; x <= X_MAX; x += 0.01) if (reunionGrille(3, x)) assert.ok(f1(x) < f2(x));
});

import { lisListe, loi, reciproque } from '../js/illustrations/mesure-image.js';

test('mesure image : les lois des essais', () => {
  // Somme : P(X = 7) = 6/36, et la loi totale vaut 1.
  const somme = loi('somme');
  assert.equal(somme.get(7), 6);
  assert.equal([...somme.values()].reduce((a, b) => a + b, 0), 36);
  // P_X(B) est la somme des barres, car les fibres sont disjointes.
  assert.equal(reciproque('somme', [7, 8]).length, somme.get(7) + somme.get(8));
  // Maximum : P(max = k) = (2k − 1)/36.
  const max = loi('max');
  for (let k = 1; k <= 6; k++) assert.equal(max.get(k), 2 * k - 1);
  // Écart : six issues pour 0, trente pour {1, …, 5}.
  assert.equal(reciproque('ecart', [0]).length, 6);
  assert.equal(reciproque('ecart', [1, 2, 3, 4, 5]).length, 30);
  // Indicatrice de « le premier dé donne 6 » : p = 6/36.
  const A = [30, 31, 32, 33, 34, 35];
  assert.deepEqual([...loi('indicatrice', A).entries()], [[0, 30], [1, 6]]);
  // Toutes les valeurs : X⁻¹(ℝ) = Ω.
  assert.equal(reciproque('somme', [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]).length, 36);
  assert.deepEqual(lisListe('7,x,99,7', [2, 7]), [7]);
});

import { dans, mesureLimite, SUITES } from '../js/illustrations/suites-ensembles.js';

test('suites d’ensembles : l’état annoncé d’un point suit la suite des 𝟙_{A_n}(x)', () => {
  for (const [nom, S] of Object.entries(SUITES)) {
    const [u, v] = S.vue;
    for (let k = 0; k <= 200; k++) {
      const x = Math.round((u + ((v - u) * k) / 200) * 100) / 100;
      const e = S.point(x);
      const suite = Array.from({ length: 2000 }, (_, n) => dans(nom, n + 1, x));
      if (e.genre === 'inf') {
        assert.ok(suite.slice(e.rang - 1).every(Boolean), `${nom}, x = ${x}`);
        if (e.rang > 1) assert.ok(!suite[e.rang - 2], `${nom}, x = ${x} : rang minimal`);
      } else if (e.genre === 'aucun') {
        assert.ok(suite.slice(e.dernier).every((b) => !b), `${nom}, x = ${x}`);
        if (e.dernier) assert.ok(suite[e.dernier - 1], `${nom}, x = ${x} : dernier rang`);
      } else {
        // Une infinité de 1 et de 0 : au moins deux de chaque après le rang 500
        // (la machine à écrire ne repasse par 0 qu'une fois par génération).
        const fin = suite.slice(500);
        assert.ok(fin.filter(Boolean).length >= 2 && fin.filter((b) => !b).length >= 2, `${nom}, x = ${x}`);
      }
    }
  }
});

test('suites d’ensembles : les affirmations des essais', () => {
  assert.deepEqual(SUITES.croissante.point(0.8), { genre: 'inf', rang: 5 });
  assert.deepEqual(SUITES.infinie.point(6.5), { genre: 'aucun', dernier: 6 });
  assert.equal(SUITES.alternee.point(1.5).genre, 'inf');
  assert.equal(SUITES.alternee.point(0.5).genre, 'sup');
  assert.deepEqual([mesureLimite(SUITES.bosse.limInf), SUITES.bosse.mesure(7)], [0, 1]);
  assert.equal(Array.from({ length: 15 }, (_, n) => dans('machine', n + 1, 0.3)).filter(Boolean).length, 4);
  assert.deepEqual([mesureLimite(SUITES.alternee.limInf), mesureLimite(SUITES.alternee.limSup)], [1, 3]);
});
