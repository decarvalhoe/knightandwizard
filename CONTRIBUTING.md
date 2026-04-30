# Contribuer à Knight and Wizard

Ce dépôt porte le projet **Knight & Wizard** tabletop-first : règles canoniques, catalogues, moteur de règles, API backend, devlab local et futures applications MJ/Joueur. `knightandwizard-game` est un projet séparé avec ses propres décisions.

## Environnement de travail

Le développement courant se fait dans WSL.

Prérequis :

- WSL Ubuntu
- Node.js 20+
- pnpm 10+
- Docker Engine ou Docker Desktop exposé dans WSL

Démarrage local :

```bash
cp .env.example .env
pnpm install
pnpm devlab:up
pnpm db:migrate
pnpm db:seed
pnpm validate
```

Services :

- PostgreSQL + pgvector : `localhost:55432`
- Adminer : `http://localhost:8080`
- API backend : `http://localhost:3002` via `pnpm dev:server`

Commandes utiles :

```bash
pnpm devlab:ps               # État des conteneurs
pnpm devlab:test             # PostgreSQL, pgvector et schéma migré
pnpm devlab:reset            # Destructif : supprime les conteneurs et le volume PostgreSQL local
pnpm db:migrate              # Applique les migrations DB
pnpm db:seed                 # Injecte les seeds de développement déterministes
pnpm lint                    # ESLint sur le code actif
pnpm format:check            # Vérifie le format Prettier
pnpm format                  # Applique Prettier sur les fichiers actifs
pnpm canonical:write         # Régénère les artefacts canoniques (source-manifest, matrix, coverage)
pnpm canonical:check         # Vérifie que les artefacts canoniques sont à jour
pnpm canonical:check:strict  # Gate release : exige zéro import sample.ts produit et zéro unité partial
pnpm validate                # Gate locale complète (inclut canonical:check)
```

## Workflow Git

- Le développement actif se fait sur `dev`.
- Ne jamais pousser directement sur `main`.
- Les fusions vers `main` passent par Pull Request.
- Les commits utilisent Conventional Commits : `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`, `ci:`.
- Avant de pousser, exécuter `pnpm validate`.

## Structure du monorepo

- `packages/rules-core` : moteur de règles pur TypeScript. Aucune dépendance UI, DB, réseau ou LLM.
- `packages/catalogs` : loaders, schémas et types partagés pour les catalogues YAML/CSV.
- `apps/server` : API backend Fastify, migrations Drizzle, agent MJ Mastra, knowledge base RAG.
- `apps/game` : application joueur/MJ Next.js (fiche, wizard de création, combat tracker, session manager).
- `apps/cms` : Payload CMS pour les règles vivantes et l'édition catalogues.
- `apps/interactive-map` : carte Leaflet existante et pipeline QGIS.
- `data/catalogs` : catalogues canoniques importés.
- `docs/rules` : règles canoniques D1 à D13.
- `docs/canonical` : artefacts canoniques générés (`source-manifest.yaml`, `canonical-matrix.yaml`, `coverage-report.md`). **Ne jamais éditer à la main**, toujours régénérer via `pnpm canonical:write`.
- `docs/plan` : ADR, roadmap canonical-first et `ISSUE-LIST.md` (source opérationnelle des tickets).

Turborepo orchestre les tâches workspace (`build`, `typecheck`, `lint`, `test`) quand elles existent dans les packages. pnpm reste le gestionnaire de paquets et l'interface de commande principale.

## Règles de développement

### `packages/rules-core`

- TypeScript strict obligatoire.
- Fonctions déterministes et testables unitairement.
- Aucun accès base de données, HTTP, filesystem applicatif ou UI.
- Le LLM ne calcule jamais les règles : il appellera plus tard des fonctions typées de ce package.

### `packages/catalogs`

- Les fichiers YAML restent dans `data/catalogs`.
- Les loaders et schémas vivent dans `packages/catalogs`.
- Les ambiguïtés détectées sont documentées dans les fichiers `*-ambiguites.md`.

### `apps/server`

- Les migrations DB sont versionnées dans `apps/server/drizzle`.
- Les scripts DB racine passent par `apps/server` : `pnpm db:migrate`, `pnpm db:reset`, `pnpm db:seed`.
- `/health` ne dépend pas de la DB.
- `/ready` vérifie PostgreSQL et pgvector.

### Documentation règles et catalogues

Avant de modifier une règle ou une mécanique, consulter :

- `docs/HANDOVER.md`
- `docs/rules/*.md`
- `data/catalogs/README.md`
- `AGENTS.md`

Les règles canoniques utilisent la notation `R-X.Y`; les questions/backlogs utilisent `Q-X.Y`.

## Workflow agentique

Les agents doivent respecter `AGENTS.md` et travailler avec des changements petits, vérifiés et committables.

Règles pratiques :

- Lire le contexte projet avant d'implémenter.
- Écrire ou ajuster les tests avant de modifier une logique risquée.
- Ne pas mélanger K&W et `K&W-game`.
- Ne pas modifier `data/legacy` sauf demande explicite : ce dossier est une référence source.
- Ne pas committer de secrets, `.env`, tokens ou dumps locaux.
- Mettre à jour les issues GitHub quand le périmètre change.

## Vérification obligatoire

La gate minimale avant push est :

```bash
pnpm validate
```

Elle couvre actuellement :

- vérification des artefacts canoniques (`canonical:check`)
- lint ESLint
- vérification Prettier
- typecheck TypeScript
- tests Vitest
- validation GeoJSON
- build de la carte interactive
- check devlab PostgreSQL + pgvector + schéma migré
- suite E2E Playwright

Si cette commande échoue, la PR ou le push n'est pas prêt.

### Gate release strict

`pnpm canonical:check:strict` est intentionnellement **rouge** tant que les imports `sample.ts` produit n'ont pas été retirés (voir issue P0-12 / #46). Ce n'est pas du bruit : c'est la cible de conformité produit. Cette gate doit passer avant toute promotion `main`.

## Code of conduct

Rester factuel, clair et constructif. Les décisions techniques doivent être documentées quand elles engagent l'architecture du projet.
