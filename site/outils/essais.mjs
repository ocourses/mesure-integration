// Relevé des essais : pour chaque page, clique chaque « Essayer » et écrit le
// texte de l'essai suivi des verdicts affichés ([ok], [alerte], [-]), formules
// en source TeX. On relit le relevé pour vérifier que chaque essai montre ce
// qu'il annonce (CONVENTIONS.md, section 10). Les erreurs JavaScript sont
// signalées.
//
// Usage, le serveur lancé (npm run serve) :
//   npm install --no-save playwright-core
//   node outils/essais.mjs [id…] [--port 8000] [--captures dossier]
// Sans id, toutes les pages du catalogue. Chrome est cherché à l'emplacement
// de macOS, ou dans la variable CHROME.

import { chromium } from 'playwright-core';
import { themes } from '../js/illustrations/catalogue.js';

const args = process.argv.slice(2);
const option = (nom, defaut) => {
  const i = args.indexOf(nom);
  return i < 0 ? defaut : args.splice(i, 2)[1];
};
const port = option('--port', '8000');
const captures = option('--captures', null);
const ids = args.length ? args : themes.flatMap((t) => t.illustrations.filter((i) => i.disponible).map((i) => i.id));

// Texte d'un élément, chaque formule KaTeX remplacée par sa source TeX.
const lisible = (e) => {
  const c = e.cloneNode(true);
  c.querySelectorAll('.katex').forEach((k) => k.replaceWith(`$${k.querySelector('annotation')?.textContent ?? ''}$`));
  return c.textContent.replace(/\s+/g, ' ').trim();
};

const navigateur = await chromium.launch({
  executablePath: process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});
let erreursTotales = 0;
for (const id of ids) {
  const page = await navigateur.newPage({ viewport: { width: 1504, height: 856 } });
  const erreurs = [];
  page.on('pageerror', (e) => erreurs.push(e.message));
  const url = `http://localhost:${port}/illustration.html?id=${id}`;
  await page.goto(url);
  // Les essais sont construits quand le module de la page a fini de se charger.
  await page.waitForSelector('#essais li', { state: 'attached', timeout: 8000 }).catch(() => {});
  const n = await page.locator('button.essayer').count();
  for (let k = 0; k < n; k++) {
    // Page neuve à chaque essai : l'essai doit fixer tout ce dont dépend son texte.
    await page.evaluate(() => localStorage.clear());
    await page.goto(url);
    await page.waitForSelector('#essais li', { state: 'attached', timeout: 8000 });
    await page.waitForTimeout(300);
    await page.locator('#onglet-essais').click();
    const li = page.locator('#essais li').nth(k);
    const texte = await li.locator('span').first().evaluate(lisible);
    await li.locator('button.essayer').click();
    await page.waitForTimeout(500);
    const verdicts = await page.evaluate(
      (f) =>
        [...document.querySelectorAll('.illustration-zone .verdict, .illustration-zone .note')]
          .map((v) => [v.className.replace(/^(verdict|note) ?/, '') || '-', new Function(`return ${f}`)()(v)])
          .filter(([, t]) => t),
      lisible.toString(),
    );
    console.log(`\n### ${id}, essai ${k + 1}\n> ${texte}`);
    for (const [classe, t] of verdicts) console.log(`  [${classe}] ${t}`);
    if (captures) await page.locator('.illustration-zone').screenshot({ path: `${captures}/${id}-${k + 1}.png` });
  }
  if (erreurs.length) console.log(`\nERREURS ${id} : ${erreurs.join(' | ')}`);
  erreursTotales += erreurs.length;
  await page.close();
}
await navigateur.close();
process.exitCode = erreursTotales ? 1 : 0;
