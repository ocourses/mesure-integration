// Briques communes aux illustrations : cartes, canevas, légendes, tableaux,
// glisser à la souris et zoom.

import { typographie } from '../ui/format.js';
import { attacheInfobulle } from '../ui/infobulle.js';
import { rend, rendTexte } from '../ui/katex.js';

// Section .carte avec un titre h2 (facultatif) ; renvoie la section.
export function carte(parent, titre = null) {
  const s = document.createElement('section');
  s.className = 'carte';
  if (titre) {
    const h = document.createElement('h2');
    rendTexte(h, titre);
    s.appendChild(h);
  }
  parent.appendChild(s);
  return s;
}

// Barre d'outils au-dessus des cartes : les choix qui modifient toute la page
// (le système, l'étape, la forme) y sont, hors des boîtes de texte.
export function barreOutils(parent) {
  const barre = document.createElement('div');
  barre.className = 'barre-outils';
  parent.appendChild(barre);
  return barre;
}

// Choix exclusif par boutons radio, le même partout. `options` :
// [{ valeur, texte | latex }] ; `change(valeur)` à chaque choix de l'utilisateur ;
// `fixe(valeur)` coche l'option sans appeler `change`.
export function choixRadios(parent, { nom, options, change }) {
  const element = document.createElement('div');
  element.className = 'choix';
  element.setAttribute('role', 'radiogroup');
  const radios = options.map(({ valeur, texte, latex }) => {
    const label = document.createElement('label');
    const input = document.createElement('input');
    Object.assign(input, { type: 'radio', name: nom, value: valeur });
    input.addEventListener('change', () => change(valeur));
    const nomOption = document.createElement('span');
    if (latex) rend(nomOption, latex, false);
    else nomOption.textContent = typographie(texte);
    label.append(input, ' ', nomOption);
    element.appendChild(label);
    return input;
  });
  parent.appendChild(element);
  return { element, fixe: (valeur) => radios.forEach((r) => (r.checked = r.value === valeur)) };
}

// Bouton « i » en haut à droite d'une carte : il ouvre la légende de la figure
// dans une bulle. `elements` : [forme, variable CSS de la couleur, texte], la
// forme étant 'ligne', 'tirets', 'point', 'cercle' (point creux), 'fleche' ou
// 'zone' (aplat) ; le texte peut contenir des formules $…$.
export function boutonInfo(carteEl, elements, { titre = 'Ce que montre la figure', etiquette = 'Légende de la figure' } = {}) {
  return boutonAide(carteEl, { titre, etiquette }, (div) => {
    const liste = document.createElement('ul');
    liste.className = 'legende-bulle';
    for (const [forme, couleur, texte] of elements) {
      const li = document.createElement('li');
      const pastille = document.createElement('span');
      pastille.className = `pastille ${forme}`;
      pastille.style.setProperty('--couleur-pastille', `var(${couleur})`);
      if (forme === 'fleche') pastille.textContent = '→';
      const contenu = document.createElement('span');
      rendTexte(contenu, texte);
      li.append(pastille, contenu);
      liste.appendChild(li);
    }
    div.appendChild(liste);
  });
}

// Bouton « i » d'une carte dont la bulle contient autre chose qu'une légende :
// `remplis(div)` construit son contenu, sous le titre, à chaque ouverture.
export function boutonAide(carteEl, { titre, etiquette }, remplis) {
  carteEl.classList.add('carte-avec-info');
  const bouton = document.createElement('button');
  bouton.type = 'button';
  bouton.className = 'bouton-info';
  bouton.setAttribute('aria-label', etiquette);
  bouton.textContent = 'i';
  carteEl.appendChild(bouton);
  attacheInfobulle(bouton, () => {
    const div = document.createElement('div');
    const t = document.createElement('p');
    t.className = 'titre-bulle';
    t.textContent = titre;
    div.appendChild(t);
    remplis(div);
    return div;
  });
  return bouton;
}

// Bloc repliable (comme la console du simulateur) : un en-tête cliquable et un
// contenu, ouvert ou non selon `ouvert` ; `change(ouvert)` est appelé à chaque
// bascule (pour la garder dans les préférences). Renvoie { carte, contenu }.
export function repliable(parent, titre, { ouvert = false, change = () => {} } = {}) {
  const s = document.createElement('section');
  s.className = 'carte repliable';
  const bouton = document.createElement('button');
  bouton.type = 'button';
  bouton.className = 'entete-repliable';
  const libelle = document.createElement('span');
  rendTexte(libelle, titre);
  const etat = document.createElement('span');
  etat.className = 'etat-repliable';
  bouton.append(libelle, etat);
  const contenu = document.createElement('div');
  contenu.className = 'contenu-repliable';
  contenu.id = `repliable-${Math.random().toString(36).slice(2, 8)}`;
  bouton.setAttribute('aria-controls', contenu.id);
  s.append(bouton, contenu);
  parent.appendChild(s);
  const applique = (o) => {
    s.classList.toggle('ouvert', o);
    contenu.hidden = !o;
    bouton.setAttribute('aria-expanded', String(o));
    etat.textContent = o ? 'Replier' : 'Déplier';
  };
  bouton.addEventListener('click', () => {
    const o = contenu.hidden;
    applique(o);
    change(o);
  });
  applique(ouvert);
  return { carte: s, contenu, applique };
}

// Zoom d'une figure : molette autour du curseur, boutons +, − et ↺ ajoutés à
// `barre`, et, si `deplacer`, glisser pour déplacer la vue. Tant qu'on n'a pas
// zoomé, le cadre suit `auto()`. Avec `tempsPositif`, l'abscisse reste ≥ 0.
// Renvoie { cadre() } : le cadre à donner au repère avant de dessiner.
export function zoomable(canvas, rep, { barre, auto, redessine, deplacer = true, tempsPositif = false }) {
  let vue = null;
  const LARGEUR = { x: [0.05, 400], y: [0.02, 400] };
  const cadre = () => vue ?? auto();
  const borne = ([a, b]) => (tempsPositif && a < 0 ? [0, b - a] : [a, b]);
  function zoome(f, cx, cy) {
    const { x, y } = cadre();
    const dilate = ([a, b], c, axe) => {
      const l = (b - a) * f;
      if (l < LARGEUR[axe][0] || l > LARGEUR[axe][1]) return [a, b];
      return [c + (a - c) * f, c + (b - c) * f];
    };
    vue = { x: borne(dilate(x, cx, 'x')), y: dilate(y, cy, 'y') };
  }
  const outilsZoom = document.createElement('div');
  outilsZoom.className = 'zoom';
  outilsZoom.innerHTML =
    `<span class="petit">molette : zoom${deplacer ? ', glisser : déplacer' : ''}</span>` +
    '<button type="button" data-zoom="avant" aria-label="Zoomer" title="Zoomer">+</button>' +
    '<button type="button" data-zoom="arriere" aria-label="Dézoomer" title="Dézoomer">−</button>' +
    '<button type="button" data-zoom="reinit" aria-label="Réinitialiser le zoom" title="Réinitialiser le zoom">↺</button>';
  barre.appendChild(outilsZoom);
  outilsZoom.addEventListener('click', (ev) => {
    const bouton = ev.target.closest('button');
    if (!bouton) return;
    const { x, y } = cadre();
    if (bouton.dataset.zoom === 'reinit') vue = null;
    else zoome(bouton.dataset.zoom === 'avant' ? 1 / 1.4 : 1.4, (x[0] + x[1]) / 2, (y[0] + y[1]) / 2);
    redessine();
  });
  canvas.addEventListener(
    'wheel',
    (ev) => {
      ev.preventDefault();
      const [x, y] = rep.versMonde(ev);
      zoome(Math.exp(Math.max(-100, Math.min(100, ev.deltaY)) * 0.0015), x, y);
      redessine();
    },
    { passive: false },
  );
  if (deplacer) {
    // Le point saisi reste sous le pointeur.
    canvas.classList.add('saisissable');
    let prise = null;
    glisse(canvas, rep, {
      prend: (x, y) => {
        prise = [x, y];
        return true;
      },
      deplace: (x, y) => {
        const { x: cx, y: cy } = cadre();
        const [dx, dy] = [prise[0] - x, prise[1] - y];
        vue = { x: borne([cx[0] + dx, cx[1] + dx]), y: [cy[0] + dy, cy[1] + dy] };
        redessine();
      },
    });
  }
  return { cadre };
}

// Canevas aux proportions données (largeur / hauteur), redessiné à chaque
// changement de taille par `dessine`.
export function toile(parent, proportions = '4 / 3', dessine = null) {
  const c = document.createElement('canvas');
  c.className = 'toile';
  c.style.setProperty('--proportions', proportions);
  // Un canevas carré (repère orthonormé) garde ses proportions quand la page
  // le fait entrer dans la hauteur de la fenêtre ; les autres s'étirent.
  const [l, h] = String(proportions).split('/').map(Number);
  if (l / (h || 1) <= 1.1) c.classList.add('carree');
  parent.appendChild(c);
  // Redessin à l'image suivante : dessiner dans le rappel de ResizeObserver
  // peut changer la mise en page (texte mis à jour), et le navigateur abandonne
  // alors les notifications suivantes, laissant un canevas étiré.
  if (dessine) {
    let attente = 0;
    new ResizeObserver(() => {
      cancelAnimationFrame(attente);
      attente = requestAnimationFrame(() => dessine());
    }).observe(c);
  }
  return c;
}

// Légende de courbes : [{ texte, couleur, tirets }].
export function legende(parent, items) {
  const p = document.createElement('p');
  p.className = 'legende-courbes';
  for (const { texte, couleur, tirets } of items) {
    const s = document.createElement('span');
    s.style.color = couleur;
    const trait = document.createElement('span');
    trait.className = `trait${tirets ? ' tirets' : ''}`;
    const t = document.createElement('span');
    t.style.color = 'var(--texte)';
    rendTexte(t, texte);
    s.append(trait, t);
    p.appendChild(s);
  }
  parent.appendChild(p);
  return p;
}

// Paragraphe de texte avec formules.
export function paragraphe(parent, texte, classe = 'note') {
  const p = document.createElement('p');
  if (classe) p.className = classe;
  rendTexte(p, texte);
  // Un verdict a une place de deux lignes, réservée par une zone qui l'entoure :
  // son liseret suit la hauteur du texte, et la figure ne change pas de taille.
  if (classe === 'verdict') {
    const zone = document.createElement('div');
    zone.className = 'zone-verdict';
    zone.appendChild(p);
    parent.appendChild(zone);
    return p;
  }
  parent.appendChild(p);
  return p;
}

// Tableau de valeurs : entetes (textes) et lignes (tableaux de textes).
export function tableau(parent, entetes, lignes) {
  const table = document.createElement('table');
  table.className = 'valeurs';
  const tr = document.createElement('tr');
  for (const e of entetes) {
    const th = document.createElement('th');
    th.textContent = typographie(e);
    tr.appendChild(th);
  }
  const thead = document.createElement('thead');
  thead.appendChild(tr);
  const tbody = document.createElement('tbody');
  for (const ligne of lignes) {
    const r = document.createElement('tr');
    for (const v of ligne) {
      const td = document.createElement('td');
      td.textContent = v;
      r.appendChild(td);
    }
    tbody.appendChild(r);
  }
  table.append(thead, tbody);
  parent.appendChild(table);
  return table;
}

// Une figure dont l'abscisse est un indice (n ↦ f_n(x), n ↦ ∫ f_n) : un clic ou
// un glisser sur elle choisit l'indice, arrondi et borné par `min` et `max()`
// (le maximum peut dépendre du cas choisi) ; `change(k)` met la page à jour.
export function choisitIndice(canvas, repere, { min = 1, max, change }) {
  canvas.classList.add('cliquable');
  glisse(canvas, repere, { deplace: (x) => change(Math.min(max(), Math.max(min, Math.round(x)))) });
}

// Rend un objet saisissable à la souris sur un repère : `prend(x, y)` dit si
// le point visé saisit l'objet, `deplace(x, y)` est appelé pendant le geste.
export function glisse(canvas, repere, { prend = () => true, deplace, relache = () => {} }) {
  let actif = false;
  canvas.addEventListener('pointerdown', (ev) => {
    const [x, y] = repere.versMonde(ev);
    if (!prend(x, y)) return;
    actif = true;
    canvas.setPointerCapture(ev.pointerId);
    deplace(x, y);
    ev.preventDefault();
  });
  canvas.addEventListener('pointermove', (ev) => {
    if (actif) deplace(...repere.versMonde(ev));
  });
  const fin = () => {
    if (!actif) return;
    actif = false;
    relache();
  };
  canvas.addEventListener('pointerup', fin);
  canvas.addEventListener('pointercancel', fin);
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
