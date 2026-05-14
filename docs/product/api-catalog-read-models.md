# API catalogues canoniques

## Objectif

Les surfaces produit doivent consommer les catalogues depuis les read-models PostgreSQL, jamais depuis des fixtures `sample.ts`. Les documents importes par `pnpm db:import:catalogs` sont exposes par l'API backend sous forme stable pour le frontend et les futurs clients CMS/rules-core.

## Routes

### `GET /catalogs`

Retourne les catalogues prioritaires importes dans `catalog_documents`.

```json
{
  "status": "ok",
  "catalogs": [
    {
      "catalogName": "spells.yaml",
      "sourcePath": "data/catalogs/spells.yaml",
      "contentHash": "...64 hex characters...",
      "importedAt": "2026-05-14T09:00:00.000Z",
      "updatedAt": "2026-05-14T09:00:00.000Z"
    }
  ]
}
```

### `GET /catalogs/:catalogName`

Retourne le document JSON canonique d'un catalogue importe. Le champ `document` conserve les entrees validees par Zod, dont `status` et `source_refs`.

```json
{
  "status": "found",
  "catalog": {
    "catalogName": "spells.yaml",
    "sourcePath": "data/catalogs/spells.yaml",
    "contentHash": "...64 hex characters...",
    "importedAt": "2026-05-14T09:00:00.000Z",
    "updatedAt": "2026-05-14T09:00:00.000Z",
    "document": {
      "spells": [
        {
          "id": "example",
          "name": "Example",
          "status": "active",
          "source_refs": []
        }
      ]
    }
  }
}
```

## Erreurs

Les erreurs sont JSON et stables.

| HTTP | Code | Cas | Message |
| ---- | ---- | --- | ------- |
| 400 | `invalid_catalog_name` | `catalogName` n'est pas un nom de fichier YAML minuscule. | `Catalog names must be lowercase YAML filenames.` |
| 404 | `catalog_not_imported` | Le catalogue demande n'a pas de read-model dans `catalog_documents`. | `Catalog read model is not imported.` |

Avant de lancer l'API locale, executer `pnpm db:migrate` puis `pnpm db:import:catalogs` si la base vient d'etre creee ou reset.
