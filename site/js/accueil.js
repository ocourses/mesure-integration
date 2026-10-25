// Page d'accueil : la carte du cours, chapitre par chapitre, avec ses
// illustrations (js/illustrations/catalogue.js).

import { themes } from './illustrations/catalogue.js';
import { ancre } from './parcours.js';
import { typographie } from './ui/format.js';

// Carte présentant une illustration ; un lien si elle est disponible.
function carte({ titre, resume, source, lien, ancrage }) {
  const el = document.createElement(lien ? 'a' : 'div');
  if (ancrage) el.id = ancrage;
  el.className = 'carte exemple' + (lien ? '' : ' a-venir');
  if (lien) el.href = lien;
  const h = document.createElement('h2');
  h.textContent = typographie(titre);
  if (!lien) {
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = 'à venir';
    h.appendChild(badge);
  }
  el.appendChild(h);
  for (const [texte, classe] of [
    [resume, ''],
    [source, 'source'],
  ]) {
    if (!texte) continue;
    const p = document.createElement('p');
    if (classe) p.className = classe;
    p.textContent = typographie(texte);
    el.appendChild(p);
  }
  return el;
}

const zoneThemes = document.getElementById('themes');
for (const theme of themes) {
  const section = document.createElement('section');
  section.className = 'theme';
  section.id = `theme-${theme.id}`;
  const h = document.createElement('h2');
  h.textContent = typographie(theme.titre);
  const src = document.createElement('p');
  src.className = 'source';
  src.textContent = typographie(theme.source);
  const grille = document.createElement('div');
  grille.className = 'catalogue';
  for (const i of theme.illustrations) {
    grille.appendChild(
      carte({ titre: i.titre, resume: i.resume, source: i.source, lien: i.disponible ? `illustration.html?id=${i.id}` : null, ancrage: ancre('illustration', i.id) }),
    );
  }
  section.append(h, src, grille);
  zoneThemes.appendChild(section);
}

// Retour depuis une page : on revient à sa carte (les cartes sont créées par ce
// script, le navigateur ne sait pas faire défiler vers l'ancre tout seul).
if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({ block: 'center' });
