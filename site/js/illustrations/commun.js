// Briques du socle (socle/js/briques/), plus ce qui n'appartient qu'à ce cours.

export * from '../../socle/js/briques/commun.js';
import { choixRadios, glisse } from '../../socle/js/briques/commun.js';

// Une figure dont l'abscisse est un indice (n ↦ f_n(x), n ↦ ∫ f_n) : un clic ou
// un glisser sur elle choisit l'indice, arrondi et borné par `min` et `max()`
// (le maximum peut dépendre du cas choisi) ; `change(k)` met la page à jour.
export function choisitIndice(canvas, repere, { min = 1, max, change }) {
  canvas.classList.add('cliquable');
  glisse(canvas, repere, { deplace: (x) => change(Math.min(max(), Math.max(min, Math.round(x)))) });
}

const EXPOSANTS = '⁰¹²³⁴⁵⁶⁷⁸⁹';

const puissance10 = (k) => `10${k < 0 ? '⁻' : ''}${String(Math.abs(k)).replace(/\d/g, (c) => EXPOSANTS[c])}`;

// Échelle logarithmique d'une suite de valeurs ≥ 0 : y = log₁₀ v. Les valeurs
// nulles n'ont pas de logarithme : elles sont posées sur une ligne « 0 » sous
// les puissances de 10. Le niveau 1 (y = 0) est toujours dans le cadre.
export function echelleLog(valeurs) {
  const logs = valeurs.filter((v) => v > 0).map(Math.log10);
  const bas = Math.floor(Math.min(0, ...logs) + 1e-9);
  const haut = Math.ceil(Math.max(0, ...logs) - 1e-9) || 0;
  const nul = valeurs.some((v) => v === 0);
  const zero = bas - (0.12 * (haut - bas) + 0.5);
  return {
    bas,
    haut,
    zero: nul ? zero : null,
    cadre: [nul ? zero - 0.35 * (1 + 0.1 * (haut - bas)) : bas - 0.3, haut + 0.4],
    y: (v) => (v > 0 ? Math.log10(v) : zero),
    graduations: Array.from({ length: haut - bas + 1 }, (_, i) => bas + i).filter((k) => (k - bas) % Math.max(1, Math.ceil((haut - bas) / 5)) === 0),
  };
}

// Graduations et ligne « 0 » d'une figure en échelle logarithmique.
export function axesLog(rep, E, col, [x0, x1]) {
  rep.axes({ noms: ['n', ''], grille: false, ordonnees: false });
  rep.trace([[Math.max(0, x0), E.cadre[0]], [Math.max(0, x0), E.cadre[1]]], { couleur: col.discret, largeur: 1 });
  const etiquette = (y, t) => rep.texte(x0, y, t, { align: 'right', dx: -6, dy: 4, couleur: col.discret, police: '11px system-ui, sans-serif' });
  for (const k of E.graduations) {
    if (k !== 0) rep.trace([[x0, k], [x1, k]], { couleur: col.grille, largeur: 1 });
    etiquette(k, k === 0 ? '1' : puissance10(k));
  }
  if (E.zero !== null) {
    rep.trace([[x0, E.zero], [x1, E.zero]], { couleur: col.grille, largeur: 1, tirets: [2, 4] });
    etiquette(E.zero, '0');
  }
}

// Choix de l'échelle des suites numériques d'une page, à droite de la barre
// d'outils : `options` [{ valeur, texte }], `change(valeur)` ; renvoie { fixe }.
export function choixEchelle(barre, { etiquette = 'Suites du bas :', options, change }) {
  const groupe = document.createElement('div');
  groupe.className = 'choix-echelle';
  const nom = document.createElement('span');
  nom.textContent = etiquette;
  nom.className = 'etiquette-echelle';
  groupe.appendChild(nom);
  barre.appendChild(groupe);
  return choixRadios(groupe, { nom: 'echelle', options, change });
}
