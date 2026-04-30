# Roadmap Knight & Wizard

This roadmap supersedes the older phase-only roadmap. The project is now canonical-first: K&W is treated as a formal rule and content system where every product behavior must trace back to source evidence.

## Current Baseline

- Branch: `dev`.
- Local target: WSL checkout `/home/decarvalhoe/repos/knightandwizard`.
- Canonical foundation exists: `docs/canonical/source-manifest.yaml`, `docs/canonical/canonical-matrix.yaml`, `docs/canonical/coverage-report.md`.
- `pnpm validate` is the baseline dev gate.
- `pnpm canonical:check:strict` is intentionally red until product `sample.ts` imports are removed.
- The knowledge base indexes active and raw-reference sources from the manifest, not a hardcoded source list.

## Non-Negotiable Gates

1. No product route or UI feature may depend on invented sample data.
2. YAML catalogs are product contracts, not examples.
3. Every rule/object/game unit must have a source-to-implementation matrix row or a documented blocked/not-applicable reason.
4. Structured DB/read-models are the product source; vector search is for citation, explanation and context.
5. Ambiguities are explicit data, not hidden implementation decisions.
6. Release promotion requires `pnpm validate` and the strict canonical gate.

## v0.3.1 - Canonical Product Truth

Build missing character/magic catalogs with source metadata, enrich atomization, extend schemas/read-models/API, remove product samples, and correct dice/creation compliance gaps. Exit when `pnpm canonical:check:strict` passes.

## v0.4.0 - Assistant Joueur/MJ Canonique

Complete creation, sheet, progression, inventory, magic, combat DT and session event log with canonical data only.

## v0.5.0 - CMS Regles Vivantes

Add Payload catalog editing, import/export, source metadata preservation and ambiguity decision workflow.

## v0.6.0 - MJ LLM & Automation

Add tool-calling GM, cited RAG, evaluations and provenance-aware episodic memory. The LLM never computes rules directly.

## v1.0.0 - Release Jouable

Harden release, docs, CI/CD, backups, rollback and PR-only promotion to `main`.

## Issue Register

The tracked issue list is maintained in `docs/plan/ISSUE-LIST.md` and mirrored to GitHub issues.
