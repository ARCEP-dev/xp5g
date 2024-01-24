# Site web cartographique

Affiche les données publiques d'expérimentations 5G (publiées [via un pipeline](https://gitlab.arcep.fr/uft/carto-xp-5g/data-pipeline)) sur
une carte interactive en ligne.

## Interlocuteurs

- Métier : Denis CATINOT pour DMI/UFT
- Technique : Laurent COTTEREAU (@lcottereau) pour DIU/URD

## Environnements

- production : à venir…
- développement : on peut utiliser [les données de l'open data de dev](https://demo.data.gouv.fr/fr/datasets/65007851ff1ee4659f3b384c/)

Pour afficher facilement le site en mode développement, on peut simplement exécuter depuis la racine du projet : `python -m http.server`.
La carte (sur les données de test) est alors disponible sur <http://localhost:8000/?env=test>
