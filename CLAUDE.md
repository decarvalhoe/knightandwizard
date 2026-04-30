# Claude Code Instructions - Knight & Wizard

Read `AGENTS.md` first. It is the authoritative repository contract for all AI agents.

This checkout is the WSL source of truth:

```bash
cd /home/decarvalhoe/repos/knightandwizard
```

## Required K&W Skills

Claude Code has the K&W skills installed in `~/.claude/skills`:

- `kw-canonical-compliance`
- `kw-source-registry`
- `kw-canonical-matrix`
- `kw-catalog-contracts`
- `kw-knowledge-base`
- `kw-product-compliance`

Use them whenever work touches K&W rules, catalogs, character creation, magic, combat, sessions, legacy PHP/web/paper sources, Payload CMS, DB read-models, vector/RAG indexing, API, UI, tests, release gates, or canonical compliance.

## Current Product Direction

K&W is canonical-first and tabletop-first. This repository is distinct from `knightandwizard-game`; do not import CRPG/product decisions from that separate project.

Product work must trace:

```text
source -> rule/object -> YAML -> Zod -> DB -> vector store -> rules-core -> API -> UI -> tests
```

## Gates

Before claiming work is complete, run the smallest relevant tests and then, when feasible:

```bash
pnpm validate
```

Canonical artifacts are generated, not hand-edited:

```bash
pnpm canonical:write
pnpm canonical:check
pnpm canonical:check:strict
```

`pnpm canonical:check:strict` is expected to stay red until product `sample.ts` imports are removed. Treat that as the P0 compliance target, not as noise.

## Critical Invariants

- Product UI/API must not depend on invented sample data.
- YAML catalogs are product contracts.
- Ambiguities are explicit data, not hidden code decisions.
- Structured DB/read-models are product truth; vector/RAG is for citation and context.
- The LLM never calculates dice, damage, DT, levels, or effects directly; it calls typed rules-core/API tools.
- All characters conceptually have every skill and specialization at `0`.
- A specialization may exist without the parent skill being purchased.
- Magicians may convert 10 creation skill points into +1 spell point.
- Attribute `0` is forced failure: 0 successes, no critical-failure D100.
- Critical failure display must include D100 severity when generated.
