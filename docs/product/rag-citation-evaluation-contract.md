# Contrat RAG citations et evaluations canoniques

Le RAG K&W sert a citer, expliquer et arbitrer le contexte. Il ne remplace pas la base structuree, les catalogues YAML, les read models PostgreSQL ni `rules-core`.

## Politique de grounding

La politique runtime est exposee par `RAG_GROUNDING_POLICY`:

- `vectorRole`: `citation_and_arbitration_context`.
- `structuredDataAuthority`: `catalog_read_models_rules_core_and_database`.
- `catalogOverrideAllowed`: `false`.

Les reponses MJ et l'outil `lookupRule` transportent cette politique avec les citations. Une reponse de regle sans citation exploitable doit etre traitee comme incomplete, pas comme une nouvelle source de verite.

## Cas d'evaluation

`RAG_EVALUATION_CASES` couvre quatre chemins canoniques:

- resolution: `docs/rules/01-resolution.md`, domaine `D1-resolution`;
- creation: `docs/rules/06-creation-perso.md`, domaine `D6-creation-perso`;
- magie: `docs/rules/08-magie.md`, domaine `D8-magie`;
- combat: `docs/rules/09-combat.md`, domaine `D9-combat`.

Chaque cas verifie la presence d'au moins une citation, du chemin source attendu, du domaine attendu et de termes de controle. Les metadata qui declarent un override de donnees catalogue (`structured_override`, `catalog_override`, etc.) font echouer l'evaluation.

## Execution

```bash
pnpm rag:evaluate
```

Le runner interroge l'index RAG courant via `searchRules`. Il est destine aux environnements ou PostgreSQL/pgvector et les chunks de connaissance sont disponibles. Les tests unitaires valident le scoring sans dependre d'un index live.
