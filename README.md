# xp5g

Affiche les données publiques d'expérimentations 5G (publiées [en Open Data](https://www.data.gouv.fr/fr/datasets/65b239a4a6929285a8262d83/)) sur
une carte interactive en ligne.

## Interlocuteurs

- Métier : l'unité [DMI/UFT](https://www.arcep.fr/la-regulation/grands-dossiers-reseaux-mobiles/la-5g.html) de l'Arcep
- Technique : l'unité [DIU/URD](https://www.arcep.fr/la-regulation/grands-dossiers-thematiques-transverses/la-regulation-par-la-data.html) de l'Arcep

## Développement

Pour afficher facilement le site en mode développement, on peut simplement exécuter depuis la racine du projet : `python -m http.server`.
La carte (sur les données de test) est alors disponible sur <http://localhost:8000/?env=test>
