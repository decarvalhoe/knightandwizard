# `tools/` — Scripts cross-projets Knight and Wizard

## Contenu

### `canonical.ts`

Génère et vérifie les artefacts de conformité canonique :

- `docs/canonical/source-manifest.yaml` : registre exhaustif des sources K&W scannées, hashées, priorisées et statutées.
- `docs/canonical/canonical-matrix.yaml` : matrice fine source -> règle/objet -> YAML -> schéma -> DB -> vector store -> rules-core -> API -> UI -> tests.
- `docs/canonical/coverage-report.md` : synthèse lisible des couvertures, gaps et imports `sample.ts` encore bloquants.

Commandes :

```bash
pnpm canonical:write
pnpm canonical:check
pnpm canonical:check:strict
```

`canonical:check` est inclus dans `pnpm validate`. Les artefacts `docs/canonical/*` sont générés et comparés par ce gate ; ils ne doivent pas être édités à la main.

### `index-knowledge-base.ts`

Construit l'index RAG depuis `docs/canonical/source-manifest.yaml`, pas depuis une liste codée en dur. Les sources `active` et `raw_reference_only` produisent au moins un chunk avec metadata de traçabilité : chemin source, hash source, type, priorité, domaine, IDs liés, hash de chunk et date d'ingestion.

Commandes :

```bash
pnpm knowledge:index -- --dry-run --no-migrate
pnpm knowledge:index
```

Le RAG sert à citer, expliquer et retrouver le contexte. Il ne remplace pas les catalogues structurés ni les validations métier.

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
