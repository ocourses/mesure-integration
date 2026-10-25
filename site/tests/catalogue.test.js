// Tests du gabarit et du catalogue : les réglages traversent l'URL, chaque
// illustration disponible a son module, et ses essais ne règlent que des
// réglages connus.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { lisEtat, versRecherche } from '../js/illustration.js';
import { themes, trouve } from '../js/illustrations/catalogue.js';
import { GLOSSAIRE } from '../js/illustrations/glossaire.js';
import { parcours } from '../js/parcours.js';

test('catalogue : identifiants uniques, modules présents pour les illustrations disponibles', async () => {
  const ids = themes.flatMap((t) => t.illustrations.map((i) => i.id));
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids.filter((id) => trouve(id).illustration.disponible)) {
    const m = (await import(`../js/illustrations/${id}.js`)).default;
    assert.equal(typeof m.monte, 'function', id);
    for (const essai of m.essais ?? []) {
      for (const cle of Object.keys(essai.etat ?? {})) assert.ok(cle in m.etat, `${id} : ${cle}`);
      // Une valeur textuelle d'essai est permise par `choix`.
      for (const [cle, v] of Object.entries(essai.etat ?? {})) {
        if (typeof v === 'string' && m.choix?.[cle]) assert.ok(m.choix[cle].includes(v), `${id} : ${cle}=${v}`);
      }
    }
    for (const terme of m.termes ?? []) assert.ok(GLOSSAIRE[terme], `${id} : terme absent du glossaire, ${terme}`);
  }
});

test('parcours : les pages disponibles, dans l’ordre du catalogue', () => {
  const attendu = themes.flatMap((t) => t.illustrations.filter((i) => i.disponible).map((i) => i.id));
  assert.deepEqual(
    parcours.map((p) => p.id),
    attendu,
  );
});

test('gabarit : les réglages traversent l’URL avec leur type', () => {
  const defaut = { n: 3, fonction: 'dirichlet', anime: true };
  const q = versRecherche('x', { n: 1.5, fonction: 'sinus', anime: false });
  assert.deepEqual(lisEtat(defaut, new URLSearchParams(q.toString())), { n: 1.5, fonction: 'sinus', anime: false });
  assert.deepEqual(lisEtat(defaut, new URLSearchParams('n=abc')), defaut);
  assert.equal(lisEtat(defaut, new URLSearchParams('fonction=foo'), { fonction: ['dirichlet', 'sinus'] }).fonction, 'dirichlet');
});

test('glossaire : chaque entrée a des formes, une définition et une source', () => {
  for (const [cle, { formes, definition, source }] of Object.entries(GLOSSAIRE)) {
    assert.ok(formes.length > 0 && definition && source, cle);
  }
});
