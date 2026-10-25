// Intervalles dans KaTeX (CONVENTIONS.md) : un crochet ouvrant à l'envers
// s'écrit \mathopen{]}, un crochet fermant à l'envers \mathclose{[}. Sans
// cela, KaTeX les espace comme des relations : « ] 0, 1] ». On parcourt les
// formules $…$ de toutes les sources, hors commentaires.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const racine = new URL('../js/', import.meta.url);

function sources(dossier = racine) {
  return readdirSync(dossier, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? sources(new URL(`${e.name}/`, dossier)) : e.name.endsWith('.js') ? [new URL(e.name, dossier)] : [],
  );
}

// Un « ] » qui ouvre : en début de formule, après une espace, (, {, _, une
// virgule, = ou \in, et suivi d'une borne. Un « [ » qui ferme : après une
// borne et suivi de la fin de formule, d'une espace, d'une virgule, de ) ou }.
const OUVRE = /(^|[\s({_,=]|\\in|\\colon)\](?=[\s\d\-a-zA-Z\\])/;
const FERME = /([\w}]\s*|\\infty)\[(?=$|[\s,)}])/;

export function intervallesNus(texte) {
  const fautes = [];
  texte.split('\n').forEach((ligne, i) => {
    if (ligne.trimStart().startsWith('//')) return;
    for (const [, formule] of ligne.matchAll(/\$([^$]+)\$/g))
      if (OUVRE.test(formule) || FERME.test(formule)) fautes.push(`${i + 1}: ${formule}`);
  });
  return fautes;
}

test('intervalles : le détecteur reconnaît les crochets à l’envers', () => {
  assert.equal(intervallesNus("'$]0, 1]$'").length, 1);
  assert.equal(intervallesNus("'$[0, +\\\\infty[$'").length, 1);
  assert.equal(intervallesNus("'$\\\\mathbb 1_{[1, +\\\\infty[}$'").length, 1);
  assert.equal(intervallesNus("'$p(]-\\\\infty, t])$'").length, 1);
  assert.equal(intervallesNus("'$\\\\mathopen{]}0, 1/a\\\\mathclose{[}$ et $[a, b]$'").length, 0);
});

test('intervalles : aucune formule n’écrit un crochet à l’envers sans \\mathopen ou \\mathclose', () => {
  const fautes = sources().flatMap((url) => intervallesNus(readFileSync(url, 'utf8')).map((f) => `${url.pathname.split('/js/')[1]}:${f}`));
  assert.deepEqual(fautes, []);
});
