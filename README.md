# Knight & Wizard

[![CI](https://github.com/decarvalhoe/knightandwizard/actions/workflows/ci.yml/badge.svg?branch=dev)](https://github.com/decarvalhoe/knightandwizard/actions/workflows/ci.yml)
![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-339933?logo=node.js&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-10.33.2-F69220?logo=pnpm&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%20%2B%20pgvector-4169E1?logo=postgresql&logoColor=white)

**Knight & Wizard** est le socle digital tabletop-first du jeu de rôle K&W : règles canoniques, catalogues structurés, moteur déterministe, devlab local, API backend et première base de connaissance prête pour le futur assistant MJ/Joueur.

Ce dépôt n'est pas le CRPG tactique coop. **K&W-game vit dans un dépôt séparé, avec des décisions produit distinctes.** Ici, le périmètre reste le compagnon de table digital : sessions asynchrones, règles vivantes, workflows multi-arbitres et assistance LLM sans confier les calculs mécaniques au modèle.

## État Actuel

| Domaine | Statut | Ce qui existe aujourd'hui |
|---|---:|---|
| Règles canoniques | Stable | 13 domaines D1 à D13, environ 230 règles et 70 entrées backlog dans `docs/rules` |
| Catalogues | Données stables, schémas à durcir | 13 catalogues YAML/CSV, environ 1100 entrées, 29 assets visuels référencés |
| Carte interactive | Utilisable, en évolution | App Leaflet, pipeline QGIS, validation GeoJSON et build Vite |
| Monorepo | Opérationnel | pnpm workspaces, TypeScript strict, Vitest, gate de validation racine |
| Devlab local | Opérationnel | Docker Compose avec PostgreSQL 16, pgvector et Adminer |
| Backend | Minimal mais réel | Fastify `apps/server`, migrations Drizzle, endpoints `/health` et `/ready` |
| Base de connaissance | Fondation prête | Chunker Markdown/YAML offline, embeddings déterministes de test, recherche pgvector testée |
| CI | Verte | GitHub Actions lance le devlab Docker, les migrations et `pnpm validate` sur `dev` |

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

| Service | URL / Port | Rôle |
|---|---|---|
| PostgreSQL + pgvector | `localhost:55432` | Base applicative, migrations, futurs vecteurs RAG |
| Adminer | `http://localhost:8080` | Inspection légère de la base en développement |
| API backend | `http://localhost:3002` | `pnpm dev:server`, expose `/health` et `/ready` |
| Carte interactive | `http://localhost:5173` | `pnpm dev:map` |

Checks backend :

```bash
curl -sf http://localhost:3002/health
curl -sf http://localhost:3002/ready
```

## Commandes Clés

| Commande | Effet |
|---|---|
| `pnpm validate` | Gate complète : typecheck, tests, validation GeoJSON, build carte, check devlab |
| `pnpm test` | Suites Vitest des packages et du serveur |
| `pnpm typecheck` | TypeScript project references pour packages et serveur |
| `pnpm build:map` | Build production de la carte Leaflet |
| `pnpm validate:geojson` | Vérifie les données de carte contre les YAML canoniques |
| `pnpm devlab:up` | Lance PostgreSQL + pgvector et Adminer |
| `pnpm devlab:test` | Vérifie Docker, PostgreSQL, pgvector et le schéma migré |
| `pnpm devlab:reset` | Destructif : supprime conteneurs et volume PostgreSQL local |
| `pnpm db:migrate` | Applique les migrations DB applicatives |
| `pnpm db:seed` | Injecte des données de développement déterministes |
| `pnpm knowledge:dry-run` | Découpe règles/catalogues offline, sans appel à un provider d'embeddings |

Sortie actuelle de `pnpm knowledge:dry-run` : `1376` chunks, dont `939` chunks de règles et `437` chunks de catalogues.

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
- `audit_events`
- `knowledge_documents`
- `knowledge_chunks` avec embeddings `vector(1536)`

### Base de Connaissance et RAG

La fondation RAG est volontairement offline-first pour l'instant :

- les règles Markdown sont découpées par titres ;
- les catalogues YAML sont découpés de façon déterministe par metadata et entrées ;
- chaque chunk contient source path, source kind, titre, hash stable et texte ;
- les tests utilisent un provider d'embeddings déterministe, pas une API externe ;
- la recherche pgvector est couverte par tests d'intégration.

Le provider d'embeddings réel et l'intégration Mastra relèvent de la Phase 4.

## Roadmap

### Maintenant : terminer le durcissement Phase 3A

- `#31` Ajouter lint/format partagés.
- `#2` Finaliser les décisions d'outillage monorepo, dont l'intérêt de Turborepo maintenant ou plus tard.
- `#5` Ajouter les schémas Zod des catalogues et valider les YAML canoniques.

### Ensuite : démarrer la Phase 3B, moteur de règles

- `#6` Migrer `_DiceManager.php` vers `packages/rules-core/src/dice.ts`.
- `#7` Migrer `FightAssistantMan.php` vers `packages/rules-core/src/combat.ts`.
- `#8` Modéliser les personnages PJ/PNJ.
- `#9` Implémenter progression, XP et apprentissage.

### Plus tard : CMS, app et LLM

- Phase 3C : Payload CMS pour règles vivantes et édition des catalogues.
- Phase 3D : app joueur/MJ, fiche personnage, tracker combat DT, journal de session.
- Phase 4 : orchestration Mastra, RAG avec vrais embeddings, tool calling vers `rules-core`, mémoire persistante du MJ.

Les issues GitHub sont la source opérationnelle pour l'ordre d'exécution : [GitHub Issues](https://github.com/decarvalhoe/knightandwizard/issues).

## Documentation

| Document | Rôle |
|---|---|
| `AGENTS.md` | Règles pour les agents IA travaillant sur ce repo |
| `CONTRIBUTING.md` | Workflow de contribution humain et agentique |
| `docs/HANDOVER.md` | État global du projet et décisions structurantes |
| `docs/plan/ROADMAP.md` | Roadmap d'implémentation Phase 3+ |
| `docs/plan/ADR-001-architecture-cible.md` | Décision d'architecture cible |
| `docs/plan/INFRA-DEVLAB-PLAN.md` | Plan infra/devlab exécuté |
| `docs/rules/*.md` | Règles canoniques par domaine |
| `data/catalogs/README.md` | Inventaire et conventions des catalogues |
| `apps/interactive-map/qgis/README.md` | Workflow QGIS de la carte |

## Pour les Agents

Avant de modifier règles, catalogues, moteur, infra ou documentation :

1. Travailler dans WSL depuis `/home/decarvalhoe/repos/knightandwizard`.
2. Lire `AGENTS.md` et les docs de domaine concernées.
3. Garder les changements ciblés et committables.
4. Écrire ou ajuster les tests avant de modifier une logique déterministe.
5. Exécuter `pnpm validate` avant d'annoncer que le travail est prêt.
6. Ne pas mélanger ce dépôt avec les décisions de `knightandwizard-game`.
7. Ne pas modifier `data/legacy` sauf demande explicite.

## Licence

Voir `LICENSE`.
