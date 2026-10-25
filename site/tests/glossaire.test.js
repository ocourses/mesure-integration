// Couverture du glossaire : chaque terme du poly employé dans « Ce que dit le
// cours » ou « À essayer » d'une page est déclaré dans ses `termes`, pour être
// souligné avec sa définition en infobulle ; et chaque terme déclaré apparaît.
// On simule le gabarit (js/ui/infobulle.js, `souligne`) : texte hors formules
// $…$, mots entiers, termes les plus longs d'abord, sans chevauchement.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { themes } from '../js/illustrations/catalogue.js';
import { GLOSSAIRE } from '../js/illustrations/glossaire.js';

const LETTRE = /\p{L}/u;

// Termes soulignés dans `texte` si la page déclarait tout le glossaire.
export function termesTrouves(texte) {
  const clair = texte.replace(/\$[^$]*\$/g, (m) => ' '.repeat(m.length));
  const pris = [];
  const longueur = (cle) => Math.max(...GLOSSAIRE[cle].formes.map((f) => f.length));
  const trouves = [];
  for (const cle of Object.keys(GLOSSAIRE).sort((a, b) => longueur(b) - longueur(a))) {
    for (const forme of GLOSSAIRE[cle].formes) {
      let i = clair.indexOf(forme);
      const libre = (k) => !pris.some(([u, v]) => k < v && k + forme.length > u);
      while (i >= 0 && (LETTRE.test(clair[i - 1] ?? '') || LETTRE.test(clair[i + forme.length] ?? '') || !libre(i))) i = clair.indexOf(forme, i + 1);
      if (i < 0) continue;
      pris.push([i, i + forme.length]);
      trouves.push(cle);
      break;
    }
  }
  return trouves;
}

test('glossaire : chaque page déclare les termes du poly qu’elle emploie, et seulement eux', async () => {
  const erreurs = [];
  for (const theme of themes) {
    for (const { id, disponible } of theme.illustrations) {
      if (!disponible) continue;
      const m = (await import(`../js/illustrations/${id}.js`)).default;
      const texte = [...[m.rappel].flat(2), ...(m.essais ?? []).map((e) => e.texte)].join('\n');
      const trouves = termesTrouves(texte);
      const declares = m.termes ?? [];
      const manquants = trouves.filter((k) => !declares.includes(k));
      const absents = declares.filter((k) => !trouves.includes(k));
      if (manquants.length || absents.length) erreurs.push(`${id} : manquants [${manquants}], absents [${absents}]`);
    }
  }
  assert.deepEqual(erreurs, []);
});
