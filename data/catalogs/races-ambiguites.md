# Ambiguïtés — races

## D3-RACES-COUNT-33-VS-31

- **Constat** : `docs/rules/03-races.md` annonce 33 races dans son titre et ses sources, mais le tableau de synthèse, les fiches `####` et `data/catalogs/bestiaire.yaml` exposent 31 noms structurés.
- **Sources contrôlées** : `docs/rules/03-races.md`, `data/catalogs/bestiaire.yaml`, `data/legacy/web-scraped/documents/bestiaire/index.md`, `data/legacy/paper/regles-papier/extracted/listes/bestiaire.md`.
- **Décision de modélisation** : `data/catalogs/races.yaml` contient toutes les races nommées et sourcées actuellement connues (31), dont 25 marquées `playable: true`. Les deux entrées non nommées ne sont pas inventées.
- **Statut** : ambiguïté ouverte jusqu'à identification explicite des deux noms manquants ou correction de la règle D3.
