# `tools/` — Scripts cross-projets Knight and Wizard

## Contenu

### `parse.py`

Parser legacy hérité de la phase d'extraction des sources web/papier. Utilisé pour générer les `.md` extraits de `data/legacy/`.

**Statut** : 🟡 historique, peut nécessiter mise à jour.

## Scripts par app

Les scripts spécifiques à une app sont dans son propre dossier `tools/`. Exemple :

- `apps/interactive-map/tools/yaml_to_geojson.py` — génère les GeoJSON depuis les YAML

## Conventions

- Scripts Python : Python 3.11+, dépendances pinnées si possible.
- Scripts Node : utilisent les packages workspace si pertinent.
- Tout script qui mute les données canoniques (`data/catalogs/`) doit être audité et versionné.
