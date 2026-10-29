// Ce qui distingue ce cours ; le reste vient du socle (socle/docs/conception.md).

import { themes } from './js/illustrations/catalogue.js';
import { GLOSSAIRE } from './js/illustrations/glossaire.js';

export default {
  id: 'mesure-integration',
  titre: 'Mesure et intégration',
  sousTitre: 'Mesure et intégration, première année — ENSEEIHT, Sciences du numérique',
  intro: [
    "Des illustrations interactives du poly et des TD, rangées par chapitre dans l'ordre du cours. Chacune rappelle le résultat du cours, propose des choses à essayer et garde ses réglages dans son lien : on choisit une fonction, un paramètre, une mesure, et l'on regarde ce que devient l'intégrale.",
  ],
  depotIssues: 'ocourses/mesure-integration',
  themes,
  glossaire: GLOSSAIRE,
  charge: (id) => import(`./js/illustrations/${id}.js`),
};
