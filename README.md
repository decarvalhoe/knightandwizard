# Knight & Wizard

[![CI](https://github.com/decarvalhoe/knightandwizard/actions/workflows/ci.yml/badge.svg?branch=dev)](https://github.com/decarvalhoe/knightandwizard/actions/workflows/ci.yml)
![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-339933?logo=node.js&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-10.33.2-F69220?logo=pnpm&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%20%2B%20pgvector-4169E1?logo=postgresql&logoColor=white)

**Knight & Wizard** est le socle digital tabletop-first du jeu de rôle K&W : règles canoniques, catalogues structurés, moteur déterministe, devlab local, API backend et première base de connaissance prête pour le futur assistant MJ/Joueur.

Ce dépôt n'est pas le CRPG tactique coop. **K&W-game vit dans un dépôt séparé, avec des décisions produit distinctes.** Ici, le périmètre reste le compagnon de table digital : sessions asynchrones, règles vivantes, workflows multi-arbitres et assistance LLM sans confier les calculs mécaniques au modèle.

## Direction Canonical-First

Le projet est désormais **canonical-first** : chaque comportement produit doit tracer jusqu'à une source canonique. La chaîne d'autorité est :

```text
source -> rule/object -> YAML -> Zod -> DB -> vector store -> rules-core -> API -> UI -> tests
```

Garde-fous non négociables :

- aucune surface UI/API ne dépend de données `sample.ts` inventées ;
- les catalogues YAML sont des contrats produit, pas des exemples ;
- les ambiguïtés sont des données explicites, pas des décisions cachées dans le code ;
- les read-models DB sont la vérité produit ; le vecteur/RAG sert à citer et expliquer ;
- le LLM ne calcule jamais dés, dégâts, DT, niveaux ou effets — il appelle des outils typés `rules-core`/API.

Les artefacts canoniques sont **générés, jamais édités à la main** :

```bash
pnpm canonical:write            # régénère docs/canonical/*
pnpm canonical:check            # gate inclus dans pnpm validate
pnpm canonical:check:strict     # gate release, rouge tant que les imports sample.ts produit subsistent
```

Voir `docs/canonical/coverage-report.md` pour la couverture courante et `docs/plan/ISSUE-LIST.md` pour la liste opérationnelle des tickets.

## État Actuel

| Domaine              |                            Statut | Ce qui existe aujourd'hui                                                                                      |
| -------------------- | --------------------------------: | -------------------------------------------------------------------------------------------------------------- |
| Règles canoniques    |                            Stable | 13 domaines D1 à D13, environ 230 règles et 70 entrées backlog dans `docs/rules`                               |
| Catalogues           | Données stables, schémas à durcir | 13 catalogues YAML/CSV, environ 1100 entrées, 29 assets visuels référencés                                     |
| Socle canonique      |        Fondation posée, P0 ouvert | 1467 sources hashées, matrice de 3452 unités atomisées (1006 covered, 1985 partial, 461 not_applicable)        |
| Gate canonique       |        `check` vert, strict rouge | `pnpm canonical:check` inclus dans `validate`, `canonical:check:strict` bloqué par 5 imports sample.ts produit |
| Carte interactive    |          Utilisable, en évolution | App Leaflet, pipeline QGIS, validation GeoJSON et build Vite                                                   |
| Monorepo             |                      Opérationnel | pnpm workspaces, TypeScript strict, Vitest, gate de validation racine                                          |
| Devlab local         |                      Opérationnel | Docker Compose avec PostgreSQL 16, pgvector et Adminer                                                         |
| Backend              |                 Minimal mais réel | Fastify `apps/server`, migrations Drizzle, endpoints `/health` et `/ready`                                     |
| Base de connaissance |     Indexation guidée par sources | Ingestion RAG pilotée par `docs/canonical/source-manifest.yaml`, metadata de traçabilité par chunk             |
| CI                   |                             Verte | GitHub Actions lance le devlab Docker, les migrations et `pnpm validate` sur `dev`                             |

Branche active : `dev`.
Workspace local de référence : `/home/decarvalhoe/repos/knightandwizard` dans WSL.

## Démarrage Rapide

Prérequis :

- WSL Ubuntu
- Node.js 20+
- pnpm 10+
- Docker Engine ou Docker Desktop exposé dans WSL

```bash
cp .env.example .env
pnpm install
pnpm devlab:up
pnpm db:migrate
pnpm db:seed
pnpm validate
```

Services locaux :

| Service               | URL / Port              | Rôle                                              |
| --------------------- | ----------------------- | ------------------------------------------------- |
| PostgreSQL + pgvector | `localhost:55432`       | Base applicative, migrations, futurs vecteurs RAG |
| Adminer               | `http://localhost:8080` | Inspection légère de la base en développement     |
| API backend           | `http://localhost:3002` | `pnpm dev:server`, expose `/health` et `/ready`   |
| Carte interactive     | `http://localhost:5173` | `pnpm dev:map`                                    |

Checks backend :

```bash
curl -sf http://localhost:3002/health
curl -sf http://localhost:3002/ready
```

## Commandes Clés

| Commande                      | Effet                                                                                              |
| ----------------------------- | -------------------------------------------------------------------------------------------------- |
| `pnpm validate`               | Gate complète : canonical check, lint, format, typecheck, tests, GeoJSON, build carte, devlab, e2e |
| `pnpm canonical:write`        | Régénère `docs/canonical/source-manifest.yaml`, `canonical-matrix.yaml` et `coverage-report.md`    |
| `pnpm canonical:check`        | Vérifie que les artefacts canoniques sont à jour ; inclus dans `validate`                          |
| `pnpm canonical:check:strict` | Gate release : échoue tant que les imports `sample.ts` produit ou des unités partial subsistent    |
| `pnpm lint`                   | ESLint sur les apps/packages actifs                                                                |
| `pnpm format:check`           | Vérifie le format Prettier                                                                         |
| `pnpm format`                 | Applique Prettier sur les fichiers actifs                                                          |
| `pnpm test`                   | Suites Vitest des packages et du serveur                                                           |
| `pnpm typecheck`              | TypeScript project references orchestrées par Turborepo                                            |
| `pnpm build`                  | Builds workspace orchestrés par Turborepo                                                          |
| `pnpm build:map`              | Build production direct de la carte Leaflet                                                        |
| `pnpm validate:geojson`       | Vérifie les données de carte contre les YAML canoniques                                            |
| `pnpm devlab:up`              | Lance PostgreSQL + pgvector et Adminer                                                             |
| `pnpm devlab:test`            | Vérifie Docker, PostgreSQL, pgvector et le schéma migré                                            |
| `pnpm devlab:reset`           | Destructif : supprime conteneurs et volume PostgreSQL local                                        |
| `pnpm db:migrate`             | Applique les migrations DB applicatives                                                            |
| `pnpm db:seed`                | Injecte des données de développement déterministes                                                 |
| `pnpm knowledge:dry-run`      | Découpe les sources offline depuis le source-manifest, sans appel à un provider d'embeddings       |
| `pnpm knowledge:index`        | Indexe règles, lore et catalogues dans PostgreSQL/pgvector avec metadata de traçabilité            |

L'indexation RAG lit désormais sa liste de sources depuis `docs/canonical/source-manifest.yaml` (statut `active` ou `raw_reference_only`), pas depuis une liste codée en dur.

## Architecture

```text
knightandwizard/
├── apps/
│   ├── server/             # API Fastify, migrations Drizzle, fondations DB/RAG
│   ├── interactive-map/    # Carte Leaflet et pipeline QGIS
│   └── legacy-php-site/    # Source PHP de référence, pas une cible de refactor direct
├── packages/
│   ├── rules-core/         # Moteur de règles TypeScript pur et déterministe
│   └── catalogs/           # Loaders YAML et futurs schémas/types Zod
├── data/
│   ├── catalogs/           # Catalogues YAML/CSV canoniques
│   └── legacy/             # Sources brutes, référence uniquement
├── docs/
│   ├── rules/              # Règles canoniques D1 à D13
│   ├── plan/               # ADR, roadmap, plan infra/devlab
│   └── product/            # Direction produit active K&W tabletop-first
├── infra/postgres/init/    # Scripts init PostgreSQL, dont pgvector
└── scripts/                # Checks et reset du devlab
```

### Frontière du Moteur de Règles

`packages/rules-core` doit rester pur :

- aucune dépendance UI ;
- aucune dépendance base de données ;
- aucune dépendance HTTP ;
- aucune dépendance LLM.

Le futur MJ LLM pourra narrer, proposer et demander des appels d'outils, mais il ne doit pas calculer lui-même les dés, dégâts, DT, XP ou effets mécaniques. La résolution mécanique appartient aux fonctions déterministes typées.

### Backend et Persistence

`apps/server` porte la couche serveur et les données applicatives :

- config Drizzle : `apps/server/drizzle.config.ts` ;
- migrations : `apps/server/drizzle/*.sql` ;
- client DB et runner de migrations : `apps/server/src/db` ;
- routes serveur : `apps/server/src/routes` ;
- fondation base de connaissance : `apps/server/src/knowledge`.

Tables applicatives initiales :

- `catalog_documents`
- `game_sessions`
- `session_events`
- `session_decisions`
- `gm_memories`
- `audit_events`
- `knowledge_documents`
- `knowledge_chunks` avec embeddings `vector(1536)`

### Base de Connaissance et RAG

La fondation RAG est volontairement offline-first pour l'instant :

- les règles Markdown sont découpées par titres ;
- les catalogues YAML sont découpés de façon déterministe par metadata et entrées ;
- chaque chunk contient source path, source kind, titre, hash stable et texte ;
- les tests utilisent un provider d'embeddings déterministe, pas une API externe ;
- `tools/index-knowledge-base.ts` indexe la base dans PostgreSQL/pgvector ;
- `searchRules(query)` combine recherche vectorielle et reranking lexical léger ;
- l'agent MJ Mastra injecte automatiquement le contexte retrouvé et cite les sources dans sa réponse déterministe de dev.

Le provider par défaut reste déterministe pour le devlab et la CI. `KNOWLEDGE_EMBEDDING_PROVIDER=ollama` active le provider Ollama local, à condition d'utiliser un modèle compatible `vector(1536)`.

## Roadmap

La roadmap actuelle est canonical-first. Les phases techniques 3A→3D et 4 sont closes (commits historiques, issues #1–#34) ; les jalons suivants sont pilotés par la conformité canonique.

### v0.3.1 — Canonical Product Truth (en cours)

Verrouiller la conformité canonique de bout en bout : enrichir l'atomisation, construire les catalogues canoniques (races, orientations/classes, compétences, atouts, magie, lore), formaliser Zod et read-models DB/API, supprimer les imports `sample.ts` produit, durcir résolution des dés et création de personnage, ajouter le gate strict en CI.

### v0.4.0 — Assistant Joueur/MJ Canonique

Wizard de création complet, fiche personnage, progression, inventaire, magie, combat DT et journal de session uniquement sur données canoniques.

### v0.5.0 — CMS Règles Vivantes

Brancher Payload CMS sur les catalogues canoniques, workflow d'édition import/export YAML round-trip et résolution des ambiguïtés.

### v0.6.0 — MJ LLM & Automation

Contrat tool calling MJ automatisé, citations et évaluations RAG canoniques, mémoire épisodique avec provenance distincte canon/session/hypothèse.

### v1.0.0 — Release Jouable

Release reproductible : checklist, changelog, promotion `main` par PR verte, docs utilisateur/contributeur, backup et rollback.

La liste opérationnelle des tickets vit dans [`docs/plan/ISSUE-LIST.md`](docs/plan/ISSUE-LIST.md) et est miroitée sur [GitHub Issues](https://github.com/decarvalhoe/knightandwizard/issues).

## Documentation

| Document                                  | Rôle                                                                                       |
| ----------------------------------------- | ------------------------------------------------------------------------------------------ |
| `AGENTS.md`                               | Règles pour les agents IA travaillant sur ce repo                                          |
| `CLAUDE.md`                               | Instructions Claude Code, skills K&W requis, invariants critiques                          |
| `CONTRIBUTING.md`                         | Workflow de contribution humain et agentique                                               |
| `CHANGELOG.md`                            | Historique versionné des releases                                                          |
| `docs/HANDOVER.md`                        | État global du projet et décisions structurantes                                           |
| `docs/plan/ROADMAP.md`                    | Roadmap canonical-first (v0.3.1 → v1.0.0)                                                  |
| `docs/plan/ISSUE-LIST.md`                 | Registre opérationnel des tickets P0→P4 avec dépendances et critères d'accept              |
| `docs/plan/ADR-001-architecture-cible.md` | Décision d'architecture cible                                                              |
| `docs/plan/INFRA-DEVLAB-PLAN.md`          | Plan infra/devlab exécuté                                                                  |
| `docs/canonical/source-manifest.yaml`     | Registre exhaustif des sources canoniques scannées, hashées, statutées                     |
| `docs/canonical/canonical-matrix.yaml`    | Matrice atomisée source → règle/objet → YAML → Zod → DB → vector → core → API → UI → tests |
| `docs/canonical/coverage-report.md`       | Synthèse de couverture, gaps et imports `sample.ts` encore bloquants                       |
| `docs/rules/*.md`                         | Règles canoniques par domaine                                                              |
| `data/catalogs/README.md`                 | Inventaire et conventions des catalogues                                                   |
| `apps/interactive-map/qgis/README.md`     | Workflow QGIS de la carte                                                                  |

## Pour les Agents

Avant de modifier règles, catalogues, moteur, infra ou documentation :

1. Travailler dans WSL depuis `/home/decarvalhoe/repos/knightandwizard`.
2. Lire `AGENTS.md` et `CLAUDE.md`, puis les docs de domaine concernées.
3. Tracer le changement source → YAML → Zod → DB → vector → rules-core → API → UI → tests.
4. Garder les changements ciblés et committables.
5. Écrire ou ajuster les tests avant de modifier une logique déterministe.
6. Régénérer les artefacts canoniques avec `pnpm canonical:write` quand les sources/catalogues bougent ; ne jamais éditer `docs/canonical/*` à la main.
7. Exécuter `pnpm validate` avant d'annoncer que le travail est prêt.
8. Ne pas mélanger ce dépôt avec les décisions de `knightandwizard-game`.
9. Ne pas modifier `data/legacy` sauf demande explicite.
10. Ne jamais réintroduire un import `sample.ts` dans une surface produit ; les samples restants doivent disparaître via #46 (P0-12).

## Licence

Voir `LICENSE`.
