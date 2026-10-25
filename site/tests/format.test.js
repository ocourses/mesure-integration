// Nombres à largeur fixe (js/ui/format.js) : la place réservée dépend de ce
// que la grandeur peut devenir, pas d'un défaut.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { chiffresEntiers, latexNombreFixe, latexPositifFixe } from '../js/ui/format.js';

test('nombres fixes : une grandeur positive ne réserve ni signe ni chiffre inutile', () => {
  // Pas de place pour le signe, pas de chiffre de plus devant 2,772.
  assert.equal(latexPositifFixe(2.772), '2{,}772');
  // Une grandeur signée garde la place du signe quand elle est positive.
  assert.equal(latexNombreFixe(2.772, 3), '\\phantom{-}2{,}772');
  assert.equal(latexNombreFixe(-2.772, 3), '-2{,}772');
  // Une grandeur qui peut passer 10 réserve le chiffre demandé, pas davantage.
  assert.equal(latexPositifFixe(2.772, 3, 2), '\\phantom{0}2{,}772');
  assert.equal(latexPositifFixe(13.437, 3, 2), '13{,}437');
  // Zéro négatif arrondi : jamais « −0,00 ».
  assert.equal(latexNombreFixe(-0.0001, 2), '\\phantom{-}0{,}00');
});

test('nombres fixes : le chiffre réservé suit le plus grand nombre atteignable', () => {
  assert.deepEqual([0.4, 9.99, 10, 21.3, 150].map(chiffresEntiers), [1, 1, 2, 2, 3]);
});

test('nombres fixes : +∞ garde la largeur d’un nombre fini', () => {
  assert.equal(latexPositifFixe(Infinity, 3, 1), '\\phantom{000}+\\infty');
});

import { latexNombreFinal } from '../js/ui/format.js';

test('nombres fixes : en fin de phrase, le signe n’est écrit que s’il est négatif', () => {
  assert.equal(latexNombreFinal(0.7854, 4), '0{,}7854');
  assert.equal(latexNombreFinal(-0.7854, 4), '-0{,}7854');
  assert.equal(latexNombreFinal(-0.00001, 3), '0{,}000');
});

import { latexIntervalle, separateur } from '../js/ui/format.js';

test('séparateur : la virgule pour des entiers, le point-virgule dès qu’un décimal s’écrit', () => {
  assert.equal(separateur([0, 1]), ',\\ ');
  assert.equal(separateur([1.5, 2]), '\\,;\\ ');
  assert.equal(separateur([1.0004, 2], 3), ',\\ ');
  assert.equal(latexIntervalle(0, 6), '[0,\\ 6]');
  assert.equal(latexIntervalle(1.5, 2.5, { chiffres: 2 }), '[1{,}5\\,;\\ 2{,}5]');
});
