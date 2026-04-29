# Infra Devlab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the local infrastructure foundation so K&W has a reproducible WSL devlab, a tested database layer, a minimal backend API, and CI gates before starting heavier CMS/LLM work.

**Architecture:** Keep `packages/rules-core` pure and deterministic, keep catalog loading/validation in `packages/catalogs`, and put persistence/API concerns in `apps/server`. Use one PostgreSQL + pgvector dev database for app data and future RAG storage; Payload CMS can later share PostgreSQL while owning its own tables.

**Tech Stack:** pnpm workspaces, TypeScript strict, Vitest, Docker Compose, PostgreSQL 16, pgvector, Drizzle ORM for app-owned migrations, Fastify for `apps/server`, GitHub Actions.

---

## Current State

Implemented on branch `dev`:

- `pnpm` workspace at repository root.
- `packages/rules-core` initialized with strict TypeScript and Vitest.
- `packages/catalogs` initialized with YAML loader tests.
- `docker-compose.yml` starts PostgreSQL 16 + pgvector and Adminer.
- `scripts/check-devlab.sh` validates PostgreSQL readiness and `vector` extension.
- `pnpm validate` runs typecheck, unit tests, GeoJSON validation, map build, and devlab smoke check.

Known gaps:

- No DB migration tool yet.
- No app-owned schema for sessions, audit events, catalog documents, or RAG chunks.
- No `apps/server` backend yet.
- No CI workflow yet.
- No lint/format gate yet.
- `CONTRIBUTING.md` still describes the old npm/manual-test workflow.
- `packages/catalogs` loads YAML but does not yet validate all catalog shapes with Zod.

## Recommended Decisions

1. Use **Drizzle ORM** for `apps/server` migrations and app-owned database tables.
2. Keep Payload CMS for a later phase and do not let it block backend/devlab hardening.
3. Use `POSTGRES_PORT=55432` locally to avoid conflicts with existing PostgreSQL instances on `5432`.
4. Make CI run the same command as local dev: `pnpm validate`.
5. Treat RAG as Phase 4, but create the DB foundations now: `knowledge_documents`, `knowledge_chunks`, and vector indexes.

## GitHub Issue Triage

Existing issues to update before implementation:

| Issue | Action | Reason |
|---|---|---|
| `#2` `[3A-01] Initialisation du monorepo pnpm et Turborepo` | Keep open or retitle to tooling hardening | pnpm/workspaces are done, but Turborepo, ESLint, and Prettier are not implemented. |
| `#3` `[3A-02] Configurer docker-compose.yml...` | Close after adding a completion comment | Docker Compose, pgvector, `.env.example`, README docs, and `pnpm devlab:test` are implemented. Acceptance should mention local port `55432`, not `5432`. |
| `#4` `[3A-03] Initialiser packages/rules-core` | Close after adding a completion comment | The package is initialized, strict TypeScript builds, and Vitest runs. Actual dice/combat migration is already tracked by `#6` and `#7`. |
| `#5` `[3A-04] Initialiser packages/catalogs` | Keep open and narrow scope | Package + loader exist, but Zod schemas for all catalogs are not done. |
| `#19` `[4-02] Configurer le RAG...` | Keep open as Phase 4 epic | It depends on DB schema and server foundations. |
| `#23` `[INFRA-01] Initialiser apps/server` | Split scope | Current issue mixes server init, DB, routes, auth, CORS, and migrations. First pass should be health/readiness + DB connection only. |
| `#24` `[INFRA-02] Configurer le pipeline CI/CD` | Update commands | Use `pnpm validate`; do not require `pnpm lint` until lint tooling exists. |
| `#25` `[INFRA-03] Mettre à jour CONTRIBUTING.md` | Implement soon | Current file still says there are no automated tests and uses npm-era workflow. |

## New Issue List

Create these issues before coding the next infra batch.

### `[INFRA-04] Choisir et installer Drizzle pour les migrations PostgreSQL`

Milestone: `Transversal — Infrastructure & Documentation`

Labels: `enhancement`, `area:infra`, `area:backend`, `phase:transversal`

Acceptance:

- `apps/server` owns a Drizzle config.
- `pnpm db:generate`, `pnpm db:migrate`, and `pnpm db:reset` exist at root.
- Migrations run against the WSL devlab database.
- No migration command drops data unless the script name contains `reset`.

### `[INFRA-05] Créer le schéma DB initial sessions/catalogues/audit/RAG`

Milestone: `Transversal — Infrastructure & Documentation`

Labels: `enhancement`, `area:infra`, `area:backend`, `area:llm`, `phase:transversal`

Acceptance:

- Tables app-owned created by migration:
  - `catalog_documents`
  - `game_sessions`
  - `session_events`
  - `audit_events`
  - `knowledge_documents`
  - `knowledge_chunks`
- `knowledge_chunks.embedding` uses pgvector.
- Basic indexes exist for session lookup, audit chronology, source lookup, and vector search.
- A DB integration test confirms the migration created the expected tables and extension.

### `[INFRA-06] Initialiser apps/server avec health/readiness DB`

Milestone: `Transversal — Infrastructure & Documentation`

Labels: `enhancement`, `area:infra`, `area:backend`, `phase:transversal`

Acceptance:

- `apps/server` starts on `localhost:3002`.
- `GET /health` returns process status without requiring DB.
- `GET /ready` checks PostgreSQL connectivity and returns pgvector availability.
- Vitest integration tests cover `/health` and `/ready`.
- Root script `pnpm dev:server` starts the API.

### `[INFRA-07] Ajouter reset/seed/check au devlab local`

Milestone: `Transversal — Infrastructure & Documentation`

Labels: `enhancement`, `area:infra`, `phase:transversal`

Acceptance:

- `pnpm devlab:reset` recreates local containers and volumes.
- `pnpm db:seed` inserts deterministic development seed data.
- `pnpm devlab:test` validates Docker services, PostgreSQL, pgvector, and migrated schema.
- README documents the destructive nature of reset.

### `[INFRA-08] Mettre en place GitHub Actions avec PostgreSQL + pgvector`

Milestone: `Transversal — Infrastructure & Documentation`

Labels: `enhancement`, `area:infra`, `area:ci`, `phase:transversal`

Acceptance:

- `.github/workflows/ci.yml` runs on PRs and pushes to `dev`.
- CI installs pnpm with the pinned package manager version.
- CI starts PostgreSQL + pgvector.
- CI runs migrations.
- CI runs `pnpm validate`.
- README has a CI badge after the workflow exists.

### `[INFRA-09] Ajouter lint/format partagés`

Milestone: `Transversal — Infrastructure & Documentation`

Labels: `enhancement`, `area:infra`, `area:monorepo`, `phase:transversal`

Acceptance:

- ESLint is configured for TypeScript workspaces.
- Prettier is configured for Markdown, YAML, JSON, and TypeScript.
- Root scripts `pnpm lint`, `pnpm format`, and `pnpm format:check` exist.
- CI includes `pnpm lint` and `pnpm format:check`.

### `[RAG-01] Préparer l'ingestion de la base de connaissance`

Milestone: `Phase 4 — MJ Automatisé LLM`

Labels: `enhancement`, `area:llm`, `area:backend`, `phase:4`

Acceptance:

- A chunker deterministic splits `docs/rules/*.md` and selected `data/catalogs/*`.
- Chunks include source path, source kind, section heading, stable hash, and text.
- A dry-run command prints chunk counts without calling an embedding provider.
- Unit tests cover markdown section chunking and YAML catalog chunking.

### `[RAG-02] Ajouter la recherche sémantique pgvector`

Milestone: `Phase 4 — MJ Automatisé LLM`

Labels: `enhancement`, `area:llm`, `area:backend`, `phase:4`

Acceptance:

- Embedding provider is abstracted behind a TypeScript interface.
- A local deterministic test embedding provider exists for tests.
- Search returns ranked chunks from `knowledge_chunks`.
- Integration test proves that a query can retrieve an inserted rule chunk.

## Execution Order

### Task 1: Issue Hygiene

**Files:**

- Modify GitHub issues only.

- [x] Add completion comments to `#3` and `#4` referencing commit `f931dbe`.
- [x] Close `#3` and `#4`.
- [x] Update `#2` title/body so it only covers remaining tooling: Turborepo decision, ESLint, Prettier.
- [x] Update `#5` title/body so it covers Zod schemas and YAML validation only.
- [x] Update `#23` title/body so it covers backend health/readiness only, or replace its broad checklist with links to `INFRA-04`, `INFRA-05`, and `INFRA-06`.
- [x] Update `#24` to run `pnpm validate` first; add lint/format only after `INFRA-09`.
- [x] Create issues `INFRA-04` through `INFRA-09`, `RAG-01`, and `RAG-02`.

Verification:

```bash
gh issue list --repo decarvalhoe/knightandwizard --state open --limit 50
```

Expected: `#3` and `#4` closed; new infra issues visible and labeled.

### Task 2: DB Migration Foundation

**Files:**

- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Create: `apps/server/package.json`
- Create: `apps/server/drizzle.config.ts`
- Create: `apps/server/src/db/schema.ts`
- Create: `apps/server/src/db/client.ts`
- Create: `apps/server/src/db/migrate.ts`
- Create: `apps/server/src/db/reset.ts`
- Create: `apps/server/src/db/schema.test.ts`

- [x] Write an integration test that connects to `DATABASE_URL`, verifies extension `vector`, and checks for required table names.
- [x] Run the test and verify it fails before migrations exist.
- [x] Install Drizzle dependencies in `apps/server`.
- [x] Add schema definitions for catalog documents, sessions, events, audit events, knowledge documents, and knowledge chunks.
- [x] Add migration scripts and root scripts.
- [x] Run migrations against the WSL devlab.
- [x] Run the integration test and verify it passes.
- [x] Run `pnpm validate`.
- [x] Commit with `feat: add database migration foundation`.

### Task 3: Backend Health and Readiness API

**Files:**

- Modify: `package.json`
- Modify: `apps/server/package.json`
- Create: `apps/server/src/app.ts`
- Create: `apps/server/src/index.ts`
- Create: `apps/server/src/config.ts`
- Create: `apps/server/src/routes/health.ts`
- Create: `apps/server/src/routes/ready.ts`
- Create: `apps/server/src/routes/health.test.ts`

- [ ] Write tests for `GET /health` and `GET /ready`.
- [ ] Run tests and verify they fail before routes exist.
- [ ] Implement Fastify app factory.
- [ ] Implement `/health` without DB dependency.
- [ ] Implement `/ready` with DB connectivity and pgvector check.
- [ ] Add root script `pnpm dev:server`.
- [ ] Run server locally and verify:

```bash
curl -sf http://localhost:3002/health
curl -sf http://localhost:3002/ready
```

- [ ] Run `pnpm validate`.
- [ ] Commit with `feat: add backend health api`.

### Task 4: Devlab Reset and Seed

**Files:**

- Modify: `package.json`
- Modify: `scripts/check-devlab.sh`
- Create: `scripts/devlab-reset.sh`
- Create: `apps/server/src/db/seed.ts`
- Modify: `README.md`

- [ ] Add `devlab:reset` that runs Docker Compose down with volumes and then up.
- [ ] Add `db:seed` with deterministic records for one catalog document and one game session.
- [ ] Extend `devlab:test` to verify migrated tables exist.
- [ ] Document destructive reset behavior in README.
- [ ] Run `pnpm devlab:reset`, `pnpm db:migrate`, `pnpm db:seed`, and `pnpm devlab:test`.
- [ ] Run `pnpm validate`.
- [ ] Commit with `chore: harden local devlab scripts`.

### Task 5: CI Foundation

**Files:**

- Create: `.github/workflows/ci.yml`
- Modify: `README.md`

- [ ] Add GitHub Actions workflow for PRs and pushes to `dev`.
- [ ] Install pnpm using the root `packageManager` value.
- [ ] Start PostgreSQL + pgvector in CI.
- [ ] Run migrations.
- [ ] Run `pnpm validate`.
- [ ] Add README badge after workflow filename is final.
- [ ] Commit with `ci: add validation workflow`.

### Task 6: Contribution Guide Update

**Files:**

- Modify: `CONTRIBUTING.md`

- [ ] Replace npm/manual-test instructions with WSL + pnpm + Docker workflow.
- [ ] Document branch policy: work on `dev`, PR to `main`, no direct push to `main`.
- [ ] Document required local gate: `pnpm validate`.
- [ ] Document package boundaries: `rules-core`, `catalogs`, `apps/server`, `apps/game`, `apps/cms`.
- [ ] Document agent workflow and reference `AGENTS.md`.
- [ ] Run `pnpm validate`.
- [ ] Commit with `docs: update contribution workflow`.

### Task 7: RAG Foundation Preparation

**Files:**

- Create: `apps/server/src/knowledge/chunker.ts`
- Create: `apps/server/src/knowledge/chunker.test.ts`
- Create: `apps/server/src/knowledge/repository.ts`
- Create: `apps/server/src/knowledge/search.test.ts`

- [ ] Implement deterministic chunking for Markdown rules.
- [ ] Implement deterministic chunking for YAML catalogs.
- [ ] Store chunks in `knowledge_documents` and `knowledge_chunks`.
- [ ] Add a deterministic test embedding provider.
- [ ] Test semantic search with inserted fake vectors.
- [ ] Keep real embedding provider integration out of this task.
- [ ] Run `pnpm validate`.
- [ ] Commit with `feat: add knowledge base foundation`.

## Definition of Ready for the Next Product Phase

The project is ready to move beyond infra when all of these are true:

- GitHub issues are aligned with actual scope.
- `pnpm validate` passes locally and in CI.
- A fresh WSL clone can run:

```bash
cp .env.example .env
pnpm install
pnpm devlab:up
pnpm db:migrate
pnpm validate
```

- `apps/server` exposes `/health` and `/ready`.
- Database migrations are versioned and reproducible.
- CONTRIBUTING describes the current workflow accurately.
